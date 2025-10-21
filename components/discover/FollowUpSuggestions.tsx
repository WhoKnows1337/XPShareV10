/**
 * XPShare AI - Follow-Up Suggestions Component
 *
 * Displays AI-generated follow-up query suggestions with click handlers.
 * Integrates with chat interface to execute suggested queries.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FollowUpSuggestion } from '@/lib/tools/insights/suggest-followups'
import { cn } from '@/lib/utils'

// ============================================================================
// Props
// ============================================================================

export interface FollowUpSuggestionsProps {
  suggestions: FollowUpSuggestion[]
  onSuggestionClick?: (suggestion: FollowUpSuggestion) => void
  title?: string
  description?: string
  maxVisible?: number
  className?: string
  variant?: 'default' | 'compact' | 'grid'
  showIcons?: boolean
  showDescriptions?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function FollowUpSuggestions({
  suggestions,
  onSuggestionClick,
  title = 'Follow-Up Suggestions',
  description = 'Suggested queries to explore further',
  maxVisible = 5,
  className,
  variant = 'default',
  showIcons = true,
  showDescriptions = true,
}: FollowUpSuggestionsProps) {
  // Limit visible suggestions
  const visibleSuggestions = suggestions.slice(0, maxVisible)

  if (visibleSuggestions.length === 0) {
    return null
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {visibleSuggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick?.(suggestion)}
            className="text-xs"
          >
            {showIcons && suggestion.icon && <span className="mr-1">{suggestion.icon}</span>}
            {suggestion.label}
          </Button>
        ))}
      </div>
    )
  }

  // Render grid variant
  if (variant === 'grid') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick?.(suggestion)}
                className={cn(
                  'p-4 rounded-lg border border-gray-200 dark:border-gray-700',
                  'hover:border-blue-500 dark:hover:border-blue-400',
                  'hover:bg-blue-50 dark:hover:bg-blue-950/30',
                  'transition-colors text-left group'
                )}
              >
                <div className="flex items-start gap-3">
                  {showIcons && suggestion.icon && (
                    <div className="text-2xl flex-shrink-0">{suggestion.icon}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {suggestion.label}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                    {showDescriptions && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render default variant (list)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick?.(suggestion)}
              className={cn(
                'w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700',
                'hover:border-blue-500 dark:hover:border-blue-400',
                'hover:bg-blue-50 dark:hover:bg-blue-950/30',
                'transition-colors text-left group'
              )}
            >
              <div className="flex items-start gap-3">
                {showIcons && suggestion.icon && (
                  <div className="text-xl flex-shrink-0 mt-0.5">{suggestion.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {suggestion.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    {suggestion.priority >= 8 && (
                      <Badge variant="default" className="text-xs bg-yellow-500">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  {showDescriptions && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-mono truncate">
                    {suggestion.query}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {suggestions.length > maxVisible && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Showing {maxVisible} of {suggestions.length} suggestions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
