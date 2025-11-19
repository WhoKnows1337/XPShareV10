'use client'

import { motion } from 'framer-motion'

export function ExperienceCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur-sm"
    >
      {/* Header skeleton */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-7 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Title skeleton */}
      <div className="mb-2 space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
      </div>

      {/* Summary skeleton */}
      <div className="mb-3 space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
      </div>

      {/* Meta skeleton */}
      <div className="space-y-1.5">
        <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-28 animate-pulse rounded bg-white/5" />
      </div>

      {/* Match reasons skeleton */}
      <div className="mt-3 flex gap-1.5 border-t border-white/10 pt-3">
        <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
      </div>
    </motion.div>
  )
}

export function ExperienceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ExperienceCardSkeleton key={i} />
      ))}
    </div>
  )
}
