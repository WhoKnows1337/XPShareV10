/**
 * Citation Tracker
 *
 * Extracts and tracks source attributions from AI tool results.
 * Links AI responses to specific experiences used as sources.
 */

import { createClient } from '@/lib/supabase/server'
import type { Citation, ToolResultWithExperiences } from './types'

// Re-export types for backward compatibility
export type { Citation, ToolResultWithExperiences }

/**
 * Extract experience IDs from tool results
 */
export function extractCitationsFromToolResult(
  toolResult: ToolResultWithExperiences
): Omit<Citation, 'citationIndex'>[] {
  const { toolName, result } = toolResult
  const citations: Omit<Citation, 'citationIndex'>[] = []

  // Handle different result formats
  if (!result || typeof result !== 'object') {
    return citations
  }

  const data = result as Record<string, unknown>

  // Extract from 'experiences' array (most common format)
  if (Array.isArray(data.experiences)) {
    data.experiences.forEach((exp: any) => {
      if (exp?.id) {
        citations.push({
          experienceId: exp.id,
          toolName,
          relevanceScore: calculateRelevance(exp, toolName),
          snippet: extractSnippet(exp),
          contextBefore: exp.description?.substring(0, 100),
          contextAfter: exp.description?.substring(100, 200),
        })
      }
    })
  }

  // Extract from 'results' array (alternative format)
  if (Array.isArray(data.results)) {
    data.results.forEach((result: any) => {
      if (result?.experience_id) {
        citations.push({
          experienceId: result.experience_id,
          toolName,
          relevanceScore: result.similarity_score || result.score || 0.8,
          snippet: result.snippet || result.description?.substring(0, 200),
        })
      }
    })
  }

  // Extract from 'data' object (nested format)
  if (data.data && typeof data.data === 'object') {
    const nestedResult = extractCitationsFromToolResult({
      toolName,
      result: data.data,
    })
    citations.push(...nestedResult)
  }

  return citations
}

/**
 * Calculate relevance score based on tool type and result metadata
 */
function calculateRelevance(experience: any, toolName: string): number {
  // Semantic search results have explicit similarity scores
  if (toolName === 'semanticSearch' && experience.similarity_score) {
    return Math.min(1.0, Math.max(0.0, experience.similarity_score))
  }

  // Geographic search - closer = more relevant
  if (toolName === 'geoSearch' && experience.distance_km !== undefined) {
    const maxDistance = 100 // km
    return Math.max(0.0, 1.0 - experience.distance_km / maxDistance)
  }

  // Full-text search - rank determines relevance
  if (toolName === 'fullTextSearch' && experience.rank !== undefined) {
    return Math.min(1.0, experience.rank / 10)
  }

  // Pattern detection - high confidence = high relevance
  if (toolName === 'detectPatterns' && experience.confidence) {
    return experience.confidence
  }

  // Default relevance for direct results
  return 0.9
}

/**
 * Extract a meaningful snippet from an experience
 */
function extractSnippet(experience: any, maxLength: number = 200): string | undefined {
  if (!experience) return undefined

  // Prefer description
  if (experience.description) {
    return experience.description.substring(0, maxLength).trim() + '...'
  }

  // Fall back to title
  if (experience.title) {
    return experience.title.substring(0, maxLength).trim()
  }

  return undefined
}

/**
 * Save citations to database
 */
export async function saveCitations(
  messageId: string,
  citations: Citation[]
): Promise<void> {
  if (citations.length === 0) return

  const supabase = await createClient()

  const citationRecords = citations.map((citation) => ({
    message_id: messageId,
    experience_id: citation.experienceId,
    tool_name: citation.toolName,
    citation_number: citation.citationIndex,
    relevance_score: citation.relevanceScore,
    snippet_text: citation.snippet,
    context_before: citation.contextBefore,
    context_after: citation.contextAfter,
  }))

  const { error } = await supabase.from('citations').insert(citationRecords)

  if (error) {
    console.error('[Citations] Failed to save citations:', error)
    throw error
  }
}

/**
 * Get citations for a message
 */
export async function getCitationsForMessage(
  messageId: string
): Promise<Citation[]> {
  const supabase = await createClient()

  // Use raw SQL to avoid PostgREST schema cache issues
  const { data, error } = await supabase.rpc('get_citations_for_message', {
    p_message_id: messageId
  })

  if (error) {
    console.error('[Citations] Failed to load citations:', error)
    return []
  }

  return (
    data?.map((c: any) => ({
      experienceId: c.experience_id,
      toolName: c.tool_name,
      citationIndex: c.citation_number,
      relevanceScore: c.relevance_score || 0.8,
      snippet: c.snippet_text,
      contextBefore: c.context_before,
      contextAfter: c.context_after,
      experience: c.experience ? {
        id: c.experience.id,
        title: c.experience.title,
        category: c.experience.category,
        created_at: c.experience.created_at,
        user_id: c.experience.user_id,
        user_profiles: c.experience.user_profiles
      } : undefined,
    })) || []
  )
}

/**
 * Assign citation indices to a list of citations
 */
export function assignCitationIndices(
  citations: Omit<Citation, 'citationIndex'>[]
): Citation[] {
  // Remove duplicates based on experienceId
  const uniqueCitations = citations.reduce(
    (acc, citation) => {
      if (!acc.some((c) => c.experienceId === citation.experienceId)) {
        acc.push(citation)
      }
      return acc
    },
    [] as Omit<Citation, 'citationIndex'>[]
  )

  // Sort by relevance score (highest first)
  uniqueCitations.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Assign sequential indices
  return uniqueCitations.map((citation, index) => ({
    ...citation,
    citationIndex: index + 1,
  }))
}
