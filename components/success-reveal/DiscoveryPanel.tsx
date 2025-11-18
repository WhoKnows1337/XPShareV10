'use client'

import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getCategoryLabel } from '@/lib/constants/categories'
import { useEffect, useState } from 'react'

interface DiscoveryPanelProps {
  category: string
  attributes: string[]
  aiConfidence?: number
  location?: {
    city?: string
    country?: string
  }
  dateOccurred: string
  subtitle?: string
}

export function DiscoveryPanel({
  category,
  attributes,
  aiConfidence = 95,
  location,
  dateOccurred,
  subtitle,
}: DiscoveryPanelProps) {
  const theme = getCategoryTheme(category)
  const categoryLabel = getCategoryLabel(category)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Delay content reveal for better animation sequence
    const timer = setTimeout(() => setShowContent(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const confidenceLevel =
    aiConfidence >= 90 ? 'Very High' : aiConfidence >= 75 ? 'High' : 'Moderate'

  const confidenceColor =
    aiConfidence >= 90
      ? 'text-emerald-400'
      : aiConfidence >= 75
        ? 'text-blue-400'
        : 'text-yellow-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">What We Discovered</h2>
      </div>

      {/* Subtitle with Typewriter Effect */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mb-8 text-white/70"
      >
        {subtitle ||
          'Your experience has been analyzed and connected to the global consciousness map.'}
      </motion.p>

      {/* AI Analysis Box */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`mb-6 rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white/90">AI Analysis</h3>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white/60">Scan Complete</span>
            </div>
          </div>

          {/* Category Detection */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Category:</span>
              <span className={`font-semibold ${theme.accentColor}`}>{categoryLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Confidence:</span>
              <span className={`font-semibold ${confidenceColor}`}>
                {confidenceLevel} ({aiConfidence}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiConfidence}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${
                aiConfidence >= 90
                  ? 'from-emerald-500 to-green-400'
                  : aiConfidence >= 75
                    ? 'from-blue-500 to-cyan-400'
                    : 'from-yellow-500 to-orange-400'
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* Key Attributes */}
      {showContent && attributes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <h4 className="mb-3 text-sm font-medium text-white/70">Key Attributes Detected:</h4>
          <div className="flex flex-wrap gap-2">
            {attributes.slice(0, 8).map((attr, index) => (
              <motion.span
                key={attr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                className={`rounded-full border ${theme.borderColor} bg-white/5 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm`}
              >
                {attr}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Location & Time */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-2 border-t border-white/10 pt-4 text-sm text-white/60"
        >
          {location && (location.city || location.country) && (
            <div>
              <span className="font-medium text-white/70">Location: </span>
              {[location.city, location.country].filter(Boolean).join(', ')}
            </div>
          )}
          <div>
            <span className="font-medium text-white/70">Date: </span>
            {new Date(dateOccurred).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
