# AI SDK 5.0 Native Tool Rendering - XPShare Discovery System

## 📋 Overview

Migration from generic `renderToolResult()` switch-case to **AI SDK 5.0's native typed tool rendering** with proper loading states, error handling, and TypeScript type safety.

**Date**: 2025-10-20
**Status**: 🟡 In Progress
**Estimated Time**: 2 hours
**Risk Level**: 🟢 Low

---

## 🎯 Goals

1. ✅ Professional Loading States for all tool executions
2. ✅ Automatic Error Handling with user-friendly messages
3. ✅ Full TypeScript Type Safety for tool args & results
4. ✅ Better code organization (separate components per tool)
5. ✅ Reduce code by ~40% (eliminate switch-case boilerplate)
6. ✅ Use AI SDK 5.0's native features (no extra dependencies)

---

## 🏗️ Architecture

### Current Architecture (BEFORE)
```
page.tsx
  ├── renderToolResult(toolName, result)  ← 28-line switch-case
  │     ├── case 'search_experiences'
  │     ├── case 'analyze_timeline'
  │     ├── case 'analyze_geographic'
  │     ├── case 'analyze_network'
  │     └── case 'analyze_heatmap'
  └── Manual message.parts.map() rendering  ← 70+ lines
```

### New Architecture (AFTER)
```
page.tsx
  └── message.parts.map()
        ├── part.type === 'text' → Render text
        ├── part.type === 'tool-analyze_timeline' → <TimelineToolUI part={part} />
        ├── part.type === 'tool-analyze_geographic' → <MapToolUI part={part} />
        ├── part.type === 'tool-analyze_network' → <NetworkToolUI part={part} />
        └── part.type === 'tool-analyze_heatmap' → <HeatmapToolUI part={part} />

components/discover/tool-ui/
  ├── TimelineToolUI.tsx        ← Handles 3 states: running, complete, error
  ├── MapToolUI.tsx              ← Handles 3 states: running, complete, error
  ├── NetworkToolUI.tsx          ← Handles 3 states: running, complete, error
  ├── HeatmapToolUI.tsx          ← Handles 3 states: running, complete, error
  └── index.ts                   ← Barrel export
```

---

## 🔧 Key Concepts

### AI SDK 5.0 Tool Part Types

When using `useChat()` with tool calling, message parts automatically get typed:

```typescript
message.parts.map(part => {
  // Type 1: Text
  if (part.type === 'text') {
    return part.text  // string
  }

  // Type 2: Tool Call (our custom tools)
  if (part.type === 'tool-analyze_timeline') {
    part.state  // 'input-available' | 'output-available' | 'output-error'
    part.toolCallId  // string
    part.args  // { query: string, granularity?: 'day' | 'month' | 'year' }
    part.output  // { data: ..., granularity: ..., total: ... } (when complete)
    part.error  // Error object (when failed)
  }
})
```

### Three States Per Tool

Each tool part has a `state` property:

1. **`input-available`** - Tool is running (show loading UI)
2. **`output-available`** - Tool completed successfully (show visualization)
3. **`output-error`** - Tool failed (show error message)

---

## 📦 Phase 1: Create Type Definitions

### Step 1.1: Define Tool Types

Create `/types/discovery-tools.ts`:

```typescript
// Timeline Tool
export interface TimelineArgs {
  query: string
  granularity?: 'day' | 'month' | 'year'
}

export interface TimelineResult {
  data: Array<{ date: string; count: number }>
  granularity: 'day' | 'month' | 'year'
  total: number
}

// Geographic Tool
export interface GeographicArgs {
  query: string
}

export interface GeographicResult {
  markers: Array<{
    id: string
    lat: number
    lng: number
    title: string
    category: string
  }>
  total: number
}

// Network Tool
export interface NetworkArgs {
  query: string
}

export interface NetworkResult {
  nodes: Array<{ id: string; label: string; category: string }>
  edges: Array<{ source: string; target: string; weight: number }>
  total: number
}

// Heatmap Tool
export interface HeatmapArgs {
  query: string
}

export interface HeatmapResult {
  data: Array<{ category: string; month: string; count: number }>
  total: number
}

// Search Tool
export interface SearchArgs {
  query: string
}

export interface SearchResult {
  results: Array<{
    id: string
    title: string
    category: string
    description: string
    location: string
    date: string
  }>
  count: number
}
```

---

## 🎨 Phase 2: Create Tool UI Components

### Step 2.1: TimelineToolUI Component

Create `/components/discover/tool-ui/TimelineToolUI.tsx`:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { TimelineChart } from '@/components/discover/TimelineChart'
import { Loader2, AlertCircle } from 'lucide-react'
import { TimelineArgs, TimelineResult } from '@/types/discovery-tools'

