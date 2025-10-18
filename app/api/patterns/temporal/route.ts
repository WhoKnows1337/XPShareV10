import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patterns/temporal
 *
 * Detects temporal patterns (moon phases) in experiences
 *
 * Query params:
 *   - experience_ids: Comma-separated UUIDs (required)
 *
 * Returns: Array of temporal patterns with moon phase data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse experience IDs from query params
    const searchParams = request.nextUrl.searchParams
    const experienceIdsParam = searchParams.get('experience_ids')

    if (!experienceIdsParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: experience_ids' },
        { status: 400 }
      )
    }

    const experienceIds = experienceIdsParam.split(',').filter(id => id.trim())

    if (experienceIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid experience IDs provided' },
        { status: 400 }
      )
    }

    // Call the SQL function
    const { data, error } = await supabase.rpc('detect_temporal_patterns', {
      p_experience_ids: experienceIds,
    })

    if (error) {
      console.error('Error detecting temporal patterns:', error)
      return NextResponse.json(
        { error: 'Failed to detect temporal patterns', details: error.message },
        { status: 500 }
      )
    }

    // Return results
    const patterns = (data as any[]) || []
    return NextResponse.json({
      success: true,
      count: patterns.length,
      patterns,
    })
  } catch (error) {
    console.error('Temporal patterns API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
