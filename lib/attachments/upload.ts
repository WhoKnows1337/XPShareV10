/**
 * File Upload Handler
 *
 * Handles file uploads to Supabase Storage for multi-modal messages.
 * Supports images (vision analysis) and text files.
 */

import { createClient } from '@/lib/supabase/client'

export interface UploadedFile {
  id: string
  filename: string
  mediaType: string
  fileSize: number
  storagePath: string
  storageUrl: string
  extractedText?: string
  visionDescription?: string
}

export interface UploadResult {
  success: boolean
  file?: UploadedFile
  error?: string
}

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const ALLOWED_TEXT_TYPES = ['text/plain', 'text/markdown', 'text/csv']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_TEXT_TYPES]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed: images (PNG, JPEG, WebP, GIF) and text files`,
    }
  }

  return { valid: true }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  messageId: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const supabase = createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${userId}/${messageId}/${timestamp}_${sanitizedFilename}`

    // Upload to Supabase Storage (discovery-attachments bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('discovery-attachments')
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Failed to upload file:', uploadError)
      return { success: false, error: 'Failed to upload file to storage' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('discovery-attachments')
      .getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get file URL' }
    }

    // Extract text from text files
    let extractedText: string | undefined
    if (ALLOWED_TEXT_TYPES.includes(file.type)) {
      try {
        extractedText = await file.text()
      } catch (error) {
        console.warn('[Upload] Failed to extract text:', error)
      }
    }

    // Save attachment metadata to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        user_id: userId,
        filename: file.name,
        media_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        storage_url: urlData.publicUrl,
        extracted_text: extractedText,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Upload] Failed to save attachment metadata:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('discovery-attachments').remove([storagePath])
      return { success: false, error: 'Failed to save attachment metadata' }
    }

    return {
      success: true,
      file: {
        id: attachmentData.id,
        filename: attachmentData.filename,
        mediaType: attachmentData.media_type,
        fileSize: attachmentData.file_size,
        storagePath: attachmentData.storage_path,
        storageUrl: attachmentData.storage_url,
        extractedText: attachmentData.extracted_text ?? undefined,
        visionDescription: attachmentData.vision_description ?? undefined,
      },
    }
  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected upload error',
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  messageId: string,
  userId: string
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadFile(file, messageId, userId))
  )
  return results
}

/**
 * Convert File to data URL (for client-side preview)
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get file attachments for a message
 */
export async function getMessageAttachments(messageId: string): Promise<UploadedFile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('message_attachments')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Attachments] Failed to fetch attachments:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    filename: row.filename,
    mediaType: row.media_type,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    storageUrl: row.storage_url,
    extractedText: row.extracted_text,
    visionDescription: row.vision_description,
  })) as any
}

/**
 * Delete file attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const supabase = createClient()

  // Get attachment to find storage path
  const { data: attachment } = await supabase
    .from('message_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single()

  if (!attachment) {
    return false
  }

  // Delete from storage
  await supabase.storage.from('discovery-attachments').remove([attachment.storage_path])

  // Delete from database
  const { error } = await supabase
    .from('message_attachments')
    .delete()
    .eq('id', attachmentId)

  return !error
}
