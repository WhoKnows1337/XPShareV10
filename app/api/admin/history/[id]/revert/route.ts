import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the change record
    const { data: change, error: fetchError } = await supabase
      .from('question_change_history')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !change) {
      return NextResponse.json(
        { error: 'Change not found' },
        { status: 404 }
      )
    }

    // Revert the change based on type
    if (change.entity_type === 'question') {
      if (change.change_type === 'created') {
        // Delete the question that was created
        const { error } = await supabase
          .from('dynamic_questions')
          .delete()
          .eq('id', change.entity_id)

        if (error) throw error
      } else if (change.change_type === 'updated') {
        // Restore old values
        if (change.old_value) {
          const { error } = await supabase
            .from('dynamic_questions')
            .update(change.old_value as any)
            .eq('id', change.entity_id)

          if (error) throw error
        }
      } else if (change.change_type === 'deleted') {
        // Recreate the question
        if (change.old_value) {
          const { error } = await supabase
            .from('dynamic_questions')
            .insert(change.old_value as any)

          if (error) throw error
        }
      }
    } else if (change.entity_type === 'category') {
      if (change.change_type === 'created') {
        // Delete the category
        const { error } = await supabase
          .from('question_categories')
          .delete()
          .eq('id', change.entity_id)

        if (error) throw error
      } else if (change.change_type === 'updated') {
        // Restore old values
        if (change.old_value) {
          const { error } = await supabase
            .from('question_categories')
            .update(change.old_value as any)
            .eq('id', change.entity_id)

          if (error) throw error
        }
      } else if (change.change_type === 'deleted') {
        // Recreate the category
        if (change.old_value) {
          const { error } = await supabase
            .from('question_categories')
            .insert(change.old_value as any)

          if (error) throw error
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revert error:', error)
    return NextResponse.json(
      { error: 'Failed to revert change' },
      { status: 500 }
    )
  }
}
