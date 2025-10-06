import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MapPin, Eye, ThumbsUp, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

interface ExperienceCardProps {
  experience: {
    id: string
    title: string
    story_text: string
    category: string
    tags: string[]
    location_text?: string
    date_occurred?: string
    time_of_day?: string
    view_count: number
    upvote_count: number
    comment_count: number
    created_at: string
    user_profiles?: {
      username: string
      display_name: string
      avatar_url?: string
    } | null
  }
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const profile = experience.user_profiles
  const displayName = profile?.display_name || profile?.username || 'Anonymous'
  const initials = displayName.substring(0, 2).toUpperCase()

  // Truncate story text to ~150 characters
  const truncatedText =
    experience.story_text.length > 150
      ? experience.story_text.substring(0, 150) + '...'
      : experience.story_text

  return (
    <Link href={`/experiences/${experience.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader className="pb-3">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(experience.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {categoryLabels[experience.category] || experience.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{experience.title}</h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Story Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3">{truncatedText}</p>

          {/* Tags */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {experience.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{experience.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {experience.date_occurred && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{experience.date_occurred}</span>
              </div>
            )}
            {experience.location_text && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{experience.location_text}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{experience.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{experience.upvote_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{experience.comment_count || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
