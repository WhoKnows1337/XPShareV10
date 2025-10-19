'use client'

/**
 * Search 5.0 - Quick Filter Chips
 *
 * Provides quick filter chips for instant filtering without opening
 * the full refinement panel. Improves UX for common filter actions.
 *
 * @see docs/masterdocs/search5.md (Part 3.3 - Quick Filters)
 */

import React from 'react'
import {
  X,
  TrendingUp,
  Calendar,
  MapPin,
  Palette,
  Tag,
  Check
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface QuickFilter {
  id: string
  label: string
  type: 'pattern-type' | 'confidence-level' | 'category'
  value: string
  icon?: React.ReactNode
  count?: number
}

interface QuickFilterChipsProps {
  /**
   * Available filters
   */
  filters: QuickFilter[]

  /**
   * Currently active filter IDs
   */
  activeFilters: string[]

  /**
   * Callback when filter is toggled
   */
  onToggleFilter: (filterId: string) => void

  /**
   * Callback when all filters are cleared
   */
  onClearAll?: () => void

  /**
   * Show filter counts
   */
  showCounts?: boolean

  /**
   * Compact mode (smaller chips)
   */
  compact?: boolean

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const PATTERN_TYPE_ICONS: Record<string, React.ReactNode> = {
  color: <Palette className="h-3 w-3" />,
  temporal: <Calendar className="h-3 w-3" />,
  behavior: <TrendingUp className="h-3 w-3" />,
  location: <MapPin className="h-3 w-3" />,
  attribute: <Tag className="h-3 w-3" />
}

// ============================================================================
// COMPONENT
// ============================================================================

export function QuickFilterChips({
  filters,
  activeFilters,
  onToggleFilter,
  onClearAll,
  showCounts = true,
  compact = false,
  className
}: QuickFilterChipsProps) {
  const hasActiveFilters = activeFilters.length > 0

  // Group filters by type
  const groupedFilters = filters.reduce((acc, filter) => {
    if (!acc[filter.type]) acc[filter.type] = []
    acc[filter.type].push(filter)
    return acc
  }, {} as Record<string, QuickFilter[]>)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Active Filters Header */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeFilters.length} aktive {activeFilters.length === 1 ? 'Filter' : 'Filter'}
          </p>

          {/* Clear All Button */}
          {onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Alle löschen
            </Button>
          )}
        </div>
      )}

      {/* Filter Groups */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(groupedFilters).map(([type, typeFilters]) => (
          <React.Fragment key={type}>
            {typeFilters.map(filter => {
              const isActive = activeFilters.includes(filter.id)
              const icon = filter.icon || PATTERN_TYPE_ICONS[filter.value]

              return (
                <TooltipProvider key={filter.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onToggleFilter(filter.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all',
                          'hover:scale-105 hover:shadow-sm',
                          compact ? 'text-xs' : 'text-sm',
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-background border-border hover:bg-accent'
                        )}
                      >
                        {/* Icon */}
                        {icon && (
                          <span className={cn(isActive && 'text-primary-foreground')}>
                            {icon}
                          </span>
                        )}

                        {/* Label */}
                        <span className="font-medium">{filter.label}</span>

                        {/* Count */}
                        {showCounts && filter.count !== undefined && (
                          <span
                            className={cn(
                              'font-mono text-xs',
                              isActive
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                            )}
                          >
                            ({filter.count})
                          </span>
                        )}

                        {/* Active Check */}
                        {isActive && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {isActive ? 'Filter entfernen' : 'Filter anwenden'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </React.Fragment>
        ))}
      </div>

      {/* No Filters Message */}
      {filters.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Keine Filter verfügbar
        </p>
      )}
    </div>
  )
}

// ============================================================================
// UTILITY: Generate Filters from Response
// ============================================================================

/**
 * Helper to generate QuickFilter objects from Search 5.0 response
 */
export function generateQuickFilters(
  patterns?: Array<{ type: string; confidence?: number }>,
  sources?: Array<{ category: string }>
): QuickFilter[] {
  const filters: QuickFilter[] = []

  if (!patterns || !sources) return filters

  // 1. Pattern Type Filters
  const patternTypeCounts: Record<string, number> = {}
  patterns.forEach(p => {
    patternTypeCounts[p.type] = (patternTypeCounts[p.type] || 0) + 1
  })

  Object.entries(patternTypeCounts).forEach(([type, count]) => {
    filters.push({
      id: `pattern-type-${type}`,
      label: type,
      type: 'pattern-type',
      value: type,
      icon: PATTERN_TYPE_ICONS[type],
      count
    })
  })

  // 2. Confidence Level Filters
  const confidenceLevels = [
    { id: 'confidence-high', label: 'Hochrelevant', value: 'high', min: 80 },
    { id: 'confidence-good', label: 'Relevant', value: 'good', min: 60 },
    { id: 'confidence-moderate', label: 'Moderat', value: 'moderate', min: 40 },
  ]

  confidenceLevels.forEach(level => {
    const count = patterns.filter(
      p => (p.confidence || 0) >= level.min &&
           (p.confidence || 0) < (level.min + 20)
    ).length

    if (count > 0) {
      filters.push({
        id: level.id,
        label: level.label,
        type: 'confidence-level',
        value: level.value,
        icon: <TrendingUp className="h-3 w-3" />,
        count
      })
    }
  })

  // 3. Category Filters
  const categoryCounts: Record<string, number> = {}
  sources.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1
  })

  Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 categories only
    .forEach(([category, count]) => {
      filters.push({
        id: `category-${category}`,
        label: category,
        type: 'category',
        value: category,
        icon: <Tag className="h-3 w-3" />,
        count
      })
    })

  return filters
}
