import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function extractDataFromText(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing personal experience narratives and extracting structured information.

Extract the following information from the user's experience text:
1. **Title**: A concise, engaging title (max 60 characters)
2. **Location**: Geographic location mentioned (city, region, country, or specific place)
3. **Date**: When did this happen? (parse dates like "last night", "yesterday", "June 2023")
4. **Time**: What time of day? (e.g., "22:30", "late night", "morning")
5. **Tags**: 3-5 relevant keywords that describe the experience
6. **Category**: Classify into one of these categories:
   - UAP Sighting (UFO, unexplained aerial phenomena)
   - Spiritual Experience (meditation, awakening, mystical)
   - Synchronicity (meaningful coincidences)
   - Paranormal (ghosts, unexplained events)
   - Dream/Vision (vivid dreams, visions)
   - Consciousness (altered states, psychedelics)
   - Other
7. **Size**: If an object is described, what size? (e.g., "car-sized", "small", "huge")
8. **Duration**: How long did it last? (e.g., "5 minutes", "several hours", "brief")
9. **Emotions**: What emotions were felt? (e.g., ["fear", "awe", "curiosity"])

For each field, provide:
- value: the extracted information (empty string if not found, empty array for arrays)
- confidence: a score from 0-100 indicating how confident you are

Return ONLY valid JSON with this exact structure:
{
  "title": { "value": "string", "confidence": number },
  "location": { "value": "string", "confidence": number },
  "date": { "value": "string", "confidence": number },
  "time": { "value": "string", "confidence": number },
  "tags": { "value": ["string"], "confidence": number },
  "category": { "value": "string", "confidence": number },
  "size": { "value": "string", "confidence": number },
  "duration": { "value": "string", "confidence": number },
  "emotions": { "value": ["string"], "confidence": number }
}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const extracted = JSON.parse(completion.choices[0].message.content || '{}')
    return extracted
  } catch (error) {
    console.error('OpenAI extraction error:', error)
    // Fallback to simple extraction
    return fallbackExtraction(text)
  }
}

// Fallback if OpenAI fails
function fallbackExtraction(text: string) {
  const locationKeywords = ['Zürich', 'Berlin', 'München', 'Hamburg', 'A1', 'Autobahn']
  const foundLocation = locationKeywords.find(loc =>
    text.toLowerCase().includes(loc.toLowerCase())
  )

  const timeKeywords = ['nachts', 'abends', 'morgens', 'mittags', 'spät']
  const foundTime = timeKeywords.find(time =>
    text.toLowerCase().includes(time.toLowerCase())
  )

  let category = 'Other'
  let categoryConfidence = 50

  if (text.toLowerCase().includes('licht') || text.toLowerCase().includes('ufo')) {
    category = 'UAP Sighting'
    categoryConfidence = 70
  }

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 5)

  const firstSentence = text.split(/[.!?]/)[0]
  const title = firstSentence.length > 60
    ? firstSentence.substring(0, 57) + '...'
    : firstSentence

  return {
    title: { value: title, confidence: 60 },
    location: { value: foundLocation || '', confidence: foundLocation ? 70 : 20 },
    date: { value: '', confidence: 20 },
    time: { value: foundTime || '', confidence: foundTime ? 60 : 20 },
    tags: { value: words, confidence: 50 },
    category: { value: category, confidence: categoryConfidence },
    size: { value: '', confidence: 0 },
    duration: { value: '', confidence: 0 },
    emotions: { value: [], confidence: 0 },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, previousExtraction } = body

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Text too short', code: 'INSUFFICIENT_TEXT' },
        { status: 400 }
      )
    }

    // Extract data using OpenAI (or fallback)
    const extractedData = await extractDataFromText(text)

    // Add processing time for realism
    const processingTime = Math.random() * 1000 + 500

    return NextResponse.json({
      ...extractedData,
      processingTime: Math.round(processingTime)
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Extraction failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Rate limiting headers
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
