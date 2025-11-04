import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';
import { UPLOAD_LIMITS, getAllAllowedMimeTypes } from '@/lib/constants/upload-limits';
import { verifyMimeType, isDangerousFile } from '@/lib/utils/magic-bytes';
import { checkRateLimit, getClientIP, rateLimitError, RATE_LIMIT_CONFIGS } from '@/lib/utils/rate-limiter';
import { uploadToR2, generateFileKey, getPublicUrl } from '@/lib/storage/r2-client';

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMITING
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.FILE_UPLOAD);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    // 2. AUTH CHECK
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. PARSE FORM DATA
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const typeFromMeta = formData.get('type') as string | null; // May be MIME type or category
    const originalMimeTypeFromMeta = formData.get('originalMimeType') as string | null; // ✅ Original MIME from Uppy
    const experienceId = formData.get('experienceId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // ✅ USE ORIGINAL MIME TYPE FROM META (Uppy saves it before file.type gets modified)
    // Fallback to file.type if not provided (shouldn't happen with our setup)
    const originalMimeType = originalMimeTypeFromMeta || file.type; // e.g., 'application/pdf', 'image/png'

    // 3.5 NORMALIZE TYPE - Convert MIME type to DB enum
    // Uppy may send either:
    // - Category: 'photo' | 'video' | 'audio' | 'sketch' | 'document'
    // - MIME type: 'image/png' | 'video/mp4' | etc.
    // We need to normalize to DB enum: 'image' | 'video' | 'audio' | 'sketch' | 'document'
    
    let dbType: 'image' | 'video' | 'audio' | 'sketch' | 'document' = 'image'; // default

    if (typeFromMeta) {
      // If it's already a DB type, use it (but map 'photo' → 'image')
      if (typeFromMeta === 'photo' || typeFromMeta === 'image') {
        dbType = 'image';
      } else if (typeFromMeta === 'video') {
        dbType = 'video';
      } else if (typeFromMeta === 'audio') {
        dbType = 'audio';
      } else if (typeFromMeta === 'sketch') {
        dbType = 'sketch';
      } else if (typeFromMeta === 'document') {
        dbType = 'document';
      }
      // If it's a MIME type, derive the category
      else if (typeFromMeta.startsWith('image/')) {
        dbType = 'image';
      } else if (typeFromMeta.startsWith('video/')) {
        dbType = 'video';
      } else if (typeFromMeta.startsWith('audio/')) {
        dbType = 'audio';
      } else if (typeFromMeta.startsWith('application/pdf') || typeFromMeta.startsWith('application/vnd')) {
        dbType = 'document';
      }
    } else {
      // Fallback to detecting from file.type (MIME type)
      if (file.type.startsWith('image/')) {
        dbType = 'image';
      } else if (file.type.startsWith('video/')) {
        dbType = 'video';
      } else if (file.type.startsWith('audio/')) {
        dbType = 'audio';
      } else if (file.type.startsWith('application/pdf') || file.type.startsWith('application/vnd')) {
        dbType = 'document';
      }
    }

    // 4. FILE SIZE VALIDATION
    let maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT;

    // ✅ Use originalMimeType for validation
    if (originalMimeType.startsWith('image/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.IMAGE;
    } else if (originalMimeType.startsWith('video/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.VIDEO;
    } else if (originalMimeType.startsWith('audio/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.AUDIO;
    } else if (originalMimeType.startsWith('application/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DOCUMENT;
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Maximum file size is ${maxSize / (1024 * 1024)}MB`,
          maxSize,
        },
        { status: 413 }
      );
    }

    // 5. MIME TYPE VALIDATION
    const allowedMimeTypes = getAllAllowedMimeTypes();

    // DEBUG LOGGING
    console.log('[Upload] File received:', {
      name: file.name,
      originalMimeType, // ✅ Original MIME from Uppy meta
      originalMimeTypeFromMeta, // Raw value from FormData
      fileType: file.type,  // May be modified by Uppy
      size: file.size,
      formDataType: typeFromMeta,
      dbType,
    });
    console.log('[Upload] Allowed MIME types:', allowedMimeTypes.slice(0, 10), '... (showing first 10)');
    console.log('[Upload] MIME type check:', {
      fileType: originalMimeType, // ✅ Validate original MIME type
      isAllowed: allowedMimeTypes.includes(originalMimeType),
    });

    // ✅ Validate original MIME type, not the potentially modified file.type
    if (!allowedMimeTypes.includes(originalMimeType)) {
      console.error('[Upload] MIME TYPE REJECTED:', {
        fileName: file.name,
        fileType: originalMimeType,
        allowedTypes: allowedMimeTypes,
      });
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `File type ${originalMimeType} is not allowed`,
          allowedTypes: allowedMimeTypes,
        },
        { status: 415 }
      );
    }

    // 6. DANGEROUS FILE CHECK (Executable Detection)
    const isDangerous = await isDangerousFile(file);
    if (isDangerous) {
      console.error(`[Upload] DANGEROUS FILE BLOCKED: ${file.name} (${file.type}) from user ${user.id}`);
      return NextResponse.json(
        {
          error: 'Dangerous file detected',
          message: 'This file type is not allowed for security reasons',
        },
        { status: 400 }
      );
    }

    // 7. MAGIC BYTES VERIFICATION (Anti-Spoofing)
    // ✅ Verify using original MIME type
    const verification = await verifyMimeType(file, originalMimeType);

    if (!verification.valid) {
      console.error(`[Upload] MIME TYPE MISMATCH: ${file.name}`, {
        claimed: originalMimeType,
        detected: verification.detectedType,
        reason: verification.reason,
      });

      return NextResponse.json(
        {
          error: 'File type verification failed',
          message: verification.reason || 'The file type does not match its content',
          claimed: originalMimeType,
          detected: verification.detectedType,
        },
        { status: 400 }
      );
    }

    console.log(`[Upload] Security checks passed for: ${file.name} (${originalMimeType})`);

    // 8. PREPARE FILE BUFFER
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 9. GENERATE UNIQUE FILENAME
    const extension = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const filename = `${timestamp}-${randomString}.${extension}`;
    // ✅ TWO-PATH SYSTEM: Upload to pending location
    // Files will be copied to experiences/ on publish
    const key = `uploads-pending/users/${user.id}/${filename}`;

    // 10. UPLOAD TO R2
    const uploadResult = await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
      metadata: {
        userId: user.id,
        experienceId: experienceId || '',
        mediaType: dbType,
        originalFilename: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('[R2] Upload success:', `${key} (${file.size} bytes)`);

    const publicUrl = getPublicUrl(uploadResult.key);

    console.log('[Upload] ✅ Public URL generated:', publicUrl);

    // 12. IMAGE METADATA (OPTIONAL)
    let width: number | undefined;
    let height: number | undefined;

    // ✅ Use originalMimeType to detect images
    if (originalMimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (err) {
        console.warn(`[Upload] Failed to extract image metadata for ${file.name}:`, err);
      }
    }

    // ✅ FIX: Return normalized dbType instead of MIME type
    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadResult.key,
      type: dbType, // ✅ Return DB-compatible enum value, not MIME type
      fileName: file.name,
      size: file.size,
      metadata: {
        width,
        height,
        // duration will be provided client-side
      },
    });
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
