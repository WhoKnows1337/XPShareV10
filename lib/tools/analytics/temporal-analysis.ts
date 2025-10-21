/**
 * XPShare AI - Temporal Analysis Tool
 *
 * Time-based pattern discovery and aggregation.
 * Uses SQL function from Phase 1 for optimal performance.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const temporalAnalysisSchema = z.object({
  granularity: z
    .enum(['hour', 'day', 'week', 'month', 'year'])
    .describe('Time granularity for aggregation'),
  category: z
    .string()
    .optional()
    .describe('Optional category filter'),
  location: z
    .string()
    .optional()
    .describe('Optional location filter (text match)'),
  dateRange: z
    .object({
      from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
      to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
    })
    .optional()
    .describe('Optional date range to analyze'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const temporalAnalysisTool = tool({
  description:
    'Analyze temporal patterns and trends. Aggregates experiences by time periods (hour/day/week/month/year) with optional category and location grouping. Use this to discover time-based patterns.',
  inputSchema: temporalAnalysisSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('temporal_aggregation', {
      p_granularity: params.granularity,
      p_category: params.category,
      p_location: params.location,
      p_start_date: params.dateRange?.from,
      p_end_date: params.dateRange?.to,
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
