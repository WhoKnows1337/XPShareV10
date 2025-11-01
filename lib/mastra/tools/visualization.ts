/**
 * XPShare Mastra - Visualization Tools
 *
 * Specialized tools for creating data visualizations (maps, timelines, networks, dashboards)
 * All tools use RuntimeContext for RLS-safe Supabase access
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import type { XPShareContext } from '../types'

// ============================================================================
// 1. Temporal Analysis Tool
// ============================================================================

export const temporalAnalysisTool = createTool({
  id: 'temporalAnalysis',
  description:
    'Analyze temporal patterns and trends. Aggregates experiences by time periods (hour/day/week/month/year) with optional category and location grouping. Use this to discover time-based patterns.',

  inputSchema: z.object({
    granularity: z
      .enum(['hour', 'day', 'week', 'month', 'year'])
      .describe('Time granularity for aggregation'),
    category: z
      .string()
      .optional()
      .describe(
        'Optional category filter (use slug format: "ufo-uap", "dreams", "nde-obe", "paranormal-anomalies", "synchronicity", "psychedelics", "altered-states", etc.)'
      ),
    location: z.string().optional().describe('Optional location filter (text match)'),
    dateRange: z
      .object({
        from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
        to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
      })
      .optional()
      .describe('Optional date range to analyze'),
  }),

  outputSchema: z.object({
    periods: z.array(z.any()),
    granularity: z.string(),
    category: z.string().optional(),
    location: z.string().optional(),
    summary: z.object({
      totalPeriods: z.number(),
      totalExperiences: z.number(),
      averagePerPeriod: z.number(),
      peakPeriod: z.any().optional(),
      peakCount: z.any().optional(),
    }),
    summaryText: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase') as any

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('temporal_aggregation', {
      p_categories: params.category ? [params.category] : null,
      p_granularity: params.granularity,
      p_date_from: params.dateRange?.from || null,
      p_date_to: params.dateRange?.to || null,
      p_group_by: null,
    })

    if (error) {
      throw new Error(`Temporal analysis failed: ${error.message}`)
    }

    const periods = data || []

    // Calculate summary statistics
    const totalCount = periods.reduce((sum: number, p: any) => sum + (p.count || 0), 0)
    const avgCount = totalCount / (periods.length || 1)

    const peakPeriod = periods.reduce(
      (max: any, p: any) => (p.count > (max?.count || 0) ? p : max),
      null
    )

    return {
      periods,
      granularity: params.granularity,
      category: params.category,
      location: params.location,
      summary: {
        totalPeriods: periods.length,
        totalExperiences: totalCount,
        averagePerPeriod: Math.round(avgCount * 10) / 10,
        peakPeriod: peakPeriod?.period,
        peakCount: peakPeriod?.count,
      },
      summaryText: `Analyzed ${periods.length} ${params.granularity} periods with ${totalCount} total experiences`,
    }
  },
})

// ============================================================================
// 2. Generate Map Tool (Geographic Visualizations)
// ============================================================================

export const generateMapTool = createTool({
  id: 'generateMap',
  description:
    'Create geographic visualizations with GeoJSON markers and heatmap data. Use for location-based questions and "where" questions. Returns visualization-ready geographic data.',

  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe('Optional category filter (use slug format)'),
    dateRange: z
      .object({
        from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
        to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
      })
      .optional()
      .describe('Optional date range'),
    boundingBox: z
      .object({
        north: z.number(),
        south: z.number(),
        east: z.number(),
        west: z.number(),
      })
      .optional()
      .describe('Optional geographic bounds'),
    limit: z.number().optional().default(100).describe('Max number of markers (default 100)'),
  }),

  outputSchema: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(
      z.object({
        type: z.literal('Feature'),
        geometry: z.object({
          type: z.literal('Point'),
          coordinates: z.array(z.number()), // [lng, lat]
        }),
        properties: z.object({
          id: z.string(),
          title: z.string(),
          category: z.string(),
          location: z.string(),
          timestamp: z.string(),
          summary: z.string().optional(),
        }),
      })
    ),
    heatmapData: z.array(
      z.object({
        lat: z.number(),
        lng: z.number(),
        intensity: z.number(),
      })
    ),
    summary: z.object({
      totalLocations: z.number(),
      categories: z.record(z.number()),
      bounds: z.object({
        north: z.number(),
        south: z.number(),
        east: z.number(),
        west: z.number(),
      }),
    }),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase') as any

    // Build query
    let query = supabase
      .from('experiences')
      .select('id, title, category_slug, location_text, location_lat, location_lng, created_at')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)
      .limit(params.limit || 100)

    if (params.category) {
      query = query.eq('category_slug', params.category)
    }

    if (params.dateRange) {
      query = query
        .gte('created_at', params.dateRange.from)
        .lte('created_at', params.dateRange.to)
    }

    if (params.boundingBox) {
      const { north, south, east, west } = params.boundingBox
      query = query
        .gte('location_lat', south)
        .lte('location_lat', north)
        .gte('location_lng', west)
        .lte('location_lng', east)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Map generation failed: ${error.message}`)
    }

    const experiences = data || []

    // Convert to GeoJSON
    const features = experiences.map((exp: any) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [exp.location_lng, exp.location_lat],
      },
      properties: {
        id: exp.id,
        title: exp.title,
        category: exp.category_slug,
        location: exp.location_text || 'Unknown',
        timestamp: exp.created_at,
      },
    }))

    // Generate heatmap data (group nearby locations)
    const heatmapData = experiences.map((exp: any) => ({
      lat: exp.location_lat,
      lng: exp.location_lng,
      intensity: 1,
    }))

    // Calculate bounds
    const lats = experiences.map((exp: any) => exp.location_lat)
    const lngs = experiences.map((exp: any) => exp.location_lng)

    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    }

    // Count by category
    const categories = experiences.reduce((acc: any, exp: any) => {
      acc[exp.category_slug] = (acc[exp.category_slug] || 0) + 1
      return acc
    }, {})

    return {
      type: 'FeatureCollection' as const,
      features,
      heatmapData,
      summary: {
        totalLocations: experiences.length,
        categories,
        bounds,
      },
    }
  },
})

// ============================================================================
// 3. Generate Timeline Tool (Event Timelines)
// ============================================================================

export const generateTimelineTool = createTool({
  id: 'generateTimeline',
  description:
    'Create chronological event timelines for individual experience journeys. Use for chronological storytelling and "my experiences over time" questions. Returns ordered events with metadata.',

  inputSchema: z.object({
    userId: z.string().optional().describe('Optional user ID to filter timeline'),
    category: z.string().optional().describe('Optional category filter'),
    dateRange: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .optional()
      .describe('Optional date range'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc')
      .describe('Sort order (default: asc for oldest first)'),
    limit: z.number().optional().default(50).describe('Max number of events (default 50)'),
  }),

  outputSchema: z.object({
    events: z.array(
      z.object({
        id: z.string(),
        timestamp: z.string(),
        title: z.string(),
        category: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        metadata: z.object({
          witnesses: z.number().optional(),
          tags: z.array(z.string()).optional(),
          emotions: z.array(z.string()).optional(),
        }),
      })
    ),
    summary: z.object({
      totalEvents: z.number(),
      dateRange: z.object({
        earliest: z.string(),
        latest: z.string(),
      }),
      categories: z.record(z.number()),
    }),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase') as any
    const userId = runtimeContext.get('userId')

    // Build query
    let query = supabase
      .from('experiences')
      .select('id, title, category_slug, description, location_text, created_at, witness_count')
      .limit(params.limit || 50)

    // Use userId from context if not explicitly provided
    const targetUserId = params.userId || userId
    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }

    if (params.category) {
      query = query.eq('category_slug', params.category)
    }

    if (params.dateRange) {
      query = query
        .gte('created_at', params.dateRange.from)
        .lte('created_at', params.dateRange.to)
    }

    // Sort by timestamp
    query = query.order('created_at', { ascending: params.sortOrder === 'asc' })

    const { data, error } = await query

    if (error) {
      throw new Error(`Timeline generation failed: ${error.message}`)
    }

    const experiences = data || []

    // Format as timeline events
    const events = experiences.map((exp: any) => ({
      id: exp.id,
      timestamp: exp.created_at,
      title: exp.title,
      category: exp.category_slug,
      description: exp.description?.substring(0, 200),
      location: exp.location_text,
      metadata: {
        witnesses: exp.witness_count || 0,
      },
    }))

    // Calculate summary
    const timestamps = experiences.map((exp: any) => exp.created_at).sort()
    const categories = experiences.reduce((acc: any, exp: any) => {
      acc[exp.category_slug] = (acc[exp.category_slug] || 0) + 1
      return acc
    }, {})

    return {
      events,
      summary: {
        totalEvents: events.length,
        dateRange: {
          earliest: timestamps[0] || '',
          latest: timestamps[timestamps.length - 1] || '',
        },
        categories,
      },
    }
  },
})

// ============================================================================
// 4. Generate Network Tool (Relationship Networks)
// ============================================================================

export const generateNetworkTool = createTool({
  id: 'generateNetwork',
  description:
    'Create relationship networks showing connections between users, experiences, or categories. Use for connections, clusters, and "who/what is related" questions. Returns nodes and edges for graph visualization.',

  inputSchema: z.object({
    type: z
      .enum(['user-similarity', 'category-connections', 'tag-network'])
      .describe('Type of network to generate'),
    category: z.string().optional().describe('Optional category filter'),
    minConnections: z
      .number()
      .optional()
      .default(2)
      .describe('Minimum connections to include node (default 2)'),
    limit: z.number().optional().default(50).describe('Max number of nodes (default 50)'),
  }),

  outputSchema: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.string(),
        size: z.number(),
        metadata: z.record(z.any()),
      })
    ),
    edges: z.array(
      z.object({
        source: z.string(),
        target: z.string(),
        weight: z.number(),
        label: z.string().optional(),
      })
    ),
    summary: z.object({
      totalNodes: z.number(),
      totalEdges: z.number(),
      avgConnections: z.number(),
      clusters: z.number().optional(),
    }),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase') as any

    if (params.type === 'category-connections') {
      // Query category co-occurrence (users who post in multiple categories)
      const { data, error } = await supabase.rpc('category_correlation', {
        p_categories: params.category ? [params.category] : null,
      })

      if (error) {
        throw new Error(`Network generation failed: ${error.message}`)
      }

      const correlations = data || []

      // Build nodes (categories)
      const categorySet = new Set<string>()
      correlations.forEach((corr: any) => {
        categorySet.add(corr.category1)
        categorySet.add(corr.category2)
      })

      const nodes = Array.from(categorySet).map((cat) => ({
        id: cat,
        label: cat,
        type: 'category',
        size: correlations.filter((c: any) => c.category1 === cat || c.category2 === cat)
          .length,
        metadata: {},
      }))

      // Build edges (connections between categories)
      const edges = correlations
        .filter((corr: any) => corr.correlation >= params.minConnections)
        .map((corr: any) => ({
          source: corr.category1,
          target: corr.category2,
          weight: corr.correlation,
          label: `${corr.shared_users} users`,
        }))

      return {
        nodes,
        edges,
        summary: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          avgConnections: edges.length / (nodes.length || 1),
        },
      }
    }

    // Default: Simple tag network
    const { data, error } = await supabase
      .from('experiences')
      .select('id, title, category_slug')
      .limit(params.limit || 50)

    if (error) {
      throw new Error(`Network generation failed: ${error.message}`)
    }

    const experiences = data || []

    // Create simple nodes
    const nodes = experiences.map((exp: any) => ({
      id: exp.id,
      label: exp.title.substring(0, 50),
      type: 'experience',
      size: 1,
      metadata: { category: exp.category_slug },
    }))

    return {
      nodes,
      edges: [],
      summary: {
        totalNodes: nodes.length,
        totalEdges: 0,
        avgConnections: 0,
      },
    }
  },
})

// ============================================================================
// 5. Generate Dashboard Tool (Multi-Metric Dashboards)
// ============================================================================

export const generateDashboardTool = createTool({
  id: 'generateDashboard',
  description:
    'Create multi-metric dashboards with various chart types. Use for overview, analytics, and "show me everything" questions. Returns multiple chart configurations (bar, pie, line, etc.).',

  inputSchema: z.object({
    category: z.string().optional().describe('Optional category filter'),
    dateRange: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .optional()
      .describe('Optional date range'),
    metrics: z
      .array(z.enum(['category-distribution', 'temporal-trend', 'location-heatmap', 'top-users']))
      .optional()
      .default(['category-distribution', 'temporal-trend'])
      .describe('Metrics to include in dashboard'),
  }),

  outputSchema: z.object({
    charts: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['bar', 'pie', 'line', 'heatmap', 'table']),
        title: z.string(),
        data: z.any(),
        config: z.record(z.any()).optional(),
      })
    ),
    summary: z.object({
      totalExperiences: z.number(),
      dateRange: z.string(),
      categories: z.number(),
    }),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase') as any

    const charts: any[] = []

    // Metric 1: Category Distribution (Pie Chart)
    if (params.metrics.includes('category-distribution')) {
      let query = supabase
        .from('experiences')
        .select('category_slug', { count: 'exact' })

      if (params.dateRange) {
        query = query
          .gte('created_at', params.dateRange.from)
          .lte('created_at', params.dateRange.to)
      }

      const { data, error } = await query

      if (!error && data) {
        const categoryCounts = data.reduce((acc: any, exp: any) => {
          acc[exp.category_slug] = (acc[exp.category_slug] || 0) + 1
          return acc
        }, {})

        charts.push({
          id: 'category-distribution',
          type: 'pie',
          title: 'Experience Distribution by Category',
          data: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
        })
      }
    }

    // Metric 2: Temporal Trend (Line Chart)
    if (params.metrics.includes('temporal-trend')) {
      const { data, error } = await supabase.rpc('temporal_aggregation', {
        p_categories: params.category ? [params.category] : null,
        p_granularity: 'month',
        p_date_from: params.dateRange?.from || null,
        p_date_to: params.dateRange?.to || null,
        p_group_by: null,
      })

      if (!error && data) {
        charts.push({
          id: 'temporal-trend',
          type: 'line',
          title: 'Experience Submissions Over Time',
          data: (data || []).map((period: any) => ({
            period: period.period,
            count: period.count,
          })),
        })
      }
    }

    // Get total experiences count
    let totalQuery = supabase.from('experiences').select('id', { count: 'exact', head: true })

    if (params.dateRange) {
      totalQuery = totalQuery
        .gte('created_at', params.dateRange.from)
        .lte('created_at', params.dateRange.to)
    }

    const { count: totalExperiences } = await totalQuery

    return {
      charts,
      summary: {
        totalExperiences: totalExperiences || 0,
        dateRange: params.dateRange
          ? `${params.dateRange.from} to ${params.dateRange.to}`
          : 'All time',
        categories: charts.find((c) => c.id === 'category-distribution')?.data?.length || 0,
      },
    }
  },
})
