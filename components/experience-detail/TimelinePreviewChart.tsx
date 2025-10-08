'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface TimelineDataPoint {
  date: string
  count: number
}

interface TimelinePreviewChartProps {
  experiences: Array<{ created_at: string }>
}

export function TimelinePreviewChart({ experiences }: TimelinePreviewChartProps) {
  const chartData = useMemo(() => {
    if (!experiences || experiences.length === 0) return []

    // Group experiences by month
    const monthlyData = new Map<string, number>()

    experiences.forEach((exp) => {
      const date = new Date(exp.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
    })

    // Convert to sorted array
    const sorted = Array.from(monthlyData.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12) // Last 12 months

    return sorted
  }, [experiences])

  if (chartData.length === 0) return null

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)
  const points = chartData
    .map((d, i) => {
      const x = chartData.length === 1 ? 50 : (i / (chartData.length - 1)) * 100
      const y = 100 - (d.count / maxCount) * 80 // 80% of height for data, 20% padding
      return `${x},${y}`
    })
    .join(' ')

  const pathD = `M 0,100 L ${points} L 100,100 Z`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-24 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Area gradient */}
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={pathD}
              fill="url(#areaGradient)"
              strokeWidth="0"
            />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {chartData.map((d, i) => {
              const x = chartData.length === 1 ? 50 : (i / (chartData.length - 1)) * 100
              const y = 100 - (d.count / maxCount) * 80
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="hsl(var(--primary))"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              )
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>{chartData.length} months</span>
          <span>{experiences.length} total</span>
        </div>
      </CardContent>
    </Card>
  )
}
