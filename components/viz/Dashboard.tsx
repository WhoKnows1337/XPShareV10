/**
 * XPShare AI - Visualization Dashboard
 *
 * Comprehensive dashboard combining multiple visualizations with summary stats.
 * Provides tabbed interface for exploring different data perspectives.
 */

'use client'

import { useState, useMemo } from 'react'
import { ExperienceMap } from './ExperienceMap'
import { TimelineChart } from './TimelineChart'
import { SimpleChart } from './SimpleChart'
import { NetworkGraph } from './NetworkGraph'
import { Heatmap } from './Heatmap'
import type { NetworkNode, NetworkLink } from './NetworkGraph'

// ============================================================================
// Type Definitions
// ============================================================================

export interface DashboardProps {
  /** Raw data to visualize */
  data: any

  /** Dashboard title */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'

  /** Enable/disable specific visualizations */
  enabledViz?: {
    map?: boolean
    timeline?: boolean
    network?: boolean
    heatmap?: boolean
    charts?: boolean
  }

  /** Default active tab */
  defaultTab?: 'overview' | 'map' | 'timeline' | 'network' | 'heatmap'
}

type TabType = 'overview' | 'map' | 'timeline' | 'network' | 'heatmap'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract summary statistics from data
 */
function extractStats(data: any): {
  totalCount: number
  categoryCount: number
  locationCount: number
  avgPerMonth: number
  topCategory: string
} {
  const dataArray = Array.isArray(data)
    ? data
    : data?.results || data?.experiences || data?.nodes || []

  const totalCount = dataArray.length

  // Categories
  const categories = new Set(dataArray.map((d: any) => d.category).filter(Boolean))
  const categoryCount = categories.size

  // Locations
  const locations = dataArray.filter(
    (d: any) => d.location_lat !== undefined && d.location_lng !== undefined
  )
  const locationCount = locations.length

  // Temporal (avg per month)
  const dates = dataArray.map((d: any) => d.date_occurred || d.created_at).filter(Boolean)
  const avgPerMonth = dates.length > 0 ? (dates.length / 12).toFixed(1) : '0'

  // Top category
  const categoryCounts = new Map<string, number>()
  dataArray.forEach((d: any) => {
    if (d.category) {
      categoryCounts.set(d.category, (categoryCounts.get(d.category) || 0) + 1)
    }
  })

  let topCategory = 'N/A'
  let maxCount = 0
  categoryCounts.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count
      topCategory = category
    }
  })

  return {
    totalCount,
    categoryCount,
    locationCount,
    avgPerMonth: parseFloat(avgPerMonth),
    topCategory,
  }
}

/**
 * Prepare data for different visualization types
 */
function prepareVizData(data: any) {
  const dataArray = Array.isArray(data)
    ? data
    : data?.results || data?.experiences || data?.nodes || []

  // Map data (experiences with coordinates)
  const mapData = dataArray.filter(
    (d: any) => d.location_lat !== undefined && d.location_lng !== undefined
  )

  // Timeline data (aggregate by month)
  const timelineMap = new Map<string, number>()
  dataArray.forEach((d: any) => {
    const date = d.date_occurred || d.created_at
    if (date) {
      const period = date.substring(0, 7) // YYYY-MM
      timelineMap.set(period, (timelineMap.get(period) || 0) + 1)
    }
  })
  const timelineData = Array.from(timelineMap.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))

  // Category distribution
  const categoryMap = new Map<string, number>()
  dataArray.forEach((d: any) => {
    if (d.category) {
      categoryMap.set(d.category, (categoryMap.get(d.category) || 0) + 1)
    }
  })
  const categoryData = Array.from(categoryMap.entries()).map(([label, value]) => ({
    label,
    value,
  }))

  // Network data (if connections exist)
  const nodes: NetworkNode[] = []
  const links: NetworkLink[] = []

  if (data?.nodes && data?.edges) {
    // Already in network format
    nodes.push(...data.nodes)
    links.push(...data.edges)
  } else if (dataArray.some((d: any) => d.connections)) {
    // Extract connections from data
    dataArray.forEach((d: any) => {
      nodes.push({
        id: d.id,
        name: d.title || d.id,
        category: d.category,
        val: 1,
      })

      if (d.connections && Array.isArray(d.connections)) {
        d.connections.forEach((conn: any) => {
          links.push({
            source: d.id,
            target: conn.id || conn.target,
            value: conn.similarity_score || 1,
            label: conn.reason || '',
          })
        })
      }
    })
  }

  // Heatmap data (category × time)
  const heatmapMap = new Map<string, number>()
  dataArray.forEach((d: any) => {
    if (d.category) {
      const date = d.date_occurred || d.created_at
      if (date) {
        const period = date.substring(0, 7) // YYYY-MM
        const key = `${d.category}:${period}`
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1)
      }
    }
  })
  const heatmapData = Array.from(heatmapMap.entries()).map(([key, count]) => {
    const [category, period] = key.split(':')
    return { category, period, count }
  })

  return {
    mapData,
    timelineData,
    categoryData,
    networkData: { nodes, links },
    heatmapData,
  }
}

