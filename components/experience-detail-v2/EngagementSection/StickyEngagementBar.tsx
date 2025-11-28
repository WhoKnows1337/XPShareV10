'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { engagementBarVariants, likeButtonVariants } from '../shared/animations'

interface StickyEngagementBarProps {
  experienceId: string
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isSaved?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onSave?: () => void
  className?: string
  /** Show only on mobile */
  mobileOnly?: boolean
}

export function StickyEngagementBar({
  experienceId,
  likeCount,
  commentCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  className,
  mobileOnly = true,
}: StickyEngagementBarProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY

      // Only hide after scrolling past a certain point
      if (currentScrollY > 200) {
        setIsVisible(!isScrollingDown)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleLike = () => {
    setLiked(!liked)
    setCurrentLikeCount(liked ? currentLikeCount - 1 : currentLikeCount + 1)
    onLike?.()
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.()
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Experience',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      // TODO: Toast notification
    }
    onShare?.()
  }

  const handleComment = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
    onComment?.()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={engagementBarVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40',
            'px-4 py-3',
            'bg-space-deep/90 backdrop-blur-xl',
            'border-t border-white/10',
            'safe-area-inset-bottom',
            mobileOnly && 'lg:hidden',
            className
          )}
        >
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-2">
            {/* Like Button */}
            <motion.button
              onClick={handleLike}
              variants={likeButtonVariants}
              whileTap="tap"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'transition-colors',
                liked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
              )}
            >
              <Heart
                className={cn('h-5 w-5', liked && 'fill-current')}
              />
              <span className="text-sm font-medium">{currentLikeCount}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              onClick={handleComment}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-white/5 hover:bg-white/10 text-muted-foreground',
                'transition-colors'
              )}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{commentCount}</span>
            </motion.button>

            {/* Share Button */}
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                'bg-white/5 hover:bg-white/10 text-muted-foreground',
                'transition-colors'
              )}
            >
              <Share2 className="h-5 w-5" />
            </motion.button>

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                'transition-colors',
                saved
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
              )}
            >
              <Bookmark className={cn('h-5 w-5', saved && 'fill-current')} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Inline engagement row for desktop
 */
export function InlineEngagementRow({
  experienceId,
  likeCount,
  commentCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  className,
}: StickyEngagementBarProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)

  const handleLike = () => {
    setLiked(!liked)
    setCurrentLikeCount(liked ? currentLikeCount - 1 : currentLikeCount + 1)
    onLike?.()
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'flex items-center gap-4 py-4 border-t border-b border-white/5',
        className
      )}
    >
      {/* Like */}
      <motion.button
        onClick={handleLike}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex items-center gap-2 text-sm',
          liked ? 'text-red-400' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
        <span>{currentLikeCount} Likes</span>
      </motion.button>

      {/* Comment */}
      <motion.button
        onClick={onComment}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{commentCount} Kommentare</span>
      </motion.button>

      <div className="flex-1" />

      {/* Share */}
      <motion.button
        onClick={onShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Share2 className="h-5 w-5" />
        <span className="hidden sm:inline">Teilen</span>
      </motion.button>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex items-center gap-2 text-sm',
          saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Bookmark className={cn('h-5 w-5', saved && 'fill-current')} />
        <span className="hidden sm:inline">Speichern</span>
      </motion.button>
    </motion.div>
  )
}

export default StickyEngagementBar
