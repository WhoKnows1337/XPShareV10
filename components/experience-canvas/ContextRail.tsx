'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Clock, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ContextRailProps {
  // Author Info
  author: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    level?: number;
    total_xp?: number;
    total_experiences?: number;
    topBadges?: Array<{
      name: string;
      icon: string;
      rarity: string;
    }>;
  };

  // Experience Meta
  category: string;
  dateOccurred?: string;
  timeOfDay?: string;
  locationText?: string;
  tags?: string[];
  createdAt?: string;

  // Interactions
  isFollowing?: boolean;
  currentUserId?: string;
  isAuthor?: boolean;
}

export function ContextRail({
  author,
  category,
  dateOccurred,
  timeOfDay,
  locationText,
  tags = [],
  createdAt,
  isFollowing = false,
  currentUserId,
  isAuthor = false,
}: ContextRailProps) {
  return (
    <div className="space-y-4">
      {/* Author Card */}
      <Card className="glass-card">
        <CardContent className="pt-6 space-y-4">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Link href={`/profile/${author.username}`}>
              <Avatar className="w-20 h-20 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <AvatarImage src={author.avatar_url} alt={author.display_name || author.username} />
                <AvatarFallback>
                  {(author.display_name || author.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div>
              <Link href={`/profile/${author.username}`} className="hover:underline">
                <h3 className="font-semibold">{author.display_name || author.username}</h3>
              </Link>
              <p className="text-xs text-muted-foreground">@{author.username}</p>
            </div>

            {/* Level Badge */}
            {author.level !== undefined && (
              <Badge variant="secondary" className="text-xs">
                Level {author.level}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">{author.total_experiences || 0}</p>
              <p className="text-xs text-muted-foreground">Experiences</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{author.total_xp || 0}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>

          {/* Top Badges */}
          {author.topBadges && author.topBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Top Badges</p>
              <div className="flex gap-2 justify-center">
                {author.topBadges.slice(0, 3).map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-2xl"
                    title={badge.name}
                  >
                    {badge.icon}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Follow Button */}
          {!isAuthor && currentUserId && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              className="w-full"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Experience Meta Card */}
      <Card className="glass-card">
        <CardContent className="pt-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Details</h4>

          {/* Category */}
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="capitalize">
              {category}
            </Badge>
          </div>

          {/* Date Occurred */}
          {dateOccurred && (
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Occurred</p>
                <p className="font-medium">
                  {new Date(dateOccurred).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Time of Day */}
          {timeOfDay && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium capitalize">{timeOfDay}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {locationText && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{locationText}</p>
              </div>
            </div>
          )}

          {/* Created */}
          {createdAt && (
            <div className="flex items-start gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Shared</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {tags.length > 0 && (
        <Card className="glass-card">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Tag className="w-3 h-3" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
