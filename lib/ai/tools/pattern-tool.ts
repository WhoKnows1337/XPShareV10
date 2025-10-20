import { tool } from 'ai'
import { z } from 'zod'
import { getExperiences } from '@/lib/search/hybrid'

/**
 * Tool 2: Detect Patterns
 *
 * Identifies patterns across experiences:
 * - Temporal: Time-based clustering (same dates, times, seasonal)
 * - Geographic: Location-based clustering (proximity, regional)
 * - Semantic: Similar content/themes
 * - Emotional: Similar emotional tone
 * - Cross-Category: Patterns across different experience types
 *
 * Used by: /app/api/discover/route.ts
 */

const PatternParamsSchema = z.object({
  experienceIds: z
    .array(z.string())
    .describe('Array of experience IDs to analyze for patterns'),

  patternTypes: z
    .array(
      z.enum([
        'temporal',
        'geographic',
        'semantic',
        'emotional',
        'crossCategory',
      ])
    )
    .describe('Types of patterns to detect'),

  minClusterSize: z
    .number()
    .default(3)
    .describe('Minimum number of experiences to form a pattern (default: 3)'),

  confidenceThreshold: z
    .number()
    .min(0)
    .max(1)
    .default(0.6)
    .describe('Minimum confidence score for pattern detection (0-1)'),
})

export type PatternParams = z.infer<typeof PatternParamsSchema>

export const detectPatternsTool = tool({
  description: `Detect patterns and correlations across multiple experiences.

Pattern Types:
- temporal: Time-based patterns (same dates, times of day, seasonal trends)
- geographic: Location-based clustering (proximity, regional hotspots)
- semantic: Content similarity (shared themes, descriptions)
- emotional: Shared emotional tone across experiences
- crossCategory: Patterns spanning multiple experience categories

Best for:
- "Are there temporal patterns in these UFO sightings?"
- "Find geographic clusters in these experiences"
- "What patterns connect these seemingly unrelated experiences?"`,

  parameters: PatternParamsSchema,

  execute: async (params: PatternParams) => {
    try {
      const experiences = await getExperiences(params.experienceIds)

      if (experiences.length < params.minClusterSize) {
        return {
          patterns: [],
          message: `Not enough experiences (${experiences.length}) to detect patterns. Minimum: ${params.minClusterSize}`,
        }
      }

      const patterns: any[] = []

      for (const patternType of params.patternTypes) {
        switch (patternType) {
          case 'temporal':
            patterns.push(...detectTemporalPatterns(experiences, params))
            break
          case 'geographic':
            patterns.push(...detectGeographicPatterns(experiences, params))
            break
          case 'semantic':
            patterns.push(...detectSemanticPatterns(experiences, params))
            break
          case 'emotional':
            patterns.push(...detectEmotionalPatterns(experiences, params))
            break
          case 'crossCategory':
            patterns.push(...detectCrossCategoryPatterns(experiences, params))
            break
        }
      }

      return {
        patterns: patterns.filter(
          (p) => p.confidence >= params.confidenceThreshold
        ),
        totalExperiences: experiences.length,
        patternTypesAnalyzed: params.patternTypes,
      }
    } catch (error: any) {
      console.error('Pattern detection error:', error)
      return {
        patterns: [],
        error: `Pattern detection failed: ${error.message}`,
      }
    }
  },
})

// ===== Pattern Detection Helpers =====

