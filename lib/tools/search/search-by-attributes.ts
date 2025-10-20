/**
 * XPShare AI - Search By Attributes Tool
 *
 * Precise attribute-based querying with AND/OR logic.
 * Uses SQL function from Phase 1 for optimal performance.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const searchByAttributesSchema = z.object({
  category: z.string().describe('Category to search within (e.g., "ufo", "dreams")'),
  attributeFilters: z
    .array(
      z.object({
        key: z.string().describe('Attribute key (e.g., "dream_symbol", "ufo_shape")'),
        value: z.string().optional().describe('Attribute value (optional for "exists" operator)'),
        operator: z
          .enum(['equals', 'contains', 'exists'])
          .describe('Matching operator: equals (exact), contains (substring), exists (key only)'),
      })
    )
    .describe('Array of attribute filters to apply'),
  logic: z
    .enum(['AND', 'OR'])
    .default('AND')
    .describe('Logical operator: AND (all filters match) or OR (any filter matches)'),
  minConfidence: z
    .number()
    .min(0)
    .max(1)
    .default(0)
    .describe('Minimum AI confidence score (0-1) for attribute extraction'),
  limit: z.number().min(1).max(100).default(50).describe('Maximum number of results'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const searchByAttributesTool = tool({
  description:
    'Find experiences with specific attributes using precise matching. Supports equals, contains, and exists operators with AND/OR logic. Use this when searching for specific attribute values within a category.',
  parameters: searchByAttributesSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('search_by_attributes', {
      p_category: params.category,
      p_attribute_filters: params.attributeFilters,
      p_logic: params.logic,
      p_min_confidence: params.minConfidence,
      p_limit: params.limit,
    })

    if (error) {
      throw new Error(`Attribute search failed: ${error.message}`)
    }

    return {
      results: data || [],
      count: data?.length || 0,
      category: params.category,
      logic: params.logic,
      summary: `Found ${data?.length || 0} ${params.category} experiences matching ${params.logic} criteria`,
    }
  },
})
