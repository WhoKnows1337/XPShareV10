/**
 * API Route: GET /api/experiences/[id]/contribution
 *
 * Returns contribution score data for an experience.
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

    // Try to get existing contribution score
    // Note: experience_contribution table may not exist yet in types - cast as any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('experience_contribution')
      .select('*')
      .eq('experience_id', experienceId)
      .single()

    // If exists and fresh (< 1 day old), return it
    if (existing && !fetchError) {
      const age = Date.now() - new Date(existing.updated_at).getTime()
      const ONE_DAY = 24 * 60 * 60 * 1000

      if (age < ONE_DAY) {
        return NextResponse.json({
          overall: existing.overall_score,
          novelty: existing.novelty_score,
          patternContribution: existing.pattern_contribution_score,
          communityValue: existing.community_value_score,
          level: existing.level,
          calculatedAt: existing.calculated_at,
        })
      }
    }

    // Calculate fresh score using the function
    // Note: RPC functions may not be in generated types yet - cast as any
    const { data: calculated, error: calcError } = await (supabase as any)
      .rpc('calculate_contribution_score', { p_experience_id: experienceId })
      .single()

    if (calcError) {
      console.error('Error calculating contribution score:', calcError)
      // Return fallback data
      return NextResponse.json({
        overall: 50,
        novelty: 50,
        patternContribution: 50,
        communityValue: 50,
        level: 'moderate',
        calculatedAt: new Date().toISOString(),
      })
    }

    // Upsert the calculated score (fire and forget)
    ;(supabase as any).rpc('upsert_contribution_score', { p_experience_id: experienceId })

    return NextResponse.json({
      overall: calculated.overall_score,
      novelty: calculated.novelty_score,
      patternContribution: calculated.pattern_contribution_score,
      communityValue: calculated.community_value_score,
      level: calculated.level,
      calculatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in contribution API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contribution data' },
      { status: 500 }
    )
  }
}
