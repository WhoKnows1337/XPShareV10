'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function FollowButton({
  targetUserId,
  currentUserId,
  variant = 'default',
  size = 'default',
  showIcon = true,
}: FollowButtonProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Check if currently following
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['is-following', targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_following', {
        target_user_id: targetUserId,
      })

      if (error) {
        console.error('Error checking follow status:', error)
        return false
      }

      return data as boolean
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
  })

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('follow_user', {
        target_user_id: targetUserId,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count', currentUserId] })
      toast({
        title: 'Success',
        description: 'You are now following this user',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive',
      })
      console.error('Follow error:', error)
    },
  })

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('unfollow_user', {
        target_user_id: targetUserId,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count', currentUserId] })
      toast({
        title: 'Success',
        description: 'You have unfollowed this user',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive',
      })
      console.error('Unfollow error:', error)
    },
  })

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate()
    } else {
      followMutation.mutate()
    }
  }

  // Don't show button if viewing own profile
  if (currentUserId === targetUserId) {
    return null
  }

  const isPending = followMutation.isPending || unfollowMutation.isPending

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : showIcon ? (
        isFollowing ? (
          <UserMinus className="h-4 w-4 mr-2" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )
      ) : null}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
