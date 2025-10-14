import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * Hybrid Similar Experiences
 * Combines tag/location matching (60%) with attribute matching (40%)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 1. Get the source experience with its attributes
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

    // Get source attributes
    const { data: sourceAttributes, error: attrError } = await supabase
      .from('experience_attributes')
      .select('attribute_key, attribute_value')
      .eq('experience_id', id)

    if (attrError) {
      console.error('Error fetching source attributes:', attrError)
    }

    const sourceAttrMap = (sourceAttributes || []).reduce((acc, attr) => {
      acc[attr.attribute_key] = attr.attribute_value
      return acc
    }, {} as Record<string, string>)

    // 2. Find candidate experiences (same category, public, not self)
    const { data: candidates, error: candidatesError } = await supabase
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
      .limit(50) // Get top 50 candidates

    if (candidatesError) {
      console.error('Candidates query error:', candidatesError)
      return NextResponse.json(
        { error: 'Failed to find similar experiences' },
        { status: 500 }
      )
    }

    // 3. Get attributes for all candidates
    const candidateIds = (candidates || []).map((c) => c.id)
    const { data: allAttributes, error: allAttrError } = await supabase
      .from('experience_attributes')
      .select('experience_id, attribute_key, attribute_value')
      .in('experience_id', candidateIds)

    if (allAttrError) {
      console.error('Error fetching candidate attributes:', allAttrError)
    }

    // Group attributes by experience
    const attributesByExp = (allAttributes || []).reduce((acc, attr) => {
      if (!acc[attr.experience_id]) {
        acc[attr.experience_id] = {}
      }
      acc[attr.experience_id][attr.attribute_key] = attr.attribute_value
      return acc
    }, {} as Record<string, Record<string, string>>)

    // 4. Calculate hybrid scores
    const scoredExperiences = (candidates || []).map((exp) => {
      // Part A: Tag/Location Score (0-100 points)
      let tagLocationScore = 50 // Base score for same category

      // Tag overlap (up to 30 points)
      const sourceTags = sourceExperience.tags || []
      const expTags = exp.tags || []
      const commonTags = sourceTags.filter((tag) => expTags.includes(tag))
      tagLocationScore += Math.min(commonTags.length * 10, 30)

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

        if (distance < 50) tagLocationScore += 20
        else if (distance < 500) tagLocationScore += Math.floor(20 * (1 - distance / 500))
      }

      // Part B: Attribute Matching Score (0-100 points)
      const expAttributes = attributesByExp[exp.id] || {}
      const sourceAttrKeys = Object.keys(sourceAttrMap)
      const expAttrKeys = Object.keys(expAttributes)

      let sharedCount = 0
      const sharedAttributes: string[] = []

      sourceAttrKeys.forEach((key) => {
        if (
          expAttributes[key] &&
          sourceAttrMap[key].toLowerCase() === expAttributes[key].toLowerCase()
        ) {
          sharedCount++
          sharedAttributes.push(key)
        }
      })

      const totalAttributes = Math.max(sourceAttrKeys.length, expAttrKeys.length, 1)
      const attributeScore = (sharedCount / totalAttributes) * 100

      // Part C: Hybrid Score (60% tag/location + 40% attributes)
      const hybridScore = Math.round(tagLocationScore * 0.6 + attributeScore * 0.4)

      // Determine match reasons
      const reasons: string[] = []
      if (sharedCount > 0) {
        reasons.push(`${sharedCount} gemeinsame Attribute`)
      }
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
        hybridScore,
        tagLocationScore: Math.round(tagLocationScore),
        attributeScore: Math.round(attributeScore),
        sharedAttributeCount: sharedCount,
        sharedAttributes,
        matchReasons: reasons,
      }
    })

    // 5. Sort by hybrid score and get top results
    scoredExperiences.sort((a, b) => b.hybridScore - a.hybridScore)
    const topMatches = scoredExperiences.slice(0, limit)

    // Calculate stats
    const stats = {
      totalCandidates: scoredExperiences.length,
      averageHybridScore: topMatches.length
        ? Math.floor(
            topMatches.reduce((sum, exp) => sum + exp.hybridScore, 0) /
              topMatches.length
          )
        : 0,
      averageSharedAttributes: topMatches.length
        ? Math.floor(
            topMatches.reduce((sum, exp) => sum + exp.sharedAttributeCount, 0) /
              topMatches.length
          )
        : 0,
    }

    return NextResponse.json({
      similar: topMatches,
      stats,
      algorithm: 'hybrid_tag_location_attributes',
      weights: {
        tagLocation: 0.6,
        attributes: 0.4,
      },
    })
  } catch (error) {
    console.error('Hybrid similar experiences error:', error)
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

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
