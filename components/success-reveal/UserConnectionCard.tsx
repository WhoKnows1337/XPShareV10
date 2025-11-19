'use client'

import { motion } from 'framer-motion'
import { Users2, Sparkles, Tag } from 'lucide-react'

interface UserConnectionCardProps {
  type: 'user_connection'
  title: string
  similarity: number
  shared_categories: string[]
  description: string
}

export function UserConnectionCard({
  title,
  similarity,
  shared_categories,
  description,
}: UserConnectionCardProps) {
  const displayCategories = shared_categories?.slice(0, 4) || []
  const remainingCount = Math.max(0, (shared_categories?.length || 0) - 4)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-pink-950/20 p-6 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Users2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-white">
                {title}
                <Sparkles className="h-4 w-4 text-purple-400" />
              </h3>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
          <div className="rounded-full bg-purple-500/10 px-3 py-1 text-sm font-bold text-purple-400">
            {similarity}%
          </div>
        </div>

        {/* DNA Match Visualization */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-white/40">
            XP DNA Match
          </div>

          {/* Similarity Bar */}
          <div className="relative">
            <div className="h-3 overflow-hidden rounded-full bg-purple-950/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${similarity}%` }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%]"
                style={{
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-purple-400">
              {similarity}% DNA Match
            </div>
          </div>
        </div>

        {/* Shared Categories */}
        {displayCategories.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-white/40">
              Shared Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-sm text-purple-200"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {cat.replace(/-/g, ' ')}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-sm text-purple-200">
                  +{remainingCount} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Strength */}
        <div className="rounded-lg bg-purple-950/30 p-3 text-center">
          <div className="text-xs text-white/50">
            You and this user share remarkably similar experiences
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
