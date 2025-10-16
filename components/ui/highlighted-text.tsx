'use client'

import { cn } from '@/lib/utils'

interface HighlightedTextProps {
  /**
   * The full text to display
   */
  text: string
  /**
   * The search query to highlight
   */
  query: string
  /**
   * Custom className for the container
   */
  className?: string
  /**
   * Custom className for highlighted parts
   */
  highlightClassName?: string
  /**
   * Case sensitive matching
   * @default false
   */
  caseSensitive?: boolean
}

/**
 * Highlighted Text Component
 *
 * Highlights matching query text within a larger text string.
 *
 * Features:
 * - Regex-based matching
 * - Case-insensitive by default
 * - Customizable highlight styling
 * - Preserves original text structure
 *
 * Usage:
 * ```tsx
 * <HighlightedText
 *   text="I saw orange lights in the sky"
 *   query="orange"
 * />
 * ```
 */
export function HighlightedText({
  text,
  query,
  className,
  highlightClassName,
  caseSensitive = false,
}: HighlightedTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>
  }

  try {
    // Escape special regex characters in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Create regex with optional case-insensitive flag
    const regex = new RegExp(`(${escapedQuery})`, caseSensitive ? 'g' : 'gi')

    // Split text by matches
    const parts = text.split(regex)

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Check if this part matches the query
          const isMatch = regex.test(part)
          regex.lastIndex = 0 // Reset regex state

          if (isMatch) {
            return (
              <mark
                key={index}
                className={cn(
                  'bg-yellow-200 dark:bg-yellow-900/50 text-foreground font-medium px-0.5 rounded',
                  highlightClassName
                )}
              >
                {part}
              </mark>
            )
          }

          return <span key={index}>{part}</span>
        })}
      </span>
    )
  } catch (error) {
    // Fallback if regex fails
    console.error('HighlightedText regex error:', error)
    return <span className={className}>{text}</span>
  }
}
