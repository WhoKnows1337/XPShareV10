'use client'

import { motion } from 'framer-motion'
import { Trophy, Zap, Award } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getLevelTitle } from '@/lib/utils/xp-calculator'

interface RewardsCompactProps {
  category: string
  xpEarned: number
  badgesEarned: string[]
  leveledUp: boolean
  newLevel?: number
  currentLevel: number
}

export function RewardsCompact({
  category,
  xpEarned,
  badgesEarned,
  leveledUp,
  newLevel,
  currentLevel,
}: RewardsCompactProps) {
  const theme = getCategoryTheme(category)
  const levelTitle = getLevelTitle(newLevel || currentLevel)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0, duration: 0.6 }}
      className="space-y-4"
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="flex items-center gap-3" suppressHydrationWarning>
        <Trophy className={`h-6 w-6 ${theme.accentColor}`} />
        <h2 className="text-2xl font-bold text-white">Rewards Earned</h2>
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* XP Earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-5 text-center backdrop-blur-sm`}
        >
          <Zap className={`mx-auto mb-2 h-8 w-8 ${theme.accentColor}`} />
          <div className={`text-3xl font-bold ${theme.accentColor}`}>+{xpEarned}</div>
          <div className="text-sm text-white/60">XP Earned</div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.3, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-5 text-center backdrop-blur-sm`}
        >
          <Award className={`mx-auto mb-2 h-8 w-8 ${theme.accentColor}`} />
          <div className={`text-3xl font-bold ${theme.accentColor}`}>
            {badgesEarned.length > 0 ? badgesEarned.length : '—'}
          </div>
          <div className="text-sm text-white/60">
            {badgesEarned.length === 1 ? 'Badge Earned' : 'Badges Earned'}
          </div>
        </motion.div>

        {/* Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-5 text-center backdrop-blur-sm ${
            leveledUp ? 'ring-2 ring-yellow-500/50' : ''
          }`}
        >
          <Trophy className={`mx-auto mb-2 h-8 w-8 ${leveledUp ? 'text-yellow-400' : theme.accentColor}`} />
          <div className={`text-3xl font-bold ${leveledUp ? 'text-yellow-400' : theme.accentColor}`}>
            {newLevel || currentLevel}
          </div>
          <div className="text-sm text-white/60">
            {leveledUp ? '🎉 Level Up!' : levelTitle}
          </div>
        </motion.div>
      </div>

      {/* Badge Names (if any) */}
      {badgesEarned.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.5 }}
          className={`rounded-xl border ${theme.borderColor} bg-white/5 p-4 backdrop-blur-sm`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/60">New Badges:</span>
            {badgesEarned.map((badge, index) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.7 + index * 0.1, duration: 0.3 }}
                className={`rounded-full border ${theme.borderColor} bg-gradient-to-r ${theme.gradient} px-3 py-1 text-sm font-medium text-white`}
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Level Up Message */}
      {leveledUp && newLevel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.5 }}
          className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 p-4 text-center backdrop-blur-sm"
        >
          <div className="text-lg font-semibold text-yellow-400">
            🎊 Congratulations! You're now a {getLevelTitle(newLevel)}!
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
