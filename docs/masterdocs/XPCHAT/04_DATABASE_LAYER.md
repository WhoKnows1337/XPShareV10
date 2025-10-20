# XPShare AI - Database Layer & SQL Functions

**Version:** 1.0
**Related:** 03_TOOLS_CATALOG.md, 01_ARCHITECTURE.md

---

## 🎯 Overview

This document contains all SQL functions, migrations, and schema extensions needed for the AI system.

**Key Components:**
- 🔍 Advanced search functions
- 📊 Aggregation & analytics functions
- 🗺️ Geographic & spatial functions
- 🔗 Relationship discovery functions
- ⚡ Performance optimizations (indexes, caching)

---

## 📦 Current Schema Overview

```sql
-- Core Tables (Already Exist)
experiences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  category_slug TEXT,
  title TEXT,
  description TEXT,
  location_text TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  date_occurred DATE,
  time_of_day TIME,
  tags TEXT[],
  emotions TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ
)

experience_attributes (
  id UUID PRIMARY KEY,
  experience_id UUID REFERENCES experiences,
  attribute_key TEXT,
  attribute_value JSONB,
  confidence DECIMAL(3,2)
)

user_profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  location_city TEXT,
  location_country TEXT,
  total_experiences INT,
  total_xp INT
)

question_categories (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT
)

attribute_schema (
  id UUID PRIMARY KEY,
  category_slug TEXT,
  key TEXT,
  value_type TEXT,
  possible_values JSONB
)
```

---

## 🔧 Required Extensions

```sql
-- Migration: 001_enable_extensions.sql
-- Enable required PostgreSQL extensions

-- Vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Geographic/spatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- JSON operations
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 Schema Extensions

### 1. Add Full-Text Search Columns

```sql
-- Migration: 002_add_fts_columns.sql

-- Add tsvector column for full-text search
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS fts tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(location_text, '')), 'C')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS experiences_fts_idx
ON experiences USING GIN(fts);

-- Create trigram index for fuzzy search
CREATE INDEX IF NOT EXISTS experiences_title_trgm_idx
ON experiences USING GIN(title gin_trgm_ops);
```

### 2. Add Geographic Indexes

```sql
-- Migration: 003_add_geo_indexes.sql

-- Convert lat/lng to PostGIS geography
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS geog geography(POINT, 4326);

-- Populate geography from lat/lng
UPDATE experiences
SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index
CREATE INDEX IF NOT EXISTS experiences_geog_idx
ON experiences USING GIST(geog);

-- Create trigger to auto-update geography
CREATE OR REPLACE FUNCTION update_experience_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER experiences_geog_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude ON experiences
FOR EACH ROW
EXECUTE FUNCTION update_experience_geog();
```

### 3. Add Composite Indexes

```sql
-- Migration: 004_add_composite_indexes.sql

-- Category + Date index for temporal queries
CREATE INDEX IF NOT EXISTS experiences_category_date_idx
ON experiences(category_slug, date_occurred DESC)
WHERE date_occurred IS NOT NULL;

-- Category + Location index
CREATE INDEX IF NOT EXISTS experiences_category_location_idx
ON experiences(category_slug, location_text)
WHERE location_text IS NOT NULL;

-- User + Category index for user analytics
CREATE INDEX IF NOT EXISTS experiences_user_category_idx
ON experiences(user_id, category_slug);

-- Attribute search optimization
CREATE INDEX IF NOT EXISTS experience_attributes_key_value_idx
ON experience_attributes(attribute_key, (attribute_value::text));

