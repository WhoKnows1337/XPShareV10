'use client'

import { motion } from 'framer-motion'
import { Users, MapPin } from 'lucide-react'

interface WitnessNetworkCardProps {
  type: 'witness_network'
  title: string
  count: number
  witnesses: string[]
  description: string
}

export function WitnessNetworkCard({
  title,
  count,
  witnesses,
  description,
}: WitnessNetworkCardProps) {
  const displayWitnesses = witnesses?.slice(0, 3) || []
  const remainingCount = Math.max(0, (witnesses?.length || 0) - 3)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
          <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-400">
            {count}
          </div>
        </div>

        {/* Witness List */}
        {displayWitnesses.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-white/40">
              Shared Witnesses
            </div>
            <div className="flex flex-wrap gap-2">
              {displayWitnesses.map((witness, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-sm text-amber-200"
                >
                  <Users className="h-3.5 w-3.5" />
                  {witness}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-sm text-amber-200">
                  +{remainingCount} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network Strength Indicator */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-950/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, count * 20)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>
          <span className="text-xs text-white/40">Network Strength</span>
        </div>
      </div>
    </motion.div>
  )
}
