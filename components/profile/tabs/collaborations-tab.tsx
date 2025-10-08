'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BentoGrid } from '@/components/ui/bento-grid'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { cn } from '@/lib/utils'

interface CollaborationsTabProps {
  userId: string
}

export function CollaborationsTab({ userId }: CollaborationsTabProps) {
  const { data: collaborations, isLoading } = useQuery({
    queryKey: ['collaborations', userId],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch experiences where user is a witness or contributor
      const { data, error } = await supabase
        .from('experiences')
        .select(`
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
          witnesses,
          user_profiles!experiences_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`witnesses.cs.{${userId}}`)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

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

  if (!collaborations || collaborations.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Collaborations Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            When you're added as a witness or collaborate on experiences, they'll appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Collaborative Experiences</h2>
          <p className="text-sm text-muted-foreground">
            {collaborations.length} experience{collaborations.length !== 1 ? 's' : ''} where you
            contributed as a witness or collaborator
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Verified Witness
        </Badge>
      </div>

      <BentoGrid className="max-w-full">
        {collaborations.map((experience: any, index: number) => (
          <div key={experience.id} className="relative">
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

            {/* Collaboration Badge */}
            <Badge
              variant="outline"
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Witness
            </Badge>
          </div>
        ))}
      </BentoGrid>
    </div>
  )
}
