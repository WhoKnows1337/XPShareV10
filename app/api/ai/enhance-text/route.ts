import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface EnhanceTextRequest {
  originalText: string
  questionAnswers: Record<string, any>
  metadata?: {
    category?: string
    location?: string
    time?: string
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

    const { originalText, questionAnswers, metadata }: EnhanceTextRequest = await req.json()

    if (!originalText || originalText.length < 50) {
      return NextResponse.json(
        { error: 'Original text must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Build context from question answers
    const answersContext = Object.entries(questionAnswers)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        // Format the answer based on type
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`
        }
        return `${key}: ${value}`
      })
      .join('\n')

    // Use GPT-4o-mini to enhance the text naturally
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a skilled editor who enhances personal experience stories by naturally integrating additional details.

IMPORTANT RULES:
1. Preserve the original story's voice, tone, and perspective
2. Integrate the new details NATURALLY - they should flow seamlessly
3. DO NOT add information that wasn't provided
4. Keep the same narrative structure
5. Mark additions with <!--added--> and <!--/added--> tags (hidden from user, used for highlighting)
6. Return ONLY the enhanced text, nothing else

Original text language: ${originalText.substring(0, 100).match(/[äöüß]/i) ? 'German' : 'English'}

Example:
Original: "I saw a bright object in the sky last night."
Additional details: "Movement: zigzag pattern, Speed: very fast"
Enhanced: "I saw a bright object in the sky last night. <!--added-->It moved in a zigzag pattern at incredible speed.<!--/added-->"`,
        },
        {
          role: 'user',
          content: `Original Story:
${originalText}

Additional Details to Integrate:
${answersContext || 'No additional details provided'}

${metadata ? `\nMetadata Context:\n- Category: ${metadata.category || 'N/A'}\n- Location: ${metadata.location || 'N/A'}\n- Time: ${metadata.time || 'N/A'}` : ''}

Please enhance the story by naturally integrating the additional details.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const enhancedText = completion.choices[0]?.message?.content || originalText

    // If no answers were provided, return original
    if (!answersContext) {
      return NextResponse.json({
        enhancedText: originalText,
        hasEnhancements: false,
      })
    }

    return NextResponse.json({
      enhancedText,
      hasEnhancements: enhancedText !== originalText,
    })
  } catch (error) {
    console.error('Text enhancement error:', error)
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    )
  }
}
