'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MediaLightbox } from './MediaLightbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Palette,
  Languages,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Link2,
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface DynamicAnswer {
  question_id: string
  question_text: string
  answer_type: 'text' | 'chips' | 'slider'
  answer_value: string | string[] | number
  options?: string[]
}

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'audio'
  caption?: string
}

interface Witness {
  id: string
  name: string
  is_verified: boolean
  testimony?: string
}

interface LinkedExperience {
  id: string
  title: string
  user_profiles?: {
    username: string
    display_name?: string
  }
  category: string
}

interface ExperienceContentProps {
  id: string
  title: string
  storyText: string
  category: string
  heroImageUrl?: string
  heroImageBlur?: string
  locationText?: string
  locationLat?: number
  locationLng?: number
  dateOccurred?: string
  timeOfDay?: string
  tags?: string[]
  dynamicAnswers?: DynamicAnswer[]
  media?: MediaItem[]
  sketches?: string[]
  witnesses?: Witness[]
  linkedExperiences?: LinkedExperience[]
  isTranslated?: boolean
  originalLanguage?: string
  currentLanguage?: string
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

const timeOfDayLabels: Record<string, string> = {
  dawn: 'Dawn',
  morning: 'Morning',
  afternoon: 'Afternoon',
  dusk: 'Dusk',
  night: 'Night',
  midnight: 'Midnight',
}

export function ExperienceContent({
  id,
  title,
  storyText,
  category,
  heroImageUrl,
  heroImageBlur,
  locationText,
  locationLat,
  locationLng,
  dateOccurred,
  timeOfDay,
  tags = [],
  dynamicAnswers = [],
  media = [],
  sketches = [],
  witnesses = [],
  linkedExperiences = [],
  isTranslated = false,
  originalLanguage,
  currentLanguage = 'de',
}: ExperienceContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const shouldShowReadMore = storyText.length > 500

  const displayText = isExpanded || !shouldShowReadMore
    ? storyText
    : storyText.substring(0, 500) + '...'

  const handleMediaClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Staggered animation variants for content sections
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Image */}
      {heroImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={heroImageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            placeholder={heroImageBlur ? 'blur' : 'empty'}
            blurDataURL={heroImageBlur}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 900px"
          />
        </div>
      )}

      {/* Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>

        {/* Translation Badge */}
        {isTranslated && originalLanguage && (
          <Card className="mb-4 bg-muted/50 border-primary/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Translated from {originalLanguage.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">This experience was automatically translated</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? 'Show translation' : `Show original (${originalLanguage.toUpperCase()})`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {locationText && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {locationLat && locationLng ? (
                <Link
                  href={`/map?lat=${locationLat}&lng=${locationLng}`}
                  className="hover:underline hover:text-foreground transition-colors"
                >
                  {locationText}
                </Link>
              ) : (
                <span>{locationText}</span>
              )}
            </div>
          )}

          {dateOccurred && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={dateOccurred}>
                {format(new Date(dateOccurred), 'PPP', { locale: de })}
              </time>
            </div>
          )}

          {timeOfDay && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{timeOfDayLabels[timeOfDay] || timeOfDay}</span>
            </div>
          )}

          <Badge variant="secondary" className="ml-auto">
            {categoryLabels[category] || category}
          </Badge>
        </div>
      </motion.div>

      <Separator />

      {/* Translation Badge */}
      {isTranslated && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Translated from {originalLanguage} to {currentLanguage}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? 'Show translation' : 'Show original'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Story Content */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-base leading-relaxed">
              {displayText}
            </p>
          </div>

          {/* Read More Button */}
          {shouldShowReadMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-2"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tags */}
      {tags.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
            >
              <Link href={`/feed?tag=${tag}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  #{tag}
                </Badge>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Dynamic Questions & Answers */}
      {dynamicAnswers.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            {dynamicAnswers.map((answer) => (
              <div key={answer.question_id} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {answer.question_text}
                </p>

                {/* Text Answer */}
                {answer.answer_type === 'text' && typeof answer.answer_value === 'string' && (
                  <p className="text-base">{answer.answer_value}</p>
                )}

                {/* Chips Answer */}
                {answer.answer_type === 'chips' && Array.isArray(answer.answer_value) && (
                  <div className="flex flex-wrap gap-2">
                    {answer.answer_value.map((chip, idx) => (
                      <Badge key={idx} variant="secondary">
                        {chip}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Slider Answer */}
                {answer.answer_type === 'slider' && typeof answer.answer_value === 'number' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      {answer.options && answer.options.length >= 2 && (
                        <>
                          <span className="text-muted-foreground">{answer.options[0]}</span>
                          <span className="text-muted-foreground">
                            {answer.options[answer.options.length - 1]}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="relative pt-1">
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${answer.answer_value}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-center font-medium">{answer.answer_value}%</p>
                  </div>
                )}

                {answer !== dynamicAnswers[dynamicAnswers.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Media Gallery */}
      {media.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Media Gallery</h3>
              <Badge variant="secondary">{media.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleMediaClick(index)}
                  className="relative aspect-square overflow-hidden rounded-lg border group cursor-pointer"
                >
                  {item.type === 'image' && (
                    <Image
                      src={item.url}
                      alt={item.caption || 'Experience media'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  )}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
                      <p className="text-xs truncate">{item.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Sketches */}
      {sketches.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Sketches & Drawings</h3>
              <Badge variant="secondary">{sketches.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sketches.map((sketch, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={sketch}
                    alt={`Sketch ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Witnesses */}
      {witnesses.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Witnesses</h3>
              <Badge variant="secondary">{witnesses.length}</Badge>
            </div>
            <div className="space-y-4">
              {witnesses.map((witness) => (
                <div key={witness.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{witness.name}</p>
                    {witness.is_verified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified witness</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {witness.testimony && (
                    <p className="text-sm text-muted-foreground pl-6">
                      &ldquo;{witness.testimony}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Media Lightbox */}
      {media.length > 0 && (
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Linked/Collaborative Experiences */}
      {linkedExperiences.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Connected Experiences</h3>
              <Badge variant="secondary">{linkedExperiences.length}</Badge>
            </div>
            <div className="space-y-3">
              {linkedExperiences.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp.id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium hover:text-primary transition-colors">
                        {exp.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {exp.user_profiles?.display_name || exp.user_profiles?.username}
                      </p>
                    </div>
                    <Badge variant="outline">{categoryLabels[exp.category]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}
    </motion.div>
  )
}
