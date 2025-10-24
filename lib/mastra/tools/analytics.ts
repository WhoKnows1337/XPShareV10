/**
 * XPShare Mastra - Analytics Tools
 *
 * 5 analytics tools for aggregation, ranking, and statistical analysis
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import type { XPShareContext } from '../types'

// ============================================================================
// Rank Users Tool
// ============================================================================

/**
 * Rank Users Tool
 *
 * User contribution rankings by experience count, category diversity, or XP.
 * Uses SQL function from Phase 1 for optimal performance.
 */
export const rankUsersTool = createTool<XPShareContext>({
  id: 'rankUsers',
  description:
    'USER LEADERBOARD & RANKINGS: Get top contributors ranked by experience count and category diversity. Returns user rankings with usernames, contribution counts, and category expertise. Use this when user asks for "top contributors", "leaderboard", "most active users", "who contributes most", "user rankings", or "find contributors".',

  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe('Optional category filter (e.g., "ufo", "dreams")'),
    topN: z.number().min(1).max(100).default(10).describe('Number of top users to return'),
  }),

  outputSchema: z.object({
    users: z.array(z.any()),
    count: z.number(),
    category: z.string().optional(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('aggregate_users_by_category', {
      p_category: params.category,
    })

    if (error) {
      throw new Error(`User ranking failed: ${error.message}`)
    }

    // Sort by experience count and limit
    const sorted = (data || [])
      .sort((a: any, b: any) => b.experience_count - a.experience_count)
      .slice(0, params.topN)

    return {
      users: sorted,
      count: sorted.length,
      category: params.category,
      summary: params.category
        ? `Top ${sorted.length} contributors in ${params.category}`
        : `Top ${sorted.length} contributors overall`,
    }
  },
})

// ============================================================================
// Analyze Category Tool
// ============================================================================

/**
 * Analyze Category Tool
 *
 * Deep-dive analysis of a specific category.
 * Provides counts, date distribution, and top attributes.
 */
