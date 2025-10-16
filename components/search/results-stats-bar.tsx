'use client'

import { Clock, Sparkles, FileText, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ResultsStatsBarProps {
  /**
   * Total number of results
   */
  resultCount: number
  /**
   * Execution time in milliseconds
   */
  executionTime?: number
  /**
   * Average similarity score (0-1), only for Vector/Hybrid search
   */
  avgSimilarity?: number
  /**
   * Type of search performed
   */
  searchType: 'hybrid' | 'nlp' | 'ask' | 'advanced'
  /**
   * Custom className
   */
  className?: string
  /**
   * Optional preview of filter impact
   */
  filterPreview?: {
    filterId: string
    predictedCount: number
  }
}

/**
 * Results Stats Bar Component
 *
 * Displays search result statistics in a compact, informative bar.
 *
 * Features:
 * - Result count with prominent display
 * - Execution time visualization
 * - Relevance score (avg similarity)
 * - Search type indicator
 * - Optional filter impact preview
 *
 * Usage:
 * ```tsx
 * <ResultsStatsBar
 *   resultCount={42}
 *   executionTime={127}
 *   avgSimilarity={0.85}
 *   searchType="hybrid"
 * />
 * ```
 */
export function ResultsStatsBar({
  resultCount,
  executionTime,
  avgSimilarity,
  searchType,
  className,
  filterPreview,
}: ResultsStatsBarProps) {
  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'hybrid':
        return 'Hybrid Search'
      case 'nlp':
        return 'NLP Search'
      case 'ask':
        return 'AI Q&A'
      case 'advanced':
        return 'Advanced Search'
      default:
        return 'Search'
    }
  }

  const getSearchTypeColor = () => {
    switch (searchType) {
      case 'hybrid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'nlp':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ask':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getRelevanceColor = () => {
    if (!avgSimilarity) return 'text-muted-foreground'
    if (avgSimilarity >= 0.8) return 'text-green-600 dark:text-green-400'
    if (avgSimilarity >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border border-border/50',
        className
      )}
    >
      {/* Left: Result Count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-bold text-foreground">{resultCount.toLocaleString()}</span>
            <span className="text-muted-foreground ml-1">
              {resultCount === 1 ? 'result' : 'results'}
            </span>
          </span>
        </div>

        {/* Search Type Badge */}
        <Badge variant="secondary" className={cn('text-xs', getSearchTypeColor())}>
          {getSearchTypeLabel()}
        </Badge>
      </div>

      {/* Right: Performance Metrics */}
      <div className="flex items-center gap-4">
        {/* Execution Time */}
        {executionTime !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatExecutionTime(executionTime)}</span>
          </div>
        )}

        {/* Average Similarity (Relevance) */}
        {avgSimilarity !== undefined && (
          <div className="flex items-center gap-1.5 text-xs">
            <Sparkles className={cn('w-3.5 h-3.5', getRelevanceColor())} />
            <span className={cn('font-medium', getRelevanceColor())}>
              {Math.round(avgSimilarity * 100)}% relevance
            </span>
          </div>
        )}

        {/* Filter Preview (if provided) */}
        {filterPreview && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">
              Will show ~{filterPreview.predictedCount} results
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
