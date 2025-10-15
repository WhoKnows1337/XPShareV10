import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'

/**
 * Auto-Complete API - AI-powered search suggestions
 *
 * Combines:
 * - GPT-4 intelligent query suggestions
 * - Popular searches from analytics
 * - Fuzzy spelling corrections
 *
 * POST /api/search/autocomplete
 * Body: { query: string, limit?: number }
 */

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 8 } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const supabase = await createClient()
    const trimmedQuery = query.trim()

    // Run in parallel: Popular searches + AI suggestions
    const [popularSearches, aiSuggestions] = await Promise.all([
      getPopularSearches(supabase, trimmedQuery, Math.ceil(limit / 2)),
      getAISuggestions(trimmedQuery, Math.ceil(limit / 2))
    ])

    // Combine and deduplicate
    const allSuggestions = [
      ...aiSuggestions.map(s => ({ text: s, source: 'ai', score: 1.0 })),
      ...popularSearches.map(s => ({ text: s.query_text, source: 'popular', score: 0.8 }))
    ]

    // Deduplicate by lowercased text
    const seen = new Set<string>()
    const uniqueSuggestions = allSuggestions.filter(s => {
      const key = s.text.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by score and limit
    const finalSuggestions = uniqueSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json({
      suggestions: finalSuggestions,
      query: trimmedQuery
    })

  } catch (error: any) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { error: 'Autocomplete failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Get popular searches from analytics that match the query
 */
async function getPopularSearches(
  supabase: any,
  query: string,
  limit: number
): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('search_analytics')
      .select('query_text')
      .ilike('query_text', `%${query}%`)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .limit(limit * 2)

    if (!data || data.length === 0) return []

    // Count occurrences
    const counts = new Map<string, number>()
    data.forEach((row: any) => {
      const text = row.query_text.trim()
      counts.set(text, (counts.get(text) || 0) + 1)
    })

    // Sort by count and return
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query_text]) => ({ query_text }))
  } catch (error) {
    console.warn('Failed to get popular searches:', error)
    return []
  }
}

/**
 * Get AI-powered suggestions using GPT-4
 */
async function getAISuggestions(query: string, limit: number): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Du bist ein Such-Assistent für eine Plattform über außergewöhnliche Erfahrungen.

Kategorien: UFO, Paranormal, Dreams, Synchronicity, Psychedelic, NDE, Meditation, Astral Projection, Time Anomaly, Entity, Energy, Other

Gegeben eine unvollständige Suchanfrage, generiere ${limit} sinnvolle Vervollständigungen oder verwandte Suchanfragen.
- Fokus auf häufige Suchintentionen
- Berücksichtige Rechtschreibfehler ("Bodense" → "Bodensee")
- Variiere zwischen spezifisch und allgemein
- Deutsch und Englisch gemischt möglich

Antworte als JSON Array von Strings: ["suggestion1", "suggestion2", ...]`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 200
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    // Support both array formats
    if (Array.isArray(result)) return result.slice(0, limit)
    if (result.suggestions && Array.isArray(result.suggestions)) {
      return result.suggestions.slice(0, limit)
    }

    return []
  } catch (error) {
    console.warn('Failed to get AI suggestions:', error)
    return []
  }
}
