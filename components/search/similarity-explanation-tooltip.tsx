'use client'

import { HelpCircle, Brain, Search, Zap } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SimilarityExplanationTooltipProps {
  score: number
  vectorWeight?: number
  ftsWeight?: number
  className?: string
  children?: React.ReactNode
}

/**
 * SimilarityExplanationTooltip Component
 *
 * Provides detailed explanation of how similarity scores are calculated
 * using hybrid search (vector embeddings + full-text search + RRF fusion)
 *
 * Usage:
 * ```tsx
 * <SimilarityExplanationTooltip
 *   score={0.85}
 *   vectorWeight={0.6}
 *   ftsWeight={0.4}
 * >
 *   <Badge>85% Match</Badge>
 * </SimilarityExplanationTooltip>
 * ```
 */
export function SimilarityExplanationTooltip({
  score,
  vectorWeight = 0.6,
  ftsWeight = 0.4,
  className,
  children,
}: SimilarityExplanationTooltipProps) {
  const scorePercent = Math.round(score * 100)

  // Determine match quality
  const getMatchQuality = (score: number) => {
    if (score >= 0.8) return { label: 'Excellent Match', color: 'text-green-400' }
    if (score >= 0.6) return { label: 'Good Match', color: 'text-blue-400' }
    if (score >= 0.4) return { label: 'Fair Match', color: 'text-yellow-400' }
    return { label: 'Weak Match', color: 'text-orange-400' }
  }

  const matchQuality = getMatchQuality(score)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('cursor-help inline-flex items-center gap-1', className)}>
            {children}
            <HelpCircle className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-slate-900 border-observatory-gold/50 text-white max-w-xs"
          sideOffset={5}
        >
          {/* Header */}
          <div className="mb-3 pb-2 border-b border-slate-700">
            <p className="font-semibold text-observatory-gold flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />
              Similarity Score: {scorePercent}%
            </p>
            <p className={cn('text-xs mt-1', matchQuality.color)}>
              {matchQuality.label}
            </p>
          </div>

          {/* How It's Calculated */}
          <div className="space-y-2 text-xs">
            <p className="font-medium text-slate-200">How it's calculated:</p>

            {/* Vector Similarity */}
            <div className="flex items-start gap-2">
              <Brain className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-purple-300 font-medium">
                  Semantic Understanding ({Math.round(vectorWeight * 100)}%)
                </p>
                <p className="text-slate-400 text-[10px] leading-tight">
                  AI analyzes meaning and context using embeddings
                </p>
              </div>
            </div>

            {/* Full-Text Search */}
            <div className="flex items-start gap-2">
              <Search className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-blue-300 font-medium">
                  Keyword Matching ({Math.round(ftsWeight * 100)}%)
                </p>
                <p className="text-slate-400 text-[10px] leading-tight">
                  Finds exact words and phrases in the text
                </p>
              </div>
            </div>

            {/* RRF Fusion */}
            <div className="mt-3 pt-2 border-t border-slate-700">
              <p className="text-slate-300 text-[10px] leading-tight">
                <span className="font-semibold text-observatory-gold">RRF Fusion:</span> Results
                are intelligently combined using Reciprocal Rank Fusion for optimal relevance.
              </p>
            </div>

            {/* What the score means */}
            <div className="mt-3 pt-2 border-t border-slate-700">
              <p className="text-slate-300 text-[10px] leading-tight">
                <span className="font-semibold">Interpretation:</span>
              </p>
              <ul className="mt-1 space-y-0.5 text-[10px] text-slate-400">
                <li>• <span className="text-green-400">80%+</span> Highly relevant to your query</li>
                <li>• <span className="text-blue-400">60-80%</span> Good semantic match</li>
                <li>• <span className="text-yellow-400">40-60%</span> Partial match</li>
                <li>• <span className="text-orange-400">&lt;40%</span> Weak connection</li>
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact version - just shows icon with tooltip
 */
export function SimilarityHelpIcon({
  score,
  vectorWeight,
  ftsWeight,
  className,
}: Omit<SimilarityExplanationTooltipProps, 'children'>) {
  return (
    <SimilarityExplanationTooltip
      score={score}
      vectorWeight={vectorWeight}
      ftsWeight={ftsWeight}
      className={className}
    >
      <HelpCircle className="h-3.5 w-3.5 text-observatory-gold/70 hover:text-observatory-gold transition-colors" />
    </SimilarityExplanationTooltip>
  )
}
