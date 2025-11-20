'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp, ChevronRight, MessageCircle, Heart, Eye, Home } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface ExperienceHeaderBarProps {
  // Breadcrumbs
  category: string;
  categorySlug: string;

  // Pattern Alert
  hasActiveWave?: boolean;
  patternCount: number;
  patternStrength?: number;
  experienceId: string;

  // Quick Info
  author: {
    username: string;
    display_name?: string;
  };
  locationText?: string;
  createdAt: string;
  commentCount?: number;
  upvoteCount?: number;
  viewCount?: number;
}

export function ExperienceHeaderBar({
  category,
  categorySlug,
  hasActiveWave = false,
  patternCount,
  patternStrength = 0,
  experienceId,
  author,
  locationText,
  createdAt,
  commentCount = 0,
  upvoteCount = 0,
  viewCount = 0,
}: ExperienceHeaderBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto max-w-[1800px] px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Feed
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/feed?category=${categorySlug}`} className="hover:text-foreground transition-colors">
            {category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Post</span>
        </div>

        {/* Pattern Alert (wenn aktiv) */}
        {hasActiveWave && patternCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-3 border-t border-border/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
                  <TrendingUp className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-sm font-semibold text-red-400">HOT PATTERN</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{patternCount} similar</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-orange-400 font-medium">Active wave</span>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="outline" className="text-xs">
                    Trending
                  </Badge>
                </div>
              </div>
              <Link
                href={`#patterns`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View patterns
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Info */}
        <div className="py-3 border-t border-border/40">
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <span className="font-medium">@{author.username}</span>
            </Link>
            {locationText && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{locationText.split(',')[0]}</span>
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>

            {/* Stats */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span>{upvoteCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
