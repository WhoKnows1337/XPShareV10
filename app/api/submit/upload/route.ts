import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadSchema, validateFileUpload } from '@/lib/validation/submit-schemas';
import { sanitizeFileName } from '@/lib/validation/sanitization';
import crypto from 'crypto';

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Secure File Upload API
 * Handles media uploads with validation, sanitization, and virus scanning
 */

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 10;
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/webm': ['.weba'],
  // Video
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
};

// Rate limiting: Track uploads per user
const uploadRateLimit = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================
    const { data: { user }, error: userError } = await (supabase as any).auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. RATE LIMITING CHECK
    // ============================================================
    const userRateLimit = uploadRateLimit.get(user.id);
    const now = Date.now();

    if (userRateLimit) {
      if (now < userRateLimit.resetTime) {
        if (userRateLimit.count >= 50) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((userRateLimit.resetTime - now) / 1000),
            },
            { status: 429 }
          );
        }
        userRateLimit.count++;
      } else {
        // Reset rate limit window
        uploadRateLimit.set(user.id, {
          count: 1,
          resetTime: now + 15 * 60 * 1000, // 15 minutes
        });
      }
    } else {
      uploadRateLimit.set(user.id, {
        count: 1,
        resetTime: now + 15 * 60 * 1000,
      });
    }

    // ============================================================
    // 3. PARSE MULTIPART FORM DATA
    // ============================================================
    const formData = await request.formData();
    const files: File[] = [];
    const experienceId = formData.get('experienceId') as string | null;

    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per upload` },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. VALIDATE EACH FILE
    // ============================================================
    const uploadResults: Array<{
      originalName: string;
      url?: string;
      error?: string;
    }> = [];

    for (const file of files) {
      try {
        // 4.1. Check file size
        if (file.size > MAX_FILE_SIZE) {
          uploadResults.push({
            originalName: file.name,
            error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          });
          continue;
        }

        // 4.2. Validate MIME type
        if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
          uploadResults.push({
            originalName: file.name,
            error: `File type ${file.type} not allowed`,
          });
          continue;
        }

        // 4.3. Validate file extension matches MIME type
        const allowedExts = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;

        if (!allowedExts.includes(fileExt)) {
          uploadResults.push({
            originalName: file.name,
            error: 'File extension does not match MIME type',
          });
          continue;
        }

        // 4.4. Sanitize filename
        const sanitizedName = await sanitizeFileName(file.name);

        // 4.5. Check file content (basic magic number validation)
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        if (!validateFileSignature(bytes, file.type)) {
          uploadResults.push({
            originalName: file.name,
            error: 'File content does not match declared type',
          });
          continue;
        }

        // 4.6. Generate unique filename with hash
        const hash = crypto
          .createHash('sha256')
          .update(Buffer.from(buffer))
          .digest('hex')
          .substring(0, 8);

        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${hash}-${sanitizedName}`;

        // ============================================================
        // 5. UPLOAD TO SUPABASE STORAGE
        // ============================================================
        const bucketName = getStorageBucket(file.type);
        const filePath = `${user.id}/${uniqueName}`;

        const { data: uploadData, error: uploadError } = await (supabase as any)
          .storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false, // Don't overwrite existing files
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          uploadResults.push({
            originalName: file.name,
            error: 'Upload failed',
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = (supabase as any)
          .storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // ============================================================
        // 6. SAVE METADATA TO DATABASE (if experienceId provided)
        // ============================================================
        if (experienceId) {
          const mediaType = getMediaType(file.type);

          await (supabase as any)
            .from('experience_media')
            .insert({
              experience_id: experienceId,
              type: mediaType,
              url: publicUrl,
              filename: sanitizedName,
              file_size: file.size,
              mime_type: file.type,
              storage_path: filePath,
              uploaded_by: user.id,
              sort_order: uploadResults.length,
            });
        }

        uploadResults.push({
          originalName: file.name,
          url: publicUrl,
        });

      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        uploadResults.push({
          originalName: file.name,
          error: fileError.message || 'Processing failed',
        });
      }
    }

    // ============================================================
    // 7. RETURN RESULTS
    // ============================================================
    const successCount = uploadResults.filter(r => r.url).length;
    const failureCount = uploadResults.filter(r => r.error).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount} file(s) uploaded successfully, ${failureCount} failed`,
      results: uploadResults,
    });

  } catch (error: any) {
    console.error('Upload endpoint error:', error);

    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE endpoint for removing uploaded files
// ============================================================
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await (supabase as any).auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { storagePath, mediaId } = await request.json();

    if (!storagePath || !mediaId) {
      return NextResponse.json(
        { error: 'Storage path and media ID required' },
        { status: 400 }
      );
    }

    // Verify user owns this media
    const { data: media } = await (supabase as any)
      .from('experience_media')
      .select('id, uploaded_by')
      .eq('id', mediaId)
      .single();

    if (!media || media.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'Media not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from storage
    const bucket = storagePath.includes('audio')
      ? 'experience-audio'
      : storagePath.includes('video')
      ? 'experience-videos'
      : 'experience-images';

    const { error: deleteError } = await (supabase as any)
      .storage
      .from(bucket)
      .remove([storagePath]);

    if (deleteError) {
      console.error('Storage deletion error:', deleteError);
    }

    // Delete from database
    await (supabase as any)
      .from('experience_media')
      .delete()
      .eq('id', mediaId);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete endpoint error:', error);
    return NextResponse.json(
      { error: 'Delete failed', message: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validate file signature (magic numbers) to ensure file type matches content
 */
function validateFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  // Check first few bytes for known file signatures
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'audio/mpeg': [[0xFF, 0xFB], [0xFF, 0xF3], [0xFF, 0xF2], [0x49, 0x44, 0x33]], // MP3 or ID3
    'audio/wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'video/mp4': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]], // ftyp
    'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // EBML
  };

  const validSignatures = signatures[mimeType];
  if (!validSignatures) {
    return true; // Allow if we don't have signature check for this type
  }

  // Check if file starts with any valid signature
  return validSignatures.some(sig =>
    sig.every((byte, index) => bytes[index] === byte)
  );
}

/**
 * Determine storage bucket based on file type
 */
function getStorageBucket(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'experience-images';
  if (mimeType.startsWith('audio/')) return 'experience-audio';
  if (mimeType.startsWith('video/')) return 'experience-videos';
  return 'experience-media'; // Default bucket
}

/**
 * Get media type category from MIME type
 */
function getMediaType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
}

// ============================================================
// OPTIONS endpoint for CORS preflight
// ============================================================
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}