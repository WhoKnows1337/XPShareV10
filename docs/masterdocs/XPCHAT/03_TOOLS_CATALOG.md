# XPShare AI - Complete Tools Catalog

**Version:** 1.0
**Related:** 02_AGENT_SYSTEM.md, 04_DATABASE_LAYER.md, 08_CODE_EXAMPLES.md

---

## 📚 Tool Categories Overview

```
🔍 SEARCH & FILTER (5 Tools)
├─ advanced_search
├─ search_by_attributes
├─ semantic_search
├─ full_text_search
└─ geo_search

📊 AGGREGATION & ANALYTICS (5 Tools)
├─ rank_users
├─ analyze_category
├─ compare_categories
├─ temporal_analysis
└─ attribute_correlation

🔗 RELATIONSHIPS & PATTERNS (4 Tools)
├─ find_connections
├─ detect_patterns
├─ cluster_analysis
└─ user_similarity

🎨 VISUALIZATION (4 Tools)
├─ generate_map
├─ generate_timeline
├─ generate_network
└─ generate_dashboard

💡 ADVANCED FEATURES (4 Tools)
├─ generate_insights
├─ predict_trends
├─ suggest_followups
└─ export_results

🛠️ UTILITY (4 Tools)
├─ get_experience_details
├─ get_user_profile
├─ get_category_schema
└─ validate_query
```

---

## 🔍 SEARCH & FILTER TOOLS

### 1. advanced_search

**Purpose:** Multi-dimensional search with complex filtering

**Implementation:**

```typescript
// lib/tools/search/advanced-search.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const advancedSearchSchema = z.object({
  categories: z.array(z.string()).optional().describe('Category slugs to filter by'),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    radius: z.number().optional().describe('Radius in kilometers'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  timeRange: z.object({
    from: z.string().describe('HH:MM format'),
    to: z.string().describe('HH:MM format'),
  }).optional(),
  dateRange: z.object({
    from: z.string().describe('ISO date'),
    to: z.string().describe('ISO date'),
  }).optional(),
  attributes: z.array(z.object({
    key: z.string(),
    value: z.any(),
    operator: z.enum(['equals', 'contains', 'gt', 'lt', 'gte', 'lte']),
  })).optional(),
  tags: z.array(z.string()).optional(),
  emotions: z.array(z.string()).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const advancedSearchTool = tool({
  description: 'Search experiences with multi-dimensional filters. Supports categories, locations, time ranges, attributes, tags, and emotions.',
  parameters: advancedSearchSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from('experiences')
      .select(`
        id,
        title,
        description,
        category,
        category_slug,
        location_text,
        latitude,
        longitude,
        date_occurred,
        time_of_day,
        tags,
        emotions,
        user_id,
        created_at,
        experience_attributes (
          attribute_key,
          attribute_value,
          confidence
        )
      `)

    // Category filter
    if (params.categories && params.categories.length > 0) {
      query = query.in('category_slug', params.categories)
    }

    // Location text filter
    if (params.location?.city) {
      query = query.ilike('location_text', `%${params.location.city}%`)
    }

    if (params.location?.country) {
      query = query.ilike('location_text', `%${params.location.country}%`)
    }

    // Time range filter
    if (params.timeRange) {
      query = query
        .gte('time_of_day', params.timeRange.from)
        .lte('time_of_day', params.timeRange.to)
    }

    // Date range filter
    if (params.dateRange) {
      query = query
        .gte('date_occurred', params.dateRange.from)
        .lte('date_occurred', params.dateRange.to)
    }

    // Tags filter (overlaps = contains any of the tags)
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags)
    }

    // Emotions filter
    if (params.emotions && params.emotions.length > 0) {
      query = query.overlaps('emotions', params.emotions)
    }

    // Pagination
    query = query.range(params.offset, params.offset + params.limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Advanced search failed: ${error.message}`)
    }

    // Post-filter by attributes
    let results = data || []

    if (params.attributes && params.attributes.length > 0) {
      results = results.filter((exp) => {
        const expAttrs = exp.experience_attributes || []

        return params.attributes!.every((filter) => {
          const attr = expAttrs.find((a) => a.attribute_key === filter.key)
          if (!attr) return false

          // Check confidence if specified
          if (params.minConfidence && attr.confidence < params.minConfidence) {
            return false
          }

          // Apply operator
          switch (filter.operator) {
            case 'equals':
              return attr.attribute_value === filter.value
            case 'contains':
              return String(attr.attribute_value).toLowerCase().includes(
                String(filter.value).toLowerCase()
              )
            case 'gt':
              return Number(attr.attribute_value) > Number(filter.value)
            case 'lt':
              return Number(attr.attribute_value) < Number(filter.value)
            case 'gte':
              return Number(attr.attribute_value) >= Number(filter.value)
            case 'lte':
              return Number(attr.attribute_value) <= Number(filter.value)
            default:
              return false
          }
        })
      })
    }

    // Post-filter by geographic radius
    if (params.location?.radius && params.location?.lat && params.location?.lng) {
      results = results.filter((exp) => {
        if (!exp.latitude || !exp.longitude) return false
        const distance = calculateDistance(
          params.location!.lat!,
          params.location!.lng!,
          exp.latitude,
          exp.longitude
        )
        return distance <= params.location!.radius!
      })
    }

    return {
      results: results.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description?.substring(0, 200),
        category: exp.category_slug,
        location: exp.location_text,
        date: exp.date_occurred,
        time: exp.time_of_day,
        tags: exp.tags,
        emotions: exp.emotions,
        attributes: exp.experience_attributes,
      })),
      count: results.length,
      hasMore: results.length === params.limit,
    }
  },
})

