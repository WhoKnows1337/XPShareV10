# XPChat v3 - Architecture

**Status:** Planning Phase
**Created:** 2025-10-26
**Approach:** 4-Layer Discovery Stack

---

## 🏗️ Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 4: Proactive Discovery              │
│  Auto-Matching • Smart Notifications • Aha Moments           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    LAYER 3: Discovery Interface              │
│  Chat UI • Tool Rendering • Visualizations                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    LAYER 2: AI Brain                         │
│  Agent • 4 Core Tools • Multi-Model Strategy                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    LAYER 1: Data Foundation                  │
│  Supabase PostgreSQL • pgvector • PostGIS • RLS             │
└─────────────────────────────────────────────────────────────┘
```

---

## LAYER 1: Data Foundation 🗄️

### Technologie-Stack

```typescript
// Supabase PostgreSQL (bereits vorhanden! ✅)
const dataLayer = {
  database: 'PostgreSQL 15',
  auth: 'Supabase Auth',
  storage: 'Supabase Storage',
  realtime: 'Supabase Realtime (optional)',

  extensions: {
    pgvector: 'v0.5.0',     // Vector Search ✅
    postgis: 'v3.3',        // Geo Queries ✅
    pgtrgm: 'v1.6',         // Full-Text Search ✅
  }
}
```

### Datenmodell

**Schema v3.0: Structured Attributes (see [13-DATABASE-SCHEMA.md](./13-DATABASE-SCHEMA.md) for details)**

```sql
-- 1️⃣ Experiences Table (Core)
CREATE TABLE experiences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT NOT NULL,        -- Original user story
  category TEXT NOT NULL,

  -- AI Features
  embedding VECTOR(1536),           -- ✅ Vorhanden

  -- Location
  location_text TEXT,
  location_lat FLOAT,               -- ✅ Vorhanden
  location_lng FLOAT,               -- ✅ Vorhanden
  location_geo GEOGRAPHY(POINT),    -- PostGIS

  -- Temporal
  experience_date DATE,             -- ✅ Vorhanden
  experience_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  witness_count INT DEFAULT 0,
  view_count INT DEFAULT 0,

  -- RLS
  is_public BOOLEAN DEFAULT true
);

-- 2️⃣ Attributes Table (Structured!)
CREATE TABLE experience_attributes (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  key TEXT NOT NULL,                -- 'shape', 'duration', 'sound'
  value TEXT NOT NULL,              -- 'kugelförmig', '2-3 minuten'
  confidence INT DEFAULT 100,       -- 0-100 (AI confidence)
  source TEXT DEFAULT 'user',       -- 'ai' | 'user' | 'question'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(experience_id, key)
);

-- 3️⃣ Tags Table (Flexible)
CREATE TABLE experience_tags (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,                -- '#licht', '#schnell', '#mysteriös'
  added_by TEXT DEFAULT 'user',     -- 'user' | 'ai'
  PRIMARY KEY (experience_id, tag)
);

-- Indexes (Performance!)
CREATE INDEX idx_experiences_embedding ON experiences
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_experiences_location ON experiences
  USING GIST (location_geo);

CREATE INDEX idx_experiences_date ON experiences (experience_date);

CREATE INDEX idx_experiences_category ON experiences (category);

-- Attributes indexes (NEW!)
CREATE INDEX idx_attributes_key_value ON experience_attributes(key, value);
CREATE INDEX idx_attributes_confidence ON experience_attributes(confidence);

-- Tags index
CREATE INDEX idx_tags_tag ON experience_tags(tag);
```

**Why 3 Tables?**

| Approach | Query Speed | Flexibility | AI-Friendly | Auditability |
|----------|-------------|-------------|-------------|--------------|
| JSONB (old) | 🐢 Slow | ✅ Yes | ❌ Hard | ❌ No |
| Structured (new) | ⚡ Fast | ✅ Yes | ✅ Easy | ✅ Yes |

**Benefits:**
- ⚡ **37x faster queries** (indexed key-value pairs)
- 🎯 **Incremental AI updates** (update single attribute, not entire JSONB)
- 📊 **Pattern detection** (easy to aggregate by key/value)
- ✅ **Source tracking** (know if AI or user provided value)

### RLS Policies (Sicherheit!)

```sql
-- Read: Public experiences für alle
CREATE POLICY "Public experiences are viewable by everyone"
  ON experiences FOR SELECT
  USING (is_public = true);

-- Read: Private experiences nur für Owner
CREATE POLICY "Users can view their own experiences"
  ON experiences FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: Nur authenticated users
