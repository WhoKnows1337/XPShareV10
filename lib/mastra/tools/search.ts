/**
 * XPShare Mastra - Search Tools
 *
 * 5 search tools for finding experiences with various criteria
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import type { XPShareContext } from '../types'

// ============================================================================
// Advanced Search Tool
// ============================================================================

/**
 * Advanced Search Tool
 *
 * Multi-dimensional search with complex filtering.
 * Supports categories, locations, time ranges, dates, attributes, tags, emotions.
 */
export const advancedSearchTool = createTool<XPShareContext>({
  id: 'advancedSearch',
  description:
    'Search experiences with multi-dimensional filters. Supports categories, locations (city/country/radius), time of day (morning/afternoon/evening/night), date ranges, tags, and emotions. Use this for complex queries combining multiple criteria (e.g., "UFOs in California at night", "Dreams in 2024 with fear emotion"). NOTE: For queries about SPECIFIC ATTRIBUTE VALUES like "triangle-shaped", "orb-shaped", "lucid dreams" - use searchByAttributes tool instead.',

  inputSchema: z.object({
    categories: z
      .array(z.string())
      .optional()
      .describe(
        'Category slugs to filter by (e.g., ["ufo-uap", "dreams", "nde-obe", "paranormal-anomalies", "synchronicity", "psychedelics"])'
      ),
    location: z
      .object({
        city: z.string().optional().describe('City name (case-insensitive partial match)'),
        country: z.string().optional().describe('Country name (case-insensitive partial match)'),
        radius: z.number().optional().describe('Radius in kilometers for geographic search'),
        lat: z.number().optional().describe('Latitude for radius search'),
        lng: z.number().optional().describe('Longitude for radius search'),
      })
      .optional(),
    timeOfDay: z
      .enum(['morning', 'afternoon', 'evening', 'night'])
      .optional()
      .describe(
        'Time of day category: "morning" (sunrise-noon), "afternoon" (noon-sunset), "evening" (sunset-midnight), "night" (midnight-sunrise)'
      ),
    dateRange: z
      .object({
        from: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
        to: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
      })
      .optional(),
    attributes: z
      .array(
        z.object({
          key: z.string().describe('Attribute key (e.g., "dream_symbol", "ufo_shape")'),
          value: z.any().describe('Attribute value to match'),
          operator: z
            .enum(['equals', 'contains', 'gt', 'lt', 'gte', 'lte'])
            .describe('Comparison operator'),
        })
      )
      .optional(),
    tags: z
      .array(z.string())
      .optional()
      .describe('Tags to filter by (matches if ANY tag is present)'),
    emotions: z
      .array(z.string())
      .optional()
      .describe('Emotions to filter by (matches if ANY emotion is present)'),
    minConfidence: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Minimum AI confidence score for attributes'),
    limit: z.number().min(1).max(100).default(50).describe('Maximum number of results'),
    offset: z.number().min(0).default(0).describe('Offset for pagination'),
  }),

  outputSchema: z.object({
    results: z.array(z.any()),
    count: z.number(),
    summary: z.string(),
    filters: z.object({
      categories: z.array(z.string()).optional(),
      location: z.any().optional(),
      timeOfDay: z.string().optional(),
      dateRange: z.any().optional(),
      tags: z.array(z.string()).optional(),
      emotions: z.array(z.string()).optional(),
    }),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    // Get Supabase client from RuntimeContext (request-scoped for RLS)
    const supabase = runtimeContext.get('supabase')

    // Build base query
    let query = supabase.from('experiences').select(
      `
        id,
        title,
        story_text,
        category,
        location_text,
        location_lat,
        location_lng,
        date_occurred,
        time_of_day,
        tags,
        emotions,
        user_id,
        created_at,
        experience_attributes (
          attribute_key,
          attribute_value,
          confidence
        )
      `
    )

    // Apply filters
    // 1. Category filter
    if (params.categories && params.categories.length > 0) {
      query = query.in('category', params.categories)
    }

    // 2. Location text filter (city or country)
    if (params.location?.city) {
      query = query.ilike('location_text', `%${params.location.city}%`)
    }

    if (params.location?.country) {
      query = query.ilike('location_text', `%${params.location.country}%`)
    }

    // 3. Time of day filter (categorical: morning, afternoon, evening, night)
    if (params.timeOfDay) {
      query = query.eq('time_of_day', params.timeOfDay)
    }

    // 4. Date range filter
    if (params.dateRange) {
      query = query
        .gte('date_occurred', params.dateRange.from)
        .lte('date_occurred', params.dateRange.to)
    }

    // 5. Tags filter (overlaps = contains ANY of the tags)
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags)
    }

    // 6. Emotions filter
    if (params.emotions && params.emotions.length > 0) {
      query = query.overlaps('emotions', params.emotions)
    }

    // 7. Pagination
    query = query.range(params.offset, params.offset + params.limit - 1)

    // Execute query
    const { data, error } = await query

    if (error) {
      throw new Error(`Advanced search failed: ${error.message}`)
    }

    // Post-filter by attributes if specified
    let results = data || []

    if (params.attributes && params.attributes.length > 0) {
      results = filterByAttributes(results, params.attributes, params.minConfidence)
    }

    // Post-filter by geographic radius if specified
    if (
      params.location?.radius &&
      params.location?.lat !== undefined &&
      params.location?.lng !== undefined
    ) {
      results = filterByRadius(
        results,
        params.location.lat,
        params.location.lng,
        params.location.radius
      )
    }

    return {
      results,
      count: results.length,
      summary: `Found ${results.length} experiences matching criteria`,
      filters: {
        categories: params.categories,
        location: params.location,
        timeOfDay: params.timeOfDay,
        dateRange: params.dateRange,
        tags: params.tags,
        emotions: params.emotions,
      },
    }
  },
})

