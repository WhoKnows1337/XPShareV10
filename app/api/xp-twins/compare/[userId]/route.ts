import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ userId: string }>
}

/**
 * GET /api/xp-twins/compare/[userId]
 * Returns detailed comparison between current user and specified user
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user comparison using database function
    const { data, error } = await (supabase as any).rpc('get_user_comparison', {
      p_user1_id: user.id,
      p_user2_id: userId
    })

    if (error) {
      console.error('User comparison RPC error:', error)
      return NextResponse.json({ error: 'Failed to compare users' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('User comparison API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
