import { tool } from 'ai'
import { z } from 'zod'
import { getExperiences } from '@/lib/search/hybrid'

/**
 * Tool 5: Generate Visualization Data
 *
 * Prepares data for visualization components:
 * - Map: Geographic distribution with clusters
 * - Timeline: Temporal distribution (bar/line/area chart)
 * - Network: Connection graph between experiences
 * - Heatmap: 2D density (time × location, category × sentiment)
 * - Distribution: Category/tag frequency
 *
 * Used by: Phase 2 /app/api/discover/route.ts & Phase 3 Generative UI
 */

const VisualizationParamsSchema = z.object({
  type: z
    .enum(['map', 'timeline', 'network', 'heatmap', 'distribution'])
    .describe('Type of visualization to generate'),

  experienceIds: z.array(z.string()).describe('Experience IDs to visualize'),

  config: z
    .object({
      timeGranularity: z
        .enum(['hour', 'day', 'week', 'month', 'year'])
        .optional()
        .describe('Time granularity for timeline/heatmap'),
      clusterRadius: z
        .number()
        .optional()
        .describe('Clustering radius in km for map (default: 50)'),
      networkLayout: z
        .enum(['force', 'hierarchical', 'radial'])
        .optional()
        .describe('Network graph layout algorithm'),
    })
    .optional()
    .describe('Visualization-specific configuration'),
})

export type VisualizationParams = z.infer<typeof VisualizationParamsSchema>

export const generateVisualizationTool = tool({
  description: `Generate data for charts, maps, and network visualizations.

Visualization Types:
- map: Geographic markers + clusters (Leaflet/Mapbox ready)
- timeline: Temporal distribution (Recharts ready)
- network: Connection graph (react-force-graph ready)
- heatmap: 2D density matrix (Tremor ready)
- distribution: Category/tag frequency (bar chart ready)

Best for:
- "Show these experiences on a map"
- "Create a timeline of these events"
- "Visualize connections as a network graph"
- "Generate a heatmap of categories over time"`,

  parameters: VisualizationParamsSchema,

  execute: async (params: VisualizationParams) => {
    try {
      const experiences = await getExperiences(params.experienceIds)

      if (experiences.length === 0) {
        return {
          type: params.type,
          data: null,
          message: 'No experiences found',
        }
      }

      switch (params.type) {
        case 'map':
          return generateMapData(experiences, params.config?.clusterRadius || 50)
        case 'timeline':
          return generateTimelineData(
            experiences,
            params.config?.timeGranularity || 'day'
          )
        case 'network':
          return generateNetworkData(
            experiences,
            params.config?.networkLayout || 'force'
          )
        case 'heatmap':
          return generateHeatmapData(experiences)
        case 'distribution':
          return generateDistributionData(experiences)
      }
    } catch (error: any) {
      console.error('Visualization generation error:', error)
      return {
        type: params.type,
        data: null,
        error: `Visualization generation failed: ${error.message}`,
      }
    }
  },
})

// ===== Visualization Generators =====

/**
 * Generate map visualization data (markers + clusters)
 */
function generateMapData(experiences: any[], clusterRadius: number) {
  const markers = experiences
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({
      id: e.id,
      lat: e.latitude,
      lng: e.longitude,
      title: e.title,
      category: e.category_slug,
      date: e.date_occurred,
    }))

  // Simple clustering (group by proximity)
  const clusters: any[] = []
  const used = new Set<string>()

  markers.forEach((marker) => {
    if (used.has(marker.id)) return

    const cluster = [marker]
    used.add(marker.id)

    markers.forEach((other) => {
      if (used.has(other.id)) return

      const distance = haversineDistance(
        marker.lat,
        marker.lng,
        other.lat,
        other.lng
      )

      if (distance <= clusterRadius) {
        cluster.push(other)
        used.add(other.id)
      }
    })

    if (cluster.length > 1) {
      // Calculate cluster center
      const centerLat =
        cluster.reduce((sum, m) => sum + m.lat, 0) / cluster.length
      const centerLng =
        cluster.reduce((sum, m) => sum + m.lng, 0) / cluster.length

      clusters.push({
        center: { lat: centerLat, lng: centerLng },
        count: cluster.length,
        radius: clusterRadius,
        markers: cluster,
      })
    }
  })

  // Calculate bounds
  const bounds = calculateBounds(markers)

  return {
    type: 'map',
    markers,
    clusters,
    bounds,
    totalMarkers: markers.length,
  }
}

