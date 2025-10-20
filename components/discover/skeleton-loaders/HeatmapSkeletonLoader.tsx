'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton Loader for Heatmap Chart
 * Displays while heatmap data is being fetched/analyzed
 */
export function HeatmapSkeletonLoader() {
  return (
    <Card className="p-6 border-l-4 border-orange-500/20 bg-orange-50/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex gap-1 ml-32">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-12" />
            ))}
          </div>

          {/* Heatmap rows */}
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-1">
              {/* Row label */}
              <Skeleton className="h-4 w-32" />

              {/* Cells */}
              {Array.from({ length: 10 }).map((_, colIdx) => {
                const intensity = Math.random()
                return (
                  <div
                    key={colIdx}
                    className="h-12 w-12 rounded animate-pulse"
                    style={{
                      backgroundColor: `rgba(249, 115, 22, ${intensity * 0.5})`,
                      animationDelay: `${(rowIdx * 10 + colIdx) * 0.05}s`,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-8"
                style={{
                  backgroundColor: `rgba(249, 115, 22, ${(i + 1) * 0.15})`
                }}
              />
            ))}
          </div>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Footer info */}
        <Skeleton className="h-4 w-64" />
      </div>
    </Card>
  )
}
