# Tool 5: Generate Visualization

**File:** `/lib/ai/tools/visualization-tool.ts`
**Purpose:** Prepare data for visualization components
**Used by:** Phase 2 `/app/api/discover/route.ts` & Phase 3 Generative UI

---

## 📋 Visualization Types

1. **Map**: Geographic distribution with clusters
2. **Timeline**: Temporal distribution (bar/line/area chart)
3. **Network**: Connection graph between experiences
4. **Heatmap**: 2D density (time × location, category × sentiment)
5. **Distribution**: Category/tag frequency

## 🔧 Implementation

```typescript
// lib/ai/tools/visualization-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const VisualizationParamsSchema = z.object({
  type: z.enum(['map', 'timeline', 'network', 'heatmap', 'distribution']),
  experienceIds: z.array(z.string()),
  config: z.object({
    timeGranularity: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
    clusterRadius: z.number().optional(),
    networkLayout: z.enum(['force', 'hierarchical', 'radial']).optional()
  }).optional()
})

export const generateVisualizationTool = tool({
  description: 'Generate data for charts, maps, networks. Returns data in format ready for Recharts/Leaflet/etc.',
  parameters: VisualizationParamsSchema,

  execute: async (params) => {
    const experiences = await getExperiences(params.experienceIds)

    switch (params.type) {
      case 'map':
        return generateMapData(experiences, params.config?.clusterRadius)
      case 'timeline':
        return generateTimelineData(experiences, params.config?.timeGranularity || 'day')
      case 'network':
        return generateNetworkData(experiences, params.config?.networkLayout || 'force')
      case 'heatmap':
        return generateHeatmapData(experiences)
      case 'distribution':
        return generateDistributionData(experiences)
    }
  }
})

// Helper functions

function generateMapData(experiences: any[], clusterRadius = 50) {
  const markers = experiences
    .filter(e => e.latitude && e.longitude)
    .map(e => ({
      id: e.id,
      lat: e.latitude,
      lng: e.longitude,
      title: e.title,
      category: e.category_slug
    }))

  // Simple clustering (in production, use supercluster)
  const clusters = []
  // ... clustering logic

  return {
    type: 'map',
    markers,
    clusters,
    bounds: calculateBounds(markers)
  }
}

function generateTimelineData(experiences: any[], granularity: string) {
  const counts = new Map<string, number>()

  experiences.forEach(exp => {
    const key = formatDateKey(exp.experience_date, granularity)
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return {
    type: 'timeline',
    data: Array.from(counts.entries()).map(([date, count]) => ({
      date,
      count
    }))
  }
}

function generateNetworkData(experiences: any[], layout: string) {
  const nodes = experiences.map(e => ({
    id: e.id,
    label: e.title,
    category: e.category_slug
  }))

  const edges = []
  // ... connection logic

  return {
    type: 'network',
    nodes,
    edges,
    layout
  }
}
```

## 📊 Output Example (Map)

```json
{
  "type": "map",
  "markers": [
    {
      "id": "exp-123",
      "lat": 52.52,
      "lng": 13.405,
      "title": "UFO Dream in Berlin",
      "category": "dreams"
    }
  ],
  "clusters": [
    {
      "center": { "lat": 52.5, "lng": 13.4 },
      "count": 2,
      "radius": 50
    }
  ]
}
```

---

**Next:** [Tool 6: Get Statistics](./tool-6-statistics.md)
