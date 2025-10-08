import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get audio file from FormData
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Check file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Convert File to Buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a temporary file-like object
    const audioBlob = new Blob([buffer], { type: audioFile.type })
    const tempFile = new File([audioBlob], audioFile.name, { type: audioFile.type })

    console.log('Transcribing audio:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: tempFile,
      model: 'whisper-1',
      language: 'de', // German
      response_format: 'json',
      // Optional: Add prompt for better context
      prompt:
        'Dies ist eine Beschreibung einer außergewöhnlichen Erfahrung wie UFO-Sichtung, paranormale Aktivität, Traum, spirituelles Erlebnis oder Synchronizität.',
    })

    const transcript = transcription.text

    console.log('Transcription result:', {
      length: transcript.length,
      preview: transcript.substring(0, 100),
    })

    return NextResponse.json({
      success: true,
      transcript,
      duration: transcription.duration || null,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)

    if (error?.error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      )
    }

    if (error?.error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please try again.' },
      { status: 500 }
    )
  }
}

// Increase body size limit for audio files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}
