'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Trophy, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authorCardVariants } from '../shared/animations'

interface Badge {
  slug: string
  name: string
  icon: string
  rarity: string
}

interface AuthorCardProps {
  user: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
    level?: number
    total_xp?: number
    topBadges?: Badge[]
  }
  createdAt: string
  isFollowing?: boolean
  currentUserId?: string
  onFollow?: () => void
  className?: string
  variant?: 'full' | 'compact' | 'minimal'
}

const levelTitles: Record<number, string> = {
  1: 'Newcomer',
  5: 'Explorer',
  10: 'Seeker',
  15: 'Observer',
  20: 'Investigator',
  25: 'Chronicler',
  30: 'Expert',
}

function getLevelTitle(level: number): string {
  const levels = Object.keys(levelTitles)
    .map(Number)
    .sort((a, b) => b - a)

  for (const l of levels) {
    if (level >= l) return levelTitles[l]
  }
  return 'Newcomer'
}

export function AuthorCard({
  user,
  createdAt,
  isFollowing = false,
  currentUserId,
  onFollow,
  className,
  variant = 'full',
}: AuthorCardProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const isOwnProfile = currentUserId === user.id
  const displayName = user.display_name || user.username
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: de,
  })

  const handleFollow = async () => {
    if (isLoading || isOwnProfile) return

    setIsLoading(true)
    setFollowing(!following)

    try {
      onFollow?.()
    } catch (error) {
      setFollowing(following) // Revert on error
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'minimal') {
    return (
      <Link
        href={`/profile/${user.username}`}
        className={cn('flex items-center gap-2 group', className)}
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-space-light">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium group-hover:text-primary transition-colors">
          @{user.username}
        </span>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        variants={authorCardVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          'bg-card/50 backdrop-blur-xl border border-white/10',
          className
        )}
      >
        <Link
          href={`/profile/${user.username}`}
          className="relative h-10 w-10 rounded-full overflow-hidden bg-space-light flex-shrink-0"
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${user.username}`}
            className="font-medium hover:text-primary transition-colors"
          >
            @{user.username}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        {!isOwnProfile && (
          <Button
            variant={following ? 'outline' : 'default'}
            size="sm"
            onClick={handleFollow}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        )}
      </motion.div>
    )
  }

  // Full variant
  return (
    <motion.div
      variants={authorCardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'p-4 rounded-2xl',
        'bg-card/50 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link
          href={`/profile/${user.username}`}
          className="relative h-14 w-14 rounded-full overflow-hidden bg-space-light flex-shrink-0 ring-2 ring-primary/20"
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xl font-medium bg-gradient-to-br from-primary/20 to-primary/5">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Level Badge */}
          {user.level && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
              {user.level}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${user.username}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              {displayName}
            </Link>
            <span className="text-muted-foreground text-sm">
              @{user.username}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Level & Title */}
            {user.level && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-amber-400" />
                Level {user.level} {getLevelTitle(user.level)}
              </span>
            )}

            {/* Badges */}
            {user.topBadges && user.topBadges.length > 0 && (
              <div className="flex items-center gap-1">
                {user.topBadges.slice(0, 3).map((badge) => (
                  <span
                    key={badge.slug}
                    title={badge.name}
                    className="text-sm"
                  >
                    {badge.icon}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>

        {/* Follow Button */}
        {!isOwnProfile && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={following ? 'outline' : 'default'}
              size="sm"
              onClick={handleFollow}
              disabled={isLoading}
              className={cn(
                'rounded-full px-4',
                following && 'border-primary/50'
              )}
            >
              {following ? 'Following' : '+ Follow'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* XP Progress (optional) */}
      {user.total_xp && user.level && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {user.total_xp.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">
              Next: Level {user.level + 1}
            </span>
          </div>
          <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${(user.total_xp % 1000) / 10}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default AuthorCard
