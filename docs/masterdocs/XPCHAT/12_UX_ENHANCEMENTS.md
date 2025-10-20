# XPShare AI - UX Enhancements & Advanced Features

**Version:** 1.0
**Related:** 02_AGENT_SYSTEM.md, 04_DATABASE_LAYER.md, 08_CODE_EXAMPLES.md

---

## 🎯 Overview

This document covers 17 essential UX features based on State-of-the-art AI chat interfaces (ChatGPT, Claude, Perplexity) that elevate the XPShare AI chat experience from functional to exceptional.

**Features Covered:**
1. Citations & Source Attribution
2. Memory System (Session + Profile)
3. Message Actions (Edit, Regenerate, Copy, Share, Rate)
4. Abort/Stop Streaming
5. Attachments & Multi-Modal Input
6. Structured Error States
7. Context/Active Tools Banner
8. Rich Content Rendering
9. Enhanced Session Management
10. Keyboard Shortcuts
11. Accessibility (ARIA)
12. Branching Conversations
13. Collaborative Sharing
14. Cost/Token Tracking
15. Prompt Library
16. Message Threading
17. Offline Mode

---

## 1️⃣ Citations & Source Attribution

### Purpose
Show users which experiences/data sources the AI used to generate responses. Builds trust and allows verification.

### Database Schema

```sql
-- Migration: 015_add_citations.sql

CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  snippet TEXT,
  score DECIMAL(3,2), -- Relevance score 0-1
  position INT, -- [1], [2], [3] in text
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX citations_message_idx ON citations(message_id);
CREATE INDEX citations_experience_idx ON citations(experience_id);
```

### TypeScript Types

```typescript
// types/citations.ts
export interface Citation {
  id: string
  messageId: string
  experienceId?: string
  title: string
  url?: string
  snippet: string
  score: number
  position: number
}

export interface CitationReference {
  number: number
  citation: Citation
}
```

### Implementation

```typescript
// lib/citations/generator.ts
import { createClient } from '@supabase/supabase-js'

export async function generateCitations(
  messageId: string,
  experienceIds: string[]
): Promise<Citation[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch full experience details
  const { data: experiences } = await supabase
    .from('experiences')
    .select('id, title, description, category_slug')
    .in('id', experienceIds)

  if (!experiences) return []

  // Create citations
  const citations = experiences.map((exp, index) => ({
    message_id: messageId,
    experience_id: exp.id,
    title: exp.title,
    url: `/experiences/${exp.id}`,
    snippet: exp.description?.substring(0, 200) || '',
    score: 1.0 - (index * 0.1), // Descending relevance
    position: index + 1,
  }))

  // Store in database
  const { data } = await supabase
    .from('citations')
    .insert(citations)
    .select()

  return data || []
}
```

### UI Component

```typescript
// components/discover/Citations.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface CitationsProps {
  citations: Citation[]
}

export function Citations({ citations }: CitationsProps) {
  const [expanded, setExpanded] = useState(false)

  if (citations.length === 0) return null

  const visibleCitations = expanded ? citations : citations.slice(0, 3)

  return (
    <Card className="mt-4 border-l-4 border-l-primary/30">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-muted-foreground">
            Sources ({citations.length})
          </div>
          {citations.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show all <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {visibleCitations.map((citation) => (
            <Link
              key={citation.id}
              href={citation.url || '#'}
              className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors group"
            >
              <Badge variant="outline" className="flex-shrink-0">
                {citation.position}
              </Badge>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {citation.title}
                </div>
                {citation.snippet && (
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {citation.snippet}
                  </div>
                )}
              </div>

              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Integration into Messages

```typescript
// When rendering AI responses
{message.parts?.map((part, i) => {
  if (part.type === 'text') {
    return (
      <div key={i}>
        <Response>{part.text}</Response>
        {part.citations && <Citations citations={part.citations} />}
      </div>
    )
  }
})}
```

---

## 2️⃣ Memory System

### Database Schema

```sql
-- Migration: 016_add_memory.sql

CREATE TABLE IF NOT EXISTS user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL, -- 'session' | 'profile'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  source TEXT, -- 'user_stated' | 'inferred' | 'system'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scope, key)
);

CREATE INDEX user_memory_user_idx ON user_memory(user_id, scope);
CREATE INDEX user_memory_updated_idx ON user_memory(updated_at DESC);

-- Session memory (ephemeral)
CREATE TABLE IF NOT EXISTS session_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(chat_id, key)
);

CREATE INDEX session_memory_chat_idx ON session_memory(chat_id);
CREATE INDEX session_memory_expires_idx ON session_memory(expires_at);
```

### TypeScript Types

```typescript
// types/memory.ts
export type MemoryScope = 'session' | 'profile'
export type MemorySource = 'user_stated' | 'inferred' | 'system'

export interface Memory {
  id: string
  userId: string
  scope: MemoryScope
  key: string
  value: any
  source: MemorySource
  createdAt: string
  updatedAt: string
}

