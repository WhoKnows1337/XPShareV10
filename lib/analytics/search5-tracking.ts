/**
 * Search 5.0 Analytics Tracking
 *
 * Comprehensive event tracking for pattern discovery system.
 * Integrates with Supabase analytics tables for dashboards.
 *
 * @see docs/masterdocs/search5.md (Part 5 - Analytics)
 */

import { createClient } from '@/lib/supabase/client'
import { Pattern, QueryRefinements, Search5Response } from '@/types/search5'

// ============================================================================
// TYPES
// ============================================================================

export interface PatternDiscoveryEvent {
  query: string
  userId?: string
  sessionId?: string

  // Results metadata
  patternsFound: number
  sourcesFound: number
  confidence: number
  executionTime: number

  // Conversation context
  conversationDepth: number
  previousPatternTypes: string[]

  // Refinements applied
  refinements?: QueryRefinements

  // Outcome
  outcome: 'success' | 'empty' | 'error' | 'timeout' | 'rate_limited'
  errorType?: string

  // Performance
  embeddingTime?: number
  vectorSearchTime?: number
  llmGenerationTime?: number

  timestamp: Date
}

export interface PatternInteractionEvent {
  patternId: string
  patternType: string
  action: 'expand' | 'collapse' | 'citation_click' | 'visualization_view'
  query: string
  userId?: string
  sessionId?: string
  timestamp: Date
}

export interface SerendipityEvent {
  primaryCategory: string
  targetCategory: string
  query: string
  action: 'shown' | 'explored' | 'dismissed'
  userId?: string
  sessionId?: string
  timestamp: Date
}

export interface EmptyResultsEvent {
  query: string
  sourceCount: number
  hasFilters: boolean
  filters?: QueryRefinements
  suggestedAction: string
  userId?: string
  sessionId?: string
  timestamp: Date
}

