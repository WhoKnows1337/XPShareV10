/**
 * API Route: GET /api/experiences/[id]/xp-twins
 *
 * Returns XP Twins (similar users) for the author of this experience.
 * Part of Phase 5: Analytics & Database Schema
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: experienceId } = await params
    const supabase = await createClient()

    // Get the experience to find the author
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('user_id')
      .eq('id', experienceId)
      .single()

    if (expError || !experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    const authorId = experience.user_id

    // Return empty if no author (anonymous experience)
    if (!authorId) {
      return NextResponse.json({ xpTwins: [] })
    }

    // Get similar users from user_similarity_cache
    // Note: user_similarity_cache may not be in generated types yet
    const { data: similarUsers, error: simError } = await (supabase as any)
      .from('user_similarity_cache')
      .select(`
        similar_user_id,
        similarity_score,
        shared_categories,
        shared_category_count,
        user_profiles!user_similarity_cache_similar_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', authorId)
      .gte('similarity_score', 0.5)
      .order('similarity_score', { ascending: false })
      .limit(10)

    if (simError) {
      console.error('Error fetching similar users:', simError)
      return NextResponse.json({ xpTwins: [] })
    }

    // Transform the data
    const xpTwins = (similarUsers || []).map((item: any) => {
      const profile = item.user_profiles
      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        matchScore: Math.round(item.similarity_score * 100),
        sharedExperiences: item.shared_category_count || 0,
        sharedCategories: item.shared_categories || [],
      }
    })

    return NextResponse.json({ xpTwins })
  } catch (error) {
    console.error('Error in xp-twins API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch XP twins' },
      { status: 500 }
    )
  }
}