// Haversine distance formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}
```

---

### 2. search_by_attributes

**Purpose:** Find experiences with specific attribute combinations

**Implementation:**

```typescript
// lib/tools/search/search-by-attributes.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const searchByAttributesSchema = z.object({
  category: z.string().describe('Category slug (e.g., "dreams", "ufo")'),
  attributeFilters: z.array(z.object({
    key: z.string().describe('Attribute key (e.g., "dream_symbol", "ufo_shape")'),
    value: z.any().describe('Attribute value to match'),
    operator: z.enum(['equals', 'contains', 'exists']).default('equals'),
  })),
  logic: z.enum(['AND', 'OR']).default('AND').describe('How to combine filters'),
  minConfidence: z.number().min(0).max(1).optional(),
  limit: z.number().min(1).max(100).default(50),
})

export const searchByAttributesTool = tool({
  description: 'Find experiences with specific attributes. Example: "dreams with dream_symbol=bird AND dream_emotion=peaceful"',
  parameters: searchByAttributesSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Call database function (to be created)
    const { data, error } = await supabase.rpc('search_by_attributes', {
      p_category: params.category,
      p_attribute_filters: params.attributeFilters,
      p_logic: params.logic,
      p_min_confidence: params.minConfidence || 0,
      p_limit: params.limit,
    })

    if (error) {
      throw new Error(`Attribute search failed: ${error.message}`)
    }

    return {
      results: data || [],
      count: data?.length || 0,
      filters_applied: params.attributeFilters,
      logic: params.logic,
    }
  },
})
```

**Required Database Function:**

```sql
-- See 04_DATABASE_LAYER.md for full implementation
CREATE OR REPLACE FUNCTION search_by_attributes(
  p_category TEXT,
  p_attribute_filters JSONB,
  p_logic TEXT DEFAULT 'AND',
  p_min_confidence FLOAT DEFAULT 0,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  matched_attributes JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Implementation in 04_DATABASE_LAYER.md
END;
$$;
```

---

### 3. semantic_search

**Purpose:** Vector similarity search with reranking

**Implementation:**

```typescript
// lib/tools/search/semantic-search.ts
import { tool } from 'ai'
import { z } from 'zod'
import { generateEmbedding } from '@/lib/openai/client'
import { hybridSearch } from '@/lib/search/hybrid'

const semanticSearchSchema = z.object({
  query: z.string().describe('Natural language search query'),
  categories: z.array(z.string()).optional(),
  maxResults: z.number().min(1).max(100).default(20),
  similarityThreshold: z.number().min(0).max(1).default(0.7),
  useReranking: z.boolean().default(true),
})

export const semanticSearchTool = tool({
  description: 'Semantic search using embeddings. Best for finding conceptually similar experiences.',
  parameters: semanticSearchSchema,
  execute: async (params) => {
    // Generate embedding for query
    const embedding = await generateEmbedding(params.query)

    // Hybrid search combines vector + full-text + filters
    const results = await hybridSearch({
      embedding,
      query: params.query,
      filters: {
        categories: params.categories,
      },
      maxResults: params.maxResults,
      similarityThreshold: params.similarityThreshold,
      useReranking: params.useReranking,
    })

    return {
      results: results.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description?.substring(0, 200),
        category: r.category_slug,
        similarity: r.similarity_score,
        rank: r.rank_score,
      })),
      count: results.length,
      query: params.query,
    }
  },
})
```

---

### 4. full_text_search

**Purpose:** PostgreSQL full-text search

**Implementation:**

```typescript
// lib/tools/search/full-text-search.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const fullTextSearchSchema = z.object({
  query: z.string(),
  categories: z.array(z.string()).optional(),
  language: z.enum(['english', 'german']).default('english'),
  limit: z.number().min(1).max(100).default(50),
})

