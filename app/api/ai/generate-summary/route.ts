import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateSummaryRequest {
  text: string
  metadata?: {
    category?: string
    location?: string
    time?: string
    witnesses?: number
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, metadata }: GenerateSummaryRequest = await req.json()

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Use GPT-4o-mini to generate a concise 7-sentence summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a skilled summarizer for unusual experience reports. Create concise, engaging summaries for feed cards.

RULES:
1. Write EXACTLY 5-7 short sentences
2. Use the same language as the original text
3. Structure: Location → Key action → Details → Duration → Special notes → Time
4. Be factual and concise
5. Capture the most important/unusual elements
6. Make it engaging but not sensationalized
7. Each sentence should be under 15 words

Example (German):
"Gestern Nacht am Bodensee: Leuchtendes UFO gesichtet. Supersonic Bewegung mit Zick-Zack Muster. Komplett lautlos. 3-5 Minuten beobachtet. Von zwei Zeugen bestätigt. Um 22:30 Uhr."

Example (English):
"Last night at Lake Constance: Glowing UFO spotted. Supersonic movement with zigzag pattern. Completely silent. Observed for 3-5 minutes. Confirmed by two witnesses. At 10:30 PM."`,
        },
        {
          role: 'user',
          content: `Story:
${text}

${metadata ? `\nMetadata:\n- Category: ${metadata.category || 'N/A'}\n- Location: ${metadata.location || 'N/A'}\n- Time: ${metadata.time || 'N/A'}\n- Witnesses: ${metadata.witnesses || 0}` : ''}

Generate a 5-7 sentence summary for the feed card.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    const summary = completion.choices[0]?.message?.content?.trim() || ''

    // Validate sentence count (should be 5-7)
    const sentenceCount = summary.split(/[.!?]+/).filter(s => s.trim().length > 0).length

    return NextResponse.json({
      summary,
      sentenceCount,
      isValid: sentenceCount >= 5 && sentenceCount <= 7,
    })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
