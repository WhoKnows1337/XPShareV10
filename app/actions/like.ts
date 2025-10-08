'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(experienceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('upvotes')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      await supabase
        .from('upvotes')
        .delete()
        .eq('id', existingLike.id)

      return { success: true, isLiked: false }
    } else {
      // Like
      await supabase
        .from('upvotes')
        .insert({
          experience_id: experienceId,
          user_id: user.id,
        })

      return { success: true, isLiked: true }
    }
  } catch (error) {
    console.error('Like toggle error:', error)
    return { success: false, error: 'Failed to toggle like' }
  } finally {
    revalidatePath(`/experiences/${experienceId}`)
  }
}
