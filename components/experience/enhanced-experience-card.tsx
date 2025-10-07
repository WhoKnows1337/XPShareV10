'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  Eye,
  ThumbsUp,
  MessageCircle,
  Sparkles,
  CheckCircle,
  Heart,
  Share2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { usePrefetch } from '@/hooks/use-prefetch'

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

interface EnhancedExperienceCardProps {
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
    hero_image_url?: string
    is_verified?: boolean
    similar_count?: number
    user_profiles?: {
      username: string
      display_name: string
      avatar_url?: string
    } | null
  }
  size?: 'default' | 'large' | 'wide'
  className?: string
}

export function EnhancedExperienceCard({
  experience,
  size = 'default',
  className,
}: EnhancedExperienceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefetch = usePrefetch()
  const profile = experience.user_profiles
  const displayName = profile?.display_name || profile?.username || 'Anonymous'
  const initials = displayName.substring(0, 2).toUpperCase()
  const isLarge = size === 'large'
  const isWide = size === 'wide'

  // Truncate story text
  const truncatedText =
    experience.story_text.length > 150
      ? experience.story_text.substring(0, 150) + '...'
      : experience.story_text

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' }}
      onHoverStart={() => {
        setIsHovered(true)
        prefetch(`/experiences/${experience.id}`)
      }}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative bg-card rounded-xl border overflow-hidden',
        isLarge && 'md:col-span-2',
        isWide && 'md:row-span-2',
        className
      )}
    >
      {/* Hero Image */}
      {experience.hero_image_url && (
        <Link href={`/experiences/${experience.id}`} className="block">
          <div
            className={cn(
              'relative overflow-hidden',
              isLarge || isWide ? 'aspect-video' : 'aspect-square'
            )}
          >
            <Image
              src={experience.hero_image_url}
              alt={experience.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '300px'}
            />

            {/* Category Badge Overlay */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 backdrop-blur-md bg-background/80"
            >
              {categoryLabels[experience.category] || experience.category}
            </Badge>

            {/* Verified Badge */}
            {experience.is_verified && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 backdrop-blur-md bg-background/80 border-primary"
              >
                <CheckCircle className="w-3 h-3 mr-1 text-primary" />
                Verified
              </Badge>
            )}

            {/* Pattern Indicator */}
            {experience.similar_count && experience.similar_count > 0 && (
              <Badge
                variant="default"
                className="absolute bottom-2 right-2 backdrop-blur-md bg-primary/90"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {experience.similar_count} Similar
              </Badge>
            )}
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
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
          {!experience.hero_image_url && (
            <Badge variant="secondary" className="shrink-0">
              {categoryLabels[experience.category] || experience.category}
            </Badge>
          )}
        </div>

        {/* Title */}
        <Link href={`/experiences/${experience.id}`}>
          <h3 className="text-lg font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
            {experience.title}
          </h3>
        </Link>

        {/* Story Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{truncatedText}</p>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {experience.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/feed?tag=${tag}`}>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                  #{tag}
                </Badge>
              </Link>
            ))}
            {experience.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{experience.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
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

          {/* Pattern Indicator (for cards without image) */}
          {!experience.hero_image_url &&
            experience.similar_count &&
            experience.similar_count > 0 && (
              <Badge variant="secondary" className="text-xs ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                {experience.similar_count}
              </Badge>
            )}
        </div>
      </div>

      {/* Hover Overlay (Quick Actions) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2 pointer-events-none"
      >
        <Button size="sm" variant="secondary" className="pointer-events-auto" asChild>
          <Link href={`/experiences/${experience.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Link>
        </Button>
        <Button size="sm" variant="secondary" className="pointer-events-auto">
          <Heart className="w-4 h-4 mr-2" />
          Like
        </Button>
        <Button size="sm" variant="secondary" className="pointer-events-auto">
          <Share2 className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.article>
  )
}
