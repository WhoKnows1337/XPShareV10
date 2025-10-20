'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const isLoading = status === 'submitted' || status === 'streaming'

  const suggestions = [
    'Show me a heatmap of UFO sightings by category',
    'What patterns exist in dreams over time?',
    'Map global UFO sightings',
    'Find connections between NDEs',
  ]


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

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">Discover Hidden Patterns</h2>
            <p className="text-muted-foreground mb-6">Ask me about patterns, connections, or insights</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)} disabled={isLoading}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* User Message */}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <Card className="bg-primary text-primary-foreground px-4 py-2 max-w-[80%]">
                  {message.parts?.map((part) => part.type === 'text' ? part.text : null).join('')}
                </Card>
              </div>
            )}

            {/* Assistant Message */}
            {message.role === 'assistant' && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
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
          <div className="flex justify-start">
            <Card className="px-4 py-2 animate-pulse">Analyzing patterns...</Card>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about patterns, connections, or insights..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input?.trim()}>Send</Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Powered by AI • Data from 40+ categories of extraordinary experiences
      </p>
    </div>
  )
}
