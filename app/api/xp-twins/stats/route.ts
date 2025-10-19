import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/xp-twins/stats
 * Returns XP Twins statistics for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get XP Twins stats using database function
    const { data, error } = await (supabase as any).rpc('get_xp_twins_stats', {
      p_user_id: user.id
    })

    if (error) {
      console.error('XP Twins stats RPC error:', error)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    return NextResponse.json(data || {
      total_potential_twins: 0,
      high_match_count: 0,
      medium_match_count: 0,
      average_similarity: 0
    })
  } catch (error) {
    console.error('XP Twins stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
