'use client'

import { useState, KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TagEditorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  suggestions?: string[]
}

export function TagEditor({
  tags,
  onChange,
  maxTags = 10,
  suggestions = [],
}: TagEditorProps) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed])
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddSuggestion = (suggestion: string) => {
    if (!tags.includes(suggestion) && tags.length < maxTags) {
      onChange([...tags, suggestion])
    }
  }

  const availableSuggestions = suggestions.filter(s => !tags.includes(s))

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-lg bg-gray-50">
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Badge
                variant="secondary"
                className="text-sm pl-3 pr-1 py-1 flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => handleRemove(tag)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input */}
        {tags.length < maxTags && (
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="flex-1 min-w-[120px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-1"
          />
        )}
      </div>

      {/* Add Button */}
      {input.trim() && (
        <Button
          onClick={handleAdd}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add "{input.trim()}"
        </Button>
      )}

      {/* Tag Count */}
      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} tags
      </p>

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 5).map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                onClick={() => handleAddSuggestion(suggestion)}
                className="h-auto py-1 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                #{suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
