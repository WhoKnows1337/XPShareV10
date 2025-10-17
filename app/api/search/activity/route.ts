import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Public Search Activity API
 *
 * GET /api/search/activity?days=1
 *
 * Returns public search statistics (no authentication required):
 * - Total searches in time period
 * - Top searches
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '1')

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Total searches count
    const { count: totalSearches } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())

    // Top searches aggregation
    const { data: recentSearches } = await supabase
      .from('search_analytics')
      .select('query_text, result_count')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)

    // Aggregate manually (group by query)
    const queryCount: Record<string, { count: number; avgResults: number }> = {}
    recentSearches?.forEach((row) => {
      const key = row.query_text.toLowerCase().trim()
      if (!key || key.length === 0) return // Skip empty queries

      if (!queryCount[key]) {
        queryCount[key] = { count: 0, avgResults: 0 }
      }
      queryCount[key].count++
      queryCount[key].avgResults += row.result_count || 0
    })

    const topSearches = Object.entries(queryCount)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avg_results: Math.round(stats.avgResults / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 searches

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      data: {
        total_searches: totalSearches || 0,
        top_searches: topSearches,
        period_days: days,
      },
      meta: {
        executionTime,
        since: since.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Search activity error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch search activity',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
