import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patterns/similarity
 *
 * Explains why two experiences are similar
 *
 * Query params:
 *   - id1: First experience UUID (required)
 *   - id2: Second experience UUID (required)
 *
 * Returns: Detailed breakdown of similarity components
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
    const id1 = searchParams.get('id1')
    const id2 = searchParams.get('id2')

    if (!id1 || !id2) {
      return NextResponse.json(
        { error: 'Missing required parameters: id1 and id2' },
        { status: 400 }
      )
    }

    if (id1 === id2) {
      return NextResponse.json(
        { error: 'Cannot compare experience with itself' },
        { status: 400 }
      )
    }

    // Call the SQL function
    const { data, error } = await supabase.rpc('get_similarity_explanation', {
      p_experience_id1: id1,
      p_experience_id2: id2,
    })

    if (error) {
      console.error('Error getting similarity explanation:', error)
      return NextResponse.json(
        { error: 'Failed to get similarity explanation', details: error.message },
        { status: 500 }
      )
    }

    // Type assertion for Json response
    const explanation = data as any

    // Check for error in returned data
    if (explanation && explanation.error) {
      return NextResponse.json(
        { error: explanation.error },
        { status: 404 }
      )
    }

    // Return results
    return NextResponse.json({
      success: true,
      explanation,
    })
  } catch (error) {
    console.error('Similarity explanation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
