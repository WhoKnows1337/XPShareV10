'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Common tags by category
const tagSuggestions: Record<string, string[]> = {
  ufo: ['lights', 'craft', 'disc', 'triangle', 'sphere', 'witness', 'photo', 'video', 'hovering', 'fast_movement'],
  paranormal: ['ghost', 'spirit', 'cold_spot', 'footsteps', 'voices', 'shadow', 'apparition', 'witness', 'night'],
  dreams: ['lucid', 'vivid', 'recurring', 'nightmare', 'flying', 'falling', 'prophetic', 'symbolic'],
  psychedelic: ['visual', 'entity', 'geometric', 'ego_death', 'healing', 'breakthrough', 'colors', 'nature'],
  spiritual: ['meditation', 'chakra', 'energy', 'light', 'awakening', 'consciousness', 'peace', 'vision'],
  synchronicity: ['numbers', '111', '222', '333', 'signs', 'coincidence', 'timing', 'manifestation'],
  nde: ['tunnel', 'light', 'peace', 'beings', 'life_review', 'deceased', 'choice', 'return'],
  other: ['unusual', 'unexplained', 'strange', 'witness', 'photo', 'night', 'sudden'],
}

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  category?: string
  maxTags?: number
  className?: string
}

export function TagInput({ value = [], onChange, category, maxTags = 10, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get suggestions based on category and input
  useEffect(() => {
    const categorySuggestions = category ? tagSuggestions[category] || [] : []
    const allCommonTags = [
      'witness', 'night', 'day', 'indoor', 'outdoor', 'alone', 'with_others',
      'clear', 'cloudy', 'photo', 'video', 'audio', 'documented'
    ]

    // Remove duplicates by using Set
    const uniqueTags = Array.from(new Set([...categorySuggestions, ...allCommonTags]))

    const availableSuggestions = uniqueTags
      .filter((tag) => !value.includes(tag))
      .filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 8)

    setSuggestions(availableSuggestions)
  }, [inputValue, category, value])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase().replace(/\s+/g, '_')

    if (!normalizedTag) return
    if (value.includes(normalizedTag)) return
    if (value.length >= maxTags) return

    onChange([...value, normalizedTag])
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div ref={containerRef} className={cn('space-y-3', className)}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        <AnimatePresence mode="popLayout">
          {value.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="gap-1 px-3 py-1 text-sm hover:bg-secondary/80 transition-colors"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Tags hinzugefügt</p>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            value.length >= maxTags
              ? `Maximum ${maxTags} Tags erreicht`
              : 'Tag hinzufügen (drücke Enter)...'
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          disabled={value.length >= maxTags}
          className="pr-10"
        />
        {inputValue && (
          <button
            onClick={() => addTag(inputValue)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {/* Tag Counter */}
        <p className="text-xs text-muted-foreground mt-1">
          {value.length}/{maxTags} Tags
        </p>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <p className="text-xs font-medium text-muted-foreground">Vorschläge</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="px-2.5 py-1 text-xs rounded-full border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                #{suggestion}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
