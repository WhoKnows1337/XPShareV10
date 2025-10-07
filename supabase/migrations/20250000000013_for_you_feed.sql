-- For You Feed Algorithm
-- Personalized feed based on user interests, trending, location, and temporal relevance

CREATE OR REPLACE FUNCTION get_for_you_feed(
  p_user_id UUID,
  p_liked_categories TEXT[],
  p_user_location TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  story_text TEXT,
  category TEXT,
  tags TEXT[],
  location_text TEXT,
  date_occurred TEXT,
  time_of_day TEXT,
  view_count INT,
  upvote_count INT,
  comment_count INT,
  created_at TIMESTAMPTZ,
  user_profiles JSONB,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_engagement AS (
    -- Calculate engagement score for trending factor
    SELECT
      e.id,
      (
        (COUNT(DISTINCT u.id) * 2) +
        (COUNT(DISTINCT c.id) * 3) +
        (e.view_count * 0.1)
      ) / GREATEST(EXTRACT(EPOCH FROM (now() - e.created_at)) / 3600, 1) as engagement_score
    FROM experiences e
    LEFT JOIN upvotes u ON e.id = u.experience_id
    LEFT JOIN comments c ON e.id = c.experience_id
    WHERE e.created_at > now() - interval '7 days'
    GROUP BY e.id
  ),
  user_similarity AS (
    -- Find experiences liked by similar users
    SELECT DISTINCT e.id
    FROM experiences e
    JOIN upvotes u1 ON e.id = u1.experience_id
    WHERE u1.user_id IN (
      SELECT DISTINCT u2.user_id
      FROM upvotes u2
      JOIN upvotes u3 ON u2.experience_id = u3.experience_id
      WHERE u3.user_id = p_user_id
        AND u2.user_id != p_user_id
    )
    AND e.user_id != p_user_id
  ),
  scored_experiences AS (
    SELECT
      e.*,
      up.username,
      up.display_name,
      up.avatar_url,
      (
        -- Factor 1: User interests (30%)
        CASE
          WHEN e.category = ANY(p_liked_categories) THEN 30
          ELSE 0
        END +

        -- Factor 2: Similar to liked (25%)
        CASE
          WHEN e.id IN (SELECT id FROM user_similarity) THEN 25
          ELSE 0
        END +

        -- Factor 3: Trending (20%)
        COALESCE((
          SELECT LEAST(engagement_score * 2, 20)
          FROM user_engagement ue
          WHERE ue.id = e.id
        ), 0) +

        -- Factor 4: Location proximity (15%)
        CASE
          WHEN p_user_location IS NOT NULL AND e.location_text IS NOT NULL AND
               (e.location_text ILIKE '%' || p_user_location || '%' OR
                p_user_location ILIKE '%' || e.location_text || '%')
          THEN 15
          ELSE 0
        END +

        -- Factor 5: Temporal relevance (10%)
        CASE
          WHEN e.created_at > now() - interval '24 hours' THEN 10
          WHEN e.created_at > now() - interval '3 days' THEN 7
          WHEN e.created_at > now() - interval '7 days' THEN 4
          ELSE 0
        END
      ) as relevance_score
    FROM experiences e
    JOIN user_profiles up ON e.user_id = up.user_id
    WHERE e.user_id != p_user_id
      AND e.status = 'published'
  )
  SELECT
    se.id,
    se.title,
    se.story_text,
    se.category,
    se.tags,
    se.location_text,
    se.date_occurred,
    se.time_of_day,
    se.view_count,
    se.upvote_count,
    se.comment_count,
    se.created_at,
    jsonb_build_object(
      'username', se.username,
      'display_name', se.display_name,
      'avatar_url', se.avatar_url
    ) as user_profiles,
    se.relevance_score
  FROM scored_experiences se
  WHERE se.relevance_score > 0
  ORDER BY se.relevance_score DESC, se.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
