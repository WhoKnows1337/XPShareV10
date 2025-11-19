'use client'

import { motion } from 'framer-motion'
import { Hash, Sparkles, Tag } from 'lucide-react'

interface TagSequenceCardProps {
  type: 'tag_sequence'
  title: string
  tag: string
  count: number
  pattern_category: string
  description: string
}

export function TagSequenceCard({
  title,
  tag,
  count,
  pattern_category,
  description,
}: TagSequenceCardProps) {
  // Determine icon and color based on pattern category
  const getCategoryStyle = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'time':
        return {
          icon: '🕐',
          color: 'from-blue-500 to-cyan-500',
          bg: 'from-blue-950/40 to-cyan-950/20',
          border: 'border-blue-500/20',
          accent: 'text-blue-400',
          accentBg: 'bg-blue-500/10',
        }
      case 'number':
        return {
          icon: '🔢',
          color: 'from-green-500 to-emerald-500',
          bg: 'from-green-950/40 to-emerald-950/20',
          border: 'border-green-500/20',
          accent: 'text-green-400',
          accentBg: 'bg-green-500/10',
        }
      case 'color':
        return {
          icon: '🎨',
          color: 'from-pink-500 to-rose-500',
          bg: 'from-pink-950/40 to-rose-950/20',
          border: 'border-pink-500/20',
          accent: 'text-pink-400',
          accentBg: 'bg-pink-500/10',
        }
      case 'portal':
        return {
          icon: '🌀',
          color: 'from-purple-500 to-indigo-500',
          bg: 'from-purple-950/40 to-indigo-950/20',
          border: 'border-purple-500/20',
          accent: 'text-purple-400',
          accentBg: 'bg-purple-500/10',
        }
      case 'shape':
        return {
          icon: '⬡',
          color: 'from-orange-500 to-amber-500',
          bg: 'from-orange-950/40 to-amber-950/20',
          border: 'border-orange-500/20',
          accent: 'text-orange-400',
          accentBg: 'bg-orange-500/10',
        }
      default:
        return {
          icon: '✨',
          color: 'from-gray-500 to-slate-500',
          bg: 'from-gray-950/40 to-slate-950/20',
          border: 'border-gray-500/20',
          accent: 'text-gray-400',
          accentBg: 'bg-gray-500/10',
        }
    }
  }

  const style = getCategoryStyle(pattern_category)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`group relative overflow-hidden rounded-xl border ${style.border} bg-gradient-to-br ${style.bg} p-6 backdrop-blur-sm`}
    >
      {/* Glow Effect */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.color} opacity-0 transition-opacity group-hover:opacity-5`} />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg ${style.accentBg} p-2.5 text-2xl`}>
              {style.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
          <div className={`rounded-full ${style.accentBg} px-3 py-1 text-sm font-bold ${style.accent}`}>
            {count}
          </div>
        </div>

        {/* Tag Display */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            Pattern
          </div>
          <div className={`flex items-center justify-center gap-3 rounded-xl border ${style.border} bg-gradient-to-br ${style.color} bg-clip-padding p-6 backdrop-blur-sm`}>
            <Hash className={`h-6 w-6 ${style.accent}`} />
            <div className="text-3xl font-bold text-white">{tag}</div>
            <Sparkles className={`h-6 w-6 ${style.accent}`} />
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 rounded-full border ${style.border} ${style.accentBg} px-4 py-2`}>
            <Tag className={`h-3.5 w-3.5 ${style.accent}`} />
            <span className={`text-sm font-medium ${style.accent} capitalize`}>
              {pattern_category} Pattern
            </span>
          </div>
        </div>

        {/* Significance Indicator */}
        <div className="flex items-center gap-2 pt-2">
          <div className={`h-1.5 flex-1 overflow-hidden rounded-full bg-opacity-20 ${style.accentBg}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, count * 20)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full bg-gradient-to-r ${style.color}`}
            />
          </div>
          <span className="text-xs text-white/40">Pattern Strength</span>
        </div>

        {/* Info Box */}
        <div className={`rounded-lg ${style.accentBg} p-3 text-center`}>
          <div className="text-xs text-white/60">
            This pattern appears in <span className={`font-bold ${style.accent}`}>{count}</span> experiences
          </div>
        </div>
      </div>
    </motion.div>
  )
}
