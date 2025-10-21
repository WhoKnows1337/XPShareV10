/**
 * XPShare AI - Generate Insights Tool
 *
 * Detects patterns and generates actionable insights from data.
 * Uses statistical analysis and pattern recognition algorithms.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// Schema Definition
// ============================================================================

const generateInsightsSchema = z.object({
  data: z
    .array(z.any())
    .describe('Array of data to analyze for insights (experiences, temporal data, etc.)'),
  analysisType: z
    .enum(['temporal', 'geographic', 'category', 'correlation', 'all'])
    .default('all')
    .describe('Type of analysis to perform'),
  minConfidence: z
    .number()
    .min(0)
    .max(1)
    .default(0.7)
    .describe('Minimum confidence score for insights (0-1)'),
  maxInsights: z.number().min(1).max(20).default(10).describe('Maximum number of insights to return'),
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface Insight {
  id: string
  type: 'spike' | 'trend' | 'hotspot' | 'correlation' | 'anomaly' | 'pattern'
  title: string
  description: string
  confidence: number
  evidence: Array<{
    label: string
    value: string | number
  }>
  actionable: boolean
  recommendation?: string
}

// ============================================================================
// Pattern Detection Functions
// ============================================================================

/**
 * Detect temporal spikes in data
 */
function detectTemporalSpikes(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Group by period
  const periodCounts = new Map<string, number>()
  data.forEach((item) => {
    const date = item.date_occurred || item.created_at || item.period
    if (!date) return

    const period = typeof date === 'string' ? date.substring(0, 7) : date // YYYY-MM
    periodCounts.set(period, (periodCounts.get(period) || 0) + 1)
  })

  if (periodCounts.size === 0) return insights

  // Calculate statistics
  const counts = Array.from(periodCounts.values())
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  const variance = counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  // Find spikes (> mean + 2 * stdDev)
  periodCounts.forEach((count, period) => {
    if (count > mean + 2 * stdDev) {
      const confidence = Math.min(0.99, (count - mean) / (3 * stdDev))

      insights.push({
        id: `spike-${period}`,
        type: 'spike',
        title: `Activity Spike in ${period}`,
        description: `Detected ${count} events in ${period}, significantly higher than average (${mean.toFixed(1)})`,
        confidence,
        evidence: [
          { label: 'Period', value: period },
          { label: 'Count', value: count },
          { label: 'Average', value: mean.toFixed(1) },
          { label: 'Deviation', value: `+${((count - mean) / mean * 100).toFixed(1)}%` },
        ],
        actionable: true,
        recommendation: `Investigate what caused the spike in ${period}. Check for external events or data quality issues.`,
      })
    }
  })

  return insights
}

/**
 * Detect temporal trends (increasing/decreasing)
 */
