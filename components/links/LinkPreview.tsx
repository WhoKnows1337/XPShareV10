'use client';

import { ExternalLink, X, Music, Video, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import type { LinkMetadata, Platform } from '@/lib/types/link-preview';

export interface LinkPreviewProps {
  link: LinkMetadata;
  onRemove?: () => void;
  isRemovable?: boolean;
}

// Platform-specific colors and icons
const PLATFORM_CONFIG: Record<
  Platform,
  { color: string; bg: string; icon: React.ReactNode; label: string }
> = {
  youtube: {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: <Video className="w-3 h-3" />,
    label: 'YouTube',
  },
  vimeo: {
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    icon: <Video className="w-3 h-3" />,
    label: 'Vimeo',
  },
  twitter: {
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/30',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'Twitter/X',
  },
  spotify: {
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/30',
    icon: <Music className="w-3 h-3" />,
    label: 'Spotify',
  },
  soundcloud: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/30',
    icon: <Music className="w-3 h-3" />,
    label: 'SoundCloud',
  },
  tiktok: {
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/30',
    icon: <Video className="w-3 h-3" />,
    label: 'TikTok',
  },
  instagram: {
    color: 'text-pink-500',
    bg: 'bg-pink-500/10 border-pink-500/30',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    label: 'Instagram',
  },
  facebook: {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: 'Facebook',
  },
  maps: {
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    icon: <MapPin className="w-3 h-3" />,
    label: 'Google Maps',
  },
  website: {
    color: 'text-observatory-gold',
    bg: 'bg-observatory-gold/10 border-observatory-gold/30',
    icon: <Globe className="w-3 h-3" />,
    label: 'Website',
  },
};

function formatDuration(seconds?: number): string | null {
  if (!seconds) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function LinkPreview({ link, onRemove, isRemovable = true }: LinkPreviewProps) {
  const config = PLATFORM_CONFIG[link.platform];

  return (
    <div
      className="group relative bg-black/40 border border-observatory-gold/30 rounded-lg overflow-hidden
        hover:border-observatory-gold/50 transition-all"
    >
      {/* Remove Button */}
      {isRemovable && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-md
            bg-black/60 hover:bg-red-500/20
            text-red-400 hover:text-red-300
            opacity-0 group-hover:opacity-100 sm:opacity-100
            transition-all"
          aria-label="Remove link"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        {link.thumbnail_url && (
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-observatory-gold/10">
              <Image
                src={link.thumbnail_url}
                alt={link.title || 'Link preview'}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized // External URLs
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Platform Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.bg} ${config.color}`}
            >
              {config.icon}
              <span>{config.label}</span>
            </span>

            {link.duration && (
              <span className="text-xs text-observatory-gold/60">
                {formatDuration(link.duration)}
              </span>
            )}
          </div>

          {/* Title */}
          {link.title && (
            <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
              {link.title}
            </h4>
          )}

          {/* Description */}
          {link.description && (
            <p className="text-xs text-observatory-gold/60 line-clamp-2 leading-snug">
              {link.description}
            </p>
          )}

          {/* Author */}
          {link.author_name && (
            <p className="text-xs text-observatory-gold/50">
              By {link.author_name}
            </p>
          )}

          {/* External Link Button */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-observatory-gold hover:text-observatory-gold/80 transition-colors"
          >
            <span>View original</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
