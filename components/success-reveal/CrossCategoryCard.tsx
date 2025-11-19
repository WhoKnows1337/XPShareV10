'use client'

import { motion } from 'framer-motion'
import { Grid3x3, ArrowLeftRight, TrendingUp } from 'lucide-react'

interface CrossCategoryCardProps {
  type: 'cross_category'
  title: string
  categories: [string, string]
  count: number
  description: string
}

export function CrossCategoryCard({
  title,
  categories,
  count,
  description,
}: CrossCategoryCardProps) {
  const [category1, category2] = categories || ['', '']

  // Category emoji mapping
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      ufo: '🛸',
      paranormal: '👻',
      dreams: '💭',
      synchronicity: '✨',
      psychedelic: '🍄',
      nde: '🌟',
      meditation: '🧘',
      'astral-projection': '🌌',
      'time-anomaly': '⏰',
      entity: '👽',
      energy: '⚡',
      other: '❓',
    }
    return emojiMap[category] || '🔮'
  }

  const formatCategory = (category: string) => {
    return category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 to-purple-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fuchsia-500/10 p-2.5">
              <Grid3x3 className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
          <div className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-sm font-bold text-fuchsia-400">
            {count}
          </div>
        </div>

        {/* Category Connection */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            Category Overlap
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Category 1 */}
            <div className="flex-1 rounded-lg border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-4">
              <div className="text-center">
                <div className="mb-2 text-3xl">{getCategoryEmoji(category1)}</div>
                <div className="text-sm font-medium text-fuchsia-200">
                  {formatCategory(category1)}
                </div>
              </div>
            </div>

            {/* Overlap Indicator */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="rounded-full bg-fuchsia-500/20 p-2"
              >
                <ArrowLeftRight className="h-5 w-5 text-fuchsia-400" />
              </motion.div>
              <div className="text-xs font-bold text-fuchsia-400">{count}</div>
            </div>

            {/* Category 2 */}
            <div className="flex-1 rounded-lg border border-fuchsia-500/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-4">
              <div className="text-center">
                <div className="mb-2 text-3xl">{getCategoryEmoji(category2)}</div>
                <div className="text-sm font-medium text-fuchsia-200">
                  {formatCategory(category2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlap Visualization */}
        <div className="relative h-3 overflow-hidden rounded-full bg-fuchsia-950/30">
          <div className="absolute inset-0 flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-fuchsia-500/50"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-purple-500/50"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="absolute inset-x-1/3 inset-y-0 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-fuchsia-500"
          />
        </div>

        {/* Stats */}
        <div className="rounded-lg bg-fuchsia-950/30 p-3 text-center">
          <div className="text-lg font-bold text-fuchsia-400">{count}</div>
          <div className="text-xs text-white/50">
            Experiences span both categories
          </div>
        </div>

        {/* Insight */}
        <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/20 p-3">
          <div className="flex items-center gap-2 text-xs text-fuchsia-300">
            <TrendingUp className="h-3.5 w-3.5" />
            These categories often intersect in unique ways
          </div>
        </div>
      </div>
    </motion.div>
  )
}
