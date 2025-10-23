/**
 * XPShare Mastra - Insights Tools
 *
 * 4 insights tools for pattern detection, trend prediction, follow-up suggestions, and data export
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import type { XPShareContext } from '../types'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

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

export interface FollowUpSuggestion {
  id: string
  type: 'explore' | 'filter' | 'visualize' | 'analyze' | 'compare' | 'export'
  label: string
  description: string
  query: string
  icon?: string
  priority: number
}

export interface ExportResult {
  format: 'json' | 'csv'
  filename: string
  content: string
  size: number
  recordCount: number
  downloadUrl?: string
}

// ============================================================================
// Generate Insights Tool
// ============================================================================

/**
 * Generate Insights Tool
 *
 * Detects patterns and generates actionable insights from data.
 * Uses statistical analysis and pattern recognition algorithms.
 *
 * Note: Has OPTIONAL RLS - can fetch data by category or analyze provided data.
 */
export const generateInsightsTool = createTool<XPShareContext>({
  id: 'generateInsights',
  description:
    'UNIFIED ANALYSIS TOOL: Analyze experiences by category with two modes: 1) complexity="basic" for simple summaries (counts, locations, dates), 2) complexity="insights" for advanced statistical analysis with confidence scores, pattern detection, and recommendations. Can fetch data automatically by category OR analyze pre-fetched data. Use this when user asks to analyze, generate insights, or understand patterns in experience data.',

  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe(
        'Category slug to fetch and analyze (e.g., "ufo-uap", "dreams", "nde-obe", "paranormal-anomalies", "synchronicity", "psychedelics", "altered-states"). If provided, tool will fetch data automatically.'
      ),
    data: z
      .array(z.object({}).passthrough())
      .optional()
      .describe('Pre-fetched data to analyze. If category is provided, this is ignored.'),
    analysisType: z
      .enum(['temporal', 'geographic', 'category', 'correlation', 'all'])
      .default('all')
      .describe('Type of analysis to perform'),
    complexity: z
      .enum(['basic', 'insights'])
      .default('insights')
      .describe(
        'basic = simple summary stats, insights = advanced pattern detection with confidence scores'
      ),
    minConfidence: z
      .number()
      .min(0)
      .max(1)
      .default(0.7)
      .describe('Minimum confidence score for insights (0-1). Only used when complexity=insights.'),
    maxInsights: z.number().min(1).max(20).default(10).describe('Maximum number of insights to return'),
  }),

  outputSchema: z.object({
    insights: z.array(z.any()).optional(),
    count: z.number(),
    summary: z.string(),
    error: z.string().optional(),
    locations: z.array(z.string()).optional(),
    dateRange: z
      .object({
        earliest: z.string(),
        latest: z.string(),
      })
      .optional(),
  }),

  execute: async ({ runtimeContext, context: params }) => {
    // Fetch data if category is provided (using request-scoped Supabase client)
    let analysisData = params.data || []

    if (params.category && !params.data) {
      const supabase = runtimeContext.get('supabase')
      const { data: fetchedData, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('category', params.category)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        return {
          error: `Failed to fetch ${params.category} experiences: ${error.message}`,
          count: 0,
          summary: 'Error fetching data',
        }
      }

      analysisData = fetchedData || []
    }

    if (analysisData.length === 0) {
      return {
        error: 'No data provided or fetched for analysis',
        count: 0,
        summary: 'No data available',
      }
    }

    // BASIC MODE: Simple summary stats
    if (params.complexity === 'basic') {
      const locations = analysisData.map((exp: any) => exp.location).filter(Boolean)
      const dates = analysisData.map((exp: any) => exp.date_occurred || exp.created_at).filter(Boolean)

      return {
        summary: `Found ${analysisData.length} ${params.category || 'experiences'}`,
        count: analysisData.length,
        locations: Array.from(new Set(locations)).slice(0, 10),
        dateRange:
          dates.length > 0
            ? {
                earliest: dates.sort()[0],
                latest: dates.sort()[dates.length - 1],
              }
            : undefined,
      }
    }

    // INSIGHTS MODE: Advanced pattern detection
    const allInsights: Insight[] = []

    // Run analysis based on type
    if (params.analysisType === 'temporal' || params.analysisType === 'all') {
      allInsights.push(...detectTemporalSpikes(analysisData))
      allInsights.push(...detectTemporalTrends(analysisData))
    }

    if (params.analysisType === 'geographic' || params.analysisType === 'all') {
      allInsights.push(...detectGeographicHotspots(analysisData))
    }

    if (params.analysisType === 'category' || params.analysisType === 'all') {
      allInsights.push(...detectCategoryPatterns(analysisData))
    }

    if (params.analysisType === 'all') {
      allInsights.push(...detectAnomalies(analysisData))
    }

    // Filter by confidence and limit
    const filteredInsights = allInsights
      .filter((insight) => insight.confidence >= params.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, params.maxInsights)

    return {
      insights: filteredInsights,
      count: filteredInsights.length,
      summary: `Generated ${filteredInsights.length} insights from ${analysisData.length} data points`,
    }
  },
})