export interface SessionMemory {
  id: string
  chatId: string
  key: string
  value: any
  expiresAt: string
}
```

### Implementation

```typescript
// lib/memory/manager.ts
import { createClient } from '@supabase/supabase-js'

export class MemoryManager {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async setProfileMemory(
    userId: string,
    key: string,
    value: any,
    source: MemorySource = 'inferred'
  ) {
    const { data } = await this.supabase
      .from('user_memory')
      .upsert({
        user_id: userId,
        scope: 'profile',
        key,
        value,
        source,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return data
  }

  async getProfileMemory(userId: string, key?: string) {
    let query = this.supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('scope', 'profile')

    if (key) {
      query = query.eq('key', key)
    }

    const { data } = await query

    return key ? data?.[0] : data
  }

  async setSessionMemory(chatId: string, key: string, value: any) {
    const { data } = await this.supabase
      .from('session_memory')
      .upsert({
        chat_id: chatId,
        key,
        value,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    return data
  }

  async getSessionMemory(chatId: string, key?: string) {
    let query = this.supabase
      .from('session_memory')
      .select('*')
      .eq('chat_id', chatId)
      .gt('expires_at', new Date().toISOString())

    if (key) {
      query = query.eq('key', key)
    }

    const { data } = await query

    return key ? data?.[0] : data
  }

  async forgetProfileMemory(userId: string, key?: string) {
    let query = this.supabase
      .from('user_memory')
      .delete()
      .eq('user_id', userId)
      .eq('scope', 'profile')

    if (key) {
      query = query.eq('key', key)
    }

    await query
  }

  async getUserPreferences(userId: string) {
    const memories = await this.getProfileMemory(userId)

    return {
      preferredCategories: memories?.find((m) => m.key === 'preferred_categories')?.value || [],
      preferredViz: memories?.find((m) => m.key === 'preferred_viz')?.value || 'timeline',
      preferredLanguage: memories?.find((m) => m.key === 'language')?.value || 'de',
      location: memories?.find((m) => m.key === 'location')?.value || null,
    }
  }
}
```

### Memory UI Component

```typescript
// components/discover/MemoryPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Trash2, Eye, EyeOff } from 'lucide-react'

export function MemoryPanel({ userId }: { userId: string }) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      fetch(`/api/memory?userId=${userId}`)
        .then((r) => r.json())
        .then(setMemories)
    }
  }, [visible, userId])

  const handleForget = async (key: string) => {
    await fetch('/api/memory', {
      method: 'DELETE',
      body: JSON.stringify({ userId, key }),
    })
    setMemories((m) => m.filter((mem) => mem.key !== key))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Memory
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {visible && (
        <CardContent className="space-y-2">
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No memories stored yet
            </p>
          ) : (
            memories.map((memory) => (
              <div
                key={memory.id}
                className="flex items-start justify-between p-2 rounded bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{memory.key}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {JSON.stringify(memory.value)}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {memory.source}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleForget(memory.key)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  )
}
```

---

## 3️⃣ Message Actions

### Database Schema

```sql
-- Migration: 017_message_feedback.sql

CREATE TABLE IF NOT EXISTS message_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  rating INT CHECK (rating IN (-1, 1)), -- thumbs down = -1, thumbs up = 1
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX message_feedback_message_idx ON message_feedback(message_id);
CREATE INDEX message_feedback_user_idx ON message_feedback(user_id);
```

### UI Component

```typescript
// components/discover/MessageActions.tsx
'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Copy,
  Edit,
  RefreshCw,
  Share,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface MessageActionsProps {
  messageId: string
  content: string
  role: 'user' | 'assistant'
  onEdit?: () => void
  onRegenerate?: () => void
  onShare?: () => void
}

export function MessageActions({
  messageId,
  content,
  role,
  onEdit,
  onRegenerate,
  onShare,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<number | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRate = async (value: number) => {
    setRating(value)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId,
        rating: value,
      }),
    })

    toast.success(value === 1 ? 'Thanks for the feedback!' : 'Feedback noted')
  }

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Copy */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>

      {/* Thumbs Up/Down (assistant only) */}
      {role === 'assistant' && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleRate(1)}
            title="Good response"
            data-active={rating === 1}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleRate(-1)}
            title="Bad response"
            data-active={rating === -1}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {role === 'user' && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit message
            </DropdownMenuItem>
          )}

          {role === 'assistant' && onRegenerate && (
            <DropdownMenuItem onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </DropdownMenuItem>
          )}

