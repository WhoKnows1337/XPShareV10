'use client'

import { motion } from 'framer-motion'
import { Heart, Users, MapPin, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ValidationHeroProps {
  similarCount: number
  category: string
  location?: string
  recentCount?: number // Similar in last 7 days
  nearbyCount?: number // Similar in region
  onExploreClick?: () => void
  experienceId?: string
}

const categoryEmojis: Record<string, string> = {
  'ufo-uap': '🛸',
  'ufo': '🛸',
  'paranormal': '👻',
  'ghost': '👻',
  'dreams': '💭',
  'lucid-dreams': '💭',
  'psychedelic': '🌈',
  'spiritual': '✨',
  'synchronicity': '🔮',
  'near-death-experience': '💫',
  'nde': '💫',
  'precognition': '🔮',
  'other': '🌟',
}

const categoryGradients: Record<string, string> = {
  'ufo-uap': 'from-indigo-600/20 via-purple-600/20 to-blue-600/20',
  'ufo': 'from-indigo-600/20 via-purple-600/20 to-blue-600/20',
  'paranormal': 'from-purple-600/20 via-pink-600/20 to-red-600/20',
  'ghost': 'from-purple-600/20 via-pink-600/20 to-red-600/20',
  'dreams': 'from-blue-600/20 via-cyan-600/20 to-teal-600/20',
  'spiritual': 'from-amber-600/20 via-yellow-600/20 to-orange-600/20',
  'synchronicity': 'from-emerald-600/20 via-teal-600/20 to-cyan-600/20',
  'nde': 'from-rose-600/20 via-pink-600/20 to-purple-600/20',
  'other': 'from-slate-600/20 via-gray-600/20 to-zinc-600/20',
}

export function ValidationHero({
  similarCount,
  category,
  location,
  recentCount = 0,
  nearbyCount = 0,
  onExploreClick,
  experienceId,
}: ValidationHeroProps) {
  const emoji = categoryEmojis[category] || '🌟'
  const gradient = categoryGradients[category] || categoryGradients['other']

  // Generate message based on similar count
  const getMessage = () => {
    if (similarCount === 0) {
      return {
        headline: 'Deine Erfahrung ist einzigartig',
        subline: 'Du bist der Erste, der diese Art von Erfahrung teilt.',
      }
    }
    if (similarCount === 1) {
      return {
        headline: 'Du bist nicht allein',
        subline: 'Eine andere Person hat eine ähnliche Erfahrung geteilt.',
      }
    }
    if (similarCount < 10) {
      return {
        headline: 'Du bist nicht allein',
        subline: `${similarCount} Menschen teilen ähnliche Erfahrungen.`,
      }
    }
    if (similarCount < 50) {
      return {
        headline: 'Du bist nicht allein',
        subline: `${similarCount} Menschen weltweit teilen ähnliche Erfahrungen.`,
      }
    }
    return {
      headline: 'Du bist Teil einer Gemeinschaft',
      subline: `${similarCount}+ Menschen haben Ähnliches erlebt.`,
    }
  }

  const { headline, subline } = getMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/10`}
    >
      {/* Animated Background Glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
      />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 text-center">
        {/* Emoji Hero */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <span className="text-5xl md:text-6xl">{emoji}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl md:text-4xl font-bold text-foreground mb-2"
        >
          {headline}
        </motion.h1>

        {/* Subline with Heart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-2 text-lg md:text-xl text-muted-foreground mb-6"
        >
          <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
          <span>{subline}</span>
        </motion.div>

        {/* Stats Row */}
        {similarCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6"
          >
            {/* Similar Count */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">
                <span className="text-xl font-bold text-foreground">{similarCount}</span>
                <span className="text-muted-foreground ml-1">ähnliche</span>
              </span>
            </div>

            {/* Nearby Count */}
            {nearbyCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">
                  <span className="text-xl font-bold text-foreground">{nearbyCount}</span>
                  <span className="text-muted-foreground ml-1">in der Nähe</span>
                </span>
              </div>
            )}

            {/* Recent Count */}
            {recentCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">
                  <span className="text-xl font-bold text-foreground">{recentCount}</span>
                  <span className="text-muted-foreground ml-1">diese Woche</span>
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {experienceId ? (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Link href={`#similar-experiences`}>
                <Sparkles className="h-4 w-4" />
                Verbindungen entdecken
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : onExploreClick ? (
            <Button
              onClick={onExploreClick}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Verbindungen entdecken
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </motion.div>

        {/* Location Tag */}
        {location && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            📍 {location}
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full opacity-50" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full opacity-50" />
    </motion.div>
  )
}
