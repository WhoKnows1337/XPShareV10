import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/experiences/shared
 *
 * Returns experiences that are shared between two users
 * (i.e., both users are witnesses of the same experience)
 *
 * Query Parameters:
 * - user1: First user ID
 * - user2: Second user ID
 * - limit: Maximum number of results (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user1Id = searchParams.get('user1')
    const user2Id = searchParams.get('user2')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      50
    )

    if (!user1Id || !user2Id) {
      return NextResponse.json(
        { error: 'Both user1 and user2 parameters are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Try to use RPC function if it exists
    try {
      const { data: sharedExperienceIds, error: rpcError } = await (supabase as any)
        .rpc('get_shared_experience_ids', {
          user1_id: user1Id,
          user2_id: user2Id,
        })

      if (!rpcError && sharedExperienceIds && sharedExperienceIds.length > 0) {
        // Fetch full experience data
        const { data: experiences, error: expError } = await supabase
          .from('experiences')
          .select('id, title, category, created_at')
          .in('id', sharedExperienceIds)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (expError) {
          console.error('Error fetching experiences:', expError)
          return NextResponse.json(
            { error: 'Failed to fetch experiences' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          experiences: experiences || [],
          count: experiences?.length || 0,
        })
      }
    } catch (rpcError) {
      console.log('RPC function not available, using manual query')
    }

    // Fallback: Manual query via experience_witnesses
    const { data: witnessData, error: witnessError } = await supabase
      .from('experience_witnesses')
      .select('experience_id, user_id')

    if (witnessError) {
      console.error('Error fetching witnesses:', witnessError)
      return NextResponse.json(
        { error: 'Failed to fetch witness data' },
        { status: 500 }
      )
    }

    // Find experience IDs that appear for both users
    const user1Witnesses = witnessData
      ?.filter((w: any) => w.user_id === user1Id)
      .map((w: any) => w.experience_id) || []

    const user2Witnesses = witnessData
      ?.filter((w: any) => w.user_id === user2Id)
      .map((w: any) => w.experience_id) || []

    const sharedIds = user1Witnesses.filter((id: string) =>
      user2Witnesses.includes(id)
    )

    if (sharedIds.length === 0) {
      return NextResponse.json({
        experiences: [],
        count: 0,
      })
    }

    // Fetch full experience data for shared IDs
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('id, title, category, created_at')
      .in('id', sharedIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (expError) {
      console.error('Error fetching experiences:', expError)
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      experiences: experiences || [],
      count: experiences?.length || 0,
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