-- Vector similarity index
CREATE INDEX IF NOT EXISTS experiences_embedding_idx
ON experiences USING ivfflat(embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 🔍 Advanced Search Functions

### 1. search_by_attributes

**Purpose:** Find experiences matching attribute filters with AND/OR logic

```sql
-- Migration: 005_search_by_attributes.sql

CREATE OR REPLACE FUNCTION search_by_attributes(
  p_category TEXT,
  p_attribute_filters JSONB,
  p_logic TEXT DEFAULT 'AND',
  p_min_confidence DECIMAL DEFAULT 0,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category_slug TEXT,
  location_text TEXT,
  date_occurred DATE,
  matched_attributes JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  filter JSONB;
  sql_query TEXT;
  filter_conditions TEXT[] := '{}';
  filter_condition TEXT;
BEGIN
  -- Build dynamic query based on filters
  FOR filter IN SELECT * FROM jsonb_array_elements(p_attribute_filters)
  LOOP
    CASE filter->>'operator'
      WHEN 'equals' THEN
        filter_condition := format(
          'EXISTS (
            SELECT 1 FROM experience_attributes ea
            WHERE ea.experience_id = e.id
              AND ea.attribute_key = %L
              AND ea.attribute_value::text = %L
              AND ea.confidence >= %s
          )',
          filter->>'key',
          filter->>'value',
          p_min_confidence
        );

      WHEN 'contains' THEN
        filter_condition := format(
          'EXISTS (
            SELECT 1 FROM experience_attributes ea
            WHERE ea.experience_id = e.id
              AND ea.attribute_key = %L
              AND ea.attribute_value::text ILIKE %L
              AND ea.confidence >= %s
          )',
          filter->>'key',
          '%' || (filter->>'value') || '%',
          p_min_confidence
        );

      WHEN 'exists' THEN
        filter_condition := format(
          'EXISTS (
            SELECT 1 FROM experience_attributes ea
            WHERE ea.experience_id = e.id
              AND ea.attribute_key = %L
              AND ea.confidence >= %s
          )',
          filter->>'key',
          p_min_confidence
        );
    END CASE;

    filter_conditions := array_append(filter_conditions, filter_condition);
  END LOOP;

  -- Combine conditions with AND/OR
  sql_query := format(
    'SELECT
      e.id,
      e.title,
      e.description,
      e.category_slug,
      e.location_text,
      e.date_occurred,
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            ''key'', ea.attribute_key,
            ''value'', ea.attribute_value,
            ''confidence'', ea.confidence
          )
        )
        FROM experience_attributes ea
        WHERE ea.experience_id = e.id
      ) as matched_attributes
    FROM experiences e
    WHERE e.category_slug = %L
      AND (%s)
    LIMIT %s',
    p_category,
    array_to_string(filter_conditions, ' ' || p_logic || ' '),
    p_limit
  );

  RETURN QUERY EXECUTE sql_query;
END;
$$;
```

### 2. geo_search

**Purpose:** Geographic search within radius or bounding box

```sql
-- Migration: 006_geo_search.sql

CREATE OR REPLACE FUNCTION geo_search(
  p_center_lat DECIMAL DEFAULT NULL,
  p_center_lng DECIMAL DEFAULT NULL,
  p_radius_km DECIMAL DEFAULT NULL,
  p_bounding_box JSONB DEFAULT NULL,
  p_categories TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category_slug TEXT,
  location_text TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_center_lat IS NOT NULL AND p_center_lng IS NOT NULL AND p_radius_km IS NOT NULL THEN
    -- Radius search
    RETURN QUERY
    SELECT
      e.id,
      e.title,
      e.category_slug,
      e.location_text,
      e.latitude,
      e.longitude,
      ROUND(
        ST_Distance(
          e.geog,
          ST_SetSRID(ST_MakePoint(p_center_lng, p_center_lat), 4326)::geography
        )::numeric / 1000,
        2
      ) as distance_km
    FROM experiences e
    WHERE e.geog IS NOT NULL
      AND ST_DWithin(
        e.geog,
        ST_SetSRID(ST_MakePoint(p_center_lng, p_center_lat), 4326)::geography,
        p_radius_km * 1000
      )
      AND (p_categories IS NULL OR e.category_slug = ANY(p_categories))
    ORDER BY distance_km
    LIMIT p_limit;

  ELSIF p_bounding_box IS NOT NULL THEN
    -- Bounding box search
    RETURN QUERY
    SELECT
      e.id,
      e.title,
      e.category_slug,
      e.location_text,
      e.latitude,
      e.longitude,
      NULL::DECIMAL as distance_km
    FROM experiences e
    WHERE e.geog IS NOT NULL
      AND ST_Within(
        e.geog,
        ST_MakeEnvelope(
          (p_bounding_box->>'west')::DECIMAL,
          (p_bounding_box->>'south')::DECIMAL,
          (p_bounding_box->>'east')::DECIMAL,
          (p_bounding_box->>'north')::DECIMAL,
          4326
        )::geography
      )
      AND (p_categories IS NULL OR e.category_slug = ANY(p_categories))
    LIMIT p_limit;
  END IF;
END;
$$;
```

---

## 📊 Analytics Functions

### 3. aggregate_users_by_category

**Purpose:** Get user rankings by category

```sql
-- Migration: 007_aggregate_users.sql

CREATE OR REPLACE FUNCTION aggregate_users_by_category(
  p_category TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  location_city TEXT,
  experience_count BIGINT,
  total_xp INT,
  categories_contributed INT,
  first_experience DATE,
  last_experience DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    u.username,
    u.avatar_url,
    u.location_city,
    COUNT(e.id) as experience_count,
    u.total_xp,
    COUNT(DISTINCT e.category_slug) as categories_contributed,
    MIN(e.date_occurred) as first_experience,
    MAX(e.date_occurred) as last_experience
  FROM user_profiles u
  INNER JOIN experiences e ON e.user_id = u.id
  WHERE
    (p_category IS NULL OR e.category_slug = p_category)
    AND (p_location IS NULL OR u.location_city ILIKE '%' || p_location || '%')
    AND (p_date_from IS NULL OR e.date_occurred >= p_date_from)
    AND (p_date_to IS NULL OR e.date_occurred <= p_date_to)
  GROUP BY u.id, u.username, u.avatar_url, u.location_city, u.total_xp
  ORDER BY experience_count DESC
  LIMIT p_limit;
END;
$$;
```

### 4. temporal_aggregation

**Purpose:** Aggregate experiences by time periods

```sql
-- Migration: 008_temporal_aggregation.sql

CREATE OR REPLACE FUNCTION temporal_aggregation(
  p_categories TEXT[] DEFAULT NULL,
  p_granularity TEXT DEFAULT 'month', -- 'hour', 'day', 'week', 'month', 'year'
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_group_by TEXT DEFAULT NULL -- 'category', 'location', NULL
)
RETURNS TABLE (
  time_period TEXT,
  group_key TEXT,
  experience_count BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  time_format TEXT;
BEGIN
  -- Determine time format based on granularity
  time_format := CASE p_granularity
    WHEN 'hour' THEN 'YYYY-MM-DD HH24:00'
    WHEN 'day' THEN 'YYYY-MM-DD'
    WHEN 'week' THEN 'IYYY-IW'
    WHEN 'month' THEN 'YYYY-MM'
    WHEN 'year' THEN 'YYYY'
    ELSE 'YYYY-MM'
  END;

  RETURN QUERY EXECUTE format(
    'SELECT
      TO_CHAR(
        CASE
          WHEN %L = ''hour'' THEN date_trunc(''hour'', date_occurred + time_of_day::time)
          ELSE date_trunc(%L, date_occurred)
        END,
        %L
      ) as time_period,
      %s as group_key,
      COUNT(*)::BIGINT as experience_count,
      COUNT(DISTINCT user_id)::BIGINT as unique_users
    FROM experiences
    WHERE
      ($1 IS NULL OR category_slug = ANY($1))
      AND ($2 IS NULL OR date_occurred >= $2)
      AND ($3 IS NULL OR date_occurred <= $3)
    GROUP BY time_period, group_key
    ORDER BY time_period',
    p_granularity,
    p_granularity,
    time_format,
    CASE
      WHEN p_group_by = 'category' THEN 'category_slug'
      WHEN p_group_by = 'location' THEN 'location_text'
      ELSE 'NULL::TEXT'
    END
  )
  USING p_categories, p_date_from, p_date_to;
END;
$$;
```

---

## 🔗 Relationship Functions

### 5. find_related_experiences

**Purpose:** Multi-dimensional similarity

```sql
-- Migration: 009_find_related.sql

CREATE OR REPLACE FUNCTION find_related_experiences(
  p_experience_id UUID,
  p_use_semantic BOOLEAN DEFAULT true,
  p_use_geographic BOOLEAN DEFAULT true,
  p_use_temporal BOOLEAN DEFAULT true,
  p_use_attributes BOOLEAN DEFAULT true,
  p_max_results INT DEFAULT 10,
  p_min_score DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category_slug TEXT,
  similarity_score DECIMAL,
  semantic_score DECIMAL,
  geographic_score DECIMAL,
  temporal_score DECIMAL,
  attribute_score DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_exp RECORD;
  semantic_weight DECIMAL := CASE WHEN p_use_semantic THEN 0.4 ELSE 0 END;
  geo_weight DECIMAL := CASE WHEN p_use_geographic THEN 0.3 ELSE 0 END;
  temp_weight DECIMAL := CASE WHEN p_use_temporal THEN 0.2 ELSE 0 END;
  attr_weight DECIMAL := CASE WHEN p_use_attributes THEN 0.1 ELSE 0 END;
BEGIN
  -- Get source experience
  SELECT * INTO source_exp
  FROM experiences
  WHERE experiences.id = p_experience_id;

  IF source_exp IS NULL THEN
    RAISE EXCEPTION 'Experience not found: %', p_experience_id;
  END IF;

  RETURN QUERY
  WITH candidate_scores AS (
    SELECT
      e.id,
      e.title,
      e.category_slug,

      -- Semantic similarity (cosine distance)
      CASE
        WHEN p_use_semantic AND source_exp.embedding IS NOT NULL AND e.embedding IS NOT NULL
        THEN 1 - (source_exp.embedding <=> e.embedding)
        ELSE 0
      END as sem_score,

      -- Geographic similarity
      CASE
        WHEN p_use_geographic AND source_exp.geog IS NOT NULL AND e.geog IS NOT NULL
        THEN GREATEST(0, 1 - (ST_Distance(source_exp.geog, e.geog) / 500000))
        ELSE 0
      END as geo_score,

      -- Temporal similarity (max 365 days = 0 similarity)
      CASE
        WHEN p_use_temporal AND source_exp.date_occurred IS NOT NULL AND e.date_occurred IS NOT NULL
        THEN GREATEST(0, 1 - (ABS(EXTRACT(EPOCH FROM (source_exp.date_occurred - e.date_occurred))) / (365 * 86400)))
        ELSE 0
      END as temp_score,

      -- Attribute similarity (Jaccard)
      CASE
        WHEN p_use_attributes
        THEN (
          SELECT COALESCE(
            COUNT(DISTINCT sa.attribute_key)::DECIMAL / NULLIF(
              (
                SELECT COUNT(DISTINCT attribute_key)
                FROM experience_attributes
                WHERE experience_id IN (p_experience_id, e.id)
              ),
              0
            ),
            0
          )
          FROM experience_attributes sa
          WHERE sa.experience_id = p_experience_id
            AND EXISTS (
              SELECT 1 FROM experience_attributes ea
              WHERE ea.experience_id = e.id
                AND ea.attribute_key = sa.attribute_key
                AND ea.attribute_value = sa.attribute_value
            )
        )
        ELSE 0
      END as attr_score

    FROM experiences e
    WHERE e.id != p_experience_id
      AND e.category_slug = source_exp.category_slug
  )
  SELECT
    cs.id,
    cs.title,
    cs.category_slug,
    ROUND(
      (cs.sem_score * semantic_weight +
       cs.geo_score * geo_weight +
       cs.temp_score * temp_weight +
       cs.attr_score * attr_weight)::numeric,
      3
    ) as similarity_score,
    ROUND(cs.sem_score::numeric, 3) as semantic_score,
    ROUND(cs.geo_score::numeric, 3) as geographic_score,
    ROUND(cs.temp_score::numeric, 3) as temporal_score,
    ROUND(cs.attr_score::numeric, 3) as attribute_score
  FROM candidate_scores cs
  WHERE (
    cs.sem_score * semantic_weight +
    cs.geo_score * geo_weight +
    cs.temp_score * temp_weight +
    cs.attr_score * attr_weight
  ) >= p_min_score
  ORDER BY similarity_score DESC
  LIMIT p_max_results;
END;
$$;
```

### 6. detect_geo_clusters

**Purpose:** Find geographic clusters using DBSCAN

```sql
-- Migration: 010_detect_clusters.sql

CREATE OR REPLACE FUNCTION detect_geo_clusters(
  p_categories TEXT[] DEFAULT NULL,
  p_min_points INT DEFAULT 3,
  p_radius_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
  cluster_id INT,
  category TEXT,
  point_count BIGINT,
  center_lat DECIMAL,
  center_lng DECIMAL,
  radius_km DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH clustered_points AS (
    SELECT
      e.id,
      e.category_slug,
      e.latitude,
      e.longitude,
      e.geog,
      ST_ClusterDBSCAN(e.geog, eps := p_radius_km * 1000, minpoints := p_min_points) OVER (
        PARTITION BY e.category_slug
      ) as cluster
    FROM experiences e
    WHERE e.geog IS NOT NULL
      AND (p_categories IS NULL OR e.category_slug = ANY(p_categories))
  ),
  cluster_stats AS (
    SELECT
      cluster,
      category_slug,
      COUNT(*) as point_count,
      ST_Y(ST_Centroid(ST_Collect(geog::geometry))::geography) as center_lat,
      ST_X(ST_Centroid(ST_Collect(geog::geography))::geography) as center_lng,
      MAX(ST_Distance(
        geog,
        ST_Centroid(ST_Collect(geog::geography))::geography
      )) / 1000 as radius
    FROM clustered_points
    WHERE cluster IS NOT NULL
    GROUP BY cluster, category_slug
    HAVING COUNT(*) >= p_min_points
  )
  SELECT
    cs.cluster::INT,
    cs.category_slug,
    cs.point_count,
    ROUND(cs.center_lat::numeric, 6) as center_lat,
    ROUND(cs.center_lng::numeric, 6) as center_lng,
    ROUND(cs.radius::numeric, 2) as radius_km
  FROM cluster_stats cs
  ORDER BY cs.point_count DESC;
END;
$$;
```

---

## ⚡ Performance Functions

### 7. Materialized Views for Common Queries

```sql
-- Migration: 011_materialized_views.sql

-- Category statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS category_stats AS
SELECT
  qc.slug as category_slug,
  qc.name as category_name,
  COUNT(DISTINCT e.id) as experience_count,
  COUNT(DISTINCT e.user_id) as contributor_count,
  COUNT(DISTINCT ea.attribute_key) as attribute_count,
  MIN(e.date_occurred) as earliest_experience,
  MAX(e.date_occurred) as latest_experience,
  AVG(array_length(e.tags, 1)) as avg_tags_per_experience
FROM question_categories qc
LEFT JOIN experiences e ON e.category_slug = qc.slug
LEFT JOIN experience_attributes ea ON ea.experience_id = e.id
GROUP BY qc.slug, qc.name;

CREATE UNIQUE INDEX ON category_stats(category_slug);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_category_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY category_stats;
END;
$$ LANGUAGE plpgsql;

-- User rankings cache
CREATE MATERIALIZED VIEW IF NOT EXISTS user_rankings AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.location_city,
  u.total_experiences,
  u.total_xp,
  COUNT(DISTINCT e.category_slug) as categories_count,
  array_agg(DISTINCT e.category_slug) as categories,
  ROW_NUMBER() OVER (ORDER BY u.total_experiences DESC) as rank_by_experiences,
  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank_by_xp
FROM user_profiles u
LEFT JOIN experiences e ON e.user_id = u.id
GROUP BY u.id, u.username, u.avatar_url, u.location_city, u.total_experiences, u.total_xp;

CREATE UNIQUE INDEX ON user_rankings(id);
CREATE INDEX ON user_rankings(rank_by_experiences);
CREATE INDEX ON user_rankings(rank_by_xp);
```

### 8. Caching Helper Functions

```sql
-- Migration: 012_caching_helpers.sql

-- Create cache table
CREATE TABLE IF NOT EXISTS query_cache (
  cache_key TEXT PRIMARY KEY,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS query_cache_expires_idx
ON query_cache(expires_at);

-- Cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM query_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get or compute cached result
CREATE OR REPLACE FUNCTION get_cached_result(
  p_cache_key TEXT,
  p_ttl_seconds INT DEFAULT 300
)
RETURNS JSONB AS $$
DECLARE
  cached_result JSONB;
BEGIN
  SELECT result INTO cached_result
  FROM query_cache
  WHERE cache_key = p_cache_key
    AND expires_at > NOW();

  RETURN cached_result;
END;
$$ LANGUAGE plpgsql;

-- Set cached result
CREATE OR REPLACE FUNCTION set_cached_result(
  p_cache_key TEXT,
  p_result JSONB,
  p_ttl_seconds INT DEFAULT 300
)
RETURNS void AS $$
BEGIN
  INSERT INTO query_cache (cache_key, result, expires_at)
  VALUES (
    p_cache_key,
    p_result,
    NOW() + (p_ttl_seconds || ' seconds')::INTERVAL
  )
  ON CONFLICT (cache_key)
  DO UPDATE SET
    result = EXCLUDED.result,
    created_at = NOW(),
    expires_at = EXCLUDED.expires_at;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 Row-Level Security (RLS)

```sql
-- Migration: 013_rls_policies.sql

-- Enable RLS on experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Public read access for published experiences
CREATE POLICY "Public experiences are viewable by everyone"
ON experiences FOR SELECT
TO public
USING (true);

-- Users can insert their own experiences
CREATE POLICY "Users can insert own experiences"
ON experiences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own experiences
CREATE POLICY "Users can update own experiences"
ON experiences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own experiences
CREATE POLICY "Users can delete own experiences"
ON experiences FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on experience_attributes
ALTER TABLE experience_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attributes viewable with experience"
ON experience_attributes FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM experiences
    WHERE experiences.id = experience_attributes.experience_id
  )
);
```

---

## 📈 Monitoring & Logging

```sql
-- Migration: 014_monitoring.sql

