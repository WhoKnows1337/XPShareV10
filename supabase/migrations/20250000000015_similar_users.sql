-- Find Similar Users based on shared categories and patterns
CREATE OR REPLACE FUNCTION find_similar_users(
  current_user_id uuid,
  limit_count int DEFAULT 3
)
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  similarity_score float,
  common_categories text[],
  common_location text,
  experience_count int
) AS $$
BEGIN
  RETURN QUERY
  WITH current_user_data AS (
    -- Get current user's categories and location
    SELECT
      array_agg(DISTINCT e.category) as categories,
      up.location
    FROM experiences e
    JOIN user_profiles up ON up.id = current_user_id
    WHERE e.user_id = current_user_id
    GROUP BY up.location
  ),
  other_users AS (
    -- Get other users with similar categories
    SELECT
      e.user_id,
      array_agg(DISTINCT e.category) as categories,
      COUNT(DISTINCT e.id) as exp_count
    FROM experiences e
    WHERE e.user_id != current_user_id
      AND e.visibility = 'public'
    GROUP BY e.user_id
    HAVING COUNT(DISTINCT e.id) >= 2 -- Min 2 experiences
  ),
  similarity_calc AS (
    SELECT
      ou.user_id,
      up.username,
      up.display_name,
      up.avatar_url,
      ou.exp_count,
      up.location,
      -- Calculate Jaccard similarity for categories
      (
        SELECT COUNT(*)::float
        FROM unnest(ou.categories) cat
        WHERE cat = ANY((SELECT categories FROM current_user_data))
      ) / NULLIF(
        (
          SELECT COUNT(DISTINCT cat)
          FROM (
            SELECT unnest(ou.categories) as cat
            UNION
            SELECT unnest(categories) FROM current_user_data
          ) all_cats
        ),
        0
      ) * 100 as similarity,
      -- Find common categories
      ARRAY(
        SELECT DISTINCT cat
        FROM unnest(ou.categories) cat
        WHERE cat = ANY((SELECT categories FROM current_user_data))
      ) as common_cats,
      -- Check if same location (simplified)
      CASE
        WHEN up.location IS NOT NULL
          AND up.location = (SELECT location FROM current_user_data)
        THEN up.location
        ELSE NULL
      END as common_loc
    FROM other_users ou
    JOIN user_profiles up ON up.id = ou.user_id
  )
  SELECT
    sc.user_id,
    sc.username,
    sc.display_name,
    sc.avatar_url,
    COALESCE(sc.similarity, 0) as similarity_score,
    sc.common_cats as common_categories,
    sc.common_loc as common_location,
    sc.exp_count as experience_count
  FROM similarity_calc sc
  WHERE COALESCE(sc.similarity, 0) >= 30 -- Min 30% similarity
  ORDER BY sc.similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_experiences_category_user ON experiences(category, user_id) WHERE visibility = 'public';
