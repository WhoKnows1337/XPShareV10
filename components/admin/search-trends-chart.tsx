'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Calendar } from 'lucide-react'

interface TrendData {
  date: string
  count: number
}

interface SearchTrendsChartProps {
  days: number
}

export function SearchTrendsChart({ days }: SearchTrendsChartProps) {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrends()
  }, [days])

  const fetchTrends = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/search-analytics?type=trends&days=${days}`)
      const data = await response.json()
      setTrends(data.data || [])
    } catch (error) {
      console.error('Error fetching trends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const maxCount = Math.max(...trends.map((t) => t.count), 1)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Search Volume Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Search Volume Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Search Volume Trends
        </CardTitle>
        <CardDescription>Daily search volume over the last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Simple SVG Bar Chart */}
        <div className="space-y-4">
          {/* Chart Area */}
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 800 256" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <line
                  key={fraction}
                  x1="0"
                  x2="800"
                  y1={256 - 256 * fraction}
                  y2={256 - 256 * fraction}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted/20"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Bars */}
              {trends.map((trend, index) => {
                const barWidth = 800 / trends.length
                const barHeight = (trend.count / maxCount) * 240
                const x = index * barWidth + barWidth * 0.1
                const y = 256 - barHeight - 8

                return (
                  <g key={trend.date}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth * 0.8}
                      height={barHeight}
                      fill="currentColor"
                      className="text-primary transition-all hover:opacity-80"
                      rx="4"
                    />
                    {/* Hover label */}
                    <title>
                      {new Date(trend.date).toLocaleDateString('de-DE')}: {trend.count} searches
                    </title>
                  </g>
                )
              })}
            </svg>

            {/* Y-Axis Labels */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs text-muted-foreground -ml-12">
              <span>{maxCount}</span>
              <span>{Math.round(maxCount * 0.75)}</span>
              <span>{Math.round(maxCount * 0.5)}</span>
              <span>{Math.round(maxCount * 0.25)}</span>
              <span>0</span>
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>{new Date(trends[0]?.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}</span>
            {trends.length > 2 && (
              <span className="hidden md:inline">
                {new Date(trends[Math.floor(trends.length / 2)]?.date).toLocaleDateString('de-DE', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            <span>
              {new Date(trends[trends.length - 1]?.date).toLocaleDateString('de-DE', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{trends.reduce((sum, t) => sum + t.count, 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg/Day</p>
              <p className="text-lg font-bold">
                {Math.round(trends.reduce((sum, t) => sum + t.count, 0) / trends.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak</p>
              <p className="text-lg font-bold">{maxCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
