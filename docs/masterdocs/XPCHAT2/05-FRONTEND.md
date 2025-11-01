# XPChat Frontend

**Main Page:** `app/[locale]/xpchat/page.tsx`
**Components:** `components/xpchat/*`
**Framework:** Next.js 15, React 19, AI SDK 5.0

---

## Overview

The XPChat frontend provides:

- ✅ **AI SDK useChat Hook**: SSE streaming integration
- ✅ **Message Rendering**: User/assistant messages with markdown
- ✅ **Tool Visualization**: Interactive charts, maps, tables
- ✅ **Thinking Indicator**: Extended Thinking transparency
- ✅ **Responsive Design**: Mobile + desktop
- ✅ **Accessibility**: ARIA labels, keyboard navigation

---

## Architecture

```
app/[locale]/xpchat/page.tsx
         │
         ├─ useChat hook (AI SDK)
         │  └─ POST /api/xpchat
         │
         ├─ Message[] component
         │  ├─ User messages (right-aligned)
         │  ├─ Assistant messages (left-aligned)
         │  └─ Tool invocations
         │     └─ ToolRenderer
         │        ├─ ResultsList
         │        ├─ MapView
         │        ├─ TimelineView
         │        ├─ NetworkView
         │        ├─ DashboardView
         │        ├─ AnalysisView
         │        └─ ... (8 tool views)
         │
         ├─ ThinkingIndicator (Extended Thinking)
         │
         └─ ChatInput component
            ├─ Textarea (auto-resize)
            ├─ Submit button
            └─ Example suggestions
```

---

## Main Page Component

```typescript
// app/[locale]/xpchat/page.tsx

'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { Message } from '@/components/xpchat/Message'
import { ChatInput } from '@/components/xpchat/ChatInput'
import { ThinkingIndicator } from '@/components/xpchat/ThinkingIndicator'
import { WelcomeOverlay } from '@/components/xpchat/WelcomeOverlay'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function XPChatPage() {
  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState(true)

  // Thread ID for conversation memory (optional)
  const [threadId] = useState<string | undefined>(undefined)

  // AI SDK useChat hook
  const {
    messages,
    input,
    setInput,
    append,
    isLoading,
    error,
  } = useChat({
    api: '/api/xpchat',
    streamProtocol: 'data',
    body: {
      threadId,
      locale: 'de',
    },
    initialMessages: [],
  })

  // Hide welcome screen after first message
  const handleStartChat = (query: string) => {
    setShowWelcome(false)
    append({
      role: 'user',
      content: query,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                XPChat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                KI-gestützte Erlebnis-Entdeckung
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden sm:inline">Claude 3.7 Sonnet</span>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Overlay (First-time users) */}
      {showWelcome && messages.length === 0 && (
        <WelcomeOverlay onStartChat={handleStartChat} />
      )}

      {/* Messages Container */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6 mb-32">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {/* Thinking Indicator */}
          {isLoading && messages.length > 0 && (
            <ThinkingIndicator />
          )}

          {/* Error Display */}
          {error && (
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-400 text-sm">
                ⚠️ Fehler: {error.message}
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Chat Input (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={(text) => {
              setShowWelcome(false)
              append({
                role: 'user',
                content: text,
              })
            }}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
```

---

## Message Component

```typescript
// components/xpchat/Message.tsx

import { type Message as AIMessage } from '@ai-sdk/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, User, Bot } from 'lucide-react'
import { ToolRenderer } from './ToolRenderer'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type MessageProps = {
  message: AIMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <Card
        className={`flex-1 p-4 ${
          isUser
            ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
            : 'bg-white dark:bg-gray-800'
        }`}
      >
        {/* Text Content */}
        {message.content && (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Tool Invocations */}
        {message.toolInvocations?.map((toolInvocation, index) => (
          <ToolRenderer key={index} toolInvocation={toolInvocation} />
        ))}

        {/* Copy Button */}
        {!isUser && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(message.content)
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Kopieren
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
```

---

## ChatInput Component

