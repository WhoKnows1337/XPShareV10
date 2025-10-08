'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LiveRegionProps {
  experienceId: string
}

export function LiveRegion({ experienceId }: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new comments
    const commentsChannel = supabase
      .channel(`live-region:${experienceId}:comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `experience_id=eq.${experienceId}`,
        },
        (payload: any) => {
          const username = payload.new.user_profiles?.username || 'Someone'
          setAnnouncement(`New comment from ${username}`)

          // Clear after announcement
          setTimeout(() => setAnnouncement(''), 3000)
        }
      )
      .subscribe()

    // Subscribe to new likes
    const likesChannel = supabase
      .channel(`live-region:${experienceId}:likes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'upvotes',
          filter: `experience_id=eq.${experienceId}`,
        },
        () => {
          setAnnouncement('Someone liked this experience')

          // Clear after announcement
          setTimeout(() => setAnnouncement(''), 3000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [experienceId])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}
