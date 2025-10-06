import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin('analyst')

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')

    // Fetch analytics summary
    let query = supabase
      .from('question_analytics_summary')
      .select('*')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: summary, error } = await query

    if (error) throw error

    // Generate insights
    const insights: Array<{
      type: 'warning' | 'success' | 'info'
      severity: 'high' | 'medium' | 'low'
      questionId: string
      questionText: string
      message: string
      suggestion: string
      metric?: {
        name: string
        value: number
        threshold: number
      }
    }> = []

    summary?.forEach((q) => {
      const answerRate = q.answer_rate_percent || 0
      const avgTime = q.avg_time || 0
      const totalShown = q.total_shown || 0

      // Low answer rate warning
      if (totalShown > 10 && answerRate < 70) {
        insights.push({
          type: 'warning',
          severity: answerRate < 50 ? 'high' : 'medium',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Low answer rate: ${answerRate}%`,
          suggestion: 'Consider making this question optional or rephrasing it to be clearer',
          metric: {
            name: 'answer_rate',
            value: answerRate,
            threshold: 70,
          },
        })
      }

      // Very low answer rate - critical
      if (totalShown > 10 && answerRate < 50) {
        insights.push({
          type: 'warning',
          severity: 'high',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Critical: Only ${answerRate}% of users answer this question`,
          suggestion: 'This question might be confusing or irrelevant. Consider removing or completely rewording it.',
          metric: {
            name: 'answer_rate',
            value: answerRate,
            threshold: 50,
          },
        })
      }

      // High response time warning
      if (totalShown > 10 && avgTime > 10) {
        insights.push({
          type: 'warning',
          severity: avgTime > 15 ? 'high' : 'medium',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Users take ${avgTime.toFixed(1)}s to answer (avg)`,
          suggestion:
            avgTime > 15
              ? 'This is significantly longer than average. Consider reducing options or simplifying the question.'
              : 'This is slightly longer than average. Consider if the question has too many options.',
          metric: {
            name: 'avg_time',
            value: avgTime,
            threshold: 10,
          },
        })
      }

      // High answer rate success
      if (totalShown > 10 && answerRate > 90) {
        insights.push({
          type: 'success',
          severity: 'low',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Excellent answer rate: ${answerRate}%`,
          suggestion: 'This question is performing very well. Consider using similar phrasing for other questions.',
          metric: {
            name: 'answer_rate',
            value: answerRate,
            threshold: 90,
          },
        })
      }

      // Good response time
      if (totalShown > 10 && avgTime < 5 && answerRate > 80) {
        insights.push({
          type: 'success',
          severity: 'low',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Fast and high completion: ${avgTime.toFixed(1)}s avg, ${answerRate}% rate`,
          suggestion: 'This question is well-designed. Users answer quickly and consistently.',
          metric: {
            name: 'avg_time',
            value: avgTime,
            threshold: 5,
          },
        })
      }

      // Low engagement (shown but rarely answered)
      if (totalShown > 20 && answerRate < 30) {
        insights.push({
          type: 'warning',
          severity: 'high',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Very low engagement: Shown ${totalShown} times but only ${answerRate}% answer`,
          suggestion: 'This question is being skipped frequently. Consider if it\'s relevant or if users understand it.',
        })
      }

      // Insufficient data
      if (totalShown < 5 && totalShown > 0) {
        insights.push({
          type: 'info',
          severity: 'low',
          questionId: q.question_id,
          questionText: q.question_text,
          message: `Limited data: Only ${totalShown} responses`,
          suggestion: 'Wait for more data before drawing conclusions about this question\'s performance.',
        })
      }
    })

    // Sort insights by severity
    const severityOrder = { high: 3, medium: 2, low: 1 }
    insights.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])

    // Generate summary stats
    const stats = {
      totalQuestions: summary?.length || 0,
      criticalIssues: insights.filter((i) => i.severity === 'high').length,
      warnings: insights.filter((i) => i.severity === 'medium').length,
      successes: insights.filter((i) => i.type === 'success').length,
      avgAnswerRate:
        summary && summary.length > 0
          ? (summary.reduce((sum, q) => sum + (q.answer_rate_percent || 0), 0) / summary.length).toFixed(1)
          : 0,
      avgResponseTime:
        summary && summary.length > 0
          ? (summary.reduce((sum, q) => sum + (q.avg_time || 0), 0) / summary.length).toFixed(1)
          : 0,
    }

    return NextResponse.json({
      insights,
      stats,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analytics insights error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
