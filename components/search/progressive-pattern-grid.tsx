'use client'

/**
 * Search 5.0 - Progressive Pattern Grid
 *
 * Displays patterns in grid layout with progressive disclosure to
 * reduce cognitive overload. Implements load-more pattern from UX research.
 *
 * @see docs/masterdocs/search5.md (Part 3.2 - Progressive Disclosure)
 */

import React, { useState, useMemo } from 'react'
import {
  ChevronDown,
  Filter,
  ArrowUpDown,
  TrendingUp
} from 'lucide-react'
import { Pattern, Source } from '@/types/search5'
import { PatternCard } from './pattern-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface ProgressivePatternGridProps {
  /**
   * All patterns from Search 5.0 response
   */
  patterns: Pattern[]

  /**
   * All sources (for citation mapping in PatternCard)
   */
  sources: Source[]

  /**
   * Initial number of patterns to show
   */
  initialLimit?: number

  /**
   * Number of patterns to load per "load more" click
   */
  loadMoreIncrement?: number

  /**
   * Show controls (sort, group, filter)
   */
  showControls?: boolean

  /**
   * Callback when user clicks citation
   */
  onCitationClick?: (sourceId: string) => void

  /**
   * Additional className
   */
  className?: string
}

type SortBy = 'confidence' | 'relevance' | 'type'
type GroupBy = 'none' | 'type' | 'confidence-tier'

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressivePatternGrid({
  patterns,
  sources,
  initialLimit = 4,
  loadMoreIncrement = 2,
  showControls = true,
  onCitationClick,
  className
}: ProgressivePatternGridProps) {
  const [limit, setLimit] = useState(initialLimit)
  const [sortBy, setSortBy] = useState<SortBy>('confidence')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')

  // ============================================================================
  // SORTING & GROUPING
  // ============================================================================

  const sortedPatterns = useMemo(() => {
    const sorted = [...patterns]

    switch (sortBy) {
      case 'confidence':
        sorted.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        break
      case 'relevance':
        // Sort by number of sources (more sources = more relevant)
        sorted.sort((a, b) => b.sourceIds.length - a.sourceIds.length)
        break
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type))
        break
    }

    return sorted
  }, [patterns, sortBy])

  const groupedPatterns = useMemo(() => {
    if (groupBy === 'none') {
      return { 'all': sortedPatterns }
    }

    const groups: Record<string, Pattern[]> = {}

    sortedPatterns.forEach(pattern => {
      let key: string

      if (groupBy === 'type') {
        key = pattern.type
      } else if (groupBy === 'confidence-tier') {
        const conf = pattern.confidence || 0
        if (conf >= 80) key = 'Hochrelevant (≥80%)'
        else if (conf >= 60) key = 'Relevant (60-79%)'
        else if (conf >= 40) key = 'Moderat (40-59%)'
        else key = 'Niedrig (<40%)'
      } else {
        key = 'all'
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(pattern)
    })

    return groups
  }, [sortedPatterns, groupBy])

  const visiblePatterns = sortedPatterns.slice(0, limit)
  const hasMore = patterns.length > limit

  // ============================================================================
  // STATS
  // ============================================================================

  const patternTypeCount = useMemo(() => {
    const counts: Record<string, number> = {}
    patterns.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1
    })
    return counts
  }, [patterns])

  const avgConfidence = useMemo(() => {
    const total = patterns.reduce((sum, p) => sum + (p.confidence || 0), 0)
    return Math.round(total / patterns.length)
  }, [patterns])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (patterns.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">
          Keine Patterns gefunden. Verfeinere deine Suche oder ändere die Filter.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4 md:space-y-6', className)}>
      {/* Header with Stats & Controls */}
      <div className="space-y-3 md:space-y-4">
        {/* Stats Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold">
              {patterns.length} {patterns.length === 1 ? 'Pattern' : 'Patterns'} entdeckt
            </h3>
            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                Ø Konfidenz {avgConfidence}%
              </div>
              <span>•</span>
              <span>{Object.keys(patternTypeCount).length} verschiedene Typen</span>
            </div>
          </div>

          {/* Pattern Type Badges */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(patternTypeCount).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <span className="font-mono text-xs">×{count}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Sort & Group Controls */}
        {showControls && patterns.length > 3 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Sort By */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <ArrowUpDown className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confidence">Nach Konfidenz</SelectItem>
                <SelectItem value="relevance">Nach Quellen-Anzahl</SelectItem>
                <SelectItem value="type">Nach Typ</SelectItem>
              </SelectContent>
            </Select>

            {/* Group By */}
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Gruppierung</SelectItem>
                <SelectItem value="type">Nach Typ</SelectItem>
                <SelectItem value="confidence-tier">Nach Konfidenz-Stufe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pattern Grid (Grouped or Flat) */}
      {groupBy === 'none' ? (
        // Flat grid
        <div className="grid gap-4 md:grid-cols-2">
          {visiblePatterns.map((pattern, i) => (
            <PatternCard
              key={`${pattern.type}-${i}`}
              pattern={pattern}
              sources={sources}
              defaultExpanded={i === 0} // First pattern expanded by default
              onCitationClick={onCitationClick}
            />
          ))}
        </div>
      ) : (
        // Grouped grid
        <div className="space-y-6">
          {Object.entries(groupedPatterns).map(([groupName, groupPatterns]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold">
                  {groupName}
                </h4>
                <Badge variant="secondary">
                  {groupPatterns.length}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {groupPatterns.slice(0, limit).map((pattern, i) => (
                  <PatternCard
                    key={`${pattern.type}-${i}`}
                    pattern={pattern}
                    sources={sources}
                    defaultExpanded={i === 0 && groupName === Object.keys(groupedPatterns)[0]}
                    onCitationClick={onCitationClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLimit(prev => Math.min(prev + loadMoreIncrement, patterns.length))}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            {patterns.length - limit} weitere {patterns.length - limit === 1 ? 'Pattern' : 'Patterns'} laden
          </Button>
        </div>
      )}

      {/* Show Less Button */}
      {limit > initialLimit && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLimit(initialLimit)}
          >
            Weniger anzeigen
          </Button>
        </div>
      )}

      {/* Info Message for Hidden Patterns */}
      {hasMore && (
        <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
          <p>
            <strong>{patterns.length - limit} Patterns</strong> wurden ausgeblendet,
            um die Übersichtlichkeit zu erhöhen. Lade weitere Patterns, um tiefere Einblicke zu erhalten.
          </p>
        </div>
      )}
    </div>
  )
}
