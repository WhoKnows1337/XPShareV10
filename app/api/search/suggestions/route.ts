import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

/**
 * Search Suggestions API for Zero-Result Handling
 *
 * POST /api/search/suggestions
 *
 * Provides AI-powered suggestions when a search returns no results.
 * Analyzes the failed query and suggests:
 * - Alternative search terms
 * - Related categories
 * - Spelling corrections
 * - Broader search queries
 */

const SUGGESTIONS_PROMPT = `You are a helpful search assistant for XP-Share, a platform for sharing extraordinary experiences.

When a user's search returns no results, help them find what they're looking for by providing intelligent suggestions.

**Categories on the platform:**
- UFO/UAP sightings
- Paranormal experiences
- Dreams & Lucid Dreams
- Synchronicity
- Psychedelic experiences
- Near-Death Experiences (NDE)
- Meditation experiences
- Astral Projection
- Time Anomalies
- Entity Encounters
- Energy experiences

**Your task:**
1. Analyze the failed search query
2. Identify potential issues (too specific, typos, wrong language, etc.)
3. Suggest 3-5 alternative searches that might yield results
4. Optionally suggest related categories to explore

**Output format (JSON):**
{
  "issue": "Brief explanation of why the search might have failed",
  "suggestions": [
    { "query": "alternative search term 1", "reason": "why this might work better" },
    { "query": "alternative search term 2", "reason": "why this might work better" },
    ...
  ],
  "categories": ["category1", "category2"],
  "tips": "Optional helpful tip for better searching"
}

Be concise, helpful, and encouraging.`

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const {
      query,
      language = 'de',
      category = null,
      filters = {},
    } = body

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Get some context: check what experiences exist in the database
    const supabase = await createClient()

    // Get popular categories
    const { data: categoryStats } = await supabase
      .from('experiences')
      .select('category')
      .limit(100)

    const popularCategories = categoryStats
      ? Array.from(new Set(categoryStats.map(e => e.category).filter(Boolean)))
      : []

    // Get sample titles for reference
    const { data: sampleExperiences } = await supabase
      .from('experiences')
      .select('title, category')
      .order('created_at', { ascending: false })
      .limit(20)

    const sampleTitles = sampleExperiences?.map(e => e.title) || []

    // Build context for AI
    const userMessage = `A user searched for: "${query}"
Language: ${language}
Category filter: ${category || 'none'}
Other filters: ${JSON.stringify(filters)}

The search returned NO results.

Popular categories in database: ${popularCategories.join(', ')}

Sample experience titles: ${sampleTitles.slice(0, 10).join(', ')}

Provide helpful suggestions to help the user find relevant experiences.`

    // Call OpenAI for suggestions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SUGGESTIONS_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const suggestions = JSON.parse(completion.choices[0].message.content || '{}')

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      originalQuery: query,
      suggestions: suggestions.suggestions || [],
      issue: suggestions.issue || 'No results found for this search',
      categories: suggestions.categories || [],
      tips: suggestions.tips || null,
      meta: {
        executionTime,
        language,
      },
    })

  } catch (error: any) {
    console.error('Search suggestions error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate suggestions',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
