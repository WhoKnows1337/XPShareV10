# XPChat 2.0 - Tool Specifications

**Last Updated:** 2025-10-24

This document provides detailed specifications for all 8 tools in XPChat 2.0.

---

## Tool Overview

| Tool | Type | Token Est. | Replaces | Purpose |
|------|------|-----------|----------|---------|
| unifiedSearch | Unified | ~150 | 5 tools | Intelligent search with all filter types |
| visualize | Unified | ~120 | 4 tools | Multi-type visualization generation |
| analyze | Unified | ~110 | 4 tools | Multi-mode data analysis |
| insights | Specialized | ~80 | 1 tool | AI-powered pattern detection |
| trends | Specialized | ~80 | 1 tool | Time-series forecasting |
| connections | Specialized | ~80 | 1 tool | Similarity & relationship finding |
| patterns | Specialized | ~80 | 1 tool | Anomaly detection |
| userStats | Specialized | ~80 | 1 tool | Community engagement metrics |

**Total: ~780 tokens** (vs. ~3,000 tokens before)

---

## 1. unifiedSearch Tool

### Purpose
Intelligent search combining text, geographic, temporal, semantic, and attribute-based filtering.

### Replaces
- advancedSearch
- searchByAttributes
- geoSearch
- fullTextSearch
- semanticSearch

### Schema
```typescript
const unifiedSearchSchema = z.object({
  query: z.string().optional()
    .describe('Free-text search query'),

  category: z.array(z.enum(['ufo-uap', 'dreams', 'psychic', 'nde', 'synchronicity', 'other']))
    .optional()
    .describe('Filter by experience categories'),

  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    radius: z.number().optional()
      .describe('Search radius in kilometers'),
    coordinates: z.tuple([z.number(), z.number()]).optional()
      .describe('[latitude, longitude]'),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional()
      .describe('[minLng, minLat, maxLng, maxLat]'),
  }).optional().describe('Geographic filtering'),

  timeRange: z.object({
    from: z.string().optional()
      .describe('ISO date string (e.g., "2024-01-01")'),
    to: z.string().optional()
      .describe('ISO date string'),
    granularity: z.enum(['hour', 'day', 'week', 'month', 'year']).optional()
      .describe('Temporal aggregation level'),
  }).optional().describe('Temporal filtering'),

  attributes: z.object({
    shapes: z.array(z.string()).optional()
      .describe('UFO shapes (for ufo-uap category)'),
    emotions: z.array(z.string()).optional()
      .describe('Emotions felt (for dreams/psychic categories)'),
    abilities: z.array(z.string()).optional()
      .describe('Psychic abilities (for psychic category)'),
  }).optional().describe('Category-specific attribute filters'),

  semantic: z.boolean().optional()
    .describe('Enable vector similarity search'),

  limit: z.number().min(1).max(100).default(50)
    .describe('Maximum number of results'),
})
```

