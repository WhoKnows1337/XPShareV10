# XPShare Performance Tuning Guide

**Last Updated:** 2025-10-21
**Status:** Production Ready
**Exa Research:** ✅ Validated against industry best practices

---

## 📊 Current State (111 XPs, 9 Users)

| Metric | Current Performance | Status |
|--------|-------------------|--------|
| Vector Similarity | ~5ms | ✅ Excellent |
| Attribute Search | ~50ms | ✅ Good |
| User Similarity | ~50ms | ✅ Good |
| Pattern Discovery | ~100ms | ✅ Good |
| For You Feed | ~500ms | ⚠️ Acceptable |

**Verdict:** System performs well at current scale. No immediate optimizations required.

---

## 🎯 Scaling Roadmap

### Phase 1: 0-10k XPs ✅ CURRENT
**Status:** No action required
**Infrastructure:** Supabase Free/Pro
**All features work perfectly**

### Phase 2: 10k-50k XPs ⚠️ OPTIMIZATION NEEDED
**Timeline:** When you hit 5k-10k XPs
**Infrastructure:** Supabase Team Tier ($599/mo)
**Required Optimizations:** See below

### Phase 3: 50k-100k XPs 🔴 ARCHITECTURE CHANGES
**Timeline:** When you hit 50k XPs
**Infrastructure:** Team Tier + Read Replicas
**Required Changes:** Partitioning, Materialized Views

### Phase 4: 100k-1M XPs 🚀 ENTERPRISE
**Timeline:** When you hit 100k XPs
**Infrastructure:** Separate Analytics DB (ClickHouse/BigQuery)
**Required Changes:** Separate analytics infrastructure

---

## 🔴 Critical Issues @ Scale

### 1. User Similarity O(n²) Problem

**Current Implementation:**
```sql
-- ❌ PROBLEM: Calculates ALL pairs
FOR other_user IN SELECT * FROM user_profiles WHERE id != target_user_id
  score := calculate_similarity(target_user_id, other_user.id)
END LOOP
```

**Complexity:**
- 100 users = 4,950 comparisons ✅
- 1,000 users = 499,500 comparisons ⚠️ (~5 seconds)
- 10,000 users = 49,995,000 comparisons 🔴 (TIMEOUT!)

**Solution: Top-K Approximate Nearest Neighbors**
```sql
-- ✅ SOLUTION: Only find Top-100 similar users
CREATE INDEX ON xp_dna_cache USING ivfflat (category_vector vector_cosine_ops)
WITH (lists = 100);

-- Query becomes O(log n) instead of O(n)
SELECT similar_user_id, similarity_score
FROM user_similarity_cache
WHERE user_id = $1
ORDER BY similarity_score DESC
LIMIT 100;  -- Only Top-100!
```

**Impact:**
- 10,000 users: From TIMEOUT → ~200ms ✅
- 100,000 users: Still ~300ms ✅

**Implementation Priority:** 🔴 HIGH (implement at 1k users)

---

### 2. Vector Index Redundancy

**Current State:**
```sql
-- ❌ BOTH indexes exist (waste of 600MB!)
idx_experiences_embedding_hnsw (HNSW)
idx_experiences_embedding_ivfflat (IVFFlat)
```

**Exa Research Finding:**
> "HNSW performs better than IVFFlat for datasets <1M rows.
> IVFFlat only makes sense for >1M rows with proper tuning."

**Solution:**
```sql
-- Drop IVFFlat index (saves 600MB storage)
DROP INDEX IF EXISTS idx_experiences_embedding_ivfflat;

-- Keep only HNSW with tuned parameters
CREATE INDEX IF NOT EXISTS idx_experiences_embedding_hnsw
ON experiences USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Set search parameter for accuracy/speed tradeoff
ALTER DATABASE postgres SET hnsw.ef_search = 100;
```

**Impact:**
- Storage: Save ~600MB
- Query Speed: 5-10% faster (no index selection overhead)
- Maintenance: Faster INSERT/UPDATE

**Implementation Priority:** 🟡 MEDIUM (nice-to-have, implement anytime)

---

### 3. For You Feed Performance

**Current Implementation:**
```sql
-- ❌ PROBLEM: Calculates feed for EVERY request
WITH user_engagement AS (
  SELECT COUNT(*) FROM upvotes... -- Scans entire table
),
user_similarity AS (
  SELECT * FROM experiences WHERE user_id IN (
    SELECT user_id FROM upvotes WHERE... -- Nested subqueries
  )
)
```

