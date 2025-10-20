/**
 * XPShare AI - Heatmap Visualization
 *
 * Category × Time heatmap showing experience distribution patterns.
 * Uses Recharts with custom cell rendering for color intensity.
 */

'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, Tooltip } from 'recharts'

// ============================================================================
// Type Definitions
// ============================================================================

export interface HeatmapProps {
  /** Heatmap data with category, period, and count */
  data: Array<{
    category: string
    period: string
    count: number
    [key: string]: any
  }>

  /** Heatmap title */
  title?: string

  /** Height in pixels */
  height?: number

  /** Color theme */
  theme?: 'light' | 'dark'

  /** Color scale type */
  colorScale?: 'sequential' | 'diverging'

  /** Show values in cells */
  showValues?: boolean
}

// ============================================================================
// Category Colors (matching other viz)
// ============================================================================

const CATEGORY_COLORS: Record<string, string> = {
  ufo: '#8b5cf6', // purple
  dreams: '#3b82f6', // blue
  nde: '#10b981', // green
  synchronicity: '#f59e0b', // amber
  psychic: '#ec4899', // pink
  ghost: '#6366f1', // indigo
  default: '#64748b', // slate
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert data to matrix format (categories × periods)
 */
function transformToMatrix(
  data: Array<{ category: string; period: string; count: number }>
): {
  categories: string[]
  periods: string[]
  matrix: number[][]
  maxCount: number
} {
  // Extract unique categories and periods
  const categorySet = new Set<string>()
  const periodSet = new Set<string>()

  data.forEach((item) => {
    categorySet.add(item.category)
    periodSet.add(item.period)
  })

  const categories = Array.from(categorySet).sort()
  const periods = Array.from(periodSet).sort()

  // Create lookup map
  const countMap = new Map<string, number>()
  let maxCount = 0

  data.forEach((item) => {
    const key = `${item.category}:${item.period}`
    countMap.set(key, item.count)
    maxCount = Math.max(maxCount, item.count)
  })

  // Build matrix
  const matrix = categories.map((category) =>
    periods.map((period) => {
      const key = `${category}:${period}`
      return countMap.get(key) || 0
    })
  )

  return { categories, periods, matrix, maxCount }
}

/**
 * Get color for count value using intensity scaling
 */
function getColorForValue(
  count: number,
  maxCount: number,
  baseColor: string,
  theme: 'light' | 'dark'
): string {
  if (count === 0) {
    return theme === 'dark' ? '#1f2937' : '#f3f4f6'
  }

  // Calculate intensity (0-1)
  const intensity = count / maxCount

  // Parse base color (hex to RGB)
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Mix with white/black based on theme
  const mixColor = theme === 'dark' ? 0 : 255
  const mixedR = Math.round(r * intensity + mixColor * (1 - intensity))
  const mixedG = Math.round(g * intensity + mixColor * (1 - intensity))
  const mixedB = Math.round(b * intensity + mixColor * (1 - intensity))

  return `rgb(${mixedR}, ${mixedG}, ${mixedB})`
}

/**
 * Format period for display
 */
function formatPeriod(period: string): string {
  // Handle different period formats
  if (period.match(/^\d{4}-\d{2}$/)) {
    // YYYY-MM format
    const [year, month] = period.split('-')
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  if (period.match(/^\d{4}$/)) {
    // YYYY format
    return period
  }

  return period
}

// ============================================================================
// Heatmap Component
// ============================================================================

export function Heatmap({
  data,
  title = 'Heatmap',
  height = 400,
  theme = 'light',
  colorScale = 'sequential',
  showValues = false,
}: HeatmapProps) {
  // Transform data to matrix
  const { categories, periods, matrix, maxCount } = useMemo(() => {
    return transformToMatrix(data)
  }, [data])

  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    text: theme === 'dark' ? '#f3f4f6' : '#111827',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    tooltip: theme === 'dark' ? '#374151' : '#ffffff',
  }

  // Empty state
  if (categories.length === 0 || periods.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No heatmap data available</p>
          <p className="text-sm">Requires category and temporal data</p>
        </div>
      </div>
    )
  }

  // Calculate cell dimensions
  const cellWidth = Math.max(60, Math.min(100, 800 / periods.length))
  const cellHeight = Math.max(30, Math.min(50, (height - 100) / categories.length))

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <div style={{ minWidth: cellWidth * periods.length + 150 }}>
          {/* Header Row (Periods) */}
          <div className="flex mb-2">
            <div style={{ width: 150 }} />
            <div className="flex">
              {periods.map((period) => (
                <div
                  key={period}
                  className="text-xs font-medium text-center"
                  style={{
                    width: cellWidth,
                    color: colors.text,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'left bottom',
                    marginBottom: 20,
                  }}
                >
                  {formatPeriod(period)}
                </div>
              ))}
            </div>
          </div>

          {/* Data Rows */}
          {categories.map((category, categoryIdx) => (
            <div key={category} className="flex items-center mb-1">
              {/* Category Label */}
              <div
                className="text-sm font-medium capitalize flex items-center gap-2"
                style={{ width: 150, color: colors.text }}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
                  }}
                />
                {category}
              </div>

              {/* Cells */}
              <div className="flex">
                {periods.map((period, periodIdx) => {
                  const count = matrix[categoryIdx][periodIdx]
                  const baseColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default
                  const cellColor = getColorForValue(count, maxCount, baseColor, theme)

                  return (
                    <div
                      key={`${category}-${period}`}
                      className="relative group cursor-pointer border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                      style={{
                        width: cellWidth,
                        height: cellHeight,
                        backgroundColor: cellColor,
                      }}
                      title={`${category} - ${formatPeriod(period)}: ${count}`}
                    >
                      {showValues && count > 0 && (
                        <span
                          className="text-xs font-medium"
                          style={{
                            color:
                              count / maxCount > 0.5
                                ? '#ffffff'
                                : theme === 'dark'
                                  ? '#f3f4f6'
                                  : '#111827',
                          }}
                        >
                          {count}
                        </span>
                      )}

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{category}</div>
                        <div>{formatPeriod(period)}</div>
                        <div>Count: {count}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: colors.text }}>
          Intensity:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: colors.text }}>
            0
          </span>
          <div className="flex">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => {
              const sampleColor = CATEGORY_COLORS.default
              const color = getColorForValue(
                intensity * maxCount,
                maxCount,
                sampleColor,
                theme
              )
              return (
                <div
                  key={idx}
                  className="w-10 h-6 border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
              )
            })}
          </div>
          <span className="text-xs" style={{ color: colors.text }}>
            {maxCount}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 text-sm text-gray-500">
        {categories.length} categories × {periods.length} periods | Total events:{' '}
        {data.reduce((sum, d) => sum + d.count, 0)} | Peak: {maxCount}
      </div>
    </div>
  )
}
