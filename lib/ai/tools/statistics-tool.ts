import { tool } from 'ai'
import { z } from 'zod'
import { getExperiences, getAllExperiences, getTotalCount } from '@/lib/search/hybrid'

/**
 * Tool 6: Get Statistics
 *
 * Compute aggregate statistics and metrics:
 * - Counts: Total experiences by category/tag/location
 * - Temporal Trends: Growth rate, seasonality, time-based patterns
 * - User Engagement: Submissions per user, average witnesses
 * - Data Quality: Completeness scores, attribute coverage
 * - Distribution: Category/tag frequency, geographic spread
 *
 * Used by: /app/api/discover/route.ts
 */

const StatisticsParamsSchema = z.object({
  experienceIds: z
    .array(z.string())
    .optional()
    .describe('Experience IDs to analyze (empty = all public experiences)'),

  metrics: z
    .array(
      z.enum([
        'counts',
        'temporalTrends',
        'userEngagement',
        'dataQuality',
        'distribution',
      ])
    )
    .describe('Metrics to compute'),

  groupBy: z
    .enum(['category', 'tag', 'location', 'month', 'user'])
    .optional()
    .describe('Group results by this dimension'),

  dateRange: z
    .object({
      from: z.string().optional().describe('Start date (ISO format)'),
      to: z.string().optional().describe('End date (ISO format)'),
    })
    .optional()
    .describe('Date range filter'),
})

export type StatisticsParams = z.infer<typeof StatisticsParamsSchema>

