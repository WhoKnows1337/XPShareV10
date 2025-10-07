-- Predict next wave/pattern based on historical data
CREATE OR REPLACE FUNCTION predict_next_wave(p_category text DEFAULT NULL)
RETURNS TABLE (
  event_type text,
  date_range text,
  probability float,
  peak_date date,
  predicted_count int
) AS $$
DECLARE
  current_month int;
  peak_month_num int;
  avg_peak_count float;
BEGIN
  current_month := EXTRACT(month FROM CURRENT_DATE);

  -- Find historical peak month for category
  SELECT
    EXTRACT(month FROM date_trunc('month', e.date_occurred))::int,
    AVG(monthly_counts.count)
  INTO peak_month_num, avg_peak_count
  FROM (
    SELECT
      date_trunc('month', date_occurred) as month,
      COUNT(*) as count
    FROM experiences
    WHERE (p_category IS NULL OR category = p_category)
      AND date_occurred > CURRENT_DATE - interval '2 years'
      AND date_occurred IS NOT NULL
    GROUP BY date_trunc('month', date_occurred)
  ) monthly_counts
  JOIN experiences e ON date_trunc('month', e.date_occurred) = monthly_counts.month
  WHERE (p_category IS NULL OR e.category = p_category)
  GROUP BY EXTRACT(month FROM monthly_counts.month)
  ORDER BY AVG(monthly_counts.count) DESC
  LIMIT 1;

  -- If no peak found, return empty
  IF peak_month_num IS NULL THEN
    RETURN;
  END IF;

  -- Calculate next occurrence of peak month
  DECLARE
    next_peak_date date;
    months_until_peak int;
    base_probability float;
  BEGIN
    -- Calculate months until next peak
    IF peak_month_num >= current_month THEN
      months_until_peak := peak_month_num - current_month;
      next_peak_date := date_trunc('month', CURRENT_DATE) + (months_until_peak || ' months')::interval;
    ELSE
      months_until_peak := (12 - current_month) + peak_month_num;
      next_peak_date := date_trunc('month', CURRENT_DATE) + (months_until_peak || ' months')::interval;
    END IF;

    -- Calculate probability (higher if closer to peak month)
    IF months_until_peak <= 1 THEN
      base_probability := 0.85;
    ELSIF months_until_peak <= 2 THEN
      base_probability := 0.75;
    ELSIF months_until_peak <= 3 THEN
      base_probability := 0.65;
    ELSE
      base_probability := 0.50;
    END IF;

    -- Adjust probability based on recent trend
    DECLARE
      recent_count int;
      trend_multiplier float;
    BEGIN
      SELECT COUNT(*) INTO recent_count
      FROM experiences
      WHERE (p_category IS NULL OR category = p_category)
        AND date_occurred > CURRENT_DATE - interval '30 days';

      IF recent_count >= 10 THEN
        trend_multiplier := 1.2;
      ELSIF recent_count >= 5 THEN
        trend_multiplier := 1.1;
      ELSE
        trend_multiplier := 1.0;
      END IF;

      base_probability := LEAST(base_probability * trend_multiplier, 0.95);
    END;

    -- Return prediction
    RETURN QUERY SELECT
      CASE
        WHEN p_category = 'ufo' THEN 'UFO-Wave'
        WHEN p_category = 'paranormal' THEN 'Paranormale Aktivität'
        WHEN p_category = 'dreams' THEN 'Traum-Welle'
        ELSE 'Erhöhte Aktivität'
      END as event_type,
      to_char(next_peak_date, 'DD.') || '-' ||
      to_char(next_peak_date + interval '7 days', 'DD. Month YYYY') as date_range,
      base_probability as probability,
      next_peak_date::date as peak_date,
      CEIL(avg_peak_count)::int as predicted_count;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_experiences_date_category ON experiences(date_occurred, category) WHERE date_occurred IS NOT NULL;
