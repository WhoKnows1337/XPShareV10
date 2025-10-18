'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addToSearchHistory } from '@/lib/utils/search-history'
import { RAGCitationCard } from './rag-citation-card'
import { motion } from 'framer-motion'

interface AskAIProps {
  initialQuestion?: string
  onQuestionChange?: (question: string) => void
  hideInput?: boolean // Hide the input field (when used with external search bar)
  filters?: {
    category?: string
    tags?: string
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }
}

interface Source {
  id: string
  title: string
  excerpt?: string
  fullText?: string
  category: string
  similarity: number
  date_occurred?: string
  location_text?: string
  attributes?: string[]
}

interface QAResponse {
  answer: string
  sources: Source[]
  confidence: number
  totalSources: number
  meta?: {
    question: string
    executionTime: number
    model: string
    avgSimilarity: number
  }
}

export function AskAI({ initialQuestion = '', onQuestionChange, hideInput = false, filters }: AskAIProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [response, setResponse] = useState<QAResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevQuestionRef = useRef<string>('')

  const handleQuestionChange = (newQuestion: string) => {
    setQuestion(newQuestion)
    onQuestionChange?.(newQuestion)
  }


  const exampleQuestions = [
    'Welche Gemeinsamkeiten haben UFO-Sichtungen am Bodensee?',
    'Wie beschreiben Menschen ihre Nahtoderfahrungen?',
    'Was passiert während einer Ayahuasca-Zeremonie?',
    'Welche Farben werden bei UFO-Sichtungen am häufigsten berichtet?',
    'Gibt es Muster bei luziden Träumen?',
  ]

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!question.trim() || question.trim().length < 5) {
      setError('Bitte gib eine Frage mit mindestens 5 Zeichen ein')
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          maxSources: 15,
          // Include filters if provided
          ...(filters?.category && filters.category !== 'all' && { category: filters.category }),
          ...(filters?.tags && { tags: filters.tags }),
          ...(filters?.location && { location: filters.location }),
          ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
          ...(filters?.dateTo && { dateTo: filters.dateTo }),
          ...(filters?.witnessesOnly && { witnessesOnly: filters.witnessesOnly }),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Q&A failed')
      }

      const data = await res.json()
      setResponse(data)

      // Save to search history
      try {
        addToSearchHistory(question.trim(), 'ask', undefined, data.sources?.length || 0)
      } catch (e) {
        console.error('Failed to save to history:', e)
      }
    } catch (err: any) {
      console.error('Q&A error:', err)
      setError(err.message || 'Fehler beim Beantworten der Frage. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-submit when initialQuestion changes and hideInput is true
  useEffect(() => {
    if (hideInput && initialQuestion && initialQuestion.trim().length >= 5) {
      // Check if question actually changed - prevent duplicate submissions
      if (initialQuestion === prevQuestionRef.current) {
        return
      }

      // Update ref to track this question
      prevQuestionRef.current = initialQuestion

      // Reset state for new question
      setResponse(null)
      setError(null)
      setQuestion(initialQuestion)

      // Debounced auto-submit - wait for user to finish typing
      const timer = setTimeout(() => {
        handleAsk()
      }, 1200) // Increased from 100ms to 1200ms for proper debouncing
      return () => clearTimeout(timer)
    }
  }, [initialQuestion, hideInput])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  return (
    <div className="space-y-6">
      {/* Question Input - Only show if not hidden */}
      {!hideInput && (
        <>
          <form onSubmit={handleAsk} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                <Input
                  type="text"
                  placeholder="Stelle eine Frage über Erfahrungen... z.B. 'Welche Gemeinsamkeiten haben UFO-Sichtungen?'"
                  value={question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading || question.trim().length < 5}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Fragen
              </Button>
            </div>
          </form>

          {/* Example Questions */}
          {!response && !isLoading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Beispielfragen:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuestionChange(example)}
                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left transition-all hover:scale-105 hover:shadow-md"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 border border-destructive bg-destructive/10 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Answer Display */}
      {response && (
        <div className="space-y-4">
          {/* Answer Card */}
          <Card className="border-blue-500/30">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Antwort</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Konfidenz</div>
                    <div className={cn('text-lg font-bold', getConfidenceColor(response.confidence))}>
                      {response.confidence}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Quellen</div>
                    <div className="text-lg font-bold">{response.totalSources}</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{response.answer}</div>
              </div>

              {/* Metadata */}
              {response.meta && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Modell:</span> {response.meta.model}
                    </div>
                    <div>
                      <span className="font-medium">Ausführungszeit:</span> {response.meta.executionTime}ms
                    </div>
                    <div>
                      <span className="font-medium">Ø Ähnlichkeit:</span>{' '}
                      {Math.round(response.meta.avgSimilarity * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sources with RAG Citations */}
          {response.sources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold">
                  Verwendete Quellen ({response.sources.length})
                </h3>
              </div>
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08, // 80ms delay between cards
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {response.sources.map((source) => (
                  <motion.div
                    key={source.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <RAGCitationCard
                      source={{
                        ...source,
                        excerpt: source.excerpt || source.title || 'No excerpt available',
                      }}
                      query={question}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