function detectTemporalTrends(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Group by period
  const periodCounts = new Map<string, number>()
  data.forEach((item) => {
    const date = item.date_occurred || item.created_at || item.period
    if (!date) return

    const period = typeof date === 'string' ? date.substring(0, 7) : date
    periodCounts.set(period, (periodCounts.get(period) || 0) + 1)
  })

  if (periodCounts.size < 3) return insights // Need at least 3 periods

  // Sort by period
  const sorted = Array.from(periodCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  const periods = sorted.map(([period]) => period)
  const counts = sorted.map(([_, count]) => count)

  // Simple linear regression
  const n = counts.length
  const x = Array.from({ length: n }, (_, i) => i)
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = counts.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (counts[i] - meanY)
    denominator += Math.pow(x[i] - meanX, 2)
  }

  const slope = numerator / denominator
  const intercept = meanY - slope * meanX

  // Calculate R²
  const yPred = x.map((xi) => slope * xi + intercept)
  const ssTot = counts.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssRes = counts.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0)
  const rSquared = 1 - ssRes / ssTot

  // Detect trend if R² > 0.6 and slope is significant
  if (rSquared > 0.6 && Math.abs(slope) > 0.1) {
    const trendType = slope > 0 ? 'increasing' : 'decreasing'
    const confidence = Math.min(0.99, rSquared)

    insights.push({
      id: 'trend-overall',
      type: 'trend',
      title: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Trend Detected`,
      description: `Activity is ${trendType} over time with ${(rSquared * 100).toFixed(1)}% correlation`,
      confidence,
      evidence: [
        { label: 'Trend', value: trendType },
        { label: 'R² Score', value: rSquared.toFixed(3) },
        { label: 'Slope', value: slope.toFixed(3) },
        { label: 'Periods', value: `${periods[0]} to ${periods[periods.length - 1]}` },
      ],
      actionable: true,
      recommendation: `${slope > 0 ? 'Monitor continued growth' : 'Investigate cause of decline'} and plan accordingly.`,
    })
  }

  return insights
}

/**
 * Detect geographic hotspots
 */
function detectGeographicHotspots(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Filter data with coordinates
  const geoData = data.filter(
    (item) =>
      item.location_lat !== undefined &&
      item.location_lng !== undefined &&
      !isNaN(item.location_lat) &&
      !isNaN(item.location_lng)
  )

  if (geoData.length < 10) return insights

  // Simple grid-based clustering (1° x 1° cells)
  const gridCounts = new Map<string, { count: number; lat: number; lng: number }>()

  geoData.forEach((item) => {
    const gridLat = Math.floor(item.location_lat)
    const gridLng = Math.floor(item.location_lng)
    const key = `${gridLat},${gridLng}`

    if (!gridCounts.has(key)) {
      gridCounts.set(key, { count: 0, lat: gridLat, lng: gridLng })
    }

    gridCounts.get(key)!.count++
  })

  // Find hotspots (> 5% of total data in one cell)
  const threshold = Math.max(3, geoData.length * 0.05)

  gridCounts.forEach((cell, key) => {
    if (cell.count >= threshold) {
      const percentage = (cell.count / geoData.length) * 100
      const confidence = Math.min(0.95, percentage / 20)

      insights.push({
        id: `hotspot-${key}`,
        type: 'hotspot',
        title: `Geographic Hotspot at ${cell.lat}°N, ${cell.lng}°E`,
        description: `${cell.count} events (${percentage.toFixed(1)}%) concentrated in this area`,
        confidence,
        evidence: [
          { label: 'Location', value: `${cell.lat}°, ${cell.lng}°` },
          { label: 'Count', value: cell.count },
          { label: 'Percentage', value: `${percentage.toFixed(1)}%` },
        ],
        actionable: true,
        recommendation: 'Investigate why this location has significantly more activity.',
      })
    }
  })

  return insights
}

/**
 * Detect category correlations
 */
function detectCategoryPatterns(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Count by category
  const categoryCounts = new Map<string, number>()
  data.forEach((item) => {
    if (item.category) {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1)
    }
  })

  if (categoryCounts.size === 0) return insights

  // Find dominant category (> 40% of data)
  const total = data.length
  categoryCounts.forEach((count, category) => {
    const percentage = (count / total) * 100

    if (percentage > 40) {
      const confidence = Math.min(0.95, percentage / 50)

      insights.push({
        id: `dominant-${category}`,
        type: 'pattern',
        title: `${category.toUpperCase()} Dominance`,
        description: `${category} represents ${percentage.toFixed(1)}% of all experiences`,
        confidence,
        evidence: [
          { label: 'Category', value: category },
          { label: 'Count', value: count },
          { label: 'Percentage', value: `${percentage.toFixed(1)}%` },
        ],
        actionable: true,
        recommendation: `Focus analysis on ${category} category or investigate why other categories are underrepresented.`,
      })
    }
  })

  return insights
}

/**
 * Detect anomalies
 */
function detectAnomalies(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Check for data quality issues
  const withoutGeo = data.filter(
    (item) => item.location_lat === undefined || item.location_lng === undefined
  ).length

  const withoutDate = data.filter(
    (item) => !item.date_occurred && !item.created_at && !item.period
  ).length

  if (withoutGeo > data.length * 0.5) {
    insights.push({
      id: 'anomaly-missing-geo',
      type: 'anomaly',
      title: 'Missing Geographic Data',
      description: `${withoutGeo} out of ${data.length} items (${((withoutGeo / data.length) * 100).toFixed(1)}%) missing location data`,
      confidence: 0.99,
      evidence: [
        { label: 'Missing Geo', value: withoutGeo },
        { label: 'Total', value: data.length },
        { label: 'Percentage', value: `${((withoutGeo / data.length) * 100).toFixed(1)}%` },
      ],
      actionable: true,
      recommendation: 'Consider geocoding experiences or filtering by location availability.',
    })
  }

  if (withoutDate > data.length * 0.5) {
    insights.push({
      id: 'anomaly-missing-date',
      type: 'anomaly',
      title: 'Missing Temporal Data',
      description: `${withoutDate} out of ${data.length} items missing date information`,
      confidence: 0.99,
      evidence: [
        { label: 'Missing Date', value: withoutDate },
        { label: 'Total', value: data.length },
      ],
      actionable: true,
      recommendation: 'Temporal analysis may be incomplete. Consider filtering by date availability.',
    })
  }

  return insights
}

// ============================================================================
// Main Tool
// ============================================================================

export const generateInsightsTool = tool({
  description: `Generate actionable insights from data using pattern detection and statistical analysis.

  Detects:
  - Temporal spikes and trends
  - Geographic hotspots
  - Category patterns and correlations
  - Data anomalies

  Each insight includes confidence score, evidence, and actionable recommendations.`,
  parameters: generateInsightsSchema,
  execute: async ({ data, analysisType, minConfidence, maxInsights }) => {
    const allInsights: Insight[] = []

    // Run analysis based on type
    if (analysisType === 'temporal' || analysisType === 'all') {
      allInsights.push(...detectTemporalSpikes(data))
      allInsights.push(...detectTemporalTrends(data))
    }

    if (analysisType === 'geographic' || analysisType === 'all') {
      allInsights.push(...detectGeographicHotspots(data))
    }

    if (analysisType === 'category' || analysisType === 'all') {
      allInsights.push(...detectCategoryPatterns(data))
    }

    if (analysisType === 'all') {
      allInsights.push(...detectAnomalies(data))
    }

    // Filter by confidence and limit
    const filteredInsights = allInsights
      .filter((insight) => insight.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxInsights)

    return {
      insights: filteredInsights,
      count: filteredInsights.length,
      summary: `Generated ${filteredInsights.length} insights from ${data.length} data points`,
    }
  },
})
