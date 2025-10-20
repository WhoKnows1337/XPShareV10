import { tool } from 'ai'
import { z } from 'zod'
import { hybridSearch, type HybridSearchFilters } from '@/lib/search/hybrid'
import { generateEmbedding } from '@/lib/openai/client'

/**
 * Tool 1: Search Experiences
 *
 * Hybrid search combining Vector (semantic) + Full-Text Search (keywords) + RRF
 * Supports category-specific attribute filtering (170+ attributes across 43 categories)
 *
 * Used by: /app/api/discover/route.ts
 */

const SearchParamsSchema = z.object({
  // Natural language query for semantic search
  naturalQuery: z
    .string()
    .optional()
    .describe(
      'Natural language search query for semantic understanding (e.g., "strange lights in the night sky")'
    ),

  // Structured filters
  category: z
    .string()
    .optional()
    .describe('Category slug to filter by (e.g., "ufo-uap", "dreams", "nde")'),

  tags: z
    .array(z.string())
    .optional()
    .describe('Array of tags to filter by (e.g., ["triangle", "silent"])'),

  location: z
    .string()
    .optional()
    .describe('Location to filter by (fuzzy match, e.g., "Berlin", "Germany")'),

  dateRange: z
    .object({
      from: z
        .string()
        .optional()
        .describe('Start date in ISO format (YYYY-MM-DD)'),
      to: z
        .string()
        .optional()
        .describe('End date in ISO format (YYYY-MM-DD)'),
    })
    .optional()
    .describe('Date range filter'),

  witnessesOnly: z
    .boolean()
    .optional()
    .describe('Only return experiences with witnesses'),

  exclude: z
    .object({
      tags: z.array(z.string()).optional().describe('Tags to exclude'),
    })
    .optional()
    .describe('Exclusion filters'),

  // Category-specific attributes (170+ attributes)
  attributes: z
    .object({
      include: z
        .record(z.string(), z.array(z.string()))
        .optional()
        .describe(
          'Attributes that MUST be present (e.g., { "shape": ["triangle"], "light_color": ["red"] })'
        ),
      exclude: z
        .record(z.string(), z.array(z.string()))
        .optional()
        .describe(
          'Attributes that must NOT be present (e.g., { "surface": ["metallic"] })'
        ),
    })
    .optional()
    .describe('Category-specific attribute filters for precision search'),

  // Similarity search
  similarTo: z
    .string()
    .optional()
    .describe(
      'Experience ID to find similar experiences (uses vector similarity)'
    ),

  // Pagination & limits
  maxResults: z
    .number()
    .default(15)
    .describe('Maximum number of results to return (default: 15)'),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>

export const searchExperiencesTool = tool({
  description: `Search for experiences using hybrid search (semantic + keyword matching).

Capabilities:
- Semantic search via natural language queries
- Precision filtering via category-specific attributes (170+ attributes)
- Tag-based filtering with inclusion/exclusion
- Geographic filtering (location text matching)
- Temporal filtering (date ranges)
- Witness verification filtering
- Similarity search (find experiences similar to a specific one)

Best for:
- "Show me triangle UFOs in Germany" (natural query + location)
- "Find silent UFOs with red lights" (attributes: sound=silent, light_color=red)
- "Dreams about flying from last year" (category + dateRange)
- "Experiences similar to exp-123" (similarity search)`,

  parameters: SearchParamsSchema,

  execute: async (params: SearchParams) => {
    try {
      // Build filters object
      const filters: HybridSearchFilters = {
        category: params.category,
        tags: params.tags,
        location: params.location,
        dateRange: params.dateRange,
        witnessesOnly: params.witnessesOnly,
        exclude: params.exclude,
        attributes: params.attributes,
      }

      // Generate embedding if natural query provided
      let embedding: number[] | null = null
      if (params.naturalQuery) {
        embedding = await generateEmbedding(params.naturalQuery)
      }

      // Execute hybrid search
      const results = await hybridSearch({
        embedding,
        query: params.naturalQuery,
        filters,
        similarTo: params.similarTo,
        maxResults: params.maxResults,
      })

      // Return structured results (truncate descriptions for cost optimization)
      return {
        experiences: results.map((exp) => ({
          id: exp.id,
          title: exp.title,
          description: exp.description.substring(0, 200) + '...', // Truncate
          category: exp.category_slug,
          location: exp.location_text,
          date: exp.date_occurred,
          tags: exp.tags,
          attributes: exp.attributes || {},
          similarity_score: exp.similarity_score,
          username: exp.username,
          created_at: exp.created_at,
        })),
        count: results.length,
        hasMore: results.length === params.maxResults,
        filtersApplied: {
          category: !!params.category,
          tags: !!params.tags && params.tags.length > 0,
          location: !!params.location,
          dateRange: !!params.dateRange,
          attributes: !!(params.attributes?.include || params.attributes?.exclude),
          witnessesOnly: !!params.witnessesOnly,
        },
      }
    } catch (error: any) {
      console.error('Search tool error:', error)
      return {
        experiences: [],
        count: 0,
        hasMore: false,
        error: `Search failed: ${error.message}`,
      }
    }
  },
})
