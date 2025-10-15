import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateTitleRequest {
  text: string
  category?: string
  location?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, category, location }: GenerateTitleRequest = await req.json()

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Use GPT-4o-mini to generate a catchy title
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating concise, engaging titles for unusual experience reports.

RULES:
1. Maximum 60 characters (including spaces)
2. Use the same language as the original text
3. Be specific and descriptive
4. Include key elements: What + Where OR What + Key detail
5. NO clickbait, NO sensationalism
6. Make it searchable (include location if possible)
7. Use natural language

Good examples:
- "Supersonic UFO am Berliner Nachthimmel" (45 chars)
- "Silent Triangle over Lake Constance" (36 chars)
- "Lucid Dream: Meeting My Future Self" (36 chars)
- "Time Slip in Downtown Chicago" (30 chars)

Bad examples:
- "You Won't Believe What I Saw!" (too clickbaity)
- "UFO" (too vague)
- "The Most Amazing Experience of My Entire Life That Changed Everything" (too long)`,
        },
        {
          role: 'user',
          content: `Story:
${text}

${category ? `Category: ${category}` : ''}
${location ? `Location: ${location}` : ''}

Generate a concise, engaging title (max 60 characters).`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    })

    const title = completion.choices[0]?.message?.content?.trim() || ''

    // Remove quotes if AI added them
    const cleanTitle = title.replace(/^["']|["']$/g, '')

    // Validate length
    const isValid = cleanTitle.length > 0 && cleanTitle.length <= 60

    return NextResponse.json({
      title: cleanTitle,
      length: cleanTitle.length,
      isValid,
    })
  } catch (error) {
    console.error('Title generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    )
  }
}
