/**
 * Citation List Component
 *
 * Displays footnote-style citations with hover popups.
 * Shows source attribution for AI-generated responses.
 */

'use client'

import { useState } from 'react'
import { Citation, formatCitation } from '@/lib/citations/generator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ExternalLink, Star } from 'lucide-react'
import Link from 'next/link'

export interface CitationListProps {
  citations: Citation[]
  variant?: 'inline' | 'footer'
  showRelevanceScore?: boolean
}

/**
 * Inline citation markers [1][2][3]
 */
export function InlineCitation({
  citation,
  showRelevanceScore = false,
}: {
  citation: Citation
  showRelevanceScore?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center h-5 px-1.5 ml-0.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 transition-colors cursor-help"
          aria-label={`Citation ${citation.citationNumber}`}
        >
          {citation.citationNumber}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" side="top" align="start">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Source {citation.citationNumber}
              </Badge>
              {showRelevanceScore && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {Math.round(citation.relevanceScore * 100)}%
                </div>
              )}
            </div>
            <Link href={`/experiences/${citation.experienceId}`} target="_blank">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Context Before (Title) */}
          {citation.contextBefore && (
            <div>
              <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                {citation.contextBefore}
              </h4>
            </div>
          )}

          {/* Snippet */}
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-4">{citation.snippetText}</p>
          </div>

          {/* Context After (Category) */}
          {citation.contextAfter && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              {citation.contextAfter}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Footer-style citation list
 */
export function CitationList({
  citations,
  variant = 'footer',
  showRelevanceScore = false,
}: CitationListProps) {
  if (citations.length === 0) return null

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1">
        {citations.map((citation) => (
          <InlineCitation
            key={citation.citationNumber}
            citation={citation}
            showRelevanceScore={showRelevanceScore}
          />
        ))}
      </span>
    )
  }

  // Footer variant
  return (
    <Card className="mt-4 bg-muted/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Sources ({citations.length})
            </h4>
            {showRelevanceScore && (
              <span className="text-xs text-muted-foreground">
                Sorted by relevance
              </span>
            )}
          </div>

          {/* Citation List */}
          <div className="space-y-2">
            {citations.map((citation) => (
              <div
                key={citation.citationNumber}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors"
              >
                {/* Number Badge */}
                <Badge variant="outline" className="shrink-0 mt-0.5">
                  {citation.citationNumber}
                </Badge>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Title */}
                  {citation.contextBefore && (
                    <h5 className="text-sm font-medium text-foreground line-clamp-1">
                      {citation.contextBefore}
                    </h5>
                  )}

                  {/* Snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {citation.snippetText}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {citation.contextAfter && <span>{citation.contextAfter}</span>}
                    {showRelevanceScore && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {Math.round(citation.relevanceScore * 100)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Link */}
                <Link
                  href={`/experiences/${citation.experienceId}`}
                  target="_blank"
                  className="shrink-0"
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">View source</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact citation badges (for space-constrained layouts)
 */
export function CompactCitationBadges({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Sources:</span>
      {citations.slice(0, 5).map((citation) => (
        <InlineCitation key={citation.citationNumber} citation={citation} />
      ))}
      {citations.length > 5 && (
        <span className="text-muted-foreground">+{citations.length - 5} more</span>
      )}
    </div>
  )
}
