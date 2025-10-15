import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Faceted Search API - Dynamic filter counts
 *
 * Returns aggregated counts for all filter options based on current search results
 * Enables "Category (count)" badges and dynamic filter UI
 *
 * POST /api/search/facets
 * Body: {
 *   query?: string,
 *   currentFilters?: { category?, dateRange?, etc. }
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const { query, currentFilters = {} } = await req.json()

    const supabase = await createClient()

    // Build base query
    let baseQuery = supabase
      .from('experiences')
      .select('category, date_occurred, tags, location_text', { count: 'exact', head: false })
      .eq('visibility', 'public')

    // Apply existing filters (except the one we're counting for)
    if (query && query.trim()) {
      // Simple text search for now (would use full-text search in production)
      baseQuery = baseQuery.or(`title.ilike.%${query}%,story_text.ilike.%${query}%`)
    }

    if (currentFilters.dateRange) {
      if (currentFilters.dateRange.from) {
        baseQuery = baseQuery.gte('date_occurred', currentFilters.dateRange.from)
      }
      if (currentFilters.dateRange.to) {
        baseQuery = baseQuery.lte('date_occurred', currentFilters.dateRange.to)
      }
    }

    // Fetch all matching experiences
    const { data: experiences, error } = await baseQuery

    if (error) throw error

    if (!experiences || experiences.length === 0) {
      return NextResponse.json({
        categories: {},
        tags: {},
        locations: {},
        total: 0
      })
    }

    // Aggregate counts
    const categoryCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {}
    const locationCounts: Record<string, number> = {}

    experiences.forEach((exp: any) => {
      // Category counts
      if (exp.category) {
        categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1
      }

      // Tag counts
      if (exp.tags && Array.isArray(exp.tags)) {
        exp.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }

      // Location counts (city/region level)
      if (exp.location_text) {
        // Extract city from location text (simplified)
        const city = exp.location_text.split(',')[0].trim()
        if (city) {
          locationCounts[city] = (locationCounts[city] || 0) + 1
        }
      }
    })

    // Sort by count descending and limit to top N
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})

    const sortedLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})

    return NextResponse.json({
      categories: sortedCategories,
      tags: sortedTags,
      locations: sortedLocations,
      total: experiences.length
    })

  } catch (error: any) {
    console.error('Faceted search error:', error)
    return NextResponse.json(
      { error: 'Failed to get facet counts', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET - Get facet counts without filters (for initial state)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get category counts
    const { data: catData, error: catError } = await supabase
      .from('experiences')
      .select('category')
      .eq('visibility', 'public')

    if (catError) throw catError

    const categoryCounts: Record<string, number> = {}
    catData?.forEach((row: any) => {
      if (row.category) {
        categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1
      }
    })

    // Get popular tags (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: tagData, error: tagError } = await supabase
      .from('experiences')
      .select('tags')
      .eq('visibility', 'public')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (tagError) throw tagError

    const tagCounts: Record<string, number> = {}
    tagData?.forEach((row: any) => {
      if (row.tags && Array.isArray(row.tags)) {
        row.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Sort and limit
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})

    return NextResponse.json({
      categories: sortedCategories,
      tags: sortedTags,
      total: catData?.length || 0
    })

  } catch (error: any) {
    console.error('Faceted search GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get facet counts', details: error.message },
      { status: 500 }
    )
  }
}
