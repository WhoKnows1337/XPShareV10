'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MapPin, Eye, ThumbsUp, MessageCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface TimelineExperience {
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

interface TimelineViewProps {
  experiences: TimelineExperience[]
}

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

const categoryColors: Record<string, string> = {
  ufo: 'bg-blue-500',
  paranormal: 'bg-purple-500',
  dreams: 'bg-cyan-500',
  psychedelic: 'bg-pink-500',
  spiritual: 'bg-green-500',
  synchronicity: 'bg-amber-500',
  nde: 'bg-red-500',
  other: 'bg-gray-500',
}

export function TimelineView({ experiences }: TimelineViewProps) {
  // Group experiences by date
  const groupedExperiences = experiences.reduce((acc, exp) => {
    const date = exp.date_occurred || exp.created_at.split('T')[0]
    const yearMonth = date.substring(0, 7) // YYYY-MM
    if (!acc[yearMonth]) {
      acc[yearMonth] = []
    }
    acc[yearMonth].push(exp)
    return acc
  }, {} as Record<string, TimelineExperience[]>)

  const sortedGroups = Object.entries(groupedExperiences).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-200" />

      <div className="space-y-12">
        {sortedGroups.map(([yearMonth, exps]) => {
          const [year, month] = yearMonth.split('-')
          const monthName = format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy')

          return (
            <div key={yearMonth} className="relative">
              {/* Date marker */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{monthName}</h3>
                  <p className="text-sm text-muted-foreground">{exps.length} experience{exps.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Experiences for this month */}
              <div className="ml-24 space-y-6">
                {exps.map((exp) => {
                  const profile = exp.user_profiles
                  const displayName = profile?.display_name || profile?.username || 'Anonymous'
                  const initials = displayName.substring(0, 2).toUpperCase()
                  const truncatedText = exp.story_text.length > 200
                    ? exp.story_text.substring(0, 200) + '...'
                    : exp.story_text

                  return (
                    <Link key={exp.id} href={`/experiences/${exp.id}`}>
                      <Card className="relative transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer group">
                        {/* Category accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${categoryColors[exp.category]} rounded-l-lg`} />

                        <CardContent className="p-6 pl-8">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {categoryLabels[exp.category] || exp.category}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h4 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors">
                            {exp.title}
                          </h4>

                          {/* Story preview */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {truncatedText}
                          </p>

                          {/* Tags */}
                          {exp.tags && exp.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {exp.tags.slice(0, 5).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {exp.tags.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{exp.tags.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Metadata row */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              {exp.date_occurred && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{exp.date_occurred}</span>
                                  {exp.time_of_day && <span>• {exp.time_of_day}</span>}
                                </div>
                              )}
                              {exp.location_text && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[200px]">{exp.location_text}</span>
                                </div>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{exp.view_count || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{exp.upvote_count || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>{exp.comment_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
