import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (action === 'follow') {
      const { error } = await (supabase as any)
        .from('user_follows')
        .insert({
          follower_user_id: user.id,
          followed_user_id: userId
        })

      if (error) {
        console.error('Follow error:', error)
        return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
      }
    } else if (action === 'unfollow') {
      const { error } = await (supabase as any)
        .from('user_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('followed_user_id', userId)

      if (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Follow API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