export const fullTextSearchTool = tool({
  description: 'Full-text search in titles and descriptions using PostgreSQL FTS',
  parameters: fullTextSearchSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from('experiences')
      .select('id, title, description, category_slug, location_text, date_occurred')
      .textSearch('fts', params.query, {
        type: 'websearch',
        config: params.language,
      })

    if (params.categories && params.categories.length > 0) {
      query = query.in('category_slug', params.categories)
    }

    query = query.limit(params.limit)

    const { data, error } = await query

    if (error) {
      throw new Error(`Full-text search failed: ${error.message}`)
    }

    return {
      results: data || [],
      count: data?.length || 0,
      query: params.query,
    }
  },
})
```

---

### 5. geo_search

**Purpose:** Geographic search within radius or bounding box

**Implementation:**

```typescript
// lib/tools/search/geo-search.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const geoSearchSchema = z.object({
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  radius: z.number().optional().describe('Radius in kilometers'),
  boundingBox: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  limit: z.number().min(1).max(200).default(100),
})

export const geoSearchTool = tool({
  description: 'Geographic search within radius or bounding box',
  parameters: geoSearchSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Use PostGIS extension for geographic queries
    const { data, error } = await supabase.rpc('geo_search', {
      p_center_lat: params.center?.lat,
      p_center_lng: params.center?.lng,
      p_radius_km: params.radius,
      p_bounding_box: params.boundingBox,
      p_categories: params.categories,
      p_limit: params.limit,
    })

    if (error) {
      throw new Error(`Geo search failed: ${error.message}`)
    }

    return {
      results: data || [],
      count: data?.length || 0,
      searchArea: params.radius
        ? `${params.radius}km radius`
        : 'bounding box',
    }
  },
})
```

---

## 📊 AGGREGATION & ANALYTICS TOOLS

### 6. rank_users

**Purpose:** Get top users by various metrics

**Implementation:**

```typescript
// lib/tools/analytics/rank-users.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const rankUsersSchema = z.object({
  metric: z.enum([
    'experience_count',
    'category_count',
    'total_xp',
    'contribution_score',
  ]),
  filters: z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    dateRange: z.object({
      from: z.string(),
      to: z.string(),
    }).optional(),
  }).optional(),
  topN: z.number().min(1).max(100).default(10),
})

