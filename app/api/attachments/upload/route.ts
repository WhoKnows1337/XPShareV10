/**
 * File Upload API Route
 *
 * Handles file uploads and vision analysis for multi-modal messages.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateFile } from '@/lib/attachments/upload'
import { processImageAttachment } from '@/lib/attachments/vision'
import type { Database } from '@/lib/supabase/database.types'

type MessageAttachment = Database['public']['Tables']['message_attachments']['Row']

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for vision analysis

/**
 * POST /api/attachments/upload
 *
 * Upload file and optionally run vision analysis
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const messageId = formData.get('messageId') as string
    const runVisionAnalysis = formData.get('runVisionAnalysis') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate storage path
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${user.id}/${messageId}/${timestamp}_${sanitizedFilename}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('discovery-attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload API] Upload failed:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('discovery-attachments')
      .getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: 'Failed to get file URL' }, { status: 500 })
    }

    // Extract text from text files
    let extractedText: string | undefined
    if (file.type.startsWith('text/')) {
      try {
        extractedText = await file.text()
      } catch (error) {
        console.warn('[Upload API] Failed to extract text:', error)
      }
    }

    // Save attachment metadata
    const { data: attachmentData, error: dbError } = (await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        user_id: user.id,
        filename: file.name,
        media_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        storage_url: urlData.publicUrl,
        extracted_text: extractedText,
      })
      .select()
      .single()) as { data: MessageAttachment | null; error: any }

    if (dbError) {
      console.error('[Upload API] Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('discovery-attachments').remove([storagePath])
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Run vision analysis for images (async, don't block response)
    if (runVisionAnalysis && file.type.startsWith('image/')) {
      // Run in background (don't await)
      processImageAttachment(attachmentData.id, urlData.publicUrl).catch((error) => {
        console.error('[Upload API] Vision analysis failed:', error)
      })
    }

    return NextResponse.json({
      success: true,
      attachment: {
        id: attachmentData.id,
        filename: attachmentData.filename,
        mediaType: attachmentData.media_type,
        fileSize: attachmentData.file_size,
        storageUrl: attachmentData.storage_url,
      },
    })
  } catch (error) {
    console.error('[Upload API] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
