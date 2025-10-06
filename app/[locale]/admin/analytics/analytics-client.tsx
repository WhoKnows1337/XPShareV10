'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { AnalyticsTable } from '@/components/admin/analytics-table'
import { AnalyticsInsights } from '@/components/admin/analytics-insights'
import { Download, RefreshCw, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface AnalyticsClientProps {
  categories: Category[]
}

export function AnalyticsClient({ categories }: AnalyticsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [data, setData] = useState<any>(null)
  const [previousData, setPreviousData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.set('category_id', selectedCategory)
      }

      // Current period (last 7 days)
      const today = new Date()
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      params.set('end_date', today.toISOString().split('T')[0])
      params.set('start_date', sevenDaysAgo.toISOString().split('T')[0])

      const res = await fetch(`/api/admin/analytics?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')

      const data = await res.json()
      setData(data)

      // Previous period (14 days ago to 7 days ago) for comparison
      const previousParams = new URLSearchParams()
      if (selectedCategory !== 'all') {
        previousParams.set('category_id', selectedCategory)
      }
      const fourteenDaysAgo = new Date(today)
      fourteenDaysAgo.setDate(today.getDate() - 14)
      previousParams.set('end_date', sevenDaysAgo.toISOString().split('T')[0])
      previousParams.set('start_date', fourteenDaysAgo.toISOString().split('T')[0])

      const prevRes = await fetch(`/api/admin/analytics?${previousParams.toString()}`)
      if (prevRes.ok) {
        const previousData = await prevRes.json()
        setPreviousData(previousData)
      }
    } catch (error) {
      console.error('Analytics error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedCategory])

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      change: change,
    }
  }

  // Calculate previous period stats
  const previousStats = previousData?.summary
    ? {
        totalShown: previousData.summary.reduce(
          (acc: number, item: any) => acc + (item.total_shown || 0),
          0
        ),
        totalAnswered: previousData.summary.reduce(
          (acc: number, item: any) => acc + (item.total_answered || 0),
          0
        ),
        totalSkipped: previousData.summary.reduce(
          (acc: number, item: any) => acc + (item.total_skipped || 0),
          0
        ),
        avgAnswerRate:
          previousData.summary.length > 0
            ? previousData.summary.reduce(
                (acc: number, item: any) => acc + (item.answer_rate || 0),
                0
              ) / previousData.summary.length
            : 0,
      }
    : null

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const res = await fetch(`/api/admin/analytics/export?format=${format}`)
      if (!res.ok) throw new Error('Export failed')

      if (format === 'csv') {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString()}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast({
        title: 'Success',
        description: `Analytics exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export analytics',
        variant: 'destructive',
      })
    }
  }

  const handleRefresh = async () => {
    try {
      // Call refresh materialized view endpoint
      await fetch('/api/admin/analytics/refresh', { method: 'POST' })
      await fetchAnalytics()

      toast({
        title: 'Success',
        description: 'Analytics refreshed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh analytics',
        variant: 'destructive',
      })
    }
  }

  // Calculate summary stats
  const stats = data?.summary
    ? {
        totalShown: data.summary.reduce(
          (acc: number, item: any) => acc + (item.total_shown || 0),
          0
        ),
        totalAnswered: data.summary.reduce(
          (acc: number, item: any) => acc + (item.total_answered || 0),
          0
        ),
        totalSkipped: data.summary.reduce(
          (acc: number, item: any) => acc + (item.total_skipped || 0),
          0
        ),
        avgAnswerRate:
          data.summary.length > 0
            ? data.summary.reduce(
                (acc: number, item: any) => acc + (item.answer_rate || 0),
                0
              ) / data.summary.length
            : 0,
      }
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Question performance and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shown</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShown.toLocaleString()}</div>
              {previousStats && (() => {
                const trend = calculateTrend(stats.totalShown, previousStats.totalShown)
                return trend ? (
                  <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '↗' : '↘'} {trend.percentage}% vs last week
                  </p>
                ) : null
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Answered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAnswered.toLocaleString()}
              </div>
              {previousStats && (() => {
                const trend = calculateTrend(stats.totalAnswered, previousStats.totalAnswered)
                return trend ? (
                  <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '↗' : '↘'} {trend.percentage}% vs last week
                  </p>
                ) : null
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skipped</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSkipped.toLocaleString()}
              </div>
              {previousStats && (() => {
                const trend = calculateTrend(stats.totalSkipped, previousStats.totalSkipped)
                return trend ? (
                  <p className={`text-xs ${trend.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                    {trend.isPositive ? '↗' : '↘'} {trend.percentage}% vs last week
                  </p>
                ) : null
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Answer Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAnswerRate.toFixed(1)}%</div>
              {previousStats && (() => {
                const trend = calculateTrend(stats.avgAnswerRate, previousStats.avgAnswerRate)
                return trend ? (
                  <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '↗' : '↘'} {trend.percentage}% vs last week
                  </p>
                ) : null
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      <AnalyticsInsights categoryId={selectedCategory !== 'all' ? selectedCategory : undefined} />

      {/* Charts */}
      {data && <AnalyticsCharts data={data} isLoading={isLoading} />}

      {/* Table */}
      {data && <AnalyticsTable data={data.summary || []} isLoading={isLoading} />}
    </div>
  )
}
