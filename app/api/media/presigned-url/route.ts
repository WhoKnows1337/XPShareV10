import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPresignedUploadUrl, generateFileKey } from '@/lib/storage/r2-client';
import { UPLOAD_LIMITS, getAllAllowedMimeTypes } from '@/lib/constants/upload-limits';
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/utils/rate-limiter';

/**
 * Generate presigned URL for direct upload to R2
 *
 * This endpoint allows clients to upload files directly to R2 without
 * going through the Vercel API, avoiding timeout issues with large files.
 *
 * Flow:
 * 1. Client requests presigned URL with file metadata
 * 2. API validates auth, file type, size
 * 3. API generates presigned URL (valid for 15 minutes)
 * 4. Client uploads directly to R2 using presigned URL
 * 5. Client confirms upload via /api/media/confirm endpoint
 */
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

    // 3. PARSE REQUEST BODY
    const body = await request.json();
    const {
      fileName,
      fileSize,
      mimeType,
      type, // 'photo' | 'video' | 'audio' | 'sketch' | 'document'
    } = body;

    if (!fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileSize, mimeType' },
        { status: 400 }
      );
    }

    // 4. VALIDATE MIME TYPE
    const allowedMimeTypes = getAllAllowedMimeTypes();

    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `File type ${mimeType} is not allowed`,
          allowedTypes: allowedMimeTypes,
        },
        { status: 415 }
      );
    }

    // 5. VALIDATE FILE SIZE
    let maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT;

    if (mimeType.startsWith('image/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.AUDIO;
    } else if (mimeType.startsWith('application/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DOCUMENT;
    }

    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Maximum file size is ${maxSize / (1024 * 1024)}MB`,
          maxSize,
        },
        { status: 413 }
      );
    }

    // 6. GENERATE UNIQUE KEY
    const key = generateFileKey(user.id, fileName, 'uploads-pending');

    console.log('[Presigned URL] Generating for:', {
      userId: user.id,
      fileName,
      fileSize,
      mimeType,
      type,
      key,
    });

    // 7. GENERATE PRESIGNED UPLOAD URL
    const uploadUrl = await getPresignedUploadUrl(
      key,
      mimeType,
      maxSize,
      900 // 15 minutes
    );

    // 8. RETURN PRESIGNED URL + METADATA
    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      expiresIn: 900, // 15 minutes
      metadata: {
        fileName,
        fileSize,
        mimeType,
        type,
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error('[Presigned URL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', message: error.message },
      { status: 500 }
    );
  }
}

// Runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 10; // Quick endpoint, just generates URL