export const rankUsersTool = tool({
  description: 'Get top users ranked by experience count, XP, or other metrics',
  parameters: rankUsersSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        avatar_url,
        location_city,
        location_country,
        total_experiences,
        total_xp,
        created_at
      `)

    // Apply location filter
    if (params.filters?.location) {
      query = query.or(
        `location_city.ilike.%${params.filters.location}%,location_country.ilike.%${params.filters.location}%`
      )
    }

    // Determine order by column
    const orderBy =
      params.metric === 'experience_count'
        ? 'total_experiences'
        : params.metric === 'total_xp'
        ? 'total_xp'
        : 'total_experiences'

    query = query.order(orderBy, { ascending: false }).limit(params.topN)

    const { data: users, error } = await query

    if (error) {
      throw new Error(`User ranking failed: ${error.message}`)
    }

    // If filtering by category or date range, need to count experiences manually
    if (params.filters?.category || params.filters?.dateRange) {
      const enrichedUsers = await Promise.all(
        (users || []).map(async (user) => {
          let expQuery = supabase
            .from('experiences')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (params.filters?.category) {
            expQuery = expQuery.eq('category_slug', params.filters.category)
          }

          if (params.filters?.dateRange) {
            expQuery = expQuery
              .gte('date_occurred', params.filters.dateRange.from)
              .lte('date_occurred', params.filters.dateRange.to)
          }

          const { count } = await expQuery

          return {
            ...user,
            filtered_experience_count: count || 0,
          }
        })
      )

      // Re-sort by filtered count
      enrichedUsers.sort(
        (a, b) => b.filtered_experience_count - a.filtered_experience_count
      )

      return {
        users: enrichedUsers,
        count: enrichedUsers.length,
        metric: params.metric,
        filters: params.filters,
      }
    }

    return {
      users: users || [],
      count: users?.length || 0,
      metric: params.metric,
    }
  },
})
```

---

### 7. analyze_category

**Purpose:** Deep dive into a single category

**Implementation:**

```typescript
// lib/tools/analytics/analyze-category.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const analyzeCategorySchema = z.object({
  category: z.string(),
  includeAttributes: z.boolean().default(true),
  includeTemporal: z.boolean().default(true),
  includeGeographic: z.boolean().default(true),
})

export const analyzeCategoryTool = tool({
  description: 'Comprehensive analysis of a single category',
  parameters: analyzeCategorySchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Get category info
    const { data: category } = await supabase
      .from('question_categories')
      .select('*')
      .eq('slug', params.category)
      .single()

    // Get total count
    const { count: totalCount } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('category_slug', params.category)

    const analysis: any = {
      category: category?.name,
      slug: params.category,
      total_experiences: totalCount || 0,
    }

    // Attribute analysis
    if (params.includeAttributes) {
      const { data: attributes } = await supabase
        .from('experience_attributes')
        .select('attribute_key, attribute_value, confidence')
        .in(
          'experience_id',
          supabase
            .from('experiences')
            .select('id')
            .eq('category_slug', params.category)
        )

      // Count attribute occurrences
      const attrCounts = new Map<string, Map<any, number>>()

      attributes?.forEach((attr) => {
        if (!attrCounts.has(attr.attribute_key)) {
          attrCounts.set(attr.attribute_key, new Map())
        }
        const valueMap = attrCounts.get(attr.attribute_key)!
        valueMap.set(
          attr.attribute_value,
          (valueMap.get(attr.attribute_value) || 0) + 1
        )
      })

      analysis.top_attributes = Array.from(attrCounts.entries()).map(
        ([key, valueMap]) => ({
          key,
          values: Array.from(valueMap.entries())
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        })
      )
    }

    // Temporal analysis
    if (params.includeTemporal) {
      const { data: experiences } = await supabase
        .from('experiences')
        .select('date_occurred, time_of_day')
        .eq('category_slug', params.category)
        .not('date_occurred', 'is', null)

      // Group by month
      const monthCounts = new Map<string, number>()
      experiences?.forEach((exp) => {
        const month = exp.date_occurred.substring(0, 7)
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
      })

      analysis.temporal_distribution = Array.from(monthCounts.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
    }

    // Geographic analysis
    if (params.includeGeographic) {
      const { data: experiences } = await supabase
        .from('experiences')
        .select('location_text, latitude, longitude')
        .eq('category_slug', params.category)
        .not('location_text', 'is', null)

      // Extract cities
      const cityCounts = new Map<string, number>()
      experiences?.forEach((exp) => {
        if (exp.location_text) {
          cityCounts.set(
            exp.location_text,
            (cityCounts.get(exp.location_text) || 0) + 1
          )
        }
      })

      analysis.top_locations = Array.from(cityCounts.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      analysis.total_with_geo = experiences?.filter(
        (e) => e.latitude && e.longitude
      ).length
    }

    return analysis
  },
})
```

---

### 8. compare_categories

**Purpose:** Compare multiple categories side by side

**Implementation:**

```typescript
// lib/tools/analytics/compare-categories.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const compareCategoriesSchema = z.object({
  categories: z.array(z.string()).min(2).max(5),
  metrics: z.array(
    z.enum([
      'experience_count',
      'user_count',
      'avg_attributes',
      'geographic_spread',
      'temporal_distribution',
    ])
  ),
})

export const compareCategoriesTool = tool({
  description: 'Compare multiple categories across various metrics',
  parameters: compareCategoriesSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    const comparisons = await Promise.all(
      params.categories.map(async (category) => {
        const metrics: any = { category }

        // Experience count
        if (params.metrics.includes('experience_count')) {
          const { count } = await supabase
            .from('experiences')
            .select('*', { count: 'exact', head: true })
            .eq('category_slug', category)
          metrics.experience_count = count || 0
        }

        // Unique user count
        if (params.metrics.includes('user_count')) {
          const { data } = await supabase
            .from('experiences')
            .select('user_id')
            .eq('category_slug', category)
          metrics.user_count = new Set(data?.map((e) => e.user_id)).size
        }

        // Avg attributes per experience
        if (params.metrics.includes('avg_attributes')) {
          const { data: experiences } = await supabase
            .from('experiences')
            .select('id')
            .eq('category_slug', category)

          if (experiences && experiences.length > 0) {
            const { count: attrCount } = await supabase
              .from('experience_attributes')
              .select('*', { count: 'exact', head: true })
              .in('experience_id', experiences.map((e) => e.id))

            metrics.avg_attributes = (attrCount || 0) / experiences.length
          } else {
            metrics.avg_attributes = 0
          }
        }

        // Geographic spread
        if (params.metrics.includes('geographic_spread')) {
          const { data } = await supabase
            .from('experiences')
            .select('location_text')
            .eq('category_slug', category)
            .not('location_text', 'is', null)

          metrics.unique_locations = new Set(
            data?.map((e) => e.location_text)
          ).size
        }

        return metrics
      })
    )

    return {
      comparisons,
      categories: params.categories,
      metrics: params.metrics,
    }
  },
})
```

---

### 9. temporal_analysis

**Purpose:** Analyze time-based patterns

**Implementation:**

```typescript
// lib/tools/analytics/temporal-analysis.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const temporalAnalysisSchema = z.object({
  categories: z.array(z.string()).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month', 'year']),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  groupBy: z.enum(['category', 'location', 'none']).default('none'),
})

export const temporalAnalysisTool = tool({
  description: 'Analyze temporal patterns and trends over time',
  parameters: temporalAnalysisSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from('experiences')
      .select('id, category_slug, date_occurred, time_of_day, location_text')
      .not('date_occurred', 'is', null)

    if (params.categories && params.categories.length > 0) {
      query = query.in('category_slug', params.categories)
    }

    if (params.dateRange) {
      query = query
        .gte('date_occurred', params.dateRange.from)
        .lte('date_occurred', params.dateRange.to)
    }

    const { data: experiences, error } = await query

    if (error) {
      throw new Error(`Temporal analysis failed: ${error.message}`)
    }

    // Group by time period
    const timeSeries = new Map<string, number>()

    experiences?.forEach((exp) => {
      let key: string

      switch (params.granularity) {
        case 'year':
          key = exp.date_occurred.substring(0, 4)
          break
        case 'month':
          key = exp.date_occurred.substring(0, 7)
          break
        case 'week':
          // Calculate ISO week
          const date = new Date(exp.date_occurred)
          const weekNum = getISOWeek(date)
          key = `${date.getFullYear()}-W${weekNum}`
          break
        case 'day':
          key = exp.date_occurred.substring(0, 10)
          break
        case 'hour':
          const hour = exp.time_of_day?.substring(0, 2) || '00'
          key = `${exp.date_occurred} ${hour}:00`
          break
      }

      // Group by additional dimension if specified
      if (params.groupBy !== 'none') {
        const groupKey =
          params.groupBy === 'category'
            ? exp.category_slug
            : exp.location_text || 'Unknown'
        key = `${key}|${groupKey}`
      }

      timeSeries.set(key, (timeSeries.get(key) || 0) + 1)
    })

    // Convert to array and sort
    const data = Array.from(timeSeries.entries()).map(([key, count]) => {
      if (params.groupBy !== 'none') {
        const [time, group] = key.split('|')
        return { time, group, count }
      }
      return { time: key, count }
    })

    data.sort((a, b) => a.time.localeCompare(b.time))

    return {
      data,
      granularity: params.granularity,
      groupBy: params.groupBy,
      totalPoints: data.length,
    }
  },
})

function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
```

---

### 10. attribute_correlation

**Purpose:** Find correlations between attributes

**Implementation:**

```typescript
// lib/tools/analytics/attribute-correlation.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const attributeCorrelationSchema = z.object({
  category: z.string().optional(),
  minOccurrences: z.number().min(2).default(3),
  topN: z.number().min(1).max(50).default(10),
})

export const attributeCorrelationTool = tool({
  description: 'Find attributes that frequently appear together',
  parameters: attributeCorrelationSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Get all experiences with their attributes
    let query = supabase
      .from('experiences')
      .select(`
        id,
        category_slug,
        experience_attributes (
          attribute_key,
          attribute_value
        )
      `)

    if (params.category) {
      query = query.eq('category_slug', params.category)
    }

    const { data: experiences, error } = await query

    if (error) {
      throw new Error(`Correlation analysis failed: ${error.message}`)
    }

    // Build co-occurrence matrix
    const cooccurrences = new Map<string, Map<string, number>>()

    experiences?.forEach((exp) => {
      const attrs = exp.experience_attributes || []

      // Compare each attribute pair
      for (let i = 0; i < attrs.length; i++) {
        for (let j = i + 1; j < attrs.length; j++) {
          const key1 = `${attrs[i].attribute_key}:${attrs[i].attribute_value}`
          const key2 = `${attrs[j].attribute_key}:${attrs[j].attribute_value}`

          // Create bidirectional mapping
          if (!cooccurrences.has(key1)) {
            cooccurrences.set(key1, new Map())
          }
          if (!cooccurrences.has(key2)) {
            cooccurrences.set(key2, new Map())
          }

          const map1 = cooccurrences.get(key1)!
          const map2 = cooccurrences.get(key2)!

          map1.set(key2, (map1.get(key2) || 0) + 1)
          map2.set(key1, (map2.get(key1) || 0) + 1)
        }
      }
    })

    // Find top correlations
    const correlations: Array<{
      attr1: string
      attr2: string
      count: number
      confidence: number
    }> = []

    cooccurrences.forEach((cooccurMap, attr1) => {
      cooccurMap.forEach((count, attr2) => {
        if (count >= params.minOccurrences) {
          // Calculate confidence (Jaccard similarity)
          const attr1Count = experiences?.filter((e) =>
            e.experience_attributes?.some((a) =>
              `${a.attribute_key}:${a.attribute_value}` === attr1
            )
          ).length || 0

          const attr2Count = experiences?.filter((e) =>
            e.experience_attributes?.some((a) =>
              `${a.attribute_key}:${a.attribute_value}` === attr2
            )
          ).length || 0

          const confidence = count / (attr1Count + attr2Count - count)

          correlations.push({
            attr1,
            attr2,
            count,
            confidence,
          })
        }
      })
    })

    // Sort by count and take top N
    correlations.sort((a, b) => b.count - a.count)
    const topCorrelations = correlations.slice(0, params.topN)

    return {
      correlations: topCorrelations,
      total_analyzed: experiences?.length || 0,
      min_occurrences: params.minOccurrences,
    }
  },
})
```

---

## 🔗 RELATIONSHIPS & PATTERNS TOOLS

### 11. find_connections

**Purpose:** Multi-dimensional similarity search

**Implementation:**

```typescript
// lib/tools/relationships/find-connections.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/openai/client'

const findConnectionsSchema = z.object({
  experienceId: z.string().uuid(),
  dimensions: z.array(
    z.enum(['semantic', 'geographic', 'temporal', 'attributes', 'tags'])
  ),
  weights: z.object({
    semantic: z.number().min(0).max(1).default(0.4),
    geographic: z.number().min(0).max(1).default(0.2),
    temporal: z.number().min(0).max(1).default(0.2),
    attributes: z.number().min(0).max(1).default(0.1),
    tags: z.number().min(0).max(1).default(0.1),
  }).optional(),
  maxResults: z.number().min(1).max(50).default(10),
  minSimilarity: z.number().min(0).max(1).default(0.5),
})

export const findConnectionsTool = tool({
  description: 'Find similar experiences using multiple dimensions',
  parameters: findConnectionsSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Get source experience
    const { data: source, error } = await supabase
      .from('experiences')
      .select(`
        *,
        experience_attributes (
          attribute_key,
          attribute_value
        )
      `)
      .eq('id', params.experienceId)
      .single()

    if (error || !source) {
      throw new Error(`Experience not found: ${params.experienceId}`)
    }

    const weights = params.weights || {
      semantic: 0.4,
      geographic: 0.2,
      temporal: 0.2,
      attributes: 0.1,
      tags: 0.1,
    }

    // Get candidate experiences (same category + nearby)
    const { data: candidates } = await supabase
      .from('experiences')
      .select(`
        *,
        experience_attributes (
          attribute_key,
          attribute_value
        )
      `)
      .eq('category_slug', source.category_slug)
      .neq('id', params.experienceId)
      .limit(200)

    if (!candidates || candidates.length === 0) {
      return { connections: [], count: 0 }
    }

    // Calculate multi-dimensional similarity
    const similarities = await Promise.all(
      candidates.map(async (candidate) => {
        let totalScore = 0
        const scores: any = {}

        // Semantic similarity (using embeddings)
        if (params.dimensions.includes('semantic') && source.embedding) {
          const similarity = await calculateEmbeddingSimilarity(
            source.embedding,
            candidate.embedding
          )
          scores.semantic = similarity
          totalScore += similarity * weights.semantic
        }

        // Geographic similarity
        if (
          params.dimensions.includes('geographic') &&
          source.latitude &&
          candidate.latitude
        ) {
          const distance = calculateDistance(
            source.latitude,
            source.longitude,
            candidate.latitude,
            candidate.longitude
          )
          // Convert distance to similarity (max 500km)
          const similarity = Math.max(0, 1 - distance / 500)
          scores.geographic = similarity
          totalScore += similarity * weights.geographic
        }

        // Temporal similarity
        if (
          params.dimensions.includes('temporal') &&
          source.date_occurred &&
          candidate.date_occurred
        ) {
          const daysDiff = Math.abs(
            new Date(source.date_occurred).getTime() -
            new Date(candidate.date_occurred).getTime()
          ) / (1000 * 60 * 60 * 24)
          // Convert to similarity (max 365 days)
          const similarity = Math.max(0, 1 - daysDiff / 365)
          scores.temporal = similarity
          totalScore += similarity * weights.temporal
        }

        // Attribute similarity
        if (params.dimensions.includes('attributes')) {
          const sourceAttrs = source.experience_attributes || []
          const candidateAttrs = candidate.experience_attributes || []

          const sharedAttrs = sourceAttrs.filter((sa) =>
            candidateAttrs.some(
              (ca) =>
                ca.attribute_key === sa.attribute_key &&
                ca.attribute_value === sa.attribute_value
            )
          ).length

          const totalAttrs = new Set([
            ...sourceAttrs.map((a) => a.attribute_key),
            ...candidateAttrs.map((a) => a.attribute_key),
          ]).size

          const similarity = totalAttrs > 0 ? sharedAttrs / totalAttrs : 0
          scores.attributes = similarity
          totalScore += similarity * weights.attributes
        }

        // Tag similarity
        if (params.dimensions.includes('tags')) {
          const sourceTags = source.tags || []
          const candidateTags = candidate.tags || []

          const sharedTags = sourceTags.filter((t) =>
            candidateTags.includes(t)
          ).length

          const totalTags = new Set([...sourceTags, ...candidateTags]).size
          const similarity = totalTags > 0 ? sharedTags / totalTags : 0
          scores.tags = similarity
          totalScore += similarity * weights.tags
        }

        return {
          experience: {
            id: candidate.id,
            title: candidate.title,
            description: candidate.description?.substring(0, 200),
            category: candidate.category_slug,
            location: candidate.location_text,
            date: candidate.date_occurred,
          },
          similarity: totalScore,
          breakdown: scores,
        }
      })
    )

    // Filter by minimum similarity and sort
    const connections = similarities
      .filter((s) => s.similarity >= params.minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, params.maxResults)

    return {
      connections,
      count: connections.length,
      source: {
        id: source.id,
        title: source.title,
      },
      dimensions: params.dimensions,
    }
  },
})

async function calculateEmbeddingSimilarity(
  embedding1: number[],
  embedding2: number[]
): Promise<number> {
  // Cosine similarity
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i]
    norm1 += embedding1[i] * embedding1[i]
    norm2 += embedding2[i] * embedding2[i]
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}
```

---

### 12. detect_patterns

**Purpose:** Automated pattern detection

**Implementation:**

```typescript
// lib/tools/relationships/detect-patterns.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const detectPatternsSchema = z.object({
  categories: z.array(z.string()).optional(),
  patternTypes: z.array(
    z.enum(['temporal', 'geographic', 'attribute', 'user_behavior'])
  ),
  minSupport: z.number().min(2).default(3).describe('Minimum occurrences'),
  minConfidence: z.number().min(0).max(1).default(0.7),
})

export const detectPatternsTool = tool({
  description: 'Detect patterns automatically in experiences',
  parameters: detectPatternsSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    const patterns: any[] = []

    // Temporal patterns
    if (params.patternTypes.includes('temporal')) {
      const { data } = await supabase
        .from('experiences')
        .select('category_slug, date_occurred, time_of_day')
        .not('date_occurred', 'is', null)

      // Find recurring time patterns
      const hourCounts = new Map<string, Map<number, number>>()

      data?.forEach((exp) => {
        if (exp.time_of_day) {
          const hour = parseInt(exp.time_of_day.substring(0, 2))
          if (!hourCounts.has(exp.category_slug)) {
            hourCounts.set(exp.category_slug, new Map())
          }
          const catMap = hourCounts.get(exp.category_slug)!
          catMap.set(hour, (catMap.get(hour) || 0) + 1)
        }
      })

      hourCounts.forEach((catMap, category) => {
        const totalForCategory = Array.from(catMap.values()).reduce(
          (a, b) => a + b,
          0
        )
        catMap.forEach((count, hour) => {
          const confidence = count / totalForCategory
          if (count >= params.minSupport && confidence >= params.minConfidence) {
            patterns.push({
              type: 'temporal',
              pattern: `${category} experiences peak at ${hour}:00`,
              category,
              hour,
              count,
              confidence,
            })
          }
        })
      })
    }

    // Geographic patterns (clustering)
    if (params.patternTypes.includes('geographic')) {
      const { data } = await supabase.rpc('detect_geo_clusters', {
        p_categories: params.categories,
        p_min_points: params.minSupport,
      })

      data?.forEach((cluster: any) => {
        patterns.push({
          type: 'geographic',
          pattern: `Cluster of ${cluster.category} experiences near ${cluster.center_lat}, ${cluster.center_lng}`,
          category: cluster.category,
          count: cluster.point_count,
          center: {
            lat: cluster.center_lat,
            lng: cluster.center_lng,
          },
          radius: cluster.radius_km,
        })
      })
    }

    // Attribute patterns
    if (params.patternTypes.includes('attribute')) {
      // Use attribute_correlation tool results
      // (Implementation similar to attribute_correlation)
    }

    return {
      patterns,
      count: patterns.length,
      types: params.patternTypes,
    }
  },
})
```

---

**(Continuing in next file due to length - this is 03_TOOLS_CATALOG.md Part 1)**

**Remaining tools to document:**
- cluster_analysis (Tool 13)
- user_similarity (Tool 14)
- generate_map (Tool 15)
- generate_timeline (Tool 16)
- generate_network (Tool 17)
- generate_dashboard (Tool 18)
- generate_insights (Tool 19)
- predict_trends (Tool 20)
- suggest_followups (Tool 21)
- export_results (Tool 22)
- get_experience_details (Tool 23)
- get_user_profile (Tool 24)
- get_category_schema (Tool 25)
- validate_query (Tool 26)

---

## Integration Example

```typescript
// lib/agents/query-agent.ts
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import {
  advancedSearchTool,
  searchByAttributesTool,
  semanticSearchTool,
  fullTextSearchTool,
  geoSearchTool,
  rankUsersTool,
  analyzeCategoryTool,
  compareCategoriesTool,
  temporalAnalysisTool,
  attributeCorrelationTool,
  findConnectionsTool,
  detectPatternsTool,
} from '@/lib/tools'

export class QueryAgent {
  async execute(task: string, parameters: any) {
    const { toolCalls } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: QUERY_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: `Task: ${task}\nParams: ${JSON.stringify(parameters)}` },
      ],
      tools: {
        advanced_search: advancedSearchTool,
        search_by_attributes: searchByAttributesTool,
        semantic_search: semanticSearchTool,
        full_text_search: fullTextSearchTool,
        geo_search: geoSearchTool,
        rank_users: rankUsersTool,
        analyze_category: analyzeCategoryTool,
        compare_categories: compareCategoriesTool,
        temporal_analysis: temporalAnalysisTool,
        attribute_correlation: attributeCorrelationTool,
        find_connections: findConnectionsTool,
        detect_patterns: detectPatternsTool,
      },
      maxSteps: 3,
    })

    return toolCalls
  }
}
```

---

**Next:** See 04_DATABASE_LAYER.md for required SQL functions and schema.
