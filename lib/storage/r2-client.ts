/**
 * Cloudflare R2 Storage Client
 * S3-compatible object storage with zero egress fees
 *
 * Features:
 * - Upload files to R2 bucket
 * - Generate public URLs
 * - Delete files from R2
 * - Presigned URLs for temporary access
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// =============================================================================
// R2 CLIENT CONFIGURATION
// =============================================================================

function getR2Config() {
  if (!process.env.R2_ACCOUNT_ID) {
    throw new Error('R2_ACCOUNT_ID is not set in environment variables');
  }

  if (!process.env.R2_ACCESS_KEY_ID) {
    throw new Error('R2_ACCESS_KEY_ID is not set in environment variables');
  }

  if (!process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2_SECRET_ACCESS_KEY is not set in environment variables');
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'xpshare-media',
    publicUrl: process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`,
  };
}

let _r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!_r2Client) {
    const config = getR2Config();
    _r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _r2Client;
}

// Client is lazily initialized when needed

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

export interface UploadToR2Options {
  /** File path in bucket (e.g., "users/123/avatar.jpg") */
  key: string;
  /** File content as Buffer or Blob */
  body: Buffer | Blob;
  /** MIME type (e.g., "image/jpeg") */
  contentType: string;
  /** Optional metadata */
  metadata?: Record<string, string>;
}

export interface UploadToR2Result {
  /** Public URL of uploaded file */
  url: string;
  /** File path in bucket */
  key: string;
  /** Bucket name */
  bucket: string;
  /** File size in bytes */
  size: number;
}

/**
 * Upload a file to Cloudflare R2
 *
 * @example
 * const result = await uploadToR2({
 *   key: 'users/123/avatar.jpg',
 *   body: buffer,
 *   contentType: 'image/jpeg',
 * });
 * console.log(result.url); // https://pub-xxx.r2.dev/users/123/avatar.jpg
 */
export async function uploadToR2(options: UploadToR2Options): Promise<UploadToR2Result> {
  const { key, body, contentType, metadata } = options;

  try {
    const config = getR2Config();
    const client = getR2Client();

    // Convert Blob to Buffer if needed
    const buffer = body instanceof Blob ? Buffer.from(await body.arrayBuffer()) : body;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await client.send(command);

    // Generate public URL
    const url = getPublicUrl(key);

    console.log(`[R2] Upload success: ${key} (${buffer.length} bytes)`);

    return {
      url,
      key,
      bucket: config.bucketName,
      size: buffer.length,
    };
  } catch (error: any) {
    console.error('[R2] Upload error:', error);
    throw new Error(`R2 upload failed: ${error.message}`);
  }
}

// =============================================================================
// URL FUNCTIONS
// =============================================================================

/**
 * Get public URL for an R2 object
 *
 * @example
 * const url = getPublicUrl('users/123/avatar.jpg');
 * // https://pub-xxx.r2.dev/users/123/avatar.jpg
 */
export function getPublicUrl(key: string): string {
  const config = getR2Config();
  // Remove leading slash if present
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;

  // URL-encode the key path parts individually (preserve slashes)
  const encodedKey = cleanKey
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');

  return `${config.publicUrl}/${encodedKey}`;
}

/**
 * Generate a presigned URL for temporary access (e.g., for private files)
 *
 * @param key - File path in bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 *
 * @example
 * const signedUrl = await getPresignedUrl('private/document.pdf', 3600);
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const config = getR2Config();
  const client = getR2Client();

  const command = new HeadObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(client, command, { expiresIn });
    return signedUrl;
  } catch (error: any) {
    console.error('[R2] Presigned URL error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

// =============================================================================
// COPY FUNCTIONS
// =============================================================================

/**
 * Copy a file from one location to another in R2
 * Useful for moving temp uploads to permanent locations
 *
 * @param fromKey - Source file path
 * @param toKey - Destination file path
 *
 * @example
 * await copyInR2('uploads-pending/users/123/temp.jpg', 'experiences/users/123/final.jpg');
 */
export async function copyInR2(fromKey: string, toKey: string): Promise<void> {
  try {
    const config = getR2Config();
    const client = getR2Client();

    const command = new CopyObjectCommand({
      Bucket: config.bucketName,
      CopySource: `${config.bucketName}/${fromKey}`,
      Key: toKey,
    });

    await client.send(command);
    console.log(`[R2] Copy success: ${fromKey} → ${toKey}`);
  } catch (error: any) {
    console.error('[R2] Copy error:', error);
    throw new Error(`R2 copy failed: ${error.message}`);
  }
}

// =============================================================================
// DELETE FUNCTIONS
// =============================================================================

/**
 * Delete a file from R2
 *
 * @example
 * await deleteFromR2('users/123/old-avatar.jpg');
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const config = getR2Config();
    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await client.send(command);
    console.log(`[R2] Delete success: ${key}`);
  } catch (error: any) {
    console.error('[R2] Delete error:', error);
    throw new Error(`R2 delete failed: ${error.message}`);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique file path for uploads
 *
 * @param userId - User ID
 * @param fileName - Original filename
 * @param prefix - Optional prefix (e.g., "avatars", "experiences")
 *
 * @example
 * const key = generateFileKey('user-123', 'photo.jpg', 'experiences');
 * // "experiences/user-123/1704067200000-abc123.jpg"
 */
export function generateFileKey(userId: string, fileName: string, prefix?: string): string {
  // Sanitize filename: remove dangerous chars, replace spaces, make URL-safe
  const sanitizedName = fileName
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-_.]/g, '') // Remove any non-alphanumeric except dash, underscore, dot
    .substring(0, 255);

  // Extract extension (ensure it's lowercase and URL-safe)
  const ext = (sanitizedName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Generate unique timestamp + random string (already URL-safe)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const uniqueName = `${timestamp}-${random}.${ext}`;

  // Build path (userId is already URL-safe as it comes from Supabase)
  const parts = [prefix, `users/${userId}`, uniqueName].filter(Boolean);
  return parts.join('/');
}

/**
 * Extract key from public R2 URL
 *
 * @example
 * const key = extractKeyFromUrl('https://pub-xxx.r2.dev/users/123/avatar.jpg');
 * // "users/123/avatar.jpg"
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.slice(1);
  } catch {
    return null;
  }
}
