import Uppy, { type UppyOptions } from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
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
    allowDuplicateUploads: false, // Prevent duplicates (will show confirmation dialog)
    debug: true, // Enable debug mode to see all events in console
  });

  // ============================================================
  // Upload Method: Standard XHR Upload
  // ============================================================
  uppy.use(XHRUpload, {
    endpoint: '/api/media/upload', // Correct R2 upload endpoint
    formData: true,
    fieldName: 'file',
    allowedMetaFields: ['type', 'originalMimeType'], // ✅ Send both normalized type AND original MIME
    limit: 3, // Max 3 concurrent uploads
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
  // ON COMPLETE: Aggregate results with metadata
  // ============================================================
  uppy.on('complete', (result) => {
    if (!onComplete) return;

    const uploadedFiles = result.successful
      .map((file) => {
        const responseBody = file.response?.body as any;
        const fileMeta = file.meta;

        // Server returns: { success, url, type, fileName, size, metadata: { width, height }, ... }
        // NO results array - direct extraction!
        return {
          url: responseBody?.url || '',
          type: responseBody?.type || 'image', // Extract type from server response (image/video/audio/sketch/document)
          fileName: responseBody?.fileName || file.name, // ✅ Extract original filename from server response
          size: responseBody?.size || 0, // ✅ Extract file size from server response
          mimeType: fileMeta?.originalMimeType as string | undefined, // ✅ Include original MIME type
          duration: fileMeta?.duration as number | undefined,
          width: responseBody?.metadata?.width || responseBody?.width,
          height: responseBody?.metadata?.height || responseBody?.height,
        };
      })
      .filter(file => file.url && file.url !== ''); // Only include files with valid URLs

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
