'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2, ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { addToSearchHistory } from '@/lib/utils/search-history'

interface AskAIProps {
  initialQuestion?: string
  onQuestionChange?: (question: string) => void
}

interface Source {
  id: string
  title: string
  category: string
  similarity: number
  date_occurred?: string
  location_text?: string
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

export function AskAI({ initialQuestion = '', onQuestionChange }: AskAIProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [response, setResponse] = useState<QAResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          maxSources: 15
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
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
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Question Input */}
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
                className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
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
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
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

          {/* Sources */}
          {response.sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Verwendete Quellen ({response.sources.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {response.sources.map((source, index) => (
                    <div
                      key={source.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                          <Link
                            href={`/experiences/${source.id}`}
                            className="font-medium hover:underline line-clamp-1"
                          >
                            {source.title || 'Ohne Titel'}
                          </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className={getCategoryColor(source.category)}>
                            {source.category}
                          </Badge>
                          {source.location_text && (
                            <span className="flex items-center gap-1">
                              📍 {source.location_text}
                            </span>
                          )}
                          {source.date_occurred && (
                            <span>📅 {new Date(source.date_occurred).toLocaleDateString('de-DE')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Relevanz</div>
                          <div className="text-sm font-semibold">
                            {Math.round(source.similarity * 100)}%
                          </div>
                        </div>
                        <Link href={`/experiences/${source.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
