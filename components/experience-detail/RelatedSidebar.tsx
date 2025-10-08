'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserPlus, MapPin, Calendar, Sparkles, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface UserBadge {
  slug: string
  name: string
  description: string
  icon: string
  rarity: string
}

interface ExperienceUser {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  level?: number
  current_xp?: number
  total_experiences?: number
  topBadges?: UserBadge[]
}

interface SimilarExperience {
  id: string
  title: string
  category: string
  created_at: string
  user_profiles?: {
    username: string
    display_name?: string
  }
  match_score?: number
}

interface RelatedSidebarProps {
  user: ExperienceUser
  similarExperiences?: SimilarExperience[]
  currentUserId?: string
  isFollowing?: boolean
}

const categoryIcons: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🌈',
  spiritual: '✨',
  synchronicity: '🔄',
  nde: '💫',
  other: '❓',
}

export function RelatedSidebar({
  user,
  similarExperiences = [],
  currentUserId,
  isFollowing = false,
}: RelatedSidebarProps) {
  const displayName = user.display_name || user.username
  const initials = displayName.substring(0, 2).toUpperCase()
  const isOwnProfile = currentUserId === user.id

  return (
    <div className="space-y-6">
      {/* Author Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-3">
              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>

            <Link
              href={`/@${user.username}`}
              className="font-semibold text-lg hover:underline mb-1"
            >
              {displayName}
            </Link>

            <p className="text-sm text-muted-foreground mb-3">@{user.username}</p>

            {/* Level & XP */}
            {user.level && (
              <div className="mb-3 w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Level {user.level}</span>
                  {user.current_xp && (
                    <span className="text-xs text-muted-foreground">
                      {user.current_xp} XP
                    </span>
                  )}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${user.current_xp ? (user.current_xp % 1000) / 10 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Top Badges */}
            {user.topBadges && user.topBadges.length > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                {user.topBadges.slice(0, 3).map((badge) => (
                  <TooltipProvider key={badge.slug}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-2xl">{badge.icon}</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs"
                        >
                          {badge.rarity}
                        </Badge>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* Stats */}
            {user.total_experiences && (
              <p className="text-sm text-muted-foreground mb-4">
                {user.total_experiences} {user.total_experiences === 1 ? 'Experience' : 'Experiences'}
              </p>
            )}

            {/* Follow Button */}
            {!isOwnProfile && currentUserId && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                className="w-full"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}

            {currentUserId && isOwnProfile && (
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href={`/@${user.username}`}>View Profile</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Similar Experiences */}
      {similarExperiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Similar Experiences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {similarExperiences.slice(0, 12).map((exp) => (
              <Link
                key={exp.id}
                href={`/experiences/${exp.id}`}
                className="block group"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {exp.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.user_profiles?.display_name || exp.user_profiles?.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs shrink-0">
                      <span className="text-lg">{categoryIcons[exp.category] || '📍'}</span>
                    </div>
                  </div>

                  {/* Match Score */}
                  {exp.match_score && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${exp.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {exp.match_score}%
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(exp.created_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </p>
                </div>

                {exp !== similarExperiences[similarExperiences.length - 1] && (
                  <Separator className="mt-3" />
                )}
              </Link>
            ))}

            {similarExperiences.length > 12 && (
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Show all {similarExperiences.length} similar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Joined {' '}
              {formatDistanceToNow(new Date(), {
                addSuffix: true,
                locale: de,
              })}
            </span>
          </div>
          {user.total_experiences && user.total_experiences > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>{user.total_experiences} experiences shared</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
