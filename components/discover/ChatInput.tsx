'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

/**
 * Chat Input Component
 * Message input with auto-resize and keyboard shortcuts
 * Features: Enter to send, Shift+Enter for newline, auto-focus
 * Used in /app/discover/page.tsx
 */

export interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Ask about patterns, connections, or insights...',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = () => {
    const trimmed = message.trim()
    if (trimmed && !isLoading && !disabled) {
      onSend(trimmed)
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[60px] max-h-[200px] resize-none pr-12"
          rows={1}
        />

        {/* Character count (optional) */}
        {message.length > 100 && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {message.length}
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading || disabled}
        size="icon"
        className="h-[60px] w-[60px] flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}

/**
 * Suggestion Chips Component
 * Quick-action chips for common queries
 */
export interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  disabled?: boolean
}

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, idx) => (
        <Button
          key={idx}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
