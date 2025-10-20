import { tool } from 'ai'
import { z } from 'zod'
import { getExperiences } from '@/lib/search/hybrid'
import { createClient } from '@/lib/supabase/server'

/**
 * Tool 3: Find Connections
 *
 * Discovers relationships between experiences:
 * - Similarity: Semantic similarity via embeddings
 * - Co-occurrence: Shared tags, locations, timeframes
 * - User Network: Users with similar experience patterns
 * - Witnesses: Cross-referenced witness connections
 *
 * Used by: /app/api/discover/route.ts
 */

const ConnectionParamsSchema = z.object({
  experienceIds: z
    .array(z.string())
    .describe('Array of experience IDs to find connections between'),

  connectionTypes: z
    .array(z.enum(['similarity', 'coOccurrence', 'userNetwork', 'witnesses']))
    .describe('Types of connections to find'),

  threshold: z
    .number()
    .min(0)
    .max(1)
    .default(0.7)
    .describe('Minimum connection strength threshold (0-1, default: 0.7)'),
})

export type ConnectionParams = z.infer<typeof ConnectionParamsSchema>

export const findConnectionsTool = tool({
  description: `Find connections and relationships between experiences.

Connection Types:
- similarity: Semantic similarity using vector embeddings (content-based)
- coOccurrence: Shared attributes (tags, locations, timeframes)
- userNetwork: Users who have similar experience patterns
- witnesses: Experiences with cross-referenced witnesses

Best for:
- "How are these experiences connected?"
- "Find similar experiences to this set"
- "Which users have overlapping experiences?"
- "Are there witness connections between these events?"`,

  parameters: ConnectionParamsSchema,

  execute: async (params: ConnectionParams) => {
    try {
      const connections: any[] = []

      for (const type of params.connectionTypes) {
        switch (type) {
          case 'similarity':
            connections.push(
              ...(await findSimilarityConnections(
                params.experienceIds,
                params.threshold
              ))
            )
            break
          case 'coOccurrence':
            connections.push(
              ...(await findCoOccurrenceConnections(
                params.experienceIds,
                params.threshold
              ))
            )
            break
          case 'userNetwork':
            connections.push(
              ...(await findUserNetworkConnections(params.experienceIds))
            )
            break
          case 'witnesses':
            connections.push(
              ...(await findWitnessConnections(params.experienceIds))
            )
            break
        }
      }

      return {
        connections: connections.filter((c) => c.strength >= params.threshold),
        count: connections.length,
        experiencesAnalyzed: params.experienceIds.length,
      }
    } catch (error: any) {
      console.error('Connection finding error:', error)
      return {
        connections: [],
        count: 0,
        error: `Connection finding failed: ${error.message}`,
      }
    }
  },
})

// ===== Connection Detection Helpers =====

/**
 * Find similarity connections via vector embeddings
 */
async function findSimilarityConnections(
  experienceIds: string[],
  threshold: number
) {
  const supabase = await createClient()
  const connections: any[] = []

  // Fetch embeddings for all experiences
  const { data: experiences, error } = await supabase
    .from('experiences')
    .select('id, title, embedding, category')
    .in('id', experienceIds)

  if (error || !experiences) {
    console.error('Failed to fetch embeddings:', error)
    return []
  }

  // Calculate pairwise cosine similarity
  for (let i = 0; i < experiences.length; i++) {
    for (let j = i + 1; j < experiences.length; j++) {
      const exp1 = experiences[i]
      const exp2 = experiences[j]

      if (!exp1.embedding || !exp2.embedding) continue

      const similarity = cosineSimilarity(
        exp1.embedding as number[],
        exp2.embedding as number[]
      )

      if (similarity >= threshold) {
        connections.push({
          from: exp1.id,
          to: exp2.id,
          type: 'similarity',
          strength: similarity,
          reason: `Both experiences have ${Math.round(similarity * 100)}% semantic similarity`,
        })
      }
    }
  }

  return connections
}

/**
 * Find co-occurrence connections (shared tags, locations, dates)
 */
