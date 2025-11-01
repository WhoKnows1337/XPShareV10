# XPChat v3 - Implementation Plan

**Status:** Ready to Execute
**Created:** 2025-10-26
**Total Effort:** 8 hours (Quick Start) → 8 weeks (Full MVP)

---

## 🚀 Quick Start: 8-Stunden-Plan

**Ziel:** Funktionierende Discovery-Chat HEUTE!

### Was du schon hast (✅)

```
✅ /api/chat - Backend mit Vector Search
✅ AskAIStream - Chat UI Component
✅ Supabase mit pgvector & RLS
✅ match_experiences RPC
✅ OpenAI Integration
✅ generateEmbedding() Funktion
```

**Du bist 80% fertig!** Wir brauchen nur noch 20%.

---

## 📋 Phase 0: Vorbereitung (30 Min)

### Step 0.1: Dependencies prüfen

```bash
# Prüfe ob AI SDK installiert
npm list ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic

# Falls nicht:
npm install ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic zod
```

### Step 0.2: ENV Variablen checken

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional für Claude
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Step 0.3: Database Migration (NEU!)

**WICHTIG:** Structured Attributes Schema (see [13-DATABASE-SCHEMA.md](./13-DATABASE-SCHEMA.md))

```sql
-- Run in Supabase SQL Editor:

-- 1. Create experience_attributes table
CREATE TABLE experience_attributes (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence INT DEFAULT 100,
  source TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experience_id, key)
);

-- 2. Create experience_tags table
CREATE TABLE experience_tags (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  added_by TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (experience_id, tag)
);

-- 3. Add indexes
CREATE INDEX idx_attributes_key_value ON experience_attributes(key, value);
CREATE INDEX idx_attributes_confidence ON experience_attributes(confidence);
CREATE INDEX idx_tags_tag ON experience_tags(tag);

-- 4. Enable RLS
ALTER TABLE experience_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_tags ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Attributes visible if experience visible"
  ON experience_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
        AND (e.is_public = true OR e.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own attributes"
  ON experience_attributes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
        AND e.user_id = auth.uid()
    )
  );

-- Same for tags
CREATE POLICY "Tags visible if experience visible"
  ON experience_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_tags.experience_id
        AND (e.is_public = true OR e.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own tags"
  ON experience_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_tags.experience_id
        AND e.user_id = auth.uid()
    )
  );
```

### Step 0.4: Bestehenden Code analysieren

```bash
# Lies diese Files:
cat app/api/chat/route.ts
cat components/search/ask-ai-stream.tsx
cat lib/openai/client.ts
```

✅ **Checkpoint:** Du verstehst was bereits existiert + neue tables sind ready

---

## 📝 Phase 1: Backend - Tools hinzufügen (2h)

### Step 1.1: Tool Definitions erstellen (45 Min)

```typescript
// lib/ai/tools/unified-search.ts
import { tool } from 'ai'
import { z } from 'zod'
import { generateEmbedding } from '@/lib/openai/client'

export const unifiedSearchTool = tool({
  description: `Searches experiences using Vector Search, Full-Text, or Geographic queries.