// ============================================================================
// Predict Trends Tool
// ============================================================================

/**
 * Predict Trends Tool
 *
 * Generates temporal trend predictions using linear regression and time series analysis.
 * Provides forecast data with confidence intervals.
 *
 * Note: This tool does NOT use RLS (no Supabase access) - operates on provided data.
 */
export const predictTrendsTool = createTool<XPShareContext>({
  id: 'predictTrends',
  description:
    'Analyze temporal trends and generate predictions using linear regression. Features: Linear regression with R² calculation, Pearson correlation coefficient, Confidence intervals for predictions, Multiple time granularities (day/week/month/year), Trend significance classification. Returns historical data, trend analysis, and forecast predictions.',

  inputSchema: z.object({
    data: z
      .array(z.object({}).passthrough())
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
  }),

  outputSchema: z.object({
    success: z.boolean(),
    trend: z.any().optional(),
    error: z.string().optional(),
    summary: z.string(),
    metadata: z
      .object({
        dataPoints: z.number(),
        granularity: z.string(),
        forecastPeriods: z.number(),
        confidenceLevel: z.number(),
      })
      .optional(),
  }),

  execute: async ({ context: params }) => {
    // Note: No runtimeContext.get('supabase') - this tool doesn't access database

    // Filter data with temporal information
    const temporalData = params.data.filter((item) => item.date_occurred || item.created_at || item.period)

    if (temporalData.length < params.minDataPoints) {
      return {
        success: false,
        error: `Insufficient data points. Need at least ${params.minDataPoints}, got ${temporalData.length}`,
        summary: 'Error: Insufficient data',
      }
    }

    // Analyze trend
    const trendAnalysis = analyzeTrend(
      temporalData,
      params.granularity,
      params.forecastPeriods,
      params.confidenceLevel
    )

    return {
      success: true,
      trend: trendAnalysis,
      summary: `Analyzed ${temporalData.length} data points. Trend: ${trendAnalysis.trend} (${trendAnalysis.significance}, R²=${trendAnalysis.rSquared.toFixed(3)}). Generated ${params.forecastPeriods} predictions.`,
      metadata: {
        dataPoints: temporalData.length,
        granularity: params.granularity,
        forecastPeriods: params.forecastPeriods,
        confidenceLevel: params.confidenceLevel,
      },
    }
  },
})

// ============================================================================
// Suggest Follow-Ups Tool
// ============================================================================

/**
 * Suggest Follow-Ups Tool
 *
 * Generates context-aware follow-up suggestions based on current query results
 * and conversation history. Uses GPT-based analysis for intelligent suggestions.
 *
 * Note: This tool does NOT use RLS (no Supabase access) - operates on provided data.
 */
