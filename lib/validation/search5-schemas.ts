/**
 * Search 5.0 - Zod Validation Schemas
 *
 * Runtime validation schemas for all Search 5.0 API responses and data structures.
 * Provides type safety + error recovery for LLM-generated outputs.
 *
 * Pattern: OpenAI JSON Schema (generation) + Zod safeParse (runtime validation)
 * - JSON Schema enforces structure at LLM generation time
 * - Zod catches edge cases, validates ranges, provides fallbacks
 *
 * @see docs/masterdocs/search5.md (Part 3.4 - Error Recovery)
 */

import { z } from 'zod'

// ============================================================================
// PATTERN DATA SCHEMAS
// ============================================================================

/**
 * Distribution item for color/attribute patterns
 * Example: { label: "Orange", count: 12, percentage: 45.5 }
 */
export const DistributionItemSchema = z.object({
  label: z.string().min(1).max(50),
  count: z.number().int().positive(),
  percentage: z.number().min(0).max(100).optional()
})

/**
 * Timeline item for temporal patterns
 * Example: { month: "2024-03", count: 5, highlight: true }
 */
export const TimelineItemSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),  // YYYY-MM format validation
  count: z.number().int().nonnegative(),
  highlight: z.boolean().optional()
})

/**
 * Geographic cluster for location patterns
 */
export const GeoClusterSchema = z.object({
  center: z.string().min(1).max(100),
  radius: z.number().positive(),
  count: z.number().int().positive(),
  heatmap: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    weight: z.number().min(0).max(1)
  })).optional()
})

/**
 * Pattern data container (structured data for visualizations)
 */
export const PatternDataSchema = z.object({
  distribution: z.array(DistributionItemSchema).max(20).optional(),
  timeline: z.array(TimelineItemSchema).max(24).optional(),  // Max 2 years
  geoCluster: GeoClusterSchema.optional()
})

// ============================================================================
// PATTERN SCHEMA
// ============================================================================

/**
 * Pattern type enum
 */
export const PatternTypeSchema = z.enum([
  'color',
  'temporal',
  'behavior',
  'location',
  'attribute'
])

/**
 * Visualization type for patterns
 */
export const VisualizationTypeSchema = z.enum([
  'bar',
  'timeline',
  'map',
  'tag-cloud'
])

/**
 * Single detected pattern with metadata
 */
export const PatternSchema = z.object({
  type: PatternTypeSchema,
  title: z.string().min(5).max(100),
  finding: z.string().min(10).max(500),
  confidence: z.number().min(0).max(100).optional().default(0),
  sourceIds: z.array(z.string()).min(0).max(15),  // Experience IDs
  citationIds: z.array(z.number().int().positive()).optional(),
  data: PatternDataSchema,
  visualizationType: VisualizationTypeSchema.optional().default('bar')
})

// ============================================================================
// SERENDIPITY SCHEMA
// ============================================================================

/**
 * Source experience in serendipity connection
 */
export const SerendipityExperienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  similarity: z.number().min(0).max(1),
  excerpt: z.string().optional()
})

/**
 * Serendipity connection (unexpected but relevant cross-category pattern)
 */
export const SerendipitySchema = z.object({
  targetCategory: z.string().min(1).max(50),
  similarity: z.number().min(0).max(1),
  explanation: z.string().min(10).max(300),
  count: z.number().int().positive(),
  experiences: z.array(SerendipityExperienceSchema).max(5).optional()
})

// ============================================================================
// SOURCE SCHEMA
// ============================================================================

/**
 * Source experience reference
 */
export const SourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  excerpt: z.string().optional(),
  fullText: z.string().optional(),
  category: z.string(),
  similarity: z.number().min(0).max(1),
  date_occurred: z.string().optional(),
  location_text: z.string().optional(),
  attributes: z.array(z.string()).optional()
})

// ============================================================================
// METADATA SCHEMA
// ============================================================================

/**
 * Response metadata (quality indicators)
 */
export const MetadataSchema = z.object({
  confidence: z.number().int().min(0).max(100),
  sourceCount: z.number().int().nonnegative(),
  patternsFound: z.number().int().nonnegative(),
  executionTime: z.number().int().positive(),
  warnings: z.array(z.string()).default([])
})

// ============================================================================
// MAIN RESPONSE SCHEMA
// ============================================================================

/**
 * Complete Search 5.0 API response
 * This schema is used for runtime validation of LLM outputs
 */
export const Search5ResponseSchema = z.object({
  patterns: z.array(PatternSchema).min(0).max(10),
  serendipity: SerendipitySchema.optional(),
  sources: z.array(SourceSchema).min(0).max(15),
  metadata: MetadataSchema
})

