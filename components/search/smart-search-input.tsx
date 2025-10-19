'use client'

/**
 * Search 5.0 - Smart Search Input
 *
 * Features:
 * - Debounced input (500ms delay)
 * - Autocomplete suggestions from popular queries
 * - Request deduplication
 * - Loading states
 * - Typo correction hints
 * - Cost control (prevents API spam)
 *
 * @see docs/masterdocs/search5.md (Part 3.1 - Cost Control)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, TrendingUp, Clock, X } from 'lucide-react'
import { getAutocompleteSuggestions, getPopularQueries } from '@/lib/utils/search-history'
import { useConversation } from './conversation-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface SmartSearchInputProps {
  /**
   * Callback when user submits search
   */
  onSearch: (query: string) => void

  /**
   * Current loading state
   */
  isLoading?: boolean

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Debounce delay in ms (default: 500)
   */
  debounceDelay?: number

  /**
   * Enable autocomplete suggestions
   */
  enableAutocomplete?: boolean

  /**
   * Minimum characters for autocomplete (default: 3)
   */
  minCharsForAutocomplete?: number

  /**
   * Additional className
   */
  className?: string
}

interface Suggestion {
  query: string
  type: 'popular' | 'recent' | 'autocomplete'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SmartSearchInput({
  onSearch,
  isLoading = false,
  placeholder = 'Frage nach Mustern in Erfahrungen...',
  debounceDelay = 500,
  enableAutocomplete = true,
  minCharsForAutocomplete = 3,
  className
}: SmartSearchInputProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const { hasHistory } = useConversation()

  // ============================================================================
  // DEBOUNCING
  // ============================================================================

  /**
   * Debounce query input to prevent API spam
   */
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceDelay)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, debounceDelay])

  // ============================================================================
  // AUTOCOMPLETE SUGGESTIONS
  // ============================================================================

  /**
   * Update suggestions when debounced query changes
   */
  useEffect(() => {
    if (!enableAutocomplete) return

    if (debouncedQuery.length < minCharsForAutocomplete) {
      // Show popular queries when input is empty
      if (debouncedQuery.length === 0) {
        const popular = getPopularQueries(5)
        setSuggestions(popular.map(q => ({ query: q, type: 'popular' as const })))
      } else {
        setSuggestions([])
      }
      return
    }

    // Get autocomplete suggestions
    const matches = getAutocompleteSuggestions(debouncedQuery, 5)
    setSuggestions(matches.map(q => ({ query: q, type: 'autocomplete' as const })))
  }, [debouncedQuery, enableAutocomplete, minCharsForAutocomplete])

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  /**
   * Handle keyboard navigation in suggestions
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e as any)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex])
        } else {
          handleSubmit(e as any)
        }
        break

      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }, [showSuggestions, suggestions, selectedIndex])

  // ============================================================================
  // CLICK OUTSIDE HANDLER
  // ============================================================================

  /**
   * Close suggestions when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  /**
   * Handle input focus
   */
  const handleFocus = () => {
    setShowSuggestions(true)
  }

  /**
   * Select a suggestion
   */
  const selectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.query)
    setShowSuggestions(false)
    setSelectedIndex(-1)

    // Auto-submit after selection
    setTimeout(() => {
      onSearch(suggestion.query)
      setLastSubmittedQuery(suggestion.query)
    }, 100)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedQuery = query.trim()

    // Validation
    if (!trimmedQuery) return
    if (trimmedQuery.length < 5) {
      // TODO: Show error toast
      console.warn('Query too short (min 5 characters)')
      return
    }

    // Request deduplication - prevent duplicate submissions
    if (trimmedQuery === lastSubmittedQuery) {
      console.log('🚫 Duplicate query prevented:', trimmedQuery)
      return
    }

    setShowSuggestions(false)
    setLastSubmittedQuery(trimmedQuery)
    onSearch(trimmedQuery)
  }

  /**
   * Clear input
   */
  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="pl-12 pr-24 h-12 text-base"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear Button */}
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-16 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Submit/Loading Button */}
          <Button
            type="submit"
            disabled={isLoading || !query.trim() || query.trim().length < 5}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="hidden sm:inline">Analysiere...</span>
              </>
            ) : (
              <span>Suchen</span>
            )}
          </Button>
        </div>

        {/* Conversation Context Indicator */}
        {hasHistory && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Konversation läuft – deine Frage wird im Kontext analysiert</span>
          </div>
        )}
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden"
        >
          {/* Suggestions Header */}
          {query.length < minCharsForAutocomplete && (
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Beliebte Suchanfragen
            </div>
          )}

          {/* Suggestions List */}
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.query}`}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-accent transition-colors',
                  'flex items-center gap-3',
                  selectedIndex === index && 'bg-accent'
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {suggestion.type === 'popular' ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : suggestion.type === 'recent' ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Query Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    {highlightMatch(suggestion.query, query)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Highlight matching portion of suggestion
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 3) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <span className="font-semibold text-foreground">{match}</span>
      {after}
    </>
  )
}
