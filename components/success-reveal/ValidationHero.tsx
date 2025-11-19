'use client'

import { motion } from 'framer-motion'
import { Heart, Users, MapPin, Clock } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getCategoryLabel } from '@/lib/constants/categories'

interface AttributeBreakdown {
  attribute: string
  count: number
  icon: string
  label: string
}

interface ValidationHeroProps {
  category: string
  similarCount: number
  location?: {
    city?: string
    country?: string
  }
  recentCount?: number // Similar experiences in last 7 days
  isFirstInLocation?: boolean
  attributeBreakdowns?: AttributeBreakdown[] // Detailed breakdown by attributes
  geographicBreakdown?: {
    inCity: number
    inCountry: number
    global: number
  }
}

export function ValidationHero({
  category,
  similarCount,
  location,
  recentCount = 0,
  isFirstInLocation = false,
  attributeBreakdowns = [],
  geographicBreakdown,
}: ValidationHeroProps) {
  const theme = getCategoryTheme(category)
  const categoryLabel = getCategoryLabel(category)

  // Generate personalized validation message
  const getValidationMessage = () => {
    if (isFirstInLocation && location?.city) {
      return `Du bist die erste Person aus ${location.city}, die dieses Phänomen meldet. Danke, dass du deine Stimme erhebst.`
    }

    if (similarCount === 0) {
      return `Deine Erfahrung ist einzigartig. Du trägst etwas völlig Neues zu unserem Verständnis bei.`
    }

    if (similarCount === 1) {
      return `Du bist nicht allein. Eine andere Person hat eine ähnliche Erfahrung geteilt.`
    }

    if (similarCount < 5) {
      return `Du bist nicht allein. ${similarCount} Menschen haben ähnliche Erfahrungen geteilt.`
    }

    if (similarCount < 10) {
      return `Du gehörst zu einer wachsenden Gemeinschaft von ${similarCount} Menschen mit ähnlichen Erfahrungen.`
    }

    return `Du bist Teil einer Gemeinschaft: ${similarCount} Menschen teilen ähnliche Erfahrungen.`
  }

  const getEmotionalTone = () => {
    if (category === 'near-death-experience') {
      return 'Danke, dass du deine tiefgreifende Erfahrung mit uns teilst.'
    }
    if (category === 'ufo-uap') {
      return 'Deine Beobachtung ist wertvoll für unser gemeinsames Verständnis.'
    }
    if (category === 'synchronicity') {
      return 'Jede Synchronizität erweitert unser Verständnis von Verbundenheit.'
    }
    if (category === 'precognition') {
      return 'Deine Vorahnung ist nun dokumentiert und mit anderen verbunden.'
    }
    return 'Deine Erfahrung bereichert unser kollektives Wissen.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-12 text-center backdrop-blur-sm border ${theme.borderColor}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Large Emoji Hero */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-6 text-8xl"
        >
          {theme.heroEmoji}
        </motion.div>

        {/* Main Validation Message */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 text-4xl font-bold text-white"
        >
          Deine Erfahrung ist jetzt live
        </motion.h1>

        {/* Emotional Validation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6 space-y-2"
        >
          <p className="text-xl text-white/90 font-medium flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-pink-400 fill-pink-400" />
            {getValidationMessage()}
          </p>
          <p className="text-lg text-white/70">
            {getEmotionalTone()}
          </p>
        </motion.div>

        {/* Stats Grid */}
        {similarCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Similar Experiences */}
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-3xl font-bold text-white">{similarCount}</span>
                </div>
                <p className="text-sm text-white/70">Ähnliche Erfahrungen</p>
              </div>

              {/* Location */}
              {location?.city && (
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <span className="text-lg font-bold text-white">{location.city}</span>
                  </div>
                  <p className="text-sm text-white/70">
                    {isFirstInLocation ? 'Erste Meldung hier' : 'Deine Region'}
                  </p>
                </div>
              )}

              {/* Recent Activity */}
              {recentCount > 0 && (
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <span className="text-3xl font-bold text-white">{recentCount}</span>
                  </div>
                  <p className="text-sm text-white/70">In letzten 7 Tagen</p>
                </div>
              )}
            </div>

            {/* Geographic Breakdown - NEW! */}
            {geographicBreakdown && location?.city && (
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm border border-emerald-500/30 p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Geografische Verteilung</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      {geographicBreakdown.inCity}
                    </div>
                    <div className="text-xs text-white/60">in {location.city}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                      {geographicBreakdown.inCountry}
                    </div>
                    <div className="text-xs text-white/60">in {location.country || 'Land'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {geographicBreakdown.global}
                    </div>
                    <div className="text-xs text-white/60">weltweit</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Breakdown by Attributes */}
            {attributeBreakdowns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Detaillierte Aufschlüsselung
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {attributeBreakdowns.map((breakdown, index) => (
                    <motion.div
                      key={breakdown.attribute}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-3 hover:border-white/40 transition-all"
                    >
                      <div className="text-2xl mb-1">{breakdown.icon}</div>
                      <div className="text-xl font-bold text-white mb-0.5">
                        {breakdown.count}
                      </div>
                      <div className="text-xs text-white/60 leading-tight">
                        {breakdown.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
        >
          <span className="text-2xl">{theme.heroEmoji}</span>
          <span className={`font-medium ${theme.accentColor}`}>{categoryLabel}</span>
        </motion.div>
      </div>

      {/* Animated Glow Effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-2xl ${theme.glowColor} blur-3xl -z-10`}
      />
    </motion.div>
  )
}
