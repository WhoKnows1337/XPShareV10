'use client'

/**
 * Search 5.0 - Empty Results State
 *
 * Displays helpful guidance when a search returns no patterns.
 * Different from initial empty state - this shows after executing a search.
 *
 * @see docs/masterdocs/search5.md (P1 Feature - Empty State)
 */

import React from 'react'
import { Search, AlertCircle, Filter, Lightbulb, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface EmptyResultsStateProps {
  /**
   * The original search query
   */
  query: string

  /**
   * Number of sources that were found (before pattern discovery)
   */
  sourceCount: number

  /**
   * Active filters that might be limiting results
   */
  activeFilters?: {
    category?: string
    tags?: string
    location?: string
    dateRange?: { from: string; to: string }
  }

  /**
   * Callback to retry with suggested query
   */
  onRetryWithSuggestion?: (query: string) => void

  /**
   * Callback to clear all filters
   */
  onClearFilters?: () => void

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmptyResultsState({
  query,
  sourceCount,
  activeFilters,
  onRetryWithSuggestion,
  onClearFilters,
  className
}: EmptyResultsStateProps) {
  // Determine reason for no results
  const hasFilters = !!(
    activeFilters?.category ||
    activeFilters?.tags ||
    activeFilters?.location ||
    activeFilters?.dateRange
  )

  const noSources = sourceCount === 0
  const hasSourcesButNoPatterns = sourceCount > 0

  // ============================================================================
  // SUGGESTIONS
  // ============================================================================

  const suggestions = getSuggestions(query, hasFilters, noSources)

  return (
    <div
      className={cn(
        'border border-muted rounded-lg overflow-hidden bg-muted/30',
        className
      )}
    >
      {/* Header */}
      <div className="bg-muted/50 px-4 md:px-6 py-4 md:py-5 border-b">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-background flex items-center justify-center flex-shrink-0">
            <Search className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold mb-1">
              Keine Patterns gefunden
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {noSources ? (
                <>Keine relevanten Erfahrungen für <span className="font-mono">"{query}"</span> gefunden.</>
              ) : (
                <>
                  {sourceCount} Quellen gefunden, aber keine eindeutigen Patterns in <span className="font-mono">"{query}"</span>.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <span>Vorschläge zum Verbessern deiner Suche:</span>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {suggestion.icon}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
                {suggestion.examples && suggestion.examples.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {suggestion.examples.map((example, j) => (
                      <Badge
                        key={j}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                        onClick={() => onRetryWithSuggestion?.(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Clear Filters CTA */}
        {hasFilters && onClearFilters && (
          <div className="pt-3 border-t">
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Filter className="h-3 w-3 mr-2" />
              Alle Filter entfernen
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="border-t bg-muted/30 px-4 md:px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">Aktive Filter:</span>
            {activeFilters?.category && (
              <Badge variant="secondary" className="text-xs">
                Kategorie: {activeFilters.category}
              </Badge>
            )}
            {activeFilters?.tags && (
              <Badge variant="secondary" className="text-xs">
                Tags: {activeFilters.tags}
              </Badge>
            )}
            {activeFilters?.location && (
              <Badge variant="secondary" className="text-xs">
                Ort: {activeFilters.location}
              </Badge>
            )}
            {activeFilters?.dateRange && (
              <Badge variant="secondary" className="text-xs">
                Zeitraum: {activeFilters.dateRange.from} - {activeFilters.dateRange.to}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Technical Info */}
      <div className="border-t bg-background/50 px-4 md:px-6 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {sourceCount} Quellen analysiert
          </span>
          <span>0 Patterns gefunden</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

interface Suggestion {
  icon: React.ReactNode
  title: string
  description: string
  examples?: string[]
}

/**
 * Generate contextual suggestions based on why no results were found
 */
function getSuggestions(
  query: string,
  hasFilters: boolean,
  noSources: boolean
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // If no sources at all, suggest broader search
  if (noSources) {
    suggestions.push({
      icon: <Search className="h-4 w-4 text-primary" />,
      title: 'Versuche breitere Suchbegriffe',
      description:
        'Deine Frage ist möglicherweise zu spezifisch. Verwende allgemeinere Begriffe oder entferne Details.',
      examples: [
        'Welche Farben werden bei UFO-Sichtungen beschrieben?',
        'Was sind häufige Merkmale bei Nahtoderfahrungen?',
        'Welche Muster gibt es in luziden Träumen?'
      ]
    })
  }

  // If sources found but no patterns, suggest different question type
  if (!noSources) {
    suggestions.push({
      icon: <RefreshCw className="h-4 w-4 text-primary" />,
      title: 'Stelle eine offenere Frage',
      description:
        'Es wurden Quellen gefunden, aber keine eindeutigen Patterns. Versuche nach allgemeinen Mustern statt spezifischen Details zu fragen.',
      examples: [
        'Was sind die häufigsten Attribute?',
        'Gibt es zeitliche Muster?',
        'Welche Gemeinsamkeiten gibt es?'
      ]
    })
  }

  // If filters are active, suggest removing them
  if (hasFilters) {
    suggestions.push({
      icon: <Filter className="h-4 w-4 text-primary" />,
      title: 'Entferne Filter',
      description:
        'Deine Filter könnten zu restriktiv sein. Versuche Filter zu entfernen oder zu erweitern (z.B. größerer Zeitraum).'
    })
  }

  // Always suggest checking spelling
  suggestions.push({
    icon: <AlertCircle className="h-4 w-4 text-primary" />,
    title: 'Prüfe die Schreibweise',
    description:
      'Stelle sicher, dass Fachbegriffe korrekt geschrieben sind. Versuche auch deutsche statt englische Begriffe oder umgekehrt.',
    examples: [
      'UFO statt UAP',
      'Nahtoderfahrung statt NDE',
      'luzider Traum statt Klartraum'
    ]
  })

  return suggestions
}
