/**
 * XPShare AI - Predict Trends Tool
 *
 * Generates temporal trend predictions using linear regression and time series analysis.
 * Provides forecast data with confidence intervals.
 */

import { tool } from 'ai'
import { z } from 'zod'

// ============================================================================
// Schema Definition
// ============================================================================

const predictTrendsSchema = z.object({
  data: z
    .array(z.any())
    .describe('Array of temporal data to analyze for trends (experiences with dates)'),
  forecastPeriods: z
    .number()
    .min(1)
    .max(12)
    .default(3)
    .describe('Number of periods to forecast into the future (1-12)'),
  granularity: z
    .enum(['day', 'week', 'month', 'year'])
    .default('month')
    .describe('Time granularity for aggregation'),
  minDataPoints: z
    .number()
    .min(2)
    .max(100)
    .default(3)
    .describe('Minimum data points required for prediction'),
  confidenceLevel: z
    .number()
    .min(0.5)
    .max(0.99)
    .default(0.95)
    .describe('Confidence level for prediction intervals (0.5-0.99)'),
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface TrendPrediction {
  period: string
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface TrendAnalysis {
  slope: number
  intercept: number
  rSquared: number
  correlation: number
  trend: 'increasing' | 'decreasing' | 'stable'
  significance: 'strong' | 'moderate' | 'weak' | 'none'
  predictions: TrendPrediction[]
  historicalData: Array<{ period: string; count: number }>
}

// ============================================================================
// Time Period Utilities
// ============================================================================

/**
 * Format date to period string based on granularity
 */
function formatPeriod(date: Date, granularity: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (granularity) {
    case 'day':
      return `${year}-${month}-${day}`
    case 'week':
      // ISO week number
      const firstDayOfYear = new Date(year, 0, 1)
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      return `${year}-W${String(weekNumber).padStart(2, '0')}`
    case 'month':
      return `${year}-${month}`
    case 'year':
      return `${year}`
    default:
      return `${year}-${month}`
  }
}

/**
 * Get next period after given period
 */
function getNextPeriod(period: string, granularity: string): string {
  if (granularity === 'day') {
    const [year, month, day] = period.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + 1)
    return formatPeriod(date, granularity)
  }

  if (granularity === 'week') {
    const [yearStr, weekStr] = period.split('-W')
    const year = Number(yearStr)
    const week = Number(weekStr)

    // Simple week increment
    if (week < 52) {
      return `${year}-W${String(week + 1).padStart(2, '0')}`
    } else {
      return `${year + 1}-W01`
    }
  }

  if (granularity === 'month') {
    const [year, month] = period.split('-').map(Number)
    if (month < 12) {
      return `${year}-${String(month + 1).padStart(2, '0')}`
    } else {
      return `${year + 1}-01`
    }
  }

  if (granularity === 'year') {
    const year = Number(period)
    return `${year + 1}`
  }

  return period
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Calculate linear regression (y = mx + b)
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

/**
 * Calculate R² (coefficient of determination)
 */
function calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
  const meanY = y.reduce((a, b) => a + b, 0) / y.length
  const yPred = x.map((xi) => slope * xi + intercept)

  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0)

  if (ssTot === 0) return 0
  return 1 - ssRes / ssTot
}

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  if (denomX === 0 || denomY === 0) return 0
  return numerator / Math.sqrt(denomX * denomY)
}

/**
 * Calculate standard error of prediction
 */
function calculateStandardError(y: number[], yPred: number[]): number {
  const n = y.length
  const sumSquaredErrors = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0)
  return Math.sqrt(sumSquaredErrors / (n - 2))
}

/**
 * Get Z-score for confidence level
 */
function getZScore(confidenceLevel: number): number {
  // Common Z-scores for confidence levels
  const zScores: Record<number, number> = {
    0.5: 0.674,
    0.8: 1.282,
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  }

  // Find closest confidence level
  const levels = Object.keys(zScores)
    .map(Number)
    .sort((a, b) => Math.abs(a - confidenceLevel) - Math.abs(b - confidenceLevel))

  return zScores[levels[0]]
}

// ============================================================================
// Trend Analysis
// ============================================================================

/**
 * Analyze temporal trend and generate predictions
 */