export const suggestFollowupsTool = createTool<XPShareContext>({
  id: 'suggestFollowups',
  description:
    'Generate intelligent follow-up suggestions based on query results and context. Features: GPT-powered context-aware suggestions, Template-based fallback suggestions, Multiple suggestion types (explore, filter, visualize, analyze, compare, export), Priority scoring for relevance, Conversation history awareness. Returns array of actionable follow-up queries with descriptions and icons.',

  inputSchema: z.object({
    query: z.string().describe('The original user query'),
    results: z.any().describe('The query results (data, insights, predictions, etc.)'),
    context: z
      .object({
        category: z.string().optional().describe('Primary category if applicable'),
        location: z.string().optional().describe('Location context if applicable'),
        timeRange: z.string().optional().describe('Time range of results'),
        totalResults: z.number().optional().describe('Total number of results'),
      })
      .optional()
      .describe('Additional context about the query'),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .optional()
      .describe('Previous conversation messages for context'),
    maxSuggestions: z.number().min(1).max(10).default(5).describe('Maximum number of suggestions'),
  }),

  outputSchema: z.object({
    suggestions: z.array(z.any()),
    count: z.number(),
    summary: z.string(),
    usedGPT: z.boolean(),
  }),

  execute: async ({ context: params }) => {
    // Note: No runtimeContext.get('supabase') - this tool doesn't access database

    // Generate template-based suggestions as baseline
    const templateSuggestions = generateTemplateSuggestions(params.query, params.results, params.context)

    // Try GPT-based suggestions
    const gptSuggestions = await generateIntelligentSuggestions(
      params.query,
      params.results,
      params.context,
      params.conversationHistory,
      params.maxSuggestions
    )

    // Combine suggestions, prioritizing GPT if available
    let suggestions: FollowUpSuggestion[]
    if (gptSuggestions.length > 0) {
      // Use GPT suggestions with template fallbacks
      suggestions = [
        ...gptSuggestions,
        ...templateSuggestions.filter(
          (ts) => !gptSuggestions.some((gs) => gs.type === ts.type && gs.label === ts.label)
        ),
      ]
    } else {
      // Use only template suggestions
      suggestions = templateSuggestions
    }

    // Sort by priority and limit
    suggestions.sort((a, b) => b.priority - a.priority)
    suggestions = suggestions.slice(0, params.maxSuggestions)

    return {
      suggestions,
      count: suggestions.length,
      summary: `Generated ${suggestions.length} follow-up suggestions`,
      usedGPT: gptSuggestions.length > 0,
    }
  },
})

// ============================================================================
// Export Results Tool
// ============================================================================

/**
 * Export Results Tool
 *
 * Exports query results and analysis data in various formats (JSON, CSV).
 * Handles data transformation and formatting for download.
 *
 * Note: This tool does NOT use RLS (no Supabase access) - operates on provided data.
 */
export const exportResultsTool = createTool<XPShareContext>({
  id: 'exportResults',
  description:
    'Export query results and analysis data in JSON or CSV format. Features: JSON export with optional metadata, CSV export with automatic flattening of nested objects, Custom filename support, Field selection for CSV exports, Automatic timestamp generation, Data normalization (handles arrays, objects, wrappers). Returns export content as string with metadata.',

  inputSchema: z.object({
    data: z.any().describe('Data to export (experiences, insights, predictions, etc.)'),
    format: z.enum(['json', 'csv']).default('json').describe('Export format'),
    filename: z.string().optional().describe('Custom filename (without extension)'),
    includeMetadata: z
      .boolean()
      .default(true)
      .describe('Include metadata (timestamp, query, etc.)'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Specific fields to include (for CSV, defaults to all)'),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    export: z.any().optional(),
    error: z.string().optional(),
    summary: z.string(),
  }),

  execute: async ({ context: params }) => {
    // Note: No runtimeContext.get('supabase') - this tool doesn't access database

    try {
      const exportResult = exportData(
        params.data,
        params.format,
        params.filename,
        params.includeMetadata,
        params.fields
      )

      return {
        success: true,
        export: exportResult,
        summary: `Exported ${exportResult.recordCount} records as ${params.format.toUpperCase()} (${(exportResult.size / 1024).toFixed(2)} KB)`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        summary: 'Export failed',
      }
    }
  },
})

// ============================================================================
// Helper Functions for Generate Insights
// ============================================================================

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
          { label: 'Deviation', value: `+${(((count - mean) / mean) * 100).toFixed(1)}%` },
        ],
        actionable: true,
        recommendation: `Investigate what caused the spike in ${period}. Check for external events or data quality issues.`,
      })
    }
  })

  return insights
}

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

