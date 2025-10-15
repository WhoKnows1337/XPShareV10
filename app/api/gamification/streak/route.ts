import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's streak data
    const { data: streak, error } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Fetch streak error:', error)
      return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
    }

    // If no streak exists yet, return default values
    if (!streak) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        total_experiences: 0,
        total_comments: 0,
        total_reactions: 0,
      })
    }

    return NextResponse.json(streak)
  } catch (error: any) {
    console.error('Streak GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { activity_type = 'experience' } = body

    // Validate activity type
    const validTypes = ['experience', 'comment', 'reaction']
    if (!validTypes.includes(activity_type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    // Call the database function to update streak
    const { data, error } = await (supabase as any).rpc('update_user_streak', {
      p_user_id: user.id,
      p_activity_type: activity_type,
    })

    if (error) {
      console.error('Update streak error:', error)
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
    }

    // Fetch updated streak data
    const { data: updatedStreak, error: fetchError } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Fetch updated streak error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch updated streak' }, { status: 500 })
    }

    return NextResponse.json({
      streak: updatedStreak,
      update_info: data,
    })
  } catch (error: any) {
    console.error('Streak POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
