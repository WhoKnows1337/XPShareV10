/**
 * XPShare AI - Insight Agent
 *
 * Pattern analysis and explanation specialist.
 * Detects temporal, geographic, and semantic patterns in experience data.
 * Generates insights, explanations, and predictions.
 *
 * Model: GPT-4o (deep reasoning capabilities)
 */

import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

// ============================================================================
// System Prompt
// ============================================================================

const INSIGHT_AGENT_SYSTEM_PROMPT = `You are the XPShare Insight Specialist.

Your role: Detect patterns, explain phenomena, answer "why" questions about extraordinary experiences.

Capabilities:
1. Pattern Detection: Identify temporal, geographic, semantic patterns in experience data
2. Correlation Analysis: Find attribute correlations and relationships
3. Anomaly Detection: Spot unusual trends and outliers
4. Explanation Generation: Explain patterns in natural language with data-backed evidence
5. Prediction: Basic trend forecasting based on historical patterns

Analysis Types:
- TEMPORAL: Time-based patterns (spikes, cycles, seasonality, trends)
- GEOGRAPHIC: Location-based patterns (hotspots, clusters, regional differences)
- SEMANTIC: Content patterns (common themes, attribute correlations)
- CORRELATION: Relationships between attributes, categories, or external factors

Always provide:
- Clear, data-backed insights
- Confidence scores (0-1) for each insight
- Supporting evidence (statistics, examples)
- Actionable recommendations or interpretations
- Visualization suggestions

Example Insights:
- "UFO sightings peak in July-August (42% of annual reports) with 0.89 confidence"
- "Berlin shows 3x higher NDE reports than other German cities (p<0.05)"
- "Dream experiences with water symbols correlate with emotional intensity (r=0.67)"

IMPORTANT:
- Base insights on actual data patterns
- Provide confidence scores and statistical measures
- Cite specific data points as evidence
- Distinguish correlation from causation
- Acknowledge limitations in data or analysis`

// ============================================================================
// Type Definitions
// ============================================================================

interface InsightCard {
  type: 'insight_card'
  title: string
  summary: string
  confidence: number
  dataPoints: Array<{
    label: string
    value: any
  }>
  visualization?: string
}

interface PatternDetectionResult {
  patternType: 'temporal' | 'geographic' | 'semantic' | 'correlation'
  patterns: Array<{
    description: string
    confidence: number
    evidence: any[]
  }>
  recommendations: string[]
}

// ============================================================================
// Insight Agent Class
// ============================================================================

