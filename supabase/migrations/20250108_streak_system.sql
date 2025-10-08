-- Streak System Migration
-- Tracks daily activity streaks for gamification

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Activity types that count for streaks
  total_experiences INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one streak record per user
  UNIQUE(user_id)
);

-- Create streak_activity_log table
CREATE TABLE IF NOT EXISTS public.streak_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'experience', 'comment', 'reaction'
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_activity_log_user_date ON public.streak_activity_log(user_id, activity_date);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streak"
  ON public.user_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
  ON public.user_streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
  ON public.user_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streak_activity_log
CREATE POLICY "Users can view their own activity log"
  ON public.streak_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.streak_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(
  p_user_id UUID,
  p_activity_type TEXT DEFAULT 'experience'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak_record RECORD;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_new_streak INTEGER;
  v_streak_continued BOOLEAN := FALSE;
  v_streak_broken BOOLEAN := FALSE;
BEGIN
  -- Get or create streak record
  SELECT * INTO v_streak_record
  FROM public.user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, v_today)
    RETURNING * INTO v_streak_record;

    v_new_streak := 1;
  ELSE
    -- Check if activity already logged today
    IF EXISTS (
      SELECT 1 FROM public.streak_activity_log
      WHERE user_id = p_user_id AND activity_date = v_today
    ) THEN
      -- Already active today, no streak change
      v_new_streak := v_streak_record.current_streak;
    ELSIF v_streak_record.last_activity_date = v_yesterday THEN
      -- Streak continues
      v_new_streak := v_streak_record.current_streak + 1;
      v_streak_continued := TRUE;

      UPDATE public.user_streaks
      SET
        current_streak = v_new_streak,
        longest_streak = GREATEST(longest_streak, v_new_streak),
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF v_streak_record.last_activity_date < v_yesterday THEN
      -- Streak broken, reset to 1
      v_new_streak := 1;
      v_streak_broken := TRUE;

      UPDATE public.user_streaks
      SET
        current_streak = 1,
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      -- Same day or future date (shouldn't happen)
      v_new_streak := v_streak_record.current_streak;
    END IF;
  END IF;

  -- Log the activity
  INSERT INTO public.streak_activity_log (user_id, activity_type, activity_date)
  VALUES (p_user_id, p_activity_type, v_today)
  ON CONFLICT DO NOTHING;

  -- Update activity counters
  UPDATE public.user_streaks
  SET
    total_experiences = total_experiences + CASE WHEN p_activity_type = 'experience' THEN 1 ELSE 0 END,
    total_comments = total_comments + CASE WHEN p_activity_type = 'comment' THEN 1 ELSE 0 END,
    total_reactions = total_reactions + CASE WHEN p_activity_type = 'reaction' THEN 1 ELSE 0 END
  WHERE user_id = p_user_id;

  -- Return streak info
  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(v_streak_record.longest_streak, v_new_streak),
    'streak_continued', v_streak_continued,
    'streak_broken', v_streak_broken
  );
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
