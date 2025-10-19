'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface CategoryRadarChartProps {
  categoryDistribution: Record<string, number>
}

export function CategoryRadarChart({ categoryDistribution }: CategoryRadarChartProps) {
  const chartData = Object.entries(categoryDistribution).map(([category, count]) => ({
    category: category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value: count,
  }))

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} />
            <Radar
              name="Experiences"
              dataKey="value"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
