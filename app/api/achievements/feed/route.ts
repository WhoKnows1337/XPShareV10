import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Fetch recent community achievements (badge earnings, level ups, streaks)
    const { data: achievements, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user_profiles!notifications_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .in('type', ['badge_earned', 'level_up', 'streak_milestone'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Achievements feed query error:', error)
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }

    return NextResponse.json({ achievements }, { status: 200 })
  } catch (error) {
    console.error('Achievements feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