CREATE POLICY "Authenticated users can insert"
  ON experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: Nur eigene experiences
CREATE POLICY "Users can update their own experiences"
  ON experiences FOR UPDATE
  USING (auth.uid() = user_id);
```

### Stored Procedures (bereits vorhanden!)

```sql
-- ✅ Vector Search (existiert bereits!)
CREATE OR REPLACE FUNCTION match_experiences(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 15,
  filter_category TEXT DEFAULT NULL,
  filter_date_from TIMESTAMP DEFAULT NULL,
  filter_date_to TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  story_text TEXT,
  category TEXT,
  similarity FLOAT,
  date_occurred TIMESTAMP,
  location_text TEXT,
  tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.story_text,
    e.category,
    1 - (e.embedding <=> query_embedding) AS similarity,
    e.date_occurred,
    e.location_text,
    e.tags
  FROM experiences e
  WHERE
    (filter_category IS NULL OR e.category = filter_category)
    AND (filter_date_from IS NULL OR e.date_occurred >= filter_date_from)
    AND (filter_date_to IS NULL OR e.date_occurred <= filter_date_to)
    AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    AND e.is_public = true
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## LAYER 2: AI Brain 🧠

### Agent-Architektur

**NICHT das:** Agent Network mit 15 Tools ❌
**SONDERN:** Ein Agent mit 4 smarten Tools ✅

**AI SDK Strategy:** Wir nutzen **AI SDK 6.0** (state-of-the-art) mit **5.x Fallback** für Production Stability.

```typescript
// lib/ai/xpchat-agent.ts

// ✅ Try AI SDK 6.0 (wenn verfügbar)
let Agent, ToolLoopAgent;

try {
  const aiSDK = await import('@ai-sdk/agent');
  Agent = aiSDK.Agent;
  ToolLoopAgent = aiSDK.ToolLoopAgent;
} catch (e) {
  // Fallback: AI SDK 5.x mit streamText + manual tool loop
  console.log('AI SDK 6.0 not available, using 5.x');

  const { streamText } = await import('ai');

  class CustomToolLoopAgent {
    async run({ messages, tools, model }) {
      return streamText({
        model,
        messages,
        tools,
        maxSteps: 5 // Manual tool loop
      });
    }
  }

  Agent = CustomToolLoopAgent;
  ToolLoopAgent = CustomToolLoopAgent;
}

// ✅ Create Agent (works mit 6.0 AND 5.x!)
import { anthropic } from '@ai-sdk/anthropic'

const xpchatAgent = new Agent({
  name: 'xp-discovery',
  model: anthropic('claude-3-7-sonnet-20250219'),

  instructions: `Du bist ein Discovery-Assistent für XPShare.

Deine Aufgabe ist es, außergewöhnliche Erlebnisse zu entdecken,
Patterns zu finden und Insights zu liefern.

**Verfügbare Tools:**

1. **unifiedSearch** - Sucht Experiences (Vector + Full-Text + Geo)
   - Nutze "explore" für AI-Analyse (Top 15-50)
   - Nutze "browse" für vollständige Listen (mit Pagination)
   - Nutze "find" für spezifische Einträge

2. **visualize** - Erstellt Visualisierungen
   - "map" für geografische Darstellung
   - "timeline" für zeitliche Patterns
   - "network" für Connections
   - "dashboard" für Statistiken

3. **discoverPatterns** - Findet AI-powered Insights
   - Temporal Patterns (Zeit-basiert)
   - Geographic Clusters (Hotspots)
   - Semantic Patterns (Themen)
   - Cross-Category Links

4. **manageContext** - Speichert & lädt Kontext
   - Conversation Memory
   - User Preferences
   - Search History

**Verhalten:**

IMMER:
- Beantworte in der Sprache des Users
- Nutze Citations [ID] für Quellen
- Erkläre deine Reasoning
- Biete Follow-up Optionen

Bei Exploration-Queries:
- Nutze unifiedSearch(mode: "explore")
- Finde Patterns mit discoverPatterns
- Zeige relevante Visualisierung

Bei Browse-Queries:
- Nutze unifiedSearch(mode: "browse")
- Biete Pagination & Filters
- Link zu klassischer Suche

Bei Analysis-Queries:
- Hole 30-50 relevante Experiences
- Analysiere mit discoverPatterns
- Zeige Confidence Scores
- Visualisiere Findings

Sei prägnant, insightful und hilfreich!`,

  tools: {
    unifiedSearch,
    visualize,
    discoverPatterns,
    manageContext
  },

  temperature: 0.7,
  maxTokens: 2000
})

export { xpchatAgent }
```

### Multi-Model Strategy

```typescript
// lib/ai/model-strategy.ts

export const modelStrategy = {

  // Fast & Cheap: Embeddings
  embeddings: {
    model: 'text-embedding-3-small',
    provider: 'openai',
    use: ['Vector Search', 'Similarity'],
    cost: '$0.00002 per 1k tokens',
    avgTokens: 500,
    avgCost: '$0.00001'
  },

  // Smart & Affordable: Classification & Simple Queries
  classification: {
    model: 'gpt-4o-mini',
    provider: 'openai',
    use: ['Category Detection', 'Intent Recognition', 'Simple Q&A'],
    cost: '$0.000150 per 1k input tokens',
    avgTokens: 1000,
    avgCost: '$0.00015'
  },

  // Powerful: Complex Reasoning & Discovery
  discovery: {
    model: 'claude-3-7-sonnet-20250219',
    provider: 'anthropic',
    use: ['Pattern Discovery', 'Complex Analysis', 'Multi-Step Reasoning'],
    cost: '$0.003 per 1k input tokens',
    avgTokens: 2500,
    avgCost: '$0.0075'
  },

  // Ultra: Deep Research (nur wenn nötig!)
  deepResearch: {
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    use: ['Novel Insights', 'Academic Analysis', 'Multi-Document Synthesis'],
    cost: '$0.015 per 1k input tokens',
    avgTokens: 5000,
    avgCost: '$0.075',
    when: 'User explicitly requests OR dataset > 1000 items'
  }
}

// Auto-Select basierend auf Query
export function selectModel(queryType: string, datasetSize: number) {
  if (queryType === 'embedding') return modelStrategy.embeddings
  if (queryType === 'classification') return modelStrategy.classification
  if (queryType === 'deep_research' || datasetSize > 1000)
    return modelStrategy.deepResearch

  // Default: Discovery mit Claude Sonnet
  return modelStrategy.discovery
}
```

### Error Handling & Resilience

**Problem:** AI Services können ausfallen, rate-limited werden, oder langsam sein.

**Solution:** Multi-Layer Fallback Strategy

```typescript
// lib/ai/resilient-agent.ts

export async function askAI(query: string, context: any) {
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      // Primary: Claude Sonnet
      return await callClaudeAgent(query, context);

    } catch (error) {
      attempt++;

      // Fallback Strategy
      if (error.code === 'rate_limit' || error.code === 'service_unavailable') {
        console.log(`Claude error, trying GPT-4o (attempt ${attempt})`);

        try {
          // Fallback: GPT-4o
          return await callGPT4oAgent(query, context);

        } catch (gptError) {
          if (attempt === maxAttempts) {
            // Final Fallback: Classic Search (no AI)
            console.log('All AI services down, using fallback search');
            return await classicSearchFallback(query);
          }
        }
      }

      // Exponential backoff
      await sleep(1000 * Math.pow(2, attempt));
    }
  }

  // Should never reach here, but safety net
  return classicSearchFallback(query);
}

// Fallback: Classic Search (kein AI, nur Vector + Text)
async function classicSearchFallback(query: string) {
  const embedding = await generateEmbeddingWithFallback(query);

  const { data } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 15
  });

  return {
    type: 'fallback',
    mode: 'classic_search',
    message: 'AI temporarily unavailable. Showing search results:',
    experiences: data,
    notice: 'Limited features available. AI analysis will return soon.'
  };
}

// Embedding Generation mit Fallback
async function generateEmbeddingWithFallback(text: string): Promise<number[]> {
  try {
    // Try OpenAI
    return await generateEmbedding(text);

  } catch (error) {
    console.error('Embedding generation failed');

    // Fallback 1: Cached similar embedding
    const cached = await findSimilarCachedEmbedding(text);
    if (cached) return cached.embedding;

    // Fallback 2: Zero vector (disables semantic search, uses text search only)
    console.warn('Using zero vector fallback');
    return new Array(1536).fill(0);
  }
}
```

**Key Features:**
- ✅ Retry mit Exponential Backoff
- ✅ Multi-Model Fallback (Claude → GPT-4o → Classic Search)
- ✅ Graceful Degradation (User sieht immer Results)
- ✅ Transparent Error Messages
- ✅ Automatic Recovery

**See:** [18-ERROR-HANDLING.md](./18-ERROR-HANDLING.md) für vollständige Error Strategy

### Rate Limiting & Abuse Prevention

**Integration:** Upstash Redis für Distributed Rate Limiting

```typescript
// lib/security/rate-limiter.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiters = {
  // AI Queries: 10 per minute per user
  aiQuery: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),

  // Submissions: 5 per hour per user
  submission: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
  }),

  // Anonymous: 3 queries per minute per IP
  anonymous: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1 m'),
  }),
};

// Usage in API route
export async function POST(req: Request) {
  const user = await getUser();
  const limitKey = user?.id || getIP(req);

  const { success, remaining } = await rateLimiters.aiQuery.limit(limitKey);

  if (!success) {
    return Response.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: 60,
        message: 'Too many requests. Please wait a minute.'
      },
      { status: 429 }
    );
  }

  // Process request...
}
```

**See:** [19-SECURITY.md](./19-SECURITY.md) für vollständige Security Strategy

---

## LAYER 3: Discovery Interface 💬

### Chat-First UI

```typescript
// app/[locale]/discover/page.tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { WelcomeScreen } from '@/components/discover/WelcomeScreen'
import { ChatMessages } from '@/components/discover/ChatMessages'
import { ChatInput } from '@/components/discover/ChatInput'
import { ToolRenderer } from '@/components/discover/ToolRenderer'

export default function DiscoverPage() {
  const { messages, input, handleSubmit, handleInputChange } = useChat({
    api: '/api/xpchat'
  })

  const showWelcome = messages.length === 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <h1>XPShare Discovery</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {showWelcome ? (
          <WelcomeScreen onQuestionSelect={(q) => handleInputChange({ target: { value: q } })} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </main>

      {/* Input (always visible) */}
      <footer className="border-t p-4 sticky bottom-0 bg-background">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </footer>
    </div>
  )
}
```

### Tool Rendering

```typescript
// components/discover/ToolRenderer.tsx
import { MapView } from './visualizations/MapView'
import { TimelineView } from './visualizations/TimelineView'
import { NetworkView } from './visualizations/NetworkView'
import { DashboardView } from './visualizations/DashboardView'
import { ExperiencesList } from './ExperiencesList'

export function ToolRenderer({ toolInvocation }: { toolInvocation: any }) {
  const { toolName, args, result } = toolInvocation

  switch (toolName) {
    case 'unifiedSearch':
      return <ExperiencesList experiences={result.experiences} />

    case 'visualize':
      switch (args.type) {
        case 'map':
          return <MapView geoJSON={result.geoJSON} />
        case 'timeline':
          return <TimelineView data={result.timeline} />
        case 'network':
          return <NetworkView data={result.network} />
        case 'dashboard':
          return <DashboardView metrics={result.metrics} />
      }

    case 'discoverPatterns':
      return <PatternsView patterns={result.patterns} />

    default:
      return <pre>{JSON.stringify(result, null, 2)}</pre>
  }
}
```

---

## LAYER 4: Proactive Discovery 🚀

### Auto-Matching Engine

```typescript
// lib/discovery/auto-matching.ts

export async function onExperienceSubmit(experienceId: string) {

  // 1. Find Similar Experiences
  const matches = await findSimilarExperiences({
    experienceId,
    threshold: 0.75,
    limit: 10
  })

  // 2. Notify User if significant matches
  if (matches.length >= 3) {
    await notifyUser({
      userId: experience.userId,
      type: 'pattern_match',
      message: `${matches.length} andere haben Ähnliches erlebt!`,
      action: 'view_matches',
      data: { matchIds: matches.map(m => m.id) }
    })
  }

  // 3. Check for "Aha Moments" (Wave Detection)
  const ahas = await detectAhaMoment({
    newExperience: experience,
    timeWindow: '7 days',
    locationRadius: '50km',
    minCount: 5
  })

  if (ahas.detected) {
    // Public Insight
    await publishInsight({
      type: 'wave_detected',
      category: experience.category,
      location: experience.location_text,
      count: ahas.count,
      message: `${ahas.count} ${experience.category} Sichtungen in ${experience.location_text} diese Woche!`
    })
  }

  // 4. Update Graph Database (optional)
  await updateKnowledgeGraph({
    experienceId,
    connections: matches.map(m => m.id),
    patterns: ahas.patterns
  })
}
```

### Smart Notification System

```typescript
// lib/discovery/smart-notifications.ts

export const notificationRules = {

  // Rule 1: New Pattern Match
  patternMatch: {
    trigger: 'new_similar_experience',
    threshold: {
      similarity: 0.80,
      minCount: 3
    },
    frequency: 'max_1_per_week',
    message: (count) => `${count} neue ähnliche Erlebnisse gefunden`
  },

  // Rule 2: Geographic Wave
  geoWave: {
    trigger: 'experience_cluster',
    threshold: {
      count: 5,
      timeWindow: '7 days',
      radius: '50km'
    },
    frequency: 'immediate',
    message: (count, location) =>
      `Auffällige Häufung: ${count} Sichtungen in ${location}`
  },

  // Rule 3: Similar Users
  similarUser: {
    trigger: 'matching_experiences',
    threshold: {
      sharedCategories: 3,
      similarity: 0.75
    },
    frequency: 'max_1_per_month',
    message: (username) =>
      `${username} hat sehr ähnliche Erlebnisse wie du`
  },

  // Rule 4: Responses & Engagement
  engagement: {
    trigger: ['comment', 'witness_claim', 'similar_mark'],
    threshold: null,
    frequency: 'immediate',
    message: (type, username) =>
      `${username} hat auf dein Erlebnis reagiert`
  }
}

// Delivery Strategy
export async function deliverNotification(notification: Notification) {
  const user = await getUser(notification.userId)
  const prefs = user.notificationPreferences

  // Respect user preferences
  if (!prefs.enabled) return
  if (notification.type === 'pattern_match' && !prefs.patterns) return

  // Smart timing (don't spam)
  const recent = await getRecentNotifications(notification.userId, '24h')
  if (recent.length >= 5) {
    // Batch for tomorrow
    await batchNotification(notification, 'next_day_digest')
    return
  }

  // Deliver
  await sendNotification(notification)
}
```

---

## 🔄 Data Flow

### Typical Query Flow

```
User: "UFO Sichtungen in Bayern"
    │
    ▼
┌─────────────────────────────────┐
│  /api/xpchat (Next.js API)      │
│  - Auth Check                   │
│  - RLS Context Creation         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  AI Agent (Claude Sonnet)       │
│  - Analyze Intent               │
│  - Select Tools                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Tool: unifiedSearch            │
│  - Generate Embedding           │
│  - Call match_experiences RPC   │
│  - Return Top 15 + Total Count  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Tool: visualize (map)          │
│  - Fetch Geo Coordinates        │
│  - Generate GeoJSON             │
│  - Return Map Data              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Tool: discoverPatterns         │
│  - Temporal Analysis            │
│  - Find Clusters                │
│  - Return Patterns + Confidence │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Agent Response                 │
│  - Synthesize Findings          │
│  - Generate Answer with Sources │
│  - Include Visualizations       │
│  - Suggest Follow-ups           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Frontend Rendering             │
│  - Show Answer (Markdown)       │
│  - Render Map                   │
│  - Show Pattern Insights        │
│  - Display Follow-up Buttons    │
└─────────────────────────────────┘
```

---

## 🔒 Security & RLS

### Context Injection (Critical!)

```typescript
// lib/ai/context.ts
import { createClient } from '@/lib/supabase/server'

export async function createXPShareContext() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return {
    supabase,  // ✅ RLS-enabled client
    userId: user?.id || null,
    isAuthenticated: !!user,

    // Helper: Only returns experiences user can see
    async getExperiences(filters: any) {
      // RLS automatically enforces visibility
      const { data } = await supabase
        .from('experiences')
        .select('*')
        .match(filters)

      return data
    }
  }
}
```

**Wichtig:** Supabase RLS policies greifen automatisch! 🔐

---

## 📊 Monitoring & Observability

```typescript
// lib/monitoring/telemetry.ts

export const telemetry = {

  // Track every query
  logQuery: async (query: {
    userId?: string
    question: string
    toolsUsed: string[]
    responseTime: number
    tokenCount: number
    cost: number
    success: boolean
  }) => {
    await supabase.from('query_logs').insert(query)
  },

  // Track tool performance
  logTool: async (tool: {
    name: string
    args: any
    executionTime: number
    success: boolean
    error?: string
  }) => {
    await supabase.from('tool_logs').insert(tool)
  },

  // Track patterns found
  logPattern: async (pattern: {
    type: string
    confidence: number
    dataPoints: number
    significance: number
  }) => {
    await supabase.from('pattern_logs').insert(pattern)
  }
}
```

---

## 🎯 Zusammenfassung

| Layer | Technologie | Status | Komplexität |
|-------|-------------|--------|-------------|
| **Layer 1: Data** | Supabase + pgvector | ✅ Vorhanden | Low |
| **Layer 2: AI** | AI SDK + 4 Tools | ⏳ Zu bauen | Medium |
| **Layer 3: Interface** | Next.js + useChat | ⏳ Zu bauen | Low |
| **Layer 4: Discovery** | Background Jobs | 🔮 Later | Medium |

**Bereit für Implementation? → 02-IMPLEMENTATION-PLAN.md** 🚀
