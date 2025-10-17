'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, TrendingUp, Hash, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'

interface SearchSuggestion {
  id: string
  type: 'query' | 'category' | 'location' | 'tag' | 'recent' | 'trending'
  text: string
  metadata?: {
    count?: number
    category?: string
    icon?: string
  }
}

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const suggestionIcons = {
  query: Search,
  category: Hash,
  location: MapPin,
  tag: Hash,
  recent: Clock,
  trending: TrendingUp,
}

const suggestionColors = {
  query: 'text-foreground',
  category: 'text-blue-600',
  location: 'text-green-600',
  tag: 'text-purple-600',
  recent: 'text-gray-500',
  trending: 'text-orange-600',
}

/**
 * SearchAutocomplete - Real-time search suggestions component
 *
 * Features:
 * - Debounced API calls (300ms) to reduce server load
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - ARIA live regions for screen reader announcements
 * - Grouped suggestions by type
 * - Recent searches integration
 * - Trending queries
 * - Keyword highlighting
 */
export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search experiences...',
  className,
  disabled = false,
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [announcementText, setAnnouncementText] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions from API
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(\`/api/search/autocomplete?q=\${encodeURIComponent(query)}\`)

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setShowDropdown(data.suggestions?.length > 0)

      // Announce to screen readers
      setAnnouncementText(
        data.suggestions?.length > 0
          ? \`\${data.suggestions.length} suggestions found\`
          : 'No suggestions found'
      )
    } catch (error) {
      console.error('Autocomplete error:', error)
      setSuggestions([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced fetch with 300ms delay
  const debouncedFetch = useDebouncedCallback(fetchSuggestions, 300)

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
    debouncedFetch(newValue)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    onSelect(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [onChange, onSelect])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowDropdown(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        \`[data-suggestion-index="\${selectedIndex}"]\`
      )
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(\`(\${query})\`, 'gi')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-900/40 text-foreground font-semibold"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 pr-10 rounded-lg border border-input bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200'
          )}
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showDropdown}
          aria-activedescendant={
            selectedIndex >= 0 ? \`suggestion-\${selectedIndex}\` : undefined
          }
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-2 py-2',
              'bg-popover border border-border rounded-lg shadow-lg',
              'max-h-[400px] overflow-y-auto'
            )}
          >
            {suggestions.map((suggestion, index) => {
              const Icon = suggestionIcons[suggestion.type]
              const colorClass = suggestionColors[suggestion.type]

              return (
                <motion.button
                  key={suggestion.id}
                  id={\`suggestion-\${index}\`}
                  data-suggestion-index={index}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={cn(
                    'w-full px-4 py-2.5 flex items-center gap-3',
                    'hover:bg-accent transition-colors text-left',
                    selectedIndex === index && 'bg-accent'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', colorClass)} />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">
                      {highlightMatch(suggestion.text, value)}
                    </div>
                    {suggestion.metadata?.category && (
                      <div className="text-xs text-muted-foreground">
                        in {suggestion.metadata.category}
                      </div>
                    )}
                  </div>

                  {suggestion.metadata?.count !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.metadata.count}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcementText}
      </div>
    </div>
  )
}
