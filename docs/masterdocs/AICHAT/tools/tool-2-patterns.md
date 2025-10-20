# Tool 2: Detect Patterns

**File:** `/lib/ai/tools/pattern-tool.ts`
**Purpose:** Automatically detect temporal, geographic, semantic, and emotional patterns
**Used by:** Phase 2 `/app/api/discover/route.ts`

---

## 📋 Pattern Types

1. **Temporal**: Time-based patterns (time of day, day of week, seasonal)
2. **Geographic**: Location-based clusters, regional trends
3. **Semantic**: Similar themes, shared vocabulary, topic clusters
4. **Emotional**: Sentiment patterns, emotional arcs
5. **Cross-Category**: Connections between different experience types

## 🔧 Implementation

```typescript
// lib/ai/tools/pattern-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const PatternParamsSchema = z.object({
  experienceIds: z.array(z.string()),
  patternTypes: z.array(
    z.enum(['temporal', 'geographic', 'semantic', 'emotional', 'crossCategory'])
  ),
  minConfidence: z.number().min(0).max(1).default(0.7),
  groupBy: z.enum(['location', 'category', 'tag']).optional()
})

export const detectPatternsTool = tool({
  description: 'Detect patterns in a set of experiences. Returns patterns with confidence scores.',
  parameters: PatternParamsSchema,

  execute: async (params) => {
    const patterns = []

    for (const type of params.patternTypes) {
      switch (type) {
        case 'temporal':
          patterns.push(...await detectTemporalPatterns(params.experienceIds))
          break
        case 'geographic':
          patterns.push(...await detectGeographicPatterns(params.experienceIds))
          break
        case 'semantic':
          patterns.push(...await detectSemanticPatterns(params.experienceIds))
          break
        case 'emotional':
          patterns.push(...await detectEmotionalPatterns(params.experienceIds))
          break
        case 'crossCategory':
          patterns.push(...await detectCrossCategoryPatterns(params.experienceIds))
          break
      }
    }

    // Filter by confidence
    return {
      patterns: patterns.filter(p => p.confidence >= params.minConfidence),
      count: patterns.length
    }
  }
})

// Helper functions

async function detectTemporalPatterns(ids: string[]) {
  // Fetch experiences with timestamps
  const experiences = await getExperiences(ids)

  // Group by time of day
  const hourCounts = new Map<number, number>()
  experiences.forEach(exp => {
    if (exp.time_of_day) {
      const hour = parseInt(exp.time_of_day.split(':')[0])
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    }
  })

  const patterns = []

  // Detect night pattern (22:00-06:00)
  const nightCount = Array.from(hourCounts.entries())
    .filter(([hour]) => hour >= 22 || hour <= 6)
    .reduce((sum, [, count]) => sum + count, 0)

  if (nightCount / experiences.length > 0.7) {
    patterns.push({
      type: 'temporal',
      description: `${nightCount} of ${experiences.length} experiences occurred at night (22:00-06:00)`,
      confidence: nightCount / experiences.length,
      dataPoints: Array.from(hourCounts.entries()).map(([hour, count]) => ({
        time: `${hour}:00`,
        count
      }))
    })
  }

  return patterns
}

async function detectGeographicPatterns(ids: string[]) {
  // Fetch experiences with locations
  const experiences = await getExperiences(ids)
  const withLocation = experiences.filter(e => e.latitude && e.longitude)

  if (withLocation.length < 2) return []

  // Simple clustering: check if experiences are within 50km
  const patterns = []
  const cluster = withLocation.slice(0, 2) // Simplified

  const distance = calculateDistance(
    cluster[0].latitude, cluster[0].longitude,
    cluster[1].latitude, cluster[1].longitude
  )

  if (distance < 50) {
    patterns.push({
      type: 'geographic',
      description: `Cluster detected: ${cluster.length} experiences within 50km`,
      confidence: 0.85,
      center: {
        lat: (cluster[0].latitude + cluster[1].latitude) / 2,
        lng: (cluster[0].longitude + cluster[1].longitude) / 2
      },
      radius: distance
    })
  }

  return patterns
}

async function detectSemanticPatterns(ids: string[]) {
  // Use embeddings to find semantic clusters
  const experiences = await getExperiences(ids)

  // Simplified: Check for common tags
  const tagCounts = new Map<string, number>()
  experiences.forEach(exp => {
    exp.tags?.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  const patterns = []
  for (const [tag, count] of tagCounts.entries()) {
    if (count / experiences.length > 0.6) {
      patterns.push({
        type: 'semantic',
        description: `Common theme: ${count} of ${experiences.length} experiences mention "${tag}"`,
        confidence: count / experiences.length,
        theme: tag,
        count
      })
    }
  }

  return patterns
}

async function detectEmotionalPatterns(ids: string[]) {
  // Analyze sentiment from descriptions
  // Simplified implementation
  return []
}

async function detectCrossCategoryPatterns(ids: string[]) {
  const experiences = await getExperiences(ids)
  const categories = new Set(experiences.map(e => e.category_slug))

  if (categories.size > 1) {
    return [{
      type: 'crossCategory',
      description: `Cross-category pattern: Experiences span ${categories.size} categories`,
      confidence: 0.75,
      categories: Array.from(categories)
    }]
  }

  return []
}
```

## 🎯 Usage Examples

### Detect All Pattern Types

```typescript
const result = await detectPatternsTool.execute({
  experienceIds: ['exp-1', 'exp-2', 'exp-3'],
  patternTypes: ['temporal', 'geographic', 'semantic'],
  minConfidence: 0.7
})
```

### Only Temporal Patterns

```typescript
const result = await detectPatternsTool.execute({
  experienceIds: ['exp-1', 'exp-2', 'exp-3'],
  patternTypes: ['temporal'],
  minConfidence: 0.8
})
```

## 📊 Output Example

```json
{
  "patterns": [
    {
      "type": "temporal",
      "description": "3 of 3 experiences occurred at night (22:00-03:00)",
      "confidence": 0.95,
      "dataPoints": [
        { "time": "22:30", "count": 1 },
        { "time": "01:15", "count": 2 }
      ]
    },
    {
      "type": "geographic",
      "description": "Cluster detected: 2 experiences in Germany",
      "confidence": 0.88,
      "center": { "lat": 51.5, "lng": 10.4 },
      "radius": 200
    }
  ],
  "count": 2
}
```

---

**Next:** [Tool 3: Find Connections](./tool-3-connections.md)
