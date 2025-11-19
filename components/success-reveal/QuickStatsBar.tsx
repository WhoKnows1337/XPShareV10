'use client'

import { motion } from 'framer-motion'

interface QuickStatsBarProps {
  similarCount: number
  citiesCount: number
  recentCount: number
  avgMatch: number
}

export function QuickStatsBar({
  similarCount,
  citiesCount,
  recentCount,
  avgMatch,
}: QuickStatsBarProps) {
  const stats = [
    {
      value: similarCount,
      label: 'Similar Experiences',
      icon: '📊',
    },
    {
      value: citiesCount,
      label: 'Cities',
      icon: '📍',
    },
    {
      value: recentCount,
      label: 'Last 30 Days',
      icon: '🕐',
    },
    {
      value: `${avgMatch}%`,
      label: 'Avg Match',
      icon: '🎯',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex items-center justify-center gap-4 sm:gap-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
    >
      {stats.map((stat, index) => (
        <div key={stat.label}>
          {index > 0 && (
            <div className="hidden sm:block absolute h-8 w-px bg-white/10" style={{ left: -12 }} />
          )}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 whitespace-nowrap">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
