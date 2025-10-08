import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface LiveAnalysisRequest {
  text: string
  currentAnalysis?: any
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

    const { text, currentAnalysis }: LiveAnalysisRequest = await req.json()

    // Validate minimum text length
    if (text.length < 50) {
      return NextResponse.json({
        status: 'too_short',
        message: 'Text must be at least 50 characters',
      })
    }

    // Perform parallel AI analysis
    const [
      categoryResult,
      locationResult,
      timeResult,
      emotionResult,
      tagsResult,
    ] = await Promise.all([
      analyzeCategory(text),
      extractLocation(text),
      extractTime(text),
      analyzeEmotion(text),
      extractTags(text),
    ])

    // Quick similarity check (only for longer texts to save on embedding costs)
    let similarCount = 0
    let externalEvents: any[] = []

    if (text.length > 200) {
      // Generate embedding
      const embedding = await generateEmbedding(text)

      // Find similar experiences
      const { count } = await supabase.rpc('count_similar_experiences', {
        query_embedding: embedding,
        similarity_threshold: 0.75,
        max_results: 50,
      })

      similarCount = count || 0

      // If we have time info, fetch external events
      if (timeResult.date) {
        externalEvents = await fetchExternalEvents(
          timeResult.date,
          locationResult?.name || null
        )
      }
    }

    const result = {
      category: categoryResult,
      location: locationResult,
      time: timeResult,
      emotion: emotionResult,
      tags: tagsResult,
      similarCount,
      externalEvents,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Live analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

async function analyzeCategory(text: string): Promise<string | null> {
  try {
    // Fetch valid categories from database
    const supabase = await createClient()
    const { data: categories } = await supabase
      .from('question_categories')
      .select('slug, name, description')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (!categories || categories.length === 0) {
      console.error('No categories found in database')
      return 'other'
    }

    // Build category list for AI prompt
    const categoryList = categories
      .map(cat => `- ${cat.slug}: ${cat.description || cat.name}`)
      .join('\n')

    const validSlugs = categories.map(cat => cat.slug)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You categorize unusual experiences. Return a JSON object with the category slug.

Available categories:
${categoryList}

Return format: {"category": "exact-slug-here"}
IMPORTANT: Use the EXACT slug from the list above. For UFO sightings, use "ufo-sighting" not "ufo".`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 50,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
    const category = result.category?.toLowerCase()

    // Return the slug if valid, otherwise return first category as fallback
    return validSlugs.includes(category || '') ? category : validSlugs[0]
  } catch (error) {
    console.error('Category analysis error:', error)
    return null
  }
}

async function extractLocation(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract location information from the text.
Return a JSON object with:
{
  "name": "City, Country" or null,
  "confidence": 0.0 to 1.0
}

If no clear location is mentioned, return { "name": null, "confidence": 0 }`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return result
  } catch (error) {
    console.error('Location extraction error:', error)
    return null
  }
}

async function extractTime(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract time information from the text.
Return a JSON object with:
{
  "date": "YYYY-MM-DD" or null,
  "timeOfDay": "morning|afternoon|evening|night" or null,
  "isApproximate": boolean
}

If no clear time is mentioned, return nulls.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return result
  } catch (error) {
    console.error('Time extraction error:', error)
    return { date: null, timeOfDay: null, isApproximate: true }
  }
}

async function analyzeEmotion(text: string): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze the emotion in the text. Return ONE of:
fear, awe, joy, confusion, peace, wonder, shock, curiosity, anxiety, excitement

Return ONLY the emotion word, nothing else.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 20,
    })

    return completion.choices[0]?.message?.content?.trim().toLowerCase() || null
  } catch (error) {
    console.error('Emotion analysis error:', error)
    return null
  }
}

async function extractTags(text: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract 3-5 relevant hashtags from the text.
Return a JSON array of strings (without # symbol).
Example: ["night", "lights", "sky", "silent"]`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"tags":[]}')
    return Array.isArray(result.tags) ? result.tags : []
  } catch (error) {
    console.error('Tag extraction error:', error)
    return []
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit to 8k chars
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    return []
  }
}

async function fetchExternalEvents(date: string, location: string | null) {
  const events: any[] = []

  try {
    // Fetch solar events
    const solarData = await fetch(
      `https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json`,
      { next: { revalidate: 3600 } }
    ).then(res => res.json())

    // Find events around the date
    const targetDate = new Date(date)
    const relevantSolar = solarData.filter((event: any) => {
      const eventDate = new Date(event.time_tag)
      const diffDays = Math.abs(
        (targetDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return diffDays < 3 && event.flux > 1e-5
    })

    if (relevantSolar.length > 0) {
      events.push({
        type: 'solar',
        title: 'Solar Activity Detected',
        timestamp: relevantSolar[0].time_tag,
        relevance: 0.8,
      })
    }

    // Calculate moon phase
    const moonPhase = calculateMoonPhase(targetDate)
    if (moonPhase.illumination > 0.9) {
      events.push({
        type: 'moon',
        title: `${moonPhase.phase} (${Math.round(moonPhase.illumination * 100)}% illuminated)`,
        timestamp: date,
        relevance: 0.6,
      })
    }
  } catch (error) {
    console.error('External events fetch error:', error)
  }

  return events
}

function calculateMoonPhase(date: Date) {
  // Simplified moon phase calculation
  const LUNAR_MONTH = 29.53058867
  const KNOWN_NEW_MOON = new Date('2000-01-06').getTime()

  const diff = date.getTime() - KNOWN_NEW_MOON
  const days = diff / (1000 * 60 * 60 * 24)
  const phase = (days % LUNAR_MONTH) / LUNAR_MONTH

  let phaseName = 'New Moon'
  if (phase < 0.125) phaseName = 'New Moon'
  else if (phase < 0.25) phaseName = 'Waxing Crescent'
  else if (phase < 0.375) phaseName = 'First Quarter'
  else if (phase < 0.5) phaseName = 'Waxing Gibbous'
  else if (phase < 0.625) phaseName = 'Full Moon'
  else if (phase < 0.75) phaseName = 'Waning Gibbous'
  else if (phase < 0.875) phaseName = 'Last Quarter'
  else phaseName = 'Waning Crescent'

  // Illumination is 0 at new moon, 1 at full moon
  const illumination = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI)

  return {
    phase: phaseName,
    illumination,
  }
}
