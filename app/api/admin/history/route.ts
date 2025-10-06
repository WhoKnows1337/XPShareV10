import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    let query = supabase
      .from('question_change_history')
      .select('*')
      .order('changed_at', { ascending: false })

    // Filter by user if specified
    if (userId) {
      query = query.eq('changed_by', userId)
    }

    const { data: changes, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ data: changes })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
