/**
 * Citation Generator
 *
 * Generates source citations from AI tool results.
 * Provides footnote-style references [1][2][3] with relevance scoring.
 */

export interface Citation {
  id?: string
  messageId: string
  experienceId: string
  citationNumber: number
  relevanceScore: number
  snippetText: string
  contextBefore?: string
  contextAfter?: string
}

export interface ExperienceSource {
  id: string
  title: string
  description: string
  category: string
  userId: string
  createdAt: string
  relevance?: number
}

/**
 * Extract citations from tool results
 */
export function extractCitationsFromToolResult(
  toolResult: any,
  messageId: string
): Citation[] {
  const citations: Citation[] = []
  let citationNumber = 1

  // Handle different tool result formats
  if (toolResult.results || toolResult.data) {
    const experiences = toolResult.results || toolResult.data

    if (Array.isArray(experiences)) {
      experiences.forEach((exp: any) => {
        if (exp.id) {
          const citation = createCitationFromExperience(exp, messageId, citationNumber)
          citations.push(citation)
          citationNumber++
        }
      })
    }
  }

  // Score citations by relevance
  return scoreCitations(citations)
}

/**
 * Create citation from experience object
 */
function createCitationFromExperience(
  experience: any,
  messageId: string,
  citationNumber: number
): Citation {
  // Extract snippet (first 200 chars of description)
  const description = experience.description || ''
  const snippetText = description.length > 200
    ? description.substring(0, 200) + '...'
    : description

  // Extract context (surrounding text)
  const contextBefore = experience.title || ''
  const contextAfter = experience.category ? `Category: ${experience.category}` : ''

  // Calculate initial relevance (will be refined by scoring)
  const relevanceScore = experience.rank || experience.relevance || 0.5

  return {
    messageId,
    experienceId: experience.id,
    citationNumber,
    relevanceScore,
    snippetText,
    contextBefore,
    contextAfter,
  }
}

/**
 * Score citations by relevance
 *
 * Uses multiple factors:
 * - Text rank/similarity (if available)
 * - Recency (newer = higher score)
 * - Completeness (more fields = higher score)
 */
function scoreCitations(citations: Citation[]): Citation[] {
  return citations.map((citation, index) => {
    let score = citation.relevanceScore

    // Boost score for top results
    if (index < 3) {
      score = Math.min(1.0, score + 0.2)
    }

    // Boost score for complete citations
    if (citation.contextBefore && citation.contextAfter) {
      score = Math.min(1.0, score + 0.1)
    }

    // Boost score for substantial snippets
    if (citation.snippetText.length > 100) {
      score = Math.min(1.0, score + 0.05)
    }

    return {
      ...citation,
      relevanceScore: Math.round(score * 100) / 100, // Round to 2 decimals
    }
  })
}

/**
 * Generate inline citation markers for text
 *
 * Replaces references to experiences with [1], [2], etc.
 */
export function generateInlineCitations(
  text: string,
  citations: Citation[]
): string {
  let citedText = text

  citations.forEach((citation) => {
    // Simple heuristic: if context is mentioned, add citation
    if (citation.contextBefore && citedText.includes(citation.contextBefore)) {
      citedText = citedText.replace(
        citation.contextBefore,
        `${citation.contextBefore}[${citation.citationNumber}]`
      )
    }
  })

  return citedText
}

/**
 * Format citation for display
 */
export function formatCitation(citation: Citation): string {
  const parts = []

  if (citation.contextBefore) {
    parts.push(`"${citation.contextBefore}"`)
  }

  if (citation.snippetText) {
    parts.push(citation.snippetText)
  }

  if (citation.contextAfter) {
    parts.push(`(${citation.contextAfter})`)
  }

  return parts.join(' - ')
}

/**
 * Group citations by relevance
 */
export function groupCitationsByRelevance(citations: Citation[]): {
  high: Citation[]
  medium: Citation[]
  low: Citation[]
} {
  return {
    high: citations.filter((c) => c.relevanceScore >= 0.7),
    medium: citations.filter((c) => c.relevanceScore >= 0.4 && c.relevanceScore < 0.7),
    low: citations.filter((c) => c.relevanceScore < 0.4),
  }
}

/**
 * Save citations to database
 */
export async function saveCitations(
  citations: Citation[],
  supabaseClient: any
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('citations')
      .insert(citations.map(c => ({
        message_id: c.messageId,
        experience_id: c.experienceId,
        citation_number: c.citationNumber,
        relevance_score: c.relevanceScore,
        snippet_text: c.snippetText,
        context_before: c.contextBefore,
        context_after: c.contextAfter,
      })))

    if (error) {
      console.error('Failed to save citations:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving citations:', error)
    return false
  }
}

/**
 * Load citations for a message
 */
export async function loadCitations(
  messageId: string,
  supabaseClient: any
): Promise<Citation[]> {
  try {
    const { data, error } = await supabaseClient
      .from('citations')
      .select('*')
      .eq('message_id', messageId)
      .order('citation_number', { ascending: true })

    if (error) {
      console.error('Failed to load citations:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      messageId: row.message_id,
      experienceId: row.experience_id,
      citationNumber: row.citation_number,
      relevanceScore: row.relevance_score,
      snippetText: row.snippet_text,
      contextBefore: row.context_before,
      contextAfter: row.context_after,
    }))
  } catch (error) {
    console.error('Error loading citations:', error)
    return []
  }
}
