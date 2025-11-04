'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MediaLightbox } from '../MediaLightbox';

export interface VideoItem {
  id: string;
  url: string;
  type: string;
  caption?: string;
  duration?: number;
}

interface VideosTabProps {
  videos: VideoItem[];
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Videos Tab Component
 * Displays video files in a grid with playback
 */
export function VideosTab({ videos }: VideosTabProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground space-y-2">
          <Video className="h-12 w-12 mx-auto opacity-20" />
          <p className="text-sm">No videos attached</p>
        </div>
      </div>
    );
  }

  // Convert to lightbox format
  const lightboxMedia = videos.map((video) => ({
    id: video.id,
    url: video.url,
    type: 'video' as const,
    caption: video.caption,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative aspect-video group cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => setLightboxIndex(index)}
          >
            {/* Video Element (poster) */}
            <video
              src={video.url}
              className="w-full h-full object-cover"
              preload="metadata"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm">
                  {formatDuration(video.duration)}
                </Badge>
              </div>
            )}

            {/* Caption */}
            {video.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs line-clamp-2">{video.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox for video playback */}
      {lightboxIndex !== null && (
        <MediaLightbox
          media={lightboxMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
