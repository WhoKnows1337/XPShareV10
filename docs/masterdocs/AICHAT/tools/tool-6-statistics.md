# Tool 6: Get Statistics

**File:** `/lib/ai/tools/statistics-tool.ts`
**Purpose:** Compute aggregate statistics and metrics
**Used by:** Phase 2 `/app/api/discover/route.ts`

---

## 📋 Statistics Categories

1. **Counts**: Total experiences by category/tag/location
2. **Temporal Trends**: Growth rate, seasonality, time-based patterns
3. **User Engagement**: Submissions per user, average witnesses
4. **Data Quality**: Completeness scores, attribute coverage
5. **Distribution**: Category/tag frequency, geographic spread

## 🔧 Implementation

```typescript
// lib/ai/tools/statistics-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const StatisticsParamsSchema = z.object({
  experienceIds: z.array(z.string()).optional(), // If empty, analyze all
  metrics: z.array(
    z.enum([
      'counts',
      'temporalTrends',
      'userEngagement',
      'dataQuality',
      'distribution'
    ])
  ),
  groupBy: z.enum(['category', 'tag', 'location', 'month', 'user']).optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional()
})

export const getStatisticsTool = tool({
  description: 'Compute aggregate statistics and metrics. Returns counts, trends, engagement data.',
  parameters: StatisticsParamsSchema,

  execute: async (params) => {
    const stats: Record<string, any> = {}

    for (const metric of params.metrics) {
      switch (metric) {
        case 'counts':
          stats.counts = await getCounts(params.experienceIds, params.groupBy)
          break
        case 'temporalTrends':
          stats.temporalTrends = await getTemporalTrends(params.experienceIds, params.dateRange)
          break
        case 'userEngagement':
          stats.userEngagement = await getUserEngagement(params.experienceIds)
          break
        case 'dataQuality':
          stats.dataQuality = await getDataQuality(params.experienceIds)
          break
        case 'distribution':
          stats.distribution = await getDistribution(params.experienceIds, params.groupBy)
          break
      }
    }

    return {
      statistics: stats,
      totalExperiences: params.experienceIds?.length || await getTotalCount(),
      generatedAt: new Date().toISOString()
    }
  }
})

// Helper functions

async function getCounts(ids?: string[], groupBy?: string) {
  const experiences = ids ? await getExperiences(ids) : await getAllExperiences()

  if (!groupBy) {
    return { total: experiences.length }
  }

  const counts = new Map<string, number>()

  experiences.forEach(exp => {
    const key = groupBy === 'category' ? exp.category_slug :
                groupBy === 'location' ? exp.location :
                groupBy === 'user' ? exp.user_id :
                'all'

    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return Object.fromEntries(counts)
}

async function getTemporalTrends(ids?: string[], dateRange?: any) {
  const experiences = ids ? await getExperiences(ids) : await getAllExperiences()

  // Filter by date range if provided
  const filtered = dateRange ? experiences.filter(e => {
    const date = new Date(e.experience_date)
    const from = dateRange.from ? new Date(dateRange.from) : new Date('1900-01-01')
    const to = dateRange.to ? new Date(dateRange.to) : new Date()
    return date >= from && date <= to
  }) : experiences

  // Group by month
  const monthCounts = new Map<string, number>()
  filtered.forEach(exp => {
    const month = exp.experience_date.substring(0, 7) // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  })

  // Calculate growth rate
  const months = Array.from(monthCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))

  const growthRates = months.map(([month, count], idx) => {
    if (idx === 0) return { month, count, growthRate: 0 }
    const prevCount = months[idx - 1][1]
    const growthRate = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0
    return { month, count, growthRate }
  })

  return {
    monthlyData: growthRates,
    overallGrowthRate: calculateOverallGrowth(growthRates)
  }
}

async function getUserEngagement(ids?: string[]) {
  const experiences = ids ? await getExperiences(ids) : await getAllExperiences()

  // Submissions per user
  const userSubmissions = new Map<string, number>()
  experiences.forEach(exp => {
    userSubmissions.set(exp.user_id, (userSubmissions.get(exp.user_id) || 0) + 1)
  })

  // Average witnesses
  const totalWitnesses = experiences.reduce((sum, exp) =>
    sum + (exp.witness_count || 0), 0
  )
  const avgWitnesses = totalWitnesses / experiences.length

  return {
    totalUsers: userSubmissions.size,
    avgSubmissionsPerUser: experiences.length / userSubmissions.size,
    avgWitnessesPerExperience: avgWitnesses,
    mostActiveUsers: Array.from(userSubmissions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, submissionCount: count }))
  }
}

async function getDataQuality(ids?: string[]) {
  const experiences = ids ? await getExperiences(ids) : await getAllExperiences()

  const completenessScores = experiences.map(exp => {
    let score = 0
    const fields = [
      exp.title,
      exp.description,
      exp.location,
      exp.experience_date,
      exp.category_slug
    ]

    // Basic completeness (5 core fields)
    score += fields.filter(f => f && f.toString().length > 0).length * 10

    // Rich data bonus
    if (exp.latitude && exp.longitude) score += 10
    if (exp.time_of_day) score += 5
    if (exp.witness_count && exp.witness_count > 0) score += 10
    if (exp.tags && exp.tags.length > 0) score += 10
    if (exp.attributes && Object.keys(exp.attributes).length > 0) score += 15

    return Math.min(score, 100) // Cap at 100
  })

  const avgCompleteness = completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length

  return {
    avgCompletenessScore: avgCompleteness,
    distribution: {
      excellent: completenessScores.filter(s => s >= 90).length,
      good: completenessScores.filter(s => s >= 70 && s < 90).length,
      fair: completenessScores.filter(s => s >= 50 && s < 70).length,
      poor: completenessScores.filter(s => s < 50).length
    },
    attributeCoverage: await getAttributeCoverage(experiences)
  }
}

async function getDistribution(ids?: string[], groupBy?: string) {
  const experiences = ids ? await getExperiences(ids) : await getAllExperiences()

  if (!groupBy) groupBy = 'category'

  const distribution = new Map<string, number>()

  experiences.forEach(exp => {
    if (groupBy === 'category') {
      distribution.set(exp.category_slug, (distribution.get(exp.category_slug) || 0) + 1)
    } else if (groupBy === 'tag') {
      exp.tags?.forEach(tag => {
        distribution.set(tag, (distribution.get(tag) || 0) + 1)
      })
    } else if (groupBy === 'location') {
      const country = exp.location?.split(',').pop()?.trim() || 'Unknown'
      distribution.set(country, (distribution.get(country) || 0) + 1)
    }
  })

  // Sort by count descending
  const sorted = Array.from(distribution.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20) // Top 20

  return {
    groupBy,
    data: sorted.map(([key, count]) => ({ key, count })),
    total: experiences.length
  }
}

function calculateOverallGrowth(data: any[]) {
  if (data.length < 2) return 0
  const first = data[0].count
  const last = data[data.length - 1].count
  return first > 0 ? ((last - first) / first) * 100 : 0
}

async function getAttributeCoverage(experiences: any[]) {
  const totalExperiences = experiences.length
  const withAttributes = experiences.filter(e =>
    e.attributes && Object.keys(e.attributes).length > 0
  ).length

  return {
    coveragePercentage: (withAttributes / totalExperiences) * 100,
    experiencesWithAttributes: withAttributes,
    totalExperiences
  }
}
```