Use "explore" mode for pattern discovery (returns top 15-50 most relevant).
Use "browse" mode to find all matching experiences (with pagination).
Use "find" mode for specific experience lookup.`,

  parameters: z.object({
    query: z.string().describe('Search query or description'),
    mode: z.enum(['explore', 'browse', 'find']).default('explore')
      .describe('explore: AI analysis | browse: show all | find: specific match'),
    category: z.string().optional().describe('Filter by category (UFO, Dreams, etc.)'),
    location: z.string().optional().describe('Filter by location text'),
    limit: z.number().default(15).describe('Number of results'),
    offset: z.number().default(0).describe('Pagination offset (for browse mode)')
  }),

  execute: async ({ query, mode, category, location, limit, offset }, { context }) => {
    const { supabase } = context

    // Generate embedding for query
    const embedding = await generateEmbedding(query)

    if (mode === 'explore') {
      // Vector Search for pattern discovery
      const { data, error } = await supabase.rpc('match_experiences', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: limit,
        filter_category: category || null
      })

      if (error) throw error

      // Filter by location if provided (client-side)
      let filtered = data || []
      if (location) {
        filtered = filtered.filter((exp: any) =>
          exp.location_text?.toLowerCase().includes(location.toLowerCase())
        )
      }

      return {
        mode: 'explore',
        experiences: filtered,
        totalCount: filtered.length,
        message: `Found ${filtered.length} relevant experiences for exploration`
      }
    }

    if (mode === 'browse') {
      // Full-text search with pagination
      const { data, count, error } = await supabase
        .from('experiences')
        .select('*', { count: 'exact' })
        .textSearch('story_text', query)
        .eq(category ? 'category' : 'id', category || null)
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        mode: 'browse',
        experiences: data,
        totalCount: count,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil((count || 0) / limit),
        message: `Showing ${offset + 1}-${offset + data.length} of ${count} experiences`
      }
    }

    if (mode === 'find') {
      // Exact or high-similarity match
      const { data, error } = await supabase.rpc('match_experiences', {
        query_embedding: embedding,
        match_threshold: 0.8, // High threshold for "find"
        match_count: 5
      })

      if (error) throw error

      return {
        mode: 'find',
        experiences: data,
        totalCount: data?.length || 0,
        message: data?.length > 0
          ? `Found ${data.length} matching experience(s)`
          : 'No exact matches found. Try explore mode?'
      }
    }
  }
})
```

```typescript
// lib/ai/tools/visualize.ts
import { tool } from 'ai'
import { z } from 'zod'

export const visualizeTool = tool({
  description: `Creates visualizations from experience data.
Supports: map (geographic), timeline (temporal), network (connections), dashboard (stats)`,

  parameters: z.object({
    type: z.enum(['map', 'timeline', 'network', 'dashboard'])
      .describe('Type of visualization'),
    experienceIds: z.array(z.string())
      .describe('Array of experience IDs to visualize'),
    groupBy: z.enum(['hour', 'day', 'week', 'month', 'year']).optional()
      .describe('For timeline: time grouping'),
  }),

  execute: async ({ type, experienceIds, groupBy }, { context }) => {
    const { supabase } = context

    if (type === 'map') {
      // Fetch experiences with geo data
      const { data, error } = await supabase
        .from('experiences')
        .select('id, title, category, location_lat, location_lng')
        .in('id', experienceIds)
        .not('location_lat', 'is', null)

      if (error) throw error

      // Generate GeoJSON
      const geoJSON = {
        type: 'FeatureCollection',
        features: data.map(exp => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [exp.location_lng, exp.location_lat]
          },
          properties: {
            id: exp.id,
            title: exp.title,
            category: exp.category
          }
        }))
      }

      return {
        type: 'map',
        geoJSON,
        count: data.length
      }
    }

    if (type === 'timeline') {
      // Fetch experiences with dates
      const { data, error } = await supabase
        .from('experiences')
        .select('date_occurred, category')
        .in('id', experienceIds)
        .not('date_occurred', 'is', null)
        .order('date_occurred')

      if (error) throw error

      // Group by time period (simplified - use SQL for production)
      const grouped: Record<string, number> = {}
      data.forEach((exp: any) => {
        const date = new Date(exp.date_occurred)
        const key = groupBy === 'month'
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : date.toISOString().split('T')[0]

        grouped[key] = (grouped[key] || 0) + 1
      })

      const timeline = Object.entries(grouped).map(([date, count]) => ({
        date,
        count
      }))

      return {
        type: 'timeline',
        timeline,
        groupBy: groupBy || 'day'
      }
    }

    if (type === 'dashboard') {
      // Fetch basic stats
      const { data, error } = await supabase
        .from('experiences')
        .select('category, location_text, tags')
        .in('id', experienceIds)

      if (error) throw error

      // Aggregate stats
      const categoryCount: Record<string, number> = {}
      const locationCount: Record<string, number> = {}
      const tagCount: Record<string, number> = {}

      data.forEach((exp: any) => {
        categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1

        if (exp.location_text) {
          locationCount[exp.location_text] = (locationCount[exp.location_text] || 0) + 1
        }

        exp.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })

      return {
        type: 'dashboard',
        metrics: {
          total: data.length,
          byCategory: categoryCount,
          byLocation: locationCount,
          topTags: Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }))
        }
      }
    }

    // network type would go here
    throw new Error(`Visualization type ${type} not yet implemented`)
  }
})
```

