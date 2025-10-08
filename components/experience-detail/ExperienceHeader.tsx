'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Heart,
  Share2,
  Edit,
  MoreHorizontal,
  Download,
  Trash,
  Flag,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface UserBadge {
  slug: string
  name: string
  description: string
  icon: string
}

interface ExperienceUser {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  level?: number
  topBadges?: UserBadge[]
}

interface ExperienceHeaderProps {
  id: string
  user: ExperienceUser
  category: string
  occurredAt?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isAuthor: boolean
  currentUserId?: string
}

const categoryLabels: Record<string, string> = {
  ufo: 'UFO Sighting',
  paranormal: 'Paranormal',
  dreams: 'Dream Experience',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Near-Death Experience',
  other: 'Other Experience',
}

export function ExperienceHeader({
  id,
  user,
  category,
  occurredAt,
  viewCount,
  likeCount,
  commentCount,
  isAuthor,
  currentUserId,
}: ExperienceHeaderProps) {
  const displayName = user.display_name || user.username
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user.avatar_url && <AvatarImage src={user.avatar_url} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/@${user.username}`}
                className="font-semibold hover:underline"
              >
                @{user.username}
              </Link>
              {/* User Level & Badges */}
              {user.level && (
                <Badge variant="secondary" className="text-xs">
                  Lvl {user.level}
                </Badge>
              )}
              {user.topBadges?.slice(0, 2).map((badge) => (
                <TooltipProvider key={badge.slug}>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm" title={badge.name}>
                        {badge.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {categoryLabels[category] || category}
              </Badge>
              <span>·</span>
              {occurredAt && (
                <>
                  <time dateTime={occurredAt}>
                    {formatDistanceToNow(new Date(occurredAt), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </time>
                  <span>·</span>
                </>
              )}
              <span>{viewCount} Views</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            {likeCount}
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>

          {isAuthor && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/experiences/${id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!isAuthor && currentUserId && (
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Community Thank-You Banner (Aha-Moment #12) */}
      {isAuthor && viewCount >= 10 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-b bg-primary/5 px-6 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                🙏
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Deine XP hat {viewCount} Menschen geholfen!
                </p>
                <p className="text-xs text-muted-foreground">
                  {commentCount} Kommentare · {likeCount} Reactions
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Impact ansehen →
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  )
}
