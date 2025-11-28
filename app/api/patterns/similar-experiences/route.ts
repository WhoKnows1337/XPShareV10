import { NextResponse } from 'next/server'
import { hybridSearch, type HybridSearchFilters } from '@/lib/search/hybrid'

/**
 * Similar Experiences API
 *
 * Uses AI-powered Hybrid Search (Vector + Full-Text) to find semantically similar experiences.
 * Much more accurate than simple category/tag matching.
 *
 * Returns both formats for backwards compatibility:
 * - `experiences` - Standard format used by components/patterns/similar-experiences.tsx
 * - `matches` - Format expected by lib/stores/newxp2Store.ts
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      experienceId,
      text,
      category,
      tags,
      limit = 10,
      vectorWeight = 0.7 // Higher weight for semantic similarity
    } = body

    // Validate: Need either experienceId OR text
    if (!experienceId && !text) {
      return NextResponse.json(
        { error: 'Either experienceId or text is required' },
        { status: 400 }
      )
    }

    // Build filters
    const filters: HybridSearchFilters = {}
    if (category) {
      filters.category = category
    }
    if (tags && tags.length > 0) {
      filters.tags = tags
    }

    // Use Hybrid Search for semantic similarity
    const results = await hybridSearch({
      similarTo: experienceId, // Use experience embedding if provided
      query: text, // Use text query if no experienceId
      filters,
      maxResults: limit,
      vectorWeight, // Prioritize semantic similarity
    })

    // Filter out the source experience if it was included
    const filteredResults = experienceId
      ? results.filter(exp => exp.id !== experienceId)
      : results

    // Map to expected response format
    const experiences = filteredResults.map(exp => ({
      id: exp.id,
      title: exp.title,
      story_text: exp.story_text,
      category: exp.category,
      tags: exp.tags,
      location_text: exp.location_text,
      date_occurred: exp.date_occurred,
      created_at: exp.created_at,
      user_profiles: exp.username ? {
        username: exp.username,
        display_name: exp.display_name,
        avatar_url: exp.avatar_url
      } : null,
      // Include all similarity scores for transparency
      similarity_score: exp.similarity_score,
      combined_score: exp.combined_score,
      vector_score: exp.vector_score,
      fts_score: exp.fts_score,
    }))

    // Generate insights based on the results
    const insights = generateInsights(experiences, category)

    // Map experiences to "matches" format for newxp2Store compatibility
    const matches = experiences.map(exp => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      similarity: exp.similarity_score,
      preview: exp.story_text?.substring(0, 200) + '...',
      location: exp.location_text,
      date: exp.date_occurred,
      user: exp.user_profiles,
    }))

    return NextResponse.json({
      // Standard format
      experiences,
      count: experiences.length,
      method: 'hybrid_search',
      // Backwards compatibility for newxp2Store
      matches,
      insights,
      constellation: experiences.length >= 3 ? {
        type: category || 'mixed',
        count: experiences.length,
        strength: calculateConstellationStrength(experiences),
      } : null,
    })
  } catch (error) {
    console.error('Similar experiences API error:', error)

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Generate insights based on similar experiences
 */
function generateInsights(
  experiences: Array<{ category: string; similarity_score: number; location_text?: string | null }>,
  sourceCategory?: string
): string[] {
  const insights: string[] = []

  if (experiences.length === 0) {
    return ['Your experience appears to be unique - be the first to explore this pattern!']
  }

  // Category clustering insight
  const categoryCount = experiences.filter(e => e.category === sourceCategory).length
  if (categoryCount >= 2) {
    insights.push(`Found ${categoryCount} similar ${sourceCategory} experiences in our database`)
  }

  // High similarity insight
  const highSimilarity = experiences.filter(e => e.similarity_score > 0.7)
  if (highSimilarity.length > 0) {
    insights.push(`${highSimilarity.length} experiences show strong semantic similarity to yours`)
  }

  // Geographic clustering insight
  const locations = experiences.filter(e => e.location_text).map(e => e.location_text)
  const uniqueLocations = new Set(locations)
  if (uniqueLocations.size > 0 && uniqueLocations.size < experiences.length / 2) {
    insights.push('Geographic clustering detected - similar experiences reported in the same areas')
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push(`Connected to ${experiences.length} related experiences in the XP-Share network`)
  }

  return insights
}

/**
 * Calculate constellation strength based on similarity scores
 */
function calculateConstellationStrength(
  experiences: Array<{ similarity_score: number }>
): number {
  if (experiences.length === 0) return 0
  const avgSimilarity = experiences.reduce((sum, e) => sum + e.similarity_score, 0) / experiences.length
  return Math.round(avgSimilarity * 100) / 100
}
