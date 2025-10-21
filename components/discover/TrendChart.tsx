/**
 * XPShare AI - Trend Chart Component
 *
 * Visualizes historical data with trend predictions and confidence intervals.
 * Uses Recharts for rendering with Area and Line charts.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { TrendAnalysis } from '@/lib/tools/insights/predict-trends'
import { cn } from '@/lib/utils'

// ============================================================================
// Props
// ============================================================================

export interface TrendChartProps {
  trendAnalysis: TrendAnalysis
  title?: string
  description?: string
  height?: number
  showConfidenceInterval?: boolean
  showLegend?: boolean
  showStats?: boolean
  className?: string
  theme?: 'light' | 'dark'
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get color for trend type
 */
function getTrendColor(trend: string): string {
  switch (trend) {
    case 'increasing':
      return '#10b981' // Green
    case 'decreasing':
      return '#ef4444' // Red
    case 'stable':
      return '#6b7280' // Gray
    default:
      return '#3b82f6' // Blue
  }
}

/**
 * Get significance badge variant
 */
function getSignificanceBadge(significance: string) {
  switch (significance) {
    case 'strong':
      return { variant: 'default' as const, color: 'bg-green-500' }
    case 'moderate':
      return { variant: 'secondary' as const, color: 'bg-blue-500' }
    case 'weak':
      return { variant: 'outline' as const, color: 'bg-yellow-500' }
    case 'none':
      return { variant: 'outline' as const, color: 'bg-gray-500' }
    default:
      return { variant: 'outline' as const, color: 'bg-gray-500' }
  }
}

// ============================================================================
// Component
// ============================================================================

export function TrendChart({
  trendAnalysis,
  title = 'Trend Analysis & Predictions',
  description,
  height = 400,
  showConfidenceInterval = true,
  showLegend = true,
  showStats = true,
  className,
  theme = 'light',
}: TrendChartProps) {
  const { historicalData, predictions, trend, significance, rSquared, correlation, slope } =
    trendAnalysis

  // Combine historical and prediction data
  const chartData = [
    ...historicalData.map((item) => ({
      period: item.period,
      actual: item.count,
      predicted: null,
      lowerBound: null,
      upperBound: null,
      type: 'historical',
    })),
    ...predictions.map((pred) => ({
      period: pred.period,
      actual: null,
      predicted: pred.predicted,
      lowerBound: showConfidenceInterval ? pred.lowerBound : null,
      upperBound: showConfidenceInterval ? pred.upperBound : null,
      type: 'prediction',
    })),
  ]

  // Add trend line connection point
  if (historicalData.length > 0 && predictions.length > 0) {
    const lastHistorical = historicalData[historicalData.length - 1]
    const firstPrediction = predictions[0]

    // Insert connection point
    chartData.splice(historicalData.length, 0, {
      period: firstPrediction.period,
      actual: lastHistorical.count,
      predicted: firstPrediction.predicted,
      lowerBound: showConfidenceInterval ? firstPrediction.lowerBound : null,
      upperBound: showConfidenceInterval ? firstPrediction.upperBound : null,
      type: 'connection',
    })
  }

  const trendColor = getTrendColor(trend)
  const significanceBadge = getSignificanceBadge(significance)

  // Colors
  const colors = {
    actual: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    predicted: theme === 'dark' ? '#fbbf24' : '#f59e0b',
    confidence: theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={cn('capitalize', `border-[${trendColor}] text-[${trendColor}]`)}
              style={{ borderColor: trendColor, color: trendColor }}
            >
              {trend}
            </Badge>
            <Badge variant={significanceBadge.variant} className={significanceBadge.color}>
              {significance}
            </Badge>
          </div>
        </div>

        {showStats && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">R² Score</p>
              <p className="text-lg font-semibold">{rSquared.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Correlation</p>
              <p className="text-lg font-semibold">{correlation.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Slope</p>
              <p className="text-lg font-semibold">{slope.toFixed(3)}</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="period"
              stroke={colors.text}
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke={colors.text} style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${colors.grid}`,
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: colors.text }}
              formatter={(value: any, name: string) => {
                if (value === null) return ['-', name]
                return [Math.round(value), name]
              }}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
                verticalAlign="top"
                height={36}
              />
            )}

            {/* Confidence Interval Area */}
            {showConfidenceInterval && (
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill={colors.confidence}
                fillOpacity={1}
                name="Confidence Interval"
              />
            )}
            {showConfidenceInterval && (
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill={colors.confidence}
                fillOpacity={1}
              />
            )}

            {/* Actual Data Line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke={colors.actual}
              strokeWidth={2}
              dot={{ r: 4, fill: colors.actual }}
              name="Actual"
              connectNulls={false}
            />

            {/* Predicted Data Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={colors.predicted}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: colors.predicted }}
              name="Predicted"
              connectNulls={false}
            />

            {/* Vertical line at prediction start */}
            {historicalData.length > 0 && (
              <ReferenceLine
                x={historicalData[historicalData.length - 1].period}
                stroke={colors.text}
                strokeDasharray="3 3"
                label={{ value: 'Forecast →', position: 'top', fontSize: 10, fill: colors.text }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Prediction Summary */}
        {predictions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">Forecast Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {predictions.slice(0, 4).map((pred) => (
                <div
                  key={pred.period}
                  className="p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pred.period}</p>
                  <p className="text-sm font-semibold">{pred.predicted}</p>
                  {showConfidenceInterval && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pred.lowerBound}-{pred.upperBound}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
