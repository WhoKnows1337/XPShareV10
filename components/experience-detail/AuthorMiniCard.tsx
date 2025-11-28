'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Calendar, UserPlus, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthorMiniCardProps {
  user: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
    level?: number
    total_xp?: number
    total_experiences?: number
    topBadges?: Array<{
      slug: string
      name: string
      icon: string
      rarity: string
    }>
  }
  location?: string
  dateOccurred?: string
  isFollowing?: boolean
  currentUserId?: string
  onFollow?: () => void
  variant?: 'compact' | 'expanded'
  className?: string
}

const levelTitles: Record<number, string> = {
  1: 'Newcomer',
  2: 'Seeker',
  3: 'Explorer',
  5: 'Investigator',
  7: 'Researcher',
  10: 'Expert',
  15: 'Master',
  20: 'Legend',
  25: 'Sage',
  30: 'Illuminated',
}

function getLevelTitle(level: number): string {
  const keys = Object.keys(levelTitles).map(Number).sort((a, b) => b - a)
  for (const key of keys) {
    if (level >= key) return levelTitles[key]
  }
  return 'Newcomer'
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-amber-400'
    case 'epic':
      return 'text-purple-400'
    case 'rare':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
}

export function AuthorMiniCard({
  user,
  location,
  dateOccurred,
  isFollowing = false,
  currentUserId,
  onFollow,
  variant = 'compact',
  className,
}: AuthorMiniCardProps) {
  const initials = (user.display_name || user.username)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const isOwnProfile = currentUserId === user.id

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center justify-between p-3 rounded-xl bg-card/50 border border-white/10',
          className
        )}
      >
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                @{user.username}
              </span>
              {user.level && (
                <Badge variant="outline" className="text-xs py-0 px-1.5 bg-primary/10">
                  Lvl {user.level}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location.split(',')[0]}
                </span>
              )}
              {dateOccurred && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(dateOccurred)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Top Badges Preview */}
        {user.topBadges && user.topBadges.length > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {user.topBadges.slice(0, 3).map((badge) => (
              <span
                key={badge.slug}
                className={cn('text-lg', getRarityColor(badge.rarity))}
                title={badge.name}
              >
                {badge.icon || '⭐'}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // Expanded variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'p-5 rounded-2xl bg-card/50 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Link href={`/profile/${user.username}`} className="group">
          <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
            <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <Link
            href={`/profile/${user.username}`}
            className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
          >
            {user.display_name || user.username}
          </Link>
          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {/* Level & XP */}
          <div className="flex items-center gap-3 mt-2">
            {user.level && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">
                  Level {user.level}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getLevelTitle(user.level)}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {user.total_experiences !== undefined && (
              <span>{user.total_experiences} Erfahrungen</span>
            )}
            {user.total_xp !== undefined && (
              <span>{user.total_xp.toLocaleString()} XP</span>
            )}
          </div>

          {/* Top Badges */}
          {user.topBadges && user.topBadges.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {user.topBadges.map((badge) => (
                <Badge
                  key={badge.slug}
                  variant="outline"
                  className={cn(
                    'text-xs py-0.5',
                    getRarityColor(badge.rarity),
                    'border-current/30 bg-current/10'
                  )}
                >
                  {badge.icon || '⭐'} {badge.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Follow Button */}
        {!isOwnProfile && onFollow && (
          <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={onFollow}
            className="shrink-0"
          >
            {isFollowing ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Folge ich
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Folgen
              </>
            )}
          </Button>
        )}
      </div>

      {/* Location & Date */}
      {(location || dateOccurred) && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-green-400" />
              {location}
            </span>
          )}
          {dateOccurred && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-400" />
              {formatDate(dateOccurred)}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
