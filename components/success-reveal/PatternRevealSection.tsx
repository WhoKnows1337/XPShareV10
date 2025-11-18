'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Activity } from 'lucide-react'
import { WaveAlertCard } from '@/components/submit-observatory/success/WaveAlertCard'
import { TemporalPatternCard } from '@/components/submit-observatory/success/TemporalPatternCard'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface PatternData {
  type: 'wave' | 'temporal' | 'correlation'
  data: any
}

interface PatternRevealSectionProps {
  category: string
  patterns: PatternData[]
  similarCount: number
}

export function PatternRevealSection({
  category,
  patterns,
  similarCount,
}: PatternRevealSectionProps) {
  const theme = getCategoryTheme(category)

  if (patterns.length === 0) return null

  const wavePattern = patterns.find((p) => p.type === 'wave')
  const temporalPattern = patterns.find((p) => p.type === 'temporal')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Activity className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">You're Part of a Bigger Picture</h2>
      </div>

      {/* Intro Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="text-white/70"
      >
        Your experience matches a pattern of {similarCount} similar{' '}
        {similarCount === 1 ? 'sighting' : 'sightings'} across the network.
      </motion.p>

      {/* Pattern Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Wave/Geographic Pattern */}
        {wavePattern && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <WaveAlertCard {...wavePattern.data} />
          </motion.div>
        )}

        {/* Temporal Pattern */}
        {temporalPattern && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <TemporalPatternCard {...temporalPattern.data} />
          </motion.div>
        )}
      </div>

      {/* Pattern Stats Summary */}
      {similarCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className={`mt-6 rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Count */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-white">{similarCount}</div>
              <div className="text-sm text-white/60">Total in Pattern</div>
            </div>

            {/* Location Cluster */}
            {wavePattern?.data?.location && (
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-white">
                  {wavePattern.data.count}
                </div>
                <div className="text-sm text-white/60">{wavePattern.data.location}</div>
              </div>
            )}

            {/* Temporal Peak */}
            {temporalPattern?.data?.period && (
              <div className="text-center">
                <div className={`mb-1 text-3xl font-bold ${theme.accentColor}`}>
                  {temporalPattern.data.period}
                </div>
                <div className="text-sm text-white/60">Peak Activity</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        <button
          className={`group flex items-center gap-2 rounded-full border ${theme.borderColor} bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 hover:${theme.glowColor}`}
        >
          <TrendingUp className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          Explore Full Pattern
        </button>
      </motion.div>
    </motion.div>
  )
}
