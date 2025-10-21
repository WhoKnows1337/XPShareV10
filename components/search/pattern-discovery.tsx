'use client'

/**
 * Search 5.0 - Pattern Discovery Component
 *
 * Replaces old RAG-based AskAI for Search 5.0 pattern discovery.
 * Uses /api/chat with generateObject() to find patterns in experiences.
 *
 * Features:
 * - Progressive loading indicators (3 stages)
 * - Pattern Cards with Framer Motion animations
 * - Serendipity detection and display
 * - Follow-up question suggestions
 * - Source citations
 *
 * @see docs/masterdocs/search5.md
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { ProgressivePatternGrid } from './progressive-pattern-grid'
import { SerendipityCard } from './serendipity-card'
import { SummaryCard } from './summary-card'
import { RelatedExperiences } from './related-experiences'
import { PartialMatchWarning } from './partial-match-warning'
import { ProgressiveLoadingIndicator } from './loading-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Pattern, Source, SerendipityConnection, Search5Response } from '@/types/search5'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface PatternDiscoveryProps {
  /**
   * The question to analyze (auto-submits when changes)
   */
  initialQuestion?: string

  /**
   * Filter parameters for the search
   */
  filters?: {
    category?: string
    tags?: string
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }

  /**
   * Hide input field (when used with external search bar)
   */
  hideInput?: boolean

  /**
   * Auto-submit when initialQuestion changes
   */
  autoSubmit?: boolean
}

interface FollowUpSuggestion {
  question: string
  category?: string
  reason: string
}

// Use Search5Response from types/search5.ts (includes all metadata fields)
type PatternDiscoveryResponse = Search5Response

// ============================================================================
// COMPONENT
// ============================================================================

export function PatternDiscovery({
  initialQuestion = '',
  filters,
  hideInput = false,
  autoSubmit = true
}: PatternDiscoveryProps) {
  // State
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<PatternDiscoveryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastSubmittedQuestion = useRef<string>('')

  // Auto-submit when initialQuestion changes
  useEffect(() => {
    if (autoSubmit && initialQuestion && initialQuestion.trim().length >= 5) {
      // Only submit if different from last submitted
      if (initialQuestion !== lastSubmittedQuestion.current) {
        lastSubmittedQuestion.current = initialQuestion
        handleSubmit(initialQuestion)
      }
    }
  }, [initialQuestion, autoSubmit])

  // Handle pattern discovery request
  const handleSubmit = async (question: string) => {
    if (!question || question.trim().length < 5) {
      setError('Frage muss mindestens 5 Zeichen lang sein')
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: question
            }
          ],
          maxSources: 15,
          ...filters
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))

        // Handle rate limit
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After')
          throw new Error(
            errorData.message ||
            `Rate limit überschritten. Bitte warte ${retryAfter || '60'} Sekunden.`
          )
        }

        throw new Error(errorData.error || 'Pattern discovery fehlgeschlagen')
      }

      const data: PatternDiscoveryResponse = await res.json()
      setResponse(data)
    } catch (err: any) {
      console.error('Pattern discovery error:', err)
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle follow-up question click
  const handleFollowUpClick = (suggestion: FollowUpSuggestion) => {
    handleSubmit(suggestion.question)
  }

  // Handle serendipity exploration
  const handleExploreSerendipity = (targetCategory: string) => {
    // Re-run search with serendipity category filter
    handleSubmit(initialQuestion)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Partial Match Warning */}
      {response && response.metadata.hasPartialMatchesOnly && response.metadata.warnings.length > 0 && (
        <PartialMatchWarning
          keywords={response.metadata.warnings[0]
            .match(/"([^"]+)"/)?.[1]
            ?.split(', ') || []}
          delay={0.05}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <ProgressiveLoadingIndicator />
      )}

      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {response && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Metadata Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {response.metadata.patternsFound} {response.metadata.patternsFound === 1 ? 'Muster' : 'Muster'} entdeckt
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Aus {response.metadata.sourceCount} {response.metadata.sourceCount === 1 ? 'Erfahrung' : 'Erfahrungen'} analysiert
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Konfidenz</div>
                        <Badge variant={response.metadata.confidence >= 70 ? 'default' : response.metadata.confidence >= 40 ? 'secondary' : 'outline'} className="font-mono text-base">
                          {response.metadata.confidence}%
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Ausführungszeit</div>
                        <div className="text-sm font-medium">{(response.metadata.executionTime / 1000).toFixed(1)}s</div>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {response.metadata.warnings && response.metadata.warnings.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {response.metadata.warnings.map((warning, i) => (
                        <Alert key={i} variant="default" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Summary Text */}
            {response.summary && (
              <SummaryCard
                summary={response.summary}
                delay={0.15}
              />
            )}

            {/* Serendipity Card */}
            {response.serendipity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <SerendipityCard
                  serendipity={response.serendipity}
                  primaryCategory={filters?.category}
                  onExplore={handleExploreSerendipity}
                />
              </motion.div>
            )}

            {/* Pattern Grid */}
            {response.patterns.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <ProgressivePatternGrid
                  patterns={response.patterns}
                  sources={response.sources}
                  initialLimit={3}
                  loadMoreIncrement={3}
                  showControls={true}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Keine Muster gefunden</AlertTitle>
                  <AlertDescription>
                    Für diese Frage konnten keine klaren Muster in den Erfahrungen identifiziert werden.
                    Versuche die Frage umzuformulieren oder verwende andere Filter.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Follow-up Suggestions */}
            {response.followUpSuggestions && response.followUpSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Vorgeschlagene Follow-up Fragen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {response.followUpSuggestions.map((suggestion, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.3 }}
                        >
                          <button
                            onClick={() => handleFollowUpClick(suggestion)}
                            className={cn(
                              "w-full text-left p-4 rounded-lg border transition-all",
                              "hover:border-blue-500 hover:shadow-md hover:scale-[1.02]",
                              "bg-gradient-to-r from-blue-500/5 to-transparent"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-sm mb-1">
                                  {suggestion.question}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {suggestion.reason}
                                </p>
                              </div>
                              {suggestion.category && (
                                <Badge variant="outline" className="flex-shrink-0 text-xs">
                                  {suggestion.category}
                                </Badge>
                              )}
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Related Experiences */}
            {response.sources && response.sources.length > 0 && (
              <RelatedExperiences
                sources={response.sources}
                initialLimit={5}
                loadMoreIncrement={5}
                delay={0.5}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
