'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation, ArrowRight } from 'lucide-react'

interface LocationChainCardProps {
  type: 'location_chain'
  title: string
  chain_length: number
  locations: string[]
  time_span_days: number
  description: string
}

export function LocationChainCard({
  title,
  chain_length,
  locations,
  time_span_days,
  description,
}: LocationChainCardProps) {
  const displayLocations = locations?.slice(0, 4) || []
  const remainingCount = Math.max(0, (locations?.length || 0) - 4)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-teal-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <Navigation className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">📍 Geografisches Muster</h3>
              <p className="text-sm text-white/70">{chain_length} Berichte aus verschiedenen Orten</p>
            </div>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-400">
            {chain_length}
          </div>
        </div>

        {/* Location Chain */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            Migration Path
          </div>
          <div className="space-y-2">
            {displayLocations.map((location, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-200">
                      <MapPin className="h-3.5 w-3.5" />
                      {location}
                    </div>
                  </div>
                </div>
                {idx < displayLocations.length - 1 && (
                  <div className="ml-4 h-4 border-l-2 border-dashed border-emerald-500/20" />
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="ml-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-sm text-emerald-300">
                + {remainingCount} more locations
              </div>
            )}
          </div>
        </div>

        {/* Timeline Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-950/30 p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">
              {time_span_days}
            </div>
            <div className="text-xs text-white/50">Days</div>
          </div>
          <div className="rounded-lg bg-emerald-950/30 p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">
              {chain_length > 1 ? Math.round(time_span_days / (chain_length - 1)) : 0}
            </div>
            <div className="text-xs text-white/50">Avg. per Move</div>
          </div>
        </div>

        {/* Movement Indicator */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-950/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
          <span className="text-xs text-white/40">Migration Complete</span>
        </div>
      </div>
    </motion.div>
  )
}