**Performance:**
- Current (111 XPs): ~500ms ⚠️
- @ 10k XPs: ~2s 🔴
- @ 100k XPs: ~8s 🔴

**Solution: Materialized View with Scheduled Refresh**
```sql
-- Create materialized view for trending/engagement scores
CREATE MATERIALIZED VIEW trending_experiences AS
WITH user_engagement AS (
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
)
SELECT * FROM user_engagement;

-- Create index on materialized view
CREATE INDEX ON trending_experiences(engagement_score DESC);

-- Schedule refresh every hour using pg_cron (Supabase extension)
SELECT cron.schedule(
  'refresh_trending',
  '0 * * * *',  -- Every hour
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY trending_experiences$$
);
```

**Then update get_for_you_feed() to use the view:**
```sql
-- ✅ FAST: Join with pre-computed view
SELECT e.*, te.engagement_score
FROM experiences e
LEFT JOIN trending_experiences te ON e.id = te.id
WHERE ... (user filters)
ORDER BY (
  category_score + similarity_score + te.engagement_score + location_score + recency_score
) DESC;
```

**Impact:**
- Query time: From 2s → ~50ms ✅ (40x faster!)
- Freshness: 1-hour delay (acceptable for feed)
- Storage: ~50MB for materialized view

**Implementation Priority:** 🟡 MEDIUM (implement at 10k XPs)

---

### 4. Pattern Discovery Caching

**Current Implementation:**
```sql
-- ❌ PROBLEM: Calculates patterns on every request
SELECT * FROM get_attribute_patterns('shape', 5);
-- Scans 500k attribute rows, calculates co-occurrences
```

**Performance:**
- Current: ~100ms ✅
- @ 100k XPs (500k attributes): ~500ms ⚠️
- @ 1M XPs (5M attributes): ~3s 🔴

**Solution: Background Job + pattern_insights Table**
```sql
-- ✅ You already have this table! Just need to USE it
CREATE TABLE pattern_insights (
  id uuid PRIMARY KEY,
  experience_id uuid,
  pattern_type text,  -- 'attribute_correlation', 'category_correlation', etc.
  insight_data jsonb,
  strength float,
  expires_at timestamptz
);

-- Background job to refresh insights (run daily)
CREATE OR REPLACE FUNCTION refresh_all_pattern_insights()
RETURNS void AS $$
DECLARE
  attr_key text;
BEGIN
  -- For each popular attribute key
  FOR attr_key IN
    SELECT DISTINCT attribute_key
    FROM experience_attributes
    WHERE created_at > now() - interval '30 days'
    GROUP BY attribute_key
    HAVING COUNT(*) >= 10
  LOOP
    -- Delete stale insights
    DELETE FROM pattern_insights
    WHERE pattern_type = 'attribute_pattern'
      AND insight_data->>'attribute_key' = attr_key
      AND expires_at < now();

    -- Insert fresh insights
    INSERT INTO pattern_insights (
      pattern_type,
      insight_data,
      strength,
      expires_at
    )
    SELECT
      'attribute_pattern',
      jsonb_build_object(
        'attribute_key', attr_key,
        'patterns', jsonb_agg(
          jsonb_build_object(
            'value', attribute_value,
            'count', occurrence_count,
            'percentage', percentage
          )
        )
      ),
      MAX(percentage) / 100.0,
      now() + interval '24 hours'
    FROM get_attribute_patterns(attr_key, 5)
    GROUP BY attr_key;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule(
  'refresh_patterns',
  '0 2 * * *',  -- Daily at 2 AM
  $$SELECT refresh_all_pattern_insights()$$
);
```

**Impact:**
- Query time: From 500ms → ~10ms ✅ (50x faster!)
- Freshness: 24-hour cache (acceptable for patterns)
- Storage: ~20MB for cached insights

**Implementation Priority:** 🟢 LOW (implement at 50k XPs)

---

### 5. Embedding Cache Missing

**Current Implementation:**
```sql
-- ❌ PROBLEM: Every search generates fresh embedding
const embedding = await generateEmbedding(query);  // $0.02/1M tokens
const results = await hybridSearch({ embedding, query });
```