function detectTemporalPatterns(experiences: any[], params: PatternParams) {
  const patterns: any[] = []

  // Group by month
  const monthGroups = new Map<string, any[]>()
  experiences.forEach((exp) => {
    if (!exp.date_occurred) return
    const month = exp.date_occurred.substring(0, 7) // YYYY-MM
    if (!monthGroups.has(month)) monthGroups.set(month, [])
    monthGroups.get(month)!.push(exp)
  })

  // Detect clusters (months with >= minClusterSize experiences)
  monthGroups.forEach((exps, month) => {
    if (exps.length >= params.minClusterSize) {
      patterns.push({
        type: 'temporal',
        subtype: 'monthly_cluster',
        month,
        experienceCount: exps.length,
        experienceIds: exps.map((e) => e.id),
        confidence: Math.min(exps.length / 10, 1), // Max confidence at 10+ experiences
        description: `${exps.length} experiences occurred in ${month}`,
      })
    }
  })

  // Seasonal patterns
  const seasons = new Map<string, any[]>()
  experiences.forEach((exp) => {
    if (!exp.date_occurred) return
    const monthNum = parseInt(exp.date_occurred.substring(5, 7))
    let season = 'Unknown'
    if (monthNum >= 3 && monthNum <= 5) season = 'Spring'
    else if (monthNum >= 6 && monthNum <= 8) season = 'Summer'
    else if (monthNum >= 9 && monthNum <= 11) season = 'Fall'
    else season = 'Winter'

    if (!seasons.has(season)) seasons.set(season, [])
    seasons.get(season)!.push(exp)
  })

  seasons.forEach((exps, season) => {
    if (exps.length >= params.minClusterSize) {
      patterns.push({
        type: 'temporal',
        subtype: 'seasonal',
        season,
        experienceCount: exps.length,
        experienceIds: exps.map((e) => e.id),
        confidence: Math.min(exps.length / 15, 1),
        description: `${exps.length} experiences occurred during ${season}`,
      })
    }
  })

  return patterns
}

function detectGeographicPatterns(experiences: any[], params: PatternParams) {
  const patterns: any[] = []

  // Group by country (last part of location_text)
  const countryGroups = new Map<string, any[]>()
  experiences.forEach((exp) => {
    if (!exp.location_text) return
    const parts = exp.location_text.split(',')
    const country = parts[parts.length - 1]?.trim() || 'Unknown'
    if (!countryGroups.has(country)) countryGroups.set(country, [])
    countryGroups.get(country)!.push(exp)
  })

  countryGroups.forEach((exps, country) => {
    if (exps.length >= params.minClusterSize) {
      patterns.push({
        type: 'geographic',
        subtype: 'country_cluster',
        country,
        experienceCount: exps.length,
        experienceIds: exps.map((e) => e.id),
        confidence: Math.min(exps.length / 10, 1),
        description: `${exps.length} experiences occurred in ${country}`,
      })
    }
  })

  // Proximity clustering (if lat/lng available)
  const withCoords = experiences.filter((e) => e.latitude && e.longitude)
  if (withCoords.length >= params.minClusterSize) {
    // Simple clustering: experiences within 50km radius
    const clusters: any[][] = []
    const used = new Set<string>()

    withCoords.forEach((exp) => {
      if (used.has(exp.id)) return

      const cluster = [exp]
      used.add(exp.id)

      withCoords.forEach((other) => {
        if (used.has(other.id)) return
        const distance = haversineDistance(
          exp.latitude,
          exp.longitude,
          other.latitude,
          other.longitude
        )
        if (distance <= 50) {
          // 50km radius
          cluster.push(other)
          used.add(other.id)
        }
      })

      if (cluster.length >= params.minClusterSize) {
        clusters.push(cluster)
      }
    })

    clusters.forEach((cluster, idx) => {
      patterns.push({
        type: 'geographic',
        subtype: 'proximity_cluster',
        radius_km: 50,
        experienceCount: cluster.length,
        experienceIds: cluster.map((e) => e.id),
        confidence: Math.min(cluster.length / 8, 1),
        description: `${cluster.length} experiences within 50km proximity`,
      })
    })
  }

  return patterns
}

