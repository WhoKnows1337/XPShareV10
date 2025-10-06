import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const supabase = await createClient()
  const { id } = await context.params

  try {
    const body = await request.json()
    const { questionText } = body

    // Call the promote function
    const { data, error } = await supabase.rpc('promote_ai_question_to_template', {
      ai_question_id: id,
      template_question_text: questionText || null,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      newQuestionId: data,
    })
  } catch (error) {
    console.error('Promote error:', error)
    return NextResponse.json(
      { error: 'Failed to promote question' },
      { status: 500 }
    )
  }
}
