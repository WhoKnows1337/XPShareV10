/**
 * XPShare AI - Geographic Search Tool
 *
 * PostGIS-powered geographic search with radius and bounding box support.
 * Uses SQL function from Phase 1 for optimal spatial queries.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const geoSearchSchema = z.object({
  searchType: z
    .enum(['radius', 'bbox'])
    .describe('Search type: radius (circle) or bbox (bounding box)'),
  lat: z.number().optional().describe('Latitude for radius search center'),
  lng: z.number().optional().describe('Longitude for radius search center'),
  radiusKm: z.number().optional().describe('Radius in kilometers for radius search'),
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
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const geoSearchTool = tool({
  description:
    'Geographic search using PostGIS. Supports radius search (find experiences within X km of a point) and bounding box search (find experiences within a rectangle). Use this for location-based queries.',
  inputSchema: geoSearchSchema,
  execute: async (params) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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

    // Call SQL function from Phase 1
    const { data, error } = await supabase.rpc('geo_search', {
      p_search_type: params.searchType,
      p_lat: params.lat,
      p_lng: params.lng,
      p_radius_km: params.radiusKm,
      p_min_lat: params.bbox?.minLat,
      p_min_lng: params.bbox?.minLng,
      p_max_lat: params.bbox?.maxLat,
      p_max_lng: params.bbox?.maxLng,
      p_category: params.category,
      p_limit: params.limit,
    })

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
