# XPChat Pattern Library

**Page:** `app/[locale]/patterns/page.tsx`
**Purpose:** Save, organize, and share discovered patterns
**Feature Priority:** HIGH (solves retention problem)

---

## Overview

The Pattern Library is a core feature for XPChat that allows users to:

- ✅ **Save discoveries** - Bookmark interesting patterns found during chat
- ✅ **Organize patterns** - Tag and categorize saved patterns
- ✅ **Share patterns** - Generate shareable links for discoveries
- ✅ **Revisit history** - Access past queries and results
- ✅ **Export data** - Download patterns as CSV/JSON

**Why This Matters:**
- Currently, discovered patterns disappear after chat session ends
- Users have no way to build a personal pattern library
- No viral loop through sharing
- Pattern Library solves retention + enables viral growth

---

## Architecture

```
/patterns page
     │
     ├─ My Patterns (grid view)
     │  ├─ Search saved patterns
     │  ├─ Filter by category/type
     │  └─ Sort by date/popularity
     │
     ├─ Pattern Detail Modal
     │  ├─ Original query
     │  ├─ Visualization (interactive)
     │  ├─ Metadata (date, category, stats)
     │  ├─ Share button
     │  └─ Export button
     │
     └─ Shared Patterns (public feed)
        ├─ Community discoveries
        ├─ Trending patterns
        └─ "Aha Moments" of the week
```

---

## Database Schema

```sql
-- patterns table
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern metadata
  type TEXT NOT NULL CHECK (type IN ('search', 'geographic', 'temporal', 'network', 'insight')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- UFO, Dreams, Psychic, etc.

  -- Original query & data
  query TEXT NOT NULL, -- Original user query
  data JSONB NOT NULL, -- Tool result data
  visualization_type TEXT, -- map, timeline, network, cards, etc.

  -- Metrics
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,

  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE, -- For shareable links

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_viewed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_type ON patterns(type);
CREATE INDEX idx_patterns_category ON patterns(category);
CREATE INDEX idx_patterns_is_public ON patterns(is_public);
CREATE INDEX idx_patterns_share_token ON patterns(share_token);
CREATE INDEX idx_patterns_created_at ON patterns(created_at DESC);

-- RLS Policies
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

-- Users can view own patterns
CREATE POLICY "Users can view own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public patterns
CREATE POLICY "Anyone can view public patterns"
  ON patterns FOR SELECT
  USING (is_public = TRUE);

-- Users can insert own patterns
CREATE POLICY "Users can insert own patterns"
  ON patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own patterns
CREATE POLICY "Users can update own patterns"
  ON patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own patterns
CREATE POLICY "Users can delete own patterns"
  ON patterns FOR DELETE
  USING (auth.uid() = user_id);

-- pattern_tags (many-to-many)
CREATE TABLE pattern_tags (
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (pattern_id, tag)
);

CREATE INDEX idx_pattern_tags_tag ON pattern_tags(tag);
```

---

## API Routes

### 1. Save Pattern

```typescript
// app/api/patterns/save/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body
  const body = await request.json()
  const { type, title, description, category, query, data, visualization_type, tags } = body

  // Validation
  if (!type || !title || !query || !data) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Generate share token
  const shareToken = nanoid(10)

  // Insert pattern
  const { data: pattern, error } = await supabase
    .from('patterns')
    .insert({
      user_id: user.id,
      type,
      title,
      description,
      category,
      query,
      data,
      visualization_type,
      share_token: shareToken,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving pattern:', error)
    return NextResponse.json({ error: 'Failed to save pattern' }, { status: 500 })
  }

  // Add tags if provided
  if (tags && tags.length > 0) {
    const tagInserts = tags.map((tag: string) => ({
      pattern_id: pattern.id,
      tag: tag.toLowerCase(),
    }))

    await supabase.from('pattern_tags').insert(tagInserts)
  }

  return NextResponse.json({ pattern })
}
```

### 2. List Patterns

```typescript
// app/api/patterns/list/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const publicOnly = searchParams.get('public') === 'true'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Build query
  let query = supabase
    .from('patterns')
    .select('*, pattern_tags(tag)')
    .order('created_at', { ascending: false })

  // Filters
  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (publicOnly) query = query.eq('is_public', true)

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (tag) {
    query = query.contains('pattern_tags', [{ tag }])
  }

  const { data: patterns, error } = await query

  if (error) {
    console.error('Error fetching patterns:', error)
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 })
  }

  return NextResponse.json({ patterns })
}
```

### 3. Share Pattern

```typescript
// app/api/patterns/[id]/share/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(...)

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Make pattern public & increment share count
  const { data: pattern, error } = await supabase
    .from('patterns')
    .update({
      is_public: true,
      share_count: supabase.sql`share_count + 1`,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to share pattern' }, { status: 500 })
  }

  // Generate shareable URL
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/patterns/${pattern.share_token}`

  return NextResponse.json({ shareUrl, pattern })
}
```

---

## Frontend Components

### 1. Patterns Page

```typescript
// app/[locale]/patterns/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatternCard } from '@/components/patterns/PatternCard'
import { PatternDetailModal } from '@/components/patterns/PatternDetailModal'
import { Search, Filter, TrendingUp } from 'lucide-react'

