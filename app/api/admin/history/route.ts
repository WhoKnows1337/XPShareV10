import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  await requireAdmin()
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get('entity_type') // 'category' | 'question'
  const changeType = searchParams.get('change_type')
  const userId = searchParams.get('user_id')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = supabase
      .from('question_change_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(limit)

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }
    if (changeType) {
      query = query.eq('change_type', changeType)
    }
    if (userId) {
      query = query.eq('changed_by', userId)
    }

    const { data: history, error } = await query

    if (error) throw error

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('Fetch history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
