'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BentoGrid } from '@/components/ui/bento-grid'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { cn } from '@/lib/utils'

interface LikedTabProps {
  userId: string
  isOwnProfile: boolean
}

export function LikedTab({ userId, isOwnProfile }: LikedTabProps) {
  const { data: likedExperiences, isLoading, refetch } = useQuery({
    queryKey: ['liked-experiences', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('experience_likes')
        .select(`
          created_at,
          experience:experiences (
            id,
            title,
            story_text,
            category,
            tags,
            location_text,
            date_occurred,
            time_of_day,
            view_count,
            upvote_count,
            comment_count,
            created_at,
            user_profiles!experiences_user_id_fkey (
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map((item) => item.experience)
    },
  })

  const handleUnlike = async (experienceId: string) => {
    const supabase = createClient()
    await supabase
      .from('experience_likes')
      .delete()
      .eq('user_id', userId)
      .eq('experience_id', experienceId)

    refetch()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!likedExperiences || likedExperiences.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Liked Experiences Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start liking experiences that resonate with you
          </p>
          <Link href="/feed">
            <Button>Explore Experiences</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {likedExperiences.length} liked experience{likedExperiences.length !== 1 ? 's' : ''}
        </p>
      </div>

      <BentoGrid className="max-w-full">
        {likedExperiences.map((experience: any, index: number) => (
          <div key={experience.id} className="relative group">
            <EnhancedExperienceCard
              experience={experience}
              size={
                index === 0 ? 'large' : index === 2 ? 'wide' : index % 7 === 0 ? 'large' : 'default'
              }
              className={cn(
                index === 0 && 'md:col-span-2',
                index === 2 && 'md:row-span-2',
                index % 7 === 0 && 'md:col-span-2'
              )}
            />

            {/* Unlike Button (only for own profile) */}
            {isOwnProfile && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleUnlike(experience.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </BentoGrid>
    </div>
  )
}
