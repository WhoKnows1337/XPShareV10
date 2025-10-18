import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patterns/geographic
 *
 * Detects geographic clusters using DBSCAN algorithm
 *
 * Query params:
 *   - experience_ids: Comma-separated UUIDs (required)
 *   - epsilon_km: Maximum distance in km for clustering (optional, default: 50)
 *   - min_points: Minimum points to form a cluster (optional, default: 2)
 *
 * Returns: Array of geographic clusters with location data
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
    const epsilonKm = parseFloat(searchParams.get('epsilon_km') || '50')
    const minPoints = parseInt(searchParams.get('min_points') || '2')

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
    if (epsilonKm <= 0 || epsilonKm > 10000) {
      return NextResponse.json(
        { error: 'epsilon_km must be between 0 and 10000' },
        { status: 400 }
      )
    }

    if (minPoints < 1 || minPoints > 100) {
      return NextResponse.json(
        { error: 'min_points must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Call the SQL function
    const { data, error } = await supabase.rpc('detect_geographic_clusters', {
      p_experience_ids: experienceIds,
      p_epsilon_km: epsilonKm,
      p_min_points: minPoints,
    })

    if (error) {
      console.error('Error detecting geographic clusters:', error)
      return NextResponse.json(
        { error: 'Failed to detect geographic clusters', details: error.message },
        { status: 500 }
      )
    }

    // Return results
    const clusters = (data as any[]) || []
    return NextResponse.json({
      success: true,
      count: clusters.length,
      clusters,
      parameters: {
        epsilon_km: epsilonKm,
        min_points: minPoints,
      },
    })
  } catch (error) {
    console.error('Geographic patterns API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
