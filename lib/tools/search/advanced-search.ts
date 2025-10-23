/**
 * XPShare AI - Advanced Search Tool
 *
 * Multi-dimensional search with complex filtering.
 * Supports categories, locations, time ranges, dates, attributes, tags, emotions.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const advancedSearchSchema = z.object({
  categories: z
    .array(z.string())
    .optional()
    .describe('Category slugs to filter by (e.g., ["ufo-uap", "dreams", "nde-obe", "paranormal-anomalies", "synchronicity", "psychedelics"])'),
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
    .describe('Time of day category: "morning" (sunrise-noon), "afternoon" (noon-sunset), "evening" (sunset-midnight), "night" (midnight-sunrise)'),
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
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createAdvancedSearchTool = (supabase: any) =>
  tool({
    description:
      'Search experiences with multi-dimensional filters. Supports categories, locations (city/country/radius), time of day (morning/afternoon/evening/night), date ranges, tags, and emotions. Use this for complex queries combining multiple criteria (e.g., "UFOs in California at night", "Dreams in 2024 with fear emotion"). NOTE: For queries about SPECIFIC ATTRIBUTE VALUES like "triangle-shaped", "orb-shaped", "lucid dreams" - use searchByAttributes tool instead.',
    inputSchema: advancedSearchSchema,
    execute: async (params) => {
      // Build base query (using request-scoped Supabase client)
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

// Backward compatibility: Default export using env vars (will be deprecated)
export const advancedSearchTool = createAdvancedSearchTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)

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
