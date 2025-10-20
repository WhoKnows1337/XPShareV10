'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { useState } from 'react'

/**
 * Timeline Chart Component
 * Interactive temporal visualization with Recharts
 * Supports: area, bar, line chart types
 * Used by streamUI for temporal pattern visualization
 */

export interface TimelineData {
  date: string
  count: number
  [key: string]: any // Support additional dimensions
}

export interface TimelineChartProps {
  data: TimelineData[]
  chartType?: 'area' | 'bar' | 'line'
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'year'
  title?: string
  interactive?: boolean
  onRangeSelect?: (range: { from: string; to: string }) => void
}

export function TimelineChart({
  data,
  chartType = 'area',
  granularity = 'day',
  title = 'Temporal Pattern',
  interactive = false,
  onRangeSelect,
}: TimelineChartProps) {
  const [hoveredData, setHoveredData] = useState<TimelineData | null>(null)

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)
  const avgCount = data.length > 0 ? totalCount / data.length : 0

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      onMouseMove: (e: any) => {
        if (e.activePayload?.[0]) {
          setHoveredData(e.activePayload[0].payload)
        }
      },
      onMouseLeave: () => setHoveredData(null),
    }

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        )

      case 'area':
      default:
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </AreaChart>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <Badge variant="secondary">{granularity}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Events</p>
            <p className="font-semibold text-lg">{totalCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Points</p>
            <p className="font-semibold text-lg">{data.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-semibold text-lg">{avgCount.toFixed(1)}</p>
          </div>
        </div>

        {hoveredData && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">{hoveredData.date}:</span>{' '}
              {hoveredData.count} events
            </p>
          </div>
        )}

        {interactive && onRangeSelect && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">
              💡 Click and drag to select a time range for deeper analysis
            </p>
            <Button variant="outline" size="sm" onClick={() => {}}>
              Select Range
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Multiple Timelines Comparison
 */
export interface MultiTimelineProps {
  datasets: Array<{
    name: string
    data: TimelineData[]
    color: string
  }>
  title?: string
}

export function MultiTimeline({ datasets, title = 'Comparison' }: MultiTimelineProps) {
  // Combine all datasets into one data array
  const combinedData = datasets[0].data.map((item, idx) => {
    const dataPoint: any = { date: item.date }
    datasets.forEach((dataset) => {
      dataPoint[dataset.name] = dataset.data[idx]?.count || 0
    })
    return dataPoint
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {datasets.map((dataset) => (
                <Line
                  key={dataset.name}
                  type="monotone"
                  dataKey={dataset.name}
                  stroke={dataset.color}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
