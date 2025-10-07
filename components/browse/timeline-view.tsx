'use client'

import { useMemo } from 'react'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Heart, MessageSquare, Eye, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import 'react-vertical-timeline-component/style.min.css'

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
  hero_image_url?: string
  user_profiles?: {
    username: string
    display_name: string
    avatar_url?: string
  } | null
}

interface TimelineViewProps {
  experiences: Experience[]
}

const categoryColors: Record<string, string> = {
  ufo: '#8b5cf6',
  paranormal: '#6366f1',
  dreams: '#ec4899',
  psychedelic: '#f59e0b',
  spiritual: '#10b981',
  synchronicity: '#06b6d4',
  nde: '#ef4444',
  other: '#64748b'
}

const categoryIcons: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🌈',
  spiritual: '✨',
  synchronicity: '🔄',
  nde: '💫',
  other: '❓'
}

export function TimelineView({ experiences }: TimelineViewProps) {
  // Sort experiences by date (newest first)
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const dateA = new Date(a.date_occurred || a.created_at).getTime()
      const dateB = new Date(b.date_occurred || b.created_at).getTime()
      return dateB - dateA
    })
  }, [experiences])

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Experience[]> = {}

    sortedExperiences.forEach(exp => {
      const date = format(new Date(exp.date_occurred || exp.created_at), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(exp)
    })

    return groups
  }, [sortedExperiences])

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Keine Erlebnisse für Timeline verfügbar</p>
      </div>
    )
  }

  return (
    <div className="timeline-view">
      <VerticalTimeline lineColor="hsl(var(--border))">
        {Object.entries(groupedByDate).map(([date, exps]) => (
          <div key={date}>
            {/* Date Separator */}
            <VerticalTimelineElement
              className="date-separator"
              date={format(new Date(date), 'EEEE, dd. MMMM yyyy', { locale: de })}
              iconStyle={{
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                boxShadow: '0 0 0 4px hsl(var(--background)), inset 0 2px 0 rgba(0,0,0,.08), 0 3px 0 4px rgba(0,0,0,.05)'
              }}
              icon={<Calendar className="w-5 h-5" />}
              contentStyle={{
                background: 'transparent',
                boxShadow: 'none',
                padding: 0
              }}
            />

            {/* Experiences for this date */}
            {exps.map((exp) => (
              <VerticalTimelineElement
                key={exp.id}
                className="experience-item"
                date={
                  exp.time_of_day ||
                  format(new Date(exp.date_occurred || exp.created_at), 'HH:mm')
                }
                iconStyle={{
                  background: categoryColors[exp.category] || categoryColors.other,
                  color: '#fff',
                  boxShadow: '0 0 0 4px hsl(var(--background)), inset 0 2px 0 rgba(0,0,0,.08), 0 3px 0 4px rgba(0,0,0,.05)'
                }}
                icon={
                  <span className="text-2xl">
                    {categoryIcons[exp.category] || categoryIcons.other}
                  </span>
                }
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 3px 0 hsl(var(--border))',
                  borderRadius: '0.5rem',
                  padding: '1.5rem'
                }}
                contentArrowStyle={{
                  borderRight: '7px solid hsl(var(--border))'
                }}
              >
                {/* Category Badge */}
                <Badge variant="secondary" className="mb-3">
                  {categoryIcons[exp.category]} {exp.category}
                </Badge>

                {/* Title */}
                <Link
                  href={`/experiences/${exp.id}`}
                  className="block mb-3 group"
                >
                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                </Link>

                {/* Hero Image */}
                {exp.hero_image_url && (
                  <Link href={`/experiences/${exp.id}`}>
                    <img
                      src={exp.hero_image_url}
                      alt=""
                      className="w-full h-48 object-cover rounded-lg mb-4 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                )}

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {exp.story_text}
                </p>

                {/* Tags */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exp.tags.slice(0, 4).map((tag) => (
                      <Link key={tag} href={`/feed?tag=${tag}`}>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                    {exp.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{exp.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Location */}
                {exp.location_text && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{exp.location_text}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  {/* Author */}
                  <Link
                    href={`/profile/${exp.user_profiles?.username || 'unknown'}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={exp.user_profiles?.avatar_url} />
                      <AvatarFallback>
                        {exp.user_profiles?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        @{exp.user_profiles?.username || 'unknown'}
                      </span>
                    </div>
                  </Link>

                  {/* Engagement */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{exp.upvote_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{exp.comment_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{exp.view_count}</span>
                    </div>
                  </div>
                </div>
              </VerticalTimelineElement>
            ))}
          </div>
        ))}
      </VerticalTimeline>

      <style jsx global>{`
        .timeline-view .vertical-timeline::before {
          background: hsl(var(--border));
        }

        .timeline-view .vertical-timeline-element-date {
          color: hsl(var(--muted-foreground));
          font-size: 0.875rem;
        }

        .date-separator .vertical-timeline-element-content {
          display: none;
        }

        .date-separator .vertical-timeline-element-date {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  )
}
