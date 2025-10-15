'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp } from 'lucide-react'

interface ActivityChartProps {
  userId: string
}

export function ActivityChart({ userId }: ActivityChartProps) {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const supabase = createClient()

      // Get experiences grouped by month
      const { data, error } = await supabase
        .from('experiences')
        .select('created_at')
        .eq('user_id', userId)

      if (error) throw error

      // Group by month
      const monthlyCounts: Record<string, number> = {}

      data.forEach((exp) => {
        if (!exp.created_at) return
        const date = new Date(exp.created_at)
        const monthKey = date.toLocaleDateString('de-DE', { year: 'numeric', month: 'short' })
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1
      })

      // Convert to array and sort
      const chartData = Object.entries(monthlyCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const dateA = new Date(a.month)
          const dateB = new Date(b.month)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(-12) // Last 12 months

      // Find most active month
      const mostActive = chartData.reduce(
        (max, curr) => (curr.count > max.count ? curr : max),
        chartData[0] || { month: '', count: 0 }
      )

      return {
        chartData,
        mostActiveMonth: mostActive.month,
        mostActiveCount: mostActive.count,
      }
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activity || activity.chartData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Your most active month was{' '}
          <span className="font-semibold text-foreground">
            {activity.mostActiveMonth}
          </span>{' '}
          with <span className="font-semibold text-foreground">{activity.mostActiveCount}</span>{' '}
          experiences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activity.chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {activity.chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.month === activity.mostActiveMonth
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))'
                  }
                  opacity={entry.month === activity.mostActiveMonth ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">
              {activity.chartData.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {(
                activity.chartData.reduce((sum, d) => sum + d.count, 0) /
                activity.chartData.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Avg per Month</p>
          </div>
          <div>
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              {activity.mostActiveCount}
            </div>
            <p className="text-xs text-muted-foreground">Peak Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
