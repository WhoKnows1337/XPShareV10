'use client'

import { motion } from 'framer-motion'
import { Tag, Link2, TrendingUp } from 'lucide-react'

interface TagNetworkCardProps {
  type: 'tag_network'
  title: string
  tags: [string, string]
  count: number
  strength: number
  description: string
}

export function TagNetworkCard({
  title,
  tags,
  count,
  strength,
  description,
}: TagNetworkCardProps) {
  const [tag1, tag2] = tags || ['', '']

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-cyan-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2.5">
              <Link2 className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">🌟 Gemeinsame Muster</h3>
              <p className="text-sm text-white/70">
                {count} Menschen teilen diese Kombination
              </p>
            </div>
          </div>
          <div className="rounded-full bg-teal-500/10 px-3 py-1 text-sm font-bold text-teal-400">
            {count}×
          </div>
        </div>

        {/* Tag Connection Visualization */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            Verbundene Begriffe
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Tag 1 */}
            <div className="flex-1 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-teal-200">
                <Tag className="h-4 w-4" />
                {tag1}
              </div>
            </div>

            {/* Connection Strength Indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-full bg-teal-500/20 p-2">
                <Link2 className="h-4 w-4 text-teal-400" />
              </div>
              <div className="text-xs text-teal-400">
                {Math.round((strength || 0.5) * 100)}%
              </div>
            </div>

            {/* Tag 2 */}
            <div className="flex-1 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-teal-200">
                <Tag className="h-4 w-4" />
                {tag2}
              </div>
            </div>
          </div>
        </div>

        {/* Human-Friendly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-teal-950/30 p-3 text-center">
            <div className="text-lg font-bold text-teal-400">{count}</div>
            <div className="text-xs text-white/50">Ähnliche Berichte</div>
          </div>
          <div className="rounded-lg bg-teal-950/30 p-3 text-center">
            <div className="text-lg font-bold text-teal-400">
              {strength >= 0.8 ? 'Sehr stark' : strength >= 0.5 ? 'Stark' : 'Moderat'}
            </div>
            <div className="text-xs text-white/50">Zusammenhang</div>
          </div>
        </div>

        {/* Network Strength Bar */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-teal-950/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength || 0.5) * 100}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
            />
          </div>
          <span className="text-xs text-white/40">Netzwerkstärke</span>
        </div>

        {/* Insight */}
        <div className="rounded-lg border border-teal-500/20 bg-teal-950/20 p-3">
          <div className="flex items-center gap-2 text-sm text-teal-300">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{count} Erfahrungen verbinden diese Begriffe miteinander</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
