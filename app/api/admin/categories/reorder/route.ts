import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { category_ids } = body

    if (!category_ids || !Array.isArray(category_ids)) {
      return NextResponse.json(
        { error: 'category_ids array is required' },
        { status: 400 }
      )
    }

    // Update sort_order for each category
    const updates = category_ids.map((id, index) =>
      supabase
        .from('question_categories')
        .update({
          sort_order: index,
          updated_by: user.id,
        })
        .eq('id', id)
    )

    await Promise.all(updates)

    // Log the reorder action
    await (supabase as any).from('question_change_history').insert({
      entity_type: 'category',
      entity_id: category_ids[0],
      changed_by: user.id,
      change_type: 'reordered',
      new_value: { category_ids, order: category_ids.map((id, i) => ({ id, sort_order: i })) },
      description: `Reordered ${category_ids.length} categories`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder categories error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}
