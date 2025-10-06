import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin('content_manager')
    const supabase = await createClient()
    const { id } = await params

    // Get history entry
    const { data: historyEntry, error: historyError } = await supabase
      .from('question_change_history')
      .select('*')
      .eq('id', id)
      .single()

    if (historyError || !historyEntry) {
      return NextResponse.json({ error: 'History entry not found' }, { status: 404 })
    }

    // Determine table name based on entity type
    const tableName =
      historyEntry.entity_type === 'category' ? 'question_categories' : 'dynamic_questions'

    try {
      // Revert based on change type
      if (historyEntry.change_type === 'created') {
        // Delete the created item (soft delete for questions)
        if (historyEntry.entity_type === 'question') {
          await supabase
            .from(tableName)
            .update({
              is_active: false,
              updated_by: user.id,
            })
            .eq('id', historyEntry.entity_id)
        } else {
          await supabase.from(tableName).delete().eq('id', historyEntry.entity_id)
        }
      } else if (historyEntry.change_type === 'updated') {
        // Restore old value
        if (!historyEntry.old_value) {
          return NextResponse.json(
            { error: 'Cannot revert: old value not available' },
            { status: 400 }
          )
        }

        // Extract only the fields that can be updated
        const oldValue = historyEntry.old_value as Record<string, any>
        const updateFields = { ...oldValue }

        // Remove system fields that shouldn't be updated
        delete updateFields.id
        delete updateFields.created_at
        delete updateFields.created_by

        // Add updated_by
        updateFields.updated_by = user.id
        updateFields.updated_at = new Date().toISOString()

        await supabase.from(tableName).update(updateFields).eq('id', historyEntry.entity_id)
      } else if (historyEntry.change_type === 'deleted') {
        // Re-create deleted item
        if (!historyEntry.old_value) {
          return NextResponse.json(
            { error: 'Cannot revert: old value not available' },
            { status: 400 }
          )
        }

        const oldValue = historyEntry.old_value as Record<string, any>
        const insertFields = { ...oldValue }

        // Update metadata
        insertFields.created_by = user.id
        insertFields.updated_by = user.id
        insertFields.created_at = new Date().toISOString()
        insertFields.updated_at = new Date().toISOString()

        await supabase.from(tableName).insert(insertFields)
      } else if (historyEntry.change_type === 'reordered') {
        return NextResponse.json(
          { error: 'Cannot revert reorder operations' },
          { status: 400 }
        )
      } else {
        return NextResponse.json({ error: 'Unsupported change type' }, { status: 400 })
      }

      // Log the revert action
      await supabase.from('question_change_history').insert({
        entity_type: historyEntry.entity_type,
        entity_id: historyEntry.entity_id,
        changed_by: user.id,
        change_type: 'updated',
        old_value: historyEntry.new_value,
        new_value: historyEntry.old_value,
        description: `Reverted change: ${historyEntry.description}`,
      })

      return NextResponse.json({
        success: true,
        message: 'Change reverted successfully',
      })
    } catch (revertError) {
      console.error('Revert error:', revertError)
      return NextResponse.json(
        { error: 'Failed to revert change', details: revertError },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('History revert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