/**
 * Generate timeline visualization data
 */
function generateTimelineData(experiences: any[], granularity: string) {
  const counts = new Map<string, number>()

  experiences.forEach((exp) => {
    if (!exp.date_occurred) return
    const key = formatDateKey(exp.date_occurred, granularity)
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  const data = Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    type: 'timeline',
    data,
    granularity,
    totalDataPoints: data.length,
  }
}

/**
 * Generate network graph data (nodes + edges)
 */
function generateNetworkData(experiences: any[], layout: string) {
  const nodes = experiences.map((e) => ({
    id: e.id,
    label: e.title,
    category: e.category_slug,
  }))

  // Generate edges based on shared tags
  const edges: any[] = []

  for (let i = 0; i < experiences.length; i++) {
    for (let j = i + 1; j < experiences.length; j++) {
      const exp1 = experiences[i]
      const exp2 = experiences[j]

      const sharedTags =
        exp1.tags?.filter((tag: string) => exp2.tags?.includes(tag)) || []

      if (sharedTags.length > 0) {
        edges.push({
          source: exp1.id,
          target: exp2.id,
          weight: sharedTags.length,
          sharedTags,
        })
      }
    }
  }

  return {
    type: 'network',
    nodes,
    edges,
    layout,
    totalNodes: nodes.length,
    totalEdges: edges.length,
  }
}

/**
 * Generate heatmap data (2D matrix)
 */
function generateHeatmapData(experiences: any[]) {
  // Create category × month matrix
  const matrix = new Map<string, Map<string, number>>()

  experiences.forEach((exp) => {
    if (!exp.date_occurred) return

    const month = exp.date_occurred.substring(0, 7) // YYYY-MM
    const category = exp.category_slug

    if (!matrix.has(category)) {
      matrix.set(category, new Map())
    }

    const categoryMap = matrix.get(category)!
    categoryMap.set(month, (categoryMap.get(month) || 0) + 1)
  })

  // Convert to array format
  const data: any[] = []

  matrix.forEach((monthCounts, category) => {
    monthCounts.forEach((count, month) => {
      data.push({
        category,
        month,
        count,
      })
    })
  })

  return {
    type: 'heatmap',
    data,
    totalCells: data.length,
  }
}

/**
 * Generate distribution data (frequency counts)
 */
function generateDistributionData(experiences: any[]) {
  // Category distribution
  const categoryDist = new Map<string, number>()
  experiences.forEach((exp) => {
    categoryDist.set(
      exp.category_slug,
      (categoryDist.get(exp.category_slug) || 0) + 1
    )
  })

  // Tag distribution
  const tagDist = new Map<string, number>()
  experiences.forEach((exp) => {
    exp.tags?.forEach((tag: string) => {
      tagDist.set(tag, (tagDist.get(tag) || 0) + 1)
    })
  })

  return {
    type: 'distribution',
    categories: Array.from(categoryDist.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    tags: Array.from(tagDist.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20), // Top 20 tags
    totalExperiences: experiences.length,
  }
}

// ===== Utility Functions =====

/**
 * Calculate distance between two coordinates
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate map bounds from markers
 */
function calculateBounds(markers: any[]) {
  if (markers.length === 0) return null

  let minLat = markers[0].lat
  let maxLat = markers[0].lat
  let minLng = markers[0].lng
  let maxLng = markers[0].lng

  markers.forEach((m) => {
    if (m.lat < minLat) minLat = m.lat
    if (m.lat > maxLat) maxLat = m.lat
    if (m.lng < minLng) minLng = m.lng
    if (m.lng > maxLng) maxLng = m.lng
  })

  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng },
  }
}

/**
 * Format date based on granularity
 */
function formatDateKey(date: string, granularity: string): string {
  switch (granularity) {
    case 'year':
      return date.substring(0, 4)
    case 'month':
      return date.substring(0, 7) // YYYY-MM
    case 'week': {
      const d = new Date(date)
      const weekNum = getWeekNumber(d)
      return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
    }
    case 'day':
      return date.substring(0, 10) // YYYY-MM-DD
    case 'hour': {
      return date.substring(0, 13) // YYYY-MM-DDTHH
    }
    default:
      return date
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(d: Date): number {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) /
        7
    )
  )
}