### Tool Definition
```typescript
// lib/mastra/tools/unified-search.ts

import { createTool } from '@mastra/core'
import { z } from 'zod'
import type { XPShareContext } from '../context'

export const unifiedSearchTool = createTool<XPShareContext>({
  id: 'unifiedSearch',

  description: 'Search XPShare experiences with flexible filters (text, geo, temporal, semantic, attributes)',

  inputSchema: unifiedSearchSchema,

  execute: async ({ context, data }) => {
    const { supabase } = context

    // Start building query
    let query = supabase
      .from('experiences')
      .select('*')

    // Text search (full-text)
    if (data.query) {
      query = query.textSearch('fts', data.query, {
        type: 'websearch',
        config: 'english', // TODO: Support multi-language
      })
    }

    // Category filter
    if (data.category && data.category.length > 0) {
      query = query.in('category', data.category)
    }

    // Geographic filter
    if (data.location) {
      if (data.location.city) {
        query = query.ilike('location_text', `%${data.location.city}%`)
      }
      if (data.location.country) {
        query = query.ilike('location_text', `%${data.location.country}%`)
      }
      if (data.location.radius && data.location.coordinates) {
        // PostGIS radius search
        const [lat, lng] = data.location.coordinates
        query = query.rpc('experiences_within_radius', {
          lat,
          lng,
          radius_km: data.location.radius,
        })
      }
      if (data.location.bbox) {
        // PostGIS bounding box search
        const [minLng, minLat, maxLng, maxLat] = data.location.bbox
        query = query.rpc('experiences_within_bbox', {
          min_lng: minLng,
          min_lat: minLat,
          max_lng: maxLng,
          max_lat: maxLat,
        })
      }
    }

    // Temporal filter
    if (data.timeRange) {
      if (data.timeRange.from) {
        query = query.gte('experience_date', data.timeRange.from)
      }
      if (data.timeRange.to) {
        query = query.lte('experience_date', data.timeRange.to)
      }
    }

    // Attribute filters (JSONB queries)
    if (data.attributes) {
      if (data.attributes.shapes && data.attributes.shapes.length > 0) {
        query = query.contains('attributes', { shapes: data.attributes.shapes })
      }
      if (data.attributes.emotions && data.attributes.emotions.length > 0) {
        query = query.contains('attributes', { emotions: data.attributes.emotions })
      }
      if (data.attributes.abilities && data.abilities.length > 0) {
        query = query.contains('attributes', { abilities: data.attributes.abilities })
      }
    }

    // Semantic search (vector similarity)
    if (data.semantic && data.query) {
      // Generate embedding for query
      // Note: This requires an embedding model (OpenAI, etc.)
      // For now, skip or implement with context.embedder if available
      // query = query.rpc('match_experiences', {
      //   query_embedding: embedding,
      //   match_threshold: 0.7,
      //   match_count: data.limit,
      // })
    }

    // Limit
    query = query.limit(data.limit)

    // Execute query
    const { data: experiences, error } = await query

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    return {
      count: experiences.length,
      experiences,
      filters_applied: {
        text: !!data.query,
        category: !!data.category,
        location: !!data.location,
        timeRange: !!data.timeRange,
        attributes: !!data.attributes,
        semantic: data.semantic && !!data.query,
      },
    }
  },
})
```

### Usage Examples

**Simple Text Search:**
```json
{
  "query": "UFO sightings",
  "limit": 20
}
```

**Geographic Search:**
```json
{
  "category": ["ufo-uap"],
  "location": {
    "city": "Berlin",
    "radius": 50,
    "coordinates": [52.52, 13.405]
  }
}
```

**Complex Multi-Filter:**
```json
{
  "query": "bright lights",
  "category": ["ufo-uap"],
  "location": { "country": "Germany" },
  "timeRange": {
    "from": "2024-01-01",
    "to": "2024-12-31"
  },
  "attributes": {
    "shapes": ["triangle", "disc"]
  },
  "limit": 50
}
```

---

## 2. visualize Tool

### Purpose
Generate visualization data from experiences (map, timeline, network, dashboard).

### Replaces
- generateMap
- generateTimeline
- generateNetwork
- generateDashboard

### Schema
```typescript
const visualizeSchema = z.object({
  type: z.enum(['map', 'timeline', 'network', 'dashboard'])
    .describe('Type of visualization to generate'),

  experiences: z.array(z.any())
    .describe('Array of experiences to visualize'),

  config: z.object({
    map: z.object({
      heatmap: z.boolean().optional().default(false),
      markers: z.boolean().optional().default(true),
      cluster: z.boolean().optional().default(true),
    }).optional(),

    timeline: z.object({
      groupBy: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().default('month'),
    }).optional(),

    network: z.object({
      maxNodes: z.number().optional().default(50),
      linkThreshold: z.number().min(0).max(1).optional().default(0.7),
    }).optional(),

    dashboard: z.object({
      metrics: z.array(z.string()).optional()
        .default(['total', 'by_category', 'by_location', 'over_time']),
    }).optional(),
  }).optional(),
})
```

