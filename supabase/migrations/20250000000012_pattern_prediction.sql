-- Pattern Prediction Function for Aha-Moment #7

CREATE OR REPLACE FUNCTION predict_next_wave(p_category text)
RETURNS TABLE (
  event_type text,
  date_range text,
  probability float
) AS $$
BEGIN
  -- Simple time-series analysis: Find recurring patterns
  RETURN QUERY
  WITH monthly_counts AS (
    SELECT
      date_trunc('month', date_occurred::timestamp) as month,
      COUNT(*) as count
    FROM experiences
    WHERE category = p_category
      AND date_occurred IS NOT NULL
      AND date_occurred::timestamp > now() - interval '2 years'
    GROUP BY date_trunc('month', date_occurred::timestamp)
    ORDER BY month
  ),
  seasonal_pattern AS (
    SELECT
      EXTRACT(month FROM month) as month_num,
      AVG(count) as avg_count,
      STDDEV(count) as stddev_count
    FROM monthly_counts
    GROUP BY month_num
  )
  SELECT
    'Solar-Maximum' as event_type,
    to_char(now() + interval '1 month', 'DD.') || '-' ||
    to_char(now() + interval '1 month' + interval '4 days', 'DD. Mon YYYY') as date_range,
    CASE
      WHEN COALESCE(avg_count, 0) > 10 THEN 0.78
      WHEN COALESCE(avg_count, 0) > 5 THEN 0.65
      ELSE 0.45
    END as probability
  FROM seasonal_pattern
  WHERE month_num = EXTRACT(month FROM now() + interval '1 month')
  ORDER BY probability DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
