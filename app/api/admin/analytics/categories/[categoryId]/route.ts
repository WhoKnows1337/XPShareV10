import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  await requireAdmin()
  const { categoryId } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start_date') ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = searchParams.get('end_date') || new Date().toISOString()

  try {
    // Summary from materialized view
    const { data: summary, error: summaryError } = await supabase
      .from('question_analytics_summary')
      .select('*')
      .eq('category_id', categoryId)

    if (summaryError) throw summaryError

    // Time-series data
    const { data: timeSeries, error: timeSeriesError } = await supabase
      .from('question_analytics')
      .select('*')
      .eq('category_id', categoryId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (timeSeriesError) throw timeSeriesError

    // Get questions for detailed info
    const { data: questions, error: questionsError } = await supabase
      .from('dynamic_questions')
      .select('id, question_text, question_type')
      .eq('category_id', categoryId)
      .eq('is_active', true)

    if (questionsError) throw questionsError

    return NextResponse.json({
      summary,
      timeSeries,
      questions,
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