```typescript
// components/xpchat/ChatInput.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  loading: boolean
}

const EXAMPLE_QUERIES = [
  'Zeig mir UFO Sichtungen in Deutschland',
  'Analysiere Traum-Erlebnisse der letzten 6 Monate',
  'Vergleiche paranormale Erfahrungen in Berlin vs Paris',
  'Erstelle eine Karte aller Erlebnisse in Europa',
  'Finde ähnliche Erlebnisse wie meins',
]

export function ChatInput({ value, onChange, onSubmit, loading }: ChatInputProps) {
  const [showExamples, setShowExamples] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value])

  const handleSubmit = () => {
    if (value.trim() && !loading) {
      onSubmit(value)
      onChange('')
      setShowExamples(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-3">
      {/* Example Suggestions */}
      {showExamples && !value && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(query)
                setShowExamples(false)
              }}
              className="text-xs"
            >
              {query}
            </Button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stell mir eine Frage über XPShare Erlebnisse..."
          disabled={loading}
          className="min-h-[60px] max-h-[200px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          size="icon"
          className="h-[60px] w-[60px] shrink-0"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Hint Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Drücke <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">
          Enter
        </kbd>{' '}
        zum Senden, <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">
          Shift + Enter
        </kbd>{' '}
        für neue Zeile
      </p>
    </div>
  )
}
```

---

## ThinkingIndicator Component

```typescript
// components/xpchat/ThinkingIndicator.tsx

'use client'

import { Card } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'

export function ThinkingIndicator() {
  return (
    <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Denke nach...
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Extended Thinking Mode aktiv
          </p>
        </div>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    </Card>
  )
}
```

---

## WelcomeOverlay Component

**Purpose:** Onboarding screen for first-time users with category-based discovery.

```typescript
// components/xpchat/WelcomeOverlay.tsx

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryCard } from './CategoryCard'
import { Sparkles, TrendingUp } from 'lucide-react'

type WelcomeOverlayProps = {
  onStartChat: (query: string) => void
}

export function WelcomeOverlay({ onStartChat }: WelcomeOverlayProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Powered by Claude 3.7 Sonnet
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Entdecke Muster in außergewöhnlichen Erlebnissen
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Frage mich nach UFO-Sichtungen, Träumen, psychischen Erfahrungen und mehr.
          Ich helfe dir, versteckte Zusammenhänge zu finden.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        <CategoryCard
          icon="🛸"
          title="UFO Sichtungen"
          description="Entdecke geografische Cluster & Wellen"
          exampleQuery="Zeig mir UFO-Sichtungen in Deutschland"
          onSelect={onStartChat}
        />

        <CategoryCard
          icon="💭"
          title="Träume"
          description="Finde wiederkehrende Symbole & Themen"
          exampleQuery="Analysiere Traum-Muster der letzten 6 Monate"
          onSelect={onStartChat}
        />

        <CategoryCard
          icon="🧠"
          title="Psychische Erfahrungen"
          description="Vergleiche telepathische & präkognitive Ereignisse"
          exampleQuery="Zeig mir psychische Erlebnisse in Europa"
          onSelect={onStartChat}
        />

        <CategoryCard
          icon="✨"
          title="Synchronizitäten"
          description="Erkenne bedeutsame Zufälle"
          exampleQuery="Finde ähnliche Synchronizitäten wie meins"
          onSelect={onStartChat}
        />

        <CategoryCard
          icon="👁️"
          title="Nahtoderfahrungen"
          description="Analysiere NDE-Berichte & Gemeinsamkeiten"
          exampleQuery="Vergleiche Nahtoderfahrungen weltweit"
          onSelect={onStartChat}
        />

        <CategoryCard
          icon="🌀"
          title="Alle Kategorien"
          description="Kategorie-übergreifende Muster"
          exampleQuery="Zeig mir alle außergewöhnlichen Erlebnisse in Berlin"
          onSelect={onStartChat}
        />
      </div>

      {/* Popular Discoveries */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Beliebte Entdeckungen diese Woche
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            onClick={() => onStartChat('UFO-Sichtungen korrelieren mit Sonnenstürmen')}
          >
            🌞 UFO-Sichtungen & Sonnenstürme
          </Badge>

          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            onClick={() => onStartChat('Zeitanomalien häufen sich in Berlin')}
          >
            ⏰ Zeitanomalien in Berlin
          </Badge>

          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
            onClick={() => onStartChat('Traummuster zwischen 22-04 Uhr')}
          >
            🌙 Nächtliche Traummuster
          </Badge>

          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            onClick={() => onStartChat('Psychische Erfahrungen bei Vollmond')}
          >
            🌕 Vollmond-Korrelationen
          </Badge>
        </div>
      </Card>

      {/* Quick Start Tip */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        💡 Tipp: Frag mich nach spezifischen Orten, Zeiträumen oder Mustern
      </p>
    </div>
  )
}
```