-- Query performance logging
CREATE TABLE IF NOT EXISTS query_performance_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_name TEXT NOT NULL,
  execution_time_ms INT NOT NULL,
  parameters JSONB,
  result_count INT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS query_perf_function_idx
ON query_performance_log(function_name, created_at DESC);

-- Wrapper function for logging
CREATE OR REPLACE FUNCTION log_query_performance(
  p_function_name TEXT,
  p_start_time TIMESTAMPTZ,
  p_parameters JSONB,
  p_result_count INT,
  p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  execution_time INT;
BEGIN
  execution_time := EXTRACT(EPOCH FROM (NOW() - p_start_time)) * 1000;

  INSERT INTO query_performance_log (
    function_name,
    execution_time_ms,
    parameters,
    result_count,
    user_id
  ) VALUES (
    p_function_name,
    execution_time,
    p_parameters,
    p_result_count,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 💬 UX Enhancement Tables

### Citations Table

```sql
-- Migration: 015_citations.sql

CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  snippet TEXT,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citations_message_id_idx ON citations(message_id);
CREATE INDEX IF NOT EXISTS citations_experience_id_idx ON citations(experience_id);

-- RLS Policies
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citations are viewable by everyone"
ON citations FOR SELECT
TO public
USING (true);
```

### Memory System Tables

```sql
-- Migration: 016_memory.sql

-- User Profile Memory (persistent)
CREATE TABLE IF NOT EXISTS user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('session', 'profile')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  source TEXT CHECK (source IN ('user_stated', 'inferred', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scope, key)
);

CREATE INDEX IF NOT EXISTS user_memory_user_id_idx ON user_memory(user_id, scope);
CREATE INDEX IF NOT EXISTS user_memory_key_idx ON user_memory(key);

-- Session Memory (ephemeral, 24h expiry)
CREATE TABLE IF NOT EXISTS session_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(chat_id, key)
);

CREATE INDEX IF NOT EXISTS session_memory_chat_id_idx ON session_memory(chat_id);
CREATE INDEX IF NOT EXISTS session_memory_expires_idx ON session_memory(expires_at);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM session_memory WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
ON user_memory FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
ON user_memory FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
ON user_memory FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Message Feedback Table

```sql
-- Migration: 017_feedback.sql

CREATE TABLE IF NOT EXISTS message_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating IN (-1, 1)), -- thumbs up/down
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_feedback_message_idx ON message_feedback(message_id);
CREATE INDEX IF NOT EXISTS message_feedback_user_idx ON message_feedback(user_id);
CREATE INDEX IF NOT EXISTS message_feedback_rating_idx ON message_feedback(rating, created_at DESC);

-- RLS Policies
ALTER TABLE message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
ON message_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON message_feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Message Attachments Table

```sql
-- Migration: 018_attachments.sql

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size <= 10485760), -- 10MB max
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_attachments_message_idx ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS message_attachments_user_idx ON message_attachments(user_id);

-- RLS Policies
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own attachments"
ON message_attachments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attachments"
ON message_attachments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Extended Chat Tables

```sql
-- Migration: 019_extended_chats.sql

-- Add columns to existing chats table
ALTER TABLE chats ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS chats_pinned_idx ON chats(pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS chats_archived_idx ON chats(archived) WHERE archived = false;
CREATE INDEX IF NOT EXISTS chats_tags_idx ON chats USING GIN(tags);
```

### Branching & Threading Tables

```sql
-- Migration: 020_branching.sql

CREATE TABLE IF NOT EXISTS message_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_message_id UUID NOT NULL,
  child_message_id UUID NOT NULL,
  branch_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_message_id, child_message_id)
);

