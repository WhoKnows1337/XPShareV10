'use client'

import { motion } from 'framer-motion'
import { Waves, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface TemporalWaveCardProps {
  type: 'temporal_wave'
  title: string
  cycle_months: number
  cycle_years: number
  count: number
  peak_dates: string[]
  description: string
}

export function TemporalWaveCard({
  title,
  cycle_months,
  cycle_years,
  count,
  peak_dates,
  description,
}: TemporalWaveCardProps) {
  const displayPeaks = peak_dates?.slice(0, 3).map((date) => {
    try {
      return format(new Date(date), 'MMM yyyy')
    } catch {
      return date
    }
  }) || []

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-violet-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2.5">
              <Waves className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
          <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-bold text-indigo-400">
            {count}
          </div>
        </div>

        {/* Cycle Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-indigo-950/30 p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-indigo-400">
              {cycle_years}
            </div>
            <div className="text-xs text-white/50">Year Cycle</div>
          </div>
          <div className="rounded-lg bg-indigo-950/30 p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-indigo-400">
              {cycle_months}
            </div>
            <div className="text-xs text-white/50">Months</div>
          </div>
        </div>

        {/* Peak Dates */}
        {displayPeaks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/40">
              <Calendar className="h-3.5 w-3.5" />
              Peak Activity Dates
            </div>
            <div className="space-y-2">
              {displayPeaks.map((peak, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2"
                >
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-200">
                    {peak}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wave Visualization */}
        <div className="pt-2">
          <div className="relative h-16 overflow-hidden rounded-lg bg-indigo-950/30">
            {/* Animated Wave */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 64"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0,32 Q50,16 100,32 T200,32 T300,32 T400,32"
                stroke="url(#waveGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-2 text-center text-xs text-white/40">
            Cyclical Pattern Detected
          </div>
        </div>

        {/* Prediction Indicator */}
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Waves className="h-3.5 w-3.5" />
            Next peak expected in ~{cycle_years} years
          </div>
        </div>
      </div>
    </motion.div>
  )
}
