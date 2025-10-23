/**
 * XPShare AI - Attribute Correlation Tool
 *
 * Find correlations between attributes within a category.
 * Analyzes co-occurrence patterns and statistical relationships.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const attributeCorrelationSchema = z.object({
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
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createAttributeCorrelationTool = (supabase: any) =>
  tool({
    description:
      'Find correlations between attributes within a category. Analyzes which attributes frequently appear together and their co-occurrence strength. Use this to discover attribute patterns and relationships.',
    inputSchema: attributeCorrelationSchema,
    execute: async (params) => {
      // Fetch category experiences with attributes (using request-scoped Supabase client)
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
        cooccurrences: number
        liftScore: number
        confidence: number
      }> = []

      const totalExperiences = experiences.length

      Object.entries(cooccurrenceMatrix).forEach(([keyA, cooccurrences]) => {
        Object.entries(cooccurrences).forEach(([keyB, count]) => {
          // Skip if below minimum or if we've already added the reverse pair
          if (
            count < params.minCooccurrence ||
            correlations.some((c) => c.attributeA === keyB && c.attributeB === keyA)
          ) {
            return
          }

          // Filter by specific attribute if requested
          if (params.attributeKey && keyA !== params.attributeKey && keyB !== params.attributeKey) {
            return
          }

          const countA = attributeCounts[keyA]
          const countB = attributeCounts[keyB]

          // Calculate lift score: P(A,B) / (P(A) * P(B))
          const pAB = count / totalExperiences
          const pA = countA / totalExperiences
          const pB = countB / totalExperiences

          const liftScore = pAB / (pA * pB)

          // Calculate confidence: P(B|A) = P(A,B) / P(A)
          const confidence = count / countA

          correlations.push({
            attributeA: keyA,
            attributeB: keyB,
            cooccurrences: count,
            liftScore: Math.round(liftScore * 1000) / 1000,
            confidence: Math.round(confidence * 1000) / 1000,
          })
        })
      })

      // Sort by lift score and take top N
      const topCorrelations = correlations
        .sort((a, b) => b.liftScore - a.liftScore)
        .slice(0, params.topN)

      return {
        category: params.category,
        attributeKey: params.attributeKey,
        totalExperiences,
        totalAttributes: Object.keys(attributeCounts).length,
        correlations: topCorrelations,
        summary: {
          topCorrelation: topCorrelations[0] || null,
          averageLift:
            topCorrelations.length > 0
              ? Math.round(
                  (topCorrelations.reduce((sum, c) => sum + c.liftScore, 0) /
                    topCorrelations.length) *
                    1000
                ) / 1000
              : 0,
          totalPairs: correlations.length,
        },
        summaryText: params.attributeKey
          ? `Found ${topCorrelations.length} attribute correlations with "${params.attributeKey}" in ${params.category}`
          : `Found ${topCorrelations.length} attribute correlations in ${params.category}`,
      }
    },
  })

// Backward compatibility: Default export using env vars (will be deprecated)
export const attributeCorrelationTool = createAttributeCorrelationTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)
