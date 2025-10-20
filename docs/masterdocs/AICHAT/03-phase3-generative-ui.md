# Phase 3: Generative UI

**Status:** ⏳ To-Do
**Duration:** Week 3
**Goal:** Build Perplexity-style interface with streaming React components

---

## 🎯 Objective

Transform tool outputs into **streaming, interactive UI components** that progressively render as data becomes available.

**Key Features:**
- ✅ Streaming text responses
- ✅ Progressive component rendering (loading → partial → complete)
- ✅ Interactive visualizations (click, zoom, filter)
- ✅ Follow-up suggestions
- ✅ Smooth animations

## 📋 Implementation Tasks

### Day 1-2: Create Renderable Components
- [ ] Interactive Map component (Leaflet/Mapbox)
- [ ] Timeline Chart (Recharts with interactions)
- [ ] Network Graph (react-force-graph)
- [ ] Pattern Insight Cards
- [ ] Experience Grid with infinite scroll

### Day 3: Build Chat Interface
- [ ] Discovery Chat UI (`/components/discovery/chat.tsx`)
- [ ] Implement `streamUI()` responses
- [ ] Add loading skeletons for each component type
- [ ] Wire up interactive events

### Day 4: Polish & Interactivity
- [ ] Add follow-up suggestion chips
- [ ] Implement conversation history sidebar
- [ ] Polish animations & transitions
- [ ] Mobile-responsive design

### Day 5: Testing & Deploy
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to production

## 🚀 API Endpoint: `/app/api/ui/route.ts`

```typescript
import { streamUI } from 'ai/rsc'
import { gpt4o } from '@/lib/openai/ai-sdk-client' // ✅ Pre-configured provider
import { tool } from 'ai'
import { z } from 'zod'

// Import UI components
import { InteractiveMap } from '@/components/discovery/interactive-map'
import { TimelineChart } from '@/components/discovery/timeline-chart'
import { PatternInsightCard } from '@/components/discovery/pattern-insight-card'
import { ExperienceGrid } from '@/components/discovery/experience-grid'
import { ChatMessage } from '@/components/discovery/chat-message'
import { Skeleton, Card } from '@/components/ui'

const DISCOVERY_SYSTEM_PROMPT = `You are XPShare Discovery Assistant.

Your mission: Help users discover patterns in anomalous experiences.

When showing results:
1. Always start with a conversational insight
2. Use visualizations to clarify patterns
3. Highlight unexpected connections
4. Suggest follow-up questions

Available tools:
- search_experiences: Search and display experience grid
- show_map: Show geographic distribution
- show_timeline: Show temporal patterns
- show_pattern_insight: Display pattern cards`

export async function POST(req: Request) {
  const { message, conversationHistory } = await req.json()

  return streamUI({
    model: gpt4o,
    messages: [
      { role: 'system', content: DISCOVERY_SYSTEM_PROMPT },
      ...conversationHistory, // ✅ Context from previous turns
      { role: 'user', content: message }
    ],

    // ✅ Text responses stream as ChatMessage
    text: ({ content }) => <ChatMessage>{content}</ChatMessage>,

    // ✅ Tools with progressive rendering
    tools: {
      // Tool 1: Search & Display Results
      search_experiences: tool({
        description: 'Search for experiences and display as grid',
        parameters: z.object({
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          location: z.string().optional(),
        }),
        generate: async function* (params) {
          // 1️⃣ Loading state (instant feedback)
          yield (
            <Card className="animate-pulse">
              <Skeleton className="h-32" />
              <p className="text-sm text-muted-foreground">
                Suche in {params.location || 'allen Regionen'}...
              </p>
            </Card>
          )

          // 2️⃣ Execute search
          const results = await searchExperiences(params)

          // 3️⃣ Stream final UI
          return (
            <ExperienceGrid experiences={results}>
              <div className="text-sm text-muted-foreground mt-4">
                ✨ Gefunden: {results.length} Erfahrungen
              </div>
            </ExperienceGrid>
          )
        }
      }),

      // Tool 2: Show Interactive Map
      show_map: tool({
        description: 'Show experiences on interactive map',
        parameters: z.object({
          experienceIds: z.array(z.string())
        }),
        generate: async function* ({ experienceIds }) {
          // 1️⃣ Loading
          yield <Skeleton className="h-96 w-full" />

          // 2️⃣ Fetch map data
          const mapData = await getGeoData(experienceIds)

          // 3️⃣ Render interactive map
          return (
            <InteractiveMap
              markers={mapData.markers}
              clusters={mapData.clusters}
              heatmap={mapData.heatmap}
              onMarkerClick={(exp) => {
                // Trigger new search for similar experiences
              }}
            />
          )
        }
      }),

      // Tool 3: Show Timeline
      show_timeline: tool({
        description: 'Show temporal patterns in timeline',
        parameters: z.object({
          experienceIds: z.array(z.string()),
          groupBy: z.enum(['hour', 'day', 'month', 'year']).default('day')
        }),
        generate: async function* ({ experienceIds, groupBy }) {
          // 1️⃣ Loading
          yield <Skeleton className="h-64 w-full" />

          // 2️⃣ Fetch timeline data
          const timelineData = await getTimelineData(experienceIds, groupBy)

          // 3️⃣ Render interactive timeline
          return (
            <TimelineChart
              data={timelineData}
              interactive={true}
              onRangeSelect={(range) => {
                // User selects time range → trigger new search
                console.log('Selected range:', range)
              }}
            />
          )
        }
      }),

      // Tool 4: Show Pattern Insights
      show_pattern_insight: tool({
        description: 'Display detected pattern as insight card',
        parameters: z.object({
          pattern: z.string(),
          confidence: z.number(),
          dataPoints: z.array(z.any())
        }),
        generate: async function* (params) {
          // No loading needed for instant cards
          return (
            <PatternInsightCard
              pattern={params.pattern}
              confidence={params.confidence}
              dataPoints={params.dataPoints}
            />
          )
        }
      })
    }
  })
}
```

