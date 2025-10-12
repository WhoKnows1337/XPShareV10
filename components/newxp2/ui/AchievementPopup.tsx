'use client'

import { motion } from 'framer-motion'
import { Achievement } from '@/lib/stores/newxp2Store'
import { Trophy } from 'lucide-react'

interface AchievementPopupProps {
  achievement: Achievement
}

export function AchievementPopup({ achievement }: AchievementPopupProps) {
  return (
    <motion.div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
              Achievement Unlocked!
            </p>
            <h3 className="text-white font-bold text-lg">
              {achievement.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm mb-3">
          {achievement.description}
        </p>

        {/* XP Reward */}
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
          <span className="text-white/80 text-sm">Reward</span>
          <span className="text-yellow-300 font-bold">+{achievement.xp} XP</span>
        </div>

        {/* Icon */}
        <motion.div
          className="absolute -top-4 -right-4 text-6xl"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          {achievement.icon}
        </motion.div>
      </div>
    </motion.div>
  )
}
