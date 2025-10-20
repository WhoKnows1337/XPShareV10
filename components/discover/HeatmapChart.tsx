'use client'

import { Card, Title, Text } from '@tremor/react'
import { Badge } from '@/components/ui/badge'
import { Grid3x3 } from 'lucide-react'

/**
 * Heatmap Chart Component
 * 2D density visualization with Tremor
 * Features: Category × Time correlation, interactive tooltips
 * Used by streamUI for density and correlation visualization
 */

export interface HeatmapCell {
  category: string
  month: string
  count: number
}

export interface HeatmapChartProps {
  data: HeatmapCell[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colorScheme?: 'blue' | 'cyan' | 'emerald' | 'violet' | 'rose'
  onCellClick?: (cell: HeatmapCell) => void
}

export function HeatmapChart({
  data,
  title = '2D Density Map',
  xAxisLabel = 'Time',
  yAxisLabel = 'Category',
  colorScheme = 'blue',
  onCellClick,
}: HeatmapChartProps) {
  // Extract unique categories and months
  const categories = Array.from(new Set(data.map((d) => d.category)))
  const months = Array.from(new Set(data.map((d) => d.month))).sort()

  // Find max count for scaling
  const maxCount = Math.max(...data.map((d) => d.count))
  const minCount = Math.min(...data.filter((d) => d.count > 0).map((d) => d.count))

  // Create a map for quick lookup
  const cellMap = new Map<string, HeatmapCell>()
  data.forEach((cell) => {
    cellMap.set(`${cell.category}-${cell.month}`, cell)
  })

  // Get color intensity based on count
  const getColorClass = (count: number): string => {
    if (count === 0) return 'bg-gray-50 dark:bg-gray-900'

    const intensity = count / maxCount
    const colorMap = {
      blue: [
        'bg-blue-50',
        'bg-blue-100',
        'bg-blue-200',
        'bg-blue-300',
        'bg-blue-400',
        'bg-blue-500',
      ],
      cyan: [
        'bg-cyan-50',
        'bg-cyan-100',
        'bg-cyan-200',
        'bg-cyan-300',
        'bg-cyan-400',
        'bg-cyan-500',
      ],
      emerald: [
        'bg-emerald-50',
        'bg-emerald-100',
        'bg-emerald-200',
        'bg-emerald-300',
        'bg-emerald-400',
        'bg-emerald-500',
      ],
      violet: [
        'bg-violet-50',
        'bg-violet-100',
        'bg-violet-200',
        'bg-violet-300',
        'bg-violet-400',
        'bg-violet-500',
      ],
      rose: [
        'bg-rose-50',
        'bg-rose-100',
        'bg-rose-200',
        'bg-rose-300',
        'bg-rose-400',
        'bg-rose-500',
      ],
    }

    const colors = colorMap[colorScheme]
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
    return colors[index]
  }

  return (
    <Card className="border-0 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-gray-500" />
          <Title>{title}</Title>
        </div>
        <Badge variant="secondary">{data.length} cells</Badge>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row with months */}
          <div className="flex">
            <div className="w-32 flex-shrink-0" /> {/* Spacer for y-axis labels */}
            {months.map((month) => (
              <div
                key={month}
                className="w-16 flex-shrink-0 text-center"
              >
                <Text className="text-xs transform -rotate-45 origin-center">
                  {month}
                </Text>
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              {/* Category label */}
              <div className="w-32 flex-shrink-0 pr-2">
                <Text className="text-xs text-right truncate">{category}</Text>
              </div>

              {/* Cells */}
              {months.map((month) => {
                const cell = cellMap.get(`${category}-${month}`)
                const count = cell?.count || 0

                return (
                  <div
                    key={`${category}-${month}`}
                    className={`
                      w-16 h-12 flex-shrink-0 border border-gray-200 dark:border-gray-700
                      flex items-center justify-center
                      cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all
                      ${getColorClass(count)}
                    `}
                    onClick={() => cell && onCellClick?.(cell)}
                    title={`${category} - ${month}: ${count} events`}
                  >
                    {count > 0 && (
                      <Text className="text-xs font-semibold">{count}</Text>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-3">
        <Text className="text-xs">Intensity:</Text>
        <div className="flex items-center gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <div
              key={intensity}
              className={`w-8 h-4 border ${getColorClass(intensity * maxCount)}`}
            />
          ))}
        </div>
        <Text className="text-xs">
          {minCount} → {maxCount} events
        </Text>
      </div>

      <Text className="text-xs text-gray-500 mt-4">
        💡 Click cells for details • Darker colors = higher density
      </Text>
    </Card>
  )
}