// ============================================================================
// Dashboard Component
// ============================================================================

export function Dashboard({
  data,
  title = 'Experience Discovery Dashboard',
  theme = 'light',
  enabledViz = {
    map: true,
    timeline: true,
    network: true,
    heatmap: true,
    charts: true,
  },
  defaultTab = 'overview',
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)

  // Extract stats and prepare viz data
  const stats = useMemo(() => extractStats(data), [data])
  const vizData = useMemo(() => prepareVizData(data), [data])

  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    text: theme === 'dark' ? '#f3f4f6' : '#111827',
    cardBg: theme === 'dark' ? '#374151' : '#f9fafb',
    border: theme === 'dark' ? '#4b5563' : '#e5e7eb',
    tabActive: theme === 'dark' ? '#8b5cf6' : '#6366f1',
    tabInactive: theme === 'dark' ? '#6b7280' : '#9ca3af',
  }

  // Tab configuration
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', enabled: true },
    { id: 'map' as TabType, label: 'Map', enabled: enabledViz.map ?? true },
    { id: 'timeline' as TabType, label: 'Timeline', enabled: enabledViz.timeline ?? true },
    { id: 'network' as TabType, label: 'Network', enabled: enabledViz.network ?? true },
    { id: 'heatmap' as TabType, label: 'Heatmap', enabled: enabledViz.heatmap ?? true },
  ].filter((tab) => tab.enabled)

  return (
    <div className="w-full" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      {title && (
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
          {title}
        </h2>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div
          className="p-4 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Experiences</p>
          <p className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
            {stats.totalCount}
          </p>
        </div>

        <div
          className="p-4 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
          <p className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
            {stats.categoryCount}
          </p>
        </div>

        <div
          className="p-4 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">With Location</p>
          <p className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
            {stats.locationCount}
          </p>
        </div>

        <div
          className="p-4 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg per Month</p>
          <p className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
            {stats.avgPerMonth}
          </p>
        </div>

        <div
          className="p-4 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Top Category</p>
          <p className="text-2xl font-bold mt-1 capitalize" style={{ color: colors.text }}>
            {stats.topCategory}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6" style={{ borderColor: colors.border }}>
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? colors.tabActive : colors.tabInactive,
                borderBottomColor: activeTab === tab.id ? colors.tabActive : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enabledViz.charts && vizData.categoryData.length > 0 && (
              <div>
                <SimpleChart
                  data={vizData.categoryData}
                  title="Category Distribution"
                  type="pie"
                  height={400}
                  theme={theme}
                />
              </div>
            )}

            {enabledViz.timeline && vizData.timelineData.length > 0 && (
              <div>
                <TimelineChart
                  data={vizData.timelineData}
                  title="Temporal Distribution"
                  height={400}
                  theme={theme}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && enabledViz.map && (
          <ExperienceMap data={vizData.mapData} height={600} theme={theme} />
        )}

        {activeTab === 'timeline' && enabledViz.timeline && (
          <TimelineChart
            data={vizData.timelineData}
            title="Experience Timeline"
            height={600}
            theme={theme}
          />
        )}

        {activeTab === 'network' && enabledViz.network && (
          <>
            {vizData.networkData.nodes.length > 0 ? (
              <NetworkGraph
                nodes={vizData.networkData.nodes}
                links={vizData.networkData.links}
                title="Connection Network"
                height={600}
                theme={theme}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">No network connections available</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'heatmap' && enabledViz.heatmap && (
          <>
            {vizData.heatmapData.length > 0 ? (
              <Heatmap
                data={vizData.heatmapData}
                title="Category × Time Heatmap"
                height={500}
                theme={theme}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">
                  No heatmap data available (requires category and date)
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
