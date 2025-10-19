import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const minScore = parseFloat(searchParams.get('minScore') || '0.3')

    // Use the new find_xp_twins function from database
    const { data: xpTwins, error } = await (supabase as any).rpc('find_xp_twins', {
      p_user_id: user.id,
      p_min_score: minScore,
      p_limit: limit
    })

    if (error) {
      console.error('XP Twins RPC error:', error)
      return NextResponse.json({ error: 'Failed to find XP Twins' }, { status: 500 })
    }

    // Transform to match existing API format for backward compatibility
    const users = (xpTwins || []).map((twin: any) => ({
      user_id: twin.twin_user_id,
      username: twin.twin_username,
      display_name: twin.twin_display_name,
      avatar_url: twin.twin_avatar_url,
      similarity_score: Math.round(parseFloat(twin.similarity_score) * 100), // Convert 0-1 to 0-100
      common_categories: twin.shared_categories,
      connection_status: twin.connection_status,
      total_xp: twin.twin_total_xp,
      top_categories: twin.twin_top_categories,
      similarity_breakdown: twin.similarity_breakdown
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Similar users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