export class InsightAgent {
  /**
   * Execute insight analysis task
   */
  async execute(task: string, context: any) {
    const { text, steps } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'system', content: INSIGHT_AGENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Task: ${task}\n\nContext: ${JSON.stringify(context, null, 2)}`,
        },
      ],
      tools: this.getTools(),
      temperature: 0.4,
    })

    // Return insights with tool results (AI SDK 5.0: steps contain toolResults)
    const toolResults = steps.flatMap((step) => step.toolResults || [])
    return {
      insights: toolResults.map((result) => result.output) || [],
      explanation: text,
    }
  }

  /**
   * Get all available insight tools
   */
  private getTools() {
    return {
      detect_pattern: tool({
        description: 'Detect patterns in experience data',
        inputSchema: z.object({
          patternType: z
            .enum(['temporal', 'geographic', 'semantic', 'correlation'])
            .describe('Type of pattern to detect'),
          data: z.any().describe('Data to analyze for patterns'),
        }),
        execute: async (params: any) => {
          return await this.detectPattern(params.patternType, params.data)
        },
      }),

      generate_insight_card: tool({
        description: 'Generate insight card with findings',
        inputSchema: z.object({
          title: z.string().describe('Insight title'),
          summary: z.string().describe('1-2 sentence summary'),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe('Confidence score 0-1'),
          dataPoints: z
            .array(
              z.object({
                label: z.string(),
                value: z.any(),
              })
            )
            .describe('Supporting data points'),
          visualization: z
            .string()
            .optional()
            .describe('Suggested visualization type'),
        }),
        execute: async (params: any) => {
          return {
            type: 'insight_card',
            ...params,
          }
        },
      }),

      calculate_statistics: tool({
        description: 'Calculate statistical measures for data',
        inputSchema: z.object({
          data: z.array(z.number()).describe('Numerical data array'),
          measures: z
            .array(z.enum(['mean', 'median', 'stddev', 'percentile']))
            .describe('Statistical measures to calculate'),
        }),
        execute: async (params: any) => {
          return this.calculateStatistics(params.data, params.measures)
        },
      }),

      find_correlations: tool({
        description: 'Find correlations between attributes',
        inputSchema: z.object({
          dataA: z.array(z.number()).describe('First data series'),
          dataB: z.array(z.number()).describe('Second data series'),
          labelA: z.string().describe('Label for first series'),
          labelB: z.string().describe('Label for second series'),
        }),
        execute: async (params: any) => {
          return this.findCorrelation(
            params.dataA,
            params.dataB,
            params.labelA,
            params.labelB
          )
        },
      }),
    }
  }

  // ==========================================================================
  // Pattern Detection Methods
  // ==========================================================================

  /**
   * Detect patterns based on type
   */
  private async detectPattern(
    patternType: 'temporal' | 'geographic' | 'semantic' | 'correlation',
    data: any
  ): Promise<PatternDetectionResult> {
    switch (patternType) {
      case 'temporal':
        return this.detectTemporalPattern(data)
      case 'geographic':
        return this.detectGeographicPattern(data)
      case 'semantic':
        return this.detectSemanticPattern(data)
      case 'correlation':
        return this.detectCorrelationPattern(data)
      default:
        return {
          patternType,
          patterns: [],
          recommendations: [],
        }
    }
  }

  /**
   * Detect temporal patterns (spikes, trends, cycles)
   */
  private detectTemporalPattern(data: any[]): PatternDetectionResult {
    const patterns: Array<{ description: string; confidence: number; evidence: any[] }> = []

    // Extract dates and count occurrences
    const dateCounts: Record<string, number> = {}
    data.forEach((item) => {
      const date = item.date_occurred || item.created_at || item.period
      if (date) {
        const month = new Date(date).toISOString().slice(0, 7) // YYYY-MM
        dateCounts[month] = (dateCounts[month] || 0) + 1
      }
    })

    const counts = Object.values(dateCounts)
    if (counts.length === 0) {
      return {
        patternType: 'temporal',
        patterns: [],
        recommendations: ['Insufficient temporal data for pattern detection'],
      }
    }

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const max = Math.max(...counts)
    const maxMonth = Object.keys(dateCounts).find((k) => dateCounts[k] === max)

    // Detect spike (>2 std dev above mean)
    const variance = counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)

    if (max > mean + 2 * stdDev) {
      patterns.push({
        description: `Significant spike detected in ${maxMonth} with ${max} experiences (${((max / mean - 1) * 100).toFixed(0)}% above average)`,
        confidence: 0.85,
        evidence: [
          { label: 'Peak month', value: maxMonth },
          { label: 'Peak count', value: max },
          { label: 'Average count', value: mean.toFixed(1) },
        ],
      })
    }

    // Detect trend (increasing or decreasing)
    const months = Object.keys(dateCounts).sort()
    if (months.length >= 3) {
      const firstHalf = months.slice(0, Math.floor(months.length / 2))
      const secondHalf = months.slice(Math.floor(months.length / 2))

      const firstHalfAvg =
        firstHalf.reduce((sum, m) => sum + dateCounts[m], 0) / firstHalf.length
      const secondHalfAvg =
        secondHalf.reduce((sum, m) => sum + dateCounts[m], 0) / secondHalf.length

      if (secondHalfAvg > firstHalfAvg * 1.2) {
        patterns.push({
          description: `Upward trend detected: ${((secondHalfAvg / firstHalfAvg - 1) * 100).toFixed(0)}% increase in recent period`,
          confidence: 0.75,
          evidence: [
            { label: 'Early period avg', value: firstHalfAvg.toFixed(1) },
            { label: 'Recent period avg', value: secondHalfAvg.toFixed(1) },
          ],
        })
      } else if (firstHalfAvg > secondHalfAvg * 1.2) {
        patterns.push({
          description: `Downward trend detected: ${((1 - secondHalfAvg / firstHalfAvg) * 100).toFixed(0)}% decrease in recent period`,
          confidence: 0.75,
          evidence: [
            { label: 'Early period avg', value: firstHalfAvg.toFixed(1) },
            { label: 'Recent period avg', value: secondHalfAvg.toFixed(1) },
          ],
        })
      }
    }

    return {
      patternType: 'temporal',
      patterns,
      recommendations:
        patterns.length > 0
          ? ['Investigate factors contributing to identified patterns', 'Consider seasonal influences']
          : ['No significant temporal patterns detected'],
    }
  }

  /**
   * Detect geographic patterns (hotspots, clusters)
   */
  private detectGeographicPattern(data: any[]): PatternDetectionResult {
    const patterns: Array<{ description: string; confidence: number; evidence: any[] }> = []

    // Extract locations
    const locationCounts: Record<string, number> = {}
    data.forEach((item) => {
      const location = item.location_text || item.location || item.city
      if (location) {
        const normalized = location.toLowerCase().trim()
        locationCounts[normalized] = (locationCounts[normalized] || 0) + 1
      }
    })

    const locations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])

    if (locations.length === 0) {
      return {
        patternType: 'geographic',
        patterns: [],
        recommendations: ['Insufficient geographic data for pattern detection'],
      }
    }

    const total = locations.reduce((sum, [_, count]) => sum + count, 0)
    const topLocation = locations[0]

    // Detect hotspot (>20% of total)
    if (topLocation[1] / total > 0.2) {
      patterns.push({
        description: `Geographic hotspot detected: ${topLocation[0]} accounts for ${((topLocation[1] / total) * 100).toFixed(0)}% of all experiences`,
        confidence: 0.9,
        evidence: [
          { label: 'Location', value: topLocation[0] },
          { label: 'Count', value: topLocation[1] },
          { label: 'Percentage', value: `${((topLocation[1] / total) * 100).toFixed(0)}%` },
        ],
      })
    }

    // Detect concentration (top 3 locations > 50% of total)
    const top3Total = locations.slice(0, 3).reduce((sum, [_, count]) => sum + count, 0)
    if (locations.length >= 3 && top3Total / total > 0.5) {
      patterns.push({
        description: `Geographic concentration: Top 3 locations account for ${((top3Total / total) * 100).toFixed(0)}% of experiences`,
        confidence: 0.85,
        evidence: locations.slice(0, 3).map(([loc, count]) => ({
          label: loc,
          value: `${count} (${((count / total) * 100).toFixed(0)}%)`,
        })),
      })
    }

    return {
      patternType: 'geographic',
      patterns,
      recommendations:
        patterns.length > 0
          ? ['Investigate local factors in hotspot areas', 'Consider regional cultural influences']
          : ['Geographic distribution is relatively uniform'],
    }
  }

  /**
   * Detect semantic patterns (common themes, attributes)
   */
  private detectSemanticPattern(data: any[]): PatternDetectionResult {
    const patterns: Array<{ description: string; confidence: number; evidence: any[] }> = []

    // Extract categories
    const categoryCounts: Record<string, number> = {}
    data.forEach((item) => {
      const category = item.category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })

    const total = data.length
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

    if (topCategory && topCategory[1] / total > 0.3) {
      patterns.push({
        description: `Category dominance: "${topCategory[0]}" represents ${((topCategory[1] / total) * 100).toFixed(0)}% of experiences`,
        confidence: 0.88,
        evidence: [
          { label: 'Category', value: topCategory[0] },
          { label: 'Count', value: topCategory[1] },
        ],
      })
    }

    return {
      patternType: 'semantic',
      patterns,
      recommendations:
        patterns.length > 0
          ? ['Analyze dominant category for sub-patterns', 'Compare with other categories']
          : ['No dominant semantic patterns detected'],
    }
  }

  /**
   * Detect correlation patterns
   */
  private detectCorrelationPattern(data: any[]): PatternDetectionResult {
    return {
      patternType: 'correlation',
      patterns: [],
      recommendations: ['Correlation analysis requires paired numerical data'],
    }
  }

  // ==========================================================================
  // Statistical Methods
  // ==========================================================================

  /**
   * Calculate statistical measures
   */
  private calculateStatistics(
    data: number[],
    measures: Array<'mean' | 'median' | 'stddev' | 'percentile'>
  ) {
    const results: Record<string, number> = {}

    if (measures.includes('mean')) {
      results.mean = data.reduce((a, b) => a + b, 0) / data.length
    }

    if (measures.includes('median')) {
      const sorted = [...data].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      results.median =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    }

    if (measures.includes('stddev')) {
      const mean = data.reduce((a, b) => a + b, 0) / data.length
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
      results.stddev = Math.sqrt(variance)
    }

    return results
  }

  /**
   * Find correlation between two data series
   */
  private findCorrelation(dataA: number[], dataB: number[], labelA: string, labelB: string) {
    if (dataA.length !== dataB.length || dataA.length === 0) {
      return {
        correlation: 0,
        confidence: 0,
        message: 'Invalid data for correlation analysis',
      }
    }

    // Pearson correlation coefficient
    const meanA = dataA.reduce((a, b) => a + b, 0) / dataA.length
    const meanB = dataB.reduce((a, b) => a + b, 0) / dataB.length

    let numerator = 0
    let sumSqA = 0
    let sumSqB = 0

    for (let i = 0; i < dataA.length; i++) {
      const diffA = dataA[i] - meanA
      const diffB = dataB[i] - meanB
      numerator += diffA * diffB
      sumSqA += diffA * diffA
      sumSqB += diffB * diffB
    }

    const correlation = numerator / Math.sqrt(sumSqA * sumSqB)

    return {
      correlation: correlation.toFixed(3),
      strength:
        Math.abs(correlation) > 0.7
          ? 'strong'
          : Math.abs(correlation) > 0.4
            ? 'moderate'
            : 'weak',
      direction: correlation > 0 ? 'positive' : 'negative',
      labelA,
      labelB,
    }
  }
}