---

## CategoryCard Component

**Purpose:** Interactive card for category-based exploration.

```typescript
// components/xpchat/CategoryCard.tsx

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

type CategoryCardProps = {
  icon: string
  title: string
  description: string
  exampleQuery: string
  onSelect: (query: string) => void
}

export function CategoryCard({
  icon,
  title,
  description,
  exampleQuery,
  onSelect,
}: CategoryCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
      <div onClick={() => onSelect(exampleQuery)}>
        {/* Icon */}
        <div className="text-4xl mb-3">{icon}</div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>

        {/* Example Query */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 mt-0.5">
            Beispiel:
          </span>
          <p className="text-xs text-gray-700 dark:text-gray-300 italic">
            "{exampleQuery}"
          </p>
        </div>

        {/* Try Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(exampleQuery)
          }}
        >
          Ausprobieren
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  )
}
```

---

## ProactiveInsight Component

**Purpose:** Display "Aha Moment" insights that the agent discovered proactively.

```typescript
// components/xpchat/ProactiveInsight.tsx

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, X } from 'lucide-react'
import { useState } from 'react'

type ProactiveInsightProps = {
  type: 'wave-detection' | 'temporal-correlation' | 'geographic-cluster' | 'pattern-match'
  message: string
  action: string
  onAccept: () => void
}

export function ProactiveInsight({
  type,
  message,
  action,
  onAccept,
}: ProactiveInsightProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const iconMap = {
    'wave-detection': '🌊',
    'temporal-correlation': '⏰',
    'geographic-cluster': '📍',
    'pattern-match': '🔗',
  }

  return (
    <Card className="p-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 animate-in slide-in-from-top">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <span className="text-xl">{iconMap[type]}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Aha-Moment entdeckt!
            </p>
          </div>

          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            {message}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onAccept}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {action}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              Später
            </Button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded"
        >
          <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </button>
      </div>
    </Card>
  )
}
```

---

## ToolRenderer Component

```typescript
// components/xpchat/ToolRenderer.tsx

import { type ToolInvocation } from '@ai-sdk/react'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Import visualization components
import { ResultsList } from './visualizations/ResultsList'
import { MapView } from './visualizations/MapView'
import { TimelineView } from './visualizations/TimelineView'
import { NetworkView } from './visualizations/NetworkView'
import { DashboardView } from './visualizations/DashboardView'
import { AnalysisView } from './visualizations/AnalysisView'
import { InsightsView } from './visualizations/InsightsView'
import { TrendsView } from './visualizations/TrendsView'
import { ConnectionsView } from './visualizations/ConnectionsView'
import { PatternsView } from './visualizations/PatternsView'
import { UserStatsView } from './visualizations/UserStatsView'

type ToolRendererProps = {
  toolInvocation: ToolInvocation
}

export function ToolRenderer({ toolInvocation }: ToolRendererProps) {
  const { toolName, state, args, result } = toolInvocation

  // Loading state
  if (state === 'call') {
    return (
      <Card className="p-4 mt-2 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Führe <strong>{toolName}</strong> aus...
          </span>
        </div>
      </Card>
    )
  }

  // Result state
  if (state === 'result') {
    return (
      <div className="mt-4">
        {renderToolResult(toolName, result, args)}
      </div>
    )
  }

  return null
}

function renderToolResult(toolName: string, result: any, args: any) {
  switch (toolName) {
    case 'unifiedSearch':
      return <ResultsList experiences={result} />

    case 'visualize':
      switch (args.type) {
        case 'map':
          return <MapView data={result} />
        case 'timeline':
          return <TimelineView data={result} />
        case 'network':
          return <NetworkView data={result} />
        case 'dashboard':
          return <DashboardView data={result} />
        default:
          return <pre>{JSON.stringify(result, null, 2)}</pre>
      }

    case 'analyze':
      return <AnalysisView data={result} mode={args.mode} />

    case 'insights':
      return <InsightsView data={result} />

    case 'trends':
      return <TrendsView data={result} />

    case 'connections':
      return <ConnectionsView data={result} />

    case 'patterns':
      return <PatternsView data={result} />

    case 'userStats':
      return <UserStatsView data={result} />

    default:
      return (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )
  }
}
```

---

## AI SDK Configuration

