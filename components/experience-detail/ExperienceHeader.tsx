'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Heart, Share2, Edit, MoreHorizontal, Download, Trash, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'
import { ReportDialog } from '@/components/interactions/report-dialog'
import { AnonymousBadge } from '@/components/ui/AnonymousBadge'
import { deleteExperience } from '@/app/actions/experience'
import { toast } from 'sonner'

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
  title: string
  user: ExperienceUser
  category: string
  occurredAt?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isAuthor: boolean
  currentUserId?: string
  initialIsLiked?: boolean
  isAnonymous?: boolean
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
  title,
  user,
  category,
  occurredAt,
  viewCount,
  likeCount,
  commentCount,
  isAuthor,
  currentUserId,
  initialIsLiked = false,
  isAnonymous = false,
}: ExperienceHeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const displayName = user.display_name || user.username
  const initials = displayName.substring(0, 2).toUpperCase()

  const handleExportPDF = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/experiences/${id}/export`)

        if (!response.ok) {
          throw new Error('Export failed')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `experience-${id}.html`

        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('Experience exported successfully!')
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Failed to export experience')
      }
    })
  }

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteExperience(id)

      if (result.success) {
        toast.success('Experience deleted successfully')
        router.push('/feed')
      } else {
        toast.error(result.error || 'Failed to delete experience')
      }
    })
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg"
        role="banner"
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: User Info */}
          <div className="flex items-center gap-3">
            <Link href={`/profile/${user.username}`} aria-label={`View profile of ${displayName}`}>
              <Avatar className="h-10 w-10">
                {user.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={`${displayName}'s avatar`} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                {isAnonymous ? (
                  <AnonymousBadge />
                ) : (
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-semibold hover:underline"
                    aria-label={`View profile of ${displayName}`}
                  >
                    @{user.username}
                  </Link>
                )}
                {/* User Level & Badges (only show if not anonymous) */}
                {!isAnonymous && user.level && (
                  <Badge variant="secondary" className="text-xs" aria-label={`Level ${user.level}`}>
                    Lvl {user.level}
                  </Badge>
                )}
                {!isAnonymous &&
                  user.topBadges?.slice(0, 2).map((badge) => (
                    <TooltipProvider key={badge.slug}>
                      <Tooltip>
                        <TooltipTrigger aria-label={`Badge: ${badge.name}`}>
                          <span className="text-sm" aria-hidden="true">
                            {badge.icon}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  aria-label={`Category: ${categoryLabels[category] || category}`}
                >
                  {categoryLabels[category] || category}
                </Badge>
                <span aria-hidden="true">·</span>
                {occurredAt && (
                  <>
                    <time dateTime={occurredAt}>
                      {formatDistanceToNow(new Date(occurredAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </time>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span aria-label={`${viewCount} views`}>{viewCount} Views</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <nav className="flex items-center gap-2" aria-label="Experience actions">
            <LikeButton
              experienceId={id}
              initialLikeCount={likeCount}
              initialIsLiked={initialIsLiked}
              currentUserId={currentUserId}
            />

            <ShareButton experienceId={id} title={title} />

            {isAuthor && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/submit?edit=${id}`} aria-label="Edit this experience">
                    <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Edit</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="More options"
                      disabled={isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPDF} disabled={isPending}>
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthor && currentUserId && (
              <ReportDialog experienceId={id} currentUserId={currentUserId} />
            )}
          </nav>
        </div>

        {/* Community Thank-You Banner (Aha-Moment #12) */}
        {isAuthor && viewCount >= 10 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-b bg-primary/5 px-6 py-3"
            role="complementary"
            aria-label="Community impact notification"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20"
                  aria-hidden="true"
                >
                  🙏
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Deine XP hat {viewCount} Menschen geholfen!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {commentCount} Kommentare · {likeCount} Reactions
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild aria-label="View detailed impact statistics">
                <Link href={`/experiences/${id}/impact`}>
                  Impact ansehen →
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your experience and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
