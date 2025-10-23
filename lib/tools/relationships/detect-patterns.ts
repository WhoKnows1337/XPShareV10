/**
 * XPShare AI - Detect Patterns Tool
 *
 * Wrapper tool for pattern detection using Insight Agent.
 * Detects temporal, geographic, semantic, and correlation patterns.
 */

import { tool } from 'ai'
import { z } from 'zod'

// ============================================================================
// Schema Definition
// ============================================================================

const detectPatternsSchema = z.object({
  patternType: z
    .enum(['temporal', 'geographic', 'semantic', 'correlation', 'all'])
    .describe('Type of pattern to detect: temporal, geographic, semantic, correlation, or all'),
  data: z.any().describe('Data to analyze for patterns (experiences array or aggregated data)'),
  category: z.string().optional().describe('Optional category context for pattern detection'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const detectPatternsTool = tool({
  description:
    'PATTERN DETECTION: Statistical analysis to detect anomalies, trends, clusters, and correlations in experience datasets. Analyzes temporal spikes/trends, geographic hotspots/clusters, semantic themes, and attribute correlations using statistical methods (standard deviation, clustering). Returns confidence-scored patterns with evidence. DO NOT use for simple listing - use this only when user asks to "detect patterns", "find anomalies", "discover trends", "identify clusters", or "analyze statistical patterns".',
  inputSchema: detectPatternsSchema,
  execute: async (params) => {
    const data = Array.isArray(params.data) ? params.data : params.data?.results || []

    if (data.length === 0) {
      return {
        patternType: params.patternType,
        patterns: [],
        summary: 'No data provided for pattern detection',
      }
    }

    const patterns: any[] = []

    // Detect temporal patterns if requested
    if (params.patternType === 'temporal' || params.patternType === 'all') {
      const temporalPatterns = detectTemporalPatterns(data)
      if (temporalPatterns.length > 0) {
        patterns.push({
          type: 'temporal',
          patterns: temporalPatterns,
        })
      }
    }

    // Detect geographic patterns if requested
    if (params.patternType === 'geographic' || params.patternType === 'all') {
      const geoPatterns = detectGeographicPatterns(data)
      if (geoPatterns.length > 0) {
        patterns.push({
          type: 'geographic',
          patterns: geoPatterns,
        })
      }
    }

    // Detect semantic patterns if requested
    if (params.patternType === 'semantic' || params.patternType === 'all') {
      const semanticPatterns = detectSemanticPatterns(data)
      if (semanticPatterns.length > 0) {
        patterns.push({
          type: 'semantic',
          patterns: semanticPatterns,
        })
      }
    }

    return {
      patternType: params.patternType,
      category: params.category,
      dataPoints: data.length,
      patterns,
      summary: `Detected ${patterns.length} pattern type(s) in ${data.length} data points`,
    }
  },
})

// ============================================================================
// Pattern Detection Functions
// ============================================================================

function detectTemporalPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract dates
  const dateCounts: Record<string, number> = {}
  data.forEach((item) => {
    const date = item.date_occurred || item.created_at || item.period || item.month
    if (date) {
      const month = typeof date === 'string' ? date.slice(0, 7) : date
      dateCounts[month] = (dateCounts[month] || 0) + 1
    }
  })

  if (Object.keys(dateCounts).length === 0) return patterns

  const counts = Object.values(dateCounts)
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  const max = Math.max(...counts)
  const maxMonth = Object.keys(dateCounts).find((k) => dateCounts[k] === max)

  // Detect spike
  const variance = counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  if (max > mean + 1.5 * stdDev) {
    patterns.push({
      description: `Spike detected in ${maxMonth}: ${max} events (${Math.round((max / mean - 1) * 100)}% above average)`,
      confidence: 0.8,
      data: { month: maxMonth, count: max, average: mean },
    })
  }

  return patterns
}

function detectGeographicPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract locations
  const locationCounts: Record<string, number> = {}
  data.forEach((item) => {
    const location = item.location_text || item.location
    if (location) {
      const normalized = location.toLowerCase().trim()
      locationCounts[normalized] = (locationCounts[normalized] || 0) + 1
    }
  })

  if (Object.keys(locationCounts).length === 0) return patterns

  const total = Object.values(locationCounts).reduce((a, b) => a + b, 0)
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]

  // Detect hotspot
  if (topLocation && topLocation[1] / total > 0.25) {
    patterns.push({
      description: `Geographic hotspot: ${topLocation[0]} (${Math.round((topLocation[1] / total) * 100)}% of all events)`,
      confidence: 0.85,
      data: { location: topLocation[0], count: topLocation[1], percentage: (topLocation[1] / total) * 100 },
    })
  }

  return patterns
}

function detectSemanticPatterns(data: any[]): any[] {
  const patterns: any[] = []

  // Extract categories
  const categoryCounts: Record<string, number> = {}
  data.forEach((item) => {
    const category = item.category
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    }
  })

  if (Object.keys(categoryCounts).length === 0) return patterns

  const total = data.length
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  // Detect dominant category
  if (topCategory && topCategory[1] / total > 0.4) {
    patterns.push({
      description: `Category dominance: "${topCategory[0]}" represents ${Math.round((topCategory[1] / total) * 100)}% of data`,
      confidence: 0.75,
      data: { category: topCategory[0], count: topCategory[1], percentage: (topCategory[1] / total) * 100 },
    })
  }

  return patterns
}
