/**
 * XPShare AI - Timeline Chart Visualization
 *
 * Displays temporal patterns in experience data.
 * Supports multiple granularities and category grouping.
 */

'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ============================================================================
// Type Definitions
// ============================================================================

export interface TimelineChartProps {
  /** Timeline data points */
  data: Array<{
    period: string
    count: number
    category?: string
    [key: string]: any
  }>

  /** Chart title */
  title?: string

  /** Height in pixels */
  height?: number

  /** Show category grouping */
  groupByCategory?: boolean

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Category Colors
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
// Timeline Chart Component
// ============================================================================

export function TimelineChart({
  data,
  title = 'Timeline',
  height = 400,
  groupByCategory = false,
  theme = 'light',
}: TimelineChartProps) {
  // Transform data for grouped view
  const chartData = useMemo(() => {
    if (!groupByCategory) {
      // Simple timeline: aggregate all counts per period
      const periodCounts = new Map<string, number>()

      data.forEach((item) => {
        const current = periodCounts.get(item.period) || 0
        periodCounts.set(item.period, current + item.count)
      })

      return Array.from(periodCounts.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period))
    }

    // Grouped timeline: pivot data by category
    const periodData = new Map<string, Record<string, number>>()

    data.forEach((item) => {
      if (!item.category) return

      if (!periodData.has(item.period)) {
        periodData.set(item.period, {})
      }

      const periodCounts = periodData.get(item.period)!
      periodCounts[item.category] = item.count
    })

    return Array.from(periodData.entries())
      .map(([period, categories]) => ({
        period,
        ...categories,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [data, groupByCategory])

  // Extract unique categories for grouped view
  const categories = useMemo(() => {
    if (!groupByCategory) return []

    const uniqueCategories = new Set<string>()
    data.forEach((item) => {
      if (item.category) uniqueCategories.add(item.category)
    })

    return Array.from(uniqueCategories)
  }, [data, groupByCategory])

  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    text: theme === 'dark' ? '#f3f4f6' : '#111827',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    tooltip: theme === 'dark' ? '#374151' : '#ffffff',
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />

          <XAxis
            dataKey="period"
            stroke={colors.text}
            tick={{ fill: colors.text }}
            angle={-45}
            textAnchor="end"
            height={80}
          />

          <YAxis stroke={colors.text} tick={{ fill: colors.text }} />

          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltip,
              border: `1px solid ${colors.grid}`,
              borderRadius: '8px',
            }}
            labelStyle={{ color: colors.text }}
          />

          {groupByCategory ? (
            <>
              <Legend wrapperStyle={{ color: colors.text }} />
              {categories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={CATEGORY_COLORS[category] || CATEGORY_COLORS.default}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={category}
                />
              ))}
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="count"
              stroke={CATEGORY_COLORS.default}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Count"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 text-sm text-gray-500">
        {chartData.length} periods | {data.reduce((sum, d) => sum + d.count, 0)} total events
      </div>
    </div>
  )
}
