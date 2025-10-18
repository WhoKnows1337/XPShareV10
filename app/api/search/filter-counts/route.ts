import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 300 // Cache for 5 minutes

interface FilterCounts {
  categories: Record<string, number>
  locations: Array<{ location: string; count: number }>
  tags: Array<{ tag: string; count: number }>
  witnessRanges: {
    noWitnesses: number
    hasWitnesses: number
  }
  dateRanges: {
    last7Days: number
    last30Days: number
    last90Days: number
    last365Days: number
    olderThan1Year: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const currentQuery = searchParams.get('q')?.trim() || ''

    // Base query - only public experiences
    let baseQuery = supabase
      .from('experiences')
      .select('category, location_text, tags, question_answers, date_occurred', { count: 'exact' })
      .eq('visibility', 'public')

    // If there's a search query, filter results
    if (currentQuery) {
      baseQuery = baseQuery.or(
        `title.ilike.%${currentQuery}%,story_text.ilike.%${currentQuery}%,location_text.ilike.%${currentQuery}%`
      )
    }

    const { data: experiences, error } = await baseQuery

    if (error) {
      throw error
    }

    if (!experiences) {
      return NextResponse.json({
        categories: {},
        locations: [],
        tags: [],
        witnessRanges: { noWitnesses: 0, hasWitnesses: 0 },
        dateRanges: {
          last7Days: 0,
          last30Days: 0,
          last90Days: 0,
          last365Days: 0,
          olderThan1Year: 0,
        },
      })
    }

    // Calculate category counts
    const categoryCounts = experiences.reduce((acc, exp) => {
      if (exp.category) {
        acc[exp.category] = (acc[exp.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate location counts (top 20)
    const locationCounts = experiences
      .filter(exp => exp.location_text)
      .reduce((acc, exp) => {
        const loc = exp.location_text!
        acc[loc] = (acc[loc] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Calculate tag counts (top 30)
    const tagCounts = experiences
      .flatMap(exp => exp.tags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)

    // Calculate witness ranges (from question_answers JSONB)
    const witnessRanges = {
      noWitnesses: experiences.filter(exp => {
        const witnesses = exp.question_answers?.witnesses || exp.question_answers?.witness_count
        return !witnesses || witnesses === 0 || witnesses === '0' || witnesses === 'none'
      }).length,
      hasWitnesses: experiences.filter(exp => {
        const witnesses = exp.question_answers?.witnesses || exp.question_answers?.witness_count
        return witnesses && witnesses !== 0 && witnesses !== '0' && witnesses !== 'none'
      }).length,
    }

    // Calculate date ranges
    const now = new Date()
    const dateRanges = {
      last7Days: 0,
      last30Days: 0,
      last90Days: 0,
      last365Days: 0,
      olderThan1Year: 0,
    }

    experiences.forEach(exp => {
      if (!exp.date_occurred) return

      const expDate = new Date(exp.date_occurred)
      const daysDiff = Math.floor((now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff <= 7) dateRanges.last7Days++
      else if (daysDiff <= 30) dateRanges.last30Days++
      else if (daysDiff <= 90) dateRanges.last90Days++
      else if (daysDiff <= 365) dateRanges.last365Days++
      else dateRanges.olderThan1Year++
    })

    const filterCounts: FilterCounts = {
      categories: categoryCounts,
      locations: topLocations,
      tags: topTags,
      witnessRanges,
      dateRanges,
    }

    return NextResponse.json(filterCounts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Filter counts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter counts' },
      { status: 500 }
    )
  }
}
