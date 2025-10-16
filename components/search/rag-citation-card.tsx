'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfidenceCircle } from '@/components/ui/confidence-circle'
import { HighlightedText } from '@/components/ui/highlighted-text'
import { ChevronDown, ChevronUp, ExternalLink, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RAGCitationCardProps {
  source: {
    id: string
    title: string
    excerpt: string
    fullText?: string
    category: string
    date_occurred?: string
    location_text?: string
    similarity: number // 0-1
    attributes?: string[]
  }
  query: string
  onExpand?: (id: string, expanded: boolean) => void
  className?: string
}

/**
 * RAG Citation Card Component
 *
 * Enhanced citation card for RAG (Retrieval-Augmented Generation) sources.
 *
 * Features:
 * - Custom SVG Confidence Circle
 * - Highlighted query matches in excerpt
 * - Expand/Collapse for full text
 * - Color-coded confidence levels
 * - Direct link to experience
 * - Metadata display (category, location, date)
 *
 * Usage:
 * ```tsx
 * <RAGCitationCard
 *   source={{
 *     id: '123',
 *     title: 'UFO Sighting',
 *     excerpt: 'I saw orange lights...',
 *     category: 'ufo',
 *     similarity: 0.85
 *   }}
 *   query="orange lights"
 * />
 * ```
 */
export function RAGCitationCard({
  source,
  query,
  onExpand,
  className,
}: RAGCitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpand?.(source.id, newExpanded)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (source.fullText && source.fullText !== source.excerpt) {
        e.preventDefault()
        handleToggleExpand()
      }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ufo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      nde: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      paranormal: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      dreams: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      psychedelic: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      meditation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      synchronicity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'astral-projection': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'time-anomaly': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      entity: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      energy: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const getConfidenceBorderColor = () => {
    const score = source.similarity * 100
    if (score >= 80) return 'border-green-200 dark:border-green-800'
    if (score >= 60) return 'border-yellow-200 dark:border-yellow-800'
    return 'border-orange-200 dark:border-orange-800'
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card
      className={cn('transition-all hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary', getConfidenceBorderColor(), className)}
      tabIndex={source.fullText && source.fullText !== source.excerpt ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Left: Confidence Circle */}
          <div className="flex-shrink-0 pt-1">
            <ConfidenceCircle score={source.similarity * 100} size={56} strokeWidth={5} />
          </div>

          {/* Right: Content */}
          <div className="flex-1 space-y-3">
            {/* Header: Title + Link */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link
                  href={`/experiences/${source.id}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline line-clamp-2 leading-tight"
                >
                  {source.title || 'Untitled Experience'}
                </Link>
              </div>
              <Link href={`/experiences/${source.id}`} target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Open ${source.title || 'experience'} in new tab`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={cn('text-xs', getCategoryColor(source.category))}>
                {source.category}
              </Badge>

              {source.location_text && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{source.location_text}</span>
                </div>
              )}

              {source.date_occurred && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(source.date_occurred)}</span>
                </div>
              )}
            </div>

            {/* Excerpt with Highlighted Matches */}
            <div className="text-sm text-muted-foreground">
              <HighlightedText
                text={source.excerpt}
                query={query}
                className="leading-relaxed"
              />
            </div>

            {/* Attributes (if available) */}
            {source.attributes && source.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {source.attributes.slice(0, 5).map((attr, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {attr}
                  </Badge>
                ))}
                {source.attributes.length > 5 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{source.attributes.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Expand/Collapse Full Text */}
            {source.fullText && source.fullText !== source.excerpt && (
              <>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      <HighlightedText text={source.fullText} query={query} />
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="text-xs -ml-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? 'Collapse full text' : 'Expand to show full text'}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show full text
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
