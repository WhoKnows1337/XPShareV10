import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DetectWitnessesRequest {
  text: string
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

    const { text }: DetectWitnessesRequest = await req.json()

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Text must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Use GPT-4o-mini to detect witness mentions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI that detects mentions of other people (witnesses) in experience reports.

TASK: Extract names and contextual information about witnesses mentioned in the text.

RULES:
1. Only extract EXPLICIT mentions of other people present during the experience
2. Extract first names or full names if provided
3. Include the context (relationship, how they were mentioned)
4. Return a JSON array of witnesses
5. If no witnesses found, return empty array

Return format:
{
  "witnesses": [
    {
      "name": "Max",
      "context": "my friend",
      "quote": "mit meinem Freund Max"
    }
  ]
}

Examples:
- "mit meinem Freund Max" → name: "Max", context: "friend"
- "my wife Sarah and I" → name: "Sarah", context: "wife"
- "together with John" → name: "John", context: "companion"
- "I was alone" → [] (no witnesses)`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"witnesses":[]}')
    const witnesses = Array.isArray(result.witnesses) ? result.witnesses : []

    return NextResponse.json({
      witnesses: witnesses.map((w: any) => ({
        name: w.name || '',
        context: w.context || '',
        quote: w.quote || '',
        detectedFromText: true,
      })),
      count: witnesses.length,
    })
  } catch (error) {
    console.error('Witness detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect witnesses' },
      { status: 500 }
    )
  }
}
