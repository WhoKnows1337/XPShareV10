import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, answerText, qualityRating } = body

    if (!questionId || !answerText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the AI question with the answer
    const { data, error } = await supabase
      .from('ai_generated_questions')
      .update({
        answer_text: answerText,
        answered_at: new Date().toISOString(),
        quality_rating: qualityRating || null,
      })
      .eq('id', questionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Answer update error:', error)
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Answer followup error:', error)
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    )
  }
}