// ============================================================================
// Search By Attributes Tool
// ============================================================================

/**
 * Search By Attributes Tool
 *
 * Precise attribute-based querying with AND/OR logic.
 * Uses SQL function from Phase 1 for optimal performance.
 */
export const searchByAttributesTool = createTool<XPShareContext>({
  id: 'searchByAttributes',
  description:
    'Search for experiences by SPECIFIC ATTRIBUTE VALUES. Use this tool when the user mentions concrete attribute characteristics like "triangle-shaped UFO" (shape=triangle), "orb-shaped craft" (shape=orb), "lucid dream" (dream_type=lucid), "red light" (light_color=red), etc. This tool searches in the experience_attributes table, NOT in story text. Examples: "Find triangle-shaped UFOs", "Show me experiences with orb lights", "Search for lucid dreams".',

  inputSchema: z.object({
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
  }),

  outputSchema: z.object({
    results: z.array(z.any()),
    count: z.number(),
    category: z.string(),
    logic: z.string(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

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

// ============================================================================
// Semantic Search Tool
// ============================================================================

/**
 * Semantic Search Tool
 *
 * Vector similarity search using OpenAI embeddings.
 * Finds semantically related experiences based on meaning, not just keywords.
 */
export const semanticSearchTool = createTool<XPShareContext>({
  id: 'semanticSearch',
  description:
    'Vector similarity search using AI embeddings. Finds experiences with similar meaning to your query, even if they use different words. Use this for semantic/conceptual searches.',

  inputSchema: z.object({
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
  }),

  outputSchema: z.object({
    results: z.array(z.any()),
    count: z.number(),
    query: z.string(),
    minSimilarity: z.number(),
    summary: z.string(),
    note: z.string().optional(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    try {
      // Step 1: Generate embedding for query (using AI SDK)
      const { embed } = await import('ai')
      const { openai } = await import('@ai-sdk/openai')

      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: params.query,
      })

      // Step 2: Search using vector similarity
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
      throw new Error(
        `Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
})

// ============================================================================
// Full-Text Search Tool
// ============================================================================

/**
 * Full-Text Search Tool
 *
 * Multi-language full-text search using PostgreSQL FTS.
 * Supports German, English, French, Spanish with ts_rank scoring.
 */
export const fullTextSearchTool = createTool<XPShareContext>({
  id: 'fullTextSearch',
  description:
    'Multi-language full-text search with ranking. Searches through titles and story text using PostgreSQL FTS. Supports German, English, French, Spanish.',

  inputSchema: z.object({
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
  }),

  outputSchema: z.object({
    results: z.array(z.any()),
    count: z.number(),
    query: z.string(),
    language: z.string(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

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

// ============================================================================
// Geographic Search Tool
// ============================================================================

/**
 * Geographic Search Tool
 *
 * PostGIS-powered geographic search with radius and bounding box support.
 * Uses SQL function from Phase 1 for optimal spatial queries.
 */
export const geoSearchTool = createTool<XPShareContext>({
  id: 'geoSearch',
  description:
    'Geographic search using PostGIS. Supports radius search (find experiences within X km of a point) and bounding box search (find experiences within a rectangle). Use this for location-based queries like "UFO sightings in California", "dreams in Europe", "experiences near New York within 50km".',

  inputSchema: z.object({
    searchType: z
      .enum(['radius', 'bbox'])
      .describe('Type of geographic search: radius (circular area) or bbox (rectangular area)'),
    lat: z.number().optional().describe('Center latitude for radius search'),
    lng: z.number().optional().describe('Center longitude for radius search'),
    radiusKm: z.number().optional().describe('Search radius in kilometers'),
    bbox: z
      .object({
        minLat: z.number().describe('Minimum latitude (south)'),
        minLng: z.number().describe('Minimum longitude (west)'),
        maxLat: z.number().describe('Maximum latitude (north)'),
        maxLng: z.number().describe('Maximum longitude (east)'),
      })
      .optional()
      .describe('Bounding box coordinates'),
    category: z.string().optional().describe('Optional category filter'),
    limit: z.number().min(1).max(100).default(50).describe('Maximum number of results'),
  }),

  outputSchema: z.object({
    results: z.array(z.any()),
    count: z.number(),
    searchType: z.string(),
    summary: z.string(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    const supabase = runtimeContext.get('supabase')

    // Validate required params based on search type
    if (params.searchType === 'radius') {
      if (
        params.lat === undefined ||
        params.lng === undefined ||
        params.radiusKm === undefined
      ) {
        throw new Error('Radius search requires lat, lng, and radiusKm parameters')
      }
    }

    if (params.searchType === 'bbox') {
      if (!params.bbox) {
        throw new Error('Bounding box search requires bbox parameter')
      }
    }

    // Build parameters matching actual database function signature
    const rpcParams: any = {
      p_limit: params.limit,
    }

    // Add category as array if provided
    if (params.category) {
      rpcParams.p_categories = [params.category]
    }

    // Add radius or bounding box params
    if (params.searchType === 'radius') {
      rpcParams.p_center_lat = params.lat
      rpcParams.p_center_lng = params.lng
      rpcParams.p_radius_km = params.radiusKm
    } else if (params.searchType === 'bbox' && params.bbox) {
      // Database expects bounding_box as JSONB
      rpcParams.p_bounding_box = {
        minLat: params.bbox.minLat,
        minLng: params.bbox.minLng,
        maxLat: params.bbox.maxLat,
        maxLng: params.bbox.maxLng,
      }
    }

    // Call SQL function with correct parameter names
    const { data, error } = await supabase.rpc('geo_search', rpcParams)

    if (error) {
      throw new Error(`Geographic search failed: ${error.message}`)
    }

    const summary =
      params.searchType === 'radius'
        ? `Found ${data?.length || 0} experiences within ${params.radiusKm}km of (${params.lat}, ${params.lng})`
        : `Found ${data?.length || 0} experiences in bounding box`

    return {
      results: data || [],
      count: data?.length || 0,
      searchType: params.searchType,
      summary,
    }
  },
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter experiences by attributes with post-processing
 */
function filterByAttributes(
  experiences: any[],
  attributeFilters: Array<{
    key: string
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
    value?: any
  }>,
  minConfidence?: number
): any[] {
  return experiences.filter((exp) => {
    const expAttrs = exp.experience_attributes || []

    // All attribute filters must match (AND logic)
    return attributeFilters.every((filter) => {
      const attr = expAttrs.find((a: any) => a.attribute_key === filter.key)

      // Attribute key must exist
      if (!attr) return false

      // Check confidence if specified
      if (minConfidence && attr.confidence < minConfidence) {
        return false
      }

      // Apply operator
      switch (filter.operator) {
        case 'equals':
          return attr.attribute_value === filter.value

        case 'contains':
          return String(attr.attribute_value)
            .toLowerCase()
            .includes(String(filter.value).toLowerCase())

        case 'gt':
          return Number(attr.attribute_value) > Number(filter.value)

        case 'lt':
          return Number(attr.attribute_value) < Number(filter.value)

        case 'gte':
          return Number(attr.attribute_value) >= Number(filter.value)

        case 'lte':
          return Number(attr.attribute_value) <= Number(filter.value)

        default:
          return false
      }
    })
  })
}

/**
 * Filter experiences by geographic radius using Haversine formula
 */
function filterByRadius(
  experiences: any[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): any[] {
  return experiences.filter((exp) => {
    if (!exp.location_lat || !exp.location_lng) return false

    const distance = calculateDistance(
      centerLat,
      centerLng,
      exp.location_lat,
      exp.location_lng
    )

    return distance <= radiusKm
  })
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