          {onShare && (
            <DropdownMenuItem onClick={onShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

### Integration

```typescript
// In message rendering
<Message from={message.role} className="group">
  <div className="flex items-start justify-between">
    <MessageContent>{/* ... */}</MessageContent>

    <MessageActions
      messageId={message.id}
      content={messageContent}
      role={message.role}
      onEdit={() => handleEdit(message.id)}
      onRegenerate={() => handleRegenerate(message.id)}
      onShare={() => handleShare(message.id)}
    />
  </div>
</Message>
```

---

## 4️⃣ Abort/Stop Streaming

### Implementation

```typescript
// Update useChat hook
const { messages, sendMessage, stop, status } = useChat({
  api: '/api/discover',
})

const isStreaming = status === 'streaming'

// UI
{isStreaming && (
  <Button
    variant="destructive"
    size="sm"
    onClick={stop}
    className="absolute bottom-20 left-1/2 -translate-x-1/2"
  >
    <Square className="h-4 w-4 mr-2" />
    Stop generating
  </Button>
)}
```

---

## 5️⃣ Attachments & Multi-Modal

### Database Schema

```sql
-- Add to experiences or create attachments table
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image' | 'file' | 'audio'
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  hash TEXT, -- For deduplication
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX message_attachments_message_idx ON message_attachments(message_id);
CREATE INDEX message_attachments_hash_idx ON message_attachments(hash);
```

### UI Component

```typescript
// components/discover/AttachmentUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface AttachmentUploadProps {
  onUpload: (files: File[]) => void
  maxSize?: number // in MB
  accept?: string
}

export function AttachmentUpload({
  onUpload,
  maxSize = 10,
  accept = 'image/*,.pdf,.csv,.json',
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate size
    const oversized = selectedFiles.filter(
      (f) => f.size > maxSize * 1024 * 1024
    )

    if (oversized.length > 0) {
      toast.error(`Files must be under ${maxSize}MB`)
      return
    }

    setFiles((prev) => [...prev, ...selectedFiles])
    onUpload(selectedFiles)
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Attach files
      </Button>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm"
            >
              {file.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button
                onClick={() => handleRemove(i)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

**(Continuing with remaining 12 features in compact format due to length...)**

## 6️⃣ Structured Error States

```typescript
// components/discover/ErrorState.tsx
export function ErrorState({ type, onRetry }: { type: string; onRetry: () => void }) {
  const errors = {
    rate_limit: {
      title: 'Too many requests',
      message: 'Please wait 30 seconds',
      action: 'Retry in 30s',
    },
    network: {
      title: 'Connection lost',
      message: 'Check your internet connection',
      action: 'Retry',
    },
    // ... more error types
  }

  const error = errors[type as keyof typeof errors]

  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <h3>{error.title}</h3>
        <p>{error.message}</p>
        <Button onClick={onRetry}>{error.action}</Button>
      </CardContent>
    </Card>
  )
}
```

## 7️⃣ Context Banner

```typescript
export function ContextBanner({ activeTools, context }: any) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-xs">
      <Wrench className="h-4 w-4" />
      <span>Active: {activeTools.join(', ')}</span>
      <Badge>{context.categories} categories</Badge>
    </div>
  )
}
```

## 8️⃣ Rich Content Rendering

```typescript
// Code blocks with copy
<pre className="relative group">
  <code>{code}</code>
  <Button
    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
    onClick={() => copy(code)}
  >
    <Copy className="h-4 w-4" />
  </Button>
</pre>
```

## 9️⃣ Enhanced Session Management

```sql
-- Add to discovery_chats table
ALTER TABLE discovery_chats
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX discovery_chats_pinned_idx ON discovery_chats(user_id, pinned DESC, updated_at DESC);
```

## 🔟 Keyboard Shortcuts

```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Open search
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        // New chat
      }
      // ... more shortcuts
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
```

## 1️⃣1️⃣ Accessibility

```typescript
<div
  role="log"
  aria-live="polite"
  aria-atomic="true"
  aria-relevant="additions"
>
  {streamingMessage}
</div>
```

## 1️⃣2️⃣ Branching Conversations

```sql
CREATE TABLE message_branches (
  id UUID PRIMARY KEY,
  parent_message_id TEXT NOT NULL,
  branch_number INT NOT NULL,
  message_id TEXT NOT NULL
);
```

## 1️⃣3️⃣ Collaborative Sharing

```sql
CREATE TABLE shared_chats (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  view_count INT DEFAULT 0
);
```

## 1️⃣4️⃣ Cost/Token Tracking

```typescript
// Track per message
interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalCost: number
}
```

## 1️⃣5️⃣ Prompt Library

```typescript
const PROMPT_LIBRARY = [
  { name: 'UFO Heatmap', prompt: 'Show me a heatmap of UFO sightings' },
  { name: 'Dream Analysis', prompt: 'Analyze dream patterns in my city' },
  // ...
]
```

## 1️⃣6️⃣ Message Threading

```sql
CREATE TABLE message_threads (
  id UUID PRIMARY KEY,
  parent_message_id TEXT NOT NULL,
  child_message_id TEXT NOT NULL,
  depth INT DEFAULT 0
);
```

## 1️⃣7️⃣ Offline Mode

```typescript
// Service Worker for offline queueing
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/discover')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Queue for later
        return new Response(JSON.stringify({ queued: true }))
      })
    )
  }
})
```

---

**Next:** See 11_IMPLEMENTATION_CHECKLIST.md Phase 8 for implementation tasks.
