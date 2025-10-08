import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get analytics summary for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: analytics, error } = await (supabase as any)
      .from('question_analytics')
      .select('shown_count, answered_count, time_spent_seconds, answer_value')
      .eq('question_id', id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

    if (error) throw error

    const totalShown = analytics?.reduce((sum: number, a: any) => sum + (a.shown_count || 0), 0) || 0
    const totalAnswered = analytics?.reduce((sum: number, a: any) => sum + (a.answered_count || 0), 0) || 0
    const totalTime = analytics?.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0) || 0
    const answerRate = totalShown > 0 ? Math.round((totalAnswered / totalShown) * 100) : 0
    const avgTime = totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0

    // Get top answer
    const answerCounts = new Map<string, number>()
    analytics?.forEach((a: any) => {
      if (a.answer_value) {
        const answers = Array.isArray(a.answer_value) ? a.answer_value : [a.answer_value]
        answers.forEach((ans: string) => {
          answerCounts.set(ans, (answerCounts.get(ans) || 0) + 1)
        })
      }
    })

    const topAnswer = answerCounts.size > 0
      ? Array.from(answerCounts.entries()).sort((a, b) => b[1] - a[1])[0]
      : null

    return NextResponse.json({
      answerRate,
      avgTime,
      totalShown,
      totalAnswered,
      topAnswer: topAnswer ? {
        value: topAnswer[0],
        count: topAnswer[1],
        percentage: Math.round((topAnswer[1] / totalAnswered) * 100)
      } : null
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
