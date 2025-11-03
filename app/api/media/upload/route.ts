import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';
import { UPLOAD_LIMITS, getAllAllowedMimeTypes } from '@/lib/constants/upload-limits';
import { verifyMimeType, isDangerousFile } from '@/lib/utils/magic-bytes';
import { checkRateLimit, getClientIP, rateLimitError, RATE_LIMIT_CONFIGS } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMITING
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.FILE_UPLOAD);

    if (!rateLimitResult.allowed) {
      console.warn(`[Upload] Rate limit exceeded for IP: ${clientIP}`);
      return rateLimitError(rateLimitResult.resetAt, rateLimitResult.retryAfter!);
    }

    // 2. AUTHENTICATION
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await (supabase as any).auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. PARSE FORM DATA
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'photo' | 'video' | 'audio' | 'sketch'
    const experienceId = formData.get('experienceId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'Media type is required' }, { status: 400 });
    }

    // 4. FILE SIZE VALIDATION
    let maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT;

    if (file.type.startsWith('image/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.IMAGE;
    } else if (file.type.startsWith('video/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.VIDEO;
    } else if (file.type.startsWith('audio/')) {
      maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE.AUDIO;
    } else if (file.type.startsWith('application/')) {
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

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `File type ${file.type} is not allowed`,
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
          message: 'This file contains executable code and cannot be uploaded for security reasons',
        },
        { status: 403 }
      );
    }

    // 7. MAGIC BYTES VERIFICATION (Anti-Spoofing)
    const verification = await verifyMimeType(file, file.type);

    if (!verification.valid) {
      console.error(`[Upload] MIME TYPE MISMATCH: ${file.name}`, {
        claimed: file.type,
        detected: verification.detectedType,
        reason: verification.reason,
      });

      return NextResponse.json(
        {
          error: 'File type verification failed',
          message: verification.reason || 'The file type does not match its content',
          claimed: file.type,
          detected: verification.detectedType,
        },
        { status: 400 }
      );
    }

    console.log(`[Upload] Security checks passed for: ${file.name} (${file.type})`);

    // 8. FILENAME SANITIZATION
    const sanitizedName = file.name
      .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous chars
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .substring(0, 255); // Limit length

    const timestamp = Date.now();
    const fileExt = sanitizedName.split('.').pop() || 'bin';
    const fileName = `${user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 9. DETERMINE STORAGE BUCKET
    const bucketMap = {
      photo: 'images',
      video: 'images', // Videos also go to images bucket
      audio: 'audio',
      sketch: 'images', // Sketches go to images bucket
    };

    const bucket = bucketMap[type as keyof typeof bucketMap] || 'images';

    // 10. PREPARE FILE BUFFER
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 11. UPLOAD TO SUPABASE STORAGE
    const { data, error } = await (supabase as any).storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: 'Upload failed', message: error.message },
        { status: 500 }
      );
    }

    // 12. GET PUBLIC URL
    const {
      data: { publicUrl },
    } = (supabase as any).storage.from(bucket).getPublicUrl(fileName);

    // 13. EXTRACT METADATA
    let width: number | null = null;
    let height: number | null = null;

    try {
      if (file.type.startsWith('image/')) {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      }
    } catch (metadataError) {
      console.error('Metadata extraction error:', metadataError);
      // Continue without metadata - non-critical
    }

    console.log(`[Upload] Success: ${fileName} uploaded to ${bucket}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      type,
      fileName: sanitizedName,
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
