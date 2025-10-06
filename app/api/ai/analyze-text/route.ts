import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Parallel AI analysis
    const [categoryResponse, tagsResponse, emotionResponse] = await Promise.all([
      // 1. Category classification
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Classify the experience into ONE of these categories:
- ufo: UFO sightings, aerial phenomena, strange crafts
- paranormal: Ghosts, hauntings, unexplained presences
- dreams: Vivid dreams, lucid dreams, prophetic dreams
- psychedelic: Psychedelic experiences, altered states
- spiritual: Spiritual experiences, religious encounters
- synchronicity: Meaningful coincidences, patterns
- nde: Near-death experiences
- other: Anything else

Reply with ONLY the category name, nothing else.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      }),

      // 2. Tag extraction
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extract 5-10 relevant keywords/tags from this experience.
Return ONLY a JSON array of strings, like: ["lights", "triangle", "silent"]
No additional text or formatting.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),

      // 3. Emotion analysis
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `What is the primary emotion in this experience?
Choose ONE: fear, awe, joy, confusion, peace, excitement, curiosity
Reply with ONLY the emotion word, nothing else.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    ])

    const category = categoryResponse.choices[0].message.content?.trim() || 'other'

    let tags: string[] = []
    try {
      const tagsContent = tagsResponse.choices[0].message.content || '{}'
      const tagsParsed = JSON.parse(tagsContent)
      tags = Array.isArray(tagsParsed) ? tagsParsed : (tagsParsed.tags || [])
    } catch (e) {
      console.error('Failed to parse tags:', e)
      tags = []
    }

    const emotion = emotionResponse.choices[0].message.content?.trim() || 'curiosity'

    return NextResponse.json({
      category,
      tags,
      emotion,
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
}
