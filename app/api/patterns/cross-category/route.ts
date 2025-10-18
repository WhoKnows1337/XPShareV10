import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patterns/cross-category
 *
 * Detects patterns across different experience categories
 *
 * Query params:
 *   - experience_ids: Comma-separated UUIDs (required)
 *   - min_overlap: Minimum shared experiences for pattern (optional, default: 2)
 *
 * Returns: Array of cross-category patterns (geographic, tag, temporal overlaps)
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const experienceIdsParam = searchParams.get('experience_ids')
    const minOverlap = parseInt(searchParams.get('min_overlap') || '2')

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

    // Validate parameters
    if (minOverlap < 1 || minOverlap > 100) {
      return NextResponse.json(
        { error: 'min_overlap must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Call the SQL function
    const { data, error } = await supabase.rpc('detect_cross_category_patterns', {
      p_experience_ids: experienceIds,
      p_min_overlap: minOverlap,
    })

    if (error) {
      console.error('Error detecting cross-category patterns:', error)
      return NextResponse.json(
        { error: 'Failed to detect cross-category patterns', details: error.message },
        { status: 500 }
      )
    }

    // Return results
    const patterns = (data as any[]) || []
    return NextResponse.json({
      success: true,
      count: patterns.length,
      patterns,
      parameters: {
        min_overlap: minOverlap,
      },
    })
  } catch (error) {
    console.error('Cross-category patterns API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
