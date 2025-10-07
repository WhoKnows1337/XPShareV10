'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SeasonalPatternProps {
  category: string
}

interface MonthlyData {
  month: string
  count: number
}

interface YearComparison {
  year: number
  count: number
}

interface SeasonalData {
  peak_month: string
  monthly_data: MonthlyData[]
  yearly_comparison: YearComparison[]
  current_year_position: string
}

export function SeasonalPattern({ category }: SeasonalPatternProps) {
  const [data, setData] = useState<SeasonalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeasonalData = async () => {
      const supabase = createClient()

      // Get monthly counts for last 12 months
      const { data: experiences } = await supabase
        .from('experiences')
        .select('created_at')
        .eq('category', category)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      if (!experiences) {
        setLoading(false)
        return
      }

      // Process monthly data
      const monthCounts: Record<string, number> = {}
      experiences.forEach((exp) => {
        const month = new Date(exp.created_at).toLocaleDateString('de-DE', {
          month: 'short',
          year: 'numeric',
        })
        monthCounts[month] = (monthCounts[month] || 0) + 1
      })

      const monthlyData = Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const dateA = new Date(a.month)
          const dateB = new Date(b.month)
          return dateA.getTime() - dateB.getTime()
        })

      // Find peak month
      const peakMonth = monthlyData.length > 0
        ? monthlyData.reduce((prev, current) =>
            prev.count > current.count ? prev : current
          )
        : null

      // Get yearly comparison (last 3 years)
      const currentYear = new Date().getFullYear()
      const yearlyComparison: YearComparison[] = []

      for (let year = currentYear - 2; year <= currentYear; year++) {
        const startDate = new Date(year, 0, 1).toISOString()
        const endDate = new Date(year, 11, 31).toISOString()

        const { count } = await supabase
          .from('experiences')
          .select('*', { count: 'exact', head: true })
          .eq('category', category)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        yearlyComparison.push({ year, count: count || 0 })
      }

      setData({
        peak_month: peakMonth?.month || '',
        monthly_data: monthlyData,
        yearly_comparison: yearlyComparison,
        current_year_position: 'upward',
      })
      setLoading(false)
    }

    fetchSeasonalData()
  }, [category])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading seasonal patterns...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.monthly_data.length === 0) {
    return null
  }

  const maxCount = Math.max(...data.monthly_data.map((d) => d.count))

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          📊 Seasonal Pattern
        </CardTitle>
        <CardDescription>
          {category} experiences have a peak in {data.peak_month}!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple Bar Chart */}
        <div className="space-y-2">
          {data.monthly_data.slice(-6).map((item) => (
            <div key={item.month} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.month}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Yearly Comparison */}
        <div className="space-y-1 text-sm pt-2 border-t">
          <p className="font-semibold mb-2">Yearly Comparison</p>
          {data.yearly_comparison.map((year) => (
            <div key={year.year} className="flex justify-between">
              <span className="text-muted-foreground">{year.year}:</span>
              <span className="font-semibold">{year.count} Reports</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          You are part of the {data.current_year_position} trend!
        </p>
      </CardContent>
    </Card>
  )
}
