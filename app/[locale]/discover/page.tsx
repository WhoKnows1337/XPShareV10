'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  TimelineToolUI,
  MapToolUI,
  NetworkToolUI,
  HeatmapToolUI,
} from '@/components/discover/tool-ui'
import { getRelativeTimestamp, shouldShowDateSeparator, getDateSeparatorText, isMessageGrouped } from '@/lib/utils/message-formatting'
import { TypingIndicator } from '@/components/discover/TypingIndicator'
import { usePersistedChat } from '@/hooks/usePersistedChat'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation'
import { Suggestion } from '@/components/ai-elements/suggestion'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input'
import { Send, Paperclip, Mic } from 'lucide-react'

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
  const isLoading = status === 'submitted' || status === 'streaming'

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
      {/* Header */}
      <div className="py-4 flex items-center justify-between flex-shrink-0">
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

      <Separator className="mb-4 flex-shrink-0" />

      {/* Scrollable Conversation Area */}
      <Conversation className="flex-1 mb-4 overflow-hidden">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              title="Discover Hidden Patterns"
              description="Ask me about patterns, connections, or insights"
            >
              <div className="flex flex-wrap gap-2 justify-center mt-6" role="group" aria-label="Suggested queries">
                {suggestions.map((s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={(suggestion) => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    aria-label={`Ask: ${s}`}
                  />
                ))}
              </div>
            </ConversationEmptyState>
          )}

        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined

          // Use index as fallback for timestamp since AI SDK 5.0 UIMessage doesn't have createdAt
          const messageDate = new Date()
          const showDateSeparator = false // Simplified for now

          // Simplified grouping - group consecutive messages from same role
          const isGrouped = previousMessage?.role === message.role
          const isLastInGroup = nextMessage?.role !== message.role
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

              <Message from={message.role}>
                <div className="flex flex-col gap-1 w-full">
                  {message.parts?.map((part, i) => {
                    // Text part - use Response component for streaming markdown
                    if (part.type === 'text') {
                      return (
                        <MessageContent key={i}>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      )
                    }

                    // Get original user query from previous message for retry
                    const userQuery = previousMessage?.role === 'user'
                      ? previousMessage.parts?.find((p: any) => p.type === 'text')?.text || (part as any).input?.query
                      : (part as any).input?.query

                    // Tool parts - keep existing Tool UI components (type assertions for AI SDK 5.0)
                    if (part.type === 'tool-analyze_timeline') {
                      return <TimelineToolUI key={i} part={part as any} onRetry={() => handleRetry(userQuery)} />
                    }
                    if (part.type === 'tool-analyze_geographic') {
                      return <MapToolUI key={i} part={part as any} onRetry={() => handleRetry(userQuery)} />
                    }
                    if (part.type === 'tool-analyze_network') {
                      return <NetworkToolUI key={i} part={part as any} onRetry={() => handleRetry(userQuery)} />
                    }
                    if (part.type === 'tool-analyze_heatmap') {
                      return <HeatmapToolUI key={i} part={part as any} onRetry={() => handleRetry(userQuery)} />
                    }

                    return null
                  })}

                  {/* Timestamp */}
                  {showTimestamp && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {getRelativeTimestamp(messageDate)}
                    </span>
                  )}
                </div>
              </Message>
            </div>
          )
        })}
          {isLoading && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* Sticky Input Area */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4">
        {/* Persistierende Suggestions - ÜBER der Textbox */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap justify-center" role="group" aria-label="Quick actions">
            {suggestions.map((s) => (
              <Suggestion
                key={s}
                suggestion={s}
                onClick={(suggestion) => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                aria-label={`Ask: ${s}`}
              />
            ))}
          </div>
        )}

        {/* AI Elements PromptInput */}
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault()
            if (!input?.trim() || isLoading) return
            sendMessage({ text: input })
            setInput('')
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about patterns, connections, or insights..."
              disabled={isLoading}
              aria-label="Message input"
              aria-describedby="input-description"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger>
                  <Paperclip className="size-4" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton>
                <Mic className="size-4" />
              </PromptInputSpeechButton>
            </PromptInputTools>
            <PromptInputSubmit disabled={isLoading || !input?.trim()}>
              <Send className="size-4" />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        <p id="input-description" className="sr-only">
          Type your question about patterns, connections, or insights in extraordinary experiences
        </p>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by AI • Data from 40+ categories of extraordinary experiences
        </p>
      </div>
    </div>
  )
}