## 🎨 UI Components

### 1. InteractiveMap Component

```typescript
// components/discovery/interactive-map.tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  markers: { lat: number; lng: number; title: string; id: string }[]
  clusters?: { region: string; count: number }[]
  heatmap?: { lat: number; lng: number; intensity: number }[]
  onMarkerClick?: (exp: any) => void
}

export function InteractiveMap({ markers, clusters, onMarkerClick }: Props) {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={6}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          eventHandlers={{
            click: () => onMarkerClick?.(marker)
          }}
        >
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

### 2. TimelineChart Component

```typescript
// components/discovery/timeline-chart.tsx
'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; count: number }[]
  interactive?: boolean
  onRangeSelect?: (range: { from: string; to: string }) => void
}

export function TimelineChart({ data, interactive, onRangeSelect }: Props) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>

      {interactive && (
        <p className="text-xs text-muted-foreground mt-2">
          💡 Click and drag to select a time range
        </p>
      )}
    </div>
  )
}
```

### 3. PatternInsightCard Component

```typescript
// components/discovery/pattern-insight-card.tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  pattern: string
  confidence: number
  dataPoints: any[]
}

export function PatternInsightCard({ pattern, confidence, dataPoints }: Props) {
  const confidenceColor = confidence > 0.8 ? 'green' : confidence > 0.6 ? 'yellow' : 'gray'

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💡 Muster erkannt
          <Badge variant={confidenceColor}>
            {(confidence * 100).toFixed(0)}% Konfidenz
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">{pattern}</CardDescription>
        <p className="text-xs text-muted-foreground mt-2">
          Basierend auf {dataPoints.length} Datenpunkten
        </p>
      </CardHeader>
    </Card>
  )
}
```

## ✅ Success Criteria

- [ ] Perplexity-style UX (streaming text + components)
- [ ] Response time < 3s for first token
- [ ] All visualizations interactive (click, zoom, filter)
- [ ] Mobile-responsive design
- [ ] Smooth animations (framer-motion)
- [ ] 95%+ user satisfaction

## 🎬 User Experience Flow

**User Query:** "zeige mir ufo träume in europa"

**Streaming Response:**

1. **0ms:** Loading skeleton appears
2. **500ms:** Text starts streaming: "Ich suche nach UFO-Träumen in Europa..."
3. **1.5s:** Text continues: "Gefunden! Hier sind 3 interessante Erfahrungen..."
4. **2s:** Experience Grid appears (progressive render)
5. **2.5s:** Map component loads
6. **3s:** Timeline chart appears
7. **3.5s:** Pattern insight card: "💡 Alle 3 Träume fanden nachts statt"
8. **4s:** Follow-up suggestions appear

**Total perceived latency:** 2-3s ✅

## 💰 Performance Optimization

**Strategies:**
- Lazy load heavy components (maps, charts)
- Use React Suspense for code splitting
- Optimize images with next/image
- Cache visualization data
- Debounce interactive events

**Target Metrics:**
- First token: < 1s
- First component: < 2s
- Full page load: < 4s

## 📚 Related Files

- [05-best-practices.md](./05-best-practices.md) - AI SDK 5.0 streamUI() patterns
- [00-overview.md](./00-overview.md) - Architecture overview

---

**Status:** ⏳ Phase 3 To-Do
**Prerequisites:** Phase 2 must be complete (all 6 tools implemented)
**Next:** Build components and integrate with `/app/api/ui/route.ts`
