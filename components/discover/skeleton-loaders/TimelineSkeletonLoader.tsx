'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton Loader for Timeline Chart
 * Displays while timeline data is being fetched/analyzed
 */
export function TimelineSkeletonLoader() {
  return (
    <Card className="p-6 border-l-4 border-blue-500/20 bg-blue-50/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Chart Area */}
        <div className="space-y-2">
          {/* Y-axis labels */}
          <div className="flex items-end gap-1 h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                <Skeleton
                  className="w-full bg-blue-200/50 animate-pulse"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  )
}
