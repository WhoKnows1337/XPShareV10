'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface FollowCategoryButtonProps {
  categorySlug: string
  userId: string
  initialFollowing?: boolean
}

export function FollowCategoryButton({
  categorySlug,
  userId,
  initialFollowing = false,
}: FollowCategoryButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('category_follows')
          .delete()
          .eq('user_id', userId)
          .eq('category_slug', categorySlug)

        if (error) throw error

        setIsFollowing(false)
        toast({
          title: 'Unfollowed',
          description: `You will no longer receive notifications for ${categorySlug} experiences.`,
        })
      } else {
        // Follow
        const { error } = await supabase.from('category_follows').insert({
          user_id: userId,
          category_slug: categorySlug,
          notify_new_experiences: true,
          notify_trending: true,
        })

        if (error) throw error

        setIsFollowing(true)
        toast({
          title: 'Following!',
          description: `You'll be notified about new ${categorySlug} experiences.`,
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <BellOff className="h-4 w-4" />
          Unfollow Category
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Follow Category
        </>
      )}
    </Button>
  )
}
