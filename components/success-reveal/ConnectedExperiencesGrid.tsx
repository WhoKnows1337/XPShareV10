'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MapPin, Calendar } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getCategoryEmoji } from '@/lib/constants/categories'
import { formatDistanceToNow } from 'date-fns'

interface SimilarExperience {
  id: string
  title: string
  summary?: string
  category: string
  date: string
  location?: {
    city?: string
    country?: string
  }
  matchScore: number
  matchReasons?: string[]
}

interface ConnectedExperiencesGridProps {
  category: string
  experiences: SimilarExperience[]
  maxDisplay?: number
}

export function ConnectedExperiencesGrid({
  category,
  experiences,
  maxDisplay = 3,
}: ConnectedExperiencesGridProps) {
  const theme = getCategoryTheme(category)
  const displayExperiences = experiences.slice(0, maxDisplay)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (displayExperiences.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Connected Experiences</h2>
        <p className="text-white/70">Others who saw something similar:</p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayExperiences.map((experience, index) => {
          const expTheme = getCategoryTheme(experience.category)
          const emoji = getCategoryEmoji(experience.category)
          
          // Validate date before formatting
          const experienceDate = experience.date ? new Date(experience.date) : null
          const isValidDate = experienceDate && !isNaN(experienceDate.getTime())

          return (
            <motion.div
              key={experience.id || `experience-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/experiences/${experience.id}`}
                className={`group block h-full rounded-xl border ${expTheme.borderColor} bg-gradient-to-br ${expTheme.gradient} p-5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:${expTheme.glowColor}`}
              >
                {/* Match Score Badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{emoji}</span>
                  <div
                    className={`rounded-full ${
                      experience.matchScore >= 0.9
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : experience.matchScore >= 0.8
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                    } px-2 py-1 text-xs font-semibold`}
                  >
                    {Math.round(experience.matchScore * 100)}% Match
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white group-hover:text-white/90">
                  {experience.title}
                </h3>

                {/* Summary */}
                {experience.summary && (
                  <p className="mb-3 line-clamp-2 text-sm text-white/60">{experience.summary}</p>
                )}

                {/* Meta Info */}
                <div className="space-y-1.5 text-xs text-white/50">
                  {experience.location && (experience.location.city || experience.location.country) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {[experience.location.city, experience.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {isClient && isValidDate
                        ? formatDistanceToNow(experienceDate, { addSuffix: true })
                        : isClient
                        ? 'Date unknown'
                        : '...'}
                    </span>
                  </div>
                </div>

                {/* Match Reasons */}
                {experience.matchReasons && experience.matchReasons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                    {experience.matchReasons.slice(0, 2).map((reason, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Arrow */}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <span>View Experience</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* View More Link */}
      {experiences.length > maxDisplay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="flex justify-center pt-2"
        >
          <Link
            href="/discover"
            className={`group flex items-center gap-2 rounded-full border ${theme.borderColor} bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10`}
          >
            View All {experiences.length} Similar Experiences
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