### Tool Definition
```typescript
// lib/mastra/tools/visualize.ts

import { createTool } from '@mastra/core'
import { z } from 'zod'
import type { XPShareContext } from '../context'

export const visualizeTool = createTool<XPShareContext>({
  id: 'visualize',

  description: 'Generate visualizations: map, timeline, network, or dashboard',

  inputSchema: visualizeSchema,

  execute: async ({ context, data }) => {
    const { type, experiences, config = {} } = data

    switch (type) {
      case 'map':
        return generateMapData(experiences, config.map)

      case 'timeline':
        return generateTimelineData(experiences, config.timeline)

      case 'network':
        return generateNetworkData(experiences, config.network)

      case 'dashboard':
        return generateDashboardData(experiences, config.dashboard)

      default:
        throw new Error(`Unknown visualization type: ${type}`)
    }
  },
})

// Helper functions

function generateMapData(experiences, config) {
  const features = experiences
    .filter(exp => exp.location_lat && exp.location_lng)
    .map(exp => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [exp.location_lng, exp.location_lat],
      },
      properties: {
        id: exp.id,
        title: exp.title,
        category: exp.category,
        date: exp.experience_date,
      },
    }))

  return {
    type: 'FeatureCollection',
    features,
    config: {
      heatmap: config?.heatmap ?? false,
      markers: config?.markers ?? true,
      cluster: config?.cluster ?? true,
    },
    bounds: calculateBounds(features),
  }
}

function generateTimelineData(experiences, config) {
  const groupBy = config?.groupBy ?? 'month'

  // Group experiences by time period
  const grouped = experiences.reduce((acc, exp) => {
    const date = new Date(exp.experience_date)
    const key = formatDateKey(date, groupBy)

    if (!acc[key]) {
      acc[key] = { date: key, count: 0, experiences: [] }
    }
    acc[key].count++
    acc[key].experiences.push(exp.id)

    return acc
  }, {})

  return {
    timeline: Object.values(grouped).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    ),
    groupBy,
    totalPeriods: Object.keys(grouped).length,
  }
}

function generateNetworkData(experiences, config) {
  const maxNodes = config?.maxNodes ?? 50
  const linkThreshold = config?.linkThreshold ?? 0.7

  // Create nodes
  const nodes = experiences.slice(0, maxNodes).map(exp => ({
    id: exp.id,
    label: exp.title.slice(0, 30),
    category: exp.category,
    size: 1,
  }))

  // Create links based on similarity
  const links = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const similarity = calculateSimilarity(
        experiences[i],
        experiences[j]
      )

      if (similarity >= linkThreshold) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: similarity,
        })
      }
    }
  }

  return { nodes, links }
}

function generateDashboardData(experiences, config) {
  const metrics = config?.metrics ?? ['total', 'by_category', 'by_location', 'over_time']

  const dashboard = {}

  if (metrics.includes('total')) {
    dashboard.total = experiences.length
  }

  if (metrics.includes('by_category')) {
    dashboard.by_category = experiences.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1
      return acc
    }, {})
  }

  if (metrics.includes('by_location')) {
    dashboard.by_location = experiences.reduce((acc, exp) => {
      const country = exp.location_country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})
  }

  if (metrics.includes('over_time')) {
    dashboard.over_time = generateTimelineData(experiences, { groupBy: 'month' }).timeline
  }

  return dashboard
}

// Utility functions
function calculateBounds(features) {
  if (features.length === 0) return null

  const lngs = features.map(f => f.geometry.coordinates[0])
  const lats = features.map(f => f.geometry.coordinates[1])

  return {
    minLng: Math.min(...lngs),
    minLat: Math.min(...lats),
    maxLng: Math.max(...lngs),
    maxLat: Math.max(...lats),
  }
}

function formatDateKey(date, groupBy) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')

  switch (groupBy) {
    case 'hour': return `${year}-${month}-${day} ${hour}:00`
    case 'day': return `${year}-${month}-${day}`
    case 'week': {
      const week = getWeekNumber(date)
      return `${year}-W${String(week).padStart(2, '0')}`
    }
    case 'month': return `${year}-${month}`
    case 'year': return `${year}`
    default: return `${year}-${month}`
  }
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

function calculateSimilarity(exp1, exp2) {
  let score = 0

  // Same category: +0.5
  if (exp1.category === exp2.category) score += 0.5

  // Same location (country): +0.3
  if (exp1.location_country === exp2.location_country) score += 0.3

  // Similar date (within 30 days): +0.2
  const date1 = new Date(exp1.experience_date)
  const date2 = new Date(exp2.experience_date)
  const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24)
  if (daysDiff <= 30) score += 0.2

  return Math.min(score, 1.0)
}
```

### Usage Examples

**Map:**
```json
{
  "type": "map",
  "experiences": [...],
  "config": {
    "map": {
      "heatmap": true,
      "markers": true,
      "cluster": true
    }
  }
}
```