CREATE INDEX IF NOT EXISTS message_branches_parent_idx ON message_branches(parent_message_id);
CREATE INDEX IF NOT EXISTS message_branches_child_idx ON message_branches(child_message_id);
```

```sql
-- Migration: 021_threading.sql

CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_message_id UUID NOT NULL,
  reply_message_id UUID NOT NULL,
  depth INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_message_id, reply_message_id)
);

CREATE INDEX IF NOT EXISTS message_threads_parent_idx ON message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS message_threads_reply_idx ON message_threads(reply_message_id);
```

### Shared Chats Table

```sql
-- Migration: 022_sharing.sql

CREATE TABLE IF NOT EXISTS shared_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shared_chats_token_idx ON shared_chats(share_token);
CREATE INDEX IF NOT EXISTS shared_chats_chat_idx ON shared_chats(chat_id);
CREATE INDEX IF NOT EXISTS shared_chats_expires_idx ON shared_chats(expires_at);

-- RLS Policies
ALTER TABLE shared_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create shares for own chats"
ON shared_chats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Shared chats are viewable by token"
ON shared_chats FOR SELECT
TO public
USING (expires_at IS NULL OR expires_at > NOW());
```

### Token Tracking

```sql
-- Migration: 023_token_tracking.sql

-- Add columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tokens_used INT DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10,6) DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS messages_tokens_idx ON messages(tokens_used);
CREATE INDEX IF NOT EXISTS messages_cost_idx ON messages(cost_usd);
```

### Prompt Library Table

```sql
-- Migration: 024_prompt_library.sql

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category_slug TEXT,
  tags TEXT[] DEFAULT '{}',
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prompt_templates_category_idx ON prompt_templates(category_slug);
CREATE INDEX IF NOT EXISTS prompt_templates_tags_idx ON prompt_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS prompt_templates_use_count_idx ON prompt_templates(use_count DESC);

