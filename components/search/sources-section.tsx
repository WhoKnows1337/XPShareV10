'use client'

/**
 * Search 5.0 - Sources Section
 *
 * Displays all source experiences used for pattern discovery with:
 * - Similarity scores
 * - Category badges
 * - Clickable links
 * - Progressive disclosure (show more)
 * - Sort/group options
 *
 * @see docs/masterdocs/search5.md (Part 2.4 - Sources)
 */

import React, { useState, useMemo } from 'react'
import {
  ExternalLink,
  TrendingUp,
  Calendar,
  MapPin,
  Tag,
  ChevronDown,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { Source } from '@/types/search5'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface SourcesSectionProps {
  /**
   * Source experiences
   */
  sources: Source[]

  /**
   * Initial number of sources to show (default: 5)
   */
  initialLimit?: number

  /**
   * Show sort/group controls
   */
  showControls?: boolean

  /**
   * Additional className
   */
  className?: string
}

type SortBy = 'relevance' | 'date' | 'category'
type GroupBy = 'none' | 'category' | 'similarity-tier'

// ============================================================================
// COMPONENT
// ============================================================================

export function SourcesSection({
  sources,
  initialLimit = 5,
  showControls = true,
  className
}: SourcesSectionProps) {
  const [limit, setLimit] = useState(initialLimit)
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')

  // ============================================================================
  // SORTING & GROUPING
  // ============================================================================

  const sortedSources = useMemo(() => {
    const sorted = [...sources]

    switch (sortBy) {
      case 'relevance':
        // Already sorted by similarity from API
        sorted.sort((a, b) => b.similarity - a.similarity)
        break
      case 'date':
        sorted.sort((a, b) => {
          const dateA = a.date_occurred ? new Date(a.date_occurred).getTime() : 0
          const dateB = b.date_occurred ? new Date(b.date_occurred).getTime() : 0
          return dateB - dateA
        })
        break
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category))
        break
    }

    return sorted
  }, [sources, sortBy])

  const groupedSources = useMemo(() => {
    if (groupBy === 'none') {
      return { 'all': sortedSources }
    }

    const groups: Record<string, Source[]> = {}

    sortedSources.forEach(source => {
      let key: string

      if (groupBy === 'category') {
        key = source.category
      } else if (groupBy === 'similarity-tier') {
        if (source.similarity >= 0.8) key = 'Hochrelevant (≥80%)'
        else if (source.similarity >= 0.6) key = 'Relevant (60-79%)'
        else if (source.similarity >= 0.4) key = 'Moderat (40-59%)'
        else key = 'Niedrig (<40%)'
      } else {
        key = 'all'
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(source)
    })

    return groups
  }, [sortedSources, groupBy])

  const visibleSources = sortedSources.slice(0, limit)
  const hasMore = sources.length > limit

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">
            Analysierte Quellen
          </h3>
          <p className="text-sm text-muted-foreground">
            {sources.length} {sources.length === 1 ? 'Erfahrungsbericht' : 'Erfahrungsberichte'} als Grundlage für Patterns
          </p>
        </div>

        {/* Sort & Group Controls */}
        {showControls && sources.length > 3 && (
          <div className="flex items-center gap-2">
            {/* Sort By */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[160px] h-9">
                <ArrowUpDown className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Nach Relevanz</SelectItem>
                <SelectItem value="date">Nach Datum</SelectItem>
                <SelectItem value="category">Nach Kategorie</SelectItem>
              </SelectContent>
            </Select>

            {/* Group By */}
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
              <SelectTrigger className="w-[160px] h-9">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Gruppierung</SelectItem>
                <SelectItem value="category">Nach Kategorie</SelectItem>
                <SelectItem value="similarity-tier">Nach Relevanz-Stufe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Sources Grid (Grouped or Flat) */}
      {groupBy === 'none' ? (
        // Flat list
        <div className="space-y-3">
          {visibleSources.map((source, index) => (
            <SourceCard
              key={source.id}
              source={source}
              index={index + 1}
            />
          ))}
        </div>
      ) : (
        // Grouped list
        <div className="space-y-6">
          {Object.entries(groupedSources).map(([groupName, groupSources]) => (
            <div key={groupName} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {groupName}
                <Badge variant="secondary" className="ml-auto">
                  {groupSources.length}
                </Badge>
              </h4>
              <div className="space-y-3">
                {groupSources.slice(0, limit).map((source, index) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    index={sources.indexOf(source) + 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setLimit(prev => Math.min(prev + 5, sources.length))}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            {sources.length - limit} weitere Quellen anzeigen
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
    </div>
  )
}

// ============================================================================
// SOURCE CARD COMPONENT
// ============================================================================

interface SourceCardProps {
  source: Source
  index: number
}

function SourceCard({ source, index }: SourceCardProps) {
  const similarityPercent = Math.round(source.similarity * 100)

  // Determine similarity tier for styling
  const similarityTier =
    similarityPercent >= 80 ? 'high' :
    similarityPercent >= 60 ? 'good' :
    similarityPercent >= 40 ? 'moderate' : 'low'

  const tierStyles = {
    high: 'border-green-500/30 bg-green-500/5',
    good: 'border-blue-500/30 bg-blue-500/5',
    moderate: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-orange-500/30 bg-orange-500/5'
  }

  return (
    <Link
      href={`/experiences/${source.id}`}
      className={cn(
        'group block border rounded-lg p-4 transition-all hover:shadow-md',
        tierStyles[similarityTier]
      )}
    >
      <div className="flex items-start gap-4">
        {/* Index & Similarity Score */}
        <div className="flex-shrink-0 space-y-2">
          <Badge variant="outline" className="font-mono">
            #{index}
          </Badge>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={
                    similarityTier === 'high' ? 'default' :
                    similarityTier === 'good' ? 'secondary' :
                    'outline'
                  }
                  className={cn('font-mono gap-1', {
                    'bg-green-500': similarityTier === 'high',
                    'bg-blue-500': similarityTier === 'good'
                  })}
                >
                  <TrendingUp className="h-3 w-3" />
                  {similarityPercent}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Semantische Ähnlichkeit zur Anfrage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <h4 className="font-medium leading-tight group-hover:text-primary transition-colors">
            {source.title}
          </h4>

          {/* Excerpt */}
          {source.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {source.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {/* Category */}
            <Badge variant="secondary" className="text-xs">
              {source.category}
            </Badge>

            {/* Date */}
            {source.date_occurred && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(source.date_occurred).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}

            {/* Location */}
            {source.location_text && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{source.location_text}</span>
              </div>
            )}

            {/* Attributes/Tags */}
            {source.attributes && source.attributes.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {source.attributes.slice(0, 2).join(', ')}
                {source.attributes.length > 2 && ` +${source.attributes.length - 2}`}
              </div>
            )}
          </div>
        </div>

        {/* External Link Icon */}
        <div className="flex-shrink-0">
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}
