'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Activity } from 'lucide-react'
import { WitnessNetworkCard } from './WitnessNetworkCard'
import { SequentialPatternCard } from './SequentialPatternCard'
import { UserConnectionCard } from './UserConnectionCard'
import { LocationChainCard } from './LocationChainCard'
import { TemporalWaveCard } from './TemporalWaveCard'
import { TagSequenceCard } from './TagSequenceCard'
import { TagNetworkCard } from './TagNetworkCard'
import { CrossCategoryCard } from './CrossCategoryCard'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface PatternData {
  type:
    | 'geographic'
    | 'temporal'
    | 'tag_network'
    | 'cross_category'
    | 'witness_network'
    | 'sequential'
    | 'user_connection'
    | 'location_chain'
    | 'temporal_wave'
    | 'tag_sequence'
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

  // Render pattern card based on type
  const renderPatternCard = (pattern: PatternData, index: number) => {
    const baseDelay = 1.2 + index * 0.2
    const xOffset = index % 2 === 0 ? -20 : 20

    const cardProps = {
      initial: { opacity: 0, x: xOffset },
      animate: { opacity: 1, x: 0 },
      transition: { delay: baseDelay, duration: 0.5 },
    }

    switch (pattern.type) {
      case 'geographic':
        // Use LocationChainCard as fallback for geographic patterns
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <LocationChainCard {...pattern.data} />
          </motion.div>
        )
      case 'temporal':
        // Use TemporalWaveCard for temporal patterns
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <TemporalWaveCard {...pattern.data} />
          </motion.div>
        )
      case 'tag_network':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <TagNetworkCard {...pattern.data} />
          </motion.div>
        )
      case 'cross_category':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <CrossCategoryCard {...pattern.data} />
          </motion.div>
        )
      case 'witness_network':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <WitnessNetworkCard {...pattern.data} />
          </motion.div>
        )
      case 'sequential':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <SequentialPatternCard {...pattern.data} />
          </motion.div>
        )
      case 'user_connection':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <UserConnectionCard {...pattern.data} />
          </motion.div>
        )
      case 'location_chain':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <LocationChainCard {...pattern.data} />
          </motion.div>
        )
      case 'temporal_wave':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <TemporalWaveCard {...pattern.data} />
          </motion.div>
        )
      case 'tag_sequence':
        return (
          <motion.div key={`${pattern.type}-${index}`} {...cardProps}>
            <TagSequenceCard {...pattern.data} />
          </motion.div>
        )
      default:
        return null
    }
  }

  // Count total patterns across all types
  const totalPatternCount = patterns.reduce((sum, p) => sum + (p.data?.count || 0), 0)

  // Scroll to follow-up actions section
  const handleExplorePattern = () => {
    const followUpSection = document.getElementById('follow-up-actions')
    if (followUpSection) {
      followUpSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
        Your experience matches <span className="font-bold text-white">{patterns.length}</span>{' '}
        {patterns.length === 1 ? 'pattern' : 'patterns'} across the network.
      </motion.p>

      {/* Pattern Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {patterns.map((pattern, index) => renderPatternCard(pattern, index))}
      </div>

      {/* Pattern Stats Summary */}
      {totalPatternCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className={`mt-6 rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Patterns */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-white">{patterns.length}</div>
              <div className="text-sm text-white/60">Pattern Types</div>
            </div>

            {/* Total Connections */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-white">{totalPatternCount}</div>
              <div className="text-sm text-white/60">Total Connections</div>
            </div>

            {/* Similarity */}
            {similarCount > 0 && (
              <div className="text-center">
                <div className={`mb-1 text-3xl font-bold ${theme.accentColor}`}>
                  {similarCount}
                </div>
                <div className="text-sm text-white/60">Similar Experiences</div>
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
          onClick={handleExplorePattern}
          className={`group flex items-center gap-2 rounded-full border ${theme.borderColor} bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 hover:shadow-lg hover:shadow-${theme.accentColor}/20`}
        >
          <TrendingUp className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          Explore Full Pattern
        </button>
      </motion.div>
    </motion.div>
  )
}
