/**
 * Serendipity Detection for Search 5.0
 *
 * Discovers unexpected but relevant cross-category patterns.
 * Example: User asks about UFOs, discovers Kugelblitz (ball lightning) similarities
 *
 * Algorithm:
 * 1. Identify primary category from query results
 * 2. Calculate average embedding of matched experiences
 * 3. Find similar experiences from DIFFERENT categories
 * 4. Return largest cross-category cluster (min 3 experiences)
 *
 * @see docs/masterdocs/search5.md (Part 2 - Serendipity Detection)
 */

import { createClient } from '@/lib/supabase/server'
import { Source } from '@/types/ai-answer'
import { SerendipityConnection } from '@/types/search5'

/**
 * Experience type from Supabase (extended Source with embedding)
 */
interface ExperienceWithEmbedding extends Source {
  embedding?: string  // JSON-stringified number array
}

/**
 * RPC result type from match_experiences
 */
interface MatchExperienceResult {
  id: string
  title: string
  story_text: string
  category: string
  similarity: number
  date_occurred?: string
  location_text?: string
  tags?: string[]
  embedding?: string
}

/**
 * Detect serendipity connections - unexpected but relevant cross-category patterns
 *
 * @param sources - Matched experiences from primary query
 * @param question - Original user question (for context)
 * @returns Serendipity connection or null if none found
 *
 * Requirements for serendipity:
 * - At least 3 experiences from different category
 * - Similarity > 0.6 (high semantic similarity)
 * - Different from primary category (unexpected)
 */
export async function detectSerendipity(
  sources: Source[],
  question: string
): Promise<SerendipityConnection | null> {
  const supabase = await createClient()

  // Step 1: Identify primary category from sources
  const categoryCount = new Map<string, number>()
  sources.forEach(exp => {
    categoryCount.set(exp.category, (categoryCount.get(exp.category) || 0) + 1)
  })

  if (categoryCount.size === 0) return null

  const primaryCategory = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])[0][0]

  console.log('🔍 Serendipity detection:', {
    primaryCategory,
    sourceCount: sources.length,
    question: question.substring(0, 50)
  })

  // Step 2: Calculate average embedding vector from sources
  // We need to fetch full experience data with embeddings
  const sourceIds = sources.map(s => s.id)
  const { data: fullSources, error: fetchError } = await supabase
    .from('experiences')
    .select('id, title, story_text, category, embedding, date_occurred, location_text, tags')
    .in('id', sourceIds)
    .not('embedding', 'is', null)

  if (fetchError || !fullSources || fullSources.length === 0) {
    console.warn('Could not fetch embeddings for serendipity detection')
    return null
  }

  const embeddings = fullSources
    .map(s => s.embedding ? JSON.parse(s.embedding) : null)
    .filter((e): e is number[] => e !== null && Array.isArray(e))

  if (embeddings.length === 0) {
    console.warn('No valid embeddings found for serendipity')
    return null
  }

  // Calculate average embedding (centroid of query results)
  const embeddingSize = embeddings[0].length
  const avgEmbedding = Array(embeddingSize).fill(0).map((_, i) =>
    embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
  )

  // Step 3: Find similar experiences from DIFFERENT categories
  const { data: candidates, error: searchError } = await (supabase as any).rpc('match_experiences', {
    query_embedding: avgEmbedding,
    match_threshold: 0.5,   // Lower threshold to find cross-category matches
    match_count: 30,
    filter_category: null    // No category filter - we want all categories
  })

  if (searchError || !candidates || candidates.length === 0) {
    console.warn('Serendipity search failed:', searchError)
    return null
  }

  // Step 4: Filter for different categories with high similarity
  const crossCategory = (candidates as MatchExperienceResult[])
    .filter(exp => exp.category !== primaryCategory)
    .filter(exp => exp.similarity > 0.6)  // High similarity threshold

  console.log('🔍 Cross-category candidates:', {
    total: crossCategory.length,
    categories: [...new Set(crossCategory.map(e => e.category))]
  })

  if (crossCategory.length < 3) {
    console.log('Not enough cross-category matches for serendipity')
    return null
  }

  // Step 5: Group by category and find largest cluster
  const categoryGroups = new Map<string, MatchExperienceResult[]>()
  crossCategory.forEach(exp => {
    if (!categoryGroups.has(exp.category)) {
      categoryGroups.set(exp.category, [])
    }
    categoryGroups.get(exp.category)!.push(exp)
  })

  // Find largest cross-category cluster
  const bestMatch = Array.from(categoryGroups.entries())
    .sort((a, b) => b[1].length - a[1].length)[0]

  if (!bestMatch || bestMatch[1].length < 3) {
    console.log('No significant cross-category cluster found')
    return null
  }

  const [targetCategory, experiences] = bestMatch
  const avgSimilarity = experiences.reduce((sum, exp) => sum + exp.similarity, 0) / experiences.length

  console.log('✨ Serendipity detected!', {
    primaryCategory,
    targetCategory,
    matchCount: experiences.length,
    avgSimilarity
  })

  // Step 6: Build serendipity connection object
  const serendipityExperiences: Source[] = experiences.slice(0, 5).map(exp => ({
    id: exp.id,
    title: exp.title,
    excerpt: exp.story_text.substring(0, 200),
    fullText: exp.story_text,
    category: exp.category,
    similarity: exp.similarity,
    date_occurred: exp.date_occurred,
    location_text: exp.location_text,
    attributes: exp.tags
  }))

  return {
    targetCategory,
    similarity: avgSimilarity,
    explanation: `Diese ${targetCategory}-Erfahrungen zeigen überraschende Ähnlichkeiten mit ${primaryCategory}-Berichten`,
    experiences: serendipityExperiences,
    count: experiences.length
  }
}

/**
 * Helper: Calculate cosine similarity between two vectors
 * (Not currently used but useful for manual similarity checks)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
