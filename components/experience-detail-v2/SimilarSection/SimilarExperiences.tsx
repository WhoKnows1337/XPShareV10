'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SimilarCard, SimilarCardCompact } from './SimilarCard'
import { staggerContainer, scrollRevealVariants, defaultViewport } from '../shared/animations'

interface SimilarExperience {
  id: string
  title: string
  category: string
  match_score?: number
  similarity?: number
  user_profiles?: {
    username: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

interface SimilarExperiencesProps {
  experiences: SimilarExperience[]
  experienceId: string
  className?: string
  variant?: 'grid' | 'scroll' | 'both'
  maxItems?: number
}

export function SimilarExperiences({
  experiences,
  experienceId,
  className,
  variant = 'both',
  maxItems = 6,
}: SimilarExperiencesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!experiences || experiences.length === 0) return null

  const displayExperiences = experiences.slice(0, maxItems)
  const hasMore = experiences.length > maxItems

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 208 // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Transform data
  const items = displayExperiences.map((exp) => ({
    id: exp.id,
    title: exp.title,
    category: exp.category,
    matchScore: exp.match_score ?? (exp.similarity ? Math.round(exp.similarity * 100) : undefined),
    user: exp.user_profiles
      ? {
          username: exp.user_profiles.username,
          display_name: exp.user_profiles.display_name ?? undefined,
          avatar_url: exp.user_profiles.avatar_url ?? undefined,
        }
      : undefined,
  }))

  return (
    <motion.section
      id="similar-experiences"
      variants={scrollRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className={cn('py-8', className)}
    >
      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Du bist nicht allein</h2>
            <p className="text-sm text-muted-foreground">
              {experiences.length} Menschen hatten ähnliche Erfahrungen
            </p>
          </div>
        </motion.div>
      </div>

      {/* Horizontal Scroll (Mobile) */}
      {(variant === 'scroll' || variant === 'both') && (
        <div className={cn('relative group', variant === 'both' && 'md:hidden')}>
          {/* Scroll Buttons */}
          {items.length > 2 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-space-deep/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-space-deep/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="snap-start"
              >
                <SimilarCardCompact {...item} />
              </motion.div>
            ))}

            {/* See All Card */}
            {hasMore && (
              <Link
                href={`/discover?similar=${experienceId}`}
                className={cn(
                  'flex-shrink-0 w-32 p-4 rounded-xl',
                  'bg-primary/10 border border-primary/20',
                  'flex flex-col items-center justify-center gap-2',
                  'text-primary hover:bg-primary/20 transition-colors'
                )}
              >
                <span className="text-2xl font-bold">+{experiences.length - maxItems}</span>
                <span className="text-xs text-center">Weitere anzeigen</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Grid (Desktop) */}
      {(variant === 'grid' || variant === 'both') && (
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="visible"
          className={cn(
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
            variant === 'both' && 'hidden md:grid'
          )}
        >
          {items.map((item, index) => (
            <SimilarCard key={item.id} {...item} index={index} />
          ))}
        </motion.div>
      )}

      {/* See All Link */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn('mt-6 text-center', variant === 'scroll' && 'hidden', variant === 'both' && 'hidden md:block')}
        >
          <Link
            href={`/discover?similar=${experienceId}`}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Alle {experiences.length} ähnlichen Erfahrungen anzeigen
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}
    </motion.section>
  )
}

export default SimilarExperiences
