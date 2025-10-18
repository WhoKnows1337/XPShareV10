import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patterns/tag-network
 *
 * Analyzes tag co-occurrence patterns
 *
 * Query params:
 *   - experience_ids: Comma-separated UUIDs (required)
 *   - min_cooccurrence: Minimum co-occurrences for pattern (optional, default: 2)
 *
 * Returns: Array of tag pairs that frequently appear together
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
    const minCooccurrence = parseInt(searchParams.get('min_cooccurrence') || '2')

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
    if (minCooccurrence < 1 || minCooccurrence > 100) {
      return NextResponse.json(
        { error: 'min_cooccurrence must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Call the SQL function
    const { data, error } = await supabase.rpc('analyze_tag_network', {
      p_experience_ids: experienceIds,
      p_min_cooccurrence: minCooccurrence,
    })

    if (error) {
      console.error('Error analyzing tag network:', error)
      return NextResponse.json(
        { error: 'Failed to analyze tag network', details: error.message },
        { status: 500 }
      )
    }

    // Type assertion for Json response
    const tagPairs = (data as any[]) || []

    // Return results
    return NextResponse.json({
      success: true,
      count: tagPairs.length,
      tag_pairs: tagPairs,
      parameters: {
        min_cooccurrence: minCooccurrence,
      },
    })
  } catch (error) {
    console.error('Tag network API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
