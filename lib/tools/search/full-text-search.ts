/**
 * XPShare AI - Full-Text Search Tool
 *
 * Multi-language full-text search using PostgreSQL FTS.
 * Supports German, English, French, Spanish with ts_rank scoring.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const fullTextSearchSchema = z.object({
  query: z.string().describe('Search query text'),
  language: z
    .enum(['de', 'en', 'fr', 'es'])
    .default('de')
    .describe('Language for full-text search (de=German, en=English, fr=French, es=Spanish)'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Optional category filter to narrow results'),
  minRank: z
    .number()
    .min(0)
    .default(0)
    .describe('Minimum ts_rank score threshold (higher = more relevant)'),
  limit: z.number().min(1).max(100).default(50).describe('Maximum number of results'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const fullTextSearchTool = tool({
  description:
    'Multi-language full-text search with ranking. Searches through titles and story text using PostgreSQL FTS. Supports German, English, French, Spanish.',
  inputSchema: fullTextSearchSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('full_text_search', {
      p_query: params.query,
      p_language: params.language,
      p_category: params.categories?.[0], // SQL function takes single category
      p_min_rank: params.minRank,
      p_limit: params.limit,
    })

    if (error) {
      throw new Error(`Full-text search failed: ${error.message}`)
    }

    return {
      results: data || [],
      count: data?.length || 0,
      query: params.query,
      language: params.language,
      summary: `Found ${data?.length || 0} experiences matching "${params.query}" in ${params.language}`,
    }
  },
})
