/**
 * XPShare AI - Compare Categories Tool
 *
 * Side-by-side comparison of two categories.
 * Analyzes differences in volume, distribution, attributes, and patterns.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const compareCategoriesSchema = z.object({
  categoryA: z.string().describe('First category to compare (e.g., "ufo")'),
  categoryB: z.string().describe('Second category to compare (e.g., "dreams")'),
  dateRange: z
    .object({
      from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
      to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
    })
    .optional()
    .describe('Optional date range for comparison'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createCompareCategoryTool = (supabase: any) =>
  tool({
    description:
      'Compare two categories side-by-side. Analyzes differences in experience volume, geographic distribution, temporal patterns, and common attributes. Use this to understand category differences and similarities.',
    inputSchema: compareCategoriesSchema,
    execute: async (params) => {
      // Fetch data for both categories (using request-scoped Supabase client)
      const [dataA, dataB] = await Promise.all([
        fetchCategoryData(supabase, params.categoryA, params.dateRange),
        fetchCategoryData(supabase, params.categoryB, params.dateRange),
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

      // Compare geographic distribution
      const geoA = analyzeGeography(dataA)
      const geoB = analyzeGeography(dataB)

      const geoComparison = {
        categoryA: { topLocations: geoA.slice(0, 5) },
        categoryB: { topLocations: geoB.slice(0, 5) },
        overlap: findOverlap(
          geoA.map((g) => g.location),
          geoB.map((g) => g.location)
        ),
      }

      // Compare temporal distribution (monthly)
      const temporalA = analyzeTemporalDistribution(dataA)
      const temporalB = analyzeTemporalDistribution(dataB)

      const temporalComparison = {
        categoryA: { peakMonth: findPeak(temporalA), distribution: temporalA.slice(0, 12) },
        categoryB: { peakMonth: findPeak(temporalB), distribution: temporalB.slice(0, 12) },
        correlation: calculateCorrelation(temporalA, temporalB),
      }

      // Compare attributes
      const attrsA = analyzeAttributes(dataA)
      const attrsB = analyzeAttributes(dataB)

      const attributeComparison = {
        categoryA: { topAttributes: attrsA.slice(0, 5) },
        categoryB: { topAttributes: attrsB.slice(0, 5) },
        uniqueToA: attrsA
          .filter((a) => !attrsB.some((b) => b.key === a.key))
          .slice(0, 5)
          .map((a) => a.key),
        uniqueToB: attrsB
          .filter((b) => !attrsA.some((a) => a.key === b.key))
          .slice(0, 5)
          .map((b) => b.key),
        shared: attrsA
          .filter((a) => attrsB.some((b) => b.key === a.key))
          .slice(0, 5)
          .map((a) => a.key),
      }

      return {
        categoryA: params.categoryA,
        categoryB: params.categoryB,
        dateRange: params.dateRange,
        volumeComparison,
        geoComparison,
        temporalComparison,
        attributeComparison,
        summary: {
          volumeDifference: volumeComparison.difference,
          volumeRatio: volumeComparison.ratio,
          geoOverlap: geoComparison.overlap.length,
          temporalCorrelation: temporalComparison.correlation,
          sharedAttributes: attributeComparison.shared.length,
        },
        summaryText: `Compared ${params.categoryA} (${dataA.length} exp) vs ${params.categoryB} (${dataB.length} exp): ${volumeComparison.difference > 0 ? `${params.categoryA} has ${volumeComparison.difference} more` : `${params.categoryB} has ${Math.abs(volumeComparison.difference)} more`}`,
      }
    },
  })

// Backward compatibility: Default export using env vars (will be deprecated)
export const compareCategoryTool = createCompareCategoryTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchCategoryData(supabase: any, category: string, dateRange?: any) {
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

  if (error) {
    throw new Error(`Failed to fetch ${category} data: ${error.message}`)
  }

  return data || []
}

function analyzeGeography(data: any[]): Array<{ location: string; count: number }> {
  const locationCounts: Record<string, number> = {}

  data.forEach((exp: any) => {
    if (exp.location_text) {
      const normalized = exp.location_text.toLowerCase().trim()
      locationCounts[normalized] = (locationCounts[normalized] || 0) + 1
    }
  })

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
}

function analyzeTemporalDistribution(data: any[]): Array<{ month: string; count: number }> {
  const monthCounts: Record<string, number> = {}

  data.forEach((exp: any) => {
    if (exp.date_occurred) {
      const month = exp.date_occurred.slice(0, 7) // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1
    }
  })

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function analyzeAttributes(data: any[]): Array<{ key: string; count: number }> {
  const attrCounts: Record<string, number> = {}

  data.forEach((exp: any) => {
    const attrs = exp.experience_attributes || []
    attrs.forEach((attr: any) => {
      attrCounts[attr.attribute_key] = (attrCounts[attr.attribute_key] || 0) + 1
    })
  })

  return Object.entries(attrCounts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

function findOverlap(arrA: string[], arrB: string[]): string[] {
  return arrA.filter((item) => arrB.includes(item))
}

function findPeak(distribution: Array<{ month: string; count: number }>): string | null {
  if (distribution.length === 0) return null
  return distribution.reduce((max, curr) => (curr.count > max.count ? curr : max)).month
}

function calculateCorrelation(
  distA: Array<{ month: string; count: number }>,
  distB: Array<{ month: string; count: number }>
): number {
  // Simple correlation based on aligned months
  const monthsA = new Map(distA.map((d) => [d.month, d.count]))
  const monthsB = new Map(distB.map((d) => [d.month, d.count]))

  const allMonths = Array.from(new Set([...monthsA.keys(), ...monthsB.keys()]))

  const valuesA = allMonths.map((m) => monthsA.get(m) || 0)
  const valuesB = allMonths.map((m) => monthsB.get(m) || 0)

  if (valuesA.length < 2) return 0

  // Pearson correlation
  const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length
  const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length

  let numerator = 0
  let sumSqA = 0
  let sumSqB = 0

  for (let i = 0; i < valuesA.length; i++) {
    const diffA = valuesA[i] - meanA
    const diffB = valuesB[i] - meanB
    numerator += diffA * diffB
    sumSqA += diffA * diffA
    sumSqB += diffB * diffB
  }

  const denominator = Math.sqrt(sumSqA * sumSqB)

  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 1000
}