## 📊 Output Example

```json
{
  "statistics": {
    "counts": {
      "ufo-uap": 34,
      "dreams": 28,
      "paranormal": 15
    },
    "temporalTrends": {
      "monthlyData": [
        { "month": "2024-01", "count": 5, "growthRate": 0 },
        { "month": "2024-02", "count": 8, "growthRate": 60 },
        { "month": "2024-03", "count": 12, "growthRate": 50 }
      ],
      "overallGrowthRate": 140
    },
    "userEngagement": {
      "totalUsers": 42,
      "avgSubmissionsPerUser": 1.83,
      "avgWitnessesPerExperience": 1.2,
      "mostActiveUsers": [
        { "userId": "user-123", "submissionCount": 8 },
        { "userId": "user-456", "submissionCount": 5 }
      ]
    },
    "dataQuality": {
      "avgCompletenessScore": 78.5,
      "distribution": {
        "excellent": 12,
        "good": 35,
        "fair": 18,
        "poor": 12
      },
      "attributeCoverage": {
        "coveragePercentage": 68.5,
        "experiencesWithAttributes": 53,
        "totalExperiences": 77
      }
    },
    "distribution": {
      "groupBy": "category",
      "data": [
        { "key": "ufo-uap", "count": 34 },
        { "key": "dreams", "count": 28 },
        { "key": "paranormal", "count": 15 }
      ],
      "total": 77
    }
  },
  "totalExperiences": 77,
  "generatedAt": "2024-03-15T10:30:00Z"
}
```

## 🎯 Usage Examples

### Overall Statistics

```typescript
const result = await getStatisticsTool.execute({
  metrics: ['counts', 'temporalTrends', 'dataQuality'],
  groupBy: 'category'
})
```

### User Engagement Metrics

```typescript
const result = await getStatisticsTool.execute({
  metrics: ['userEngagement'],
  dateRange: {
    from: '2024-01-01',
    to: '2024-03-31'
  }
})
```

### Specific Experience Set

```typescript
const result = await getStatisticsTool.execute({
  experienceIds: ['exp-1', 'exp-2', 'exp-3'],
  metrics: ['counts', 'distribution'],
  groupBy: 'tag'
})
```

---

**Previous:** [Tool 5: Generate Visualization](./tool-5-visualization.md)
**Next:** [Implementation Checklist](../CHECKLIST.md)
