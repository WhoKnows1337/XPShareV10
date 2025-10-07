-- Calculate User Impact Metrics
CREATE OR REPLACE FUNCTION calculate_user_impact(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  patterns_count int;
  countries_count int;
  total_views int;
  citations_count int;
  viewer_countries jsonb;
  pattern_contributions jsonb;
BEGIN
  -- Get patterns discovered (patterns where user was first)
  SELECT COUNT(DISTINCT pc.id) INTO patterns_count
  FROM pattern_clusters pc
  WHERE pc.created_by = p_user_id;

  -- Get total view count across all user's experiences
  SELECT COALESCE(SUM(e.view_count), 0) INTO total_views
  FROM experiences e
  WHERE e.user_id = p_user_id;

  -- For now, use placeholder for citations (could track via separate table)
  citations_count := 0;

  -- Get viewer countries (simulated - would need view tracking table)
  -- For now, return sample data based on location diversity
  SELECT jsonb_build_object(
    'DE', total_views * 0.45,
    'CH', total_views * 0.23,
    'AT', total_views * 0.18,
    'FR', total_views * 0.08,
    'US', total_views * 0.06
  ) INTO viewer_countries
  WHERE total_views > 0;

  IF viewer_countries IS NULL THEN
    viewer_countries := '{}'::jsonb;
  END IF;

  -- Count distinct countries
  SELECT jsonb_array_length(jsonb_object_keys(viewer_countries)::jsonb) INTO countries_count;
  IF countries_count IS NULL THEN
    countries_count := 0;
  END IF;

  -- Get pattern contributions with details
  SELECT jsonb_agg(
    jsonb_build_object(
      'pattern_id', pc.id,
      'pattern_name', pc.name,
      'experience_count', pc.experience_count,
      'is_creator', true,
      'correlation', pc.confidence_score,
      'created_at', pc.created_at
    )
  ) INTO pattern_contributions
  FROM pattern_clusters pc
  WHERE pc.created_by = p_user_id
  LIMIT 5;

  IF pattern_contributions IS NULL THEN
    pattern_contributions := '[]'::jsonb;
  END IF;

  -- Build result object
  result := jsonb_build_object(
    'patterns_discovered', patterns_count,
    'countries_reached', countries_count,
    'people_helped', total_views,
    'research_citations', citations_count,
    'viewer_countries', viewer_countries,
    'pattern_contributions', pattern_contributions,
    'data_quality_score', CASE
      WHEN total_views > 100 THEN 95
      WHEN total_views > 50 THEN 85
      WHEN total_views > 10 THEN 75
      ELSE 65
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_user_views ON experiences(user_id, view_count);
CREATE INDEX IF NOT EXISTS idx_pattern_clusters_creator ON pattern_clusters(created_by);
