import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Search Analytics API for Admin Dashboard
 *
 * GET /api/admin/search-analytics?type={type}
 *
 * Types:
 * - top-searches: Top 20 most frequent searches
 * - zero-results: Queries with 0 results (optimization potential)
 * - trends: Search volume over time (7/30 days)
 * - low-relevance: Queries with lowest avg execution time or high bounce
 * - overview: Summary stats
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()

    // Check authentication (admin only)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check from profiles table
    // For now, any authenticated user can access

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'overview'
    const days = parseInt(searchParams.get('days') || '7')

    const since = new Date()
    since.setDate(since.getDate() - days)

    let data: any = {}

    switch (type) {
      case 'top-searches': {
        // Top 20 most frequent searches
        const { data: topSearches, error } = await supabase.rpc('get_top_searches' as any, {
          days_ago: days,
          limit_count: 20,
        })

        if (error) {
          // Fallback if RPC doesn't exist
          const { data: fallback } = await supabase
            .from('search_analytics')
            .select('query_text, result_count')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(1000)

          // Aggregate manually
          const queryCount: Record<string, { count: number; avgResults: number }> = {}
          fallback?.forEach((row) => {
            const key = row.query_text.toLowerCase()
            if (!queryCount[key]) {
              queryCount[key] = { count: 0, avgResults: 0 }
            }
            queryCount[key].count++
            queryCount[key].avgResults += row.result_count || 0
          })

          data = Object.entries(queryCount)
            .map(([query, stats]) => ({
              query,
              count: stats.count,
              avg_results: Math.round(stats.avgResults / stats.count),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20)
        } else {
          data = topSearches
        }
        break
      }

      case 'zero-results': {
        // Queries with 0 results (optimization potential)
        const { data: zeroResults } = await supabase
          .from('search_analytics')
          .select('query_text, search_type, language, filters, created_at')
          .eq('result_count', 0)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(50)

        // Aggregate by query
        const queryCount: Record<string, { count: number; last_seen: string }> = {}
        zeroResults?.forEach((row) => {
          const key = row.query_text.toLowerCase()
          const createdAt = row.created_at || new Date().toISOString()
          if (!queryCount[key]) {
            queryCount[key] = { count: 0, last_seen: createdAt }
          }
          queryCount[key].count++
          if (new Date(createdAt) > new Date(queryCount[key].last_seen)) {
            queryCount[key].last_seen = createdAt
          }
        })

        data = Object.entries(queryCount)
          .map(([query, stats]) => ({
            query,
            occurrences: stats.count,
            last_seen: stats.last_seen,
          }))
          .sort((a, b) => b.occurrences - a.occurrences)
          .slice(0, 20)

        break
      }

      case 'trends': {
        // Search volume over time (daily buckets)
        const { data: searches } = await supabase
          .from('search_analytics')
          .select('created_at, query_text')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: true })

        // Group by date
        const dailyCount: Record<string, number> = {}
        searches?.forEach((row) => {
          const createdAt = row.created_at || new Date().toISOString()
          const date = new Date(createdAt).toISOString().split('T')[0]
          dailyCount[date] = (dailyCount[date] || 0) + 1
        })

        data = Object.entries(dailyCount)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))

        break
      }

      case 'low-relevance': {
        // Queries with lowest avg results or high execution time
        const { data: searches } = await supabase
          .from('search_analytics')
          .select('query_text, result_count, execution_time_ms')
          .gte('created_at', since.toISOString())
          .gt('result_count', 0) // Exclude zero results (separate category)
          .order('created_at', { ascending: false })
          .limit(1000)

        // Aggregate by query
        const queryStats: Record<
          string,
          { count: number; totalResults: number; totalTime: number }
        > = {}
        searches?.forEach((row) => {
          const key = row.query_text.toLowerCase()
          if (!queryStats[key]) {
            queryStats[key] = { count: 0, totalResults: 0, totalTime: 0 }
          }
          queryStats[key].count++
          queryStats[key].totalResults += row.result_count || 0
          queryStats[key].totalTime += row.execution_time_ms || 0
        })

        data = Object.entries(queryStats)
          .map(([query, stats]) => ({
            query,
            avg_results: Math.round(stats.totalResults / stats.count),
            avg_time_ms: Math.round(stats.totalTime / stats.count),
            occurrences: stats.count,
          }))
          .filter((q) => q.avg_results < 5 && q.occurrences >= 2) // Low results, searched multiple times
          .sort((a, b) => a.avg_results - b.avg_results)
          .slice(0, 20)

        break
      }

      case 'overview':
      default: {
        // Summary statistics
        const { count: totalSearches } = await supabase
          .from('search_analytics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', since.toISOString())

        const { count: zeroResultsCount } = await supabase
          .from('search_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('result_count', 0)
          .gte('created_at', since.toISOString())

        const { data: avgData } = await supabase
          .from('search_analytics')
          .select('result_count, execution_time_ms')
          .gte('created_at', since.toISOString())

        const avgResults =
          avgData && avgData.length > 0
            ? avgData.reduce((sum, row) => sum + (row.result_count || 0), 0) / avgData.length
            : 0

        const avgTime =
          avgData && avgData.length > 0
            ? avgData.reduce((sum, row) => sum + (row.execution_time_ms || 0), 0) / avgData.length
            : 0

        // Unique queries
        const { data: uniqueQueries } = await supabase
          .from('search_analytics')
          .select('query_text')
          .gte('created_at', since.toISOString())

        const uniqueCount = new Set(uniqueQueries?.map((r) => r.query_text.toLowerCase())).size

        data = {
          total_searches: totalSearches || 0,
          unique_queries: uniqueCount,
          zero_results_count: zeroResultsCount || 0,
          zero_results_rate: totalSearches ? ((zeroResultsCount || 0) / totalSearches) * 100 : 0,
          avg_results: Math.round(avgResults),
          avg_execution_time_ms: Math.round(avgTime),
          period_days: days,
        }

        break
      }
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      type,
      data,
      meta: {
        executionTime,
        days,
        since: since.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Search analytics error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch search analytics',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
