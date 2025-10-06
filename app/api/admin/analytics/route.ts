import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  await requireAdmin()
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  try {
    // Get summary data from materialized view
    let summaryQuery = supabase
      .from('question_analytics_summary')
      .select('*')

    if (categoryId) {
      summaryQuery = summaryQuery.eq('category_id', categoryId)
    }

    const { data: summary, error: summaryError } = await summaryQuery

    if (summaryError) throw summaryError

    // Get time-series data for charts
    let timeSeriesQuery = supabase
      .from('question_analytics')
      .select('*')
      .order('date', { ascending: true })

    if (categoryId) {
      timeSeriesQuery = timeSeriesQuery.eq('category_id', categoryId)
    }

    if (startDate) {
      timeSeriesQuery = timeSeriesQuery.gte('date', startDate)
    }

    if (endDate) {
      timeSeriesQuery = timeSeriesQuery.lte('date', endDate)
    }

    const { data: timeSeries, error: timeSeriesError } = await timeSeriesQuery

    if (timeSeriesError) throw timeSeriesError

    // Get category-level aggregates
    const { data: categoryStats, error: categoryError } = await supabase.rpc(
      'get_category_analytics',
      {}
    )

    return NextResponse.json({
      summary,
      timeSeries,
      categoryStats: categoryStats || [],
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
