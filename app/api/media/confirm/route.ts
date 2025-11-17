import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getPublicUrl } from '@/lib/storage/r2-client';
import sharp from 'sharp';

/**
 * Confirm successful upload to R2 and return file metadata
 *
 * After the client uploads directly to R2 using a presigned URL,
 * this endpoint verifies the upload and extracts metadata.
 *
 * Flow:
 * 1. Client uploads file to R2 using presigned URL
 * 2. Client calls this endpoint with the file key
 * 3. API verifies file exists in R2
 * 4. API extracts metadata (dimensions for images, etc.)
 * 5. API returns public URL + metadata
 */
export async function POST(request: NextRequest) {
  try {
    // 1. AUTH CHECK
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const { key, fileName, mimeType, type } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required field: key' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 3. VERIFY KEY BELONGS TO USER (security check)
    if (!key.includes(`users/${user.id}/`)) {
      console.error('[Upload Confirm] Security violation: Key does not belong to user', {
        userId: user.id,
        key,
      });
      return NextResponse.json(
        { error: 'Unauthorized: File does not belong to you' },
        { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[Upload Confirm] Verifying upload:', {
      userId: user.id,
      key,
      fileName,
      mimeType,
      type,
    });

    // 4. VERIFY FILE EXISTS IN R2
    const config = {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.R2_BUCKET_NAME || 'xpshare-media',
    };

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    let fileSize = 0;
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      });

      const headResult = await r2Client.send(headCommand);
      fileSize = headResult.ContentLength || 0;

      console.log('[Upload Confirm] File verified in R2:', {
        key,
        size: fileSize,
        contentType: headResult.ContentType,
      });
    } catch (error: any) {
      console.error('[Upload Confirm] File not found in R2:', error);
      return NextResponse.json(
        { error: 'File not found', message: 'Upload may have failed' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 5. GENERATE PUBLIC URL
    const publicUrl = getPublicUrl(key);

    // 6. EXTRACT IMAGE METADATA (if image)
    let width: number | undefined;
    let height: number | undefined;

    if (mimeType?.startsWith('image/')) {
      try {
        // Fetch image from R2 for metadata extraction
        const imageResponse = await fetch(publicUrl);
        if (imageResponse.ok) {
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          const metadata = await sharp(imageBuffer).metadata();
          width = metadata.width;
          height = metadata.height;
          console.log('[Upload Confirm] Image metadata extracted:', { width, height });
        }
      } catch (error) {
        console.warn('[Upload Confirm] Failed to extract image metadata:', error);
        // Non-critical, continue without metadata
      }
    }

    // 7. DETERMINE DB TYPE
    let dbType: 'image' | 'video' | 'audio' | 'sketch' | 'document' = 'image';

    if (type) {
      // Map frontend types to DB types
      if (type === 'photo' || type === 'image') {
        dbType = 'image';
      } else if (type === 'video') {
        dbType = 'video';
      } else if (type === 'audio') {
        dbType = 'audio';
      } else if (type === 'sketch') {
        dbType = 'sketch';
      } else if (type === 'document') {
        dbType = 'document';
      }
    } else if (mimeType) {
      // Fallback: derive from MIME type
      if (mimeType.startsWith('image/')) {
        dbType = 'image';
      } else if (mimeType.startsWith('video/')) {
        dbType = 'video';
      } else if (mimeType.startsWith('audio/')) {
        dbType = 'audio';
      } else if (mimeType.startsWith('application/pdf') || mimeType.startsWith('application/vnd')) {
        dbType = 'document';
      }
    }

    // 8. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        path: key,
        type: dbType,
        fileName: fileName || key.split('/').pop() || 'unknown',
        size: fileSize,
        metadata: {
          width,
          height,
          // duration will be provided client-side for video/audio
        },
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    console.error('[Upload Confirm] Error:', error);
    return NextResponse.json(
      { error: 'Upload confirmation failed', message: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 30; // Metadata extraction can take a bit longer
