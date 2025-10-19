'use client'

/**
 * Search 5.0 - Conversation Context Provider
 *
 * Manages multi-turn conversation state with:
 * - Conversation history (last 3 turns)
 * - localStorage persistence
 * - Pattern accumulation across turns
 * - Context extraction for API calls
 *
 * @see docs/masterdocs/search5.md (Part 4.2 - Multi-Turn Conversation)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ConversationTurn, Pattern, Search5Response, QueryRefinements } from '@/types/search5'
import { parseConversationHistory } from '@/lib/validation/search5-schemas'

// ============================================================================
// TYPES
// ============================================================================

interface ConversationContextValue {
  /**
   * Current conversation history (max 3 turns)
   */
  history: ConversationTurn[]

  /**
   * All patterns found in current conversation
   */
  allPatterns: Pattern[]

  /**
   * Add a new turn to conversation history
   */
  addTurn: (query: string, response: Search5Response, refinements?: QueryRefinements) => void

  /**
   * Clear entire conversation history
   */
  clearHistory: () => void

  /**
   * Get patterns from previous turns (for context)
   */
  getPreviousPatterns: () => Pattern[]

  /**
   * Get conversation context for API calls
   * Returns array of {query, patterns} for last 3 turns
   */
  getConversationContext: () => Array<{ query: string; patterns: Pattern[] }>

  /**
   * Check if there's an active conversation
   */
  hasHistory: boolean

  /**
   * Get conversation depth (number of turns)
   */
  depth: number
}

// ============================================================================
// CONTEXT
// ============================================================================

const ConversationContext = createContext<ConversationContextValue | undefined>(undefined)

const STORAGE_KEY = 'xpshare_conversation_history'
const MAX_TURNS = 3  // Keep last 3 turns for context

// ============================================================================
// PROVIDER
// ============================================================================

interface ConversationProviderProps {
  children: ReactNode
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [history, setHistory] = useState<ConversationTurn[]>([])
  const [allPatterns, setAllPatterns] = useState<Pattern[]>([])

  // Load conversation history from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const validated = parseConversationHistory(parsed)

        // Type assertion: Zod schema structurally compatible with ConversationTurn
        setHistory(validated as ConversationTurn[])

        // Extract all patterns from history
        const patterns = validated.flatMap(turn => turn.response.patterns || [])
        setAllPatterns(patterns)

        console.log('📚 Conversation history restored:', {
          turns: validated.length,
          patterns: patterns.length
        })
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save conversation history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (history.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save conversation history:', error)
    }
  }, [history])

  /**
   * Add a new turn to conversation history
   */
  const addTurn = useCallback((
    query: string,
    response: Search5Response,
    refinements?: QueryRefinements
  ) => {
    const newTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      query,
      response,
      refinements
    }

    setHistory(prev => {
      // Add new turn and keep only last MAX_TURNS
      const updated = [...prev, newTurn].slice(-MAX_TURNS)
      return updated
    })

    // Update accumulated patterns
    setAllPatterns(prev => [...prev, ...(response.patterns || [])])

    console.log('💬 Turn added to conversation:', {
      query: query.substring(0, 50),
      patterns: response.patterns?.length || 0,
      depth: history.length + 1
    })
  }, [history.length])

  /**
   * Clear entire conversation history
   */
  const clearHistory = useCallback(() => {
    setHistory([])
    setAllPatterns([])

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }

    console.log('🗑️ Conversation history cleared')
  }, [])

  /**
   * Get patterns from previous turns (excludes current/last turn)
   */
  const getPreviousPatterns = useCallback((): Pattern[] => {
    if (history.length <= 1) return []

    // Get all turns except the last one
    return history.slice(0, -1).flatMap(turn => turn.response.patterns || [])
  }, [history])

  /**
   * Get conversation context for API calls
   * Returns format expected by buildConversationalPrompt()
   */
  const getConversationContext = useCallback((): Array<{ query: string; patterns: Pattern[] }> => {
    return history.map(turn => ({
      query: turn.query,
      patterns: turn.response.patterns || []
    }))
  }, [history])

  const value: ConversationContextValue = {
    history,
    allPatterns,
    addTurn,
    clearHistory,
    getPreviousPatterns,
    getConversationContext,
    hasHistory: history.length > 0,
    depth: history.length
  }

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access conversation context
 *
 * @example
 * const { addTurn, getConversationContext, clearHistory } = useConversation()
 *
 * // Add a turn after API response
 * addTurn(query, response, refinements)
 *
 * // Get context for next API call
 * const context = getConversationContext()
 *
 * // Clear conversation when starting new topic
 * clearHistory()
 */
export function useConversation(): ConversationContextValue {
  const context = useContext(ConversationContext)

  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider')
  }

  return context
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get conversation statistics
 */
export function useConversationStats() {
  const { history, allPatterns, depth } = useConversation()

  return {
    turnCount: depth,
    totalPatterns: allPatterns.length,
    totalSources: history.reduce((sum, turn) => sum + (turn.response.sources?.length || 0), 0),
    avgConfidence: history.length > 0
      ? Math.round(
          history.reduce((sum, turn) => sum + (turn.response.metadata.confidence || 0), 0) / history.length
        )
      : 0,
    exploredCategories: [...new Set(
      history.flatMap(turn => turn.response.sources?.map(s => s.category) || [])
    )],
    patternTypes: [...new Set(allPatterns.map(p => p.type))]
  }
}

/**
 * Hook to check if user is refining or pivoting
 * Used to provide contextual UI feedback
 */
export function useConversationIntent() {
  const { history } = useConversation()

  if (history.length < 2) {
    return { type: 'initial' as const }
  }

  const lastTurn = history[history.length - 1]
  const previousTurn = history[history.length - 2]

  // Check for refinement signals
  const isRefining = lastTurn.query.toLowerCase().includes(previousTurn.query.toLowerCase().split(' ')[0])
  const isPivoting = !isRefining

  return {
    type: isRefining ? ('refining' as const) : ('pivoting' as const),
    previousQuery: previousTurn.query,
    currentQuery: lastTurn.query
  }
}
