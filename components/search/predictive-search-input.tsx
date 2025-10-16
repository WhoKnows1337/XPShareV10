'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { SearchSuggestionsSkeleton } from './search-results-skeleton'

interface PredictiveSearchInputProps {
  value?: string // Controlled value (takes precedence over initialQuery)
  initialQuery?: string // Initial uncontrolled value
  onSearch: (query: string) => void
  onQueryChange?: (query: string) => void
  placeholder?: string
  showRecentSearches?: boolean
  showTrending?: boolean
  className?: string
}

interface Suggestion {
  id: string
  text: string
  type: 'suggestion' | 'recent' | 'trending'
  category?: string
}

const RECENT_SEARCHES_KEY = 'xpshare_recent_searches'
const MAX_RECENT = 5

/**
 * Predictive Search Input with Command Palette UI
 *
 * Features:
 * - Debounced autocomplete (300ms)
 * - Keyboard navigation (Arrow Up/Down, Enter, Esc)
 * - Recent searches from localStorage
 * - Category grouping (Suggestions, Recent, Trending)
 * - Live suggestions during typing
 * - Command Palette UX pattern
 *
 * @param initialQuery - Initial search query
 * @param onSearch - Callback when search is executed (Enter or click)
 * @param onQueryChange - Callback when query changes (debounced)
 * @param placeholder - Input placeholder text
 * @param showRecentSearches - Show recent searches in dropdown
 * @param showTrending - Show trending searches in dropdown
 */
export function PredictiveSearchInput({
  value: controlledValue,
  initialQuery = '',
  onSearch,
  onQueryChange,
  placeholder = 'Search experiences...',
  showRecentSearches = true,
  showTrending = true,
  className,
}: PredictiveSearchInputProps) {
  // Support both controlled and uncontrolled modes
  const [internalQuery, setInternalQuery] = useState(initialQuery)
  const query = controlledValue !== undefined ? controlledValue : internalQuery

  const setQuery = (newQuery: string) => {
    if (controlledValue === undefined) {
      setInternalQuery(newQuery)
    }
    onQueryChange?.(newQuery)
  }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && showRecentSearches) {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse recent searches:', e)
        }
      }
    }
  }, [showRecentSearches])

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        // For now, mock suggestions
        await new Promise((resolve) => setTimeout(resolve, 200))

        const mockSuggestions: Suggestion[] = [
          {
            id: '1',
            text: `${debouncedQuery} UFO`,
            type: 'suggestion',
            category: 'ufo',
          },
          {
            id: '2',
            text: `${debouncedQuery} paranormal`,
            type: 'suggestion',
            category: 'paranormal',
          },
          {
            id: '3',
            text: `${debouncedQuery} experiences`,
            type: 'suggestion',
          },
        ]

        setSuggestions(mockSuggestions)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
    onQueryChange?.(debouncedQuery)
  }, [debouncedQuery, onQueryChange])

  // Fetch trending searches on mount
  useEffect(() => {
    if (showTrending) {
      // TODO: Replace with actual API call
      setTrendingSearches(['UFO orange lights', 'Bodensee sighting', 'Ayahuasca ceremony'])
    }
  }, [showTrending])

  // Build all suggestions (recent + trending + autocomplete)
  const allSuggestions: Suggestion[] = [
    ...recentSearches.slice(0, MAX_RECENT).map((text, i) => ({
      id: `recent-${i}`,
      text,
      type: 'recent' as const,
    })),
    ...trendingSearches.slice(0, 3).map((text, i) => ({
      id: `trending-${i}`,
      text,
      type: 'trending' as const,
    })),
    ...suggestions,
  ]

  // Filter to show relevant suggestions
  const displaySuggestions = query.trim().length >= 2 ? suggestions : allSuggestions

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < displaySuggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && displaySuggestions[selectedIndex]) {
            handleSelectSuggestion(displaySuggestions[selectedIndex].text)
          } else if (query.trim()) {
            handleSearch()
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowDropdown(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDropdown, selectedIndex, displaySuggestions, query])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveToRecent = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT)

    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }, [recentSearches])

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      saveToRecent(query.trim())
      onSearch(query.trim())
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }, [query, onSearch, saveToRecent])

  const handleSelectSuggestion = useCallback((text: string) => {
    setQuery(text)
    saveToRecent(text)
    onSearch(text)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }, [onSearch, saveToRecent])

  const clearQuery = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSearch()
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (query.trim().length >= 2 || allSuggestions.length > 0) && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-observatory-lg overflow-hidden"
          role="listbox"
        >
          {isLoading ? (
            <SearchSuggestionsSkeleton count={3} />
          ) : displaySuggestions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {/* Group by type */}
              {query.trim().length < 2 && recentSearches.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                    Recent Searches
                  </div>
                  {displaySuggestions
                    .filter((s) => s.type === 'recent')
                    .map((suggestion, index) => (
                      <SuggestionItem
                        key={suggestion.id}
                        suggestion={suggestion}
                        isSelected={selectedIndex === index}
                        onClick={() => handleSelectSuggestion(suggestion.text)}
                        icon={getSuggestionIcon(suggestion.type)}
                      />
                    ))}
                </>
              )}

              {query.trim().length < 2 && trendingSearches.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                    Trending
                  </div>
                  {displaySuggestions
                    .filter((s) => s.type === 'trending')
                    .map((suggestion, index) => (
                      <SuggestionItem
                        key={suggestion.id}
                        suggestion={suggestion}
                        isSelected={selectedIndex === index}
                        onClick={() => handleSelectSuggestion(suggestion.text)}
                        icon={getSuggestionIcon(suggestion.type)}
                      />
                    ))}
                </>
              )}

              {query.trim().length >= 2 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={suggestion.id}
                      suggestion={suggestion}
                      isSelected={selectedIndex === index}
                      onClick={() => handleSelectSuggestion(suggestion.text)}
                      icon={getSuggestionIcon(suggestion.type)}
                    />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface SuggestionItemProps {
  suggestion: Suggestion
  isSelected: boolean
  onClick: () => void
  icon: React.ReactNode
}

function SuggestionItem({ suggestion, isSelected, onClick, icon }: SuggestionItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
        isSelected && 'bg-muted'
      )}
      role="option"
      aria-selected={isSelected}
    >
      {icon}
      <span className="flex-1 text-sm text-foreground">{suggestion.text}</span>
      {suggestion.category && (
        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
          {suggestion.category}
        </span>
      )}
    </button>
  )
}
