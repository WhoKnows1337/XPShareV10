'use client'

/**
 * Search 5.0 - Serendipity Card
 *
 * Displays unexpected but relevant cross-category patterns discovered
 * through semantic similarity. Highlights connections users wouldn't
 * normally explore.
 *
 * @see docs/masterdocs/search5.md (Part 2.3 - Serendipity Detection)
 */

import React from 'react'
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Info
} from 'lucide-react'
import { SerendipityConnection } from '@/types/search5'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

interface SerendipityCardProps {
  /**
   * Serendipity connection data
   */
  serendipity: SerendipityConnection

  /**
   * Primary category from original query
   */
  primaryCategory?: string

  /**
   * Callback when user wants to explore serendipity
   */
  onExplore?: (targetCategory: string) => void

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SerendipityCard({
  serendipity,
  primaryCategory,
  onExplore,
  className
}: SerendipityCardProps) {
  const {
    targetCategory,
    similarity,
    explanation,
    experiences = [],
    count
  } = serendipity

  // Format similarity as percentage
  const similarityPercent = Math.round(similarity * 100)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5',
        className
      )}
    >
      {/* Header with gradient */}
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Serendipity Badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 gap-1">
                <Sparkles className="h-3 w-3" />
                Serendipität entdeckt
              </Badge>

              {/* Similarity Score */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 font-mono gap-1"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {similarityPercent}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Semantische Ähnlichkeit zum Ausgangsquery</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Title */}
            <CardTitle className="text-lg leading-tight">
              Unerwartete Verbindung entdeckt
            </CardTitle>

            {/* Category Connection */}
            <div className="flex items-center gap-2 text-sm">
              {primaryCategory && (
                <>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    {primaryCategory}
                  </Badge>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                {targetCategory}
              </Badge>
            </div>
          </div>

          {/* Sparkles Icon */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {/* Explanation */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>

          <p className="text-sm font-medium text-foreground pl-6">
            {count} {count === 1 ? 'Bericht' : 'Berichte'} aus <strong>{targetCategory}</strong>{' '}
            {count === 1 ? 'zeigt' : 'zeigen'} überraschende Ähnlichkeiten.
          </p>
        </div>

        {/* Related Experiences Preview */}
        {experiences.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Verwandte Berichte
            </h4>

            <div className="space-y-2">
              {experiences.slice(0, 3).map((exp) => (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp.id}`}
                  className="group flex items-start gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-all hover:shadow-sm"
                >
                  {/* Similarity Badge */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 font-mono"
                        >
                          {Math.round(exp.similarity * 100)}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Ähnlichkeit zum Ausgangsquery</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Experience Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {exp.title}
                    </p>
                    {exp.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {exp.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {exp.category}
                      </Badge>
                    </div>
                  </div>

                  {/* External Link Icon */}
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors flex-shrink-0" />
                </Link>
              ))}

              {/* Show More Indicator */}
              {experiences.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{experiences.length - 3} weitere verwandte Berichte
                </p>
              )}
            </div>
          </div>
        )}

        {/* Explore Action */}
        <div className="pt-2">
          <Button
            onClick={() => onExplore?.(targetCategory)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Erkunde {targetCategory}-Berichte
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Was ist Serendipität?
              </p>
              <p>
                Serendipität bedeutet, etwas Wertvolles zu finden, während man eigentlich
                nach etwas anderem sucht. Unser AI-System erkennt semantische Verbindungen
                zwischen verschiedenen Kategorien, die du vielleicht nicht erwartet hättest.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// COMPACT VERSION
// ============================================================================

export function SerendipityBanner({
  serendipity,
  onExplore,
  className
}: SerendipityCardProps) {
  const { targetCategory, count, similarity } = serendipity
  const similarityPercent = Math.round(similarity * 100)

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              Serendipität entdeckt!
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {count} verwandte {targetCategory}-Berichte ({similarityPercent}% Ähnlichkeit)
            </p>
          </div>
        </div>

        <Button
          onClick={() => onExplore?.(targetCategory)}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
        >
          Erkunden
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}