interface TimelineToolUIProps {
  part: {
    type: 'tool-analyze_timeline'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    args: TimelineArgs
    output?: TimelineResult
    error?: Error
  }
}

export function TimelineToolUI({ part }: TimelineToolUIProps) {
  // State 1: Tool is running
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-blue-500 bg-blue-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div>
            <p className="font-medium text-blue-900">Analyzing temporal patterns</p>
            <p className="text-sm text-blue-700">
              Searching for: "{part.args.query}" · Granularity: {part.args.granularity || 'month'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // State 2: Tool completed successfully
  if (part.state === 'output-available' && part.output) {
    return (
      <Card className="p-4">
        <TimelineChart
          data={part.output.data}
          granularity={part.output.granularity}
          title={`Timeline: ${part.args.query}`}
          interactive
        />
        <p className="text-xs text-muted-foreground mt-2">
          Found {part.output.total} experiences matching your query
        </p>
      </Card>
    )
  }

  // State 3: Tool failed
  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze timeline</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
```

### Step 2.2: MapToolUI Component

Create `/components/discover/tool-ui/MapToolUI.tsx`:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { ExperienceMapCard } from '@/components/discover/ExperienceMapCard'
import { Loader2, AlertCircle } from 'lucide-react'
import { GeographicArgs, GeographicResult } from '@/types/discovery-tools'

interface MapToolUIProps {
  part: {
    type: 'tool-analyze_geographic'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    args: GeographicArgs
    output?: GeographicResult
    error?: Error
  }
}

export function MapToolUI({ part }: MapToolUIProps) {
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-green-500 bg-green-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          <div>
            <p className="font-medium text-green-900">Mapping global locations</p>
            <p className="text-sm text-green-700">
              Searching for: "{part.args.query}"
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <div className="space-y-2">
        <ExperienceMapCard
          markers={part.output.markers}
          title={`Map: ${part.args.query}`}
        />
        <p className="text-xs text-muted-foreground">
          Mapped {part.output.total} locations
        </p>
      </div>
    )
  }

  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to load map</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
```

### Step 2.3: NetworkToolUI Component

Create `/components/discover/tool-ui/NetworkToolUI.tsx`:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { NetworkGraph } from '@/components/discover/NetworkGraph'
import { Loader2, AlertCircle } from 'lucide-react'
import { NetworkArgs, NetworkResult } from '@/types/discovery-tools'

interface NetworkToolUIProps {
  part: {
    type: 'tool-analyze_network'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    args: NetworkArgs
    output?: NetworkResult
    error?: Error
  }
}

export function NetworkToolUI({ part }: NetworkToolUIProps) {
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-purple-500 bg-purple-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          <div>
            <p className="font-medium text-purple-900">Finding connections</p>
            <p className="text-sm text-purple-700">
              Searching for: "{part.args.query}"
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <div className="space-y-2">
        <NetworkGraph
          nodes={part.output.nodes}
          edges={part.output.edges}
          title={`Network: ${part.args.query}`}
        />
        <p className="text-xs text-muted-foreground">
          Found {part.output.edges.length} connections between {part.output.total} experiences
        </p>
      </div>
    )
  }

  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze network</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
```

### Step 2.4: HeatmapToolUI Component

Create `/components/discover/tool-ui/HeatmapToolUI.tsx`:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { HeatmapChart } from '@/components/discover/HeatmapChart'
import { Loader2, AlertCircle } from 'lucide-react'
import { HeatmapArgs, HeatmapResult } from '@/types/discovery-tools'

interface HeatmapToolUIProps {
  part: {
    type: 'tool-analyze_heatmap'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    args: HeatmapArgs
    output?: HeatmapResult
    error?: Error
  }
}

export function HeatmapToolUI({ part }: HeatmapToolUIProps) {
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-orange-500 bg-orange-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          <div>
            <p className="font-medium text-orange-900">Analyzing category trends</p>
            <p className="text-sm text-orange-700">
              Searching for: "{part.args.query}"
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <div className="space-y-2">
        <HeatmapChart
          data={part.output.data}
          title={`Heatmap: ${part.args.query}`}
        />
        <p className="text-xs text-muted-foreground">
          Analyzed {part.output.total} experiences across categories and time periods
        </p>
      </div>
    )
  }

  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze heatmap</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
```

### Step 2.5: Barrel Export

Create `/components/discover/tool-ui/index.ts`:

```typescript
export { TimelineToolUI } from './TimelineToolUI'
export { MapToolUI } from './MapToolUI'
export { NetworkToolUI } from './NetworkToolUI'
export { HeatmapToolUI } from './HeatmapToolUI'
```

---

## 🔄 Phase 3: Update Discovery Page

### BEFORE (170 lines with switch-case)

```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export default function DiscoverPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/discover' }),
  })
  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  // 28-line switch-case function ❌
  const renderToolResult = (toolName: string, result: any) => {
    switch (toolName) {
      case 'search_experiences':
        return (
          <Card className="p-4 mt-2">
            <h3 className="font-bold mb-2">Search Results ({result.count} found)</h3>
            {/* ... 10+ lines */}
          </Card>
        )
      case 'analyze_timeline':
        return <TimelineChart data={result.data} granularity={result.granularity} title="Temporal Distribution" interactive />
      case 'analyze_geographic':
        return <ExperienceMapCard markers={result.markers} title="Geographic Distribution" />
      case 'analyze_network':
        return <NetworkGraph nodes={result.nodes} edges={result.edges} title="Connection Network" />
      case 'analyze_heatmap':
        return <HeatmapChart data={result.data} title="Category × Time Density" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto h-screen flex flex-col p-4 max-w-5xl">
      {/* ... header ... */}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.role === 'user' && (
              <div className="flex justify-end">
                <Card className="bg-primary text-primary-foreground px-4 py-2 max-w-[80%]">
                  {message.parts?.map((part) => part.type === 'text' ? part.text : null).join('')}
                </Card>
              </div>
            )}
            {message.role === 'assistant' && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
                  {message.parts?.map((part, i) => {
                    if (part.type === 'text') {
                      return <Card key={i} className="px-4 py-2 whitespace-pre-wrap">{part.text}</Card>
                    }
                    // ❌ Generic tool-result rendering (no loading states, no error handling)
                    if (part.type === 'tool-result') {
                      return <div key={i}>{renderToolResult(part.toolName, part.result)}</div>
                    }
                    return null
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ... form ... */}
    </div>
  )
}
```

### AFTER (100 lines with typed tool parts) ✅

```typescript
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

export default function DiscoverPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/discover' }),
  })
  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  const suggestions = [
    'Show me UFO sightings in Europe',
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

                    // ✅ Typed tool parts with automatic state handling
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
```

---

## ✅ Phase 4: Testing

### Test Cases

Test each visualization with these queries:

1. **Timeline**: "What patterns exist in dreams over time?"
   - ✅ Verify loading state shows "Analyzing temporal patterns"
   - ✅ Verify TimelineChart renders with data
   - ✅ Verify error state if API fails

2. **Map**: "Map global UFO sightings"
   - ✅ Verify loading state shows "Mapping global locations"
   - ✅ Verify ExperienceMapCard renders with markers
   - ✅ Verify error state if API fails

3. **Network**: "Find connections between NDEs"
   - ✅ Verify loading state shows "Finding connections"
   - ✅ Verify NetworkGraph renders with nodes and edges
   - ✅ Verify error state if API fails

4. **Heatmap**: "Show me experience categories over time"
   - ✅ Verify loading state shows "Analyzing category trends"
   - ✅ Verify HeatmapChart renders with data
   - ✅ Verify error state if API fails

---

## 📊 Metrics

### Code Reduction
- **Before**: 170 lines in page.tsx
- **After**: ~100 lines in page.tsx + 4 tool UI components (~300 lines total)
- **Net**: Better organized, more maintainable, type-safe

### Benefits
1. ✅ **Type Safety**: Full TypeScript types for all tool args and results
2. ✅ **Loading States**: Professional loading UI for each tool
3. ✅ **Error Handling**: User-friendly error messages
4. ✅ **Code Organization**: Each tool has its own component
5. ✅ **Maintainability**: Easier to add new tools or modify existing ones
6. ✅ **No Dependencies**: Uses only AI SDK 5.0 native features

---

## 🚀 Deployment Checklist

- [ ] All tool UI components created
- [ ] Type definitions added
- [ ] Page.tsx updated
- [ ] All 4 visualizations tested
- [ ] Loading states verified
- [ ] Error states verified
- [ ] TypeScript compilation passes
- [ ] No console errors
- [ ] Performance tested (< 100ms render time)

---

## 🐛 Troubleshooting

### Issue: Types not recognized
**Solution**: Ensure `part.type === 'tool-{toolName}'` matches exact tool names from `/app/api/discover/route.ts`

### Issue: Loading state not showing
**Solution**: Check that `part.state === 'input-available'` is being handled first in each component

### Issue: Visualization not rendering
**Solution**: Verify that `part.output` exists before rendering visualization components

### Issue: Error state not showing
**Solution**: Ensure `part.state === 'output-error'` case is handled in each component

---

**Migration Status**: Ready to implement ✅
