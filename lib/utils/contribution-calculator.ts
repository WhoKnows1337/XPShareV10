/**
 * Contribution Calculator
 *
 * Calculates meaningful contribution metrics to show users
 * why their experience matters and how it contributes to patterns
 */

interface ExperienceData {
  id: string
  category: string
  location?: {
    city?: string
    country?: string
  }
  dateOccurred: string
  mediaCount?: number
  witnessCount?: number
  attributes: string[]
}

interface SimilarExperience {
  id: string
  category: string
  matchScore: number
}

interface PatternData {
  type: 'wave' | 'temporal' | 'correlation'
  count: number
  significance?: number
  confidence?: number
}

export interface ContributionMetrics {
  messages: string[]
  stats: {
    clusterPosition?: string // e.g., "5th in Vienna"
    temporalPosition?: string // e.g., "3rd this month"
    uniqueContributions: string[] // e.g., ["First with photo", "Added witness"]
    patternImpact?: string // e.g., "Pattern strength +15%"
  }
  highlights: {
    isFirstInArea?: boolean
    isPartOfCluster?: boolean
    strengthensPattern?: boolean
    providesNewEvidence?: boolean
  }
}

/**
 * Calculate contribution metrics for a submitted experience
 */
export function calculateContribution(
  experience: ExperienceData,
  similarExperiences: SimilarExperience[],
  patterns: PatternData[]
): ContributionMetrics {
  const messages: string[] = []
  const uniqueContributions: string[] = []
  const highlights = {
    isFirstInArea: false,
    isPartOfCluster: false,
    strengthensPattern: false,
    providesNewEvidence: false,
  }

  // Calculate cluster position
  const clusterPosition = calculateClusterPosition(experience, similarExperiences)

  // Calculate temporal position
  const temporalPosition = calculateTemporalPosition(experience, similarExperiences)

  // Identify unique contributions
  const unique = identifyUniqueContributions(experience, similarExperiences)
  uniqueContributions.push(...unique)

  // Calculate pattern impact
  const patternImpact = calculatePatternImpact(similarExperiences, patterns)

  // Build messages
  if (clusterPosition) {
    if (clusterPosition.position === 1) {
      messages.push(`You're the first to document this ${experience.category} in ${clusterPosition.location}`)
      highlights.isFirstInArea = true
    } else {
      messages.push(
        `You're the ${ordinal(clusterPosition.position)} person to report this in ${
          clusterPosition.location
        }`
      )
      highlights.isPartOfCluster = true
    }
  }

  if (temporalPosition) {
    messages.push(`${ordinal(temporalPosition.position)} report this ${temporalPosition.period}`)
  }

  if (uniqueContributions.length > 0) {
    uniqueContributions.forEach((contribution) => {
      messages.push(contribution)
    })
    highlights.providesNewEvidence = true
  }

  if (patternImpact) {
    messages.push(`Your contribution: ${patternImpact}`)
    highlights.strengthensPattern = true
  }

  return {
    messages,
    stats: {
      clusterPosition: clusterPosition
        ? `${ordinal(clusterPosition.position)} in ${clusterPosition.location}`
        : undefined,
      temporalPosition: temporalPosition
        ? `${ordinal(temporalPosition.position)} this ${temporalPosition.period}`
        : undefined,
      uniqueContributions,
      patternImpact,
    },
    highlights,
  }
}

/**
 * Calculate position in geographic cluster
 */
function calculateClusterPosition(
  experience: ExperienceData,
  similarExperiences: SimilarExperience[]
): { position: number; location: string } | null {
  const city = experience.location?.city
  if (!city) return null

  // Count similar experiences (match score > 0.7 indicates same cluster)
  const inCluster = similarExperiences.filter((sim) => sim.matchScore > 0.7)

  return {
    position: inCluster.length + 1, // User is the newest
    location: city,
  }
}

/**
 * Calculate position in temporal period
 */
function calculateTemporalPosition(
  experience: ExperienceData,
  similarExperiences: SimilarExperience[]
): { position: number; period: string } | null {
  // For simplicity, use "this month" if there are similar experiences
  if (similarExperiences.length === 0) return null

  const thisMonth = similarExperiences.filter((sim) => sim.matchScore > 0.6)

  if (thisMonth.length === 0) return null

  return {
    position: thisMonth.length + 1,
    period: 'month',
  }
}

/**
 * Identify unique contributions (first photo, witness, etc.)
 */
function identifyUniqueContributions(
  experience: ExperienceData,
  similarExperiences: SimilarExperience[]
): string[] {
  const contributions: string[] = []

  // Check if first with photo evidence
  if (experience.mediaCount && experience.mediaCount > 0) {
    // Simplified: assume if user has media and cluster exists, they're providing new evidence
    if (similarExperiences.length > 3) {
      contributions.push('Your photo provides new visual evidence for this cluster')
    }
  }

  // Check if has witness testimony
  if (experience.witnessCount && experience.witnessCount > 0) {
    contributions.push('Your witness testimony strengthens the credibility')
  }

  // Check for unique attributes
  if (experience.attributes.length > 5) {
    contributions.push('Your detailed attributes help refine pattern detection')
  }

  return contributions
}

/**
 * Calculate impact on pattern strength
 */
function calculatePatternImpact(
  similarExperiences: SimilarExperience[],
  patterns: PatternData[]
): string | undefined {
  if (patterns.length === 0) return undefined

  // Find strongest pattern
  const strongestPattern = patterns.reduce((max, pattern) => {
    const strength = pattern.significance || pattern.confidence || 0
    const maxStrength = max.significance || max.confidence || 0
    return strength > maxStrength ? pattern : max
  })

  if (!strongestPattern) return undefined

  // Calculate impact based on cluster size
  const clusterSize = similarExperiences.length + 1
  let impact = 0

  if (clusterSize < 10) {
    impact = 20 // High impact for small clusters
  } else if (clusterSize < 30) {
    impact = 15 // Medium impact
  } else {
    impact = 10 // Lower impact for large clusters
  }

  return `Pattern strength +${impact}%`
}

/**
 * Convert number to ordinal (1st, 2nd, 3rd, etc.)
 */
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Generate contextual contribution message based on category
 */
export function getCategoryContextMessage(
  category: string,
  contributionMetrics: ContributionMetrics
): string {
  const { highlights } = contributionMetrics

  if (highlights.isFirstInArea) {
    return `Your ${category} documentation is pioneering this region's consciousness map.`
  }

  if (highlights.strengthensPattern) {
    return `Your ${category} experience confirms and strengthens an emerging pattern.`
  }

  if (highlights.providesNewEvidence) {
    return `Your ${category} evidence adds crucial new data to our understanding.`
  }

  return `Your ${category} experience is now part of the global consciousness network.`
}