function analyzeTrend(
  data: any[],
  granularity: string,
  forecastPeriods: number,
  confidenceLevel: number
): TrendAnalysis {
  // Aggregate by period
  const periodCounts = new Map<string, number>()

  data.forEach((item) => {
    const dateStr = item.date_occurred || item.created_at || item.period
    if (!dateStr) return

    let date: Date
    if (typeof dateStr === 'string') {
      date = new Date(dateStr)
    } else {
      date = dateStr
    }

    if (isNaN(date.getTime())) return

    const period = formatPeriod(date, granularity)
    periodCounts.set(period, (periodCounts.get(period) || 0) + 1)
  })

  // Sort periods chronologically
  const sorted = Array.from(periodCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  const periods = sorted.map(([period]) => period)
  const counts = sorted.map(([_, count]) => count)

  // Historical data for response
  const historicalData = sorted.map(([period, count]) => ({ period, count }))

  // Perform linear regression
  const n = counts.length
  const x = Array.from({ length: n }, (_, i) => i)
  const { slope, intercept } = linearRegression(x, counts)

  // Calculate R²
  const rSquared = calculateRSquared(x, counts, slope, intercept)

  // Calculate correlation
  const correlation = pearsonCorrelation(x, counts)

  // Calculate standard error
  const yPred = x.map((xi) => slope * xi + intercept)
  const standardError = calculateStandardError(counts, yPred)

  // Determine trend direction
  let trend: 'increasing' | 'decreasing' | 'stable'
  if (Math.abs(slope) < 0.1) {
    trend = 'stable'
  } else if (slope > 0) {
    trend = 'increasing'
  } else {
    trend = 'decreasing'
  }

  // Determine significance
  let significance: 'strong' | 'moderate' | 'weak' | 'none'
  if (rSquared >= 0.8) {
    significance = 'strong'
  } else if (rSquared >= 0.6) {
    significance = 'moderate'
  } else if (rSquared >= 0.4) {
    significance = 'weak'
  } else {
    significance = 'none'
  }

  // Generate predictions
  const predictions: TrendPrediction[] = []
  const zScore = getZScore(confidenceLevel)

  let lastPeriod = periods[periods.length - 1]
  for (let i = 0; i < forecastPeriods; i++) {
    const futureX = n + i
    const predicted = slope * futureX + intercept

    // Calculate prediction interval
    const margin = zScore * standardError * Math.sqrt(1 + 1 / n + Math.pow(futureX - n / 2, 2) / n)
    const lowerBound = Math.max(0, predicted - margin)
    const upperBound = predicted + margin

    // Get next period
    lastPeriod = getNextPeriod(lastPeriod, granularity)

    // Confidence decreases with distance
    const confidence = Math.max(0.5, rSquared * Math.pow(0.9, i))

    predictions.push({
      period: lastPeriod,
      predicted: Math.max(0, Math.round(predicted)),
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
      confidence,
    })
  }

  return {
    slope,
    intercept,
    rSquared,
    correlation,
    trend,
    significance,
    predictions,
    historicalData,
  }
}

// ============================================================================
// Main Tool
// ============================================================================

export const predictTrendsTool = tool({
  description: `Analyze temporal trends and generate predictions using linear regression.

  Features:
  - Linear regression with R² calculation
  - Pearson correlation coefficient
  - Confidence intervals for predictions
  - Multiple time granularities (day/week/month/year)
  - Trend significance classification

  Returns historical data, trend analysis, and forecast predictions.`,
  parameters: predictTrendsSchema,
  execute: async ({ data, forecastPeriods, granularity, minDataPoints, confidenceLevel }) => {
    // Filter data with temporal information
    const temporalData = data.filter(
      (item) => item.date_occurred || item.created_at || item.period
    )

    if (temporalData.length < minDataPoints) {
      return {
        success: false,
        error: `Insufficient data points. Need at least ${minDataPoints}, got ${temporalData.length}`,
        trend: null,
      }
    }

    // Analyze trend
    const trendAnalysis = analyzeTrend(temporalData, granularity, forecastPeriods, confidenceLevel)

    return {
      success: true,
      trend: trendAnalysis,
      summary: `Analyzed ${temporalData.length} data points. Trend: ${trendAnalysis.trend} (${trendAnalysis.significance}, R²=${trendAnalysis.rSquared.toFixed(3)}). Generated ${forecastPeriods} predictions.`,
      metadata: {
        dataPoints: temporalData.length,
        granularity,
        forecastPeriods,
        confidenceLevel,
      },
    }
  },
})
