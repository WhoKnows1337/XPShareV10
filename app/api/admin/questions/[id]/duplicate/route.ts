import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin('content_manager')
    const { id } = await params
    const supabase = await createClient()

    // Fetch original question
    const { data: original, error: fetchError } = await supabase
      .from('dynamic_questions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Get current max priority for the category
    const { data: maxPriorityQuestion } = await supabase
      .from('dynamic_questions')
      .select('priority')
      .eq('category_id', original.category_id)
      .order('priority', { ascending: false })
      .limit(1)
      .single()

    const nextPriority = (maxPriorityQuestion?.priority || 0) + 1

    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('dynamic_questions')
      .insert({
        category_id: original.category_id,
        question_text: `${original.question_text} (Copy)`,
        question_type: original.question_type,
        options: original.options,
        priority: nextPriority,
        is_optional: original.is_optional,
        help_text: original.help_text,
        placeholder: original.placeholder,
        conditional_logic: original.conditional_logic,
        follow_up_question: original.follow_up_question,
        tags: original.tags,
        is_active: original.is_active,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: duplicate })
  } catch (error) {
    console.error('Duplicate question error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to duplicate question' },
      { status: 500 }
    )
  }
}
