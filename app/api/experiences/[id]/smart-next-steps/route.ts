/**
 * API Route: GET /api/experiences/[id]/smart-next-steps
 *
 * Generates personalized next steps based on user state and experience data.
 * Part of Phase 5: Smart Next Steps Integration
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 5, Task 5.1
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSmartNextSteps, type BadgeProgress } from '@/lib/algorithms/smart-next-steps'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: experienceId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // === 1. Get User Data ===
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, total_experiences, level, total_xp')
      .eq('id', authUser.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // === 2. Get Experience Data ===
    const { data: experience } = await supabase
      .from('experiences')
      .select('id, title, category, user_id, created_at, _count:comments(count)')
      .eq('id', experienceId)
      .single()

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      )
    }

    // Get comment count
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('experience_id', experienceId)

    // === 3. Get Similar Count & Contribution Score ===
    // Get similar experiences count
    const { count: similarCount } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('category', experience.category)
      .neq('id', experienceId)

    // Try to get existing contribution score
    // Note: experience_contribution table may not be in generated types yet
    const { data: contributionData } = await (supabase as any)
      .from('experience_contribution')
      .select('overall_score, novelty_score, level')
      .eq('experience_id', experienceId)
      .single()

    const impactData = {
      similar_count: similarCount || 0,
      contribution_score: contributionData ? {
        overall: contributionData.overall_score,
        novelty: contributionData.novelty_score,
        level: contributionData.level as 'low' | 'moderate' | 'high' | 'exceptional',
      } : undefined,
    }

    // === 4. Get Badge Progress ===
    // Note: user_badges table may have different schema - cast as any
    const { data: badgeData } = await (supabase as any)
      .from('user_badges')
      .select(`
        badge_id,
        progress,
        badges (
          id,
          name,
          slug,
          description,
          icon_name
        )
      `)
      .eq('user_id', authUser.id)
      .eq('awarded', false)

    const badgeProgress: BadgeProgress[] = (badgeData || [])
      .map((ub: any) => {
        const badge = ub.badges as any
        if (!badge) return null

        // Calculate remaining based on badge type
        // For now, assume badges need 10 actions (simplified)
        const currentProgress = ub.progress || 0
        const targetProgress = 10
        const remaining = Math.max(0, targetProgress - currentProgress)

        return {
          badge_id: badge.id,
          name: badge.name,
          slug: badge.slug,
          description: badge.description,
          progress: currentProgress / targetProgress,
          remaining: remaining,
          icon_name: badge.icon_name,
        }
      })
      .filter(Boolean) as BadgeProgress[]

    // === 5. Generate Smart Next Steps ===
    const nextSteps = generateSmartNextSteps(
      {
        id: userProfile.id,
        total_experiences: userProfile.total_experiences || 0,
        level: userProfile.level || 1,
        total_xp: userProfile.total_xp || 0,
      },
      {
        id: experience.id,
        title: experience.title,
        category: experience.category,
        comment_count: commentCount || 0,
      },
      impactData,
      badgeProgress
    )

    return NextResponse.json({
      nextSteps,
      meta: {
        user_total_experiences: userProfile.total_experiences || 0,
        similar_count: similarCount || 0,
        comment_count: commentCount || 0,
        badge_progress_count: badgeProgress.length,
      },
    })
  } catch (error) {
    console.error('Error in smart-next-steps API:', error)
    return NextResponse.json(
      { error: 'Failed to generate smart next steps' },
      { status: 500 }
    )
  }
}
