'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'

interface UpvoteButtonProps {
  experienceId: string
  initialCount: number
  currentUserId?: string
}

export function UpvoteButton({ experienceId, initialCount, currentUserId }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUserId) {
      checkUpvoteStatus()
    }
  }, [experienceId, currentUserId])

  const checkUpvoteStatus = async () => {
    try {
      const response = await fetch(`/api/upvotes?experienceId=${experienceId}`)
      const data = await response.json()
      setHasUpvoted(data.hasUpvoted)
    } catch (error) {
      console.error('Failed to check upvote status:', error)
    }
  }

  const handleToggle = async () => {
    if (!currentUserId || isLoading) return

    setIsLoading(true)
    const previousState = hasUpvoted
    const previousCount = count

    // Optimistic update
    setHasUpvoted(!hasUpvoted)
    setCount(hasUpvoted ? count - 1 : count + 1)

    try {
      const response = await fetch('/api/upvotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceId }),
      })

      if (!response.ok) {
        // Revert on error
        setHasUpvoted(previousState)
        setCount(previousCount)
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error)
      setHasUpvoted(previousState)
      setCount(previousCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={hasUpvoted ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={!currentUserId || isLoading}
      className="gap-2"
    >
      <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
      <span>{count}</span>
    </Button>
  )
}
