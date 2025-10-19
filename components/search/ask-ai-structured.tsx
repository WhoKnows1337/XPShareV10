'use client'

/**
 * Search 5.0 - Main Component
 *
 * Complete integration of all Search 5.0 components:
 * - Smart search input with debouncing
 * - Pattern discovery API integration
 * - Multi-turn conversation support
 * - Progressive disclosure
 * - Serendipity detection
 * - Query refinement
 * - Loading states
 *
 * @see docs/masterdocs/search5.md
 */

import React, { useState, useCallback } from 'react'
import { useConversation } from './conversation-context'
import { SmartSearchInput } from './smart-search-input'
import { QueryRefinementPanel } from './query-refinement-panel'
import { ConversationHistory } from './conversation-history'
import { ResearchQualityCard } from './research-quality-card'
import { LowConfidenceWarning } from './low-confidence-warning'
import { EmptyResultsState } from './empty-results-state'
import { ProgressivePatternGrid } from './progressive-pattern-grid'
import { SerendipityCard } from './serendipity-card'
import { SourcesSection } from './sources-section'
import { FollowUpQuestions } from './follow-up-questions'
import { QuickFilterChips, generateQuickFilters, QuickFilter } from './quick-filter-chips'
import { Search5LoadingSkeleton } from './loading-skeletons'
import { Search5Response, QueryRefinements } from '@/types/search5'
import { addToSearchHistory } from '@/lib/utils/search-history'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { trackSearch5Success, trackSearch5Error, trackEmptyResults } from '@/lib/analytics/search5-tracking'

// ============================================================================
// TYPES
// ============================================================================

interface AskAIStructuredProps {
  /**
   * Optional initial query to start with
   */
  initialQuery?: string

  /**
   * Optional initial refinements
   */
  initialRefinements?: QueryRefinements

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AskAIStructured({
  initialQuery,
  initialRefinements,
  className
}: AskAIStructuredProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<Search5Response | null>(null)
  const [lastQuery, setLastQuery] = useState<string>('')
  const [refinements, setRefinements] = useState<QueryRefinements>(
    initialRefinements || {
      confidenceThreshold: 0,
      maxSources: 15
    }
  )
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [warningDismissed, setWarningDismissed] = useState(false)

  // 🚫 P0 FEATURE: Request Deduplication with AbortController
  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Conversation context
  const { addTurn, getConversationContext, clearHistory } = useConversation()

  // ============================================================================
  // API CALL
  // ============================================================================

  /**
   * Execute pattern discovery search
   */
  const executeSearch = useCallback(async (query: string) => {
    // Store query for empty state
    setLastQuery(query)

    // 🚫 P0 FEATURE: Abort any in-flight requests
    if (abortControllerRef.current) {
      console.log('🚫 Aborting previous request')
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setIsLoading(true)
    setError(null)

    // Get conversation context for multi-turn support (outside try block for error handler access)
    const conversationContext = getConversationContext()

    try {

      // Build messages array for AI SDK format
      const messages: Array<{ role: string; content: string }> = []

      // Add conversation history
      conversationContext.forEach(turn => {
        messages.push({
          role: 'user',
          content: turn.query
        })
        messages.push({
          role: 'assistant',
          content: JSON.stringify({
            patterns: turn.patterns
          })
        })
      })

      // Add current query
      messages.push({
        role: 'user',
        content: query
      })

      // API request with AbortController
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          maxSources: refinements.maxSources || 15,
          category: refinements.categories?.[0], // Use first category if multiple
          dateFrom: refinements.dateRange?.from,
          dateTo: refinements.dateRange?.to,
        }),
        signal // Add AbortController signal
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data: Search5Response = await res.json()

      // Validate response structure
      if (!data.metadata || !data.patterns || !data.sources) {
        throw new Error('Invalid response structure from API')
      }

      // Update state
      setResponse(data)

      // Generate quick filters from response
      const filters = generateQuickFilters(data.patterns, data.sources)
      setQuickFilters(filters)
      setActiveFilters([]) // Reset filters
      setWarningDismissed(false) // Reset warning for new search

      // Add to conversation history
      addTurn(query, data, refinements)

      // Add to search history (localStorage)
      // Note: Search history filters only support language/category/vectorWeight/crossLingual
      addToSearchHistory(
        query,
        'ask',
        undefined, // No filters for ask mode
        data.metadata.sourceCount
      )

      // 📊 Analytics: Track successful search
      trackSearch5Success(
        query,
        data,
        conversationContext.length,
        refinements
      ).catch(err => console.warn('Analytics tracking failed:', err))

      // 📊 Analytics: Track empty results if applicable
      if (data.patterns.length === 0) {
        trackEmptyResults({
          query,
          sourceCount: data.sources.length,
          hasFilters: !!(refinements.categories || refinements.dateRange),
          filters: refinements,
          suggestedAction: data.sources.length === 0 ? 'broaden_query' : 'rephrase_question',
          timestamp: new Date()
        }).catch(err => console.warn('Analytics tracking failed:', err))
      }

      console.log('✅ Search 5.0 complete:', {
        patterns: data.patterns.length,
        sources: data.sources.length,
        confidence: data.metadata.confidence,
        executionTime: data.metadata.executionTime
      })

    } catch (err: any) {
      // Ignore aborted requests (intentional cancellation)
      if (err.name === 'AbortError') {
        console.log('🚫 Request aborted (user started new search)')
        return
      }

      console.error('Search error:', err)
      setError(err.message || 'An unexpected error occurred')

      // 📊 Analytics: Track error
      const errorType = err.message?.includes('timeout') ? 'timeout' :
                        err.message?.includes('Rate limit') ? 'rate_limited' :
                        err.message?.includes('Circuit breaker') ? 'circuit_breaker' :
                        err.message?.includes('Invalid JSON') ? 'validation_error' :
                        'unknown'

      trackSearch5Error(
        query,
        errorType,
        Date.now() - Date.now(), // We don't have exact timing here
        conversationContext.length
      ).catch(err => console.warn('Analytics tracking failed:', err))
    } finally {
      setIsLoading(false)
    }
  }, [refinements, addTurn, getConversationContext])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((query: string) => {
    executeSearch(query)
  }, [executeSearch])

