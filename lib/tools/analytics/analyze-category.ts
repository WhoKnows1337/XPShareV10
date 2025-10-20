/**
 * XPShare AI - Analyze Category Tool
 *
 * Deep-dive analysis of a specific category.
 * Provides counts, date distribution, and top attributes.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const analyzeCategorySchema = z.object({
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
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const analyzeCategoryTool = tool({
  description:
    'Deep-dive analysis of a specific category. Returns total experiences, date distribution, top locations, and common attributes. Use this to understand category characteristics.',
  parameters: analyzeCategorySchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
      query = query
        .gte('date_occurred', params.dateRange.from)
        .lte('date_occurred', params.dateRange.to)
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

    // Analyze attributes if requested
    let topAttributes: Array<{ key: string; values: Record<string, number>; totalCount: number }> =
      []

    if (params.includeAttributes) {
      const attributeCounts: Record<string, Record<string, number>> = {}

      experiences.forEach((exp) => {
        const attrs = exp.experience_attributes || []
        attrs.forEach((attr: any) => {
          if (!attributeCounts[attr.attribute_key]) {
            attributeCounts[attr.attribute_key] = {}
          }
          const value = String(attr.attribute_value)
          attributeCounts[attr.attribute_key][value] =
            (attributeCounts[attr.attribute_key][value] || 0) + 1
        })
      })

      topAttributes = Object.entries(attributeCounts)
        .map(([key, values]) => ({
          key,
          values,
          totalCount: Object.values(values).reduce((sum, count) => sum + count, 0),
        }))
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 10)
    }

    return {
      category: params.category,
      totalExperiences: experiences.length,
      dateRange: params.dateRange,
      topLocations,
      dateDistribution,
      topAttributes,
      summary: `Analyzed ${experiences.length} ${params.category} experiences${params.dateRange ? ` from ${params.dateRange.from} to ${params.dateRange.to}` : ''}`,
    }
  },
})