function detectAnomalies(data: any[]): Insight[] {
  const insights: Insight[] = []

  // Check for data quality issues
  const withoutGeo = data.filter(
    (item) => item.location_lat === undefined || item.location_lng === undefined
  ).length

  const withoutDate = data.filter((item) => !item.date_occurred && !item.created_at && !item.period).length

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
// Helper Functions for Predict Trends
// ============================================================================

function formatPeriod(date: Date, granularity: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (granularity) {
    case 'day':
      return `${year}-${month}-${day}`
    case 'week':
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

function calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
  const meanY = y.reduce((a, b) => a + b, 0) / y.length
  const yPred = x.map((xi) => slope * xi + intercept)

  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0)

  if (ssTot === 0) return 0
  return 1 - ssRes / ssTot
}

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

function calculateStandardError(y: number[], yPred: number[]): number {
  const n = y.length
  const sumSquaredErrors = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0)
  return Math.sqrt(sumSquaredErrors / (n - 2))
}

function getZScore(confidenceLevel: number): number {
  const zScores: Record<number, number> = {
    0.5: 0.674,
    0.8: 1.282,
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  }

  const levels = Object.keys(zScores)
    .map(Number)
    .sort((a, b) => Math.abs(a - confidenceLevel) - Math.abs(b - confidenceLevel))

  return zScores[levels[0]]
}

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

  const historicalData = sorted.map(([period, count]) => ({ period, count }))

  // Perform linear regression
  const n = counts.length
  const x = Array.from({ length: n }, (_, i) => i)
  const { slope, intercept } = linearRegression(x, counts)

  const rSquared = calculateRSquared(x, counts, slope, intercept)
  const correlation = pearsonCorrelation(x, counts)

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

    const margin = zScore * standardError * Math.sqrt(1 + 1 / n + Math.pow(futureX - n / 2, 2) / n)
    const lowerBound = Math.max(0, predicted - margin)
    const upperBound = predicted + margin

    lastPeriod = getNextPeriod(lastPeriod, granularity)

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
// Helper Functions for Suggest Follow-Ups
// ============================================================================

function generateTemplateSuggestions(query: string, results: any, context?: any): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = []
  let idCounter = 0

  // Extract context
  const hasGeo = context?.location || (Array.isArray(results) && results.some((r: any) => r.location_lat))
  const hasTemporal = context?.timeRange || (Array.isArray(results) && results.some((r: any) => r.date_occurred))
  const hasCategory = context?.category || (Array.isArray(results) && results.some((r: any) => r.category))
  const totalResults = context?.totalResults || (Array.isArray(results) ? results.length : 0)

  // Visualization suggestions
  if (hasGeo && totalResults > 1) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'visualize',
      label: 'Show on map',
      description: 'Visualize geographic distribution of results',
      query: `Show me a map of ${query}`,
      icon: '🗺️',
      priority: 8,
    })
  }

  if (hasTemporal && totalResults > 2) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'visualize',
      label: 'Timeline view',
      description: 'See temporal patterns over time',
      query: `Show timeline of ${query}`,
      icon: '📈',
      priority: 8,
    })
  }

  // Analysis suggestions
  if (totalResults > 5) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'analyze',
      label: 'Detect patterns',
      description: 'Find hidden patterns and insights',
      query: `Analyze patterns in ${query}`,
      icon: '🔍',
      priority: 7,
    })
  }

  if (hasTemporal && totalResults > 3) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'analyze',
      label: 'Predict trends',
      description: 'Forecast future trends based on historical data',
      query: `Predict future trends for ${query}`,
      icon: '🔮',
      priority: 7,
    })
  }

  // Filter suggestions
  if (hasCategory && totalResults > 3) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'filter',
      label: 'Compare categories',
      description: 'Break down results by category',
      query: `Compare categories for ${query}`,
      icon: '📊',
      priority: 6,
    })
  }

  if (context?.location) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'filter',
      label: 'Nearby locations',
      description: 'Expand search to nearby areas',
      query: `Find similar experiences near ${context.location}`,
      icon: '📍',
      priority: 6,
    })
  }

  // Explore suggestions
  if (totalResults > 0) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'explore',
      label: 'Related experiences',
      description: 'Find similar or connected experiences',
      query: `Show me experiences related to ${query}`,
      icon: '🔗',
      priority: 5,
    })
  }

  if (Array.isArray(results) && results.length > 0 && results[0].user_id) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'explore',
      label: 'Top contributors',
      description: 'See who contributed most to these results',
      query: `Who are the top contributors for ${query}?`,
      icon: '👥',
      priority: 5,
    })
  }

  // Export suggestions
  if (totalResults > 0) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'export',
      label: 'Export results',
      description: 'Download data as JSON or CSV',
      query: `Export results for ${query}`,
      icon: '💾',
      priority: 4,
    })
  }

  return suggestions
}

