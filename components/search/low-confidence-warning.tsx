'use client'

/**
 * Search 5.0 - Low Confidence Warning
 *
 * Displays actionable warnings when pattern discovery has low confidence.
 * Helps users understand why results may be unreliable and how to improve them.
 *
 * @see docs/masterdocs/search5.md (P0 Feature - Low Confidence Warning)
 */

import React from 'react'
import { AlertCircle, RefreshCw, Plus, Edit3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface LowConfidenceWarningProps {
  /**
   * Confidence score (0-100)
   */
  confidence: number

  /**
   * Number of sources found
   */
  sourceCount: number

  /**
   * Number of patterns discovered
   */
  patternsFound: number

  /**
   * Callback when user clicks "Refine Query"
   */
  onRefineQuery?: () => void

  /**
   * Callback when user dismisses the warning
   */
  onDismiss?: () => void

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LowConfidenceWarning({
  confidence,
  sourceCount,
  patternsFound,
  onRefineQuery,
  onDismiss,
  className
}: LowConfidenceWarningProps) {
  // Only show for confidence < 60%
  if (confidence >= 60) {
    return null
  }

  // ============================================================================
  // SEVERITY LEVEL
  // ============================================================================

  const severity = getSeverityLevel(confidence, sourceCount, patternsFound)

  // ============================================================================
  // ACTIONABLE SUGGESTIONS
  // ============================================================================

  const suggestions = getActionableSuggestions(confidence, sourceCount, patternsFound)

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        severity === 'critical' && 'border-destructive/50 bg-destructive/5',
        severity === 'warning' && 'border-yellow-500/50 bg-yellow-500/5',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 flex items-start justify-between gap-3',
          severity === 'critical' && 'bg-destructive/10',
          severity === 'warning' && 'bg-yellow-500/10'
        )}
      >
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle
            className={cn(
              'h-5 w-5 mt-0.5 flex-shrink-0',
              severity === 'critical' && 'text-destructive',
              severity === 'warning' && 'text-yellow-600'
            )}
          />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">
              {severity === 'critical'
                ? 'Kritisch: Niedrige Ergebnisqualität'
                : 'Warnung: Begrenzte Ergebnisqualität'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {getMainExplanation(confidence, sourceCount, patternsFound)}
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions */}
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Was du tun kannst:</p>

        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                  severity === 'critical'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-yellow-500/10 text-yellow-600'
                )}
              >
                {suggestion.icon}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="font-medium">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {onRefineQuery && (
          <div className="pt-2">
            <Button
              onClick={onRefineQuery}
              size="sm"
              variant={severity === 'critical' ? 'destructive' : 'default'}
              className="w-full"
            >
              <Edit3 className="h-3 w-3 mr-2" />
              Frage verfeinern
            </Button>
          </div>
        )}
      </div>

      {/* Technical Details */}
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Konfidenz: {confidence}%</span>
          <span>Quellen: {sourceCount}</span>
          <span>Patterns: {patternsFound}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

type SeverityLevel = 'critical' | 'warning'

/**
 * Determine severity level based on metrics
 */
function getSeverityLevel(
  confidence: number,
  sourceCount: number,
  patternsFound: number
): SeverityLevel {
  // Critical: Very low confidence or very few sources
  if (confidence < 40 || sourceCount < 3 || patternsFound === 0) {
    return 'critical'
  }

  // Warning: Moderate confidence
  return 'warning'
}

/**
 * Get main explanation text
 */
function getMainExplanation(
  confidence: number,
  sourceCount: number,
  patternsFound: number
): string {
  if (patternsFound === 0) {
    return `Es wurden keine Patterns gefunden. Dies könnte an einer zu spezifischen Frage oder zu wenigen relevanten Quellen liegen.`
  }

  if (sourceCount < 3) {
    return `Es wurden nur ${sourceCount} relevante Quellen gefunden. Mehr Daten würden die Aussagekraft erhöhen.`
  }

  if (confidence < 40) {
    return `Die Quellen haben nur ${confidence}% Übereinstimmung mit deiner Frage. Die Ergebnisse sollten vorsichtig interpretiert werden.`
  }

  return `Die Quellenrelevanz ist mit ${confidence}% begrenzt. Die Patterns könnten unzuverlässig sein.`
}

interface Suggestion {
  icon: React.ReactNode
  title: string
  description: string
}

/**
 * Generate actionable suggestions based on metrics
 */
function getActionableSuggestions(
  confidence: number,
  sourceCount: number,
  patternsFound: number
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Low confidence → Refine query
  if (confidence < 50) {
    suggestions.push({
      icon: <Edit3 className="h-3 w-3" />,
      title: 'Frage umformulieren',
      description:
        'Versuche konkretere oder allgemeinere Begriffe. Beispiel: statt "grüne Lichter" → "Farben von UFOs"'
    })
  }

  // Few sources → Broaden search
  if (sourceCount < 5) {
    suggestions.push({
      icon: <Plus className="h-3 w-3" />,
      title: 'Suchbereich erweitern',
      description:
        'Entferne Filter (Kategorie, Zeitraum, Ort) oder erhöhe die maximale Quellenzahl auf 20+'
    })
  }

  // No patterns → Different approach
  if (patternsFound === 0) {
    suggestions.push({
      icon: <RefreshCw className="h-3 w-3" />,
      title: 'Anderen Ansatz versuchen',
      description:
        'Stelle eine offenere Frage wie "Was sind häufige Merkmale?" statt nach spezifischen Details zu fragen'
    })
  }

  // Moderate issues → Try synonyms
  if (confidence >= 40 && confidence < 60) {
    suggestions.push({
      icon: <RefreshCw className="h-3 w-3" />,
      title: 'Synonyme verwenden',
      description: 'Nutze alternative Begriffe (z.B. "Begegnung" statt "Sichtung")'
    })
  }

  return suggestions
}
