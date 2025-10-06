-- =====================================================
-- AI-ADAPTIVE QUESTIONS SUPPORT
-- Adds AI-powered dynamic follow-up question generation
-- =====================================================

-- 1. Add AI-adaptive fields to dynamic_questions table
ALTER TABLE dynamic_questions
ADD COLUMN IF NOT EXISTS ai_adaptive boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS adaptive_conditions jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN dynamic_questions.ai_adaptive IS 'Whether this question uses AI to generate dynamic follow-ups';
COMMENT ON COLUMN dynamic_questions.adaptive_conditions IS 'Conditions that trigger AI follow-up generation (e.g., {"trigger_on": ["specific_answer"], "context_fields": ["category", "previous_answers"]})';

-- 2. Create AI-generated questions table
CREATE TABLE IF NOT EXISTS ai_generated_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_question_id uuid REFERENCES dynamic_questions(id) ON DELETE CASCADE,
  experience_id uuid REFERENCES experiences(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  generated_question_text text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  context_used jsonb,
  answer_text text,
  answered_at timestamptz,
  quality_rating int CHECK (quality_rating BETWEEN 1 AND 5),
  admin_reviewed boolean DEFAULT false,
  promoted_to_template boolean DEFAULT false,
  CONSTRAINT ai_generated_questions_unique UNIQUE(parent_question_id, experience_id)
);

COMMENT ON TABLE ai_generated_questions IS 'AI-generated follow-up questions during experience submission';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_parent
  ON ai_generated_questions(parent_question_id);

CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_experience
  ON ai_generated_questions(experience_id);

CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_user
  ON ai_generated_questions(user_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_quality
  ON ai_generated_questions(quality_rating, promoted_to_template);

-- 3. Create function to promote AI question to template
CREATE OR REPLACE FUNCTION promote_ai_question_to_template(
  ai_question_id uuid,
  template_question_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ai_question ai_generated_questions%ROWTYPE;
  v_parent_question dynamic_questions%ROWTYPE;
  v_new_question_id uuid;
BEGIN
  -- Get AI question
  SELECT * INTO v_ai_question FROM ai_generated_questions WHERE id = ai_question_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'AI question not found';
  END IF;

  -- Get parent question for context
  SELECT * INTO v_parent_question FROM dynamic_questions WHERE id = v_ai_question.parent_question_id;

  -- Create new dynamic question
  INSERT INTO dynamic_questions (
    category_id,
    question_text,
    question_type,
    priority,
    is_optional,
    help_text,
    tags,
    is_active,
    created_by
  ) VALUES (
    v_parent_question.category_id,
    COALESCE(template_question_text, v_ai_question.generated_question_text),
    'text', -- Default type for AI questions
    (SELECT COALESCE(MAX(priority), 0) + 1 FROM dynamic_questions WHERE category_id = v_parent_question.category_id),
    true,
    'AI-generated and promoted from user submission',
    array_append(v_parent_question.tags, 'ai-promoted'),
    false -- Initially inactive for admin review
  ) RETURNING id INTO v_new_question_id;

  -- Mark as promoted
  UPDATE ai_generated_questions
  SET promoted_to_template = true, admin_reviewed = true
  WHERE id = ai_question_id;

  RETURN v_new_question_id;
END;
$$;

-- 4. Create function to get AI generation stats
CREATE OR REPLACE FUNCTION get_ai_question_stats()
RETURNS TABLE (
  total_generated bigint,
  total_answered bigint,
  avg_quality numeric,
  promoted_count bigint,
  needs_review bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::bigint as total_generated,
    COUNT(answered_at)::bigint as total_answered,
    ROUND(AVG(quality_rating), 2) as avg_quality,
    COUNT(*) FILTER (WHERE promoted_to_template = true)::bigint as promoted_count,
    COUNT(*) FILTER (WHERE admin_reviewed = false AND quality_rating >= 4)::bigint as needs_review
  FROM ai_generated_questions;
$$;

-- 5. Add RLS policies
ALTER TABLE ai_generated_questions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own AI questions
CREATE POLICY "Users can view own AI questions"
  ON ai_generated_questions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert AI questions for their experiences
CREATE POLICY "Users can insert AI questions"
  ON ai_generated_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI questions (answers)
CREATE POLICY "Users can update own AI questions"
  ON ai_generated_questions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all AI questions"
  ON ai_generated_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'content_manager')
    )
  );

-- Admins can update all (for review/promotion)
CREATE POLICY "Admins can update all AI questions"
  ON ai_generated_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'content_manager')
    )
  );
