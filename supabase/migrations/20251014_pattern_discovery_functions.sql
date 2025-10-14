-- ═════════════════════════════════════════════════════════════════════
-- XPSHARE PATTERN DISCOVERY FUNCTIONS
-- Migration: 20251014_pattern_discovery_functions
-- Description: SQL functions for attribute-based pattern analysis
-- ═════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 1: Find Similar Experiences by Attributes
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_experiences_by_shared_attributes(
  p_experience_id uuid,
  p_threshold float DEFAULT 0.3,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  experience_id uuid,
  similarity_score float,
  shared_attributes jsonb,
  shared_count integer,
  total_attributes integer
) AS $$
BEGIN
  RETURN QUERY
  WITH source_attributes AS (
    -- Get all attributes for the source experience
    SELECT attribute_key, attribute_value
    FROM experience_attributes
    WHERE experience_id = p_experience_id
      AND replaced_by IS NULL
  ),
  candidate_experiences AS (
    -- Find experiences that share at least one attribute
    SELECT DISTINCT ea.experience_id
    FROM experience_attributes ea
    INNER JOIN source_attributes sa
      ON ea.attribute_key = sa.attribute_key
      AND ea.attribute_value = sa.attribute_value
    WHERE ea.experience_id != p_experience_id
      AND ea.replaced_by IS NULL
  ),
  similarity_scores AS (
    SELECT
      ce.experience_id,
      COUNT(DISTINCT CASE
        WHEN sa.attribute_key IS NOT NULL THEN ea.attribute_key
      END) as shared_count,
      (
        SELECT COUNT(*)
        FROM experience_attributes
        WHERE experience_id = ce.experience_id
          AND replaced_by IS NULL
      ) as target_attributes,
      (
        SELECT COUNT(*)
        FROM source_attributes
      ) as source_count,
      jsonb_object_agg(
        COALESCE(ea.attribute_key, ''),
        COALESCE(ea.attribute_value, '')
      ) FILTER (WHERE sa.attribute_key IS NOT NULL) as shared_attrs
    FROM candidate_experiences ce
    LEFT JOIN experience_attributes ea
      ON ea.experience_id = ce.experience_id
      AND ea.replaced_by IS NULL
    LEFT JOIN source_attributes sa
      ON ea.attribute_key = sa.attribute_key
      AND ea.attribute_value = sa.attribute_value
    GROUP BY ce.experience_id
  )
  SELECT
    ss.experience_id,
    ROUND(
      (ss.shared_count::float / GREATEST(ss.source_count, ss.target_attributes))::numeric,
      3
    )::float as similarity_score,
    COALESCE(ss.shared_attrs, '{}'::jsonb) as shared_attributes,
    ss.shared_count::integer,
    ss.target_attributes::integer
  FROM similarity_scores ss
  WHERE (ss.shared_count::float / GREATEST(ss.source_count, ss.target_attributes)) >= p_threshold
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_experiences_by_shared_attributes IS 'Find experiences with similar attribute patterns (Jaccard similarity)';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 2: Get Attribute Patterns (Statistics)
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_attribute_patterns(
  p_attribute_key text,
  p_min_occurrences integer DEFAULT 5
)
RETURNS TABLE (
  attribute_value text,
  occurrence_count bigint,
  percentage float,
  co_occurring_attributes jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH attribute_counts AS (
    -- Count occurrences of each value for this attribute
    SELECT
      ea.attribute_value,
      COUNT(DISTINCT ea.experience_id) as count
    FROM experience_attributes ea
    JOIN experiences e ON e.id = ea.experience_id
    WHERE ea.attribute_key = p_attribute_key
      AND ea.replaced_by IS NULL
      AND e.visibility = 'public'
    GROUP BY ea.attribute_value
    HAVING COUNT(DISTINCT ea.experience_id) >= p_min_occurrences
  ),
  total_count AS (
    SELECT SUM(count) as total FROM attribute_counts
  ),
  co_occurrences AS (
    -- Find attributes that co-occur with each value
    SELECT
      ea1.attribute_value as target_value,
      ea2.attribute_key as co_attr_key,
      ea2.attribute_value as co_attr_value,
      COUNT(*) as co_count
    FROM experience_attributes ea1
    JOIN experience_attributes ea2
      ON ea1.experience_id = ea2.experience_id
    WHERE ea1.attribute_key = p_attribute_key
      AND ea2.attribute_key != p_attribute_key
      AND ea1.replaced_by IS NULL
      AND ea2.replaced_by IS NULL
    GROUP BY ea1.attribute_value, ea2.attribute_key, ea2.attribute_value
  )
  SELECT
    ac.attribute_value,
    ac.count as occurrence_count,
    ROUND((ac.count::float / tc.total * 100)::numeric, 2)::float as percentage,
    (
      SELECT jsonb_object_agg(
        co.co_attr_key,
        jsonb_build_object(
          'value', co.co_attr_value,
          'count', co.co_count,
          'percentage', ROUND((co.co_count::float / ac.count * 100)::numeric, 2)
        )
      )
      FROM (
        SELECT * FROM co_occurrences
        WHERE target_value = ac.attribute_value
        ORDER BY co_count DESC
        LIMIT 5
      ) co
    ) as co_occurring_attributes
  FROM attribute_counts ac
  CROSS JOIN total_count tc
  ORDER BY ac.count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_attribute_patterns IS 'Get statistical patterns for an attribute with co-occurrence analysis';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 3: Calculate Pattern Strength Between Two Experiences
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_pattern_strength(
  p_experience_id1 uuid,
  p_experience_id2 uuid
)
RETURNS float AS $$
DECLARE
  v_shared_count integer;
  v_total_count integer;
  v_strength float;
BEGIN
  -- Count shared attributes
  WITH exp1_attrs AS (
    SELECT attribute_key, attribute_value
    FROM experience_attributes
    WHERE experience_id = p_experience_id1
      AND replaced_by IS NULL
  ),
  exp2_attrs AS (
    SELECT attribute_key, attribute_value
    FROM experience_attributes
    WHERE experience_id = p_experience_id2
      AND replaced_by IS NULL
  )
  SELECT
    COUNT(CASE WHEN e2.attribute_key IS NOT NULL THEN 1 END)::integer,
    COUNT(DISTINCT COALESCE(e1.attribute_key, e2.attribute_key))::integer
  INTO v_shared_count, v_total_count
  FROM exp1_attrs e1
  FULL OUTER JOIN exp2_attrs e2
    ON e1.attribute_key = e2.attribute_key
    AND e1.attribute_value = e2.attribute_value;

  -- Calculate Jaccard similarity: intersection / union
  IF v_total_count = 0 THEN
    RETURN 0.0;
  END IF;

  v_strength := v_shared_count::float / v_total_count;

  RETURN ROUND(v_strength::numeric, 3)::float;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_pattern_strength IS 'Calculate Jaccard similarity between two experiences based on attributes';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 4: Cross-Attribute Correlation Analysis
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION analyze_attribute_correlation(
  p_attribute_key1 text,
  p_attribute_value1 text,
  p_category_slug text DEFAULT NULL
)
RETURNS TABLE (
  attribute_key text,
  attribute_value text,
  correlation_count bigint,
  correlation_percentage float,
  strength text
) AS $$
BEGIN
  RETURN QUERY
  WITH target_experiences AS (
    -- Experiences with the target attribute
    SELECT DISTINCT ea.experience_id
    FROM experience_attributes ea
    JOIN experiences e ON e.id = ea.experience_id
    WHERE ea.attribute_key = p_attribute_key1
      AND ea.attribute_value = p_attribute_value1
      AND ea.replaced_by IS NULL
      AND e.visibility = 'public'
      AND (p_category_slug IS NULL OR e.category = p_category_slug)
  ),
  target_count AS (
    SELECT COUNT(*) as total FROM target_experiences
  ),
  correlations AS (
    -- Find other attributes in those experiences
    SELECT
      ea.attribute_key,
      ea.attribute_value,
      COUNT(*) as count
    FROM experience_attributes ea
    WHERE ea.experience_id IN (SELECT experience_id FROM target_experiences)
      AND ea.replaced_by IS NULL
      AND NOT (ea.attribute_key = p_attribute_key1 AND ea.attribute_value = p_attribute_value1)
    GROUP BY ea.attribute_key, ea.attribute_value
  )
  SELECT
    c.attribute_key,
    c.attribute_value,
    c.count as correlation_count,
    ROUND((c.count::float / tc.total * 100)::numeric, 2)::float as correlation_percentage,
    CASE
      WHEN (c.count::float / tc.total) >= 0.8 THEN 'very_strong'
      WHEN (c.count::float / tc.total) >= 0.6 THEN 'strong'
      WHEN (c.count::float / tc.total) >= 0.4 THEN 'moderate'
      WHEN (c.count::float / tc.total) >= 0.2 THEN 'weak'
      ELSE 'very_weak'
    END as strength
  FROM correlations c
  CROSS JOIN target_count tc
  WHERE c.count >= 3  -- Minimum 3 occurrences
  ORDER BY c.count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION analyze_attribute_correlation IS 'Find correlations between a specific attribute value and other attributes';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 5: Geographic Clustering
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_attribute_geographic_clusters(
  p_attribute_key text,
  p_attribute_value text,
  p_min_count integer DEFAULT 3
)
RETURNS TABLE (
  location_text text,
  latitude float,
  longitude float,
  sighting_count bigint,
  date_range tstzrange
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.location as location_text,
    AVG(e.location_lat)::float as latitude,
    AVG(e.location_lng)::float as longitude,
    COUNT(*)::bigint as sighting_count,
    tstzrange(MIN(e.date_occurred), MAX(e.date_occurred)) as date_range
  FROM experiences e
  JOIN experience_attributes ea ON ea.experience_id = e.id
  WHERE ea.attribute_key = p_attribute_key
    AND ea.attribute_value = p_attribute_value
    AND ea.replaced_by IS NULL
    AND e.location_lat IS NOT NULL
    AND e.location_lng IS NOT NULL
    AND e.visibility = 'public'
  GROUP BY e.location
  HAVING COUNT(*) >= p_min_count
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_attribute_geographic_clusters IS 'Find geographic hotspots for specific attribute values';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 6: Temporal Pattern Analysis
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_attribute_temporal_patterns(
  p_attribute_key text,
  p_attribute_value text,
  p_granularity text DEFAULT 'month'  -- 'day', 'week', 'month', 'year'
)
RETURNS TABLE (
  time_period text,
  sighting_count bigint,
  percentage float
) AS $$
DECLARE
  v_trunc_format text;
BEGIN
  -- Determine date truncation format
  v_trunc_format := CASE p_granularity
    WHEN 'day' THEN 'day'
    WHEN 'week' THEN 'week'
    WHEN 'month' THEN 'month'
    WHEN 'year' THEN 'year'
    ELSE 'month'
  END;

  RETURN QUERY
  WITH total_count AS (
    SELECT COUNT(*) as total
    FROM experiences e
    JOIN experience_attributes ea ON ea.experience_id = e.id
    WHERE ea.attribute_key = p_attribute_key
      AND ea.attribute_value = p_attribute_value
      AND ea.replaced_by IS NULL
      AND e.date_occurred IS NOT NULL
      AND e.visibility = 'public'
  )
  SELECT
    to_char(date_trunc(v_trunc_format, e.date_occurred), 'YYYY-MM-DD') as time_period,
    COUNT(*)::bigint as sighting_count,
    ROUND((COUNT(*)::float / tc.total * 100)::numeric, 2)::float as percentage
  FROM experiences e
  JOIN experience_attributes ea ON ea.experience_id = e.id
  CROSS JOIN total_count tc
  WHERE ea.attribute_key = p_attribute_key
    AND ea.attribute_value = p_attribute_value
    AND ea.replaced_by IS NULL
    AND e.date_occurred IS NOT NULL
    AND e.visibility = 'public'
  GROUP BY date_trunc(v_trunc_format, e.date_occurred), tc.total
  ORDER BY sighting_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_attribute_temporal_patterns IS 'Find temporal patterns for specific attribute values';

-- ═════════════════════════════════════════════════════════════════════
-- FUNCTION 7: Update Pattern Insights (Background Job Helper)
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_pattern_insights_for_experience(
  p_experience_id uuid
)
RETURNS void AS $$
DECLARE
  v_category text;
  v_similar_experiences record;
  v_correlations jsonb;
  v_geographic jsonb;
  v_temporal jsonb;
BEGIN
  -- Get experience category
  SELECT category INTO v_category
  FROM experiences
  WHERE id = p_experience_id;

  IF v_category IS NULL THEN
    RETURN;
  END IF;

  -- Find similar experiences
  SELECT jsonb_agg(
    jsonb_build_object(
      'experience_id', experience_id,
      'similarity_score', similarity_score,
      'shared_count', shared_count
    )
  ) INTO v_similar_experiences
  FROM find_experiences_by_shared_attributes(p_experience_id, 0.3, 10);

  -- Store attribute_correlation pattern
  DELETE FROM pattern_insights
  WHERE experience_id = p_experience_id
    AND pattern_type = 'attribute_correlation';

  INSERT INTO pattern_insights (
    experience_id,
    pattern_type,
    insight_data,
    strength,
    expires_at
  )
  VALUES (
    p_experience_id,
    'attribute_correlation',
    jsonb_build_object(
      'similar_experiences', COALESCE(v_similar_experiences, '[]'::jsonb)
    ),
    COALESCE((v_similar_experiences->0->>'similarity_score')::float, 0.0),
    now() + interval '30 days'
  );

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_pattern_insights_for_experience IS 'Update cached pattern insights for an experience (called by background job)';

-- ═════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═════════════════════════════════════════════════════════════════════

-- Composite index for attribute matching
CREATE INDEX IF NOT EXISTS idx_exp_attr_key_value_exp
  ON experience_attributes(attribute_key, attribute_value, experience_id)
  WHERE replaced_by IS NULL;

-- Index for geographic queries
CREATE INDEX IF NOT EXISTS idx_experiences_location_coords
  ON experiences(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Index for temporal queries
CREATE INDEX IF NOT EXISTS idx_experiences_date_occurred
  ON experiences(date_occurred)
  WHERE date_occurred IS NOT NULL;

-- ═════════════════════════════════════════════════════════════════════
-- GRANTS
-- ═════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION find_experiences_by_shared_attributes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_attribute_patterns TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_pattern_strength TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analyze_attribute_correlation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_attribute_geographic_clusters TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_attribute_temporal_patterns TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_pattern_insights_for_experience TO authenticated;

-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Pattern Discovery Functions migration completed';
  RAISE NOTICE 'Created 7 functions for attribute-based pattern analysis';
  RAISE NOTICE 'Functions: find_similar_experiences_by_attributes, get_attribute_patterns, calculate_pattern_strength';
  RAISE NOTICE 'Functions: analyze_attribute_correlation, find_geographic_clusters, find_temporal_patterns';
  RAISE NOTICE 'Functions: update_pattern_insights_for_experience';
END $$;