✅ **Checkpoint:** 2 Tools definiert

### Step 1.2: API Route erstellen (45 Min)

```typescript
// app/api/xpchat/route.ts
import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { unifiedSearchTool } from '@/lib/ai/tools/unified-search'
import { visualizeTool } from '@/lib/ai/tools/visualize'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Parse request
    const { messages } = await req.json()

    // 3. Create RLS-safe context
    const context = {
      supabase,
      userId: user.id
    }

    // 4. Stream response
    const result = await streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages,
      system: `Du bist ein Discovery-Assistent für XPShare, eine Plattform für außergewöhnliche Erlebnisse.

Deine Aufgabe: Hilf Usern, relevante Erlebnisse zu entdecken, Patterns zu finden und Insights zu gewinnen.

**Verfügbare Tools:**
- unifiedSearch: Sucht Erlebnisse (explore/browse/find Modi)
- visualize: Erstellt Karten, Timelines, Dashboards

**Verhalten:**
- Antworte auf Deutsch
- Sei prägnant und hilfreich
- Nutze Tools aktiv
- Biete Follow-up Fragen an

**Beispiel:**
User: "UFO Sichtungen in Bayern"
Du:
1. unifiedSearch(query: "UFO Sichtungen Bayern", mode: "explore", category: "UFO")
2. visualize(type: "map", experienceIds: [...])
3. Antworte: "Ich habe 23 UFO-Sichtungen in Bayern gefunden. [Zeigt Karte]
   Die meisten sind in München (8) und Nürnberg (6).
   Möchtest du mehr über eine bestimmte Sichtung erfahren?"`,

      tools: {
        unifiedSearch: unifiedSearchTool,
        visualize: visualizeTool
      },

      // @ts-ignore - Context injection
      experimental_context: context,

      temperature: 0.7,
      maxTokens: 2000
    })

    return result.toDataStreamResponse()

  } catch (error: any) {
    console.error('XPChat error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
}
```

✅ **Checkpoint:** API Route funktioniert

### Step 1.3: Test API (10 Min)

```bash
# Terminal 1: Start Dev Server
npm run dev

# Terminal 2: Test mit curl
curl -X POST http://localhost:3000/api/xpchat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "UFO Sichtungen in Deutschland"}
    ]
  }'
```

✅ **Checkpoint:** API antwortet mit Stream

---

## 🎨 Phase 2: Frontend - Chat UI (2h)

### Step 2.1: Welcome Screen (30 Min)

```typescript
// components/discover/WelcomeScreen.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const EXAMPLE_QUESTIONS = [
  {
    category: '🛸 UFO',
    question: 'Zeig mir UFO-Sichtungen in Deutschland',
    description: 'Entdecke außergewöhnliche Himmelsphänomene'
  },
  {
    category: '👻 Paranormal',
    question: 'Was sind häufige Geister-Erlebnisse?',
    description: 'Analysiere paranormale Begegnungen'
  },
  {
    category: '🌙 Träume',
    question: 'Finde luzide Traum-Erfahrungen',
    description: 'Erkunde bewusstes Träumen'
  },
  {
    category: '💫 NDE',
    question: 'Welche Muster gibt es bei Nahtoderfahrungen?',
    description: 'Verstehe Nahtoderlebnisse'
  },
  {
    category: '🍄 Psychedelic',
    question: 'Ayahuasca Zeremonien in Europa',
    description: 'Finde psychedelische Reiseberichte'
  },
  {
    category: '🧘 Meditation',
    question: 'Tiefe Meditations-Erlebnisse',
    description: 'Entdecke spirituelle Erfahrungen'
  }
]