function detectSemanticPatterns(experiences: any[], params: PatternParams) {
  const patterns: any[] = []

  // Tag co-occurrence analysis
  const tagPairs = new Map<string, { count: number; experiences: string[] }>()

  experiences.forEach((exp) => {
    if (!exp.tags || exp.tags.length < 2) return

    // Generate all tag pairs
    for (let i = 0; i < exp.tags.length; i++) {
      for (let j = i + 1; j < exp.tags.length; j++) {
        const pair = [exp.tags[i], exp.tags[j]].sort().join(' + ')
        if (!tagPairs.has(pair)) {
          tagPairs.set(pair, { count: 0, experiences: [] })
        }
        const data = tagPairs.get(pair)!
        data.count++
        data.experiences.push(exp.id)
      }
    }
  })

  // Find frequent tag pairs
  tagPairs.forEach((data, pair) => {
    if (data.count >= params.minClusterSize) {
      patterns.push({
        type: 'semantic',
        subtype: 'tag_cooccurrence',
        tagPair: pair.split(' + '),
        experienceCount: data.count,
        experienceIds: data.experiences,
        confidence: Math.min(data.count / 10, 1),
        description: `Tags "${pair}" co-occur in ${data.count} experiences`,
      })
    }
  })

  return patterns
}

function detectEmotionalPatterns(experiences: any[], params: PatternParams) {
  const patterns: any[] = []

  // Group by shared emotions (if available)
  const emotionGroups = new Map<string, any[]>()

  experiences.forEach((exp) => {
    if (!exp.tags) return
    // Look for emotion-related tags (simplified - in production use sentiment analysis)
    const emotionTags = exp.tags.filter((tag: string) =>
      ['fear', 'wonder', 'awe', 'confusion', 'curiosity', 'joy', 'anxiety'].includes(
        tag.toLowerCase()
      )
    )

    emotionTags.forEach((emotion: string) => {
      if (!emotionGroups.has(emotion)) emotionGroups.set(emotion, [])
      emotionGroups.get(emotion)!.push(exp)
    })
  })

  emotionGroups.forEach((exps, emotion) => {
    if (exps.length >= params.minClusterSize) {
      patterns.push({
        type: 'emotional',
        subtype: 'shared_emotion',
        emotion,
        experienceCount: exps.length,
        experienceIds: exps.map((e) => e.id),
        confidence: Math.min(exps.length / 12, 1),
        description: `${exps.length} experiences share "${emotion}" emotion`,
      })
    }
  })

  return patterns
}

function detectCrossCategoryPatterns(experiences: any[], params: PatternParams) {
  const patterns: any[] = []

  // Group by category pairs
  const categoryMap = new Map<string, any[]>()
  experiences.forEach((exp) => {
    if (!categoryMap.has(exp.category_slug)) {
      categoryMap.set(exp.category_slug, [])
    }
    categoryMap.get(exp.category_slug)!.push(exp)
  })

  // Only consider if we have multiple categories
  if (categoryMap.size >= 2) {
    const categories = Array.from(categoryMap.keys())

    // Check for shared tags across categories
    const crossCategoryTags = new Map<string, Set<string>>()

    experiences.forEach((exp) => {
      exp.tags?.forEach((tag: string) => {
        if (!crossCategoryTags.has(tag)) {
          crossCategoryTags.set(tag, new Set())
        }
        crossCategoryTags.get(tag)!.add(exp.category_slug)
      })
    })

    // Find tags that appear in multiple categories
    crossCategoryTags.forEach((categories, tag) => {
      if (categories.size >= 2) {
        const matchingExps = experiences.filter((e) => e.tags?.includes(tag))
        if (matchingExps.length >= params.minClusterSize) {
          patterns.push({
            type: 'crossCategory',
            subtype: 'shared_tag_across_categories',
            tag,
            categories: Array.from(categories),
            experienceCount: matchingExps.length,
            experienceIds: matchingExps.map((e) => e.id),
            confidence: Math.min((categories.size * matchingExps.length) / 20, 1),
            description: `Tag "${tag}" appears across ${categories.size} categories in ${matchingExps.length} experiences`,
          })
        }
      }
    })
  }

  return patterns
}

// ===== Utility Functions =====

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