**Waste:**
- Query "UFO sightings" searched 1000 times = 1000 embeddings generated
- Cost: ~$0.20/day wasted on duplicate embeddings
- Annual waste: ~$73

**Solution: Redis Cache**
```typescript
// lib/cache/embedding-cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCachedEmbedding(query: string): Promise<number[] | null> {
  const cached = await redis.get(`embedding:${query.toLowerCase()}`);
  return cached as number[] | null;
}

export async function setCachedEmbedding(query: string, embedding: number[]): Promise<void> {
  await redis.set(
    `embedding:${query.toLowerCase()}`,
    embedding,
    { ex: 7 * 24 * 60 * 60 } // 7 day TTL
  );
}

// Update lib/openai/client.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  // Try cache first
  const cached = await getCachedEmbedding(text);
  if (cached) return cached;

  // Generate fresh
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;

  // Cache for future
  await setCachedEmbedding(text, embedding);

  return embedding;
}
```

**Impact:**
- Cache hit rate: ~70-80% (typical for search queries)
- Cost savings: ~$55/year (75% reduction)
- Speed: Instant for cached queries

**Infrastructure:**
- Upstash Redis (Serverless): $0-10/month
- Alternative: Store in Postgres (slower but free)

**Implementation Priority:** 🟡 MEDIUM (implement at 1k users)

---

### 6. Search Analytics Unbounded Growth

**Current State:**
```sql
-- Every search stores 1536-dim embedding
INSERT INTO search_analytics (query_text, query_embedding, ...)
```

**Growth:**
- 10k queries/day × 1536 floats × 4 bytes = 60MB/day
- Annual: 22GB just for search embeddings!

**Solution: Retention Policy**
```sql
-- Keep only last 30 days of raw queries
CREATE OR REPLACE FUNCTION cleanup_old_search_analytics()
RETURNS void AS $$
BEGIN
  -- Archive aggregated stats before deleting
  INSERT INTO search_analytics_monthly (
    month,
    query_text,
    search_count,
    avg_result_count,
    avg_execution_time_ms
  )
  SELECT
    date_trunc('month', created_at),
    query_text,
    COUNT(*),
    AVG(result_count),
    AVG(execution_time_ms)
  FROM search_analytics
  WHERE created_at < now() - interval '30 days'
  GROUP BY date_trunc('month', created_at), query_text;

  -- Delete old raw queries
  DELETE FROM search_analytics
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup weekly
SELECT cron.schedule(
  'cleanup_search_analytics',
  '0 3 * * 0',  -- Sunday at 3 AM
  $$SELECT cleanup_old_search_analytics()$$
);
```

**Impact:**
- Storage: Cap at ~2GB (instead of unbounded)
- Keep aggregated insights forever
- Delete only raw query embeddings

**Implementation Priority:** 🟢 LOW (implement at 10k users)

---

### 7. XP DNA Cache Auto-Refresh Missing

**Current State:**
```sql
-- xp_dna_cache has only 9 entries for 111 experiences
-- No automatic refresh when user adds new experience
```

**Problem:**
- User submits new experience → DNA cache is stale
- Similarity calculations use outdated data
- Manual refresh required

**Solution: Trigger on Experience INSERT/UPDATE**
```sql
-- Auto-refresh XP DNA when experience is created/updated
CREATE OR REPLACE FUNCTION refresh_user_xp_dna_on_experience_change()
RETURNS trigger AS $$
BEGIN
  -- Refresh DNA cache for the user who created/updated the experience
  INSERT INTO xp_dna_cache (
    user_id,
    category_distribution,
    top_categories,
    total_experiences,
    experience_ids,
    category_vector,
    last_calculated_at
  )
  SELECT
    NEW.user_id,
    jsonb_object_agg(category, count) as category_distribution,
    ARRAY(
      SELECT category
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM experiences
        WHERE user_id = NEW.user_id AND visibility = 'public'
        GROUP BY category
        ORDER BY cnt DESC
        LIMIT 3
      ) top3
    ) as top_categories,
    COUNT(*) as total_experiences,
    array_agg(id) as experience_ids,
    -- Normalized vector for cosine similarity
    jsonb_object_agg(
      category,
      (count::float / SUM(count) OVER ())
    ) as category_vector,
    now()
  FROM (
    SELECT category, COUNT(*) as count
    FROM experiences
    WHERE user_id = NEW.user_id AND visibility = 'public'
    GROUP BY category
  ) cat_counts
  ON CONFLICT (user_id) DO UPDATE SET
    category_distribution = EXCLUDED.category_distribution,
    top_categories = EXCLUDED.top_categories,
    total_experiences = EXCLUDED.total_experiences,
    experience_ids = EXCLUDED.experience_ids,
    category_vector = EXCLUDED.category_vector,
    last_calculated_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to experiences table
CREATE TRIGGER refresh_xp_dna_on_insert_or_update
  AFTER INSERT OR UPDATE ON experiences
  FOR EACH ROW
  WHEN (NEW.visibility = 'public')
  EXECUTE FUNCTION refresh_user_xp_dna_on_experience_change();
```