export const getStatisticsTool = tool({
  description: `Compute aggregate statistics and metrics across experiences.

Metrics:
- counts: Total experiences by category/tag/location
- temporalTrends: Growth rates, monthly patterns, seasonality
- userEngagement: Submissions per user, average witnesses
- dataQuality: Completeness scores, attribute coverage
- distribution: Frequency distribution by category/tag/location

Best for:
- "What are the overall statistics?"
- "Show me growth trends over time"
- "How many experiences per category?"
- "What's the data quality score?"`,

  parameters: StatisticsParamsSchema,

  execute: async (params: StatisticsParams) => {
    try {
      // Fetch experiences
      let experiences: any[]
      if (params.experienceIds && params.experienceIds.length > 0) {
        experiences = await getExperiences(params.experienceIds)
      } else {
        experiences = await getAllExperiences()
      }

      // Apply date range filter if specified
      if (params.dateRange) {
        const { from, to } = params.dateRange
        experiences = experiences.filter((e) => {
          if (!e.date_occurred) return false
          const date = new Date(e.date_occurred)
          if (from && date < new Date(from)) return false
          if (to && date > new Date(to)) return false
          return true
        })
      }

      const stats: Record<string, any> = {}

      // Compute requested metrics
      for (const metric of params.metrics) {
        switch (metric) {
          case 'counts':
            stats.counts = await getCounts(experiences, params.groupBy)
            break
          case 'temporalTrends':
            stats.temporalTrends = await getTemporalTrends(
              experiences,
              params.dateRange
            )
            break
          case 'userEngagement':
            stats.userEngagement = await getUserEngagement(experiences)
            break
          case 'dataQuality':
            stats.dataQuality = await getDataQuality(experiences)
            break
          case 'distribution':
            stats.distribution = await getDistribution(experiences, params.groupBy)
            break
        }
      }

      return {
        statistics: stats,
        totalExperiences: experiences.length,
        dateRangeApplied: !!params.dateRange,
        generatedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error('Statistics generation error:', error)
      return {
        statistics: {},
        error: `Statistics generation failed: ${error.message}`,
      }
    }
  },
})

// ===== Statistics Helpers =====

/**
 * Get counts (total or grouped)
 */
async function getCounts(experiences: any[], groupBy?: string) {
  if (!groupBy) {
    return { total: experiences.length }
  }

  const counts = new Map<string, number>()

  experiences.forEach((exp) => {
    let key = 'unknown'

    switch (groupBy) {
      case 'category':
        key = exp.category_slug || 'uncategorized'
        break
      case 'location':
        key = exp.location_text?.split(',').pop()?.trim() || 'unknown'
        break
      case 'month':
        key = exp.date_occurred?.substring(0, 7) || 'unknown'
        break
      case 'user':
        key = exp.user_id || 'anonymous'
        break
      case 'tag':
        // For tags, count each tag separately
        exp.tags?.forEach((tag: string) => {
          counts.set(tag, (counts.get(tag) || 0) + 1)
        })
        return
    }

    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return Object.fromEntries(counts)
}

/**
 * Get temporal trends (growth rates, monthly patterns)
 */
async function getTemporalTrends(experiences: any[], dateRange?: any) {
  // Group by month
  const monthCounts = new Map<string, number>()

  experiences.forEach((exp) => {
    if (!exp.date_occurred) return
    const month = exp.date_occurred.substring(0, 7) // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  })

  // Sort by month
  const months = Array.from(monthCounts.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  // Calculate growth rates
  const growthRates = months.map(([month, count], idx) => {
    if (idx === 0) return { month, count, growthRate: 0 }

    const prevCount = months[idx - 1][1]
    const growthRate = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0

    return { month, count, growthRate }
  })

  // Overall growth
  const overallGrowth = calculateOverallGrowth(growthRates)

  // Seasonal patterns
  const seasonalData = calculateSeasonalPatterns(experiences)

  return {
    monthlyData: growthRates,
    overallGrowthRate: overallGrowth,
    seasonal: seasonalData,
  }
}

/**
 * Get user engagement metrics
 */
async function getUserEngagement(experiences: any[]) {
  // Submissions per user
  const userSubmissions = new Map<string, number>()

  experiences.forEach((exp) => {
    if (!exp.user_id) return
    userSubmissions.set(exp.user_id, (userSubmissions.get(exp.user_id) || 0) + 1)
  })

  // Calculate averages
  const totalUsers = userSubmissions.size
  const avgSubmissionsPerUser =
    totalUsers > 0 ? experiences.length / totalUsers : 0

  // Most active users
  const mostActiveUsers = Array.from(userSubmissions.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => ({
      userId: userId.substring(0, 8) + '...', // Truncate for privacy
      submissionCount: count,
    }))

  return {
    totalUsers,
    avgSubmissionsPerUser: Math.round(avgSubmissionsPerUser * 100) / 100,
    mostActiveUsers,
  }
}

/**
 * Get data quality metrics
 */
async function getDataQuality(experiences: any[]) {
  const completenessScores = experiences.map((exp) => {
    let score = 0

    // Core fields (5 points each = 50 points)
    const coreFields = [
      exp.title,
      exp.description || exp.story_text,
      exp.location_text,
      exp.date_occurred,
      exp.category_slug,
    ]
    score += coreFields.filter((f) => f && f.length > 0).length * 10

    // Rich data bonuses (50 points total)
    if (exp.latitude && exp.longitude) score += 10 // Geocoding
    if (exp.tags && exp.tags.length > 0) score += 10 // Tags
    if (exp.attributes && Object.keys(exp.attributes).length > 0) score += 15 // Attributes
    if (exp.description && exp.description.length > 200) score += 10 // Detailed description
    if (exp.username) score += 5 // User profile

    return Math.min(score, 100) // Cap at 100
  })

  const avgCompleteness =
    completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length

  // Distribution
  const distribution = {
    excellent: completenessScores.filter((s) => s >= 90).length,
    good: completenessScores.filter((s) => s >= 70 && s < 90).length,
    fair: completenessScores.filter((s) => s >= 50 && s < 70).length,
    poor: completenessScores.filter((s) => s < 50).length,
  }

  return {
    avgCompletenessScore: Math.round(avgCompleteness * 10) / 10,
    distribution,
  }
}

/**
 * Get distribution data
 */
async function getDistribution(experiences: any[], groupBy?: string) {
  const defaultGroupBy = groupBy || 'category'

  const distribution = new Map<string, number>()

  experiences.forEach((exp) => {
    if (defaultGroupBy === 'category') {
      const key = exp.category_slug || 'uncategorized'
      distribution.set(key, (distribution.get(key) || 0) + 1)
    } else if (defaultGroupBy === 'tag') {
      exp.tags?.forEach((tag: string) => {
        distribution.set(tag, (distribution.get(tag) || 0) + 1)
      })
    } else if (defaultGroupBy === 'location') {
      const country = exp.location_text?.split(',').pop()?.trim() || 'Unknown'
      distribution.set(country, (distribution.get(country) || 0) + 1)
    }
  })

  // Sort and take top 20
  const sorted = Array.from(distribution.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  return {
    groupBy: defaultGroupBy,
    data: sorted.map(([key, count]) => ({ key, count })),
    total: experiences.length,
  }
}

// ===== Utility Functions =====

/**
 * Calculate overall growth rate
 */
function calculateOverallGrowth(data: any[]): number {
  if (data.length < 2) return 0

  const first = data[0].count
  const last = data[data.length - 1].count

  return first > 0 ? Math.round(((last - first) / first) * 100 * 10) / 10 : 0
}

/**
 * Calculate seasonal patterns
 */
function calculateSeasonalPatterns(experiences: any[]) {
  const seasons = new Map<string, number>()

  experiences.forEach((exp) => {
    if (!exp.date_occurred) return

    const monthNum = parseInt(exp.date_occurred.substring(5, 7))
    let season = 'Unknown'

    if (monthNum >= 3 && monthNum <= 5) season = 'Spring'
    else if (monthNum >= 6 && monthNum <= 8) season = 'Summer'
    else if (monthNum >= 9 && monthNum <= 11) season = 'Fall'
    else season = 'Winter'

    seasons.set(season, (seasons.get(season) || 0) + 1)
  })

  return Array.from(seasons.entries()).map(([season, count]) => ({
    season,
    count,
  }))
}
