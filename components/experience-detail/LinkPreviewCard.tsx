'use client';

import { ExternalLink, Play, Music, Video, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface LinkPreviewCardProps {
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorUrl?: string;
  providerName?: string;
  providerUrl?: string;
  html?: string;
  width?: number;
  height?: number;
  duration?: number;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Video,
  vimeo: Video,
  spotify: Music,
  soundcloud: Music,
  twitter: Globe,
  tiktok: Play,
  instagram: Globe,
  facebook: Globe,
};

const platformColors: Record<string, string> = {
  youtube: 'bg-red-500',
  vimeo: 'bg-blue-500',
  spotify: 'bg-green-500',
  soundcloud: 'bg-orange-500',
  twitter: 'bg-sky-500',
  tiktok: 'bg-black',
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-600',
};

/**
 * Rich Link Preview Card Component
 * Displays external links with metadata, thumbnails, and platform branding
 */
export function LinkPreviewCard({
  url,
  platform,
  title,
  description,
  thumbnailUrl,
  authorName,
  providerName,
  duration,
}: LinkPreviewCardProps) {
  const PlatformIcon = platform ? platformIcons[platform.toLowerCase()] || ExternalLink : ExternalLink;
  const platformColor = platform ? platformColors[platform.toLowerCase()] || 'bg-gray-500' : 'bg-gray-500';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-border/50 hover:border-border transition-all duration-200 hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            {thumbnailUrl && (
              <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0">
                <Image
                  src={thumbnailUrl}
                  alt={title || 'Link preview'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(duration)}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 space-y-2">
              {/* Platform Badge */}
              {platform && (
                <Badge variant="secondary" className={`${platformColor} text-white gap-1`}>
                  <PlatformIcon className="h-3 w-3" />
                  {platform}
                </Badge>
              )}

              {/* Title */}
              {title && (
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
              )}

              {/* Description */}
              {description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                {authorName && <span className="font-medium">{authorName}</span>}
                {providerName && (
                  <>
                    {authorName && <span>•</span>}
                    <span>{providerName}</span>
                  </>
                )}
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.a>
  );
}
