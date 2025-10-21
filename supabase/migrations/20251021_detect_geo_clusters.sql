-- =====================================================
-- detect_geo_clusters() - DBSCAN Geographic Clustering
-- =====================================================
--
-- Implements DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
-- to detect geographic hotspots in experience data.
--
-- Parameters:
--   p_epsilon_km: Maximum distance between points in same cluster (default: 50km)
--   p_min_points: Minimum points required to form cluster (default: 3)
--   p_categories: Optional array of categories to filter (NULL = all)
--
-- Returns:
--   cluster_id: Unique identifier for cluster (-1 = noise/outlier)
--   center_lat: Cluster centroid latitude
--   center_lng: Cluster centroid longitude
--   experience_count: Number of experiences in cluster
--   category_distribution: JSONB with count per category
--   avg_distance_km: Average distance from centroid
--

CREATE OR REPLACE FUNCTION detect_geo_clusters(
  p_epsilon_km numeric DEFAULT 50,
  p_min_points integer DEFAULT 3,
  p_categories text[] DEFAULT NULL
)
RETURNS TABLE (
  cluster_id integer,
  center_lat numeric,
  center_lng numeric,
  experience_count integer,
  category_distribution jsonb,
  avg_distance_km numeric
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_cluster_counter integer := 0;
  v_experience record;
  v_neighbor record;
  v_distance numeric;
BEGIN
  -- Create temp table for clustering results
  CREATE TEMP TABLE IF NOT EXISTS _clustering (
    experience_id uuid,
    cluster_id integer,
    lat numeric,
    lng numeric,
    category text,
    is_core boolean DEFAULT FALSE,
    visited boolean DEFAULT FALSE
  ) ON COMMIT DROP;

  -- Initialize clustering data
  INSERT INTO _clustering (experience_id, cluster_id, lat, lng, category)
  SELECT
    e.id,
    -1, -- Initialize as noise
    e.location_lat,
    e.location_lng,
    e.category
  FROM experiences e
  WHERE
    e.is_test_data = FALSE
    AND e.location_lat IS NOT NULL
    AND e.location_lng IS NOT NULL
    AND (p_categories IS NULL OR e.category = ANY(p_categories));

  -- DBSCAN Algorithm
  FOR v_experience IN
    SELECT * FROM _clustering WHERE NOT visited
  LOOP
    -- Mark as visited
    UPDATE _clustering
    SET visited = TRUE
    WHERE experience_id = v_experience.experience_id;

    -- Find neighbors within epsilon radius
    CREATE TEMP TABLE IF NOT EXISTS _neighbors (
      experience_id uuid,
      distance_km numeric
    ) ON COMMIT DROP;

    INSERT INTO _neighbors
    SELECT
      c.experience_id,
      ROUND(
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(v_experience.lat)) * cos(radians(c.lat)) *
            cos(radians(c.lng) - radians(v_experience.lng)) +
            sin(radians(v_experience.lat)) * sin(radians(c.lat))
          ))
        ))::numeric,
        2
      ) as distance_km
    FROM _clustering c
    WHERE c.experience_id != v_experience.experience_id;

    -- Count neighbors within epsilon
    IF (SELECT COUNT(*) FROM _neighbors WHERE distance_km <= p_epsilon_km) >= p_min_points THEN
      -- Core point - create new cluster
      v_cluster_counter := v_cluster_counter + 1;

      -- Assign cluster to core point
      UPDATE _clustering
      SET cluster_id = v_cluster_counter, is_core = TRUE
      WHERE experience_id = v_experience.experience_id;

      -- Assign cluster to neighbors
      UPDATE _clustering
      SET cluster_id = v_cluster_counter
      WHERE experience_id IN (
        SELECT n.experience_id
        FROM _neighbors n
        WHERE n.distance_km <= p_epsilon_km
      )
      AND cluster_id = -1; -- Only assign if not already clustered
    END IF;

    DROP TABLE IF EXISTS _neighbors;
  END LOOP;

  -- Aggregate results by cluster
  RETURN QUERY
  SELECT
    c.cluster_id,
    ROUND(AVG(c.lat)::numeric, 6) as center_lat,
    ROUND(AVG(c.lng)::numeric, 6) as center_lng,
    COUNT(*)::integer as experience_count,
    jsonb_object_agg(
      cat.category,
      cat.count
    ) as category_distribution,
    ROUND(AVG(
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(AVG(c.lat) OVER (PARTITION BY c.cluster_id))) *
          cos(radians(c.lat)) *
          cos(radians(c.lng) - radians(AVG(c.lng) OVER (PARTITION BY c.cluster_id))) +
          sin(radians(AVG(c.lat) OVER (PARTITION BY c.cluster_id))) *
          sin(radians(c.lat))
        ))
      )
    )::numeric, 2) as avg_distance_km
  FROM _clustering c
  LEFT JOIN LATERAL (
    SELECT
      c2.category,
      COUNT(*)::integer as count
    FROM _clustering c2
    WHERE c2.cluster_id = c.cluster_id
    GROUP BY c2.category
  ) cat ON TRUE
  WHERE c.cluster_id != -1 -- Exclude noise
  GROUP BY c.cluster_id
  HAVING COUNT(*) >= p_min_points -- Only return valid clusters
  ORDER BY experience_count DESC;

  DROP TABLE IF EXISTS _clustering;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION detect_geo_clusters TO authenticated;
GRANT EXECUTE ON FUNCTION detect_geo_clusters TO anon;

-- Add comment
COMMENT ON FUNCTION detect_geo_clusters IS
  'DBSCAN clustering algorithm for detecting geographic hotspots in experience data. Returns clusters with at least min_points experiences within epsilon_km radius.';
