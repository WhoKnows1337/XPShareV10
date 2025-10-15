'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Toggle follow/unfollow a user
 */
export async function toggleFollow(followingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (user.id === followingId) {
    return { success: false, error: 'Cannot follow yourself' }
  }

  try {
    // Check if already following using the SQL function
    const { data: isFollowingData } = await supabase.rpc('is_following', {
      p_follower_id: user.id,
      p_following_id: followingId,
    })

    if (isFollowingData) {
      // Unfollow
      const { error } = await (supabase as any).rpc('unfollow_user', {
        p_follower_id: user.id,
        p_following_id: followingId,
      })

      if (error) throw error

      revalidatePath(`/experiences/[id]`, 'page')
      revalidatePath(`/@${followingId}`)

      return { success: true, isFollowing: false }
    } else {
      // Follow
      const { error } = await (supabase as any).rpc('follow_user', {
        p_follower_id: user.id,
        p_following_id: followingId,
      })

      if (error) throw error

      revalidatePath(`/experiences/[id]`, 'page')
      revalidatePath(`/@${followingId}`)

      return { success: true, isFollowing: true }
    }
  } catch (error) {
    console.error('Follow toggle error:', error)
    return { success: false, error: 'Failed to toggle follow' }
  }
}

/**
 * Get follow status for a user
 */
export async function getFollowStatus(followingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id === followingId) {
    return { isFollowing: false }
  }

  try {
    const { data } = await supabase.rpc('is_following', {
      p_follower_id: user.id,
      p_following_id: followingId,
    })

    return { isFollowing: !!data }
  } catch (error) {
    console.error('Get follow status error:', error)
    return { isFollowing: false }
  }
}