  const handleRefinementsChange = useCallback((newRefinements: QueryRefinements) => {
    setRefinements(newRefinements)
  }, [])

  const handleRefinementsApply = useCallback(() => {
    // Re-run search with new refinements if we have a previous response
    if (response) {
      // TODO: Could optionally re-run search or just filter client-side
      console.log('Refinements applied:', refinements)
    }
  }, [response, refinements])

  const handleFollowUpClick = useCallback((question: string) => {
    executeSearch(question)
  }, [executeSearch])

  const handleSerendipityExplore = useCallback((targetCategory: string) => {
    // Auto-generate follow-up query
    const query = `Zeige mir ${targetCategory}-Erfahrungen mit ähnlichen Mustern`
    executeSearch(query)
  }, [executeSearch])

  const handleCitationClick = useCallback((sourceId: string) => {
    // Scroll to source in sources section or open in new tab
    const element = document.getElementById(`source-${sourceId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      window.open(`/experiences/${sourceId}`, '_blank')
    }
  }, [])

  const handleQuickFilterToggle = useCallback((filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setActiveFilters([])
  }, [])

  const handleWarningDismiss = useCallback(() => {
    setWarningDismissed(true)
  }, [])

  const handleRefineQuery = useCallback(() => {
    // Scroll to search input and focus it
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Focus will be handled by the SmartSearchInput component
  }, [])

  const handleClearRefinementFilters = useCallback(() => {
    setRefinements({
      confidenceThreshold: 0,
      maxSources: 15
    })
  }, [])

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  // Apply quick filters to patterns
  const filteredPatterns = React.useMemo(() => {
    if (!response || activeFilters.length === 0) {
      return response?.patterns || []
    }

    let filtered = response.patterns

    // Filter by pattern type
    const patternTypeFilters = activeFilters
      .filter(id => id.startsWith('pattern-type-'))
      .map(id => id.replace('pattern-type-', ''))

    if (patternTypeFilters.length > 0) {
      filtered = filtered.filter(p => patternTypeFilters.includes(p.type))
    }

    // Filter by confidence level
    const hasHighConfidence = activeFilters.includes('confidence-high')
    const hasGoodConfidence = activeFilters.includes('confidence-good')
    const hasModerateConfidence = activeFilters.includes('confidence-moderate')

    if (hasHighConfidence || hasGoodConfidence || hasModerateConfidence) {
      filtered = filtered.filter(p => {
        const conf = p.confidence || 0
        if (hasHighConfidence && conf >= 80 && conf < 100) return true
        if (hasGoodConfidence && conf >= 60 && conf < 80) return true
        if (hasModerateConfidence && conf >= 40 && conf < 60) return true
        return false
      })
    }

    return filtered
  }, [response, activeFilters])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6', className)}>
      {/* Header: Search + Controls */}
      <div className="space-y-3 md:space-y-4">
        {/* Search Input */}
        <SmartSearchInput
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Frage nach Mustern in außergewöhnlichen Erfahrungen..."
        />

        {/* Controls: Refinement + History */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <QueryRefinementPanel
            refinements={refinements}
            onRefinementsChange={handleRefinementsChange}
            onApply={handleRefinementsApply}
          />

          <ConversationHistory
            onSelectTurn={(turn) => setResponse(turn.response)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <Search5LoadingSkeleton />}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 md:p-6 text-center">
          <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-destructive mx-auto mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold text-destructive mb-1 md:mb-2">
            Fehler bei der Suche
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs md:text-sm text-primary hover:underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Results */}
      {response && !isLoading && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
          {/* Quality Card */}
          <ResearchQualityCard
            metadata={response.metadata}
            detailed
          />

          {/* Low Confidence Warning */}
          {!warningDismissed && (
            <LowConfidenceWarning
              confidence={response.metadata.confidence}
              sourceCount={response.metadata.sourceCount}
              patternsFound={response.metadata.patternsFound}
              onRefineQuery={handleRefineQuery}
              onDismiss={handleWarningDismiss}
            />
          )}

          {/* Quick Filters */}
          {quickFilters.length > 0 && (
            <QuickFilterChips
              filters={quickFilters}
              activeFilters={activeFilters}
              onToggleFilter={handleQuickFilterToggle}
              onClearAll={handleClearAllFilters}
              showCounts
            />
          )}

          {/* Serendipity Card */}
          {response.serendipity && (
            <SerendipityCard
              serendipity={response.serendipity}
              primaryCategory={response.sources[0]?.category}
              onExplore={handleSerendipityExplore}
            />
          )}

          {/* Pattern Grid or Empty State */}
          {response.patterns.length === 0 ? (
            // No patterns from API - show comprehensive empty state
            <EmptyResultsState
              query={lastQuery}
              sourceCount={response.sources.length}
              activeFilters={{
                category: refinements.categories?.[0],
                dateRange: refinements.dateRange
              }}
              onRetryWithSuggestion={handleSearch}
              onClearFilters={handleClearRefinementFilters}
            />
          ) : filteredPatterns.length > 0 ? (
            // Patterns visible after filters
            <ProgressivePatternGrid
              patterns={filteredPatterns}
              sources={response.sources}
              initialLimit={4}
              loadMoreIncrement={2}
              showControls
              onCitationClick={handleCitationClick}
            />
          ) : (
            // Patterns exist but hidden by quick filters
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                Keine Patterns entsprechen den aktiven Filtern.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="text-sm text-primary hover:underline mt-2"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}

          {/* Sources Section */}
          <SourcesSection
            sources={response.sources}
            initialLimit={5}
            showControls
          />

          {/* Follow-Up Questions */}
          <FollowUpQuestions
            patterns={response.patterns}
            primaryCategory={response.sources[0]?.category}
            onQuestionClick={handleFollowUpClick}
            maxSuggestions={4}
          />
        </div>
      )}

      {/* Empty State */}
      {!response && !isLoading && !error && (
        <div className="text-center py-12 md:py-20 space-y-3 md:space-y-4">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🔍</div>
          <h3 className="text-xl md:text-2xl font-bold px-4">
            Entdecke Muster in außergewöhnlichen Erfahrungen
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Stelle eine Frage über UFO-Sichtungen, Nahtoderfahrungen, luzide Träume
            oder andere außergewöhnliche Phänomene. Unser AI-System analysiert Tausende
            von Berichten und entdeckt überraschende Muster.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-3 md:pt-4 px-4">
            {[
              'Welche Formen werden bei UFO-Sichtungen am häufigsten beschrieben?',
              'Gibt es zeitliche Muster bei Nahtoderfahrungen?',
              'Welche gemeinsamen Elemente gibt es in luziden Träumen?',
              'Wo treten die meisten paranormalen Ereignisse auf?'
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => handleSearch(q)}
                className="text-xs px-4 py-2 border rounded-full hover:bg-accent transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
