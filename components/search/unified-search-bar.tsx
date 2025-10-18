'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectQueryIntent, getIntentIcon, getIntentColorClass, getIntentFeedback } from '@/lib/search/intent-detection'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface UnifiedSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  isLoading?: boolean
  askMode?: boolean
  onAskModeToggle?: () => void
  placeholder?: string
}

interface Suggestion {
  text: string
  source: 'ai' | 'popular'
  score: number
}

export function UnifiedSearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  askMode = false,
  onAskModeToggle,
  placeholder,
}: UnifiedSearchBarProps) {
  const t = useTranslations('search')
  const [intent, setIntent] = useState<any>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect intent + fetch autocomplete suggestions while typing (debounced)
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.length > 0) {
      setIsTyping(true)

      typingTimeoutRef.current = setTimeout(async () => {
        // Run intent detection + autocomplete fetch in parallel
        const [detectedIntent, autocompleteSuggestions] = await Promise.all([
          detectQueryIntent(value),
          value.length >= 2 ? fetchAutocomplete(value) : Promise.resolve([])
        ])

        setIntent(detectedIntent)
        setFeedback(getIntentFeedback(detectedIntent, value))
        setSuggestions(autocompleteSuggestions)
        setShowSuggestions(autocompleteSuggestions.length > 0 && value.length >= 2)
        setIsTyping(false)
      }, 300) // 300ms debounce
    } else {
      setIntent(null)
      setFeedback('')
      setSuggestions([])
      setShowSuggestions(false)
      setIsTyping(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [value])

  // Fetch autocomplete suggestions
  const fetchAutocomplete = async (query: string): Promise<Suggestion[]> => {
    if (query.length < 2) return []

    setIsLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`)

      if (!res.ok) throw new Error('Autocomplete failed')

      const data = await res.json()
      return data.suggestions || []
    } catch (error) {
      console.error('Autocomplete error:', error)
      return []
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Select suggestion handler
  const handleSelectSuggestion = useCallback((suggestionText: string) => {
    onChange(suggestionText)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    // Auto-search after selection
    onSearch(suggestionText)
  }, [onChange, onSearch])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If suggestions are shown, handle navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedSuggestionIndex >= 0) {
            handleSelectSuggestion(suggestions[selectedSuggestionIndex].text)
          } else if (value.trim()) {
            onSearch(value)
            setShowSuggestions(false)
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
          break
      }
    } else {
      // No suggestions shown, just handle Enter
      if (e.key === 'Enter' && value.trim()) {
        onSearch(value)
      }
    }
  }

  // Get dynamic border color based on intent
  const borderColor = intent ? getIntentColorClass(intent) : 'border-gray-300'

  // Get icon based on mode and intent
  const getSearchIcon = () => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    if (askMode) return <MessageSquare className="h-5 w-5 text-green-600" />
    if (isTyping) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    if (intent) return <span className="text-lg">{getIntentIcon(intent)}</span>
    return <Search className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className="w-full space-y-3">
      {/* Main Search Bar */}
      <div className="relative">
        <div className={cn(
          "flex items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all duration-300",
          askMode ? "border-green-500 bg-card" : "border-border bg-card",
          intent?.isNaturalLanguage && !askMode && "border-purple-500",
          intent?.isKeyword && !askMode && "border-blue-500",
          "focus-within:ring-2 focus-within:ring-offset-2",
          askMode ? "focus-within:ring-green-500" : intent?.isNaturalLanguage ? "focus-within:ring-purple-500" : "focus-within:ring-blue-500"
        )}>
          {/* Left Icon with Animation */}
          <motion.div
            key={`icon-${isLoading ? 'loading' : askMode ? 'ask' : intent?.isNaturalLanguage ? 'nlp' : 'search'}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getSearchIcon()}
          </motion.div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              (askMode
                ? t('askPlaceholder')
                : t('placeholder'))
            }
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            disabled={isLoading}
          />

          {/* Right Side: Intent Badges + Ask Toggle */}
          <div className="flex items-center gap-2">
            {/* Detected Concepts Badge */}
            <AnimatePresence mode="wait">
              {intent?.detectedConcepts && intent.detectedConcepts.length > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    {intent.detectedConcepts[0]}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ask Mode Toggle Button - Only Icon */}
            {onAskModeToggle && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  size="icon"
                  variant={askMode ? 'default' : 'ghost'}
                  onClick={onAskModeToggle}
                  className={cn(
                    "transition-all duration-300",
                    askMode && "bg-green-600 hover:bg-green-700"
                  )}
                  title={askMode ? t('switchToSearch') : t('switchToAsk')}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Search Button */}
            {!isLoading && value.trim() && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSearch(value)}
                  className="transition-all"
                >
                  {askMode ? (
                    <>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {t('askButton')}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      {t('searchButton')}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        <ErrorBoundary
          fallback={
            <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-md border bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>{t('suggestions.unavailable')}</span>
              </div>
            </div>
          }
        >
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-md border bg-popover shadow-lg"
              >
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.text}-${index}`}
                      onClick={() => handleSelectSuggestion(suggestion.text)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-colors overflow-hidden',
                        'hover:bg-accent hover:text-accent-foreground',
                        selectedSuggestionIndex === index && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {suggestion.source === 'ai' ? (
                        <Sparkles className="h-4 w-4 flex-shrink-0 text-purple-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-500" />
                      )}
                      <span className="flex-1 min-w-0 truncate font-medium">{suggestion.text}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {suggestion.source === 'ai' ? t('suggestions.ai') : t('suggestions.popular')}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ErrorBoundary>

        {/* Subtle Hint Text Below */}
        <AnimatePresence mode="wait">
          {!askMode && value.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="mt-2 px-1"
            >
              <p className="text-xs text-muted-foreground">
                {t('hints')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Intent Feedback (appears while typing) */}
      <AnimatePresence mode="wait">
        {feedback && !isLoading && value.trim().length > 0 && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-muted border",
              askMode && "border-green-500/50 text-green-700 dark:text-green-400",
              intent?.isNaturalLanguage && !askMode && "border-purple-500/50 text-purple-700 dark:text-purple-400",
              intent?.isKeyword && !askMode && "border-blue-500/50 text-blue-700 dark:text-blue-400",
              !intent?.isNaturalLanguage && !intent?.isKeyword && !askMode && "border-border"
            )}>
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <p className="flex-1">{feedback}</p>
              {intent?.confidence && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(intent.confidence * 100)}% {t('confidence')}
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
