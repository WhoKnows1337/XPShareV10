import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface EnrichRequest {
  originalText: string
  answers: Record<string, any>
  category: string
  previousVersion?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequest = await request.json()
    const { originalText, answers, category, previousVersion } = body

    if (!originalText) {
      return NextResponse.json(
        { error: 'Original text is required' },
        { status: 400 }
      )
    }

    // Build context from answers
    const answersContext = Object.entries(answers)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`
        }
        return `${key}: ${value}`
      })
      .join('\n')

    const systemPrompt = `Du bist ein Experte darin, persönliche Erfahrungsberichte natürlich und flüssig zu erweitern.

Aufgabe:
1. Lies den Original-Text des Users
2. Integriere die Q&A-Antworten NAHTLOS in die Geschichte
3. Die Einfügungen sollen sich NATÜRLICH anfühlen, nicht künstlich
4. Behalte den Schreibstil und die Perspektive des Users bei
5. Markiere die eingefügten Passagen mit <INSERT type="TYPE">...</INSERT> Tags

INSERT Types:
- detail: Beschreibende Details (Farbe, Form, Aussehen)
- fact: Faktische Angaben (Dauer, Anzahl, Messungen)
- emotion: Emotionale Beschreibungen
- timeline: Zeitliche Abläufe

Beispiel:
Original: "Ich sah ein Licht am Himmel."
Antworten: Farbe: Orange-gelb, Dauer: 5 Minuten
Enriched: "Ich sah ein Licht am Himmel. <INSERT type="detail">Das Objekt leuchtete in einem intensiven Orange-Gelb</INSERT> und <INSERT type="fact">schwebte etwa fünf Minuten lang völlig bewegungslos</INSERT> am Nachthimmel."

WICHTIG:
- Füge KEINE neuen Fakten hinzu die nicht in den Antworten stehen
- Behalte die Ich-Perspektive bei
- Die Einfügungen müssen grammatikalisch perfekt passen
- Der Lesefluss muss natürlich bleiben

${previousVersion ? 'WICHTIG: Dies ist eine Regenerierung. Formuliere die Einfügungen anders als vorher!' : ''}

Original Text:
${originalText}

Q&A Antworten:
${answersContext}

Kategorie: ${category}

Erstelle die enriched version mit <INSERT> Tags:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: 'Erstelle jetzt die enriched version.',
        },
      ],
      temperature: previousVersion ? 0.9 : 0.7, // Higher temp for regeneration
      max_tokens: 2000,
    })

    const enrichedWithTags = completion.choices[0].message.content || originalText

    // Parse INSERT tags to extract insertions
    const insertRegex = /<INSERT type="(\w+)">(.*?)<\/INSERT>/gs
    const insertions: Array<{
      start: number
      end: number
      text: string
      type: 'detail' | 'fact' | 'emotion' | 'timeline'
    }> = []

    let enrichedText = enrichedWithTags
    let match
    let offset = 0

    // First pass: collect insertions
    const tempInsertions: typeof insertions = []
    while ((match = insertRegex.exec(enrichedWithTags)) !== null) {
      const type = match[1] as 'detail' | 'fact' | 'emotion' | 'timeline'
      const text = match[2]
      const start = match.index - offset
      const end = start + text.length

      tempInsertions.push({ start, end, text, type })

      // Track offset for position calculation
      offset += match[0].length - text.length
    }

    // Second pass: remove tags
    enrichedText = enrichedWithTags.replace(insertRegex, '$2')

    // Recalculate positions in cleaned text
    tempInsertions.forEach((insertion, idx) => {
      const textBefore = enrichedText.substring(0, 500) // Search context
      const insertionIndex = textBefore.indexOf(insertion.text)

      if (insertionIndex !== -1) {
        insertions.push({
          start: insertionIndex,
          end: insertionIndex + insertion.text.length,
          text: insertion.text,
          type: insertion.type,
        })
      }
    })

    return NextResponse.json({
      enrichedText,
      insertions,
      confidence: 85, // Mock confidence for now
    })
  } catch (error) {
    console.error('Enrichment error:', error)
    return NextResponse.json(
      {
        error: 'Enrichment failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
