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
  const { messages, sendMessage, status } = useChat({
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

  return (
    <div className="container mx-auto h-screen flex flex-col p-4 max-w-5xl">
      <div className="py-4">
        <h1 className="text-3xl font-bold">AI Discovery</h1>
        <p className="text-muted-foreground mt-1">
          Explore patterns, connections, and insights in extraordinary experiences
        </p>
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

        {messages.map((message) => (
          <div key={message.id} className="space-y-2" role="article" aria-label={`${message.role} message`}>
            {/* User Message */}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <Card className="bg-primary text-primary-foreground px-4 py-2 max-w-[80%]" role="region" aria-label="Your message">
                  {message.parts?.map((part) => part.type === 'text' ? part.text : null).join('')}
                </Card>
              </div>
            )}

            {/* Assistant Message */}
            {message.role === 'assistant' && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2" role="region" aria-label="AI response">
                  {message.parts?.map((part, i) => {
                    // Text part
                    if (part.type === 'text') {
                      return (
                        <Card key={i} className="px-4 py-2 whitespace-pre-wrap">
                          {part.text}
                        </Card>
                      )
                    }

                    // Typed tool parts with automatic state handling
                    if (part.type === 'tool-analyze_timeline') {
                      return <TimelineToolUI key={i} part={part} />
                    }
                    if (part.type === 'tool-analyze_geographic') {
                      return <MapToolUI key={i} part={part} />
                    }
                    if (part.type === 'tool-analyze_network') {
                      return <NetworkToolUI key={i} part={part} />
                    }
                    if (part.type === 'tool-analyze_heatmap') {
                      return <HeatmapToolUI key={i} part={part} />
                    }

                    return null
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite" aria-label="Processing">
            <Card className="px-4 py-2 animate-pulse">Analyzing patterns...</Card>
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
