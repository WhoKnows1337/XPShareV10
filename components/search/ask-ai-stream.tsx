'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThinkingIndicator } from './thinking-indicator'
import { StreamingAnswer } from './streaming-answer'
import { ConfidenceScoreTooltip } from './confidence-score-tooltip'
import { RAGCitationCard } from './rag-citation-card'
import { addToSearchHistory } from '@/lib/utils/search-history'
import { Source } from '@/types/ai-answer'

interface AskAIStreamProps {
  initialQuestion?: string
  onQuestionChange?: (question: string) => void
  hideInput?: boolean
  autoSubmit?: boolean
  filters?: {
    category?: string
    tags?: string
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }
}

/**
 * AI-Powered Q&A Component using AI SDK 5.0 Best Practices
 *
 * Pattern: External State Management + sendMessage()
 * - Follows official Vercel AI SDK 5.0 recommendations
 * - Single unified flow for both hideInput modes
 * - Programmatic message sending via sendMessage()
 */
export function AskAIStream({
  initialQuestion = '',
  onQuestionChange,
  hideInput = false,
  autoSubmit = true,
  filters,
}: AskAIStreamProps) {
  // ✅ External State Management (AI SDK 5.0 Best Practice)
  const [input, setInput] = useState(initialQuestion)
  const [sources, setSources] = useState<Source[]>([])
  const [confidence, setConfidence] = useState<number>(0)
  const lastSentQuestion = useRef<string>('')

  // Custom transport that extends DefaultChatTransport to extract response headers
  const customTransport = new DefaultChatTransport({
    api: '/api/chat',
    body: {
      maxSources: 15,
      ...(filters?.category && filters.category !== 'all' && { category: filters.category }),
      ...(filters?.tags && { tags: filters.tags }),
      ...(filters?.location && { location: filters.location }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
      ...(filters?.witnessesOnly && { witnessesOnly: filters.witnessesOnly }),
    },
    fetch: async (url, options) => {
      const response = await fetch(url, options)

      // Extract metadata from response headers
      const sourcesCount = response.headers.get('X-QA-Sources-Count')
      const confidenceScore = response.headers.get('X-QA-Confidence')
      const sourcesData = response.headers.get('X-QA-Sources')

      if (confidenceScore) {
        setConfidence(parseInt(confidenceScore, 10))
      }

      if (sourcesData) {
        try {
          const parsedSources = JSON.parse(sourcesData) as Source[]
          setSources(parsedSources)
        } catch (e) {
          console.error('Failed to parse sources:', e)
        }
      }

      // Save to search history
      try {
        addToSearchHistory(input, 'ask', undefined, parseInt(sourcesCount || '0', 10))
      } catch (e) {
        console.error('Failed to save to history:', e)
      }

      return response
    },
  })

  // ✅ useChat with sendMessage (Official AI SDK 5.0 Pattern)
  const { messages, sendMessage, status, error } = useChat({
    transport: customTransport,
  })

  // Auto-submit when initialQuestion changes (for hideInput mode)
  useEffect(() => {
    if (hideInput && autoSubmit && initialQuestion && initialQuestion.trim().length >= 5) {
      // Only send if different from last sent question
      if (initialQuestion !== lastSentQuestion.current) {
        lastSentQuestion.current = initialQuestion
        setInput(initialQuestion)
        // ✅ Programmatic message sending with sendMessage()
        sendMessage({ text: initialQuestion })
      }
    }
  }, [initialQuestion, hideInput, autoSubmit, sendMessage])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim().length >= 5) {
      // ✅ Send message programmatically
      sendMessage({ text: input })
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    // Only call onQuestionChange if not in hideInput mode
    if (!hideInput) {
      onQuestionChange?.(newValue)
    }
  }

  // Handle example question click
  const handleExampleClick = (question: string) => {
    setInput(question)
    onQuestionChange?.(question)
    // ✅ Send message directly
    sendMessage({ text: question })
  }

  // Get latest assistant message for display
  const latestMessage = messages.filter((m) => m.role === 'assistant').pop()
  const displayAnswer = latestMessage?.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as any).text)
    .join('') || ''

  const isStreaming = status === 'streaming' || status === 'submitted'

  // Example questions
  const exampleQuestions = [
    'Welche Gemeinsamkeiten haben UFO-Sichtungen am Bodensee?',
    'Wie beschreiben Menschen ihre Nahtoderfahrungen?',
    'Was passiert während einer Ayahuasca-Zeremonie?',
    'Welche Farben werden bei UFO-Sichtungen am häufigsten berichtet?',
    'Gibt es Muster bei luziden Träumen?',
  ]

  return (
    <div className="space-y-6">
      {/* Question Input - Only show if not hidden */}
      {!hideInput && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                <Input
                  type="text"
                  placeholder="Stelle eine Frage über Erfahrungen... z.B. 'Welche Gemeinsamkeiten haben UFO-Sichtungen?'"
                  value={input}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isStreaming}
                />
              </div>

              <Button type="submit" disabled={isStreaming || input.trim().length < 5}>
                {isStreaming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Fragen
              </Button>
            </div>
          </form>

          {/* Example Questions */}
          {!displayAnswer && !isStreaming && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Beispielfragen:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
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
          {error.message || 'Fehler beim Beantworten der Frage. Bitte versuche es erneut.'}
        </div>
      )}

      {/* Loading State */}
      {isStreaming && !displayAnswer && <ThinkingIndicator state="generating_answer" />}

      {/* Answer Display */}
      {displayAnswer && (
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
                  {confidence > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Konfidenz</div>
                      <ConfidenceScoreTooltip confidence={confidence} />
                    </div>
                  )}
                  {sources.length > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Quellen</div>
                      <div className="text-lg font-bold">{sources.length}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StreamingAnswer
                content={displayAnswer}
                sources={sources}
                isStreaming={isStreaming}
              />
            </CardContent>
          </Card>

          {/* Sources Section */}
          {sources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold">Verwendete Quellen ({sources.length})</h3>
              </div>
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {sources.map((source) => (
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
                      query={input}
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
