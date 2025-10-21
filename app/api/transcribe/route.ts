import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * POST /api/transcribe
 *
 * Transcribe audio using OpenAI Whisper API
 * Supports 99+ languages with automatic detection
 *
 * Features:
 * - Automatic language detection (no manual language setting needed)
 * - Verbose JSON response with detected language & duration
 * - File size & type validation
 * - Comprehensive error handling
 *
 * @param audio - Audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm)
 * @returns { text: string, language: string, duration: number }
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file size (25MB max for Whisper)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/m4a',
    ]

    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Invalid audio format. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('[Transcribe] Processing audio:', {
      name: audioFile.name,
      type: audioFile.type,
      size: `${(audioFile.size / 1024).toFixed(2)} KB`,
    })

    // Convert File to format OpenAI accepts
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a File-like object that OpenAI SDK accepts
    const file = new File([buffer], 'audio.webm', { type: audioFile.type })

    // Call Whisper API with automatic language detection
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      // NO language parameter - Whisper will auto-detect!
      response_format: 'verbose_json', // Get language, duration, and more
    })

    console.log('[Transcribe] Success:', {
      text: transcription.text.substring(0, 50) + '...',
      language: transcription.language,
      duration: transcription.duration,
    })

    return NextResponse.json({
      text: transcription.text,
      language: transcription.language || 'unknown',
      duration: transcription.duration || 0,
    })
  } catch (error: any) {
    console.error('[Transcribe] Error:', error)

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'API key configuration error. Please check server logs.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Transcription failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 1 minute timeout
