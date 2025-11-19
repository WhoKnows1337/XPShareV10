'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, MapPin, TrendingUp, Sparkles, Users } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface ImpactMetrics {
  // Real metrics
  similarExperiencesCount: number
  geographicRank?: {
    position: number
    location: string
    totalInLocation: number
  }
  patternContributions: {
    type: string
    impact: string
  }[]
  uniqueAttributes?: string[]
  isFirstInLocation?: boolean
  // Breakthrough achievements
  patternBreakthrough?: {
    clusterName: string
    previousCount: number
    newCount: number
    significance: string
  }
  firstReporter?: {
    attributeCombination: string[]
    categoryImpact: string
  }
}

interface ConcreteImpactSummaryProps {
  category: string
  metrics: ImpactMetrics
}

export function ConcreteImpactSummary({ category, metrics }: ConcreteImpactSummaryProps) {
  const theme = getCategoryTheme(category)

  // Generate concrete achievement messages
  const achievements = []
  const highlights = [] // Special breakthrough highlights

  // 🎯 PATTERN BREAKTHROUGH (if exists)
  if (metrics.patternBreakthrough) {
    const { clusterName, previousCount, newCount, significance } = metrics.patternBreakthrough
    highlights.push({
      icon: '🎯',
      color: 'rainbow',
      title: 'PATTERN BREAKTHROUGH',
      description: `Dein Bericht vervollständigt das "${clusterName}" Cluster - jetzt haben wir ${newCount} Berichte, die ${significance}!`,
      metric: `${previousCount} → ${newCount} Berichte`,
      priority: 1,
    })
  }

  // 🏆 FIRST REPORTER (if exists)
  if (metrics.firstReporter) {
    const { attributeCombination, categoryImpact } = metrics.firstReporter
    highlights.push({
      icon: '🏆',
      color: 'gold',
      title: 'FIRST REPORTER',
      description: `Du bist die ERSTE Person, die diese Kombination meldet: "${attributeCombination.join(' + ')}"`,
      metric: categoryImpact,
      priority: 2,
    })
  }

  // Geographic Achievement
  if (metrics.isFirstInLocation && metrics.geographicRank?.location) {
    achievements.push({
      icon: MapPin,
      color: 'emerald',
      title: 'ERSTE MELDUNG',
      description: `Du bist die erste Person aus ${metrics.geographicRank.location}, die diese Erfahrung teilt`,
      metric: '🎯 Pioneer',
    })
  } else if (metrics.geographicRank) {
    const { position, location, totalInLocation } = metrics.geographicRank
    achievements.push({
      icon: MapPin,
      color: 'blue',
      title: `#${position} IN ${location.toUpperCase()}`,
      description: `${totalInLocation} Berichte aus deiner Region`,
      metric: `${totalInLocation} Meldungen`,
    })
  }

  // Pattern Contribution Achievement
  if (metrics.patternContributions.length > 0 && !metrics.patternBreakthrough) {
    const contribution = metrics.patternContributions[0]
    achievements.push({
      icon: TrendingUp,
      color: 'purple',
      title: 'PATTERN VERSTÄRKT',
      description: contribution.impact,
      metric: contribution.type,
    })
  }

  // Unique Contribution Achievement
  if (metrics.uniqueAttributes && metrics.uniqueAttributes.length > 0) {
    achievements.push({
      icon: Sparkles,
      color: 'amber',
      title: 'NEUE PERSPEKTIVE',
      description: `Du bringst ${metrics.uniqueAttributes.length} neue Aspekte ein: ${metrics.uniqueAttributes.slice(0, 2).join(', ')}`,
      metric: 'Neu entdeckt',
    })
  }

  // Community Size Achievement
  if (metrics.similarExperiencesCount > 0) {
    let communityMessage = ''
    if (metrics.similarExperiencesCount < 5) {
      communityMessage = 'Eine kleine, aber wachsende Gemeinschaft'
    } else if (metrics.similarExperiencesCount < 20) {
      communityMessage = 'Teil einer aktiven Gemeinschaft'
    } else if (metrics.similarExperiencesCount < 50) {
      communityMessage = 'Teil eines signifikanten Phänomens'
    } else {
      communityMessage = 'Teil eines weitverbreiteten Phänomens'
    }

    achievements.push({
      icon: Users,
      color: 'cyan',
      title: `${metrics.similarExperiencesCount} VERBINDUNGEN`,
      description: communityMessage,
      metric: `${metrics.similarExperiencesCount} ähnliche`,
    })
  }

  // Fallback if no achievements
  if (achievements.length === 0) {
    achievements.push({
      icon: Trophy,
      color: 'violet',
      title: 'PIONIER',
      description: 'Deine Erfahrung ist einzigartig und wertvoll',
      metric: 'Neu',
    })
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      glow: 'shadow-violet-500/20',
    },
    rainbow: {
      bg: 'bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10',
      border: 'border-purple-500/50',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/40',
    },
    gold: {
      bg: 'bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/50',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/40',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Trophy className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Dein Beitrag</h2>
      </div>

      {/* 🎯 BREAKTHROUGH HIGHLIGHTS (Priority Cards) */}
      {highlights.length > 0 && (
        <div className="space-y-4">
          {highlights.map((highlight, index) => {
            const colors = colorClasses[highlight.color]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.6, type: 'spring' }}
                className={`relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} p-8 backdrop-blur-sm shadow-2xl ${colors.glow}`}
              >
                {/* Animated Background Glow */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`absolute inset-0 ${colors.bg} blur-xl`}
                />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="text-6xl"
                    >
                      {highlight.icon}
                    </motion.div>

                    <div className="flex-1 space-y-2">
                      <motion.h3
                        animate={{
                          textShadow: [
                            '0 0 20px rgba(255,255,255,0.3)',
                            '0 0 30px rgba(255,255,255,0.5)',
                            '0 0 20px rgba(255,255,255,0.3)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className={`text-3xl font-black uppercase tracking-tight ${colors.text}`}
                      >
                        {highlight.title}
                      </motion.h3>

                      <p className="text-lg leading-relaxed text-white/90">
                        {highlight.description}
                      </p>

                      <div className={`inline-flex items-center gap-2 rounded-full border ${colors.border} ${colors.bg} px-4 py-2 backdrop-blur-sm`}>
                        <Sparkles className={`h-4 w-4 ${colors.text}`} />
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {highlight.metric}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full ${colors.bg} blur-3xl opacity-50`} />
                <div className={`absolute -bottom-12 -left-12 h-32 w-32 rounded-full ${colors.bg} blur-3xl opacity-50`} />
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Achievement Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon
          const colors = colorClasses[achievement.color]

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.15, duration: 0.5 }}
              className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm hover:shadow-lg ${colors.glow} transition-shadow duration-300`}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Icon & Title */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                      <span className={`text-xs font-bold tracking-wider ${colors.text}`}>
                        {achievement.title}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {/* Metric Badge */}
                <div className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} ${colors.border} border px-3 py-1`}>
                  <Target className={`h-3.5 w-3.5 ${colors.text}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {achievement.metric}
                  </span>
                </div>
              </div>

              {/* Corner Accent */}
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${colors.bg} blur-2xl`} />
            </motion.div>
          )
        })}
      </div>

      {/* Overall Impact Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-3">
            <Sparkles className={`h-6 w-6 ${theme.accentColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Wissenschaftlicher Wert: {metrics.uniqueAttributes && metrics.uniqueAttributes.length > 2 ? 'Hoch' : 'Mittel'}
            </h3>
            <p className="text-sm text-white/70">
              Deine detaillierte Dokumentation ermöglicht Korrelationen und Mustererkennung
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
