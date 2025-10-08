import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  await requireAdmin()
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const needsReview = searchParams.get('needs_review') === 'true'
  const promoted = searchParams.get('promoted') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = (supabase as any)
      .from('ai_generated_questions')
      .select(`
        *,
        dynamic_questions:parent_question_id (
          question_text,
          category_id,
          question_categories:category_id (
            name,
            icon
          )
        )
      `)
      .order('generated_at', { ascending: false })
      .limit(limit)

    if (needsReview) {
      query = query
        .eq('admin_reviewed', false)
        .gte('quality_rating', 4)
    }

    if (promoted) {
      query = query.eq('promoted_to_template', true)
    }

    const { data, error } = await query

    if (error) throw error

    // Get stats
    const { data: stats } = await (supabase as any).rpc('get_ai_question_stats')

    return NextResponse.json({
      data,
      stats: stats?.[0] || null,
    })
  } catch (error) {
    console.error('AI questions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI questions' },
      { status: 500 }
    )
  }
}
