/**
 * XPShare AI - Suggest Follow-Ups Tool
 *
 * Generates context-aware follow-up suggestions based on current query results
 * and conversation history. Uses GPT-based analysis for intelligent suggestions.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

// ============================================================================
// Schema Definition
// ============================================================================

const suggestFollowupsSchema = z.object({
  query: z.string().describe('The original user query'),
  results: z.any().describe('The query results (data, insights, predictions, etc.)'),
  context: z
    .object({
      category: z.string().optional().describe('Primary category if applicable'),
      location: z.string().optional().describe('Location context if applicable'),
      timeRange: z.string().optional().describe('Time range of results'),
      totalResults: z.number().optional().describe('Total number of results'),
    })
    .optional()
    .describe('Additional context about the query'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('Previous conversation messages for context'),
  maxSuggestions: z.number().min(1).max(10).default(5).describe('Maximum number of suggestions'),
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface FollowUpSuggestion {
  id: string
  type: 'explore' | 'filter' | 'visualize' | 'analyze' | 'compare' | 'export'
  label: string
  description: string
  query: string
  icon?: string
  priority: number
}

// ============================================================================
// Template-Based Suggestions
// ============================================================================

/**
 * Generate template-based follow-up suggestions
 */
function generateTemplateSuggestions(
  query: string,
  results: any,
  context?: any
): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = []
  let idCounter = 0

  // Extract context
  const hasGeo = context?.location || (Array.isArray(results) && results.some((r: any) => r.location_lat))
  const hasTemporal = context?.timeRange || (Array.isArray(results) && results.some((r: any) => r.date_occurred))
  const hasCategory = context?.category || (Array.isArray(results) && results.some((r: any) => r.category))
  const totalResults = context?.totalResults || (Array.isArray(results) ? results.length : 0)

  // Visualization suggestions
  if (hasGeo && totalResults > 1) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'visualize',
      label: 'Show on map',
      description: 'Visualize geographic distribution of results',
      query: `Show me a map of ${query}`,
      icon: '🗺️',
      priority: 8,
    })
  }

  if (hasTemporal && totalResults > 2) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'visualize',
      label: 'Timeline view',
      description: 'See temporal patterns over time',
      query: `Show timeline of ${query}`,
      icon: '📈',
      priority: 8,
    })
  }

  // Analysis suggestions
  if (totalResults > 5) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'analyze',
      label: 'Detect patterns',
      description: 'Find hidden patterns and insights',
      query: `Analyze patterns in ${query}`,
      icon: '🔍',
      priority: 7,
    })
  }

  if (hasTemporal && totalResults > 3) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'analyze',
      label: 'Predict trends',
      description: 'Forecast future trends based on historical data',
      query: `Predict future trends for ${query}`,
      icon: '🔮',
      priority: 7,
    })
  }

  // Filter suggestions
  if (hasCategory && totalResults > 3) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'filter',
      label: 'Compare categories',
      description: 'Break down results by category',
      query: `Compare categories for ${query}`,
      icon: '📊',
      priority: 6,
    })
  }

  if (context?.location) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'filter',
      label: 'Nearby locations',
      description: 'Expand search to nearby areas',
      query: `Find similar experiences near ${context.location}`,
      icon: '📍',
      priority: 6,
    })
  }

  // Explore suggestions
  if (totalResults > 0) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'explore',
      label: 'Related experiences',
      description: 'Find similar or connected experiences',
      query: `Show me experiences related to ${query}`,
      icon: '🔗',
      priority: 5,
    })
  }

  if (Array.isArray(results) && results.length > 0 && results[0].user_id) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'explore',
      label: 'Top contributors',
      description: 'See who contributed most to these results',
      query: `Who are the top contributors for ${query}?`,
      icon: '👥',
      priority: 5,
    })
  }

  // Export suggestions
  if (totalResults > 0) {
    suggestions.push({
      id: `followup-${idCounter++}`,
      type: 'export',
      label: 'Export results',
      description: 'Download data as JSON or CSV',
      query: `Export results for ${query}`,
      icon: '💾',
      priority: 4,
    })
  }

  return suggestions
}

// ============================================================================
// GPT-Based Suggestions
// ============================================================================

