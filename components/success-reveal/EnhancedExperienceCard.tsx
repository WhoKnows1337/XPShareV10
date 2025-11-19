'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Calendar, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getCategoryEmoji } from '@/lib/constants/categories'
import { formatDistanceToNow } from 'date-fns'
import { MatchConfidenceBadge } from './MatchConfidenceBadge'

interface EnhancedExperienceCardProps {
  experience: {
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
  index: number
  isClient: boolean
}

export function EnhancedExperienceCard({
  experience,
  index,
  isClient,
}: EnhancedExperienceCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const expTheme = getCategoryTheme(experience.category)
  const emoji = getCategoryEmoji(experience.category)

  // Validate date before formatting
  const experienceDate = experience.date ? new Date(experience.date) : null
  const isValidDate = experienceDate && !isNaN(experienceDate.getTime())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <Link
        href={`/experiences/${experience.id}`}
        className={`
          block rounded-xl border ${expTheme.borderColor}
          bg-gradient-to-br ${expTheme.gradient}
          p-5 backdrop-blur-sm transition-all
          hover:scale-[1.02] hover:shadow-xl hover:${expTheme.glowColor}
        `}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <MatchConfidenceBadge score={experience.matchScore} showLabel={false} />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowDetails(!showDetails)
            }}
            className="rounded-full bg-white/10 p-1.5 transition-transform hover:bg-white/20"
          >
            <ChevronDown
              className={`h-4 w-4 text-white/70 transition-transform ${
                showDetails ? 'rotate-180' : ''
              }`}
            />
          </button>
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

        {/* Match Reasons (Always Visible) */}
        {experience.matchReasons && experience.matchReasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
            {experience.matchReasons.slice(0, 3).map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 overflow-hidden border-t border-white/10 pt-3"
            >
              <div className="space-y-2 text-xs text-white/70">
                <div>
                  <span className="font-semibold text-white/90">Match Quality:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${expTheme.gradient} transition-all`}
                        style={{ width: `${experience.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="font-medium text-white/90">
                      {Math.round(experience.matchScore * 100)}%
                    </span>
                  </div>
                </div>

                {experience.matchReasons && experience.matchReasons.length > 3 && (
                  <div>
                    <span className="font-semibold text-white/90">Additional Matches:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {experience.matchReasons.slice(3).map((reason, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/60"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Arrow */}
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
          <span>View Full Experience</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  )
}
