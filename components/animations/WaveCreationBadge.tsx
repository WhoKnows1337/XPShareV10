'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

interface WaveCreationBadgeProps {
  patternName: string
  matchCount: number
  category: string
}

export function WaveCreationBadge({ patternName, matchCount, category }: WaveCreationBadgeProps) {
  const categoryEmojis: Record<string, string> = {
    ufo: '🛸',
    paranormal: '👻',
    dreams: '💭',
    psychedelic: '🌈',
    spiritual: '✨',
    synchronicity: '🔮',
    nde: '💫',
    other: '🌟',
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          {/* Animated Wave Icon */}
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
              🌊
            </div>
            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-900">Wave beigetreten!</h3>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              Deine Erfahrung passt zum <span className="font-semibold">&quot;{patternName}&quot;</span> Muster
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {categoryEmojis[category] || '🌟'} {matchCount} ähnliche Erfahrungen
              </Badge>
              <Badge variant="outline" className="border-purple-300 text-purple-600">
                +50 XP Bonus
              </Badge>
            </div>
          </div>
        </div>

        {/* Particle Animation */}
        <div className="relative h-2 mt-4 overflow-hidden rounded-full bg-purple-200">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </div>
      </Card>
    </motion.div>
  )
}
