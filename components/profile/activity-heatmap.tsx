'use client'

/**
 * Activity Heatmap Component
 *
 * GitHub-style contribution calendar showing experience submission activity
 * Uses Cal-Heatmap for visualization
 *
 * Features:
 * - Year-long activity view with monthly breakdown
 * - Color intensity based on submission count
 * - Tooltip with date and count
 * - Responsive layout
 * - Accessibility support
 */

import React, { useEffect, useRef } from 'react'
// @ts-ignore - Cal-Heatmap types not properly exported
import CalHeatmap from 'cal-heatmap'
// @ts-ignore
import Tooltip from 'cal-heatmap/plugins/Tooltip'
import 'cal-heatmap/cal-heatmap.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface ActivityData {
  date: string // ISO date string
  count: number
}

interface ActivityHeatmapProps {
  /**
   * User ID to fetch activity data for
   */
  userId: string

  /**
   * Start date for the heatmap (defaults to 1 year ago)
   */
  startDate?: Date

  /**
   * Card title
   */
  title?: string

  /**
   * Additional className
   */
  className?: string
}

export function ActivityHeatmap({
  userId,
  startDate,
  title = 'Activity Heatmap',
  className = ''
}: ActivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // @ts-expect-error - CalHeatmap namespace/type issue
  const calRef = useRef<CalHeatmap | null>(null)
  const [activityData, setActivityData] = React.useState<ActivityData[]>([])
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    // Fetch activity data
    async function fetchActivity() {
      try {
        const response = await fetch(`/api/users/${userId}/activity`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setActivityData(data)
      } catch (err) {
        console.error('Error fetching activity:', err)
        setActivityData([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [userId])

  useEffect(() => {
    if (!containerRef.current || loading || activityData.length === 0) return

    // Transform data to Cal-Heatmap format (timestamp -> count)
    const dataMap: Record<number, number> = {}
    activityData.forEach(item => {
      const timestamp = Math.floor(new Date(item.date).getTime() / 1000)
      dataMap[timestamp] = item.count
    })

    // Initialize Cal-Heatmap
    // @ts-expect-error - CalHeatmap constructor type issue
    const cal = new CalHeatmap()
    calRef.current = cal

    const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    cal.paint({
      // Container
      itemSelector: containerRef.current,

      // Data
      data: {
        source: dataMap,
        type: 'json',
        x: (d: number) => d,
        y: (d: number) => +dataMap[d] || 0,
      },

      // Date range
      date: {
        start: start,
        max: new Date(),
      },

      // Layout
      range: 12, // 12 months
      domain: {
        type: 'month',
        gutter: 4,
        label: { text: 'MMM', textAlign: 'start', position: 'top' },
      },
      subDomain: {
        type: 'day',
        radius: 2,
        width: 11,
        height: 11,
        gutter: 4,
      },

      // Colors - GitHub-style gradient
      scale: {
        color: {
          type: 'threshold',
          range: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
          domain: [1, 3, 5, 10],
        },
      },

      // Plugins
      // @ts-ignore - Cal-Heatmap types issue
      plugins: [
        new Tooltip({
          text: function (timestamp: number, value: number) {
            const date = new Date(timestamp * 1000)
            const dateStr = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
            return `${value || 0} ${value === 1 ? 'experience' : 'experiences'} on ${dateStr}`
          },
        }),
      ],

      // Theme
      theme: 'light',
    })

    // Cleanup
    return () => {
      cal.destroy()
    }
  }, [activityData, startDate, loading])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-sm text-muted-foreground">Loading activity data...</div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full overflow-x-auto"
            role="img"
            aria-label="Activity heatmap showing experience submission frequency over the past year"
          />
        )}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9be9a8' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#40c463' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#30a14e' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#216e39' }} />
          </div>
          <span>More</span>
        </div>

        {/* Summary Stats */}
        {activityData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <div className="text-2xl font-bold">
                {activityData.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Experiences</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {activityData.filter(d => d.count > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.max(...activityData.map(d => d.count), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Best Day</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
