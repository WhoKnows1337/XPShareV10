import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MapPin, User } from 'lucide-react'
import { SimilarExperiences } from '@/components/patterns/similar-experiences'
import { CommentsSection } from '@/components/interactions/comments-section'
import { UpvoteButton } from '@/components/interactions/upvote-button'
import { ShareButton } from '@/components/interactions/share-button'
import { ReportDialog } from '@/components/interactions/report-dialog'

const categoryLabels: Record<string, string> = {
  ufo: 'UFO Sighting',
  paranormal: 'Paranormal',
  dreams: 'Dream Experience',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Near-Death Experience',
  other: 'Other Experience',
}

export default async function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: experience, error } = await supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !experience) {
    notFound()
  }

  const profile = experience.user_profiles as any

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarFallback>
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile?.display_name || 'Anonymous'}</p>
            <p className="text-sm text-muted-foreground">
              @{profile?.username || 'unknown'}
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="mb-4">
          {categoryLabels[experience.category] || experience.category}
        </Badge>

        <h1 className="text-4xl font-bold mb-4">{experience.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {experience.date_occurred && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {experience.date_occurred}
              {experience.time_of_day && ` at ${experience.time_of_day}`}
            </div>
          )}
          {experience.location_text && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {experience.location_text}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>The Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed">{experience.story_text}</p>
        </CardContent>
      </Card>

      {/* Tags */}
      {experience.tags && experience.tags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {experience.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex items-center gap-3">
        <UpvoteButton
          experienceId={experience.id}
          initialCount={experience.upvote_count || 0}
          currentUserId={user?.id}
        />
        <ShareButton experienceId={experience.id} title={experience.title} />
        <ReportDialog experienceId={experience.id} currentUserId={user?.id} />
      </div>

      {/* Comments Section */}
      <div className="mb-6">
        <CommentsSection experienceId={experience.id} currentUserId={user?.id} />
      </div>

      {/* Similar Experiences */}
      <SimilarExperiences
        text={experience.story_text || ''}
        category={experience.category}
        tags={experience.tags || []}
        currentExperienceId={experience.id}
      />

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center mt-6">
        Posted on {new Date(experience.created_at || new Date()).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  )
}
