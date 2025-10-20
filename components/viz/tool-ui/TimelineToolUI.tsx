/**
 * XPShare AI - Timeline Tool UI Wrapper
 *
 * Wrapper component for TimelineChart with AI tool result integration.
 * Handles data transformation from tool results to timeline component props.
 */

'use client'

import { TimelineChart, type TimelineChartProps } from '../TimelineChart'

// ============================================================================
// Type Definitions
// ============================================================================

export interface TimelineToolUIProps {
  /** Tool result data */
  toolResult: any

  /** Override timeline configuration */
  config?: Partial<TimelineChartProps>

  /** Title override */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transform tool result to TimelineChart data format
 */
function transformToolResult(toolResult: any): TimelineChartProps['data'] {
  // Handle different result formats
  const data =
    toolResult?.results ||
    toolResult?.experiences ||
    toolResult?.periods ||
    toolResult?.timeline ||
    toolResult?.data ||
    (Array.isArray(toolResult) ? toolResult : [])

  // Check if data is already in timeline format (period + count)
  if (data.length > 0 && data[0].period !== undefined && data[0].count !== undefined) {
    return data.map((item: any) => ({
      period: item.period,
      count: item.count,
      category: item.category,
      ...item,
    }))
  }

  // Aggregate by period if raw experiences
  const periodMap = new Map<string, { count: number; category?: string }>()

  data.forEach((item: any) => {
    const date = item.date_occurred || item.created_at || item.timestamp || item.period
    if (!date) return

    // Extract period (YYYY-MM by default)
    let period: string
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
        period = date.substring(0, 7) // YYYY-MM
      } else if (date.match(/^\d{4}-\d{2}/)) {
        period = date // Already YYYY-MM
      } else if (date.match(/^\d{4}/)) {
        period = date // Year only
      } else {
        return // Skip invalid dates
      }
    } else {
      return
    }

    const key = item.category ? `${period}:${item.category}` : period

    if (!periodMap.has(key)) {
      periodMap.set(key, { count: 0, category: item.category })
    }

    const entry = periodMap.get(key)!
    entry.count += item.count || 1
  })

  // Convert to array format
  return Array.from(periodMap.entries())
    .map(([key, value]) => {
      const [period, category] = key.includes(':') ? key.split(':') : [key, undefined]
      return {
        period,
        count: value.count,
        category: category || value.category,
      }
    })
    .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Extract metadata from tool result
 */
function extractMetadata(toolResult: any): {
  totalEvents: number
  periodCount: number
  hasCategories: boolean
  dateRange: { start: string; end: string } | null
} {
  const data =
    toolResult?.results ||
    toolResult?.experiences ||
    toolResult?.periods ||
    toolResult?.data ||
    (Array.isArray(toolResult) ? toolResult : [])

  const totalEvents = data.reduce((sum: number, item: any) => sum + (item.count || 1), 0)

  const periods = new Set<string>()
  let hasCategories = false

  data.forEach((item: any) => {
    if (item.period) {
      periods.add(item.period)
    }
    if (item.category) {
      hasCategories = true
    }
  })

  const periodArray = Array.from(periods).sort()
  const dateRange =
    periodArray.length > 0
      ? {
          start: periodArray[0],
          end: periodArray[periodArray.length - 1],
        }
      : null

  return {
    totalEvents,
    periodCount: periods.size,
    hasCategories,
    dateRange,
  }
}

// ============================================================================
// TimelineToolUI Component
// ============================================================================

export function TimelineToolUI({
  toolResult,
  config = {},
  title,
  theme = 'light',
}: TimelineToolUIProps) {
  // Transform data
  const timelineData = transformToolResult(toolResult)
  const metadata = extractMetadata(toolResult)

  // Generate title
  const timelineTitle =
    title ||
    config.title ||
    (toolResult?.summary
      ? `${toolResult.summary} - Timeline`
      : `Timeline (${metadata.periodCount} periods)`)

  // Determine if we should group by category
  const groupByCategory = config.groupByCategory ?? metadata.hasCategories

  return (
    <div className="w-full space-y-4">
      {/* Metadata Banner */}
      {metadata.dateRange && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📅 Timeline from {metadata.dateRange.start} to {metadata.dateRange.end} |{' '}
            {metadata.totalEvents} total events across {metadata.periodCount} periods
            {metadata.hasCategories && ' | Grouped by category'}
          </p>
        </div>
      )}

      {/* Summary Text */}
      {toolResult?.summary && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-100">{toolResult.summary}</p>
        </div>
      )}

      {/* Timeline Component */}
      <TimelineChart
        data={timelineData}
        title={timelineTitle}
        height={config.height || 400}
        groupByCategory={groupByCategory}
        theme={theme}
      />

      {/* Tool Result Metadata */}
      {toolResult?.reasoning && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            AI Reasoning
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{toolResult.reasoning}</p>
        </div>
      )}
    </div>
  )
}