**Timeline:**
```json
{
  "type": "timeline",
  "experiences": [...],
  "config": {
    "timeline": {
      "groupBy": "month"
    }
  }
}
```

---

## 3. analyze Tool

### Purpose
Multi-mode data analysis (temporal, category, comparison, correlation).

### Replaces
- temporalAnalysis
- analyzeCategory
- compareCategories
- attributeCorrelation

### Schema
```typescript
const analyzeSchema = z.object({
  mode: z.enum(['temporal', 'category', 'compare', 'correlation'])
    .describe('Analysis mode'),

  data: z.any()
    .describe('Input data (experiences array or specific category)'),

  options: z.object({
    temporal: z.object({
      aggregation: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
    }).optional(),

    category: z.object({
      name: z.string(),
      deep: z.boolean().optional().default(false),
    }).optional(),

    compare: z.object({
      categoryA: z.string(),
      categoryB: z.string(),
    }).optional(),

    correlation: z.object({
      attributes: z.array(z.string()),
    }).optional(),
  }).optional(),
})
```

### Tool Definition
```typescript
// lib/mastra/tools/analyze.ts

import { createTool } from '@mastra/core'
import { z } from 'zod'
import type { XPShareContext } from '../context'

export const analyzeTool = createTool<XPShareContext>({
  id: 'analyze',

  description: 'Analyze data: temporal trends, category deep-dive, comparisons, correlations',

  inputSchema: analyzeSchema,

  execute: async ({ context, data }) => {
    const { mode, data: inputData, options = {} } = data

    switch (mode) {
      case 'temporal':
        return analyzeTemporal(inputData, options.temporal)

      case 'category':
        return analyzeCategory(inputData, options.category, context)

      case 'compare':
        return compareCategories(inputData, options.compare, context)

      case 'correlation':
        return analyzeCorrelation(inputData, options.correlation)

      default:
        throw new Error(`Unknown analysis mode: ${mode}`)
    }
  },
})

// Implementation continues in next section...
```

### Token Estimate
~110 tokens (concise description + schema)

---

## 4-8. Specialized Tools (Brief Specs)

### 4. insights Tool
```typescript
{
  id: 'insights',
  description: 'AI-powered pattern detection and insights generation',
  inputSchema: z.object({
    experiences: z.array(z.any()),
    depth: z.enum(['basic', 'standard', 'advanced']).default('standard'),
  }),
  // ~80 tokens
}
```

### 5. trends Tool
```typescript
{
  id: 'trends',
  description: 'Time-series forecasting with linear regression',
  inputSchema: z.object({
    experiences: z.array(z.any()),
    periods: z.number().min(1).max(12).default(3),
  }),
  // ~80 tokens
}
```

### 6. connections Tool
```typescript
{
  id: 'connections',
  description: 'Find similar experiences based on multiple dimensions',
  inputSchema: z.object({
    experienceId: z.string(),
    limit: z.number().default(10),
  }),
  // ~80 tokens
}
```

### 7. patterns Tool
```typescript
{
  id: 'patterns',
  description: 'Detect anomalies and unusual patterns in data',
  inputSchema: z.object({
    experiences: z.array(z.any()),
    category: z.string().optional(),
  }),
  // ~80 tokens
}
```

### 8. userStats Tool
```typescript
{
  id: 'userStats',
  description: 'Community engagement metrics and leaderboards',
  inputSchema: z.object({
    limit: z.number().min(5).max(50).default(10),
  }),
  // ~80 tokens
}
```

---

## Total Token Count

| Tool Type | Tools | Avg Tokens | Total |
|-----------|-------|-----------|-------|
| Unified | 3 | ~130 | ~390 |
| Specialized | 5 | ~80 | ~400 |
| **TOTAL** | **8** | **~99** | **~790** |

**vs. Previous (15 tools × ~200 = ~3,000 tokens)**

**Savings: ~2,210 tokens (-74%)**

---

## Implementation Notes

1. All tools use `createTool<XPShareContext>()` for type safety
2. All tools have RLS-safe Supabase access via `context.supabase`
3. Unified tools route internally based on parameters
4. Keep descriptions concise but clear (target: 8-12 words)
5. Use Zod schemas for validation and autocomplete
6. Return structured data for easy visualization
7. Include error handling for all database queries
8. Log tool execution for debugging

---

**Next: See 03-AGENT.md for agent configuration** →