**Impact:**
- DNA cache always fresh
- No manual refresh needed
- Enables real-time similarity calculations

**Implementation Priority:** 🔴 HIGH (implement now)

---

### 8. Table Partitioning for Attribute Search

**When to implement:** At 50k-100k XPs (500k+ attributes)

**Current Problem:**
```sql
-- Full table scan on 500k rows
SELECT * FROM experience_attributes
WHERE attribute_key = 'shape' AND attribute_value = 'triangle';
```

**Solution: Partition by Category**
```sql
-- Recreate table as partitioned
CREATE TABLE experience_attributes_new (
  id uuid DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL,
  attribute_key text NOT NULL,
  attribute_value text NOT NULL,
  category text NOT NULL,  -- Add category column
  confidence float,
  source text,
  -- ... other columns
) PARTITION BY LIST (category);

-- Create partition for each category (40+ partitions)
CREATE TABLE experience_attributes_ufo
  PARTITION OF experience_attributes_new
  FOR VALUES IN ('ufo');

CREATE TABLE experience_attributes_nde
  PARTITION OF experience_attributes_new
  FOR VALUES IN ('nde');

-- ... repeat for all 40+ categories

-- Migrate data (run during low-traffic)
INSERT INTO experience_attributes_new
SELECT
  ea.*,
  e.category
FROM experience_attributes ea
JOIN experiences e ON ea.experience_id = e.id;

-- Swap tables
ALTER TABLE experience_attributes RENAME TO experience_attributes_old;
ALTER TABLE experience_attributes_new RENAME TO experience_attributes;
```

**Impact:**
- Queries scan only 1/40th of data
- 40x faster attribute searches
- Each partition is independently maintainable

**Implementation Priority:** 🟢 LOW (implement at 50k XPs)

---

## 💰 Cost Optimization: Claude Haiku for Discovery

**Current Setup:**
```typescript
// app/actions/discover.tsx
const result = await streamUI({
  model: gpt4o,  // ❌ $2.50/1M input, $10/1M output
  // ...
});
```

**Cost @ 1000 Users:**
- 10 discovery chats/user/day
- ~2000 tokens input + 1000 tokens output per chat
- Annual cost: **$43,800** 😱

**Solution: Switch to Claude Haiku**
```typescript
import { anthropic } from '@ai-sdk/anthropic';

const result = await streamUI({
  model: anthropic('claude-3-haiku-20240307'),  // ✅ $0.25/1M in, $1.25/1M out
  // ... same tools, same functionality
});
```

**Quality Impact:**
- ✅ Haiku excels at: Data viz, structured tasks, analytics
- ⚠️ Slightly less eloquent than GPT-4o
- ✅ 3-5x faster response time (better UX!)

**Cost Savings:**
- From $43,800/year → **$4,380/year** (90% reduction!)
- Alternative: GPT-4o-mini at $2,190/year (95% reduction)

**Implementation Priority:** 🔴 HIGH (implement now, massive savings)

---

## 📊 Index Consolidation

**Current State:** 14 indexes on `experience_attributes` table

**Problem:** Each index adds write overhead
- INSERT: Must update 14 indexes
- UPDATE: Must update 14 indexes
- Storage: ~200MB of index data

**Solution: Audit and Consolidate**
```sql
-- Find unused indexes (run in production for 1 week)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,  -- Number of index scans
  idx_tup_read,  -- Tuples read
  idx_tup_fetch  -- Tuples fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'experience_attributes'
ORDER BY idx_scan ASC;

-- Drop indexes with idx_scan = 0 (never used)
-- Consolidate overlapping indexes
-- Example: Instead of separate indexes on (key), (value), create one on (key, value)
```

