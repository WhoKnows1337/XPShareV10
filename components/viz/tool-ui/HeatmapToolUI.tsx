/**
 * XPShare AI - Heatmap Tool UI Wrapper
 *
 * Wrapper component for Heatmap with AI tool result integration.
 * Handles data transformation from tool results to heatmap component props.
 */

'use client'

import { Heatmap, type HeatmapProps } from '../Heatmap'

// ============================================================================
// Type Definitions
// ============================================================================

export interface HeatmapToolUIProps {
  /** Tool result data */
  toolResult: any

  /** Override heatmap configuration */
  config?: Partial<HeatmapProps>

  /** Title override */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transform tool result to Heatmap data format
 */
function transformToolResult(toolResult: any): HeatmapProps['data'] {
  // AI SDK v5: Extract output from tool part if available
  const actualResult = toolResult?.output || toolResult?.result || toolResult

  // Handle different result formats
  const data =
    actualResult?.results ||
    actualResult?.heatmap ||
    actualResult?.matrix ||
    actualResult?.data ||
    (Array.isArray(actualResult) ? actualResult : [])

  // Check if data is already in heatmap format (category + period + count)
  if (
    data.length > 0 &&
    data[0].category !== undefined &&
    data[0].period !== undefined &&
    data[0].count !== undefined
  ) {
    return data.map((item: any) => ({
      category: item.category,
      period: item.period,
      count: item.count,
      ...item,
    }))
  }

  // Aggregate by category × period if raw experiences
  const heatmapMap = new Map<string, number>()

  data.forEach((item: any) => {
    if (!item.category) return

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

    const key = `${item.category}:${period}`
    heatmapMap.set(key, (heatmapMap.get(key) || 0) + (item.count || 1))
  })

  // Convert to array format
  return Array.from(heatmapMap.entries()).map(([key, count]) => {
    const [category, period] = key.split(':')
    return { category, period, count }
  })
}

/**
 * Extract metadata from heatmap data
 */
function extractMetadata(
  heatmapData: HeatmapProps['data']
): {
  totalEvents: number
  categoryCount: number
  periodCount: number
  dateRange: { start: string; end: string } | null
  topCategory: string
  peakPeriod: string
  peakCount: number
} {
  if (heatmapData.length === 0) {
    return {
      totalEvents: 0,
      categoryCount: 0,
      periodCount: 0,
      dateRange: null,
      topCategory: 'N/A',
      peakPeriod: 'N/A',
      peakCount: 0,
    }
  }

  const totalEvents = heatmapData.reduce((sum, item) => sum + item.count, 0)

  const categories = new Set<string>()
  const periods = new Set<string>()
  const categoryCounts = new Map<string, number>()

  let peakCount = 0
  let peakPeriod = ''
  let peakCategory = ''

  heatmapData.forEach((item) => {
    categories.add(item.category)
    periods.add(item.period)

    // Track category totals
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + item.count)

    // Track peak
    if (item.count > peakCount) {
      peakCount = item.count
      peakPeriod = item.period
      peakCategory = item.category
    }
  })

  // Find top category
  let topCategory = 'N/A'
  let maxCount = 0
  categoryCounts.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count
      topCategory = category
    }
  })

  // Calculate date range
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
    categoryCount: categories.size,
    periodCount: periods.size,
    dateRange,
    topCategory,
    peakPeriod: `${peakPeriod} (${peakCategory})`,
    peakCount,
  }
}

// ============================================================================
// HeatmapToolUI Component
// ============================================================================

export function HeatmapToolUI({
  toolResult,
  config = {},
  title,
  theme = 'light',
}: HeatmapToolUIProps) {
  // Transform data
  const heatmapData = transformToolResult(toolResult)
  const metadata = extractMetadata(heatmapData)

  // Generate title
  const heatmapTitle =
    title ||
    config.title ||
    (toolResult?.summary
      ? `${toolResult.summary} - Heatmap`
      : `Category × Time Heatmap (${metadata.categoryCount} categories)`)

  return (
    <div className="w-full space-y-4">
      {/* Metadata Banner */}
      {metadata.dateRange && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            🔥 Heatmap: {metadata.categoryCount} categories × {metadata.periodCount} periods |{' '}
            {metadata.totalEvents} total events | Peak: {metadata.peakPeriod} ({metadata.peakCount}{' '}
            events)
          </p>
        </div>
      )}

      {/* Summary Text */}
      {toolResult?.summary && (
        <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-900 dark:text-orange-100">{toolResult.summary}</p>
        </div>
      )}

      {/* Empty State */}
      {heatmapData.length === 0 ? (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No heatmap data available</p>
            <p className="text-sm mt-1">Requires experiences with both category and date fields</p>
          </div>
        </div>
      ) : (
        <Heatmap
          data={heatmapData}
          title={heatmapTitle}
          height={config.height || 500}
          theme={theme}
          colorScale={config.colorScale || 'sequential'}
          showValues={config.showValues ?? false}
        />
      )}

      {/* Insights */}
      {metadata.topCategory !== 'N/A' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Category</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100 capitalize mt-1">
              {metadata.topCategory}
            </p>
          </div>

          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date Range</p>
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mt-1">
              {metadata.dateRange?.start} → {metadata.dateRange?.end}
            </p>
          </div>

          <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Peak Activity</p>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mt-1">
              {metadata.peakPeriod}
            </p>
          </div>
        </div>
      )}

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