async function findCoOccurrenceConnections(
  experienceIds: string[],
  threshold: number
) {
  const experiences = await getExperiences(experienceIds)
  const connections: any[] = []

  for (let i = 0; i < experiences.length; i++) {
    for (let j = i + 1; j < experiences.length; j++) {
      const exp1 = experiences[i]
      const exp2 = experiences[j]

      const sharedAttributes: string[] = []
      let strength = 0

      // Check shared tags
      const sharedTags =
        exp1.tags?.filter((tag) => exp2.tags?.includes(tag)) || []
      if (sharedTags.length > 0) {
        sharedAttributes.push(
          ...sharedTags.map((tag) => `tag:${tag}`)
        )
        strength += sharedTags.length * 0.15 // Each shared tag adds 0.15
      }

      // Check shared location (country)
      if (exp1.location_text && exp2.location_text) {
        const country1 = exp1.location_text.split(',').pop()?.trim()
        const country2 = exp2.location_text.split(',').pop()?.trim()
        if (country1 === country2) {
          sharedAttributes.push(`location:${country1}`)
          strength += 0.2
        }
      }

      // Check temporal proximity (same month)
      if (exp1.date_occurred && exp2.date_occurred) {
        const month1 = exp1.date_occurred.substring(0, 7)
        const month2 = exp2.date_occurred.substring(0, 7)
        if (month1 === month2) {
          sharedAttributes.push(`timeframe:${month1}`)
          strength += 0.25
        }
      }

      // Check same category
      if (exp1.category_slug === exp2.category_slug) {
        sharedAttributes.push(`category:${exp1.category_slug}`)
        strength += 0.1
      }

      // Normalize strength to 0-1
      strength = Math.min(strength, 1)

      if (strength >= threshold && sharedAttributes.length > 0) {
        connections.push({
          from: exp1.id,
          to: exp2.id,
          type: 'coOccurrence',
          strength,
          sharedAttributes,
          reason: `Shared attributes: ${sharedAttributes.join(', ')}`,
        })
      }
    }
  }

  return connections
}

/**
 * Find user network connections (users with similar experience patterns)
 */
async function findUserNetworkConnections(experienceIds: string[]) {
  const experiences = await getExperiences(experienceIds)
  const connections: any[] = []

  // Group by user_id
  const userExperiences = new Map<string, any[]>()
  experiences.forEach((exp) => {
    if (!exp.user_id) return
    if (!userExperiences.has(exp.user_id)) {
      userExperiences.set(exp.user_id, [])
    }
    userExperiences.get(exp.user_id)!.push(exp)
  })

  // Find users with multiple experiences in the set
  const activeUsers = Array.from(userExperiences.entries()).filter(
    ([_, exps]) => exps.length >= 2
  )

  activeUsers.forEach(([userId, userExps]) => {
    // Create connections between this user's experiences
    for (let i = 0; i < userExps.length; i++) {
      for (let j = i + 1; j < userExps.length; j++) {
        connections.push({
          from: userExps[i].id,
          to: userExps[j].id,
          type: 'userNetwork',
          strength: 0.8, // High strength for same-user connections
          userId,
          reason: `Both experiences submitted by same user (${userId.substring(0, 8)}...)`,
        })
      }
    }
  })

  return connections
}

/**
 * Find witness connections (cross-referenced witnesses)
 */
async function findWitnessConnections(experienceIds: string[]) {
  const supabase = await createClient()
  const connections: any[] = []

  // Fetch witness data
  const { data: witnesses, error } = await supabase
    .from('experience_witnesses')
    .select('experience_id, name, contact_info')
    .in('experience_id', experienceIds)

  if (error || !witnesses) {
    console.error('Failed to fetch witnesses:', error)
    return []
  }

  // Group by witness name (case-insensitive)
  const witnessMap = new Map<string, string[]>()
  witnesses.forEach((w) => {
    const name = w.name?.toLowerCase().trim()
    if (!name) return
    if (!witnessMap.has(name)) {
      witnessMap.set(name, [])
    }
    witnessMap.get(name)!.push(w.experience_id)
  })

  // Find witnesses appearing in multiple experiences
  witnessMap.forEach((expIds, witnessName) => {
    if (expIds.length >= 2) {
      // Create connections between all experiences with this witness
      for (let i = 0; i < expIds.length; i++) {
        for (let j = i + 1; j < expIds.length; j++) {
          connections.push({
            from: expIds[i],
            to: expIds[j],
            type: 'witnesses',
            strength: 0.9, // Very high strength for witness cross-reference
            witnessName,
            reason: `Cross-referenced by witness: ${witnessName}`,
          })
        }
      }
    }
  })

  return connections
}

// ===== Utility Functions =====

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0

  let dotProduct = 0
  let mag1 = 0
  let mag2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    mag1 += vec1[i] * vec1[i]
    mag2 += vec2[i] * vec2[i]
  }

  mag1 = Math.sqrt(mag1)
  mag2 = Math.sqrt(mag2)

  if (mag1 === 0 || mag2 === 0) return 0

  return dotProduct / (mag1 * mag2)
}
