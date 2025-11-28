'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Bookmark, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fadeInUp, likeButtonVariants } from '../shared/animations'

interface InlineEngagementRowProps {
  experienceId: string
  likeCount: number
  commentCount: number
  isLiked?: boolean
  className?: string
}

/**
 * InlineEngagementRow Component
 *
 * Desktop-only inline engagement row for actions like Like, Comment, Share.
 * Provides a non-sticky alternative to the StickyEngagementBar for larger screens.
 */
export function InlineEngagementRow({
  experienceId,
  likeCount: initialLikeCount,
  commentCount,
  isLiked: initialIsLiked = false,
  className,
}: InlineEngagementRowProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isSaved, setIsSaved] = useState(false)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  const handleLike = async () => {
    setIsLikeAnimating(true)
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      await fetch(`/api/experiences/${experienceId}/like`, {
        method: newIsLiked ? 'POST' : 'DELETE',
      })
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikeCount((prev) => (newIsLiked ? prev - 1 : prev + 1))
    }

    setTimeout(() => setIsLikeAnimating(false), 400)
  }

  const handleSave = async () => {
    setIsSaved(!isSaved)
    try {
      await fetch(`/api/experiences/${experienceId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      })
    } catch (error) {
      setIsSaved(isSaved)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Experience on XPShare',
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.div
      className={cn(
        'flex items-center justify-between py-4 px-1 border-y border-white/5',
        className
      )}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Left: Like & Comment */}
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
            isLiked
              ? 'bg-red-500/10 text-red-400'
              : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
          )}
          variants={likeButtonVariants}
          animate={isLikeAnimating ? 'tap' : isLiked ? 'liked' : 'idle'}
          whileTap="tap"
          aria-label={isLiked ? 'Unlike' : 'Like'}
          aria-pressed={isLiked}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all',
              isLiked && 'fill-current text-red-400'
            )}
          />
          <span className="font-medium text-sm">{likeCount}</span>
        </motion.button>

        {/* Comment Button */}
        <button
          onClick={scrollToComments}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View comments"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium text-sm">{commentCount}</span>
        </button>
      </div>

      {/* Right: Share & Save */}
      <div className="flex items-center gap-2">
        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Teilen</span>
        </Button>

        {/* Save Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2',
              isSaved
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Bookmark
              className={cn('h-5 w-5', isSaved && 'fill-current')}
            />
            <span className="hidden sm:inline">
              {isSaved ? 'Gespeichert' : 'Speichern'}
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default InlineEngagementRow
