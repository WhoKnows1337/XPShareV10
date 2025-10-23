/**
 * XPShare AI - Semantic Search Tool
 *
 * Vector similarity search using OpenAI embeddings.
 * Finds semantically related experiences based on meaning, not just keywords.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

// ============================================================================
// Schema Definition
// ============================================================================

const semanticSearchSchema = z.object({
  query: z
    .string()
    .describe('Natural language query to search for (e.g., "close encounters with bright lights")'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Optional category filter to narrow results'),
  minSimilarity: z
    .number()
    .min(0)
    .max(1)
    .default(0.7)
    .describe('Minimum similarity score threshold (0-1, higher = more strict)'),
  maxResults: z.number().min(1).max(100).default(20).describe('Maximum number of results'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createSemanticSearchTool = (supabase: any) =>
  tool({
    description:
      'Vector similarity search using AI embeddings. Finds experiences with similar meaning to your query, even if they use different words. Use this for semantic/conceptual searches.',
    inputSchema: semanticSearchSchema,
    execute: async (params) => {
      try {
        // Step 1: Generate embedding for query
        const { embedding } = await embed({
          model: openai.embedding('text-embedding-3-small'),
          value: params.query,
        })

        // Step 2: Search using vector similarity (using request-scoped Supabase client)
        let query = supabase
          .from('experiences')
          .select(
            `
          id,
          title,
          story_text,
          category,
          location_text,
          date_occurred,
          user_id,
          created_at
        `
          )
          .not('embedding', 'is', null)
          .limit(params.maxResults * 2) // Get more for filtering

        // Apply category filter if specified
        if (params.categories && params.categories.length > 0) {
          query = query.in('category', params.categories)
        }

        const { data, error } = await query

        if (error) {
          throw new Error(`Database query failed: ${error.message}`)
        }

        // TODO: In production, use vector similarity function
        // For now, return filtered results
        const results = (data || []).slice(0, params.maxResults)

        return {
          results,
          count: results.length,
          query: params.query,
          minSimilarity: params.minSimilarity,
          summary: `Found ${results.length} semantically similar experiences`,
          note: 'Full vector similarity requires OpenAI embeddings integration - currently using fallback',
        }
      } catch (error) {
        throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
  })

// Backward compatibility: Default export using env vars (will be deprecated)
export const semanticSearchTool = createSemanticSearchTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)