async function generateIntelligentSuggestions(
  query: string,
  results: any,
  context: any,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxSuggestions: number = 5
): Promise<FollowUpSuggestion[]> {
  try {
    const resultsCount = Array.isArray(results) ? results.length : 1
    const hasResults = resultsCount > 0

    const systemPrompt = `You are an intelligent assistant for XPShare, a platform for exploring anomalous experiences (UFOs, dreams, NDEs, psychic events, etc.).

Your task is to suggest relevant follow-up queries based on the user's current query and results.

Guidelines:
- Be specific and actionable
- Consider the data structure (geographic, temporal, categorical)
- Build on previous conversation context
- Suggest both exploration and analysis queries
- Use natural, conversational language
- Prioritize valuable insights over generic suggestions

Return suggestions as a JSON array with this structure:
[
  {
    "type": "explore" | "filter" | "visualize" | "analyze" | "compare" | "export",
    "label": "Short label (2-4 words)",
    "description": "Brief description (1 sentence)",
    "query": "Full follow-up query text",
    "priority": 1-10 (higher = more relevant)
  }
]`

    const userPrompt = `Current Query: "${query}"
Results: ${hasResults ? `${resultsCount} results found` : 'No results'}
Context: ${JSON.stringify(context || {}, null, 2)}
${conversationHistory ? `\nConversation History:\n${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}` : ''}

Generate ${maxSuggestions} relevant follow-up suggestions.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    })

    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      throw new Error('GPT response is not an array')
    }

    return parsed.slice(0, maxSuggestions).map((s: any, i: number) => ({
      id: `gpt-followup-${i}`,
      type: s.type || 'explore',
      label: s.label || 'Follow-up',
      description: s.description || '',
      query: s.query || '',
      icon: getIconForType(s.type),
      priority: s.priority || 5,
    }))
  } catch (error) {
    console.error('GPT suggestion generation failed:', error)
    return []
  }
}

function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    explore: '🔍',
    filter: '🎯',
    visualize: '📊',
    analyze: '🧠',
    compare: '⚖️',
    export: '💾',
  }
  return icons[type] || '💡'
}

// ============================================================================
// Helper Functions for Export Results
// ============================================================================

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value === null || value === undefined) {
      flattened[newKey] = ''
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

function arrayToCSV(data: any[], fields?: string[]): string {
  if (data.length === 0) return ''

  const flattened = data.map((item) => flattenObject(item))

  let headers: string[]
  if (fields && fields.length > 0) {
    headers = fields
  } else {
    const allKeys = new Set<string>()
    flattened.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key))
    })
    headers = Array.from(allKeys).sort()
  }

  const rows: string[] = []
  rows.push(headers.map((h) => escapeCSV(h)).join(','))

  flattened.forEach((item) => {
    const values = headers.map((header) => escapeCSV(item[header]))
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

function dataToJSON(data: any, includeMetadata: boolean): string {
  if (includeMetadata) {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 1,
        version: '1.0',
        source: 'XPShare AI Discovery',
      },
      data,
    }
    return JSON.stringify(exportData, null, 2)
  }

  return JSON.stringify(data, null, 2)
}

function generateFilename(customFilename?: string, format: 'json' | 'csv' = 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)

  if (customFilename) {
    return `${customFilename}-${timestamp}.${format}`
  }

  return `xpshare-export-${timestamp}.${format}`
}

function exportData(
  data: any,
  format: 'json' | 'csv',
  filename?: string,
  includeMetadata: boolean = true,
  fields?: string[]
): ExportResult {
  // Normalize data to array
  let dataArray: any[]
  if (Array.isArray(data)) {
    dataArray = data
  } else if (data?.results && Array.isArray(data.results)) {
    dataArray = data.results
  } else if (data?.data && Array.isArray(data.data)) {
    dataArray = data.data
  } else {
    dataArray = [data]
  }

  // Generate content
  let content: string
  if (format === 'csv') {
    content = arrayToCSV(dataArray, fields)
  } else {
    content = dataToJSON(dataArray, includeMetadata)
  }

  const finalFilename = generateFilename(filename, format)
  const size = new Blob([content]).size

  return {
    format,
    filename: finalFilename,
    content,
    size,
    recordCount: dataArray.length,
  }
}
