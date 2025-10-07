'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Eye, MessageCircle, ThumbsUp, MapPin, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Experience {
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

interface ExperienceListViewProps {
  experiences: Experience[]
}

export function ExperienceListView({ experiences }: ExperienceListViewProps) {
  return (
    <div className="space-y-3">
      {experiences.map((experience) => {
        const displayName = experience.user_profiles?.display_name ||
                           experience.user_profiles?.username ||
                           'Anonymous'
        const username = experience.user_profiles?.username || 'user'
        const avatar = experience.user_profiles?.avatar_url

        return (
          <Link key={experience.id} href={`/experiences/${experience.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    {avatar && <AvatarImage src={avatar} alt={displayName} />}
                    <AvatarFallback>
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
                          {experience.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{username}</span>
                          <span>·</span>
                          <span>
                            {formatDistanceToNow(new Date(experience.created_at), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{experience.category}</Badge>
                    </div>

                    {/* Story preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {experience.story_text}
                    </p>

                    {/* Metadata row */}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {experience.location_text && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {experience.location_text}
                        </span>
                      )}
                      {experience.date_occurred && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(experience.date_occurred).toLocaleDateString('de-DE')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {experience.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {experience.upvote_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {experience.comment_count}
                      </span>
                    </div>

                    {/* Tags */}
                    {experience.tags && experience.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
