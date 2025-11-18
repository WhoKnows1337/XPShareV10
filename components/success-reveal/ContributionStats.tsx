'use client'

import { motion } from 'framer-motion'
import { Heart, TrendingUp, CheckCircle2, Lightbulb } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import type { ContributionMetrics } from '@/lib/utils/contribution-calculator'

interface ContributionStatsProps {
  category: string
  metrics: ContributionMetrics
}

export function ContributionStats({ category, metrics }: ContributionStatsProps) {
  const theme = getCategoryTheme(category)
  const { messages, stats, highlights } = metrics

  // Always show at least a baseline message
  const displayMessages = messages.length > 0
    ? messages
    : ["You've contributed to the collective knowledge base."]

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
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart className={`h-6 w-6 ${theme.accentColor}`} fill="currentColor" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Why Your Story Matters</h2>
      </div>

      {/* Contribution Messages */}
      <div className="space-y-4">
        {displayMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 + index * 0.15, duration: 0.5 }}
            className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
          >
            <CheckCircle2 className={`mt-0.5 h-5 w-5 flex-shrink-0 ${theme.accentColor}`} />
            <p className="text-white/90">{message}</p>
          </motion.div>
        ))}
      </div>

      {/* Impact Metrics */}
      {stats.patternImpact && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className={`h-6 w-6 ${theme.accentColor}`} />
              <div>
                <div className="text-sm text-white/60">Your Contribution</div>
                <div className={`text-2xl font-bold ${theme.accentColor}`}>
                  {stats.patternImpact}
                </div>
              </div>
            </div>
            <TrendingUp className={`h-12 w-12 ${theme.accentColor} opacity-30`} />
          </div>
        </motion.div>
      )}

      {/* Highlights Grid */}
      {Object.values(highlights).some(Boolean) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {highlights.isFirstInArea && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="rounded-full bg-emerald-500/20 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-400">First in Area</span>
            </div>
          )}

          {highlights.isPartOfCluster && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-400">Part of Cluster</span>
            </div>
          )}

          {highlights.strengthensPattern && (
            <div className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-400">Strengthens Pattern</span>
            </div>
          )}

          {highlights.providesNewEvidence && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <div className="rounded-full bg-yellow-500/20 p-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-yellow-400">New Evidence</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
