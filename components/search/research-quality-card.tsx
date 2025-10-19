'use client'

/**
 * Search 5.0 - Research Quality Card
 *
 * Displays research quality indicators:
 * - Confidence score (vector similarity)
 * - Source count
 * - Patterns found
 * - Execution time
 * - Warnings
 *
 * @see docs/masterdocs/search5.md (Part 2.1 - Response Metadata)
 */

import React from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react'
import { Search5Metadata } from '@/types/search5'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

interface ResearchQualityCardProps {
  /**
   * Metadata from Search 5.0 response
   */
  metadata: Search5Metadata

  /**
   * Show detailed breakdown
   */
  detailed?: boolean

  /**
   * Compact mode (smaller UI)
   */
  compact?: boolean

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResearchQualityCard({
  metadata,
  detailed = true,
  compact = false,
  className
}: ResearchQualityCardProps) {
  const {
    confidence,
    sourceCount,
    patternsFound,
    executionTime,
    warnings = []
  } = metadata

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  const qualityTier = getQualityTier(confidence, sourceCount, patternsFound)
  const hasWarnings = warnings.length > 0

  // ============================================================================
  // COMPACT MODE
  // ============================================================================

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 text-sm', className)}>
        {/* Confidence Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={qualityTier.variant} className="gap-1">
                {qualityTier.icon}
                <span className="font-mono">{confidence}%</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Durchschnittliche Relevanz der Quellen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Stats */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {sourceCount}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {patternsFound}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatExecutionTime(executionTime)}
          </span>
        </div>

        {/* Warnings */}
        {hasWarnings && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {warnings.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {warnings.map((warning, i) => (
                    <p key={i} className="text-xs">{warning}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  // ============================================================================
  // DETAILED MODE
  // ============================================================================

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        hasWarnings && 'border-destructive/50',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 bg-gradient-to-r',
          qualityTier.bgGradient
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {qualityTier.icon}
            <h3 className="text-sm font-semibold text-white">
              {qualityTier.label}
            </h3>
          </div>

          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 font-mono"
          >
            {confidence}%
          </Badge>
        </div>

        {/* Confidence Progress Bar */}
        <Progress
          value={confidence}
          className="mt-3 h-2 bg-white/20"
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-muted/50">
        {/* Source Count */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-background p-3 md:p-4 hover:bg-accent/50 transition-colors cursor-help">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Database className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs font-medium">Quellen</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">{sourceCount}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-[200px]">
                Anzahl der analysierten Erfahrungsberichte, die als relevant eingestuft wurden
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Patterns Found */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-background p-3 md:p-4 hover:bg-accent/50 transition-colors cursor-help">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs font-medium">Patterns</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">{patternsFound}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-[200px]">
                Anzahl der erkannten Muster (Farben, Zeitpunkte, Verhaltensweisen, Orte, Attribute)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Execution Time */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-background p-3 md:p-4 hover:bg-accent/50 transition-colors cursor-help">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs font-medium">Zeit</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">
                  {formatExecutionTime(executionTime)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-[200px]">
                Gesamte Ausführungszeit (Vektorsuche + LLM Pattern Discovery)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Detailed Breakdown (optional) */}
      {detailed && (
        <div className="p-3 md:p-4 bg-muted/30 space-y-2 md:space-y-3 text-xs md:text-sm">
          {/* Quality Explanation */}
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">Was bedeutet {confidence}% Konfidenz?</p>
              <p className="text-xs text-muted-foreground">
                {getConfidenceExplanation(confidence, sourceCount)}
              </p>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="flex items-start gap-3">
            <Zap className={cn(
              'h-4 w-4 mt-0.5 flex-shrink-0',
              executionTime < 3000 ? 'text-green-500' :
              executionTime < 7000 ? 'text-yellow-500' :
              'text-orange-500'
            )} />
            <div className="flex-1 space-y-1">
              <p className="font-medium">Performance</p>
              <p className="text-xs text-muted-foreground">
                {getPerformanceExplanation(executionTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <div className="border-t border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-destructive">
                {warnings.length} {warnings.length === 1 ? 'Warnung' : 'Warnungen'}
              </p>
              <ul className="space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-xs text-destructive/80">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

interface QualityTier {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ReactNode
  bgGradient: string
}

/**
 * Determine quality tier from metrics
 */
function getQualityTier(
  confidence: number,
  sourceCount: number,
  patternsFound: number
): QualityTier {
  // Excellent: High confidence, many sources, patterns found
  if (confidence >= 75 && sourceCount >= 10 && patternsFound >= 2) {
    return {
      label: 'Exzellente Forschungsqualität',
      variant: 'default',
      icon: <CheckCircle2 className="h-4 w-4 text-white" />,
      bgGradient: 'from-green-600 to-green-700'
    }
  }

  // Good: Decent confidence, reasonable sources
  if (confidence >= 60 && sourceCount >= 5) {
    return {
      label: 'Gute Forschungsqualität',
      variant: 'default',
      icon: <TrendingUp className="h-4 w-4 text-white" />,
      bgGradient: 'from-blue-600 to-blue-700'
    }
  }

  // Moderate: Lower confidence or few sources
  if (confidence >= 40 || sourceCount >= 3) {
    return {
      label: 'Moderate Forschungsqualität',
      variant: 'secondary',
      icon: <Info className="h-4 w-4 text-white" />,
      bgGradient: 'from-yellow-600 to-yellow-700'
    }
  }

  // Low: Poor metrics
  return {
    label: 'Begrenzte Forschungsqualität',
    variant: 'destructive',
    icon: <AlertCircle className="h-4 w-4 text-white" />,
    bgGradient: 'from-orange-600 to-orange-700'
  }
}

/**
 * Explain confidence score in user-friendly terms
 */
function getConfidenceExplanation(confidence: number, sourceCount: number): string {
  if (confidence >= 75) {
    return `Die analysierten Quellen sind hochrelevant für deine Frage (${sourceCount} Berichte mit durchschnittlich ${confidence}% Übereinstimmung). Patterns basieren auf starken Daten.`
  }

  if (confidence >= 60) {
    return `Die Quellen zeigen gute Relevanz (${sourceCount} Berichte mit ${confidence}% Übereinstimmung). Patterns sind vertrauenswürdig.`
  }

  if (confidence >= 40) {
    return `Die Quellen haben moderate Relevanz (${sourceCount} Berichte mit ${confidence}% Übereinstimmung). Patterns sollten vorsichtig interpretiert werden.`
  }

  return `Die Quellenrelevanz ist begrenzt (${sourceCount} Berichte mit ${confidence}% Übereinstimmung). Eventuell Frage umformulieren für bessere Ergebnisse.`
}

/**
 * Explain execution time performance
 */
function getPerformanceExplanation(executionTime: number): string {
  if (executionTime < 3000) {
    return `Sehr schnelle Analyse in ${formatExecutionTime(executionTime)} – optimale Performance.`
  }

  if (executionTime < 7000) {
    return `Analyse abgeschlossen in ${formatExecutionTime(executionTime)} – gute Performance.`
  }

  return `Ausführung dauerte ${formatExecutionTime(executionTime)} – umfangreiche Pattern-Analyse.`
}

/**
 * Format execution time in human-readable format
 */
function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }

  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}
