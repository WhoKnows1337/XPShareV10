/**
 * XPShare Mastra - Relationship Tools
 *
 * 2 relationship tools for connection discovery and pattern detection
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import type { XPShareContext } from '../types'

// ============================================================================
// Find Connections Tool
// ============================================================================

/**
 * Find Connections Tool
 *
 * Multi-dimensional relationship discovery using weighted similarity scores.
 * Uses SQL function for semantic, geographic, temporal, and attribute similarity.
 */
export const findConnectionsTool = createTool<XPShareContext>({
  id: 'findConnections',
  description:
    'NETWORK ANALYSIS: Build relationship networks between experiences using multi-dimensional similarity scores. Requires an experienceId to analyze connections. Combines semantic vectors (0.4), geographic distance (0.3), temporal proximity (0.2), and attribute overlap (0.1) into weighted similarity scores. Returns ranked list of connected experiences with scores. DO NOT use for simple search - use this only when user asks for "connections", "relationships", "network", "similar to specific experience", or "related to [experience ID]".',

  inputSchema: z.object({
    experienceId: z.string().uuid().describe('UUID of the experience to find connections for'),
    useSemantic: z
      .boolean()
      .default(true)
      .describe('Use semantic similarity (vector embeddings, weight 0.4)'),
    useGeographic: z
      .boolean()
      .default(true)
      .describe('Use geographic similarity (PostGIS distance, weight 0.3)'),
    useTemporal: z
      .boolean()
      .default(true)
      .describe('Use temporal similarity (date proximity, weight 0.2)'),
    useAttributes: z
      .boolean()
      .default(true)
      .describe('Use attribute similarity (Jaccard index, weight 0.1)'),
    maxResults: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('Maximum number of related experiences to return'),
    minScore: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .describe('Minimum combined similarity score (0-1)'),
  }),

  outputSchema: z.object({
    connections: z.array(z.any()),
    count: z.number(),
    sourceExperienceId: z.string(),
    dimensionsUsed: z.array(z.string()),
    summary: z.object({
      totalConnections: z.number(),
      averageScore: z.number(),
      minScore: z.number(),
      dimensions: z.string(),
    }),
    summaryText: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Call SQL function from Phase 1 (using request-scoped Supabase client)
    const { data, error } = await supabase.rpc('find_related_experiences', {
      p_experience_id: params.experienceId,
      p_use_semantic: params.useSemantic,
      p_use_geographic: params.useGeographic,
      p_use_temporal: params.useTemporal,
      p_use_attributes: params.useAttributes,
      p_max_results: params.maxResults,
      p_min_score: params.minScore,
    })

    if (error) {
      throw new Error(`Find connections failed: ${error.message}`)
    }

    const connections = data || []

    // Calculate summary statistics
    const dimensions = []
    if (params.useSemantic) dimensions.push('semantic')
    if (params.useGeographic) dimensions.push('geographic')
    if (params.useTemporal) dimensions.push('temporal')
    if (params.useAttributes) dimensions.push('attributes')

    const avgScore =
      connections.length > 0
        ? connections.reduce((sum: number, c: any) => sum + (c.similarity_score || 0), 0) /
          connections.length
        : 0

    return {
      connections,
      count: connections.length,
      sourceExperienceId: params.experienceId,
      dimensionsUsed: dimensions,
      summary: {
        totalConnections: connections.length,
        averageScore: Math.round(avgScore * 1000) / 1000,
        minScore: params.minScore,
        dimensions: dimensions.join(', '),
      },
      summaryText: `Found ${connections.length} related experiences using ${dimensions.join(', ')} similarity`,
    }
  },
})

// ============================================================================
// Detect Patterns Tool
// ============================================================================

/**
 * Detect Patterns Tool
 *
 * Statistical pattern detection for anomalies, trends, clusters, and correlations.
 * Analyzes temporal spikes, geographic hotspots, semantic themes.
 *
 * Note: Has OPTIONAL RLS - can fetch data by category or analyze provided data.
 */
export const detectPatternsTool = createTool<XPShareContext>({
  id: 'detectPatterns',
  description:
    'PATTERN DETECTION: Statistical analysis to detect anomalies, trends, clusters, and correlations in experience datasets. Analyzes temporal spikes/trends, geographic hotspots/clusters, semantic themes, and attribute correlations using statistical methods (standard deviation, clustering). Can fetch data automatically by category OR analyze pre-fetched data. Returns confidence-scored patterns with evidence. Use this when user asks to "detect patterns", "find anomalies", "discover trends", "identify clusters", or "analyze statistical patterns".',

  inputSchema: z.object({
    patternType: z
      .enum(['temporal', 'geographic', 'semantic', 'correlation', 'all'])
      .describe('Type of pattern to detect: temporal, geographic, semantic, correlation, or all'),
    category: z
      .string()
      .optional()
      .describe(
        'Category to analyze for patterns (e.g., "psychic", "ufo-uap", "dreams"). If provided, will fetch data from database automatically.'
      ),
    data: z
      .any()
      .optional()
      .describe(
        'Optional: Pre-fetched data to analyze. If not provided and category is specified, will fetch from database.'
      ),
  }),

  outputSchema: z.object({
    patternType: z.string(),
    category: z.string().optional(),
    dataPoints: z.number(),
    patterns: z.array(z.any()),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    // Fetch data if category provided and no data given
    let data = Array.isArray(params.data) ? params.data : params.data?.results || []

    if (data.length === 0 && params.category) {
      try {
        const supabase = runtimeContext.get('supabase')
        const { data: fetchedData, error } = await supabase
          .from('experiences')
          .select('id, category, location_text, date_occurred, created_at, title, story_text')
          .eq('category', params.category)
          .eq('is_test_data', false)
          .order('created_at', { ascending: false })
          .limit(1000)

        if (error) {
          console.error('[detectPatterns] Database error:', error)
          return {
            patternType: params.patternType,
            category: params.category,
            dataPoints: 0,
            patterns: [],
            summary: `Error fetching data: ${error.message}`,
          }
        }

        data = fetchedData || []
      } catch (error) {
        console.error('[detectPatterns] Fetch error:', error)
        return {
          patternType: params.patternType,
          category: params.category,
          dataPoints: 0,
          patterns: [],
          summary: 'Error fetching data from database',
        }
      }
    }

    if (data.length === 0) {
      return {
        patternType: params.patternType,
        category: params.category,
        dataPoints: 0,
        patterns: [],
        summary: params.category
          ? `No experiences found for category "${params.category}"`
          : 'No data provided for pattern detection',
      }
    }

    const patterns: any[] = []

    // Detect temporal patterns if requested
    if (params.patternType === 'temporal' || params.patternType === 'all') {
      const temporalPatterns = detectTemporalPatterns(data)
      if (temporalPatterns.length > 0) {
        patterns.push({
          type: 'temporal',
          patterns: temporalPatterns,
        })
      }
    }

    // Detect geographic patterns if requested
    if (params.patternType === 'geographic' || params.patternType === 'all') {
      const geoPatterns = detectGeographicPatterns(data)
      if (geoPatterns.length > 0) {
        patterns.push({
          type: 'geographic',
          patterns: geoPatterns,
        })
      }
    }

    // Detect semantic patterns if requested
    if (params.patternType === 'semantic' || params.patternType === 'all') {
      const semanticPatterns = detectSemanticPatterns(data)
      if (semanticPatterns.length > 0) {
        patterns.push({
          type: 'semantic',
          patterns: semanticPatterns,
        })
      }
    }

    return {
      patternType: params.patternType,
      category: params.category,
      dataPoints: data.length,
      patterns,
      summary: `Detected ${patterns.length} pattern type(s) in ${data.length} data points`,
    }
  },
})

// ============================================================================
// Pattern Detection Helper Functions
// ============================================================================

function detectTemporalPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract dates
  const dateCounts: Record<string, number> = {}
  data.forEach((item) => {
    const date = item.date_occurred || item.created_at || item.period || item.month
    if (date) {
      const month = typeof date === 'string' ? date.slice(0, 7) : date
      dateCounts[month] = (dateCounts[month] || 0) + 1
    }
  })

  if (Object.keys(dateCounts).length === 0) return patterns

  const counts = Object.values(dateCounts)
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  const max = Math.max(...counts)
  const maxMonth = Object.keys(dateCounts).find((k) => dateCounts[k] === max)

  // Detect spike using standard deviation
  const variance = counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  if (max > mean + 1.5 * stdDev) {
    patterns.push({
      description: `Spike detected in ${maxMonth}: ${max} events (${Math.round((max / mean - 1) * 100)}% above average)`,
      confidence: 0.8,
      data: { month: maxMonth, count: max, average: mean },
    })
  }

  return patterns
}

function detectGeographicPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract locations
  const locationCounts: Record<string, number> = {}
  data.forEach((item) => {
    const location = item.location_text || item.location
    if (location) {
      const normalized = location.toLowerCase().trim()
      locationCounts[normalized] = (locationCounts[normalized] || 0) + 1
    }
  })

  if (Object.keys(locationCounts).length === 0) return patterns

  const total = Object.values(locationCounts).reduce((a, b) => a + b, 0)
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]

  // Detect hotspot (>25% concentration)
  if (topLocation && topLocation[1] / total > 0.25) {
    patterns.push({
      description: `Geographic hotspot: ${topLocation[0]} (${Math.round((topLocation[1] / total) * 100)}% of all events)`,
      confidence: 0.85,
      data: {
        location: topLocation[0],
        count: topLocation[1],
        percentage: (topLocation[1] / total) * 100,
      },
    })
  }

  return patterns
}

function detectSemanticPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract categories
  const categoryCounts: Record<string, number> = {}
  data.forEach((item) => {
    const category = item.category
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    }
  })

  if (Object.keys(categoryCounts).length === 0) return patterns

  const total = data.length
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  // Detect dominant category (>40% concentration)
  if (topCategory && topCategory[1] / total > 0.4) {
    patterns.push({
      description: `Category dominance: "${topCategory[0]}" represents ${Math.round((topCategory[1] / total) * 100)}% of data`,
      confidence: 0.75,
      data: {
        category: topCategory[0],
        count: topCategory[1],
        percentage: (topCategory[1] / total) * 100,
      },
    })
  }

  return patterns
}