-- RLS Policies
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompt templates are viewable by everyone"
ON prompt_templates FOR SELECT
TO public
USING (true);

-- Seed initial prompts
INSERT INTO prompt_templates (title, description, prompt_text, category_slug, tags) VALUES
('UFO Sightings in City', 'Search for UFO sightings in a specific city', 'Show me UFO sightings in [CITY] from the last [TIME_PERIOD]', 'ufo', ARRAY['location', 'recent']),
('Dream Pattern Analysis', 'Analyze recurring dream symbols', 'Analyze dream patterns featuring [SYMBOL] and identify common themes', 'dreams', ARRAY['analysis', 'symbols']),
('NDE Comparison', 'Compare near-death experiences', 'Compare near-death experiences from [LOCATION] and identify similarities', 'nde', ARRAY['comparison', 'patterns']),
('Synchronicity Timeline', 'View synchronicity events over time', 'Show me synchronicity experiences from [DATE_RANGE] visualized on a timeline', 'synchronicity', ARRAY['temporal', 'visualization']),
('Top Contributors', 'Rank users by category', 'Who are the top contributors in the [CATEGORY] category?', NULL, ARRAY['users', 'rankings'])
ON CONFLICT DO NOTHING;
```

---

## 🚀 Migration Execution Order

Execute migrations in this order:

```bash
# 1. Extensions
psql -f migrations/001_enable_extensions.sql

