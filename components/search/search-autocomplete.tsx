'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  text: string
  source: 'ai' | 'popular'
  score: number
}

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  minChars?: number
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Suche Experiences...',
  className,
  debounceMs = 300,
  minChars = 2
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasFocus, setHasFocus] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < minChars) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/search/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 8 })
      })

      const data = await res.json()

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
        setShowDropdown(data.suggestions.length > 0 && hasFocus)
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [minChars, hasFocus])

  // Debounced fetch
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (value.trim().length >= minChars && hasFocus) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value)
      }, debounceMs)
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [value, fetchSuggestions, debounceMs, minChars, hasFocus])

  // Click outside handler
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

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: string) => {
    onChange(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)

    if (onSearch) {
      onSearch(suggestion)
    }
  }, [onChange, onSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && onSearch && value.trim()) {
        e.preventDefault()
        onSearch(value)
        setShowDropdown(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex].text)
        } else if (onSearch && value.trim()) {
          onSearch(value)
          setShowDropdown(false)
        }
        break

      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setHasFocus(true)
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setHasFocus(false), 200)
          }}
          className={cn('pl-10 pr-10', className)}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-md border bg-popover shadow-lg"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.text}-${index}`}
                onClick={() => selectSuggestion(suggestion.text)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedIndex === index && 'bg-accent text-accent-foreground'
                )}
              >
                {suggestion.source === 'ai' ? (
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-purple-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-500" />
                )}
                <span className="flex-1 truncate">{suggestion.text}</span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.source === 'ai' ? 'AI' : 'Popular'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
