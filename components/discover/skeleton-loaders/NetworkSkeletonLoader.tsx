'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton Loader for Network Graph
 * Displays while network data is being fetched/analyzed
 */
export function NetworkSkeletonLoader() {
  return (
    <Card className="p-6 border-l-4 border-purple-500/20 bg-purple-50/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Network Graph Area */}
        <div className="relative h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden">
          {/* Animated nodes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 35
            const x = 50 + Math.cos(angle) * radius
            const y = 50 + Math.sin(angle) * radius

            return (
              <div
                key={i}
                className="absolute w-8 h-8 bg-purple-500/30 rounded-full animate-pulse"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div className="absolute inset-0 bg-purple-500/50 rounded-full animate-ping"
                     style={{ animationDelay: `${i * 0.15}s` }}
                />
              </div>
            )
          })}

          {/* Animated connection lines */}
          <svg className="absolute inset-0 w-full h-full">
            {Array.from({ length: 8 }).map((_, i) => {
              const startAngle = (i / 12) * Math.PI * 2
              const endAngle = ((i + 3) / 12) * Math.PI * 2
              const radius = 35

              const x1 = 50 + Math.cos(startAngle) * radius
              const y1 = 50 + Math.sin(startAngle) * radius
              const x2 = 50 + Math.cos(endAngle) * radius
              const y2 = 50 + Math.sin(endAngle) * radius

              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-purple-300/30 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              )
            })}
          </svg>

          {/* Controls placeholder */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Skeleton className="h-8 w-8 rounded" />
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