export const analyzeCategoryTool = createTool<XPShareContext>({
  id: 'analyzeCategory',
  description:
    'BASIC CATEGORY SUMMARY: Simple data summary for a category (counts, locations, dates). Returns raw JSON with total experiences, date distribution, top locations, and common attributes. DO NOT use for insights, patterns, or statistical analysis - use generateInsights or detectPatterns instead. Use this ONLY for basic "how many", "where", "when" questions.',

  inputSchema: z.object({
    category: z.string().describe('Category to analyze (e.g., "ufo", "dreams", "nde")'),
    dateRange: z
      .object({
        from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
        to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
      })
      .optional()
      .describe('Optional date range to analyze'),
    includeAttributes: z
      .boolean()
      .default(true)
      .describe('Include top attributes analysis'),
  }),

  outputSchema: z.object({
    category: z.string(),
    totalExperiences: z.number(),
    topLocations: z.array(
      z.object({
        location: z.string(),
        count: z.number(),
      })
    ),
    dateDistribution: z.array(
      z.object({
        month: z.string(),
        count: z.number(),
      })
    ),
    topAttributes: z
      .array(
        z.object({
          key: z.string(),
          count: z.number(),
        })
      )
      .optional(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Build query for category experiences
    let query = supabase
      .from('experiences')
      .select(
        `
        id,
        title,
        category,
        location_text,
        date_occurred,
        created_at,
        experience_attributes (
          attribute_key,
          attribute_value,
          confidence
        )
      `
      )
      .eq('category', params.category)

    // Apply date range if specified
    if (params.dateRange) {
      query = query.gte('date_occurred', params.dateRange.from).lte('date_occurred', params.dateRange.to)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Category analysis failed: ${error.message}`)
    }

    const experiences = data || []

    // Analyze locations
    const locationCounts: Record<string, number> = {}
    experiences.forEach((exp) => {
      if (exp.location_text) {
        locationCounts[exp.location_text] = (locationCounts[exp.location_text] || 0) + 1
      }
    })

    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    // Analyze dates (monthly distribution)
    const monthCounts: Record<string, number> = {}
    experiences.forEach((exp) => {
      if (exp.date_occurred) {
        const month = exp.date_occurred.slice(0, 7) // YYYY-MM
        monthCounts[month] = (monthCounts[month] || 0) + 1
      }
    })

    const dateDistribution = Object.entries(monthCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))

    // Analyze attributes (if requested)
    let topAttributes: Array<{ key: string; count: number }> | undefined

    if (params.includeAttributes) {
      const attrCounts: Record<string, number> = {}
      experiences.forEach((exp) => {
        const attrs = exp.experience_attributes || []
        attrs.forEach((attr: any) => {
          attrCounts[attr.attribute_key] = (attrCounts[attr.attribute_key] || 0) + 1
        })
      })

      topAttributes = Object.entries(attrCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => ({ key, count }))
    }

    return {
      category: params.category,
      totalExperiences: experiences.length,
      topLocations,
      dateDistribution,
      topAttributes,
      summary: `Analyzed ${experiences.length} ${params.category} experiences`,
    }
  },
})

// ============================================================================
// Compare Categories Tool
// ============================================================================

/**
 * Compare Categories Tool
 *
 * Side-by-side comparison of two categories.
 * Analyzes differences in volume, distribution, attributes, and patterns.
 */
export const compareCategoryTool = createTool<XPShareContext>({
  id: 'compareCategories',
  description:
    'Compare two categories side-by-side. Analyzes differences in experience volume, geographic distribution, temporal patterns, and common attributes. Use this to understand category differences and similarities.',

  inputSchema: z.object({
    categoryA: z.string().describe('First category to compare (e.g., "ufo")'),
    categoryB: z.string().describe('Second category to compare (e.g., "dreams")'),
    dateRange: z
      .object({
        from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
        to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
      })
      .optional()
      .describe('Optional date range for comparison'),
  }),

  outputSchema: z.object({
    volumeComparison: z.object({
      categoryA: z.object({ name: z.string(), count: z.number() }),
      categoryB: z.object({ name: z.string(), count: z.number() }),
      difference: z.number(),
      ratio: z.number(),
    }),
    geoComparison: z.any(),
    temporalComparison: z.any(),
    attributeComparison: z.any(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Fetch data for both categories
    const fetchCategoryData = async (category: string, dateRange?: any) => {
      let query = supabase
        .from('experiences')
        .select(
          `
          id,
          category,
          location_text,
          date_occurred,
          experience_attributes (
            attribute_key,
            attribute_value
          )
        `
        )
        .eq('category', category)

      if (dateRange) {
        query = query.gte('date_occurred', dateRange.from).lte('date_occurred', dateRange.to)
      }

      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch ${category}: ${error.message}`)
      return data || []
    }

    const [dataA, dataB] = await Promise.all([
      fetchCategoryData(params.categoryA, params.dateRange),
      fetchCategoryData(params.categoryB, params.dateRange),
    ])

    // Compare volumes
    const volumeComparison = {
      categoryA: { name: params.categoryA, count: dataA.length },
      categoryB: { name: params.categoryB, count: dataB.length },
      difference: dataA.length - dataB.length,
      ratio:
        dataB.length > 0
          ? Math.round((dataA.length / dataB.length) * 100) / 100
          : dataA.length > 0
            ? Infinity
            : 0,
    }

    return {
      volumeComparison,
      geoComparison: { note: 'Geographic comparison requires additional processing' },
      temporalComparison: { note: 'Temporal comparison requires additional processing' },
      attributeComparison: { note: 'Attribute comparison requires additional processing' },
      summary: `${params.categoryA} has ${volumeComparison.categoryA.count} experiences vs ${params.categoryB} with ${volumeComparison.categoryB.count} (ratio: ${volumeComparison.ratio})`,
    }
  },
})

// NOTE: temporalAnalysisTool has been moved to visualization.ts (Viz Agent)

// ============================================================================
// Attribute Correlation Tool
// ============================================================================

/**
 * Attribute Correlation Tool
 *
 * Find correlations between attributes within a category.
 * Analyzes co-occurrence patterns and statistical relationships.
 */
export const attributeCorrelationTool = createTool<XPShareContext>({
  id: 'attributeCorrelation',
  description:
    'Find correlations between attributes within a category. Analyzes which attributes frequently appear together and their co-occurrence strength. Use this to discover attribute patterns and relationships.',

  inputSchema: z.object({
    category: z.string().describe('Category to analyze (e.g., "ufo", "dreams")'),
    attributeKey: z
      .string()
      .optional()
      .describe('Optional specific attribute to analyze correlations for'),
    minCooccurrence: z
      .number()
      .min(1)
      .default(3)
      .describe('Minimum number of co-occurrences to consider'),
    topN: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe('Number of top correlations to return'),
  }),

  outputSchema: z.object({
    correlations: z.array(
      z.object({
        attributeA: z.string(),
        attributeB: z.string(),
        cooccurrence: z.number(),
        strength: z.number(),
      })
    ),
    category: z.string(),
    totalExperiences: z.number(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Fetch category experiences with attributes
    const { data, error } = await supabase
      .from('experiences')
      .select(
        `
        id,
        category,
        experience_attributes (
          attribute_key,
          attribute_value,
          confidence
        )
      `
      )
      .eq('category', params.category)

    if (error) {
      throw new Error(`Attribute correlation failed: ${error.message}`)
    }

    const experiences = data || []

    // Build co-occurrence matrix
    const cooccurrenceMatrix: Record<string, Record<string, number>> = {}
    const attributeCounts: Record<string, number> = {}

    experiences.forEach((exp) => {
      const attrs = exp.experience_attributes || []
      const attrKeys = attrs.map((a: any) => a.attribute_key)

      // Count individual attributes
      attrKeys.forEach((key: string) => {
        attributeCounts[key] = (attributeCounts[key] || 0) + 1
      })

      // Count co-occurrences
      for (let i = 0; i < attrKeys.length; i++) {
        for (let j = i + 1; j < attrKeys.length; j++) {
          const keyA = attrKeys[i]
          const keyB = attrKeys[j]

          if (!cooccurrenceMatrix[keyA]) {
            cooccurrenceMatrix[keyA] = {}
          }
          if (!cooccurrenceMatrix[keyB]) {
            cooccurrenceMatrix[keyB] = {}
          }

          cooccurrenceMatrix[keyA][keyB] = (cooccurrenceMatrix[keyA][keyB] || 0) + 1
          cooccurrenceMatrix[keyB][keyA] = (cooccurrenceMatrix[keyB][keyA] || 0) + 1
        }
      }
    })

    // Calculate correlations
    const correlations: Array<{
      attributeA: string
      attributeB: string
      cooccurrence: number
      strength: number
    }> = []

    Object.entries(cooccurrenceMatrix).forEach(([keyA, cooccurrences]) => {
      Object.entries(cooccurrences).forEach(([keyB, count]) => {
        if (count >= params.minCooccurrence && keyA < keyB) {
          // Avoid duplicates
          const strength = count / Math.sqrt(attributeCounts[keyA] * attributeCounts[keyB])

          correlations.push({
            attributeA: keyA,
            attributeB: keyB,
            cooccurrence: count,
            strength: Math.round(strength * 1000) / 1000,
          })
        }
      })
    })

    // Sort by strength and limit
    const topCorrelations = correlations
      .sort((a, b) => b.strength - a.strength)
      .slice(0, params.topN)

    return {
      correlations: topCorrelations,
      category: params.category,
      totalExperiences: experiences.length,
      summary: `Found ${topCorrelations.length} attribute correlations in ${params.category}`,
    }
  },
})