export default function PatternsPage() {
  const [patterns, setPatterns] = useState([])
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [view, setView] = useState<'my' | 'public'>('my')

  useEffect(() => {
    loadPatterns()
  }, [search, filterType, filterCategory, view])

  async function loadPatterns() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterType) params.set('type', filterType)
    if (filterCategory) params.set('category', filterCategory)
    if (view === 'public') params.set('public', 'true')

    const res = await fetch(`/api/patterns/list?${params}`)
    const data = await res.json()
    setPatterns(data.patterns)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Muster-Bibliothek</h1>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={view === 'my' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('my')}
              >
                Meine Muster
              </Button>
              <Button
                variant={view === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('public')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Muster durchsuchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              className="px-3 py-2 border rounded-lg"
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
            >
              <option value="">Alle Typen</option>
              <option value="search">Suche</option>
              <option value="geographic">Geografisch</option>
              <option value="temporal">Zeitlich</option>
              <option value="network">Netzwerk</option>
              <option value="insight">Einsichten</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg"
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
            >
              <option value="">Alle Kategorien</option>
              <option value="ufo-uap">UFO/UAP</option>
              <option value="dreams">Träume</option>
              <option value="psychic">Psychisch</option>
              <option value="nde">Nahtod</option>
              <option value="synchronicity">Synchronizität</option>
            </select>
          </div>
        </div>
      </header>

      {/* Patterns Grid */}
      <main className="container mx-auto px-4 py-8">
        {patterns.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Noch keine Muster gespeichert</p>
            <Button className="mt-4" onClick={() => (window.location.href = '/xpchat')}>
              XPChat starten
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onClick={() => setSelectedPattern(pattern)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <PatternDetailModal
          pattern={selectedPattern}
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </div>
  )
}
```

### 2. PatternCard Component

```typescript
// components/patterns/PatternCard.tsx

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

type PatternCardProps = {
  pattern: any
  onClick: () => void
}

export function PatternCard({ pattern, onClick }: PatternCardProps) {
  return (
    <Card
      className="p-4 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Type & Category */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          {getTypeLabel(pattern.type)}
        </Badge>
        {pattern.category && (
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(pattern.category)}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
        {pattern.title}
      </h3>

      {/* Description */}
      {pattern.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {pattern.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(pattern.created_at), {
            addSuffix: true,
            locale: de,
          })}
        </span>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {pattern.view_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {pattern.share_count || 0}
          </span>
        </div>
      </div>
    </Card>
  )
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    search: 'Suche',
    geographic: 'Geografisch',
    temporal: 'Zeitlich',
    network: 'Netzwerk',
    insight: 'Einsicht',
  }
  return labels[type] || type
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ufo-uap': 'UFO/UAP',
    dreams: 'Träume',
    psychic: 'Psychisch',
    nde: 'Nahtod',
    synchronicity: 'Synchronizität',
  }
  return labels[category] || category
}
```

---

## Share Flow

**Step 1:** User clicks "Share" button on pattern

**Step 2:** API makes pattern public & generates share URL

**Step 3:** User copies URL: `https://xpshare.app/patterns/aBcDeFgHiJ`

**Step 4:** Anyone with link can view pattern (even non-logged-in users)

**Step 5:** Shared page shows:
- Pattern visualization (interactive)
- Original query
- Metadata (date, category, stats)
- "Create your own pattern" CTA → Sign up

---

## Viral Loop

```
User discovers pattern in XPChat
     │
     ▼
Saves pattern to library
     │
     ▼
Shares pattern on social media
     │
     ▼
Non-user clicks link → Sees cool pattern
     │
     ▼
"Create your own pattern" CTA
     │
     ▼
Signs up → New user
     │
     ▼
Uses XPChat → Discovers pattern → Shares
     │
     ▼
LOOP REPEATS
```

---

## Export Functionality

```typescript
// Export as CSV
async function exportPatternCSV(patternId: string) {
  const res = await fetch(`/api/patterns/${patternId}/export?format=csv`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pattern-${patternId}.csv`
  a.click()
}

// Export as JSON
async function exportPatternJSON(patternId: string) {
  const res = await fetch(`/api/patterns/${patternId}/export?format=json`)
  const data = await res.json()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pattern-${patternId}.json`
  a.click()
}
```

---

## Success Metrics

**Must Have (First 30 Days):**
- ✅ 30%+ of users save at least 1 pattern
- ✅ Average 3 patterns saved per active user
- ✅ 10%+ patterns shared publicly

**Nice to Have:**
- 🎯 50%+ of users save patterns
- 🎯 20%+ patterns shared
- 🎯 5%+ viral signups from shared patterns

---

## Next Steps

After implementing Pattern Library:

1. ⏸️ Create database migration
2. ⏸️ Implement API routes
3. ⏸️ Build frontend pages
4. ⏸️ Add share functionality
5. ⏸️ Test viral loop
6. ⏸️ Add analytics tracking

---

**Status:** Ready to Implement ✅
