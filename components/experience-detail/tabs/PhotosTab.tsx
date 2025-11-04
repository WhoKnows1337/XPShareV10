'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { MediaLightbox } from '../MediaLightbox';

export interface Photo {
  id: string;
  url: string;
  type: string;
  caption?: string;
  isSketch: boolean;
}

interface PhotosTabProps {
  photos: Photo[];
}

/**
 * Photos Tab Component
 * Displays images and sketches in a grid layout with lightbox
 */
export function PhotosTab({ photos }: PhotosTabProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground space-y-2">
          <Palette className="h-12 w-12 mx-auto opacity-20" />
          <p className="text-sm">No photos or sketches attached</p>
        </div>
      </div>
    );
  }

  // Convert to lightbox format
  const lightboxMedia = photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    type: 'image' as const,
    caption: photo.caption,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setLightboxIndex(index)}
          >
            {/* Image */}
            <Image
              src={photo.url}
              alt={photo.caption || (photo.isSketch ? 'Sketch' : 'Photo')}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Sketch Badge */}
            {photo.isSketch && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur-sm">
                  <Palette className="h-3 w-3" />
                  Sketch
                </Badge>
              </div>
            )}

            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
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
