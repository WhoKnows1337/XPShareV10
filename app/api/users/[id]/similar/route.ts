/**
 * GET /api/users/[id]/similar
 *
 * Find XP Twins - users with similar experience profiles
 * Uses Jaccard + Cosine similarity for accurate matching
 *
 * Query Params:
 * - limit: number (default: 10, max: 50)
 * - minSimilarity: number (default: 0.3, range: 0.0-1.0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SimilarUser {
  similar_user_id: string
  similarity_score: number
  shared_categories: string[]
  shared_category_count: number
  match_quality: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR'
  profile?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    total_xp: number
    level: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      50 // Max 50 results
    )
    const minSimilarity = Math.max(
      0.0,
      Math.min(
        parseFloat(searchParams.get('minSimilarity') || '0.3'),
        1.0
      )
    )

    const supabase = await createClient()

    // Call find_xp_twins function
    const { data: similarUsers, error } = await (supabase as any).rpc('find_xp_twins', {
      target_user_id: userId,
      match_limit: limit,
      min_similarity: minSimilarity
    })

    if (error) {
      console.error('Error finding XP twins:', error)
      return NextResponse.json(
        { error: 'Failed to find similar users', details: error.message },
        { status: 500 }
      )
    }

    if (!similarUsers || similarUsers.length === 0) {
      return NextResponse.json({
        users: [],
        count: 0,
        message: 'No similar users found. Try lowering minSimilarity.'
      })
    }

    // Fetch user profiles for similar users
    const similarUserIds = similarUsers.map((u: SimilarUser) => u.similar_user_id)

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, bio, total_xp, level')
      .in('id', similarUserIds)

    if (profilesError) {
      console.warn('Error fetching profiles:', profilesError)
      // Continue without profiles
    }

    // Merge similarity data with profile data
    const results: SimilarUser[] = similarUsers.map((user: SimilarUser) => {
      const profile = profiles?.find(p => p.id === user.similar_user_id)

      return {
        ...user,
        profile: profile || undefined
      }
    })

    return NextResponse.json({
      users: results,
      count: results.length,
      filters: {
        limit,
        minSimilarity
      }
    })

  } catch (error: any) {
    console.error('Similar users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
