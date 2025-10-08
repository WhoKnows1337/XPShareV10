-- Experience Detail Page SQL Functions
-- Vector Similarity, Cross-Category Insights, Geospatial Queries

-- =====================================================
-- 1. VECTOR SIMILARITY SEARCH (requires pgvector)
-- =====================================================

CREATE OR REPLACE FUNCTION match_experiences(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 12,
  p_experience_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  created_at timestamptz,
  user_profiles jsonb,
  match_score int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.category,
    e.created_at,
    jsonb_build_object(
      'username', p.username,
      'display_name', p.display_name
    ) as user_profiles,
    ROUND((1 - (e.embedding <=> query_embedding)) * 100)::int as match_score
  FROM experiences e
  JOIN user_profiles p ON e.user_id = p.id
  WHERE
    e.visibility = 'public'
    AND (p_experience_id IS NULL OR e.id != p_experience_id)
    AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- 2. CROSS-CATEGORY INSIGHTS (Aha-Moment #9)
-- =====================================================

CREATE OR REPLACE FUNCTION get_cross_category_insights(p_category text)
RETURNS TABLE (
  category_name text,
  category_slug text,
  category_icon text,
  correlation float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH category_users AS (
    -- Users who have experiences in the given category
    SELECT DISTINCT user_id
    FROM experiences
    WHERE category = p_category
      AND visibility = 'public'
  ),
  other_category_counts AS (
    -- Count experiences in other categories by these users
    SELECT
      e.category,
      COUNT(DISTINCT e.user_id) as user_count
    FROM experiences e
    JOIN category_users cu ON e.user_id = cu.user_id
    WHERE e.category != p_category
      AND e.visibility = 'public'
    GROUP BY e.category
  ),
  baseline_counts AS (
    -- Overall user count per category (baseline)
    SELECT
      category,
      COUNT(DISTINCT user_id) as baseline_count
    FROM experiences
    WHERE category != p_category
      AND visibility = 'public'
    GROUP BY category
  )
  SELECT
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    ROUND((occ.user_count::float / NULLIF(bc.baseline_count, 0)) * 10) / 10 as correlation
  FROM other_category_counts occ
  JOIN baseline_counts bc ON occ.category = bc.category
  JOIN question_categories c ON c.slug = occ.category
  WHERE (occ.user_count::float / NULLIF(bc.baseline_count, 0)) >= 1.5  -- Min 1.5x correlation
  ORDER BY correlation DESC
  LIMIT 3;
END;
$$;

-- =====================================================
-- 3. GEOSPATIAL: NEARBY EXPERIENCES
-- =====================================================

CREATE OR REPLACE FUNCTION get_nearby_experiences(
  p_lat float,
  p_lng float,
  p_radius_km float DEFAULT 50,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  location_lat float,
  location_lng float,
  distance_km float,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.category,
    e.location_lat,
    e.location_lng,
    ROUND(
      (6371 * acos(
        cos(radians(p_lat)) *
        cos(radians(e.location_lat)) *
        cos(radians(e.location_lng) - radians(p_lng)) +
        sin(radians(p_lat)) *
        sin(radians(e.location_lat))
      ))::numeric,
      2
    )::float as distance_km,
    e.created_at
  FROM experiences e
  WHERE
    e.location_lat IS NOT NULL
    AND e.location_lng IS NOT NULL
    AND e.visibility = 'public'
    -- Bounding box filter for performance
    AND e.location_lat BETWEEN p_lat - (p_radius_km / 111.0) AND p_lat + (p_radius_km / 111.0)
    AND e.location_lng BETWEEN p_lng - (p_radius_km / (111.0 * cos(radians(p_lat))))
                            AND p_lng + (p_radius_km / (111.0 * cos(radians(p_lat))))
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- 4. TEMPORAL PATTERN: SAME TIME EXPERIENCES
-- =====================================================

CREATE OR REPLACE FUNCTION get_same_time_experiences(
  p_experience_id uuid,
  p_time_window_days int DEFAULT 2
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  date_occurred timestamptz,
  time_difference_hours int,
  user_profiles jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_date_occurred timestamptz;
  v_category text;
BEGIN
  -- Get reference experience details
  SELECT date_occurred, category INTO v_date_occurred, v_category
  FROM experiences
  WHERE id = p_experience_id;

  IF v_date_occurred IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.category,
    e.date_occurred,
    ROUND(EXTRACT(EPOCH FROM (e.date_occurred - v_date_occurred)) / 3600)::int as time_difference_hours,
    jsonb_build_object(
      'username', p.username,
      'display_name', p.display_name
    ) as user_profiles
  FROM experiences e
  JOIN user_profiles p ON e.user_id = p.id
  WHERE
    e.id != p_experience_id
    AND e.date_occurred IS NOT NULL
    AND e.visibility = 'public'
    AND e.date_occurred BETWEEN
      v_date_occurred - (p_time_window_days || ' days')::interval
      AND v_date_occurred + (p_time_window_days || ' days')::interval
    AND (e.category = v_category OR v_category IS NULL)  -- Optional: same category
  ORDER BY ABS(EXTRACT(EPOCH FROM (e.date_occurred - v_date_occurred)))
  LIMIT 20;
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION match_experiences TO authenticated;
GRANT EXECUTE ON FUNCTION get_cross_category_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_experiences TO authenticated;
GRANT EXECUTE ON FUNCTION get_same_time_experiences TO authenticated;

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Vector similarity index (if not exists)
CREATE INDEX IF NOT EXISTS idx_experiences_embedding_ivfflat
ON experiences USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Geospatial index
CREATE INDEX IF NOT EXISTS idx_experiences_location
ON experiences (location_lat, location_lng)
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Temporal index
CREATE INDEX IF NOT EXISTS idx_experiences_date_occurred
ON experiences (date_occurred)
WHERE date_occurred IS NOT NULL;

-- Category + visibility index
CREATE INDEX IF NOT EXISTS idx_experiences_category_visibility
ON experiences (category, visibility);

COMMENT ON FUNCTION match_experiences IS 'Vector similarity search for finding similar experiences using pgvector';
COMMENT ON FUNCTION get_cross_category_insights IS 'Aha-Moment #9: Find correlated categories that users tend to experience together';
COMMENT ON FUNCTION get_nearby_experiences IS 'Geospatial search for experiences within a radius';
COMMENT ON FUNCTION get_same_time_experiences IS 'Find experiences that occurred around the same time';
