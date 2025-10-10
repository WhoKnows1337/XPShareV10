'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Suggestion {
  id: string
  type: 'category' | 'location' | 'time' | 'tag' | 'title'
  value: string
  confidence: number
  position?: number // Optional: cursor position for inline placement
}

interface InlineSuggestionProps {
  suggestion: Suggestion
  onAccept: (suggestion: Suggestion) => void
  onReject: (suggestion: Suggestion) => void
}

export function InlineSuggestion({
  suggestion,
  onAccept,
  onReject,
}: InlineSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleAccept = () => {
    onAccept(suggestion)
    setIsVisible(false)
  }

  const handleReject = () => {
    onReject(suggestion)
    setIsVisible(false)
  }

  const getIcon = () => {
    switch (suggestion.type) {
      case 'category':
        return '📂'
      case 'location':
        return '📍'
      case 'time':
        return '⏰'
      case 'tag':
        return '🏷️'
      case 'title':
        return '✍️'
      default:
        return '💡'
    }
  }

  const getLabel = () => {
    switch (suggestion.type) {
      case 'category':
        return 'Category'
      case 'location':
        return 'Location'
      case 'time':
        return 'Time'
      case 'tag':
        return 'Tag'
      case 'title':
        return 'Title'
      default:
        return 'Suggestion'
    }
  }

  const getConfidenceColor = () => {
    if (suggestion.confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (suggestion.confidence >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2
              shadow-lg backdrop-blur-sm
              ${getConfidenceColor()}
            `}
          >
            {/* Icon & Label */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {getIcon()} {getLabel()}:
              </span>
            </div>

            {/* Suggestion Value */}
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
              {suggestion.value}
            </Badge>

            {/* Confidence */}
            <span className="text-xs opacity-75">
              {Math.round(suggestion.confidence * 100)}%
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-current/20">
              <Button
                onClick={handleAccept}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-current/10"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={handleReject}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-current/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Container for multiple suggestions
interface SuggestionListProps {
  suggestions: Suggestion[]
  onAccept: (suggestion: Suggestion) => void
  onReject: (suggestion: Suggestion) => void
  maxVisible?: number
}

export function SuggestionList({
  suggestions,
  onAccept,
  onReject,
  maxVisible = 3,
}: SuggestionListProps) {
  const visibleSuggestions = suggestions.slice(0, maxVisible)

  if (visibleSuggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mb-4"
    >
      {visibleSuggestions.map((suggestion) => (
        <InlineSuggestion
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
      {suggestions.length > maxVisible && (
        <Badge variant="outline" className="text-xs">
          +{suggestions.length - maxVisible} more
        </Badge>
      )}
    </motion.div>
  )
}
