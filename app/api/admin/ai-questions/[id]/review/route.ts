import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const supabase = await createClient()
  const { id } = await context.params

  try {
    const body = await request.json()
    const { adminReviewed, qualityRating } = body

    const updates: any = {}
    if (typeof adminReviewed === 'boolean') {
      updates.admin_reviewed = adminReviewed
    }
    if (qualityRating !== undefined) {
      updates.quality_rating = qualityRating
    }

    const { data, error } = await supabase
      .from('ai_generated_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