### useChat Hook Options

```typescript
const {
  messages,        // All messages in conversation
  input,          // Current input value
  setInput,       // Update input value
  append,         // Append new message
  isLoading,      // Is streaming
  error,          // Error state
  reload,         // Retry last message
  stop,           // Stop streaming
} = useChat({
  api: '/api/xpchat',
  streamProtocol: 'data',  // Use SSE data stream
  body: {
    threadId,      // Optional thread ID for memory
    locale: 'de',  // User locale
  },
  initialMessages: [...],
  onFinish: (message) => {
    // Called when streaming completes
    console.log('Message finished:', message)
  },
  onError: (error) => {
    // Called on error
    console.error('Chat error:', error)
  },
})
```

---

## Responsive Design

### Mobile Layout
```tsx
<div className="min-h-screen">
  {/* Header: Sticky top */}
  <header className="sticky top-0">...</header>

  {/* Messages: Scrollable */}
  <main className="pb-32">
    {/* 32 = 8rem bottom padding for fixed input */}
  </main>

  {/* Input: Fixed bottom */}
  <div className="fixed bottom-0 left-0 right-0">...</div>
</div>
```

### Desktop Layout
```tsx
<div className="container mx-auto max-w-4xl">
  {/* Centered content, max 4xl width */}
</div>
```

---

## Accessibility

### ARIA Labels
```tsx
<Textarea
  aria-label="Chat message input"
  aria-describedby="input-hint"
/>
<p id="input-hint" className="sr-only">
  Press Enter to send, Shift+Enter for new line
</p>
```

### Keyboard Navigation
- `Enter`: Send message
- `Shift + Enter`: New line
- `Tab`: Navigate between elements
- `Escape`: Clear input (optional)

### Screen Reader Support
```tsx
<div role="log" aria-live="polite" aria-atomic="false">
  {messages.map((msg) => (
    <div role="article" aria-label={`Message from ${msg.role}`}>
      {msg.content}
    </div>
  ))}
</div>
```

---

## Loading States

### Initial Load
```tsx
{messages.length === 0 && (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)}
```

### Streaming
```tsx
{isLoading && (
  <ThinkingIndicator />
)}
```

### Tool Execution
```tsx
{toolInvocation.state === 'call' && (
  <div className="flex items-center gap-2">
    <Loader2 className="animate-spin" />
    <span>Executing {toolName}...</span>
  </div>
)}
```

---

## Error Handling

```tsx
{error && (
  <Card className="p-4 border-red-200 bg-red-50">
    <p className="text-red-600">
      ⚠️ Error: {error.message}
    </p>
    <Button onClick={() => reload()}>
      Retry
    </Button>
  </Card>
)}
```

---

## Styling

### Tailwind Classes
```tsx
// Gradient background
className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"

// Glassmorphism header
className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"

// Message bubbles
className="bg-purple-50 border-purple-200 dark:bg-purple-900/20"

// Prose (markdown rendering)
className="prose dark:prose-invert max-w-none"
```

### Custom CSS (if needed)
```css
/* Auto-scroll to bottom */
.messages-container {
  display: flex;
  flex-direction: column-reverse;
}

/* Smooth scroll */
.messages-container {
  scroll-behavior: smooth;
}
```

---

## Performance Optimizations

### Virtualized Messages (for long conversations)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 100,
})
```

### Memoization
```tsx
const MemoizedMessage = React.memo(Message)
const MemoizedToolRenderer = React.memo(ToolRenderer)
```

---

## Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/react": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "lucide-react": "^0.400.0",
    "@tanstack/react-virtual": "^3.0.0"
  }
}
```

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] Can send messages
- [ ] Messages display correctly (user vs assistant)
- [ ] Markdown rendering works
- [ ] Code syntax highlighting works
- [ ] Tool invocations render
- [ ] Loading states show
- [ ] Error states display
- [ ] Textarea auto-resizes
- [ ] Enter sends, Shift+Enter new line
- [ ] Example queries work
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility (keyboard nav, screen reader)

---

## Next Steps

After implementing frontend:

1. ✅ Create visualization components (see `06-VISUALIZATIONS.md`)
2. ⏸️ Test end-to-end with real data
3. ⏸️ Add conversation memory UI (thread management)
4. ⏸️ Add export functionality
5. ⏸️ Add dark mode toggle

---

**Status:** Ready to Implement ✅