export function WelcomeScreen({
  onQuestionSelect
}: {
  onQuestionSelect: (question: string) => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Entdecke das Außergewöhnliche
        </h1>
        <p className="text-lg text-muted-foreground">
          Stelle eine Frage und lass die AI Patterns, Connections und Insights finden
        </p>
      </div>

      {/* Example Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXAMPLE_QUESTIONS.map((example, i) => (
          <Card
            key={i}
            className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => onQuestionSelect(example.question)}
          >
            <div className="space-y-2">
              <div className="text-2xl">{example.category.split(' ')[0]}</div>
              <h3 className="font-semibold">{example.question}</h3>
              <p className="text-sm text-muted-foreground">{example.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center text-sm text-muted-foreground">
        💡 Tipp: Frag einfach natürlich - die AI versteht deine Intent
      </div>
    </div>
  )
}
```

### Step 2.2: Chat Page (30 Min)

```typescript
// app/[locale]/discover/page.tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { WelcomeScreen } from '@/components/discover/WelcomeScreen'
import { ChatInput } from '@/components/discover/ChatInput'
import { Message } from 'ai'

export default function DiscoverPage() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/xpchat',
    initialMessages: []
  })

  const handleQuestionSelect = (question: string) => {
    setInput(question)
    // Auto-submit
    setTimeout(() => {
      handleSubmit(new Event('submit') as any)
    }, 100)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b p-4 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">XPShare Discovery</h1>
          {messages.length > 0 && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Neue Suche
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
        ) : (
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <div className="text-center text-muted-foreground">Denke nach...</div>}
          </div>
        )}
      </main>

      {/* Input (sticky bottom) */}
      <footer className="border-t p-4 bg-background/95 backdrop-blur sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stelle eine Frage... z.B. 'UFO Sichtungen in Bayern'"
              className="flex-1 px-4 py-2 border rounded-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Senden
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xl">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="bg-muted px-4 py-2 rounded-lg max-w-2xl prose">
        {/* TODO: Render markdown + tool invocations */}
        {message.content}
      </div>
    </div>
  )
}
```

✅ **Checkpoint:** Chat UI funktioniert

### Step 2.3: Tool Renderer (60 Min)

```typescript
// components/discover/ToolRenderer.tsx
'use client'

import { MapView } from './visualizations/MapView'
import { TimelineView } from './visualizations/TimelineView'
import { DashboardView } from './visualizations/DashboardView'
import { ExperiencesList } from './ExperiencesList'

export function ToolRenderer({ toolInvocation }: any) {
  const { toolName, result, state } = toolInvocation

  if (state !== 'result') {
    return <div className="text-sm text-muted-foreground">Verwende {toolName}...</div>
  }

  switch (toolName) {
    case 'unifiedSearch':
      return (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">{result.message}</div>
          <ExperiencesList experiences={result.experiences} />
        </div>
      )

    case 'visualize':
      if (result.type === 'map') {
        return <MapView geoJSON={result.geoJSON} />
      }
      if (result.type === 'timeline') {
        return <TimelineView data={result.timeline} />
      }
      if (result.type === 'dashboard') {
        return <DashboardView metrics={result.metrics} />
      }
      break

    default:
      return <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
  }
}
```

```typescript
// components/discover/visualizations/MapView.tsx
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function MapView({ geoJSON }: { geoJSON: any }) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10.4515, 51.1657], // Germany center
      zoom: 5
    })

    map.on('load', () => {
      // Add source
      map.addSource('experiences', {
        type: 'geojson',
        data: geoJSON
      })

      // Add markers
      map.addLayer({
        id: 'experiences-markers',
        type: 'circle',
        source: 'experiences',
        paint: {
          'circle-radius': 8,
          'circle-color': '#3b82f6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      })

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds()
      geoJSON.features.forEach((feature: any) => {
        bounds.extend(feature.geometry.coordinates)
      })
      map.fitBounds(bounds, { padding: 50 })
    })

    return () => map.remove()
  }, [geoJSON])

  return <div ref={mapContainer} className="h-96 rounded-lg" />
}
```

```typescript
// components/discover/visualizations/TimelineView.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function TimelineView({ data }: { data: any[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

