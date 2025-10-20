import { tool } from 'ai'
import { z } from 'zod'
import { getExperiences } from '@/lib/search/hybrid'

/**
 * Tool 4: Analyze Sentiment
 *
 * Multi-dimensional sentiment analysis:
 * - Valence: Positive/Negative emotional tone
 * - Arousal: Calm/Excited intensity
 * - Emotions: Fear, Wonder, Confusion, Awe, Disbelief, Curiosity
 *
 * Used by: /app/api/discover/route.ts
 */

const SentimentParamsSchema = z.object({
  experienceIds: z
    .array(z.string())
    .describe('Array of experience IDs to analyze'),

  dimensions: z
    .array(
      z.enum(['valence', 'arousal', 'fear', 'wonder', 'confusion', 'awe', 'curiosity'])
    )
    .describe('Sentiment dimensions to analyze'),

  includeTimeSeries: z
    .boolean()
    .default(false)
    .describe('Include time-series sentiment data (default: false)'),
})

export type SentimentParams = z.infer<typeof SentimentParamsSchema>

export const analyzeSentimentTool = tool({
  description: `Analyze emotional tone and sentiment across experiences.

Dimensions:
- valence: Positive (0.0) to Negative (1.0) emotional tone
- arousal: Calm (0.0) to Excited (1.0) intensity
- fear: Fear intensity (0.0-1.0)
- wonder: Wonder/amazement intensity (0.0-1.0)
- confusion: Confusion/uncertainty intensity (0.0-1.0)
- awe: Awe/reverence intensity (0.0-1.0)
- curiosity: Curiosity intensity (0.0-1.0)

Best for:
- "What's the emotional tone of these experiences?"
- "Are these experiences fear-based or wonder-based?"
- "Analyze sentiment trends over time"`,

  parameters: SentimentParamsSchema,

  execute: async (params: SentimentParams) => {
    try {
      const experiences = await getExperiences(params.experienceIds)

      if (experiences.length === 0) {
        return {
          aggregate: {},
          distribution: { positive: 0, neutral: 0, negative: 0 },
          message: 'No experiences found',
        }
      }

      // Aggregate sentiment scores
      const aggregate: Record<string, number> = {}

      for (const dim of params.dimensions) {
        aggregate[dim] = calculateSentimentScore(experiences, dim)
      }

      // Distribution (simplified - based on tags)
      const distribution = calculateDistribution(experiences)

      // Time series (if requested)
      let timeSeries: any[] | undefined
      if (params.includeTimeSeries) {
        timeSeries = calculateTimeSeries(experiences, params.dimensions)
      }

      return {
        aggregate,
        distribution,
        timeSeries,
        totalExperiences: experiences.length,
      }
    } catch (error: any) {
      console.error('Sentiment analysis error:', error)
      return {
        aggregate: {},
        distribution: { positive: 0, neutral: 0, negative: 0 },
        error: `Sentiment analysis failed: ${error.message}`,
      }
    }
  },
})

// ===== Sentiment Analysis Helpers =====

/**
 * Calculate sentiment score for a specific dimension
 * (Simplified keyword-based approach - in production use AI model)
 */
function calculateSentimentScore(
  experiences: any[],
  dimension: string
): number {
  const keywords: Record<string, string[]> = {
    valence: {
      positive: ['beautiful', 'amazing', 'wonderful', 'peaceful', 'joy', 'happy'],
      negative: ['terrible', 'scary', 'frightening', 'disturbing', 'awful'],
    },
    arousal: {
      high: ['intense', 'overwhelming', 'shocking', 'explosive', 'dramatic'],
      low: ['calm', 'peaceful', 'gentle', 'quiet', 'subtle'],
    },
    fear: ['fear', 'scared', 'terrified', 'afraid', 'panic', 'horror'],
    wonder: ['wonder', 'awe', 'amazed', 'incredible', 'extraordinary'],
    confusion: ['confused', 'uncertain', 'unclear', 'puzzling', 'strange'],
    awe: ['awe', 'majestic', 'profound', 'transcendent', 'divine'],
    curiosity: ['curious', 'interested', 'intrigued', 'fascinated', 'wondering'],
  }

  let totalScore = 0
  let count = 0

  experiences.forEach((exp) => {
    const text = `${exp.title} ${exp.description}`.toLowerCase()

    if (dimension === 'valence') {
      const positiveCount = keywords.valence.positive.filter((kw) =>
        text.includes(kw)
      ).length
      const negativeCount = keywords.valence.negative.filter((kw) =>
        text.includes(kw)
      ).length

      if (positiveCount + negativeCount > 0) {
        // 0 = very negative, 0.5 = neutral, 1 = very positive
        totalScore += (positiveCount - negativeCount + 3) / 6
        count++
      }
    } else if (dimension === 'arousal') {
      const highCount = keywords.arousal.high.filter((kw) =>
        text.includes(kw)
      ).length
      const lowCount = keywords.arousal.low.filter((kw) => text.includes(kw)).length

      if (highCount + lowCount > 0) {
        // 0 = very calm, 1 = very aroused
        totalScore += (highCount - lowCount + 3) / 6
        count++
      }
    } else {
      // Specific emotion dimensions
      const emotionKeywords = keywords[dimension] || []
      const matchCount = emotionKeywords.filter((kw) => text.includes(kw)).length

      if (matchCount > 0) {
        totalScore += Math.min(matchCount / 3, 1) // Cap at 1.0
        count++
      }
    }
  })

  return count > 0 ? totalScore / count : 0.5 // Default to neutral
}

/**
 * Calculate sentiment distribution (positive/neutral/negative)
 */
function calculateDistribution(experiences: any[]) {
  let positive = 0
  let neutral = 0
  let negative = 0

  const positiveKeywords = [
    'beautiful',
    'amazing',
    'wonderful',
    'peaceful',
    'joy',
  ]
  const negativeKeywords = [
    'terrible',
    'scary',
    'frightening',
    'disturbing',
    'fear',
  ]

  experiences.forEach((exp) => {
    const text = `${exp.title} ${exp.description}`.toLowerCase()

    const hasPositive = positiveKeywords.some((kw) => text.includes(kw))
    const hasNegative = negativeKeywords.some((kw) => text.includes(kw))

    if (hasPositive && !hasNegative) {
      positive++
    } else if (hasNegative && !hasPositive) {
      negative++
    } else {
      neutral++
    }
  })

  return { positive, neutral, negative }
}

/**
 * Calculate sentiment time series
 */
function calculateTimeSeries(experiences: any[], dimensions: string[]) {
  // Group by month
  const monthGroups = new Map<string, any[]>()

  experiences.forEach((exp) => {
    if (!exp.date_occurred) return
    const month = exp.date_occurred.substring(0, 7) // YYYY-MM
    if (!monthGroups.has(month)) monthGroups.set(month, [])
    monthGroups.get(month)!.push(exp)
  })

  const timeSeries: any[] = []

  monthGroups.forEach((exps, month) => {
    const monthData: any = { month, count: exps.length }

    dimensions.forEach((dim) => {
      monthData[dim] = calculateSentimentScore(exps, dim)
    })

    timeSeries.push(monthData)
  })

  return timeSeries.sort((a, b) => a.month.localeCompare(b.month))
}
