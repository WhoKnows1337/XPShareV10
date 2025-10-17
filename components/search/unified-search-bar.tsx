'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectQueryIntent, getIntentIcon, getIntentColorClass, getIntentFeedback } from '@/lib/search/intent-detection'
import { cn } from '@/lib/utils'

interface UnifiedSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  isLoading?: boolean
  askMode?: boolean
  onAskModeToggle?: () => void
  placeholder?: string
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
  const [intent, setIntent] = useState<any>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect intent while typing (debounced)
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.length > 0) {
      setIsTyping(true)

      typingTimeoutRef.current = setTimeout(async () => {
        const detectedIntent = await detectQueryIntent(value)
        setIntent(detectedIntent)
        setFeedback(getIntentFeedback(detectedIntent, value))
        setIsTyping(false)
      }, 300) // 300ms debounce
    } else {
      setIntent(null)
      setFeedback('')
      setIsTyping(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [value])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch(value)
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
                ? "Ask a question about experiences..."
                : "Search experiences... (e.g., 'UFO sightings in desert' or 'lucid dreams')")
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
                  title={askMode ? "Switch to Search mode" : "Switch to Ask mode"}
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
                      Ask
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

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
                💡 Try: <span className="font-medium">"UFO sightings"</span> or{' '}
                <span className="font-medium">"experiences with glowing orbs"</span> or{' '}
                <span className="font-medium">"What are common themes in NDEs?"</span>
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
                  {Math.round(intent.confidence * 100)}% confidence
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