✅ **Checkpoint:** Visualisierungen funktionieren

---

## 🧪 Phase 3: Testing (1h)

### Test 1: Simple Query

```
User: "UFO Sichtungen in Bayern"

Expected:
✅ unifiedSearch wird aufgerufen
✅ Experiences werden angezeigt
✅ Map wird gerendert (wenn Geo-Daten)
✅ Response < 5s
```

### Test 2: Complex Query

```
User: "Was sind Gemeinsamkeiten bei Nahtoderfahrungen?"

Expected:
✅ unifiedSearch mit mode: "explore"
✅ AI analysiert Patterns
✅ Dashboard mit Stats
✅ Response < 10s
```

### Test 3: Conversation

```
User: "Zeig mir Träume über Fliegen"
AI: [Shows results]

User: "Nur luzide Träume"
AI: [Filters based on context]

Expected:
✅ Context wird beibehalten
✅ Follow-up funktioniert
```

✅ **Checkpoint:** Alle Tests bestanden

---

## 📦 Phase 4: Deploy (30 Min)

### Step 4.1: Build testen

```bash
npm run build
```

### Step 4.2: Deploy zu Vercel

```bash
git add .
git commit -m "Add XPChat v3 Discovery Interface"
git push
```

### Step 4.3: ENV Vars in Vercel setzen

```
OPENAI_API_KEY
ANTHROPIC_API_KEY
MAPBOX_TOKEN (für Maps)
```

✅ **Checkpoint:** Production läuft!

---

## 🎯 Was du nach 8h hast

```
✅ Funktionierende Discovery Chat
✅ 2 Tools (Search + Visualize)
✅ Maps + Timeline Visualisierungen
✅ Conversation Memory
✅ RLS-safe
✅ Production deployed
```

---

## 🚀 Nächste Schritte (Phase 2-4, Wochen)

### Woche 1-2: Pattern Detection Tool

```typescript
// lib/ai/tools/discover-patterns.ts
- Temporal Pattern Detection
- Geographic Clustering
- Semantic Pattern Matching
- Confidence Scores
```

### Woche 3-4: Auto-Matching & Notifications

```
- Background Jobs
- Pattern Detection on Submit
- Smart Notifications
- Proactive Insights Feed
```

### Woche 5-6: Community Features

```
- Witness Connections
- Pattern Collaborations
- Expert Annotations
```

### Woche 7-8: Advanced Features

```
- Multi-Model Strategy
- Advanced Analytics
- Research Tools
- API Export
```

---

## 📊 Erfolgsmetriken

Nach 8h Launch:
- [ ] 5 Beta User testen
- [ ] Average Response Time < 5s
- [ ] 0 Critical Bugs
- [ ] Cost < $0.01/query

Nach Woche 2:
- [ ] 50 Users
- [ ] 75% Discovery Success Rate
- [ ] 30% Return Rate (7d)

Nach Monat 1:
- [ ] 500 Users
- [ ] 10% Contribution Rate
- [ ] Break-Even on costs

---

**Bereit zum Start? → Siehe TODO.md für Aufgaben-Checklist!** 🚀