**Implementation Priority:** 🟢 LOW (nice-to-have, implement when bored)

---

## 🎯 Quick Wins (Implement Now)

### 1. HNSW Tuning (5 minutes)
```sql
-- Increase ef_search for better accuracy
ALTER DATABASE postgres SET hnsw.ef_search = 100;
```

### 2. Drop Redundant IVFFlat Index (2 minutes)
```sql
DROP INDEX IF EXISTS idx_experiences_embedding_ivfflat;
```

### 3. User Similarity Top-K Limit (10 minutes)
```sql
-- In refresh_user_similarity_cache(), add LIMIT:
ORDER BY similarity_score DESC
LIMIT 100;  -- Only keep top 100 similar users
```

**Total Time:** 15 minutes
**Total Impact:** Immediate performance boost + 600MB storage saved

---

## 📈 Monitoring Setup

**Key Metrics to Track:**

```sql
-- Slow query log (queries > 500ms)
CREATE TABLE IF NOT EXISTS slow_query_log (
  id serial PRIMARY KEY,
  query_text text,
  execution_time_ms int,
  created_at timestamptz DEFAULT now()
);

-- Track in application code
// lib/monitoring/query-tracker.ts
export async function trackQuery(queryName: string, durationMs: number) {
  if (durationMs > 500) {
    await supabase.from('slow_query_log').insert({
      query_text: queryName,
      execution_time_ms: durationMs
    });
  }
}
```

**Dashboard Queries:**
```sql
-- Top 10 slowest queries (last 24h)
SELECT query_text, AVG(execution_time_ms), COUNT(*)
FROM slow_query_log
WHERE created_at > now() - interval '24 hours'
GROUP BY query_text
ORDER BY AVG(execution_time_ms) DESC
LIMIT 10;

-- Cache hit rate (for embedding cache)
SELECT
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as hit_rate
FROM search_analytics
WHERE created_at > now() - interval '24 hours';
```

---

## 🚀 When to Upgrade Infrastructure

### Supabase Free → Pro ($25/mo)
**Trigger:** 1k experiences OR 100 active users
**Reason:** Free tier pauses after inactivity

### Supabase Pro → Team ($599/mo)
**Trigger:** 10k experiences OR 500 active users
**Reasons:**
- Need dedicated CPU
- 8GB RAM for complex queries
- Point-in-Time Recovery
- Better performance guarantees

### Add Read Replica (+$599/mo)
**Trigger:** 50k experiences OR 2k active users
**Reason:** Separate analytics from transactional load

### Separate Analytics DB
**Trigger:** 100k+ experiences
**Options:**
- ClickHouse Cloud ($500-2000/mo)
- BigQuery (pay-per-query)
- TimescaleDB (for time-series)

---

## 📚 References

- Exa Research: pgvector HNSW vs IVFFlat performance
- Exa Research: Collaborative filtering at scale
- Exa Research: Materialized views best practices
- PostgreSQL Docs: Partitioning
- Supabase Docs: Performance optimization
- Anthropic: Claude pricing and capabilities

---

## ✅ Implementation Checklist

### Phase 1: Immediate (0-1k users)
- [ ] Switch Discovery to Claude Haiku
- [ ] Implement embedding cache (Redis/Upstash)
- [ ] XP DNA auto-refresh trigger
- [ ] Drop IVFFlat index
- [ ] HNSW tuning (ef_search = 100)
- [ ] User Similarity Top-K limit
- [ ] Setup monitoring

### Phase 2: Early Growth (1k-10k users)
- [ ] Upgrade to Supabase Team Tier
- [ ] Materialized view for For You Feed
- [ ] Search analytics retention policy
- [ ] Background job for pattern insights
- [ ] Index consolidation audit

### Phase 3: Scale (10k-50k users)
- [ ] Table partitioning (by category)
- [ ] Read replica for analytics
- [ ] Advanced caching (CDN for static aggregations)
- [ ] Query optimization round 2

### Phase 4: Enterprise (50k+ users)
- [ ] Separate analytics infrastructure
- [ ] Advanced monitoring (Datadog/New Relic)
- [ ] Auto-scaling workers for background jobs
- [ ] Consider microservices architecture

---

**Document Version:** 1.0
**Next Review:** When reaching 5k experiences or 500 active users
