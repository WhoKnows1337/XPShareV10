import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/users/similarity
 *
 * Optimized endpoint to get similarity score between two specific users
 * More efficient than /api/users/[id]/similar when you know both user IDs
 *
 * Query Parameters:
 * - user1: First user ID (required)
 * - user2: Second user ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user1Id = searchParams.get('user1')
    const user2Id = searchParams.get('user2')

    if (!user1Id || !user2Id) {
      return NextResponse.json(
        { error: 'Both user1 and user2 parameters are required' },
        { status: 400 }
      )
    }

    // Don't calculate similarity for same user
    if (user1Id === user2Id) {
      return NextResponse.json(
        { error: 'Cannot calculate similarity with self' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Query user_similarity_cache for both directions
    // (user1→user2 OR user2→user1)
    const { data, error } = await (supabase as any)
      .from('user_similarity_cache')
      .select('similarity_score, shared_categories, shared_category_count, same_location')
      .or(`and(user_id.eq.${user1Id},similar_user_id.eq.${user2Id}),and(user_id.eq.${user2Id},similar_user_id.eq.${user1Id})`)
      .maybeSingle()

    if (error) {
      console.error('Error fetching similarity:', error)
      return NextResponse.json(
        { error: 'Failed to fetch similarity data', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        {
          similarity: null,
          message: 'No similarity data found between these users',
        },
        { status: 404 }
      )
    }

    // Return normalized similarity data
    return NextResponse.json({
      similarity: {
        user1_id: user1Id,
        user2_id: user2Id,
        similarity_score: Number(data.similarity_score),
        shared_categories: data.shared_categories || [],
        shared_category_count: data.shared_category_count || 0,
        same_location: data.same_location || false,
      },
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
