'use client'

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Message List Component
 * Displays conversation history with user and AI messages
 * Features: Auto-scroll, message grouping, component rendering
 * Used in /app/discover/page.tsx
 */

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string | React.ReactNode
  timestamp?: Date
}

export interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  onSuggestionClick?: (suggestion: string) => void
}

export function MessageList({ messages, isLoading = false, onSuggestionClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.length === 0 && !isLoading && (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && <LoadingMessage />}

      <div ref={bottomRef} />
    </div>
  )
}

/**
 * Individual Message Bubble
 */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        {/* Role Label */}
        <p className="text-xs text-muted-foreground mb-1">
          {isUser ? 'You' : 'XPShare AI'}
        </p>

        {/* Message Bubble */}
        {typeof message.content === 'string' ? (
          <Card
            className={cn(
              'p-4',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </Card>
        ) : (
          // Render React components (visualizations, insights, etc.)
          <div className="w-full">{message.content}</div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Loading Message (while AI is thinking)
 */
function LoadingMessage() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">XPShare AI</p>
        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-sm text-muted-foreground">
              Analyzing patterns...
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Empty State (no messages yet)
 */
function EmptyState({ onSuggestionClick }: { onSuggestionClick?: (suggestion: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-primary/10 p-6 rounded-full mb-4">
        <Bot className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">
        Discover Hidden Patterns
      </h2>
      <p className="text-muted-foreground max-w-md">
        Ask me about patterns, connections, or insights in extraordinary experiences.
        I can search, analyze sentiment, detect patterns, and create visualizations.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
        <ExampleQuery query="Show me UFO sightings in Europe" onClick={onSuggestionClick} />
        <ExampleQuery query="What patterns exist in dreams?" onClick={onSuggestionClick} />
        <ExampleQuery query="Find connections between NDEs" onClick={onSuggestionClick} />
        <ExampleQuery query="Analyze sentiment trends over time" onClick={onSuggestionClick} />
      </div>
    </div>
  )
}

function ExampleQuery({ query, onClick }: { query: string; onClick?: (suggestion: string) => void }) {
  return (
    <Card 
      className="p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(query)}
    >
      <p className="text-sm">{query}</p>
    </Card>
  )
}
