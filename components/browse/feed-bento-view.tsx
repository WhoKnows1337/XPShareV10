'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, MapPin, Calendar, User } from 'lucide-react'

interface Experience {
  id: string
  title: string
  description: string
  category: string
  created_at: string
  location_city?: string
  location_country?: string
  tags?: string[]
  user_profiles?: {
    username: string
    display_name?: string
  }
  likes_count?: number
  comments_count?: number
  media_count?: number
}

interface FeedBentoViewProps {
  experiences: Experience[]
}

export function FeedBentoView({ experiences }: FeedBentoViewProps) {
  // Calculate grid span based on importance (likes, comments, media)
  const getGridSpan = (experience: Experience, index: number) => {
    const importance = 
      (experience.likes_count || 0) * 2 + 
      (experience.comments_count || 0) * 3 + 
      (experience.media_count || 0) * 1
    
    // First item is always featured
    if (index === 0) return 'md:col-span-2 md:row-span-2'
    
    // High importance items get larger cards
    if (importance > 10) return 'md:col-span-2'
    
    // Medium importance
    if (importance > 5) return 'md:row-span-2'
    
    // Default size
    return ''
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ufo: 'bg-blue-100 text-blue-800',
      paranormal: 'bg-purple-100 text-purple-800',
      dreams: 'bg-pink-100 text-pink-800',
      psychedelic: 'bg-orange-100 text-orange-800',
      spiritual: 'bg-green-100 text-green-800',
      synchronicity: 'bg-cyan-100 text-cyan-800',
      nde: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  return (
    <BentoGrid className="auto-rows-[minmax(200px,auto)]">
      {experiences.map((exp, index) => (
        <BentoGridItem
          key={exp.id}
          className={`${getGridSpan(exp, index)} cursor-pointer hover:border-purple-300`}
          title={
            <Link 
              href={`/experiences/${exp.id}`}
              className="hover:text-purple-600 transition-colors line-clamp-2"
            >
              {exp.title}
            </Link>
          }
          description={
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {exp.description}
            </p>
          }
          header={
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={getCategoryColor(exp.category)}>
                  {exp.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(exp.created_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                </span>
              </div>
            </div>
          }
          icon={
            <div className="space-y-3">
              {/* Meta Information */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {exp.location_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{exp.location_city}, {exp.location_country}</span>
                  </div>
                )}
                {exp.user_profiles && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{exp.user_profiles.display_name || exp.user_profiles.username}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {exp.tags && exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exp.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{exp.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{exp.comments_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  <span>{exp.media_count || 0}</span>
                </div>
              </div>
            </div>
          }
        />
      ))}
    </BentoGrid>
  )
}
