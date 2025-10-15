import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface SummarizeRequest {
  text: string
  category: string
}

export async function POST(request: NextRequest) {
  const body: SummarizeRequest = await request.json()
  const { text, category } = body

  if (!text) {
    return NextResponse.json(
      { error: 'Text is required' },
      { status: 400 }
    )
  }

  try {

    const systemPrompt = `Du bist ein Experte darin, fesselnde Titel und Teaser für persönliche Erfahrungsberichte zu erstellen.

Aufgabe:
1. Erstelle 3 verschiedene Titel-Varianten (max 60 Zeichen):
   - MYSTERIOUS: Weckt Neugier, mysteriös, spannend
   - FACTUAL: Sachlich, präzise, informativ
   - DESCRIPTIVE: Beschreibend, emotional, erlebbar

2. Erstelle einen Teaser (max 280 Zeichen):
   - Fasse die Essenz der Erfahrung zusammen
   - Wecke Neugier ohne zu viel zu verraten
   - Verwende aktive Sprache
   - Endet mit "..." wenn sinnvoll

WICHTIG:
- Titel müssen unter 60 Zeichen sein
- Teaser muss unter 280 Zeichen sein
- Keine Clickbait
- Respektiere die Ernsthaftigkeit der Erfahrung

Kategorie: ${category}

Text:
${text.substring(0, 2000)} // First 2000 chars

Antworte im JSON Format:
{
  "titleSuggestions": [
    { "text": "...", "style": "mysterious", "score": 90 },
    { "text": "...", "style": "factual", "score": 85 },
    { "text": "...", "style": "descriptive", "score": 88 }
  ],
  "teaser": "...",
  "teaserLength": 143
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: 'Erstelle jetzt die Zusammenfassung.',
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    // Validate and truncate if needed
    if (result.titleSuggestions) {
      result.titleSuggestions = result.titleSuggestions.map((s: any) => ({
        ...s,
        text: s.text.substring(0, 60),
      }))
    }

    if (result.teaser) {
      result.teaser = result.teaser.substring(0, 280)
      result.teaserLength = result.teaser.length
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Summarization error:', error)

    // Fallback summary
    const fallbackTitle = text.split('.')[0].substring(0, 60) || 'Meine Erfahrung'
    const fallbackTeaser = text.substring(0, 277) + '...'

    return NextResponse.json({
      titleSuggestions: [
        { text: fallbackTitle, style: 'factual', score: 60 },
        { text: fallbackTitle + '...', style: 'mysterious', score: 55 },
        { text: fallbackTitle, style: 'descriptive', score: 58 },
      ],
      teaser: fallbackTeaser,
      teaserLength: fallbackTeaser.length,
    })
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
