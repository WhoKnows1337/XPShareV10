import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check admin auth
  const {
    data: { user },
  } = await (supabase as any).auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'

  try {
    // Get all analytics data
    const { data: analytics, error } = await supabase
      .from('question_analytics_summary')
      .select('*')

    if (error) throw error

    if (format === 'json') {
      return NextResponse.json(analytics)
    }

    // CSV export
    if (format === 'csv') {
      const headers = [
        'Question ID',
        'Category',
        'Question Text',
        'Total Shown',
        'Total Answered',
        'Total Skipped',
        'Answer Rate (%)',
        'Avg Response Time (s)',
      ]

      const rows = analytics.map((row) => [
        row.question_id,
        row.category_name,
        `"${(row.question_text || '').replace(/"/g, '""')}"`, // Escape quotes
        row.total_shown,
        row.total_answered,
        row.total_skipped,
        row.answer_rate?.toFixed(2) || '0',
        row.avg_response_time?.toFixed(2) || '0',
      ])

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join(
        '\n'
      )

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString()}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
