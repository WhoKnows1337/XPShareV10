-- =====================================================
-- ADMIN PANEL DATABASE SCHEMA
-- Complete implementation of ADMIN-PANEL-SPEC.md
-- =====================================================

-- =====================================================
-- 1. QUESTION CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create index for active categories ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_question_categories_active_sort
  ON question_categories(is_active, sort_order);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_question_categories_slug
  ON question_categories(slug);

-- =====================================================
-- 2. DYNAMIC QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dynamic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES question_categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('chips', 'chips-multi', 'text', 'boolean', 'slider', 'date', 'time')),
  options jsonb DEFAULT '[]'::jsonb,
  priority int NOT NULL,
  is_optional boolean DEFAULT true,
  help_text text,
  placeholder text,
  conditional_logic jsonb DEFAULT '{}'::jsonb,
  follow_up_question jsonb,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(category_id, priority)
);

-- Create index for category lookups with active questions
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_category_active
  ON dynamic_questions(category_id, is_active, priority);

-- Create index for question type filtering
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_type
  ON dynamic_questions(question_type);

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_tags
  ON dynamic_questions USING GIN(tags);

-- =====================================================
-- 3. QUESTION CHANGE HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS question_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('category', 'question')),
  entity_id uuid NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  change_type text NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'reordered', 'activated', 'deactivated')),
  old_value jsonb,
  new_value jsonb,
  description text
);

-- Create index for entity lookups
CREATE INDEX IF NOT EXISTS idx_question_change_history_entity
  ON question_change_history(entity_type, entity_id, changed_at DESC);

-- Create index for changed_by lookups
CREATE INDEX IF NOT EXISTS idx_question_change_history_user
  ON question_change_history(changed_by, changed_at DESC);

-- =====================================================
-- 4. QUESTION TEMPLATES TABLE (Reusable Question Sets)
-- =====================================================
CREATE TABLE IF NOT EXISTS question_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  questions jsonb NOT NULL,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for template lookups
CREATE INDEX IF NOT EXISTS idx_question_templates_category
  ON question_templates(category_id, is_public);

-- Create GIN index for tags
CREATE INDEX IF NOT EXISTS idx_question_templates_tags
  ON question_templates USING GIN(tags);

-- =====================================================
-- 5. ADMIN ROLES TABLE (Super-Admin, Content-Manager, Analyst)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'analyst')),
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for user role lookups
CREATE INDEX IF NOT EXISTS idx_admin_roles_user
  ON admin_roles(user_id);

-- =====================================================
-- 6. QUESTION ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS question_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES dynamic_questions(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views_count int DEFAULT 0,
  responses_count int DEFAULT 0,
  completion_rate decimal(5,2),
  avg_response_length int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(question_id, date)
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_question_analytics_question_date
  ON question_analytics(question_id, date DESC);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for question_categories
DROP TRIGGER IF EXISTS update_question_categories_updated_at ON question_categories;
CREATE TRIGGER update_question_categories_updated_at
  BEFORE UPDATE ON question_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for dynamic_questions
DROP TRIGGER IF EXISTS update_dynamic_questions_updated_at ON dynamic_questions;
CREATE TRIGGER update_dynamic_questions_updated_at
  BEFORE UPDATE ON dynamic_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for question_templates
DROP TRIGGER IF EXISTS update_question_templates_updated_at ON question_templates;
CREATE TRIGGER update_question_templates_updated_at
  BEFORE UPDATE ON question_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admin_roles
DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. CHANGE HISTORY TRIGGERS
-- =====================================================

-- Function to log category changes
CREATE OR REPLACE FUNCTION log_category_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, new_value, description)
    VALUES ('category', NEW.id, NEW.created_by, 'created', to_jsonb(NEW), 'Category created');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, new_value, description)
    VALUES ('category', NEW.id, NEW.updated_by, 'updated', to_jsonb(OLD), to_jsonb(NEW), 'Category updated');
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, description)
    VALUES ('category', OLD.id, NULL, 'deleted', to_jsonb(OLD), 'Category deleted');
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log question changes
CREATE OR REPLACE FUNCTION log_question_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, new_value, description)
    VALUES ('question', NEW.id, NEW.created_by, 'created', to_jsonb(NEW), 'Question created');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Check if it's a reorder operation (priority changed)
    IF (OLD.priority != NEW.priority) THEN
      INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, new_value, description)
      VALUES ('question', NEW.id, NEW.updated_by, 'reordered', to_jsonb(OLD), to_jsonb(NEW), 'Question reordered');
    -- Check if it's an activation/deactivation
    ELSIF (OLD.is_active != NEW.is_active) THEN
      INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, new_value, description)
      VALUES ('question', NEW.id, NEW.updated_by,
        CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END,
        to_jsonb(OLD), to_jsonb(NEW),
        CASE WHEN NEW.is_active THEN 'Question activated' ELSE 'Question deactivated' END);
    -- Otherwise it's a regular update
    ELSE
      INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, new_value, description)
      VALUES ('question', NEW.id, NEW.updated_by, 'updated', to_jsonb(OLD), to_jsonb(NEW), 'Question updated');
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO question_change_history (entity_type, entity_id, changed_by, change_type, old_value, description)
    VALUES ('question', OLD.id, NULL, 'deleted', to_jsonb(OLD), 'Question deleted');
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for category changes
DROP TRIGGER IF EXISTS log_category_changes ON question_categories;
CREATE TRIGGER log_category_changes
  AFTER INSERT OR UPDATE OR DELETE ON question_categories
  FOR EACH ROW
  EXECUTE FUNCTION log_category_change();

-- Trigger for question changes
DROP TRIGGER IF EXISTS log_question_changes ON dynamic_questions;
CREATE TRIGGER log_question_changes
  AFTER INSERT OR UPDATE OR DELETE ON dynamic_questions
  FOR EACH ROW
  EXECUTE FUNCTION log_question_change();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active categories
CREATE POLICY "Anyone can read active categories"
  ON question_categories FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do anything with categories
CREATE POLICY "Admins can manage categories"
  ON question_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Anyone can read active questions
CREATE POLICY "Anyone can read active questions"
  ON dynamic_questions FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage questions
CREATE POLICY "Admins can manage questions"
  ON dynamic_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can view change history
CREATE POLICY "Admins can view change history"
  ON question_change_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can view all templates, users can view public templates
CREATE POLICY "View templates policy"
  ON question_templates FOR SELECT
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON question_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only super admins can manage roles
CREATE POLICY "Super admins can manage roles"
  ON admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can view analytics
CREATE POLICY "Admins can view analytics"
  ON question_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to get next priority for a category
CREATE OR REPLACE FUNCTION get_next_question_priority(p_category_id uuid)
RETURNS int AS $$
DECLARE
  next_priority int;
BEGIN
  SELECT COALESCE(MAX(priority), 0) + 1
  INTO next_priority
  FROM dynamic_questions
  WHERE category_id = p_category_id;

  RETURN next_priority;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder questions after deletion
CREATE OR REPLACE FUNCTION reorder_questions_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dynamic_questions
  SET priority = priority - 1
  WHERE category_id = OLD.category_id
  AND priority > OLD.priority;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reorder questions after deletion
DROP TRIGGER IF EXISTS reorder_after_delete ON dynamic_questions;
CREATE TRIGGER reorder_after_delete
  AFTER DELETE ON dynamic_questions
  FOR EACH ROW
  EXECUTE FUNCTION reorder_questions_after_delete();

-- =====================================================
-- SCHEMA CREATED SUCCESSFULLY
-- =====================================================
