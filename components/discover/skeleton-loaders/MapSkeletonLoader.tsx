'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton Loader for Map Visualization
 * Displays while map data is being fetched/analyzed
 */
export function MapSkeletonLoader() {
  return (
    <Card className="p-6 border-l-4 border-green-500/20 bg-green-50/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Map Area */}
        <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden">
          {/* Animated map grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated marker positions */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 bg-green-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <div className="absolute inset-0 bg-green-500/50 rounded-full animate-ping" />
            </div>
          ))}

          {/* Controls placeholder */}
          <div className="absolute top-4 right-4 space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>

        {/* Footer info */}
        <Skeleton className="h-4 w-64" />
      </div>
    </Card>
  )
}
