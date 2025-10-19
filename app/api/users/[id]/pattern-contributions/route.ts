/**
 * GET /api/users/[id]/pattern-contributions
 *
 * Get user's pattern discovery contributions
 * Shows patterns they've helped discover through their experiences
 *
 * Query Params:
 * - limit: number (default: 10, max: 50)
 *
 * Response:
 * - contributions: Array of patterns discovered
 * - total: Total contribution count
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const searchParams = request.nextUrl.searchParams

    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      50
    )

    const supabase = await createClient()

    // Fetch pattern contributions
    const { data: contributions, error } = await (supabase as any)
      .from('user_pattern_contributions')
      .select('*')
      .eq('user_id', userId)
      .order('contribution_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching pattern contributions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pattern contributions', details: error.message },
        { status: 500 }
      )
    }

    if (!contributions || contributions.length === 0) {
      return NextResponse.json({
        contributions: [],
        total: 0,
        message: 'No pattern contributions found for this user'
      })
    }

    // Calculate total contribution count
    const totalContributions = contributions.reduce(
      (sum: number, c: any) => sum + c.contribution_count,
      0
    )

    return NextResponse.json({
      contributions,
      total: totalContributions,
      metadata: {
        userId,
        patternsDiscovered: contributions.length,
        limit
      }
    })

  } catch (error: any) {
    console.error('Pattern contributions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