/**
 * Infer TypeScript type from schema (for type checking)
 * Note: This is a Zod-derived type, not the main Search5Response from /types/search5.ts
 * Use this for validation results, use Search5Response from /types for general typing
 */
export type Search5ResponseValidated = z.infer<typeof Search5ResponseSchema>

// ============================================================================
// QUERY REFINEMENT SCHEMAS
// ============================================================================

/**
 * Date range validation
 */
export const DateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).refine(
  (data) => new Date(data.from) <= new Date(data.to),
  { message: "Start date must be before or equal to end date" }
)

/**
 * Query refinements validation
 */
export const QueryRefinementsSchema = z.object({
  confidenceThreshold: z.number().min(0).max(100).optional(),
  dateRange: DateRangeSchema.optional(),
  categories: z.array(z.string()).max(10).optional(),
  maxSources: z.number().int().min(1).max(50).optional().default(15)
})

// ============================================================================
// CONVERSATION SCHEMAS
// ============================================================================

/**
 * Conversation turn validation
 */
export const ConversationTurnSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.coerce.date(),  // Coerce string to Date
  query: z.string().min(5).max(500),
  response: Search5ResponseSchema,
  refinements: QueryRefinementsSchema.optional()
})

/**
 * Conversation history validation (for localStorage restore)
 */
export const ConversationHistorySchema = z.array(ConversationTurnSchema).max(50)

// ============================================================================
// FOLLOW-UP SUGGESTION SCHEMAS
// ============================================================================

/**
 * Follow-up question suggestion
 */
export const FollowUpSuggestionSchema = z.object({
  question: z.string().min(10).max(200),
  rationale: z.string().max(500).optional(),
  targetPattern: z.string().optional()
})

// ============================================================================
// FILTER & SEARCH SCHEMAS
// ============================================================================

/**
 * Search filters validation (for API requests)
 */
export const SearchFiltersSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  witnessesOnly: z.boolean().optional()
})

/**
 * Sort/Group options validation
 */
export const SortBySchema = z.enum(['confidence', 'relevance', 'recency', 'type'])
export const GroupBySchema = z.enum(['none', 'category', 'type', 'confidence-tier'])

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

/**
 * Chat API request body validation
 */
export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1)
  })).min(1),
  maxSources: z.number().int().min(1).max(50).optional().default(15),
  category: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  witnessesOnly: z.boolean().optional(),
  conversationContext: z.string().optional()  // JSON-stringified context
})

// ============================================================================
// ERROR RECOVERY HELPERS
// ============================================================================

/**
 * Safe parse with fallback for Search5Response
 * Returns validated data or sensible default on error
 */
export function parseSearch5Response(data: unknown): Search5ResponseValidated {
  const result = Search5ResponseSchema.safeParse(data)

  if (result.success) {
    return result.data
  }

  // Log validation errors for debugging
  console.error('Search5Response validation failed:', {
    errors: result.error.errors,
    data: JSON.stringify(data, null, 2).substring(0, 500)
  })

  // Return safe fallback
  return {
    patterns: [],
    sources: [],
    metadata: {
      confidence: 0,
      sourceCount: 0,
      patternsFound: 0,
      executionTime: 0,
      warnings: ['Validation error: Response could not be parsed']
    }
  }
}

/**
 * Safe parse for conversation history from localStorage
 */
export function parseConversationHistory(data: unknown): z.infer<typeof ConversationTurnSchema>[] {
  const result = ConversationHistorySchema.safeParse(data)

  if (result.success) {
    return result.data
  }

  console.warn('Conversation history validation failed, clearing history')
  return []
}

/**
 * Validate and sanitize query refinements
 */
export function parseQueryRefinements(data: unknown): z.infer<typeof QueryRefinementsSchema> | null {
  const result = QueryRefinementsSchema.safeParse(data)

  if (result.success) {
    return result.data
  }

  console.warn('Query refinements validation failed:', result.error.errors)
  return null
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PatternType = z.infer<typeof PatternTypeSchema>
export type VisualizationType = z.infer<typeof VisualizationTypeSchema>
export type Pattern = z.infer<typeof PatternSchema>
export type PatternData = z.infer<typeof PatternDataSchema>
export type Serendipity = z.infer<typeof SerendipitySchema>
export type Source = z.infer<typeof SourceSchema>
export type Metadata = z.infer<typeof MetadataSchema>
export type QueryRefinements = z.infer<typeof QueryRefinementsSchema>
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>
export type SearchFilters = z.infer<typeof SearchFiltersSchema>
export type SortBy = z.infer<typeof SortBySchema>
export type GroupBy = z.infer<typeof GroupBySchema>
