'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface AnalyticsChartsProps {
  data: {
    timeSeries: any[]
    summary: any[]
  }
  isLoading: boolean
}

export function AnalyticsCharts({ data, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading charts...</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading charts...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Aggregate time series data by date
  const dailyData = data.timeSeries.reduce((acc: any[], item: any) => {
    const existingDate = acc.find((d) => d.date === item.date)
    if (existingDate) {
      existingDate.shown += item.shown_count || 0
      existingDate.answered += item.answered_count || 0
      existingDate.skipped += item.skipped_count || 0
    } else {
      acc.push({
        date: item.date,
        shown: item.shown_count || 0,
        answered: item.answered_count || 0,
        skipped: item.skipped_count || 0,
      })
    }
    return acc
  }, [])

  // Sort by date
  dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Format dates for display
  const formattedDailyData = dailyData.map((item) => ({
    ...item,
    displayDate: format(new Date(item.date), 'MMM dd'),
  }))

  // Top performing questions
  const topQuestions = [...data.summary]
    .sort((a, b) => (b.answer_rate || 0) - (a.answer_rate || 0))
    .slice(0, 10)
    .map((q) => ({
      name: q.question_text.substring(0, 30) + '...',
      rate: q.answer_rate || 0,
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Question Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedDailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="shown"
                stroke="#8884d8"
                name="Shown"
              />
              <Line
                type="monotone"
                dataKey="answered"
                stroke="#82ca9d"
                name="Answered"
              />
              <Line
                type="monotone"
                dataKey="skipped"
                stroke="#ff7c7c"
                name="Skipped"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Questions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Questions by Answer Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topQuestions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="rate" fill="#8884d8" name="Answer Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
