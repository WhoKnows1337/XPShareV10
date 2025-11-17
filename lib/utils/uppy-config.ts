import Uppy, { type UppyOptions } from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import Compressor from '@uppy/compressor';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
import GoldenRetriever from '@uppy/golden-retriever';
import { extractMediaMetadata } from './media-metadata';
import { UPLOAD_LIMITS, getAllAllowedMimeTypes } from '../constants/upload-limits';

export interface UppyConfigOptions {
  onComplete?: (uploadedFiles: Array<{
    url: string;
    type: string; // 'image' | 'video' | 'audio' | 'sketch' | 'document'
    fileName: string; // Original filename
    size: number; // File size in bytes
    mimeType?: string; // Original MIME type (e.g., 'application/pdf', 'image/png')
    duration?: number;
    width?: number;
    height?: number;
  }>) => void;
  onError?: (error: Error) => void;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
}

/**
 * Create configured Uppy instance for XPShare media uploads
 * Handles images, videos, audio, and sketches with metadata extraction
 */
export function createUppyInstance(options: UppyConfigOptions = {}) {
  const {
    onComplete,
    onError,
    maxFileSize = UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT,
    maxNumberOfFiles = UPLOAD_LIMITS.MAX_FILES,
  } = options;

  const uppy = new Uppy({
    restrictions: {
      maxFileSize,
      maxNumberOfFiles,
      // Use BOTH MIME types AND file extensions for maximum compatibility
      allowedFileTypes: [
        ...getAllAllowedMimeTypes(),
        // Add file extensions as fallback (more reliable than MIME types)
        '.jpg', '.jpeg', '.png', '.webp', '.gif', // Images
        '.mp4', '.mov', '.avi', '.webm', // Videos
        '.mp3', '.wav', '.m4a', '.ogg', // Audio
        '.pdf', // Documents
        '.xls', '.xlsx', // Spreadsheets
      ],
    },
    autoProceed: true, // Auto-upload when files are added (with progress indicator)
    debug: true, // Enable debug mode to see all events in console
  });

  // ============================================================
  // Upload Method: Direct to R2 via Presigned URLs
  // ============================================================
  uppy.use(AwsS3, {
    async getUploadParameters(file) {
      // 1. Request presigned URL from API
      const response = await fetch('/api/media/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.meta.originalMimeType || file.type,
          type: file.meta.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const data = await response.json();

      console.log('[Uppy S3] Got presigned URL:', {
        fileName: file.name,
        key: data.key,
        expiresIn: data.expiresIn,
      });

      // Store key in file metadata for later confirmation
      uppy.setFileMeta(file.id, { uploadKey: data.key });

      // 2. Return upload parameters for S3/R2
      return {
        method: 'PUT' as const,
        url: data.uploadUrl,
        fields: {}, // R2 doesn't need form fields for presigned PUT
        headers: {
          'Content-Type': (file.meta.originalMimeType as string) || file.type || 'application/octet-stream',
        },
      };
    },

    // Limit concurrent uploads
    limit: 3,

    // Don't use multipart for R2 (simpler presigned URL approach)
    shouldUseMultipart: false,
  });

  // ============================================================
  // PLUGIN 1: Compressor - Compress images before upload
  // IMPORTANT: Only compress actual images, skip PDFs and other documents
  // ============================================================
  uppy.use(Compressor, {
    quality: 0.8, // 80% quality (good balance)
    maxWidth: 2000,
    maxHeight: 2000,
    convertSize: 5000000, // Convert to JPEG if > 5MB
    // Only compress image MIME types, skip everything else
    mimeType: 'image/jpeg,image/png,image/webp,image/gif',
  });

  // ============================================================
  // PLUGIN 2: Golden Retriever - Restore uploads after page refresh
  // ============================================================
  uppy.use(GoldenRetriever, {
    expires: 24 * 60 * 60 * 1000, // 24 hours
    serviceWorker: false, // Don't use service worker (simpler)
  });

  // ============================================================
  // PLUGIN 3: Thumbnail Generator - Generate image previews
  // ============================================================
  uppy.use(ThumbnailGenerator, {
    thumbnailWidth: 200, // Max width for thumbnails
    thumbnailHeight: 200, // Max height for thumbnails
    waitForThumbnailsBeforeUpload: false, // Don't delay upload
  });

  // ============================================================
  // BEFORE UPLOAD: Extract metadata and set type
  // ============================================================
  uppy.on('file-added', async (file) => {
    const mimeType = file.type || '';
    const fileName = file.name || '';

    // ✅ SAVE ORIGINAL MIME TYPE - This is critical because Uppy may modify file.type
    const originalMimeType = mimeType;

    // Determine media type
    let type = 'photo';
    if (mimeType.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(fileName)) {
      type = 'video';
    } else if (mimeType.startsWith('audio/') || /\.(mp3|wav|m4a|ogg)$/i.test(fileName)) {
      type = 'audio';
    } else if (mimeType === 'application/pdf' || /\.pdf$/i.test(fileName)) {
      type = 'document'; // PDF files
    } else if (fileName.includes('sketch')) {
      type = 'sketch';
    }

    // Set type metadata for backend (both normalized type AND original MIME)
    uppy.setFileMeta(file.id, { type, originalMimeType });

    // Extract duration for video/audio (client-side)
    if (type === 'video' || type === 'audio') {
      try {
        const metadata = await extractMediaMetadata(file.data as File);
        if (metadata.duration) {
          uppy.setFileMeta(file.id, { duration: metadata.duration });
        }
      } catch (err) {
        console.warn(`Failed to extract duration for ${fileName}:`, err);
        // Continue without duration - non-critical
      }
    }
  });

  // ============================================================
  // ON COMPLETE: Confirm uploads and get metadata
  // ============================================================
  uppy.on('complete', async (result) => {
    if (!onComplete) return;

    // For each successful upload, confirm with server to get metadata
    const confirmations = (result?.successful || []).map(async (file) => {
      const fileMeta = file.meta;
      const uploadKey = fileMeta.uploadKey as string;

      if (!uploadKey) {
        console.error('[Uppy] Upload key missing for file:', file.name);
        return null;
      }

      try {
        // Confirm upload with server
        const response = await fetch('/api/media/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: uploadKey,
            fileName: file.name,
            mimeType: fileMeta.originalMimeType || file.type,
            type: fileMeta.type,
          }),
        });

        if (!response.ok) {
          console.error('[Uppy] Upload confirmation failed for:', file.name);
          return null;
        }

        const data = await response.json();

        console.log('[Uppy] Upload confirmed:', {
          fileName: file.name,
          url: data.url,
          type: data.type,
        });

        // Return formatted file data
        return {
          url: data.url || '',
          type: data.type || 'image',
          fileName: data.fileName || file.name,
          size: data.size || file.size || 0,
          mimeType: fileMeta.originalMimeType as string | undefined,
          duration: fileMeta.duration as number | undefined,
          width: data.metadata?.width,
          height: data.metadata?.height,
        };
      } catch (error) {
        console.error('[Uppy] Error confirming upload:', error);
        return null;
      }
    });

    // Wait for all confirmations
    const uploadedFiles = (await Promise.all(confirmations))
      .filter((file) => file !== null); // Remove failed confirmations

    onComplete(uploadedFiles);
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  // Log all info events for debugging
  uppy.on('info-visible', () => {
    const info = uppy.getState().info;
    console.log('[Uppy Info]', info);
  });

  // Handle file restriction errors (size, type, count)
  uppy.on('restriction-failed', (file, error) => {
    console.error('[Uppy Restriction Failed]', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      errorMessage: error.message,
      error
    });

    if (onError) {
      // Generate user-friendly error message
      let message = `Datei "${file?.name}" konnte nicht hinzugefügt werden: `;

      if (error.message.includes('exceeds maximum allowed size')) {
        const fileType = file?.type || '';
        let limit = 'unbekannt';

        if (fileType.startsWith('image/')) {
          limit = '20 MB';
        } else if (fileType.startsWith('video/')) {
          limit = '1 GB';
        } else if (fileType.startsWith('audio/')) {
          limit = '200 MB';
        } else if (fileType === 'application/pdf') {
          limit = '200 MB';
        } else {
          limit = '500 MB';
        }

        message = `Datei zu groß! "${file?.name}" überschreitet das Limit von ${limit}.`;
      } else if (error.message.includes('file type')) {
        message = `Dateityp nicht erlaubt! "${file?.name}" kann nicht hochgeladen werden.`;
      } else if (error.message.includes('maximum number of files')) {
        message = `Maximale Anzahl an Dateien (10) erreicht!`;
      } else {
        message += error.message;
      }

      onError(new Error(message));
    }
  });

  // Handle upload errors (network, server, etc.)
  uppy.on('upload-error', (file, error) => {
    console.error(`Upload error for ${file?.name}:`, error);
    if (onError) {
      onError(new Error(`Upload fehlgeschlagen für "${file?.name}": ${error.message}`));
    }
  });

  return uppy;
}

/**
 * Helper to programmatically add sketch file to Uppy instance
 * Used after sketch modal saves a drawing
 */
export function addSketchToUppy(uppy: Uppy, sketchFile: File) {
  try {
    uppy.addFile({
      name: sketchFile.name,
      type: sketchFile.type,
      data: sketchFile,
      meta: {
        type: 'sketch',
      },
    });
  } catch (err) {
    console.error('Failed to add sketch to Uppy:', err);
    throw err;
  }
}
