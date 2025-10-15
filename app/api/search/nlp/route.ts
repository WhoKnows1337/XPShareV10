import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'

/**
 * Natural Language Query Understanding API
 *
 * Translates natural language queries into structured search filters
 * using GPT-4o-mini for query understanding.
 *
 * POST /api/search/nlp
 * Body: {
 *   query: string (e.g., "UFO Sichtungen am Bodensee im Sommer mit mehreren Zeugen")
 * }
 *
 * Returns: {
 *   understood: {
 *     keywords: string[],
 *     categories: string[],
 *     location: { name, coordinates?, radius? },
 *     dateRange: { from, to },
 *     timeOfDay: string,
 *     tags: string[],
 *     attributes: [{ key, operator?, value }]
 *   },
 *   results: Experience[],
 *   total: number
 * }
 */

const QUERY_UNDERSTANDING_PROMPT = `Du bist ein Such-Assistent für eine Erfahrungs-Datenbank.
Übersetze natürliche Suchanfragen in strukturierte Filter.

**Verfügbare Kategorien:**
ufo, paranormal, dreams, synchronicity, psychedelic, nde, meditation, astral-projection, time-anomaly, entity, energy, other

**Extrahiere folgende Felder (nur wenn im Query vorhanden):**
- keywords: Array von Suchbegriffen (wichtigste Wörter)
- categories: Array von Kategorien (aus obiger Liste)
- location: Objekt {name: string, radius?: number in km}
- dateRange: Objekt {from: ISO date, to: ISO date}
- timeOfDay: "morning" | "afternoon" | "evening" | "night"
- tags: Array von Tags/Themen
- attributes: Array von {key: string, operator?: string, value: string}

**Wichtige Attribute-Keys:**
- witness_count (number): Anzahl Zeugen
- object_shape (text): Form (triangle, sphere, disc, cigar, oval, etc.)
- object_color (text): Farbe (orange, white, red, green, blue, etc.)
- duration_seconds (number): Dauer in Sekunden
- altitude (number): Höhe in Metern
- emotion_primary (text): Hauptemotion (fear, wonder, peace, confusion, etc.)
- substance (text): Substanz (ayahuasca, lsd, psilocybin, dmt, etc.)
- movement_pattern (text): Bewegungsmuster

**Datums-Logik:**
- "im Sommer" → dateRange: {from: "YYYY-06-01", to: "YYYY-08-31"}
- "letztes Jahr" → dateRange: {from: "YYYY-01-01", to: "YYYY-12-31"}
- "in den letzten 30 Tagen" → dateRange: {from: (heute - 30 Tage), to: heute}

**Beispiele:**

Query: "UFO Sichtungen am Bodensee im Sommer"
{
  "keywords": ["UFO", "Sichtungen"],
  "categories": ["ufo"],
  "location": {"name": "Bodensee", "radius": 50},
  "dateRange": {"from": "2024-06-01", "to": "2024-08-31"}
}

Query: "Mehrere Leute sahen orange Dreiecke nachts"
{
  "keywords": ["orange", "Dreiecke"],
  "attributes": [
    {"key": "witness_count", "operator": ">", "value": "1"},
    {"key": "object_shape", "value": "triangle"},
    {"key": "object_color", "value": "orange"}
  ],
  "timeOfDay": "night"
}

Query: "Ayahuasca Erfahrungen mit starken Emotionen"
{
  "keywords": ["Ayahuasca", "Emotionen"],
  "categories": ["psychedelic"],
  "attributes": [
    {"key": "substance", "value": "ayahuasca"}
  ],
  "tags": ["intense", "emotional"]
}

**WICHTIG:**
- Nur Felder zurückgeben die im Query EXPLIZIT erwähnt sind
- Keine Erfindungen, nur Extraktionen
- Attribute nur wenn spezifische Details genannt werden
- Antworte als valides JSON ohne Code-Blocks
`

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters long' },
        { status: 400 }
      )
    }

    // Step 1: GPT-4o-mini Query Understanding
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: QUERY_UNDERSTANDING_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
    })

    const understood = JSON.parse(completion.choices[0].message.content || '{}')

    // Step 2: Build Supabase Query
    const supabase = await createClient()

    let supabaseQuery = supabase
      .from('experiences')
      .select(`
        *,
        user_profiles:user_id (username, avatar_url)
      `)
      .eq('visibility', 'public')

    // Apply category filter
    if (understood.categories?.length > 0) {
      supabaseQuery = supabaseQuery.in('category', understood.categories)
    }

    // Apply tags filter
    if (understood.tags?.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', understood.tags)
    }

    // Apply date range
    if (understood.dateRange?.from) {
      supabaseQuery = supabaseQuery.gte('date_occurred', understood.dateRange.from)
    }
    if (understood.dateRange?.to) {
      supabaseQuery = supabaseQuery.lte('date_occurred', understood.dateRange.to)
    }

    // Apply time of day
    if (understood.timeOfDay) {
      supabaseQuery = supabaseQuery.eq('time_of_day', understood.timeOfDay)
    }

    // Apply location (simplified - ILIKE search)
    if (understood.location?.name) {
      supabaseQuery = supabaseQuery.ilike('location_text', `%${understood.location.name}%`)
    }

    // Execute base query
    let { data: experiences, error: queryError } = await supabaseQuery.limit(100)

    if (queryError) {
      console.error('Query error:', queryError)
      throw queryError
    }

    // Step 3: Filter by attributes (if specified)
    if (understood.attributes?.length > 0 && experiences) {
      const experienceIds = experiences.map((e: any) => e.id)

      // For each attribute filter, find matching experiences
      for (const attr of understood.attributes) {
        const { data: attrData } = await supabase
          .from('experience_attributes')
          .select('experience_id')
          .in('experience_id', experienceIds)
          .eq('attribute_key', attr.key)
          .eq('attribute_value', attr.value)

        const matchingIds = new Set(attrData?.map((a: any) => a.experience_id) || [])
        experiences = experiences.filter((e: any) => matchingIds.has(e.id))
      }
    }

    // Step 4: Apply keyword filtering (simple ILIKE on title/story_text)
    if (understood.keywords?.length > 0 && experiences) {
      const keywordPattern = understood.keywords.map((k: string) => k.toLowerCase())
      experiences = experiences.filter((exp: any) => {
        const text = `${exp.title} ${exp.story_text}`.toLowerCase()
        return keywordPattern.some((keyword: string) => text.includes(keyword))
      })
    }

    const executionTime = Date.now() - startTime

    // Step 5: Track search
    const { data: { user } } = await (supabase as any).auth.getUser()

    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: query,
        p_user_id: user?.id || null,
        p_result_count: experiences?.length || 0,
        p_search_type: 'nlp',
        p_filters: understood,
        p_language: 'de',
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      console.warn('Failed to track search:', trackError)
    }

    return NextResponse.json({
      understood,
      results: experiences?.slice(0, 20) || [],
      total: experiences?.length || 0,
      meta: {
        query,
        executionTime,
        searchType: 'nlp',
      },
    })

  } catch (error: any) {
    console.error('NLP search error:', error)

    return NextResponse.json(
      {
        error: 'NLP search failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
