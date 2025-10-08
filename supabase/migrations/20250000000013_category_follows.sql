-- Category Follows Table
-- Allows users to follow categories and receive notifications

CREATE TABLE IF NOT EXISTS category_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  notify_new_experiences boolean DEFAULT true,
  notify_trending boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, category_slug)
);

-- Indexes
CREATE INDEX idx_category_follows_user ON category_follows(user_id);
CREATE INDEX idx_category_follows_category ON category_follows(category_slug);

-- RLS Policies
ALTER TABLE category_follows ENABLE ROW LEVEL SECURITY;

-- Users can view their own follows
CREATE POLICY "Users can view own category follows"
  ON category_follows
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own follows
CREATE POLICY "Users can create category follows"
  ON category_follows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete own category follows"
  ON category_follows
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to check if user follows a category
CREATE OR REPLACE FUNCTION is_following_category(
  p_user_id uuid,
  p_category_slug text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM category_follows
    WHERE user_id = p_user_id
      AND category_slug = p_category_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get followed categories for a user
CREATE OR REPLACE FUNCTION get_followed_categories(p_user_id uuid)
RETURNS TABLE (
  category_slug text,
  notify_new_experiences boolean,
  notify_trending boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cf.category_slug,
    cf.notify_new_experiences,
    cf.notify_trending,
    cf.created_at
  FROM category_follows cf
  WHERE cf.user_id = p_user_id
  ORDER BY cf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
