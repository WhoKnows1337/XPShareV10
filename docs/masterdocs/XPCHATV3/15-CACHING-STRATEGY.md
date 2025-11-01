# 15. Caching Strategy - Performance & Cost Optimization

**Status:** Ready to Implement
**Version:** 3.0
**Created:** 2025-10-26

---

## 🎯 Überblick

Caching ist **KRITISCH** für XPChat V3, weil:

1. **Cost Reduction**: Embeddings kosten $0.00002 pro Request → Cache 90%
2. **Response Time**: 3-7s → <1s bei Cache Hit
3. **Rate Limits**: OpenAI 3000 RPM → Cache reduziert Load
4. **User Experience**: Instant Results = Happy Users

**Anti-Pattern:** "We'll add caching later" → NO! Caching ist JETZT!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Caching Layers                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Browser Cache    → Static Assets         │
│  Layer 2: Edge Config      → Feature Flags         │
│  Layer 3: Vercel KV/Redis  → Hot Data (Embeddings) │
│  Layer 4: Postgres         → Persistent Data       │
│  Layer 5: CDN              → Media Files           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Cache Types & Strategy

### 1. Embedding Cache (Redis/Upstash)

**Problem:** Gleiche Query = Gleiche Embedding = Unnötige API Calls

**Solution:** Cache embeddings by query string

```typescript
// lib/cache/embedding-cache.ts
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const redis = Redis.fromEnv();

interface EmbeddingCacheEntry {
  query: string;
  embedding: number[];
  model: string;
  timestamp: number;
}

export async function getCachedEmbedding(
  query: string,
  model: string = 'text-embedding-3-small'
): Promise<number[] | null> {

  const cacheKey = `embedding:${model}:${hashQuery(query)}`;

  try {
    const cached = await redis.get<EmbeddingCacheEntry>(cacheKey);
    if (cached) {
      console.log('✅ Embedding cache HIT:', query.slice(0, 50));
      return cached.embedding;
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  return null;
}

export async function setCachedEmbedding(
  query: string,
  embedding: number[],
  model: string = 'text-embedding-3-small'
): Promise<void> {

  const cacheKey = `embedding:${model}:${hashQuery(query)}`;
  const ttl = 60 * 60 * 24 * 30; // 30 days

  const entry: EmbeddingCacheEntry = {
    query,
    embedding,
    model,
    timestamp: Date.now()
  };

  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(entry));
    console.log('✅ Embedding cached:', query.slice(0, 50));
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

function hashQuery(query: string): string {
  // Normalize query before hashing
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse whitespace

  return createHash('sha256')
    .update(normalized)
    .digest('hex')
    .slice(0, 16); // Short hash for key
}
```

