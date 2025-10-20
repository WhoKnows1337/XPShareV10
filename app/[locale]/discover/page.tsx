'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef } from 'react'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown } from 'lucide-react'
import {
  TimelineToolUI,
  MapToolUI,
  NetworkToolUI,
  HeatmapToolUI,
} from '@/components/discover/tool-ui'
import { getRelativeTimestamp, shouldShowDateSeparator, getDateSeparatorText, isMessageGrouped } from '@/lib/utils/message-formatting'
import { TypingIndicator } from '@/components/discover/TypingIndicator'
import { usePersistedChat } from '@/hooks/usePersistedChat'

/**
 * AI Discovery Interface
 * Using AI SDK UI (useChat) - Recommended approach for streaming with visualizations
 *
 * Features:
 * - Client-side streaming with useChat
 * - Tool calling with visualization rendering
 * - No RSC Client Manifest issues
 */

export default function DiscoverPage() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/discover',
    }),
  })
  const [input, setInput] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isLoading = status === 'submitted' || status === 'streaming'
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    'Show me a heatmap of UFO sightings by category',
    'What patterns exist in dreams over time?',
    'Map global UFO sightings',
    'Find connections between NDEs',
  ]

  // Conversation Persistence
  const { clearHistory, exportHistory } = usePersistedChat({
    messages,
    onRestore: (restored) => {
      setMessages(restored)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isLoading || messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  // Handle scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setShowScrollButton(!isAtBottom && messages.length > 0)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input?.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return
    sendMessage({ text: suggestion })
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the conversation history?')) {
      clearHistory()
      setMessages([])
    }
  }

  const handleRetry = (query: string) => {
    if (isLoading) return
    sendMessage({ text: query })
  }

  return (
    <div className="container mx-auto h-screen flex flex-col p-4 max-w-5xl">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Explore patterns, connections, and insights in extraordinary experiences
          </p>
        </div>
        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              aria-label="Export conversation"
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              aria-label="Clear conversation history"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <Separator className="mb-4" />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 relative scroll-smooth"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {messages.length === 0 && (
          <div className="text-center py-12" role="region" aria-label="Getting started">
            <h2 className="text-xl font-bold mb-4">Discover Hidden Patterns</h2>
            <p className="text-muted-foreground mb-6">Ask me about patterns, connections, or insights</p>
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Suggested queries">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isLoading}
                  aria-label={`Ask: ${s}`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined
          const messageDate = new Date(message.createdAt || Date.now())
          const showDateSeparator = shouldShowDateSeparator(
            messageDate,
            previousMessage?.createdAt ? new Date(previousMessage.createdAt) : undefined
          )

          // Message Grouping Logic
          const isGrouped = isMessageGrouped(message, previousMessage)
          const isLastInGroup = !isMessageGrouped(nextMessage || { role: '', createdAt: Date.now() }, message)
          const showTimestamp = isLastInGroup

          return (
            <div key={message.id} className={isGrouped ? 'mt-1' : 'mt-4'}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                    {getDateSeparatorText(messageDate)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <div role="article" aria-label={`${message.role} message`}>
                {/* User Message */}
                {message.role === 'user' && (
                  <div className="flex justify-end items-end gap-2">
                    <div className="flex flex-col items-end">
                      <Card className="bg-primary text-primary-foreground px-4 py-2 max-w-[80%]" role="region" aria-label="Your message">
                        {message.parts?.map((part) => part.type === 'text' ? part.text : null).join('')}
                      </Card>
                      {showTimestamp && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {getRelativeTimestamp(messageDate)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {message.role === 'assistant' && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="flex flex-col items-start max-w-[90%]">
                      <div className="space-y-2" role="region" aria-label="AI response">
                        {message.parts?.map((part, i) => {
                          // Text part
                          if (part.type === 'text') {
                            return (
                              <Card key={i} className="px-4 py-2 whitespace-pre-wrap">
                                {part.text}
                              </Card>
                            )
                          }

                          // Get original user query from previous message
                          const userQuery = previousMessage?.role === 'user'
                            ? previousMessage.parts?.find(p => p.type === 'text')?.text || part.input.query
                            : part.input.query

                          // Typed tool parts with automatic state handling
                          if (part.type === 'tool-analyze_timeline') {
                            return <TimelineToolUI key={i} part={part} onRetry={() => handleRetry(userQuery)} />
                          }
                          if (part.type === 'tool-analyze_geographic') {
                            return <MapToolUI key={i} part={part} onRetry={() => handleRetry(userQuery)} />
                          }
                          if (part.type === 'tool-analyze_network') {
                            return <NetworkToolUI key={i} part={part} onRetry={() => handleRetry(userQuery)} />
                          }
                          if (part.type === 'tool-analyze_heatmap') {
                            return <HeatmapToolUI key={i} part={part} onRetry={() => handleRetry(userQuery)} />
                          }

                          return null
                        })}
                      </div>
                      {showTimestamp && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {getRelativeTimestamp(messageDate)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-24 right-8 rounded-full shadow-lg z-10 animate-in fade-in slide-in-from-bottom-4"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2" role="search" aria-label="Ask a question">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about patterns, connections, or insights..."
          disabled={isLoading}
          className="flex-1"
          aria-label="Message input"
          aria-describedby="input-description"
        />
        <Button
          type="submit"
          disabled={isLoading || !input?.trim()}
          aria-label={isLoading ? 'Processing...' : 'Send message'}
        >
          Send
        </Button>
      </form>
      <p id="input-description" className="sr-only">
        Type your question about patterns, connections, or insights in extraordinary experiences
      </p>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Powered by AI • Data from 40+ categories of extraordinary experiences
      </p>
    </div>
  )
}
