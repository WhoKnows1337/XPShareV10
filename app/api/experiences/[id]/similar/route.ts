import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    // Get the source experience
    const { data: sourceExperience, error: sourceError } = await supabase
      .from('experiences')
      .select('category, tags, location_lat, location_lng, story_text')
      .eq('id', id)
      .single()

    if (sourceError || !sourceExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      )
    }

    // Find similar experiences using multiple criteria
    const { data: similarExperiences, error: similarError } = await supabase
      .from('experiences')
      .select(`
        id,
        title,
        category,
        tags,
        location_text,
        location_lat,
        location_lng,
        story_text,
        date_occurred,
        created_at,
        user_profiles!experiences_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('category', sourceExperience.category)
      .neq('id', id)
      .eq('visibility', 'public')
      .limit(20)

    if (similarError) {
      console.error('Similar experiences query error:', similarError)
      return NextResponse.json(
        { error: 'Failed to find similar experiences' },
        { status: 500 }
      )
    }

    // Calculate match scores for each experience
    const scoredExperiences = (similarExperiences || []).map((exp) => {
      let score = 50 // Base score for same category

      // Tag overlap (up to 30 points)
      const sourceTags = sourceExperience.tags || []
      const expTags = exp.tags || []
      const commonTags = sourceTags.filter((tag) => expTags.includes(tag))
      score += Math.min(commonTags.length * 10, 30)

      // Location proximity (up to 20 points)
      if (
        sourceExperience.location_lat &&
        sourceExperience.location_lng &&
        exp.location_lat &&
        exp.location_lng
      ) {
        const distance = calculateDistance(
          sourceExperience.location_lat,
          sourceExperience.location_lng,
          exp.location_lat,
          exp.location_lng
        )

        // Within 50km = 20 points, linear decay to 500km
        if (distance < 50) score += 20
        else if (distance < 500) score += Math.floor(20 * (1 - distance / 500))
      }

      // Determine match reasons
      const reasons: string[] = []
      if (commonTags.length > 0) {
        reasons.push(`${commonTags.length} gemeinsame Tags`)
      }
      if (exp.location_text) {
        reasons.push(`Ähnlicher Ort`)
      }
      reasons.push(`Gleiche Kategorie: ${exp.category}`)

      return {
        id: exp.id,
        title: exp.title,
        category: exp.category,
        location: exp.location_text,
        date: exp.date_occurred,
        teaser: exp.story_text?.substring(0, 200) + '...' || '',
        user: exp.user_profiles,
        matchScore: Math.min(score, 100), // Cap at 100
        matchReasons: reasons,
      }
    })

    // Sort by match score
    scoredExperiences.sort((a, b) => b.matchScore - a.matchScore)

    // Get top 5
    const topMatches = scoredExperiences.slice(0, 5)

    // Calculate stats
    const stats = {
      totalSimilar: scoredExperiences.length,
      globalCategoryCount: await getGlobalCategoryCount(
        supabase,
        sourceExperience.category
      ),
      averageMatchScore: topMatches.length
        ? Math.floor(
            topMatches.reduce((sum, exp) => sum + exp.matchScore, 0) /
              topMatches.length
          )
        : 0,
    }

    return NextResponse.json({
      similar: topMatches,
      stats,
    })
  } catch (error) {
    console.error('Similar experiences error:', error)
    return NextResponse.json(
      {
        error: 'Failed to find similar experiences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Helper: Get global count for category
async function getGlobalCategoryCount(
  supabase: any,
  category: string
): Promise<number> {
  const { count, error } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('visibility', 'public')

  if (error) {
    console.error('Count error:', error)
    return 0
  }

  return count || 0
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