**TTL Strategy:**
- Embeddings: 30 days (queries don't change often)
- Invalidation: Manual nur wenn Model Update

**Expected Hit Rate:** 70-80% (viele User fragen ähnliches)

---

### 2. Search Results Cache

**Problem:** Gleiche Search = Gleiche Results (zumindest kurzfristig)

**Solution:** Cache search results with short TTL

```typescript
// lib/cache/search-cache.ts

interface SearchCacheEntry {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  timestamp: number;
  ttl: number;
}

export async function getCachedSearchResults(
  query: string,
  filters: SearchFilters
): Promise<SearchResult[] | null> {

  const cacheKey = `search:${hashSearchParams(query, filters)}`;

  try {
    const cached = await redis.get<SearchCacheEntry>(cacheKey);

    if (cached) {
      // Check if still valid
      const age = Date.now() - cached.timestamp;
      if (age < cached.ttl * 1000) {
        console.log('✅ Search cache HIT:', query);
        return cached.results;
      }
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  return null;
}

export async function setCachedSearchResults(
  query: string,
  filters: SearchFilters,
  results: SearchResult[],
  ttlSeconds: number = 300 // 5 minutes
): Promise<void> {

  const cacheKey = `search:${hashSearchParams(query, filters)}`;

  const entry: SearchCacheEntry = {
    query,
    filters,
    results,
    timestamp: Date.now(),
    ttl: ttlSeconds
  };

  try {
    await redis.setex(cacheKey, ttlSeconds, JSON.stringify(entry));
    console.log('✅ Search results cached:', query);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

function hashSearchParams(query: string, filters: SearchFilters): string {
  const params = {
    q: query.toLowerCase().trim(),
    ...filters
  };

  return createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .slice(0, 16);
}
```

**TTL Strategy:**
- Search Results: 5 minutes (fresh enough, not too stale)
- Popular Queries: 15 minutes (more stable)
- Invalidation: On new experience submission in same category

**Invalidation Logic:**

```typescript
// lib/cache/invalidation.ts

export async function invalidateSearchCache(
  category?: string,
  location?: string
): Promise<void> {

  // Pattern-based deletion for Redis
  const patterns = [
    category ? `search:*category:${category}*` : null,
    location ? `search:*location:${location}*` : null
  ].filter(Boolean) as string[];

  for (const pattern of patterns) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✅ Invalidated ${keys.length} search cache entries`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Call after experience submission
export async function onExperienceSubmitted(experience: Experience) {
  await invalidateSearchCache(
    experience.category,
    experience.location_name
  );
}
```

---

### 3. Pattern Cache

**Problem:** Pattern Detection ist teuer (clustering, statistics)

**Solution:** Aggressive Caching mit langer TTL

```typescript
// lib/cache/pattern-cache.ts

interface PatternCacheEntry {
  patternType: string;
  category: string;
  patterns: any[];
  computeTimeMs: number;
  timestamp: number;
}

export async function getCachedPattern(
  patternType: string,
  category: string
): Promise<any[] | null> {

  const cacheKey = `pattern:${patternType}:${category}`;

  try {
    const cached = await redis.get<PatternCacheEntry>(cacheKey);

    if (cached) {
      const ageHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);

      // Patterns valid for 24h (data doesn't change often)
      if (ageHours < 24) {
        console.log(`✅ Pattern cache HIT: ${patternType} (${ageHours.toFixed(1)}h old)`);
        return cached.patterns;
      }
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  return null;
}

export async function setCachedPattern(
  patternType: string,
  category: string,
  patterns: any[],
  computeTimeMs: number
): Promise<void> {

  const cacheKey = `pattern:${patternType}:${category}`;
  const ttl = 60 * 60 * 24; // 24 hours

  const entry: PatternCacheEntry = {
    patternType,
    category,
    patterns,
    computeTimeMs,
    timestamp: Date.now()
  };

  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(entry));
    console.log(`✅ Pattern cached: ${patternType} (compute: ${computeTimeMs}ms)`);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

// Wrapper for pattern detection functions
export async function detectPatternsWithCache<T>(
  patternType: string,
  category: string,
  detectFn: () => Promise<T>
): Promise<T> {

  // Try cache first
  const cached = await getCachedPattern(patternType, category);
  if (cached) return cached as T;

  // Compute
  const startTime = Date.now();
  const patterns = await detectFn();
  const computeTime = Date.now() - startTime;

  // Cache
  await setCachedPattern(patternType, category, patterns as any[], computeTime);

  return patterns;
}
```

**Usage Example:**

```typescript
// lib/patterns/temporal-detector.ts

export async function detectTemporalClusters(category: string) {
  return detectPatternsWithCache(
    'temporal',
    category,
    async () => {
      // Actual clustering logic here
      const { data } = await supabase.rpc('detect_temporal_clusters', {
        p_category: category
      });
      return data;
    }
  );
}
```

---

### 4. LRU Cache for Hot Embeddings

**Problem:** Some queries are VERY popular → Redis Latency adds up

**Solution:** In-Memory LRU Cache (nur für Top 1000 Queries)

```typescript
// lib/cache/lru-embedding-cache.ts

interface LRUNode<T> {
  key: string;
  value: T;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, LRUNode<T>>;
  private head: LRUNode<T> | null;
  private tail: LRUNode<T> | null;
  private hits: number = 0;
  private misses: number = 0;

  constructor(capacity: number = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      return null;
    }

    this.hits++;

    // Move to front (most recently used)
    this.moveToFront(node);

    return node.value;
  }

  set(key: string, value: T): void {
    const existing = this.cache.get(key);

    if (existing) {
      existing.value = value;
      this.moveToFront(existing);
      return;
    }

    // Create new node
    const newNode: LRUNode<T> = {
      key,
      value,
      prev: null,
      next: this.head
    };

    if (this.head) {
      this.head.prev = newNode;
    }

    this.head = newNode;

    if (!this.tail) {
      this.tail = newNode;
    }

    this.cache.set(key, newNode);

    // Evict LRU if over capacity
    if (this.cache.size > this.capacity) {
      this.evictLRU();
    }
  }

  private moveToFront(node: LRUNode<T>): void {
    if (node === this.head) return;

    // Remove from current position
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    if (node === this.tail) {
      this.tail = node.prev;
    }

    // Move to front
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;
  }

  private evictLRU(): void {
    if (!this.tail) return;

    const evicted = this.tail;
    this.cache.delete(evicted.key);

    if (evicted.prev) {
      evicted.prev.next = null;
      this.tail = evicted.prev;
    } else {
      this.head = null;
      this.tail = null;
    }

    console.log('🗑️ LRU evicted:', evicted.key);
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  stats(): { hits: number; misses: number; hitRate: number; size: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      size: this.cache.size
    };
  }
}

// Global in-memory LRU cache for embeddings
const embeddingLRU = new LRUCache<number[]>(1000);

export async function getEmbeddingWithLRU(query: string): Promise<number[] | null> {
  const key = hashQuery(query);

  // 1. Try LRU (in-memory, fastest)
  const lruResult = embeddingLRU.get(key);
  if (lruResult) {
    console.log('⚡ LRU cache HIT:', query.slice(0, 50));
    return lruResult;
  }

  // 2. Try Redis (network, slower)
  const redisResult = await getCachedEmbedding(query);
  if (redisResult) {
    // Populate LRU for next time
    embeddingLRU.set(key, redisResult);
    return redisResult;
  }

  return null;
}

export function setEmbeddingInLRU(query: string, embedding: number[]): void {
  const key = hashQuery(query);
  embeddingLRU.set(key, embedding);
}

export function getLRUStats() {
  return embeddingLRU.stats();
}
```

---

### 5. Rate Limiting Cache

**Problem:** OpenAI Rate Limits (3000 RPM) → Need Tracking

**Solution:** Redis-based Rate Limiter mit Sliding Window

```typescript
// lib/cache/rate-limiter.ts

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  identifier: string, // user ID or IP
  limit: number = 60, // requests
  windowSeconds: number = 60 // per minute
): Promise<RateLimitResult> {

  const key = `rate:${identifier}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);

  try {
    // Remove old entries outside window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcard(key);

    if (count >= limit) {
      // Get oldest timestamp in window
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      const resetAt = oldest[0]?.score ? oldest[0].score + (windowSeconds * 1000) : now + (windowSeconds * 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on key
    await redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: limit - (count + 1),
      resetAt: now + (windowSeconds * 1000)
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open (allow request on error)
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + (windowSeconds * 1000)
    };
  }
}

// Middleware for API routes
export function withRateLimit(
  limit: number = 60,
  windowSeconds: number = 60
) {
  return async (req: Request) => {
    const identifier = req.headers.get('x-user-id') || req.headers.get('x-forwarded-for') || 'anonymous';

    const result = await checkRateLimit(identifier, limit, windowSeconds);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetAt: result.resetAt
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString()
          }
        }
      );
    }

    // Add rate limit headers
    return {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString()
      }
    };
  };
}
```

**Usage in API Route:**

```typescript
// app/api/chat/route.ts

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitResult = await withRateLimit(60, 60)(req);

  if (rateLimitResult instanceof Response) {
    return rateLimitResult; // 429 response
  }

  // Process request...
}
```

---

### 6. Vercel Edge Config (Feature Flags)

**Problem:** Need to toggle features without deploy

**Solution:** Edge Config for instant global updates

```typescript
// lib/cache/edge-config.ts
import { get } from '@vercel/edge-config';

interface FeatureFlags {
  enablePatternDetection: boolean;
  enableLLMSimilarity: boolean;
  maxSearchResults: number;
  embeddingModel: string;
  rateLimitPerMinute: number;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const flags = await get<FeatureFlags>('feature-flags');

    return flags || {
      enablePatternDetection: true,
      enableLLMSimilarity: true,
      maxSearchResults: 50,
      embeddingModel: 'text-embedding-3-small',
      rateLimitPerMinute: 60
    };
  } catch (error) {
    console.error('Edge Config error:', error);
    return {
      enablePatternDetection: true,
      enableLLMSimilarity: true,
      maxSearchResults: 50,
      embeddingModel: 'text-embedding-3-small',
      rateLimitPerMinute: 60
    };
  }
}

export async function isFeatureEnabled(feature: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return Boolean(flags[feature]);
}
```

**Setup Vercel Edge Config:**

```bash
# Install CLI
npm i -g vercel

# Create Edge Config
vercel edge-config create xpshare-features

# Set initial values
vercel edge-config set feature-flags '{
  "enablePatternDetection": true,
  "enableLLMSimilarity": true,
  "maxSearchResults": 50,
  "embeddingModel": "text-embedding-3-small",
  "rateLimitPerMinute": 60
}'
```

---

## 🔄 Cache Invalidation Strategy

### When to Invalidate

```typescript
// lib/cache/invalidation-rules.ts

export const INVALIDATION_RULES = {
  // Experience CRUD
  onExperienceCreate: ['search', 'pattern'],
  onExperienceUpdate: ['search', 'pattern', 'similarity'],
  onExperienceDelete: ['search', 'pattern', 'similarity'],

  // User actions
  onUserLike: [], // Don't invalidate (minor signal)
  onUserReport: ['similarity'], // Remove from similar

  // System events
  onModelUpdate: ['embedding'], // Rare!
  onSchemaChange: ['all']
};

export async function invalidateOnEvent(
  event: keyof typeof INVALIDATION_RULES,
  context: {
    experienceId?: string;
    category?: string;
    location?: string;
  }
): Promise<void> {

  const caches = INVALIDATION_RULES[event];

  for (const cache of caches) {
    switch (cache) {
      case 'search':
        await invalidateSearchCache(context.category, context.location);
        break;

      case 'pattern':
        if (context.category) {
          await redis.del(`pattern:*:${context.category}*`);
        }
        break;

      case 'similarity':
        if (context.experienceId) {
          await redis.del(`similarity:${context.experienceId}`);
        }
        break;

      case 'embedding':
        await redis.del('embedding:*');
        embeddingLRU.clear();
        break;

      case 'all':
        await redis.flushdb();
        break;
    }
  }

  console.log(`✅ Cache invalidated for event: ${event}`);
}
```

---

## 📊 Monitoring & Analytics

### Cache Performance Tracking

```typescript
// lib/cache/analytics.ts

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgResponseTime: number;
  totalRequests: number;
}

export async function trackCacheMetrics(
  cacheType: 'embedding' | 'search' | 'pattern',
  isHit: boolean,
  responseTimeMs: number
): Promise<void> {

  const key = `metrics:${cacheType}:${getDateKey()}`;

  await redis.hincrby(key, isHit ? 'hits' : 'misses', 1);
  await redis.hincrby(key, 'totalTime', responseTimeMs);
  await redis.hincrby(key, 'totalRequests', 1);

  // Expire after 30 days
  await redis.expire(key, 60 * 60 * 24 * 30);
}

export async function getCacheMetrics(
  cacheType: 'embedding' | 'search' | 'pattern',
  daysBack: number = 7
): Promise<CacheMetrics[]> {

  const metrics: CacheMetrics[] = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = `metrics:${cacheType}:${getDateKey(date)}`;

    const data = await redis.hgetall(key);

    if (data) {
      const hits = parseInt(data.hits || '0');
      const misses = parseInt(data.misses || '0');
      const totalTime = parseInt(data.totalTime || '0');
      const totalRequests = hits + misses;

      metrics.push({
        hits,
        misses,
        hitRate: totalRequests > 0 ? hits / totalRequests : 0,
        avgResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
        totalRequests
      });
    }
  }

  return metrics;
}

function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
```

### Dashboard Endpoint

```typescript
// app/api/admin/cache-stats/route.ts

export async function GET() {
  const [embeddingMetrics, searchMetrics, patternMetrics] = await Promise.all([
    getCacheMetrics('embedding', 7),
    getCacheMetrics('search', 7),
    getCacheMetrics('pattern', 7)
  ]);

  const lruStats = getLRUStats();

  return Response.json({
    embedding: {
      weekly: embeddingMetrics,
      lru: lruStats
    },
    search: {
      weekly: searchMetrics
    },
    pattern: {
      weekly: patternMetrics
    },
    summary: {
      overallHitRate: calculateOverallHitRate([embeddingMetrics, searchMetrics, patternMetrics]),
      estimatedCostSavings: calculateCostSavings(embeddingMetrics)
    }
  });
}

function calculateOverallHitRate(metricsArrays: CacheMetrics[][]): number {
  let totalHits = 0;
  let totalRequests = 0;

  metricsArrays.forEach(metrics => {
    metrics.forEach(m => {
      totalHits += m.hits;
      totalRequests += m.totalRequests;
    });
  });

  return totalRequests > 0 ? totalHits / totalRequests : 0;
}

function calculateCostSavings(embeddingMetrics: CacheMetrics[]): number {
  const totalHits = embeddingMetrics.reduce((sum, m) => sum + m.hits, 0);
  const costPerEmbedding = 0.00002; // OpenAI pricing
  return totalHits * costPerEmbedding;
}
```

---

## 💰 Cost Impact Analysis

### Without Caching

```
Monthly Queries:        30,000
Embedding Cost:         30,000 × $0.00002 = $0.60
Search Compute:         30,000 × 100ms = 50 min
Pattern Detection:      1,000 × 5s = 83 min
```

### With Caching (80% Hit Rate)

```
Actual API Calls:       6,000 (20% cache miss)
Embedding Cost:         6,000 × $0.00002 = $0.12  (🎉 80% reduction!)
Search Compute:         6,000 × 100ms = 10 min     (🎉 80% reduction!)
Pattern Detection:      200 × 5s = 17 min          (🎉 80% reduction!)
Redis Cost:             $10/month (Upstash Pro)

Total Savings:          $0.48/mo + Compute Time
```

**ROI:** Redis costs $10/mo, saves $0.48 + massive compute time → Worth it!

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Setup Upstash Redis (or Vercel KV)
- [ ] Implement embedding cache (get/set)
- [ ] Add LRU cache for hot embeddings
- [ ] Test cache hit/miss tracking

### Phase 2: Search & Patterns (Week 2)
- [ ] Implement search results cache
- [ ] Add pattern detection cache
- [ ] Setup invalidation rules
- [ ] Test invalidation on CRUD

### Phase 3: Rate Limiting (Week 3)
- [ ] Implement rate limiter with Redis
- [ ] Add middleware to API routes
- [ ] Setup Vercel Edge Config
- [ ] Test feature flag toggles

### Phase 4: Monitoring (Week 4)
- [ ] Add cache metrics tracking
- [ ] Build admin dashboard
- [ ] Setup alerts for low hit rate
- [ ] Document cache strategy

---

## 🛠️ Environment Setup

```bash
# Install dependencies
npm install @upstash/redis @vercel/edge-config

# Vercel KV (alternative to Upstash)
# vercel link
# vercel env pull

# Upstash Redis (recommended)
# 1. Create account at upstash.com
# 2. Create Redis database
# 3. Copy REST URL and Token
```

**.env.local:**

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Vercel Edge Config
EDGE_CONFIG=https://edge-config.vercel.com/xxx
```

**lib/redis.ts:**

```typescript
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// Test connection
redis.ping().then(() => {
  console.log('✅ Redis connected');
}).catch((error) => {
  console.error('❌ Redis connection failed:', error);
});
```

---

## 📈 Success Metrics

**Target Metrics (after 1 month):**

1. **Cache Hit Rate**
   - Embedding: >70%
   - Search: >50%
   - Pattern: >80%

2. **Response Time**
   - Cache Hit: <200ms
   - Cache Miss: <3s

3. **Cost Savings**
   - Embedding API calls: -80%
   - Monthly savings: >$50 at scale

4. **Rate Limit Hits**
   - <1% of requests hit rate limit

---

## 📝 Notes & Learnings

### What Makes Caching Work:

1. **Layer Correctly** - LRU → Redis → Database
2. **TTL Wisely** - Embeddings 30d, Search 5m, Patterns 24h
3. **Invalidate Smartly** - Only when necessary
4. **Monitor Always** - Hit rate tells you everything
5. **Fail Gracefully** - Cache miss = Fallback, not error

### Common Pitfalls:

- ❌ Over-caching → Stale data
- ❌ Under-caching → High costs
- ❌ No invalidation → Wrong results
- ❌ No monitoring → Blind optimization

---

**Ready für Implementation? → [TODO-MASTER.md](./TODO-MASTER.md) Phase 3-4**
