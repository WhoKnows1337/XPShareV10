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
      allowedFileTypes: getAllAllowedMimeTypes(),
    },
    autoProceed: true, // Auto-upload when files are added
    allowDuplicateUploads: false, // Prevent duplicates (will show confirmation dialog)
    debug: true, // Enable debug mode to see all events in console
  });

  // ============================================================
  // Upload Method: Standard XHR Upload
  // ============================================================
  uppy.use(XHRUpload, {
    endpoint: '/api/submit/upload',
    formData: true,
    fieldName: 'file',
    allowedMetaFields: ['type'], // Send media type (photo/video/audio/sketch)
    limit: 3, // Max 3 concurrent uploads
  });

  // ============================================================
  // PLUGIN 1: Compressor - Compress images before upload
  // ============================================================
  uppy.use(Compressor, {
    quality: 0.8, // 80% quality (good balance)
    maxWidth: 2000,
    maxHeight: 2000,
    convertSize: 5000000, // Convert to JPEG if > 5MB
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

    // Determine media type
    let type = 'photo';
    if (mimeType.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(fileName)) {
      type = 'video';
    } else if (mimeType.startsWith('audio/') || /\.(mp3|wav|m4a|ogg)$/i.test(fileName)) {
      type = 'audio';
    } else if (fileName.includes('sketch')) {
      type = 'sketch';
    }

    // Set type metadata for backend
    uppy.setFileMeta(file.id, { type });

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

    const uploadedFiles = result.successful.map((file) => {
      const responseData = file.response?.body;
      const fileMeta = file.meta;

      return {
        url: responseData?.url || '',
        duration: fileMeta?.duration as number | undefined,
        width: responseData?.metadata?.width,
        height: responseData?.metadata?.height,
      };
    });

    onComplete(uploadedFiles);
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================
  uppy.on('upload-error', (file, error) => {
    console.error(`Upload error for ${file?.name}:`, error);
    if (onError) {
      onError(new Error(`Upload failed for ${file?.name}: ${error.message}`));
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