/**
 * Generate intelligent follow-up suggestions using GPT
 */
async function generateIntelligentSuggestions(
  query: string,
  results: any,
  context: any,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxSuggestions: number = 5
): Promise<FollowUpSuggestion[]> {
  try {
    // Build context for GPT
    const resultsCount = Array.isArray(results) ? results.length : 1
    const hasResults = resultsCount > 0

    const systemPrompt = `You are an intelligent assistant for XPShare, a platform for exploring anomalous experiences (UFOs, dreams, NDEs, psychic events, etc.).

Your task is to suggest relevant follow-up queries based on the user's current query and results.

Guidelines:
- Be specific and actionable
- Consider the data structure (geographic, temporal, categorical)
- Build on previous conversation context
- Suggest both exploration and analysis queries
- Use natural, conversational language
- Prioritize valuable insights over generic suggestions

Return suggestions as a JSON array with this structure:
[
  {
    "type": "explore" | "filter" | "visualize" | "analyze" | "compare" | "export",
    "label": "Short label (2-4 words)",
    "description": "Brief description (1 sentence)",
    "query": "Full follow-up query text",
    "priority": 1-10 (higher = more relevant)
  }
]`

    const userPrompt = `Current Query: "${query}"
Results: ${hasResults ? `${resultsCount} results found` : 'No results'}
Context: ${JSON.stringify(context || {}, null, 2)}
${conversationHistory ? `\nConversation History:\n${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}` : ''}

Generate ${maxSuggestions} relevant follow-up suggestions.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxCompletionTokens: 1000,
    })

    // Parse GPT response
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      throw new Error('GPT response is not an array')
    }

    // Convert to FollowUpSuggestion format
    return parsed.slice(0, maxSuggestions).map((s: any, i: number) => ({
      id: `gpt-followup-${i}`,
      type: s.type || 'explore',
      label: s.label || 'Follow-up',
      description: s.description || '',
      query: s.query || '',
      icon: getIconForType(s.type),
      priority: s.priority || 5,
    }))
  } catch (error) {
    console.error('GPT suggestion generation failed:', error)
    // Fallback to template-based suggestions
    return []
  }
}

/**
 * Get emoji icon for suggestion type
 */
function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    explore: '🔍',
    filter: '🎯',
    visualize: '📊',
    analyze: '🧠',
    compare: '⚖️',
    export: '💾',
  }
  return icons[type] || '💡'
}

// ============================================================================
// Main Tool
// ============================================================================

export const suggestFollowupsTool = tool({
  description: `Generate intelligent follow-up suggestions based on query results and context.

  Features:
  - GPT-powered context-aware suggestions
  - Template-based fallback suggestions
  - Multiple suggestion types (explore, filter, visualize, analyze, compare, export)
  - Priority scoring for relevance
  - Conversation history awareness

  Returns array of actionable follow-up queries with descriptions and icons.`,
  inputSchema: suggestFollowupsSchema,
  execute: async ({ query, results, context, conversationHistory, maxSuggestions }) => {
    // Generate template-based suggestions as baseline
    const templateSuggestions = generateTemplateSuggestions(query, results, context)

    // Try GPT-based suggestions
    const gptSuggestions = await generateIntelligentSuggestions(
      query,
      results,
      context,
      conversationHistory,
      maxSuggestions
    )

    // Combine suggestions, prioritizing GPT if available
    let suggestions: FollowUpSuggestion[]
    if (gptSuggestions.length > 0) {
      // Use GPT suggestions with template fallbacks
      suggestions = [
        ...gptSuggestions,
        ...templateSuggestions.filter(
          (ts) => !gptSuggestions.some((gs) => gs.type === ts.type && gs.label === ts.label)
        ),
      ]
    } else {
      // Use only template suggestions
      suggestions = templateSuggestions
    }

    // Sort by priority and limit
    suggestions.sort((a, b) => b.priority - a.priority)
    suggestions = suggestions.slice(0, maxSuggestions)

    return {
      suggestions,
      count: suggestions.length,
      summary: `Generated ${suggestions.length} follow-up suggestions`,
      usedGPT: gptSuggestions.length > 0,
    }
  },
})
