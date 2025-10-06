import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

// POST /api/admin/questions/reorder - Reorder questions
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { category_id, question_ids } = await request.json()

    if (!category_id || !Array.isArray(question_ids)) {
      return NextResponse.json(
        { error: 'category_id and question_ids array are required' },
        { status: 400 }
      )
    }

    // Update priorities sequentially to avoid conflicts
    // First, set all to negative values to avoid unique constraint issues
    const tempUpdates = question_ids.map((id, index) =>
      supabase
        .from('dynamic_questions')
        .update({
          priority: -(index + 1),
          updated_by: user.id,
        })
        .eq('id', id)
        .eq('category_id', category_id)
    )

    const tempResults = await Promise.all(tempUpdates)

    // Check for errors in temp update
    const tempErrors = tempResults.filter((r) => r.error)
    if (tempErrors.length > 0) {
      console.error('Error in temp reorder:', tempErrors.map(e => e.error))
      return NextResponse.json(
        { error: 'Failed to reorder some questions (temp phase)' },
        { status: 500 }
      )
    }

    // Now set the final positive values
    const finalUpdates = question_ids.map((id, index) =>
      supabase
        .from('dynamic_questions')
        .update({
          priority: index + 1,
        })
        .eq('id', id)
        .eq('category_id', category_id)
    )

    const finalResults = await Promise.all(finalUpdates)

    // Check for errors in final update
    const finalErrors = finalResults.filter((r) => r.error)
    if (finalErrors.length > 0) {
      console.error('Error in final reorder:', finalErrors.map(e => e.error))
      return NextResponse.json(
        { error: 'Failed to reorder some questions (final phase)' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Questions reordered successfully',
      updated: question_ids.length,
    })
  } catch (error) {
    console.error('Questions reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
