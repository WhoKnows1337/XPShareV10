'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/app/actions/like'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LikeButtonProps {
  experienceId: string
  initialLikeCount: number
  initialIsLiked: boolean
  currentUserId?: string
}

export function LikeButton({
  experienceId,
  initialLikeCount,
  initialIsLiked,
  currentUserId,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    if (!currentUserId) return

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    // Server action
    startTransition(async () => {
      const result = await toggleLike(experienceId)

      if (!result.success) {
        // Rollback on error
        setIsLiked(initialIsLiked)
        setLikeCount(initialLikeCount)
      }
    })
  }

  if (!currentUserId) {
    return (
      <Button variant="ghost" size="sm" disabled aria-label={`${likeCount} likes`}>
        <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
        <span aria-hidden="true">{likeCount}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      aria-label={isLiked ? `Unlike (${likeCount})` : `Like (${likeCount})`}
      aria-pressed={isLiked}
    >
      <motion.div
        animate={{
          scale: isLiked ? [1, 1.3, 1] : 1,
          rotate: isLiked ? [0, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            'w-4 h-4 mr-2 transition-colors',
            isLiked && 'fill-red-500 text-red-500'
          )}
          aria-hidden="true"
        />
      </motion.div>
      <span aria-hidden="true">{likeCount}</span>
    </Button>
  )
}
