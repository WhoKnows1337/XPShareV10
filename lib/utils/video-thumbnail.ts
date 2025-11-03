/**
 * Extract thumbnail from video file
 * @param videoFile - Video File object
 * @param timeInSeconds - Time position to extract frame (default: 1s)
 * @returns Base64 data URL of extracted frame
 */
export async function extractVideoThumbnail(
  videoFile: File,
  timeInSeconds: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    // Create object URL for video
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;

    video.onloadedmetadata = () => {
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Ensure we don't seek past video duration
      const seekTime = Math.min(timeInSeconds, video.duration - 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob/data URL
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Cleanup
      URL.revokeObjectURL(videoUrl);
      video.remove();
      canvas.remove();

      resolve(thumbnailDataUrl);
    };

    video.onerror = (error) => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
      canvas.remove();
      reject(new Error(`Failed to load video: ${error}`));
    };
  });
}
