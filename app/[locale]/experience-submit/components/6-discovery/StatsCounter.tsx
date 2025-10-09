'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { DiscoveryStats } from '@/lib/stores/experienceSubmitStore'
import { TrendingUp, Globe, BarChart3 } from 'lucide-react'

interface StatsCounterProps {
  stats: DiscoveryStats
}

export const StatsCounter = ({ stats }: StatsCounterProps) => {
  const [counters, setCounters] = useState({
    totalSimilar: 0,
    globalCategoryCount: 0,
    averageMatchScore: 0,
  })

  // Animated counting effect
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const interval = duration / steps

    const timer = setInterval(() => {
      setCounters((prev) => ({
        totalSimilar: Math.min(
          prev.totalSimilar + Math.ceil(stats.totalSimilar / steps),
          stats.totalSimilar
        ),
        globalCategoryCount: Math.min(
          prev.globalCategoryCount + Math.ceil(stats.globalCategoryCount / steps),
          stats.globalCategoryCount
        ),
        averageMatchScore: Math.min(
          prev.averageMatchScore + Math.ceil(stats.averageMatchScore / steps),
          stats.averageMatchScore
        ),
      }))
    }, interval)

    setTimeout(() => {
      clearInterval(timer)
      setCounters({
        totalSimilar: stats.totalSimilar,
        globalCategoryCount: stats.globalCategoryCount,
        averageMatchScore: stats.averageMatchScore,
      })
    }, duration)

    return () => clearInterval(timer)
  }, [stats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Similar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Ähnliche Erfahrungen</h3>
        </div>
        <p className="text-4xl font-bold text-purple-600 mb-2">
          {counters.totalSimilar.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">wurden gefunden</p>
      </motion.div>

      {/* Global Category Count */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Global in Kategorie</h3>
        </div>
        <p className="text-4xl font-bold text-blue-600 mb-2">
          {counters.globalCategoryCount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">Erfahrungen weltweit</p>
      </motion.div>

      {/* Average Match Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Durchschnitt Match</h3>
        </div>
        <p className="text-4xl font-bold text-green-600 mb-2">
          {counters.averageMatchScore}%
        </p>
        <p className="text-sm text-gray-600">Übereinstimmung</p>
      </motion.div>
    </div>
  )
}
