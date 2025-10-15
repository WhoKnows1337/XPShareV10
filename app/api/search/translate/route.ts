import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

/**
 * Query Translation API for Cross-Lingual Search
 *
 * Translates search queries into multiple languages to enable
 * cross-lingual search capabilities.
 *
 * POST /api/search/translate
 * Body: {
 *   query: string,
 *   sourceLanguage?: 'de' | 'en' | 'fr' | 'es' | 'auto',
 *   targetLanguages?: Array<'de' | 'en' | 'fr' | 'es'>
 * }
 *
 * Returns: {
 *   original: string,
 *   translations: {
 *     de?: string,
 *     en?: string,
 *     fr?: string,
 *     es?: string
 *   },
 *   detectedLanguage?: string
 * }
 */

const TRANSLATION_PROMPT = `You are a translation assistant for a search system.
Translate the given search query into the requested languages while preserving search intent and key terms.

**Important Rules:**
- Keep technical terms, names, and specific keywords in their original form if appropriate
- Maintain the search intent and semantic meaning
- Use natural, commonly-used search phrases in each target language
- For location names, use the local variant (e.g., "Lake Constance" → "Bodensee" in German)
- For category terms like "UFO", "NDE", keep abbreviations or translate appropriately

**Output Format:**
Return a JSON object with translations for each requested language.

Example:
Input: "UFO sightings near the lake"
Output:
{
  "de": "UFO Sichtungen in der Nähe des Sees",
  "en": "UFO sightings near the lake",
  "fr": "Observations d'OVNI près du lac",
  "es": "Avistamientos de OVNI cerca del lago"
}
`

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const {
      query,
      sourceLanguage = 'auto',
      targetLanguages = ['de', 'en', 'fr', 'es'],
    } = body

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'targetLanguages must be a non-empty array' },
        { status: 400 }
      )
    }

    // Build the translation request
    const userMessage = `Translate the following search query into ${targetLanguages.join(', ')}:

Query: "${query}"
${sourceLanguage !== 'auto' ? `Source Language: ${sourceLanguage}` : ''}

Return only a JSON object with keys: ${targetLanguages.join(', ')}`

    // Call OpenAI for translation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: TRANSLATION_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    })

    const translations = JSON.parse(completion.choices[0].message.content || '{}')

    // Detect source language if auto
    let detectedLanguage: string | undefined = undefined
    if (sourceLanguage === 'auto') {
      // Simple heuristic: check which translation is closest to original
      const lowerQuery = query.toLowerCase()
      for (const [lang, translation] of Object.entries(translations)) {
        if (typeof translation === 'string' && translation.toLowerCase() === lowerQuery) {
          detectedLanguage = lang
          break
        }
      }
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      original: query,
      translations,
      detectedLanguage: detectedLanguage || sourceLanguage,
      meta: {
        executionTime,
        targetLanguages,
      },
    })

  } catch (error: any) {
    console.error('Query translation error:', error)

    return NextResponse.json(
      {
        error: 'Query translation failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
