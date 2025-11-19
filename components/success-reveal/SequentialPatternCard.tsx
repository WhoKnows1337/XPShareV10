'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, Calendar } from 'lucide-react'

interface SequentialPatternCardProps {
  type: 'sequential'
  title: string
  pattern: string
  count: number
  avg_gap_days: number
  description: string
}

export function SequentialPatternCard({
  title,
  pattern,
  count,
  avg_gap_days,
  description,
}: SequentialPatternCardProps) {
  const sequence = pattern.split('→').filter(Boolean)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-blue-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">⚡ Wellenmuster erkannt</h3>
              <p className="text-sm text-white/70">
                Ereignisse treten in Sequenzen auf
              </p>
            </div>
          </div>
          <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-400">
            {count}×
          </div>
        </div>

        {/* Sequence Visualization */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            Ereignissequenz
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sequence.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
                  {step.trim()}
                </div>
                {idx < sequence.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-cyan-500/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timing Info */}
        <div className="flex items-center gap-2 rounded-lg bg-cyan-950/30 p-4">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              Durchschnittlicher Abstand: {avg_gap_days} Tage
            </div>
            <div className="text-xs text-white/60 mt-1">
              💡 Nächste Welle erwartet: ~{avg_gap_days} Tage nach deiner Erfahrung
            </div>
          </div>
        </div>

        {/* Pattern Strength */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cyan-950/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, count * 25)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              />
            </div>
            <span className="text-xs text-white/40">Zuverlässigkeit</span>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="text-sm text-cyan-300">
              📊 {count} dokumentierte Sequenzen bestätigen dieses Muster
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