export interface RateLimitEvent {
  identifier: string // user:xxx or ip:xxx
  limit: number
  endpoint: 'pattern_discovery' | 'search' | 'autocomplete'
  userId?: string
  timestamp: Date
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

let sessionId: string | null = null

/**
 * Get or create session ID for analytics grouping
 */
export function getOrCreateSessionId(): string {
  if (sessionId) return sessionId

  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('search5_session_id')
    const storedTime = localStorage.getItem('search5_session_time')

    // Expire after 30 minutes of inactivity
    if (stored && storedTime) {
      const age = Date.now() - parseInt(storedTime, 10)
      if (age < 30 * 60 * 1000) {
        sessionId = stored
        localStorage.setItem('search5_session_time', Date.now().toString())
        return sessionId
      }
    }

    // Create new session
    sessionId = `s5-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('search5_session_id', sessionId)
    localStorage.setItem('search5_session_time', Date.now().toString())
  } else {
    // Server-side fallback
    sessionId = `s5-${Date.now()}-server`
  }

  return sessionId
}

// ============================================================================
// TRACKING FUNCTIONS
// ============================================================================

/**
 * Track a pattern discovery query with full metadata
 */
export async function trackPatternDiscovery(event: PatternDiscoveryEvent): Promise<void> {
  try {
    const supabase = createClient()

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Store in analytics table
    await (supabase as any).from('search_analytics').insert({
      event_type: 'pattern_discovery',
      query_text: event.query,
      user_id: user?.id || event.userId,
      session_id: event.sessionId || getOrCreateSessionId(),

      // Results
      result_count: event.sourcesFound,
      patterns_found: event.patternsFound,
      confidence: event.confidence,

      // Performance
      execution_time_ms: event.executionTime,

      // Context
      conversation_depth: event.conversationDepth,

      // Outcome
      outcome: event.outcome,
      error_type: event.errorType,

      // Filters
      filters: event.refinements ? {
        categories: event.refinements.categories,
        dateRange: event.refinements.dateRange,
        maxSources: event.refinements.maxSources,
        confidenceThreshold: event.refinements.confidenceThreshold
      } : null,

      created_at: event.timestamp.toISOString()
    })

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Pattern Discovery Tracked:', {
        query: event.query.substring(0, 50),
        patterns: event.patternsFound,
        sources: event.sourcesFound,
        confidence: event.confidence,
        outcome: event.outcome
      })
    }
  } catch (error) {
    console.error('Failed to track pattern discovery:', error)
    // Don't throw - analytics should never break the app
  }
}

/**
 * Track pattern interaction (expand, collapse, citation click)
 */
export async function trackPatternInteraction(event: PatternInteractionEvent): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await (supabase as any).from('search_analytics').insert({
      event_type: 'pattern_interaction',
      query_text: event.query,
      user_id: user?.id || event.userId,
      session_id: event.sessionId || getOrCreateSessionId(),

      metadata: {
        patternId: event.patternId,
        patternType: event.patternType,
        action: event.action
      },

      created_at: event.timestamp.toISOString()
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Pattern Interaction:', {
        type: event.patternType,
        action: event.action
      })
    }
  } catch (error) {
    console.error('Failed to track pattern interaction:', error)
  }
}

/**
 * Track serendipity detection and exploration
 */
export async function trackSerendipity(event: SerendipityEvent): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await (supabase as any).from('search_analytics').insert({
      event_type: 'serendipity',
      query_text: event.query,
      user_id: user?.id || event.userId,
      session_id: event.sessionId || getOrCreateSessionId(),

      metadata: {
        primaryCategory: event.primaryCategory,
        targetCategory: event.targetCategory,
        action: event.action
      },

      created_at: event.timestamp.toISOString()
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✨ Serendipity Tracked:', {
        from: event.primaryCategory,
        to: event.targetCategory,
        action: event.action
      })
    }
  } catch (error) {
    console.error('Failed to track serendipity:', error)
  }
}

/**
 * Track empty results for query improvement insights
 */
export async function trackEmptyResults(event: EmptyResultsEvent): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await (supabase as any).from('search_analytics').insert({
      event_type: 'empty_results',
      query_text: event.query,
      user_id: user?.id || event.userId,
      session_id: event.sessionId || getOrCreateSessionId(),

      result_count: event.sourceCount,

      metadata: {
        hasFilters: event.hasFilters,
        filters: event.filters,
        suggestedAction: event.suggestedAction
      },

      created_at: event.timestamp.toISOString()
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Empty Results Tracked:', {
        query: event.query.substring(0, 50),
        sources: event.sourceCount
      })
    }
  } catch (error) {
    console.error('Failed to track empty results:', error)
  }
}

/**
 * Track rate limit hits for capacity planning
 */
export async function trackRateLimit(event: RateLimitEvent): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await (supabase as any).from('search_analytics').insert({
      event_type: 'rate_limit_hit',
      user_id: user?.id || event.userId,

      metadata: {
        identifier: event.identifier,
        limit: event.limit,
        endpoint: event.endpoint
      },

      created_at: event.timestamp.toISOString()
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Rate Limit Tracked:', {
        identifier: event.identifier.substring(0, 20),
        endpoint: event.endpoint
      })
    }
  } catch (error) {
    console.error('Failed to track rate limit:', error)
  }
}

// ============================================================================
// CONVENIENCE WRAPPERS
// ============================================================================

/**
 * Track a successful Search 5.0 response
 */
export async function trackSearch5Success(
  query: string,
  response: Search5Response,
  conversationDepth: number,
  refinements?: QueryRefinements
): Promise<void> {
  await trackPatternDiscovery({
    query,
    patternsFound: response.patterns.length,
    sourcesFound: response.sources.length,
    confidence: response.metadata.confidence,
    executionTime: response.metadata.executionTime,
    conversationDepth,
    previousPatternTypes: [],
    refinements,
    outcome: response.patterns.length > 0 ? 'success' : 'empty',
    timestamp: new Date()
  })
}

/**
 * Track a Search 5.0 error
 */
export async function trackSearch5Error(
  query: string,
  errorType: 'timeout' | 'rate_limited' | 'circuit_breaker' | 'llm_error' | 'validation_error' | 'unknown',
  executionTime: number,
  conversationDepth: number = 0
): Promise<void> {
  await trackPatternDiscovery({
    query,
    patternsFound: 0,
    sourcesFound: 0,
    confidence: 0,
    executionTime,
    conversationDepth,
    previousPatternTypes: [],
    outcome: errorType === 'rate_limited' ? 'rate_limited' : errorType === 'timeout' ? 'timeout' : 'error',
    errorType,
    timestamp: new Date()
  })
}

/**
 * Batch track multiple pattern interactions
 */
export async function trackPatternBatch(
  query: string,
  patterns: Pattern[],
  action: 'shown' | 'loaded_more'
): Promise<void> {
  const sessionId = getOrCreateSessionId()

  // Track all patterns as shown
  const promises = patterns.map(pattern =>
    trackPatternInteraction({
      patternId: `${pattern.type}-${pattern.title}`,
      patternType: pattern.type,
      action: action === 'shown' ? 'expand' : 'visualization_view',
      query,
      sessionId,
      timestamp: new Date()
    })
  )

  await Promise.allSettled(promises)
}
