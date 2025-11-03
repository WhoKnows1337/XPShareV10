/**
 * Client-Side Media Metadata Extraction Utilities
 * Extracts duration, width, height from video/audio files using HTML5 APIs
 */

export interface MediaMetadata {
  duration?: number; // in seconds
  width?: number;
  height?: number;
}

/**
 * Extract metadata from a video file
 * Uses HTML5 video element to load and extract metadata
 */
export async function extractVideoMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Clean up object URL
      URL.revokeObjectURL(video.src);

      resolve({
        duration: Math.round(video.duration),
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    // Create object URL and load
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from an audio file
 * Uses HTML5 audio element to load and extract duration
 */
export async function extractAudioMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      // Clean up object URL
      URL.revokeObjectURL(audio.src);

      resolve({
        duration: Math.round(audio.duration),
      });
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('Failed to load audio metadata'));
    };

    // Create object URL and load
    audio.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from any media file (video or audio)
 * Automatically detects file type and uses appropriate extraction method
 */
export async function extractMediaMetadata(file: File): Promise<MediaMetadata> {
  const mimeType = file.type.toLowerCase();

  try {
    if (mimeType.startsWith('video/')) {
      return await extractVideoMetadata(file);
    } else if (mimeType.startsWith('audio/')) {
      return await extractAudioMetadata(file);
    } else if (mimeType.startsWith('image/')) {
      // Images don't have duration, and width/height is extracted server-side
      return {};
    } else {
      // Unknown type
      return {};
    }
  } catch (error) {
    console.error('Media metadata extraction failed:', error);
    // Return empty metadata on error - non-critical
    return {};
  }
}

/**
 * Format duration in seconds to human-readable string
 * Examples: "1:23", "12:34", "1:23:45"
 */
export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
