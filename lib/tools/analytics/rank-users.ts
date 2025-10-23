/**
 * XPShare AI - Rank Users Tool
 *
 * User contribution rankings by experience count, category diversity, or XP.
 * Uses SQL function from Phase 1 for optimal performance.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const rankUsersSchema = z.object({
  category: z
    .string()
    .optional()
    .describe('Optional category filter (e.g., "ufo", "dreams")'),
  topN: z
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe('Number of top users to return'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createRankUsersTool = (supabase: any) =>
  tool({
    description:
      'Get top users ranked by contribution metrics (experience count, category diversity). Use this to find most active contributors or category experts.',
    inputSchema: rankUsersSchema,
    execute: async (params) => {
      // Call SQL function from Phase 1 (using request-scoped Supabase client)
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

// Backward compatibility: Default export using env vars (will be deprecated)
export const rankUsersTool = createRankUsersTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)
