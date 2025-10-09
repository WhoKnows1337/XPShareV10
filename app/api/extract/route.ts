import { NextRequest, NextResponse } from 'next/server'

// Simpler keyword-based extraction (will be replaced with OpenAI later)
function extractDataFromText(text: string) {
  // Simple location detection
  const locationKeywords = ['Zürich', 'Berlin', 'München', 'Hamburg', 'A1', 'Autobahn']
  const foundLocation = locationKeywords.find(loc =>
    text.toLowerCase().includes(loc.toLowerCase())
  )

  // Simple time detection
  const timeKeywords = ['nachts', 'abends', 'morgens', 'mittags', 'spät']
  const foundTime = timeKeywords.find(time =>
    text.toLowerCase().includes(time.toLowerCase())
  )

  // Simple category detection
  let category = 'Unknown'
  let categoryConfidence = 50

  if (text.toLowerCase().includes('licht') || text.toLowerCase().includes('ufo') || text.toLowerCase().includes('objekt')) {
    category = 'UAP Sighting'
    categoryConfidence = 85
  } else if (text.toLowerCase().includes('traum') || text.toLowerCase().includes('vision')) {
    category = 'Dream/Vision'
    categoryConfidence = 80
  } else if (text.toLowerCase().includes('meditation') || text.toLowerCase().includes('spirituell')) {
    category = 'Spiritual Experience'
    categoryConfidence = 75
  }

  // Simple tag extraction (first 5 meaningful words)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 5)

  // Generate title (first sentence or first 60 chars)
  const firstSentence = text.split(/[.!?]/)[0]
  const title = firstSentence.length > 60
    ? firstSentence.substring(0, 57) + '...'
    : firstSentence

  return {
    title: {
      value: title,
      confidence: Math.min(95, Math.max(70, text.length / 2))
    },
    location: {
      value: foundLocation || '',
      confidence: foundLocation ? 85 : 40
    },
    date: {
      value: foundTime || '',
      confidence: foundTime ? 75 : 30
    },
    tags: {
      value: words,
      confidence: words.length > 0 ? 70 : 20
    },
    category: {
      value: category,
      confidence: categoryConfidence
    }
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

    // TODO: Replace with OpenAI API call
    // For now, use simple extraction
    const extractedData = extractDataFromText(text)

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
