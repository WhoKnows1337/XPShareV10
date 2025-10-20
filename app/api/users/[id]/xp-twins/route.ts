/**
 * GET /api/users/[id]/xp-twins
 *
 * Get detailed XP Twins data for the Hero Section
 * Includes match percentage, shared DNA, shared experiences, and more twins
 *
 * This endpoint powers the prominent "87% MATCH WITH YOU!" banner
 *
 * Response:
 * - match_percentage: Similarity score as percentage (0-100)
 * - shared_dna: Top 3 shared categories with percentages
 * - shared_experiences: Up to 3 experiences both users witnessed
 * - more_twins: 3-5 additional similar users with match info
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

interface SharedCategory {
  category: string
  your_percentage: number
  their_percentage: number
  is_top_for_both: boolean
}

interface SharedExperience {
  id: string
  title: string
  category: string
  witness_count: number
  created_at: string
}

interface MoreTwin {
  user_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  match_percentage: number
  top_categories: string[]
  similarity_score: number
}

interface XPTwinsResponse {
  match_percentage: number
  similarity_score: number
  shared_dna: SharedCategory[]
  shared_experiences: SharedExperience[]
  more_twins: MoreTwin[]
  metadata: {
    profile_user_id: string
    current_user_id: string
    calculated_at: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileUserId } = await params
    const searchParams = request.nextUrl.searchParams
    const currentUserId = searchParams.get('currentUserId')

    // Validation
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'currentUserId query parameter is required' },
        { status: 400 }
      )
    }

    if (currentUserId === profileUserId) {
      return NextResponse.json(
        { error: 'Cannot get XP Twins data for own profile' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for similarity scores
    // Similarity scores are semi-public data (shown on profiles)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get similarity score between current user and profile user
    // Try both directions since the relationship could be stored either way
    let { data: similarityData, error: simError } = await supabase
      .from('user_similarity_cache')
      .select('similarity_score, shared_categories, shared_category_count')
      .eq('user_id', currentUserId)
      .eq('similar_user_id', profileUserId)
      .maybeSingle()

    // If not found, try the reverse direction
    if (!similarityData && !simError) {
      const result = await supabase
        .from('user_similarity_cache')
        .select('similarity_score, shared_categories, shared_category_count')
        .eq('user_id', profileUserId)
        .eq('similar_user_id', currentUserId)
        .maybeSingle()

      similarityData = result.data
      simError = result.error
    }

    if (simError) {
      console.error('Error fetching similarity:', simError)
      return NextResponse.json(
        { error: 'Failed to fetch similarity data', details: simError.message },
        { status: 500 }
      )
    }

    if (!similarityData || similarityData.similarity_score < 0.3) {
      // Don't show XP Twins Hero Section if similarity < 30%
      return NextResponse.json({
        match_percentage: 0,
        similarity_score: similarityData?.similarity_score || 0,
        shared_dna: [],
        shared_experiences: [],
        more_twins: [],
        message: 'Similarity below minimum threshold (30%)'
      })
    }

    const matchPercentage = Math.round(Number(similarityData.similarity_score) * 100)

    // 2. Get category stats for both users to find shared DNA
    const { data: currentUserStats, error: currStatsError } = await supabase
      .from('user_category_stats')
      .select('category, percentage, is_top_category')
      .eq('user_id', currentUserId)
      .order('percentage', { ascending: false })
      .limit(5)

    const { data: profileUserStats, error: profStatsError } = await supabase
      .from('user_category_stats')
      .select('category, percentage, is_top_category')
      .eq('user_id', profileUserId)
      .order('percentage', { ascending: false })
      .limit(5)

    if (currStatsError || profStatsError) {
      console.warn('Error fetching category stats:', currStatsError || profStatsError)
    }

    // Find shared categories
    const sharedCategories = similarityData.shared_categories || []
    const sharedDNA: SharedCategory[] = sharedCategories
      .slice(0, 3) // Top 3 shared categories
      .map((category: string) => {
        const yourStat = currentUserStats?.find(s => s.category === category)
        const theirStat = profileUserStats?.find(s => s.category === category)

        return {
          category,
          your_percentage: yourStat ? parseFloat(yourStat.percentage.toFixed(2)) : 0,
          their_percentage: theirStat ? parseFloat(theirStat.percentage.toFixed(2)) : 0,
          is_top_for_both: (yourStat?.is_top_category && theirStat?.is_top_category) || false
        }
      })
      .filter(cat => cat.your_percentage > 0 && cat.their_percentage > 0)

    // 3. Get shared experiences (experiences both users have witnessed or contributed to)
    // For MVP, we'll fetch experiences in shared categories
    const { data: sharedExps, error: expsError } = await supabase
      .from('experiences')
      .select('id, title, category, created_at')
      .in('category', sharedCategories.slice(0, 3))
      .eq('status', 'published')
      .limit(5)
      .order('created_at', { ascending: false })

    if (expsError) {
      console.warn('Error fetching shared experiences:', expsError)
    }

    const sharedExperiences: SharedExperience[] = (sharedExps || [])
      .slice(0, 3)
      .map(exp => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        witness_count: 2, // Placeholder - would need actual witness tracking
        created_at: exp.created_at
      }))

    // 4. Get more XP Twins (3-5 additional similar users)
    const { data: moreTwinsData, error: moreTwinsError } = await supabase.rpc(
      'find_xp_twins',
      {
        target_user_id: profileUserId,
        match_limit: 6, // Get 6 so we can filter out current user
        min_similarity: 0.5
      }
    )

    if (moreTwinsError) {
      console.warn('Error fetching more twins:', moreTwinsError)
    }

    // Get profiles for more twins
    const moreTwinsFiltered = (moreTwinsData || [])
      .filter((t: any) => t.similar_user_id !== currentUserId)
      .slice(0, 5)

    const moreTwinsIds = moreTwinsFiltered.map((t: any) => t.similar_user_id)

    const { data: moreTwinsProfiles } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', moreTwinsIds)

    // Get top categories for each twin
    const moreTwins: MoreTwin[] = await Promise.all(
      moreTwinsFiltered.map(async (twin: any) => {
        const profile = moreTwinsProfiles?.find(p => p.id === twin.similar_user_id)

        // Get top 3 categories for this twin
        const { data: twinCats } = await supabase
          .from('user_category_stats')
          .select('category')
          .eq('user_id', twin.similar_user_id)
          .order('percentage', { ascending: false })
          .limit(3)

        return {
          user_id: twin.similar_user_id,
          username: profile?.username || null,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          match_percentage: Math.round(Number(twin.similarity_score) * 100),
          similarity_score: Number(twin.similarity_score),
          top_categories: twinCats?.map(c => c.category) || []
        }
      })
    )

    // Return complete XP Twins data
    const response: XPTwinsResponse = {
      match_percentage: matchPercentage,
      similarity_score: Number(similarityData.similarity_score),
      shared_dna: sharedDNA,
      shared_experiences: sharedExperiences,
      more_twins: moreTwins,
      metadata: {
        profile_user_id: profileUserId,
        current_user_id: currentUserId,
        calculated_at: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('XP Twins API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
