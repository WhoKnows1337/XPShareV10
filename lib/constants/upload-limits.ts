/**
 * Centralized upload limits for XPShare media uploads
 * These constants should be used across all upload-related code
 */

export const UPLOAD_LIMITS = {
  // File sizes in bytes
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 500 * 1024 * 1024, // 500MB
    AUDIO: 50 * 1024 * 1024, // 50MB
    DOCUMENT: 20 * 1024 * 1024, // 20MB for PDFs and Office docs
    DEFAULT: 500 * 1024 * 1024, // 500MB for all media types
  },

  // Max number of files
  MAX_FILES: 10,

  // Allowed MIME types
  ALLOWED_TYPES: {
    IMAGES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    VIDEOS: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ],
    AUDIO: [
      'audio/mpeg',
      'audio/wav',
      'audio/x-m4a',
      'audio/ogg',
      'audio/webm',
    ],
    DOCUMENTS: [
      'application/pdf',
    ],
    SPREADSHEETS: [
      'application/vnd.ms-excel', // .xls (old Excel)
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx (new Excel)
    ],
  },

  // File extensions for react-dropzone
  ALLOWED_EXTENSIONS: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
    'video/x-msvideo': ['.avi'],
    'video/webm': ['.webm'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-m4a': ['.m4a'],
    'audio/ogg': ['.ogg'],
    'audio/webm': ['.webm'],
    'application/pdf': ['.pdf'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
} as const;

// Helper to get all allowed MIME types as flat array
export const getAllAllowedMimeTypes = () => [
  ...UPLOAD_LIMITS.ALLOWED_TYPES.IMAGES,
  ...UPLOAD_LIMITS.ALLOWED_TYPES.VIDEOS,
  ...UPLOAD_LIMITS.ALLOWED_TYPES.AUDIO,
  ...UPLOAD_LIMITS.ALLOWED_TYPES.DOCUMENTS,
  ...UPLOAD_LIMITS.ALLOWED_TYPES.SPREADSHEETS,
];