# 2. Schema modifications
psql -f migrations/002_add_fts_columns.sql
psql -f migrations/003_add_geo_indexes.sql
psql -f migrations/004_add_composite_indexes.sql

# 3. Search functions
psql -f migrations/005_search_by_attributes.sql
psql -f migrations/006_geo_search.sql

# 4. Analytics functions
psql -f migrations/007_aggregate_users.sql
psql -f migrations/008_temporal_aggregation.sql

# 5. Relationship functions
psql -f migrations/009_find_related.sql
psql -f migrations/010_detect_clusters.sql

# 6. Performance
psql -f migrations/011_materialized_views.sql
psql -f migrations/012_caching_helpers.sql

# 7. Security
psql -f migrations/013_rls_policies.sql

# 8. Monitoring
psql -f migrations/014_monitoring.sql

# 9. UX Enhancements (Citations, Memory, Feedback, etc.)
psql -f migrations/015_citations.sql
psql -f migrations/016_memory.sql
psql -f migrations/017_feedback.sql
psql -f migrations/018_attachments.sql
psql -f migrations/019_extended_chats.sql
psql -f migrations/020_branching.sql
psql -f migrations/021_threading.sql
psql -f migrations/022_sharing.sql
psql -f migrations/023_token_tracking.sql
psql -f migrations/024_prompt_library.sql
```

**Or use Supabase MCP:**

```typescript
// Using Supabase MCP apply_migration tool
await mcp.apply_migration({
  name: 'enable_extensions',
  query: `-- SQL from 001_enable_extensions.sql`
})
```

---

## 🧪 Testing Functions

```sql
-- Test advanced search
SELECT * FROM search_by_attributes(
  'dreams',
  '[
    {"key": "dream_symbol", "value": "bird", "operator": "contains"},
    {"key": "dream_emotion", "value": "peaceful", "operator": "equals"}
  ]'::jsonb,
  'AND',
  0.7,
  10
);

-- Test geo search
SELECT * FROM geo_search(
  52.5200, -- Berlin lat
  13.4050, -- Berlin lng
  50,      -- 50km radius
  NULL,
  ARRAY['ufo', 'nde'],
  20
);

-- Test user rankings
SELECT * FROM aggregate_users_by_category(
  'dreams',
  'Berlin',
  '2024-01-01'::DATE,
  '2024-12-31'::DATE,
  10
);

-- Test related experiences
SELECT * FROM find_related_experiences(
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  true,  -- semantic
  true,  -- geographic
  true,  -- temporal
  true,  -- attributes
  10,
  0.5
);
```

---

**Next:** See 05_VISUALIZATION_ENGINE.md for auto-visualization system.
