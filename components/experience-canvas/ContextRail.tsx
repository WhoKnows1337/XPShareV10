'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Clock, Tag, User, Activity, Sun, Moon, CloudRain } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';

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

  // New: Activity Timeline
  authorTimeline?: Array<{
    created_at: string;
    date_occurred?: string;
  }>;

  // New: Environmental Data
  environmentalData?: {
    solar?: {
      activity: string;
      flares?: number;
    };
    lunar?: {
      phase: string;
      illumination?: number;
    };
    weather?: {
      condition: string;
      temp?: number;
    };
  };
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
  authorTimeline,
  environmentalData,
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

      {/* Quick Links Card */}
      <Card className="glass-card">
        <CardContent className="pt-4 space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">Quick Actions</h4>
          
          <div className="space-y-1.5">
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                asChild
              >
                <Link href={`/experiences/${currentUserId}/edit`}>
                  Edit Post
                </Link>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              Report
            </Button>
            
            {!isAuthor && currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
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

      {/* Activity Timeline */}
      {authorTimeline && authorTimeline.length > 0 && (
        <Card className="glass-card border-blue-500/20">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Activity Timeline</span>
            </div>

            {/* Mini Activity Chart */}
            <div className="h-16 w-full">
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Generate path from timeline data */}
                <path
                  d={generateTimelinePath(authorTimeline)}
                  fill="url(#activityGradient)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="0.5"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{authorTimeline.length} experiences</span>
              <span>Last {Math.floor((Date.now() - new Date(authorTimeline[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}d</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Context */}
      {environmentalData && (
        <Card className="glass-card border-orange-500/20">
          <CardContent className="pt-4 space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Environmental Context</h4>

            {/* Solar Activity */}
            {environmentalData.solar && (
              <div className="flex items-center gap-2 text-sm">
                <Sun className="w-4 h-4 text-orange-400" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Solar Activity</p>
                  <p className="font-medium text-xs capitalize">{environmentalData.solar.activity}</p>
                </div>
                {environmentalData.solar.flares !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {environmentalData.solar.flares} flares
                  </Badge>
                )}
              </div>
            )}

            {/* Lunar Phase */}
            {environmentalData.lunar && (
              <div className="flex items-center gap-2 text-sm">
                <Moon className="w-4 h-4 text-blue-300" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Moon Phase</p>
                  <p className="font-medium text-xs capitalize">{environmentalData.lunar.phase}</p>
                </div>
                {environmentalData.lunar.illumination !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(environmentalData.lunar.illumination)}%
                  </Badge>
                )}
              </div>
            )}

            {/* Weather */}
            {environmentalData.weather && (
              <div className="flex items-center gap-2 text-sm">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Weather</p>
                  <p className="font-medium text-xs capitalize">{environmentalData.weather.condition}</p>
                </div>
                {environmentalData.weather.temp !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(environmentalData.weather.temp)}°
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to generate SVG path from timeline data
function generateTimelinePath(timeline: Array<{ created_at: string; date_occurred?: string }>): string {
  if (timeline.length === 0) return '';
  if (timeline.length === 1) return 'M0,20 L100,20 L100,40 L0,40 Z';

  // Sort by date (most recent first)
  const sorted = [...timeline].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Take last 10 for chart
  const data = sorted.slice(0, 10).reverse();

  // Create monthly buckets
  const buckets = new Map<string, number>();
  data.forEach(item => {
    const month = format(new Date(item.created_at), 'yyyy-MM');
    buckets.set(month, (buckets.get(month) || 0) + 1);
  });

  const points = Array.from(buckets.entries()).map(([month, count], index, arr) => {
    const x = (index / (arr.length - 1 || 1)) * 100;
    const maxCount = Math.max(...Array.from(buckets.values()));
    const y = 40 - ((count / maxCount) * 30);
    return { x, y };
  });

  if (points.length === 0) return '';

  // Build SVG path
  let path = `M0,40 L${points[0].x},40 L${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L${points[i].x},${points[i].y}`;
  }

  path += ` L${points[points.length - 1].x},40 L100,40 Z`;

  return path;
}
