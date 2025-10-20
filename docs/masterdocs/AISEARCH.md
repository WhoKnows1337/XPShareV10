# XPShare AI Discovery System - Complete Blueprint

**Status:** Planning → Implementation
**Created:** 2025-10-19
**Version:** 1.0

---

## 📋 Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Research Findings](#research-findings)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Core Tools & Capabilities](#core-tools--capabilities)
6. [Attribute-Based Search & Filtering](#attribute-based-search--filtering)
7. [UI/UX Design Principles](#uiux-design-principles)
8. [User Onboarding & First-Time Experience](#user-onboarding--first-time-experience)
9. [Trust & Safety Framework](#trust--safety-framework)
10. [Social Proof & Trust Signals](#social-proof--trust-signals)
11. [Voice & Multimodal Interaction](#voice--multimodal-interaction)
12. [Serendipity Engine (Anti-Filter Bubble)](#serendipity-engine-anti-filter-bubble)
13. [Community & Social Features](#community--social-features)
14. [Implementation Plan](#implementation-plan)
15. [Code Examples](#code-examples)
16. [Migration Strategy](#migration-strategy)
17. [Cost Analysis](#cost-analysis)
18. [Success Metrics](#success-metrics)

---

## 🎯 Vision & Goals

### The Problem

Current XPShare search suffers from:
- ❌ Manual keyword extraction with Stop-Word-Liste maintenance
- ❌ Frustrating UX: "Keine exakten Treffer mit 'jemand, schon' gefunden"
- ❌ Users must learn "correct" search syntax
- ❌ No conversational follow-ups
- ❌ Limited pattern discovery capabilities

### The Vision

Transform XPShare into a **Conversational Discovery Platform** where:
- ✅ Users ask questions in natural language
- ✅ AI understands intent and extracts filters automatically
- ✅ System generates dynamic visualizations (Maps, Charts, Networks)
- ✅ Patterns are detected and surfaced automatically
- ✅ Community connections are discovered
- ✅ Follow-up questions work contextually

### Inspiration

**Enigma Labs** (UFO Sighting Platform):
- Real-time community alerts
- Structured data + Trend analysis
- Pattern detection through AI
- Mobile-first community discussion

**Perplexity AI** (Search + Discovery):
- Natural language queries
- Tool calling for data retrieval
- Streaming responses with citations
- Interactive visualizations

**XPShare Goal:** Be the Enigma Labs for ALL anomalous experiences, not just UFOs.

---

## 🔬 Research Findings

### Key Insights from Industry

#### 1. Conversational UI Best Practices (AIMultiple Research)

**Context-Aware Design:**
- Collect user preferences, location, history
- Maintain conversation context across sessions
- Real-time data integration

**Emotional Intelligence:**
- Sentiment analysis for empathetic responses
- Tone and intent recognition
- Align responses with user emotions

**Domain Narrowing:**
- Focus on Discovery use case
- Don't build universal assistant
- Provide clear cues and constraints

**Transparency & Control:**
- Always inform users it's AI
- Clear path to human assistance
- User controls conversation flow

**Continuous Learning:**
- ML-based improvements from interactions
- Track satisfaction and failure points
- A/B test conversation patterns

#### 2. Qualitative Research Patterns (Insight7)

XPShare IS a qualitative research platform for experiences. We need:

**Thematic Analysis:**
- Auto-clustering similar experiences
- Topic modeling (LDA, embeddings)
- Semantic grouping

**Cross-Case Analysis:**
- Compare data from multiple sources
- Identify overarching patterns
- Merge diverse datasets (interviews, submissions, etc.)

**Sentiment Tracking:**
- Emotional tone detection
- Multi-dimensional sentiment (fear, wonder, confusion)
- Temporal sentiment changes

**Data Visualization:**
- Journey maps (user experience paths)
- Network graphs (connections between experiences)
- Heatmaps (geographic + temporal patterns)
- Word clouds (common themes)

#### 3. Hybrid Search Architecture (Industry Standard)

Modern systems (Shopify, GitHub Copilot, Voiceflow) use:

```
User Query → Vector Search (Semantic)
           → Full-Text Search (PostgreSQL FTS)
           → Reciprocal Rank Fusion (RRF)
           → Ranked Results
```

**NOT manual keyword extraction!** PostgreSQL does:
- Stop-word filtering
- Stemming/Lemmatization
- Normalization
- All automatically

#### 4. Generative UI Patterns (Vercel AI SDK)

**Streaming Components:**
```typescript
Tool Call → Loading Skeleton (instant)
         → Partial Data (progressive)
         → Full Component (complete)
         → Insight Text (AI-generated)
```

**Progressive Enhancement:**
- User sees feedback immediately
- Data loads incrementally
- Smooth transitions
- No jarring state changes

**Interactive Visualizations:**
- Click events trigger new queries
- Zoom/pan on charts
- Filter on maps
- Drill-down on networks

---

## 🏗️ Architecture Overview

### Three-Phase Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER QUERY                                │
│     "hatte jemand in europa von ufos geträumt               │
│      aber keine blauen?"                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: LLM Query Parser                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Model: gpt-4o-mini (fast, cheap)                    │   │
│  │ Input: Natural language question                    │   │
│  │ Output: Structured intent + filters                 │   │
│  │                                                      │   │
│  │ {                                                    │   │
│  │   intent: "search",                                 │   │
│  │   filters: {                                        │   │
│  │     category: "dreams",                             │   │
│  │     tags: ["ufo"],                                  │   │
│  │     location: "europa",                             │   │
│  │     exclude: { color: "blue" }                      │   │
│  │   },                                                │   │
│  │   confidence: 0.95                                  │   │
│  │ }                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           PHASE 2: Tool Calling Agent                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Search     │  │   Pattern    │  │  Sentiment   │     │
│  │   Tool       │  │   Detection  │  │  Analysis    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Connections  │  │ Visualization│  │  Statistics  │     │
│  │   Tool       │  │    Tool      │  │    Tool      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  LLM (gpt-4o) decides which tools to call, in what order   │
│  Multi-step reasoning: Search → Pattern → Visualize        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          PHASE 3: Generative UI Response                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Streaming Components (React Server Components)      │   │
│  │                                                      │   │
│  │ 1. Text Response (AI-written insight)               │   │
│  │ 2. Interactive Map (clustered markers)              │   │
│  │ 3. Timeline Chart (temporal patterns)               │   │
│  │ 4. Pattern Cards (auto-detected insights)           │   │
│  │ 5. Experience Cards (related results)               │   │
│  │ 6. Follow-up Suggestions (next questions)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example

**User Query:**
```
"hatte jemand in europa von ufos geträumt aber keine blauen?"
```

**Phase 1 Output (Query Parser):**
```json
{
  "intent": "search",
  "filters": {
    "category": "dreams",
    "tags": ["ufo"],
    "location": "europa",
    "exclude": { "color": "blue" }
  },
  "naturalLanguageQuery": "UFO dreams in Europe, excluding blue UFOs",
  "confidence": 0.95
}
```

**Phase 2 Actions (Tool Calling):**
```
1. search_experiences({ category: "dreams", tags: ["ufo"], location: "europa" })
   → Returns 3 experiences

2. detect_patterns({ experienceIds: [...], types: ["temporal", "geographic"] })
   → Pattern: All 3 at night (22-3 Uhr)
   → Pattern: 2 in Germany, 1 in France

3. visualize_data({ type: "map", experienceIds: [...] })
   → Generates map coordinates + clusters
```

**Phase 3 Output (Generative UI):**
```tsx
<DiscoveryResponse>
  <TextInsight>
    Ja, ich habe 3 UFO-Träume in Europa gefunden (ohne blaue UFOs):
  </TextInsight>

  <InteractiveMap
    markers={[...]}
    clusters={[{ region: "Germany", count: 2 }, { region: "France", count: 1 }]}
  />

  <TimelineChart
    data={[...]}
    highlightRange={{ from: "22:00", to: "03:00" }}
  />

  <PatternInsightCard>
    💡 Interessantes Muster: Alle 3 Träume fanden nachts statt (22-3 Uhr)
  </PatternInsightCard>

  <ExperienceGrid experiences={[...]} />

  <FollowUpSuggestions>
    - "Zeige mir alle nächtlichen Träume"
    - "Gibt es ein geografisches Pattern?"
    - "Wer hatte ähnliche Erfahrungen?"
  </FollowUpSuggestions>
</DiscoveryResponse>
```

---

## 🛠️ Technology Stack

### Core AI

| Technology | Version | Purpose | Cost |
|-----------|---------|---------|------|
| OpenAI gpt-4o-mini | Latest | Query parsing (Phase 1) | $0.15/1M input tokens |
| OpenAI gpt-4o | Latest | Tool calling agent (Phase 2) | $2.50/1M input tokens |
| OpenAI text-embedding-3-small | 1536 dims | Vector embeddings | $0.02/1M tokens |
| Vercel AI SDK | 5.x | Generative UI + Streaming | Free |

**📌 Note on Embedding Model Choice:**

We use `text-embedding-3-small` (1536 dims) instead of `text-embedding-3-large` (3072 dims) due to a **pgvector limitation** on Supabase:

- ⚠️ **Supabase pgvector 0.8.0 has a 2,000 dimension limit** for both IVFFlat and HNSW indexes
- `text-embedding-3-large` produces 3,072 dimensions (exceeds index limit)
- `text-embedding-3-small` is more cost-effective ($0.02 vs $0.13 per 1M tokens)
- For our dataset size (~111 experiences), accuracy difference is negligible

**Future Upgrade Path:** When Supabase upgrades to pgvector 0.9.0+ (16,000 dim limit), we can:
- Use `text-embedding-3-large` with `dimensions: 1536` parameter (better accuracy than small)
- Or remove indexes entirely for small datasets (<10,000 rows) and use sequential scan

### Database & Search

| Technology | Purpose | Notes |
|-----------|---------|-------|
| PostgreSQL 15+ | Primary database | Hosted on Supabase |
| pgvector 0.8.0 | Vector similarity search | **⚠️ 2,000 dim limit for indexes** |
| PostgreSQL Full-Text Search | Keyword search (tsvector) | Built-in FTS |
| Supabase | Database hosting + Auth | Managed Postgres |

### Visualization

| Library | Purpose | Examples |
|---------|---------|----------|
| Recharts | Charts (Bar, Line, Area, Scatter) | Timeline, Distribution |
| Tremor | Modern dashboard components | Heatmaps, KPI Cards |
| react-force-graph | Network visualizations | Connection graphs |
| Leaflet / Mapbox | Interactive maps | Geographic patterns |
| framer-motion | Animations & Transitions | Smooth UI updates |

### UI Framework

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | App Router + RSC |
| React 19 | UI Components |
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| TypeScript 5+ | Type safety |

---

## 🔧 Core Tools & Capabilities

### Tool 1: Search Experiences

**Description:** Search for experiences matching natural language criteria.

**Parameters:**
```typescript
interface SearchParams {
  category?: string
  tags?: string[]
  location?: string
  dateRange?: {
    from?: string
    to?: string
  }
  witnessesOnly?: boolean
  exclude?: {
    color?: string
    tags?: string[]
  }
  similarTo?: string // Experience ID for similarity search
  maxResults?: number
}
```

**Implementation:**
```typescript
// lib/ai/tools/search-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const SearchParamsSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  // ... other params
})

export const searchExperiencesTool = tool({
  description: 'Search for experiences matching filters. Use for discovery queries.',
  parameters: SearchParamsSchema,
  execute: async (params) => {
    // 1. Generate embedding for semantic search
    const embedding = await generateEmbedding(params.naturalQuery || '')

    // 2. Hybrid search (Vector + Full-Text + RRF)
    const results = await hybridSearch({
      embedding,
      filters: params,
      maxResults: params.maxResults || 15
    })

    // 3. Return structured results
    return {
      experiences: results,
      count: results.length,
      hasMore: results.length === params.maxResults
    }
  }
})
```

### Tool 2: Detect Patterns

**Description:** Automatically detect patterns in experiences.

**Pattern Types:**
- **Temporal**: Time-based patterns (time of day, day of week, seasonal)
- **Geographic**: Location-based clusters, regional trends
- **Semantic**: Similar themes, shared vocabulary, topic clusters
- **Emotional**: Sentiment patterns, emotional arcs
- **Cross-Category**: Connections between different experience types

**Parameters:**
```typescript
interface PatternParams {
  experienceIds: string[]
  patternTypes: ('temporal' | 'geographic' | 'semantic' | 'emotional' | 'crossCategory')[]
  minConfidence?: number // 0-1, default 0.7
  groupBy?: 'location' | 'category' | 'tag'
}
```

**Output Example:**
```json
{
  "patterns": [
    {
      "type": "temporal",
      "description": "3 of 3 experiences occurred at night (22:00-03:00)",
      "confidence": 0.95,
      "dataPoints": [
        { "time": "22:30", "count": 1 },
        { "time": "01:15", "count": 2 }
      ]
    },
    {
      "type": "geographic",
      "description": "Cluster detected: 2 experiences in Germany",
      "confidence": 0.88,
      "center": { "lat": 51.5, "lng": 10.4 },
      "radius": 200
    }
  ]
}
```

### Tool 3: Find Connections

**Description:** Discover relationships between experiences.

**Connection Types:**
- **Similarity**: Semantic similarity (embeddings distance)
- **Co-occurrence**: Share same tags/locations/timeframes
- **User Network**: Users with multiple similar experiences
- **Witness Connections**: Cross-referenced witnesses

**Parameters:**
```typescript
interface ConnectionParams {
  experienceIds: string[]
  connectionTypes: ('similarity' | 'coOccurrence' | 'userNetwork' | 'witnesses')[]
  threshold?: number // Minimum connection strength (0-1)
}
```

**Output:**
```json
{
  "connections": [
    {
      "from": "exp-123",
      "to": "exp-456",
      "type": "similarity",
      "strength": 0.92,
      "reason": "Both describe hovering lights in night sky"
    },
    {
      "from": "exp-123",
      "to": "exp-789",
      "type": "coOccurrence",
      "strength": 0.85,
      "sharedAttributes": ["location:Berlin", "tag:ufo", "timeframe:night"]
    }
  ]
}
```

### Tool 4: Analyze Sentiment

**Description:** Multi-dimensional sentiment analysis.

**Sentiment Dimensions:**
- **Valence**: Positive/Negative
- **Arousal**: Calm/Excited
- **Emotion**: Fear, Wonder, Confusion, Awe, Disbelief, Curiosity

**Parameters:**
```typescript
interface SentimentParams {
  experienceIds: string[]
  dimensions: ('valence' | 'arousal' | 'fear' | 'wonder' | 'confusion' | 'awe')[]
  includeTimeSeries?: boolean
}
```

**Output:**
```json
{
  "aggregate": {
    "valence": 0.65,      // Slightly positive
    "arousal": 0.82,      // High arousal
    "fear": 0.45,         // Moderate fear
    "wonder": 0.88        // High wonder
  },
  "distribution": {
    "positive": 12,
    "neutral": 3,
    "negative": 2
  }
}
```

### Tool 5: Generate Visualization

**Description:** Prepare data for visualization components.

**Visualization Types:**
- **Map**: Geographic distribution with clusters
- **Timeline**: Temporal distribution (bar/line/area chart)
- **Network**: Connection graph between experiences
- **Heatmap**: 2D density (time × location, category × sentiment)
- **Distribution**: Category/tag frequency

**Parameters:**
```typescript
interface VisualizationParams {
  type: 'map' | 'timeline' | 'network' | 'heatmap' | 'distribution'
  experienceIds: string[]
  config?: {
    timeGranularity?: 'hour' | 'day' | 'week' | 'month' | 'year'
    clusterRadius?: number // For maps
    networkLayout?: 'force' | 'hierarchical' | 'radial'
  }
}
```

**Output (Map Example):**
```json
{
  "type": "map",
  "markers": [
    {
      "id": "exp-123",
      "lat": 52.52,
      "lng": 13.405,
      "title": "UFO Dream in Berlin",
      "category": "dreams"
    }
  ],
  "clusters": [
    {
      "center": { "lat": 52.5, "lng": 13.4 },
      "count": 2,
      "radius": 50
    }
  ],
  "heatmap": {
    "points": [...]
  }
}
```

### Tool 6: Get Statistics

**Description:** Compute aggregate statistics.

**Metrics:**
- Total count by category/tag/location
- Temporal trends (growth rate, seasonality)
- User engagement (submissions per user, average witnesses)
- Data quality (completeness scores)

---

## 🎨 Attribute-Based Search & Filtering

### Why Attributes Matter

**The Hidden Goldmine in XPShare's Data Model**

During experience submission, we already extract **structured attributes** via OpenAI:

```typescript
// From /api/extract/route.ts - Already implemented!
{
  "location": { "value": "Zürich", "confidence": 0.95 },
  "date": { "value": "2024-10-15", "confidence": 0.88 },
  "time": { "value": "22:30", "confidence": 0.92 },
  "category": { "value": "UAP Sighting", "confidence": 0.90 },
  "size": { "value": "car-sized", "confidence": 0.75 },
  "duration": { "value": "5 minutes", "confidence": 0.85 },
  "emotions": { "value": ["fear", "awe"], "confidence": 0.80 }
}
```

**Database Schema (Already exists!):**

```sql
-- experience_attributes table
CREATE TABLE experience_attributes (
  experience_id uuid,
  attribute_key text,        -- "shape", "color", "sound", "emotion"
  attribute_value text,       -- Canonical: "triangle", "red", "humming", "fear"
  confidence float,           -- 0.0-1.0
  source text,                -- 'ai_extracted' | 'user_confirmed'
  evidence text               -- Text snippet that supports this
)

-- Example data:
experience_id | attribute_key | attribute_value | confidence
-------------|--------------|----------------|------------
abc-123      | shape        | triangle       | 0.92
abc-123      | color        | red            | 0.88
abc-123      | sound        | humming        | 0.75
abc-123      | emotion      | fear           | 0.85
```

**Types of Attributes:**
- **Physical**: shape, color, size, surface, texture, sound, smell
- **Temporal**: time_of_day, duration, frequency
- **Emotional**: emotions (fear, awe, curiosity, confusion)
- **Contextual**: weather, witnesses, location_type
- **Behavioral**: movement_pattern, speed, direction

### Category-Specific Attributes (Real Data from XPShare DB)

**🔑 Key Insight:** Different experience categories have vastly different attributes!

XPShare's `attribute_schema` table contains **170+ attributes across 43 categories**. Here are the most sophisticated examples:

#### 🛸 UFO-UAP Category (12 attributes)
```typescript
{
  category_slug: "ufo-uap",
  attributes: [
    "shape",              // triangle, circle, cigar, disc, sphere
    "size",               // car-sized, building-sized, basketball-sized
    "light_color",        // red, blue, white, orange, multicolor
    "light_pattern",      // pulsing, steady, strobing, rotating
    "movement_type",      // hovering, zigzag, linear, erratic
    "movement",           // fast, slow, stationary, accelerating
    "sound",              // humming, silent, whooshing, buzzing
    "surface",            // metallic, glowing, translucent, dark
    "altitude",           // treetop, low, high, very_high
    "sky_location",       // north, south, east, west, overhead
    "disappearance",      // instant, gradual, behind_object, faded
    "phenomenon_color"    // General color descriptor
  ]
}
```

**Example Query:** "Show me silent triangle UFOs with pulsing red lights"
```typescript
{
  filters: {
    category: "ufo-uap",
    attributes: {
      include: {
        shape: ["triangle"],
        light_color: ["red"],
        light_pattern: ["pulsing"],
        sound: ["silent"]
      }
    }
  }
}
```

#### 💭 Dreams Category (12 attributes)
```typescript
{
  category_slug: "dreams",
  attributes: [
    "dream_type",           // lucid, prophetic, recurring, nightmare
    "lucidity",             // fully_lucid, semi_lucid, not_lucid
    "vividness",            // extremely_vivid, vivid, normal, vague
    "clarity_level",        // crystal_clear, clear, hazy, confusing
    "visual_quality",       // HD-like, normal, blurry, abstract
    "dream_color_experience", // full_color, muted_color, black_white
    "dream_emotion",        // joy, fear, neutral, mixed, intense
    "dream_symbol",         // water, flying, falling, teeth, animals
    "dream_frequency_color", // always_color, mostly_color, rarely_color
    "dream_frequency_bw",    // always_bw, mostly_bw, rarely_bw
    "dream_recent_color",    // yes, no, unsure
    "dream_recent_bw"        // yes, no, unsure
  ]
}
```

**Example Query:** "Lucid dreams with crystal-clear HD-like visuals"
```typescript
{
  filters: {
    category: "dreams",
    attributes: {
      include: {
        lucidity: ["fully_lucid"],
        clarity_level: ["crystal_clear"],
        visual_quality: ["HD-like"]
      }
    }
  }
}
```

#### ✨ NDE-OBE Category (5 attributes)
```typescript
{
  category_slug: "nde-obe",
  attributes: [
    "nde_type",         // clinical_death, cardiac_arrest, accident, spontaneous
    "saw_tunnel",       // yes, no
    "saw_light",        // yes, no
    "life_review",      // yes, no, partial
    "met_deceased"      // yes, no
  ]
}
```

**Example Query:** "NDEs with tunnel, light, AND life review"
```typescript
{
  filters: {
    category: "nde-obe",
    attributes: {
      include: {
        saw_tunnel: ["yes"],
        saw_light: ["yes"],
        life_review: ["yes", "partial"]
      }
    }
  }
}
```

#### 🍄 Psychedelics Category (5 attributes)
```typescript
{
  category_slug: "psychedelics",
  attributes: [
    "substance",        // psilocybin, lsd, dmt, ayahuasca, mescaline
    "dosage_level",     // microdose, low, medium, high, heroic
    "setting",          // solo, guided, ceremony, nature, home
    "entity_contact",   // yes, no, unsure
    "breakthrough"      // yes, no, partial
  ]
}
```

#### 👻 Other Notable Categories
- **Ghosts/Spirits** (4): ghost_type, ghost_appearance, interaction, recognized
- **Precognition** (4): precog_method, came_true, specificity, time_until_event
- **Kundalini Awakening** (4): awakening_trigger, energy_movement, physical_symptoms, challenging
- **Cancer Remission** (4): cancer_type, stage_at_diagnosis, treatment_received, complete_remission

**Impact on Query Parser:**

The Query Parser MUST understand category-specific vocabulary:

```typescript
// BAD (Generic attributes only)
Query: "Lucid dreams"
Parser: { category: "dreams", tags: ["lucid"] } // ❌ Missed structured attribute!

// GOOD (Category-aware)
Query: "Lucid dreams"
Parser: {
  category: "dreams",
  attributes: { include: { lucidity: ["fully_lucid", "semi_lucid"] } }
} // ✅ Uses category-specific attribute!
```

### The Problem with Pure Vector Search

**Vector embeddings are great for semantic similarity but BAD for precise filtering:**

❌ **User asks:** "UFO dreams with blue lights but NOT triangular"
❌ **Vector Search:** Returns semantically similar experiences (might include triangular UFOs)
✅ **Attribute Search:** Exactly filters `color: blue` AND `shape NOT IN (triangle)`

❌ **User asks:** "Experiences lasting more than 10 minutes"
❌ **Vector Search:** Cannot filter by numeric ranges
✅ **Attribute Search:** `duration_minutes >= 10`

### Enhanced Query Parser Schema

**Add attribute filters to SearchIntentSchema:**

```typescript
// lib/ai/query-parser.ts - ENHANCED VERSION

const AttributeFiltersSchema = z.object({
  // Include these attributes (AND logic)
  include: z.record(z.string(), z.array(z.string())).optional(),
  // Example: { color: ["blue", "red"], shape: ["triangle"] }

  // Exclude these attributes (NOT logic)
  exclude: z.record(z.string(), z.array(z.string())).optional(),
  // Example: { color: ["green"], shape: ["circle"] }

  // Numeric range filters
  ranges: z.record(z.string(), z.object({
    min: z.number().optional(),
    max: z.number().optional()
  })).optional()
  // Example: { duration_minutes: { min: 5, max: 60 } }
})

const SearchIntentSchema = z.object({
  intent: z.enum(['search', 'pattern', 'comparison', 'timeline', 'question']),
  filters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),

    // 🆕 ATTRIBUTE FILTERS
    attributes: AttributeFiltersSchema.optional(),

    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    witnessesOnly: z.boolean().optional()
  }),
  naturalLanguageQuery: z.string(),
  confidence: z.number().min(0).max(1)
})
```

**Enhanced System Prompt for Query Parser:**

```typescript
export async function parseQuery(userQuery: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: SearchIntentSchema,
    system: `You are a query parser for XPShare.

Extract search intent and structured filters from natural language queries.

ATTRIBUTE EXTRACTION (CRITICAL):
Users can filter by specific attributes like shape, color, sound, emotion, size, duration.

Examples:

Query: "UFO dreams with blue lights"
Output:
{
  "intent": "search",
  "filters": {
    "category": "dreams",
    "tags": ["ufo"],
    "attributes": {
      "include": {
        "color": ["blue"],
        "shape": ["light"]
      }
    }
  }
}

Query: "UFOs but NOT triangular"
Output:
{
  "intent": "search",
  "filters": {
    "category": "ufo-uap",
    "attributes": {
      "exclude": {
        "shape": ["triangle"]
      }
    }
  }
}

Query: "Experiences lasting more than 10 minutes"
Output:
{
  "intent": "search",
  "filters": {
    "attributes": {
      "ranges": {
        "duration_minutes": { "min": 10 }
      }
    }
  }
}

Query: "Red or orange UFOs with humming sounds"
Output:
{
  "intent": "search",
  "filters": {
    "category": "ufo-uap",
    "attributes": {
      "include": {
        "color": ["red", "orange"],
        "sound": ["humming"]
      }
    }
  }
}

Available Attributes:
- Physical: shape, color, size, surface, texture, sound, smell
- Temporal: time_of_day, duration_minutes, frequency
- Emotional: emotion (fear, awe, curiosity, confusion, wonder)
- Contextual: weather, location_type, witnesses_count
- Behavioral: movement_pattern, speed, direction

ALWAYS extract attributes when mentioned!`,
    prompt: `Parse this query: "${userQuery}"`
  })

  return object
}
```

### Hybrid Search with Attribute Filtering

**Combine Vector Search + Full-Text Search + Attribute Filtering:**

```typescript
// lib/search/hybrid-search-with-attributes.ts

interface HybridSearchParams {
  query: string
  filters: {
    category?: string
    tags?: string[]
    location?: string
    attributes?: {
      include?: Record<string, string[]>
      exclude?: Record<string, string[]>
      ranges?: Record<string, { min?: number; max?: number }>
    }
  }
  maxResults?: number
}

export async function hybridSearchWithAttributes(
  params: HybridSearchParams
) {
  const { query, filters, maxResults = 15 } = params

  // 1. Generate embedding for vector search
  const embedding = await generateEmbedding(query)

  // 2. Base query with vector + full-text hybrid
  let baseQuery = supabase.rpc('hybrid_search', {
    query_embedding: embedding,
    query_text: query,
    match_threshold: 0.7,
    match_count: maxResults * 2  // Get more for attribute filtering
  })

  // 3. Apply category/tag filters
  if (filters.category) {
    baseQuery = baseQuery.eq('category', filters.category)
  }

  if (filters.tags && filters.tags.length > 0) {
    baseQuery = baseQuery.contains('tags', filters.tags)
  }

  // Execute base search
  const { data: baseResults } = await baseQuery

  // 4. 🆕 ATTRIBUTE FILTERING
  if (!filters.attributes) {
    return baseResults.slice(0, maxResults)
  }

  const filteredResults = await filterByAttributes(
    baseResults,
    filters.attributes
  )

  return filteredResults.slice(0, maxResults)
}

async function filterByAttributes(
  experiences: Experience[],
  attributeFilters: {
    include?: Record<string, string[]>
    exclude?: Record<string, string[]>
    ranges?: Record<string, { min?: number; max?: number }>
  }
) {
  const experienceIds = experiences.map(e => e.id)

  // Build attribute filter query
  let query = supabase
    .from('experiences')
    .select(`
      *,
      experience_attributes!inner (
        attribute_key,
        attribute_value,
        confidence
      )
    `)
    .in('id', experienceIds)

  // INCLUDE filters (must have ALL specified attributes)
  if (attributeFilters.include) {
    for (const [key, values] of Object.entries(attributeFilters.include)) {
      // For each attribute key, must match one of the values
      query = query.or(
        values.map(v =>
          `and(attribute_key.eq.${key},attribute_value.eq.${v})`
        ).join(','),
        { foreignTable: 'experience_attributes' }
      )
    }
  }

  // EXCLUDE filters (must NOT have these attributes)
  if (attributeFilters.exclude) {
    for (const [key, values] of Object.entries(attributeFilters.exclude)) {
      query = query.not(
        'attribute_value',
        'in',
        `(${values.join(',')})`,
        { foreignTable: 'experience_attributes' }
      ).eq('experience_attributes.attribute_key', key)
    }
  }

  // RANGE filters (numeric attributes)
  if (attributeFilters.ranges) {
    for (const [key, range] of Object.entries(attributeFilters.ranges)) {
      if (range.min !== undefined) {
        query = query.gte(
          'attribute_value::numeric',
          range.min,
          { foreignTable: 'experience_attributes' }
        ).eq('experience_attributes.attribute_key', key)
      }
      if (range.max !== undefined) {
        query = query.lte(
          'attribute_value::numeric',
          range.max,
          { foreignTable: 'experience_attributes' }
        ).eq('experience_attributes.attribute_key', key)
      }
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Attribute filtering error:', error)
    return experiences  // Fallback to unfiltered
  }

  return data
}
```

### Pattern Detection with Attribute Correlation

**Enhance Tool 2 (detect_patterns) to find attribute-based patterns:**

```typescript
// lib/ai/tools/pattern-tool.ts - ENHANCED

interface PatternParams {
  experienceIds: string[]
  patternTypes: (
    'temporal' |
    'geographic' |
    'semantic' |
    'emotional' |
    'attribute_correlation'  // 🆕 NEW!
  )[]
  minConfidence?: number
}

async function detectAttributePatterns(experienceIds: string[]) {
  // Get all attributes for these experiences
  const { data: attributes } = await supabase
    .from('experience_attributes')
    .select('*')
    .in('experience_id', experienceIds)
    .gte('confidence', 0.7)  // Only high-confidence attributes

  // Group by attribute key
  const attributeGroups = groupBy(attributes, 'attribute_key')

  const patterns = []

  for (const [key, attrs] of Object.entries(attributeGroups)) {
    // Count value occurrences
    const valueCounts = countBy(attrs, 'attribute_value')

    // Find dominant values (>50% occurrence)
    for (const [value, count] of Object.entries(valueCounts)) {
      const percentage = (count / experienceIds.length) * 100

      if (percentage >= 50) {
        patterns.push({
          type: 'attribute_correlation',
          attribute: key,
          value: value,
          occurrences: count,
          percentage: Math.round(percentage),
          confidence: percentage / 100,
          description: `${percentage}% of experiences have ${key}: ${value}`
        })
      }
    }
  }

  // Find cross-attribute correlations
  const correlations = findAttributeCorrelations(attributes)

  return [...patterns, ...correlations]
}

function findAttributeCorrelations(attributes: Attribute[]) {
  // Group attributes by experience_id
  const byExperience = groupBy(attributes, 'experience_id')

  // Find co-occurring attribute pairs
  const coOccurrences: Map<string, number> = new Map()

  for (const [expId, attrs] of Object.entries(byExperience)) {
    // Get all attribute pairs in this experience
    for (let i = 0; i < attrs.length; i++) {
      for (let j = i + 1; j < attrs.length; j++) {
        const pair = [
          `${attrs[i].attribute_key}:${attrs[i].attribute_value}`,
          `${attrs[j].attribute_key}:${attrs[j].attribute_value}`
        ].sort().join(' + ')

        coOccurrences.set(pair, (coOccurrences.get(pair) || 0) + 1)
      }
    }
  }

  // Find significant correlations (>40% co-occurrence)
  const totalExperiences = Object.keys(byExperience).length
  const correlations = []

  for (const [pair, count] of coOccurrences.entries()) {
    const percentage = (count / totalExperiences) * 100

    if (percentage >= 40) {
      const [attr1, attr2] = pair.split(' + ')

      correlations.push({
        type: 'attribute_correlation',
        attributes: [attr1, attr2],
        occurrences: count,
        percentage: Math.round(percentage),
        confidence: percentage / 100,
        description: `${percentage}% of experiences with ${attr1} also have ${attr2}`
      })
    }
  }

  return correlations
}
```

**Example Pattern Output:**

```json
{
  "patterns": [
    {
      "type": "attribute_correlation",
      "attribute": "shape",
      "value": "triangle",
      "occurrences": 8,
      "percentage": 75,
      "confidence": 0.75,
      "description": "75% of experiences have shape: triangle"
    },
    {
      "type": "attribute_correlation",
      "attributes": ["shape:triangle", "color:red"],
      "occurrences": 6,
      "percentage": 60,
      "confidence": 0.60,
      "description": "60% of experiences with shape:triangle also have color:red"
    },
    {
      "type": "attribute_correlation",
      "attributes": ["time_of_day:night", "emotion:fear"],
      "occurrences": 9,
      "percentage": 82,
      "confidence": 0.82,
      "description": "82% of experiences with time_of_day:night also have emotion:fear"
    }
  ]
}
```

### Search Tool Enhancement

**Update Tool 1 (search_experiences) to use attributes:**

```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const searchExperiencesTool = tool({
  description: 'Search for experiences matching filters. Supports attribute-based precision filtering.',
  parameters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),

    // 🆕 ATTRIBUTE FILTERS
    attributes: z.object({
      include: z.record(z.string(), z.array(z.string())).optional(),
      exclude: z.record(z.string(), z.array(z.string())).optional(),
      ranges: z.record(z.string(), z.object({
        min: z.number().optional(),
        max: z.number().optional()
      })).optional()
    }).optional(),

    similarTo: z.string().optional(),
    maxResults: z.number().default(15)
  }),

  execute: async (params) => {
    const results = await hybridSearchWithAttributes({
      query: params.naturalQuery || '',
      filters: {
        category: params.category,
        tags: params.tags,
        location: params.location,
        attributes: params.attributes
      },
      maxResults: params.maxResults
    })

    return {
      experiences: results,
      count: results.length,
      attributeFiltersApplied: !!params.attributes
    }
  }
})
```

### User Query Examples

**Query:** "UFO dreams with blue lights but NOT triangular"

**Parsed Intent:**
```json
{
  "intent": "search",
  "filters": {
    "category": "dreams",
    "tags": ["ufo"],
    "attributes": {
      "include": {
        "color": ["blue"]
      },
      "exclude": {
        "shape": ["triangle"]
      }
    }
  }
}
```

**SQL Execution:**
```sql
-- Hybrid search returns 20 candidates
-- Then attribute filtering:

SELECT DISTINCT e.*
FROM experiences e
JOIN experience_attributes ea_color
  ON ea_color.experience_id = e.id
  AND ea_color.attribute_key = 'color'
  AND ea_color.attribute_value = 'blue'
WHERE e.id IN (/* hybrid search result IDs */)
  AND NOT EXISTS (
    SELECT 1 FROM experience_attributes ea_shape
    WHERE ea_shape.experience_id = e.id
      AND ea_shape.attribute_key = 'shape'
      AND ea_shape.attribute_value = 'triangle'
  )
```

---

**Query:** "Long UFO sightings with multiple witnesses"

**Parsed Intent:**
```json
{
  "intent": "search",
  "filters": {
    "category": "ufo-uap",
    "attributes": {
      "ranges": {
        "duration_minutes": { "min": 10 },
        "witnesses_count": { "min": 2 }
      }
    }
  }
}
```

---

**Query:** "Frightening experiences at night"

**Parsed Intent:**
```json
{
  "intent": "search",
  "filters": {
    "attributes": {
      "include": {
        "emotion": ["fear", "terror", "panic"],
        "time_of_day": ["night", "late_night"]
      }
    }
  }
}
```

### Visualization Enhancement

**Show attribute distributions in results:**

```tsx
<AttributeDistributionCard>
  <h3>Attribute Patterns Found</h3>

  <AttributeBar
    label="Shape"
    values={[
      { value: "triangle", count: 8, percentage: 75 },
      { value: "disc", count: 2, percentage: 18 },
      { value: "orb", count: 1, percentage: 7 }
    ]}
  />

  <AttributeBar
    label="Color"
    values={[
      { value: "red", count: 6, percentage: 55 },
      { value: "blue", count: 3, percentage: 27 },
      { value: "white", count: 2, percentage: 18 }
    ]}
  />

  <AttributeBar
    label="Emotion"
    values={[
      { value: "fear", count: 9, percentage: 82 },
      { value: "awe", count: 7, percentage: 64 },
      { value: "curiosity", count: 4, percentage: 36 }
    ]}
  />
</AttributeDistributionCard>
```

### Benefits

**Precision vs. Semantic Search:**

| Query Type | Vector Search | Attribute Search |
|-----------|--------------|------------------|
| "Blue UFOs" | 70% relevant | 98% relevant |
| "NOT triangular" | Cannot filter | 100% accurate |
| "Duration > 10 min" | Cannot filter | 100% accurate |
| "Multiple witnesses" | ~60% relevant | 95% relevant |
| "Fear + Night" | 75% relevant | 92% relevant |

**Pattern Detection Depth:**

| Pattern Type | Without Attributes | With Attributes |
|-------------|-------------------|-----------------|
| Temporal | ✓ | ✓ |
| Geographic | ✓ | ✓ |
| Semantic | ✓ | ✓ |
| Emotional | Basic | Precise (via emotion attribute) |
| Physical | ❌ | ✓ (shape, color, size correlations) |
| Cross-Category | ❌ | ✓ (e.g., "triangle UFOs = fear") |

### Implementation Priority

**Phase 1 (Week 1): Basic Query Parser**
- ✓ Parse category, tags, location
- ✓ Basic vector + FTS hybrid search

**Phase 2 (Week 2): Attribute Integration** ⭐ **HIGH PRIORITY**
- Extend Query Parser with attribute filters
- Implement `filterByAttributes()`
- Add attribute correlation to pattern detection

**Phase 3 (Week 3): Visualization**
- Attribute distribution charts
- Cross-attribute insights
- Interactive attribute filtering UI

---

## 🎨 UI/UX Design Principles

### 1. Conversational-First

**Good:**
```
User: "hatte jemand in europa von ufos geträumt?"
AI: "Ja, 3 Personen haben in Europa von UFOs geträumt.
     Hier ist eine Karte..."
```

**Bad:**
```
User: "hatte jemand in europa von ufos geträumt?"
System: "Keine exakten Treffer für 'jemand, hatte' gefunden."
```

### 2. Progressive Disclosure

Don't overwhelm users. Show information incrementally:

1. **Initial Answer** (Text insight)
2. **Key Visual** (Map or Chart)
3. **Pattern Highlight** (Insight card)
4. **Related Content** (Experience cards)
5. **Follow-ups** (Suggested questions)

### 3. Loading States

**Always show progress:**
```tsx
// Bad
[Nothing] → [Full Result]

// Good
"Suche in Europa..." (Skeleton)
→ "Gefunden: 3 Erfahrungen" (Partial)
→ [Map renders] (Progressive)
→ "Alle 3 nachts..." (Insight)
```

### 4. Interactive Feedback

Every action should have immediate feedback:
- Click map marker → Show experience detail
- Hover chart point → Show tooltip
- Select time range → Re-filter results
- Click pattern → Show related experiences

### 5. Community-Driven

Emphasize connections:
- "12 andere Personen haben ähnliches erlebt"
- "Dieses Pattern wurde 5x bestätigt"
- "User XY hat auch..."

### 6. Trust & Transparency

Make AI reasoning visible:
```tsx
<InsightCard>
  <PatternIcon />
  <div>
    <strong>Pattern entdeckt:</strong> Alle 3 Träume nachts
  </div>
  <ConfidenceBadge score={0.95}>95% Konfidenz</ConfidenceBadge>
  <Tooltip>
    Basierend auf Zeitstempel-Analyse von 3 Erfahrungen.
    Algorithmus: Temporal Clustering (DBSCAN)
  </Tooltip>
</InsightCard>
```

---

## 🚪 User Onboarding & First-Time Experience

### Why This Matters

**Research Finding (ProductLed):**
- 85% of users who experience good onboarding become more loyal
- Zeigarnik Effect: Progress indicators increase completion rates by 40%
- First 5 minutes determine if users stay or leave

**XPShare Challenge:**
This is a **novel concept** - users don't know how to "discover patterns in anomalous experiences." We MUST guide them.

### Key Principles

**1. Welcome Message (Conversational Primer)**

```tsx
<WelcomeDialog>
  <h2>👋 Willkommen bei XPShare Discovery</h2>
  <p>Stell mir einfach eine Frage in natürlicher Sprache:</p>

  <ExampleQueries>
    <button>"Hatte jemand in Europa von UFOs geträumt?"</button>
    <button>"Gibt es Muster bei Delfin-Sichtungen?"</button>
    <button>"Wer hatte ähnliche Erfahrungen wie ich?"</button>
  </ExampleQueries>

  <ProgressIndicator>
    <Step completed>✓ Account erstellt</Step>
    <Step current>→ Erste Frage stellen</Step>
    <Step pending>○ Pattern entdecken</Step>
    <Step pending>○ XP Twins finden</Step>
  </ProgressIndicator>
</WelcomeDialog>
```

**2. Empty States (Visual Cues)**

Don't show blank page. Guide action:

```tsx
// When user has no experiences yet
<EmptyExperiencesState>
  <IllustrationIcon />
  <h3>Noch keine Erfahrungen geteilt</h3>
  <p>Teile deine erste Erfahrung, um Patterns und Connections zu entdecken</p>
  <Button size="lg">
    ✨ Erste Erfahrung hinzufügen
  </Button>
</EmptyExperiencesState>

// When search returns no results
<EmptySearchState>
  <IllustrationIcon />
  <h3>Keine Erfahrungen gefunden</h3>
  <p>Versuch es mit:</p>
  <SuggestionList>
    <li>"Träume über Tiere"</li>
    <li>"UFO Sichtungen 2024"</li>
    <li>"Synchronizitäten mit Zahlen"</li>
  </SuggestionList>
</EmptySearchState>
```

**3. Quick Wins (Immediate Value)**

Get users to "Aha!" moment fast:

**First Query → Instant Pattern**
```typescript
// After user's first query, ALWAYS show a pattern (even if simple)
async function handleFirstQuery(userId: string, query: string) {
  const results = await searchExperiences(query)

  // Even if only 2 results, find SOMETHING interesting
  const quickPattern = detectSimplePattern(results)
  // E.g., "Both happened at night" or "Both in same country"

  return {
    results,
    quickInsight: quickPattern,
    celebration: results.length > 0
      ? "🎉 Glückwunsch! Du hast deine erste Verbindung entdeckt!"
      : null
  }
}
```

**4. Tooltips & Contextual Help**

```tsx
<DiscoveryInterface>
  {/* Inline help on first use */}
  <Tooltip trigger="hover" show={isFirstTimeUser}>
    <InfoIcon />
    <TooltipContent>
      <h4>💡 Tipp: Natürliche Sprache</h4>
      <p>Frag einfach, als würdest du mit einem Freund sprechen!</p>
    </TooltipContent>
  </Tooltip>

  {/* Progressive disclosure */}
  <AdvancedFiltersCollapsible>
    <CollapsibleTrigger>
      🔍 Erweiterte Filter (optional)
    </CollapsibleTrigger>
  </AdvancedFiltersCollapsible>
</DiscoveryInterface>
```

### Implementation Tasks

1. **Create onboarding flow components:**
   - `components/onboarding/welcome-dialog.tsx`
   - `components/onboarding/progress-tracker.tsx`
   - `components/onboarding/example-queries.tsx`

2. **Add user state tracking:**
   - `is_first_time_user` flag in DB
   - `completed_onboarding_steps` JSON field
   - Track: first_query, first_pattern, first_connection

3. **Implement empty states:**
   - Replace all blank pages with guided CTAs
   - Add illustration assets (use Undraw.co)

4. **Create tooltip system:**
   - Context-aware help (show only on first encounter)
   - Dismissible (store in localStorage)

---

## 🛡️ Trust & Safety Framework

### Why This Matters

**Research Finding (Content Moderation):**
- Anomalous experiences raise **epistemic challenges** (true vs. delusion)
- Community platforms need **human + AI + community moderation mix**
- Paranormal/UFO content attracts trolls, disinformation

**XPShare Challenge:**
How do we validate experiences WITHOUT dismissing genuine reports?

### Core Components

**1. Experience Verification System**

```typescript
interface VerificationStatus {
  status: 'unverified' | 'community_verified' | 'witness_confirmed' | 'expert_validated'
  verificationScore: number // 0-100
  signals: {
    hasWitnesses: boolean
    witnessCount: number
    hasMedia: boolean
    locationVerified: boolean
    temporalConsistency: boolean
    communityEndorsements: number
    flagCount: number
  }
}

async function calculateVerificationScore(experienceId: string) {
  const exp = await getExperience(experienceId)

  let score = 0

  // Witnesses (high signal)
  if (exp.witnesses.length > 0) score += 40
  if (exp.witnesses.length >= 3) score += 20

  // Media evidence
  if (exp.media.photos.length > 0) score += 15
  if (exp.media.audio.length > 0) score += 10

  // Location consistency (check against known locations)
  if (await isLocationConsistent(exp.location)) score += 10

  // Community trust
  score += Math.min(exp.communityEndorsements * 2, 20)

  // Negative signals
  score -= exp.flagCount * 5

  return Math.max(0, Math.min(100, score))
}
```

**UI Display:**
```tsx
<ExperienceCard>
  <VerificationBadge status={verification.status} score={verification.score}>
    {verification.status === 'witness_confirmed' && (
      <>
        ✓ Bestätigt
        <Tooltip>
          {verification.signals.witnessCount} Zeugen haben diese Erfahrung bestätigt
        </Tooltip>
      </>
    )}
  </VerificationBadge>
</ExperienceCard>
```

**2. Witness Corroboration**

Enable users to confirm they witnessed same event:

```tsx
<WitnessConfirmationButton experienceId={exp.id}>
  👁️ Ich war dabei
</WitnessConfirmationButton>

// Backend creates connection
async function confirmWitness(userId: string, experienceId: string) {
  // Create witness record
  await createWitness({
    userId,
    experienceId,
    confirmationType: 'was_present',
    timestamp: new Date()
  })

  // Increase verification score
  await incrementVerificationScore(experienceId, 15)

  // Notify original poster
  await createNotification({
    userId: experience.userId,
    type: 'witness_confirmation',
    message: `${user.name} hat deine Erfahrung als Zeuge bestätigt!`
  })
}
```

**3. Credibility Scoring (User Reputation)**

```typescript
interface UserCredibility {
  score: number // 0-100
  badges: ('verified' | 'trusted_contributor' | 'pattern_detective')[]
  signals: {
    experiencesSubmitted: number
    verificationRate: number // % of experiences verified
    communityEndorsements: number
    reportedCount: number
    accountAge: number // days
  }
}

async function calculateUserCredibility(userId: string) {
  const user = await getUser(userId)
  const experiences = await getUserExperiences(userId)

  let score = 50 // Baseline

  // Verified experiences boost
  const verificationRate = experiences.filter(e => e.verified).length / experiences.length
  score += verificationRate * 20

  // Community trust
  score += Math.min(user.communityEndorsements * 2, 15)

  // Account maturity
  const accountAgeDays = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)
  score += Math.min(accountAgeDays / 30 * 5, 10) // +5 per month, max 10

  // Negative signals
  score -= user.reportedCount * 10

  return Math.max(0, Math.min(100, score))
}
```

**4. Report & Moderation System**

```tsx
// Report dialog (already exists, enhance it)
<ReportDialog>
  <ReportReasons>
    <option>Spam / Bot</option>
    <option>Harassment</option>
    <option>Misinformation</option>
    <option>Duplicate experience</option>
    <option>Inappropriate content</option>
  </ReportReasons>

  <ReportDescription>
    <label>Details (optional):</label>
    <Textarea placeholder="Was ist das Problem?" />
  </ReportDescription>
</ReportDialog>

// Moderation queue (admin tool)
async function getModerationQueue() {
  return await db.experience.findMany({
    where: {
      OR: [
        { reportCount: { gte: 3 } },
        { verificationScore: { lte: 20 } },
        { user: { credibilityScore: { lte: 30 } } }
      ],
      moderationStatus: 'pending'
    }
  })
}
```

**5. Privacy for Sensitive Content**

Users can mark experiences as private/anonymous:

```tsx
<ExperiencePrivacySettings>
  <Toggle
    label="Anonym teilen"
    description="Dein Name wird nicht angezeigt"
  />

  <Toggle
    label="Nur mit verifizierten Usern teilen"
    description="Nur User mit Credibility Score > 50 können sehen"
  />

  <Toggle
    label="Standort verschleiern"
    description="Zeige nur Region, nicht exakte Location"
  />
</ExperiencePrivacySettings>
```

### Implementation Tasks

1. **Add verification tables:**
   ```sql
   CREATE TABLE experience_verifications (
     id UUID PRIMARY KEY,
     experience_id UUID REFERENCES experiences(id),
     verification_type TEXT, -- 'witness', 'media', 'location', 'community'
     verified_by UUID REFERENCES profiles(id),
     confidence_score DECIMAL(3,2),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE user_credibility (
     user_id UUID PRIMARY KEY REFERENCES profiles(id),
     score INTEGER CHECK (score BETWEEN 0 AND 100),
     badges JSONB,
     signals JSONB,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Create moderation API:**
   - `/api/experiences/[id]/report`
   - `/api/experiences/[id]/verify`
   - `/api/admin/moderation-queue`

3. **Build trust UI components:**
   - Verification badges
   - Credibility indicators
   - Report dialog (enhance existing)

---

## 🌟 Social Proof & Trust Signals

### Why This Matters

**Research Finding (Sprout Social):**
- **97% of consumers read reviews** before decisions
- User-generated content has **2.4x higher trust** than brand content
- Social proof reduces uncertainty in ambiguous situations

**XPShare Context:**
Anomalous experiences are **inherently uncertain**. Users need validation: "Am I alone?" → "12 others experienced this too!"

### Trust Signals to Display

**1. Experience Count Indicators**

```tsx
<SimilarExperiencesBadge count={12}>
  <UsersIcon />
  <span>12 ähnliche Erfahrungen</span>
  <Tooltip>
    12 andere Personen haben etwas Ähnliches erlebt
  </Tooltip>
</SimilarExperiencesBadge>

<PatternConfirmationBadge count={5}>
  <CheckCircleIcon />
  <span>5x bestätigt</span>
  <Tooltip>
    Dieses Pattern wurde von 5 unabhängigen Analysen bestätigt
  </Tooltip>
</PatternConfirmationBadge>
```

**2. Witness Counts**

```tsx
<WitnessIndicator count={experience.witnesses.length}>
  {experience.witnesses.length > 0 ? (
    <>
      <EyeIcon className="text-green-500" />
      <span>{experience.witnesses.length} Zeuge(n)</span>
      <AvatarGroup users={experience.witnesses.slice(0, 3)} />
      {experience.witnesses.length > 3 && (
        <span className="text-muted">+{experience.witnesses.length - 3}</span>
      )}
    </>
  ) : (
    <span className="text-muted">Keine Zeugen</span>
  )}
</WitnessIndicator>
```

**3. Community Endorsements**

Let users "vouch for" experiences without being witnesses:

```tsx
<EndorsementButton experienceId={exp.id}>
  <ThumbsUpIcon />
  <span>{exp.endorsementCount}</span>
  <Tooltip>
    "Ich glaube diese Erfahrung ist authentisch"
  </Tooltip>
</EndorsementButton>

// Similar to GitHub reactions
<ReactionBar>
  <Reaction emoji="✓" label="Glaubwürdig" count={12} />
  <Reaction emoji="🤔" label="Interessant" count={8} />
  <Reaction emoji="❤️" label="Berührend" count={5} />
</ReactionBar>
```

**4. User Reputation Display**

```tsx
<UserProfileCard user={author}>
  <Avatar src={author.avatar} />
  <UserInfo>
    <UserName>{author.name}</UserName>
    <CredibilityBadge score={author.credibilityScore}>
      {author.credibilityScore >= 80 && <VerifiedIcon />}
      {author.credibilityScore >= 80 ? 'Vertrauenswürdig' : 'Neu'}
    </CredibilityBadge>
  </UserInfo>
  <UserStats>
    <Stat label="Erfahrungen" value={author.experienceCount} />
    <Stat label="Bestätigt" value={author.verifiedCount} />
    <Stat label="Zeugnisse" value={author.witnessCount} />
  </UserStats>
</UserProfileCard>
```

**5. Recent Activity Feed**

Show community is active:

```tsx
<RecentActivitySidebar>
  <h3>Live Activity</h3>
  <ActivityFeed>
    <ActivityItem>
      <Avatar user={user1} />
      <span>{user1.name} hat eine UFO-Sichtung geteilt</span>
      <TimeAgo>vor 2 Min</TimeAgo>
    </ActivityItem>

    <ActivityItem>
      <Avatar user={user2} />
      <span>Neues Pattern entdeckt: Nachtzeit-Cluster</span>
      <TimeAgo>vor 5 Min</TimeAgo>
    </ActivityItem>
  </ActivityFeed>
</RecentActivitySidebar>
```

**6. "Trending Now" Indicators**

```tsx
<TrendingExperiences>
  <h3>🔥 Trending Patterns</h3>
  <TrendingList>
    <TrendingItem>
      <TrendIcon>📈</TrendIcon>
      <span>UFO-Träume in Europa</span>
      <TrendBadge>+40% diese Woche</TrendBadge>
    </TrendingItem>

    <TrendingItem>
      <TrendIcon>🌊</TrendIcon>
      <span>Delfin-Synchronizitäten</span>
      <TrendBadge>12 neue Einträge</TrendBadge>
    </TrendingItem>
  </TrendingList>
</TrendingExperiences>
```

### Implementation Tasks

1. **Add endorsement system:**
   ```sql
   CREATE TABLE experience_endorsements (
     id UUID PRIMARY KEY,
     experience_id UUID REFERENCES experiences(id),
     user_id UUID REFERENCES profiles(id),
     reaction_type TEXT, -- 'credible', 'interesting', 'moving'
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(experience_id, user_id)
   );
   ```

2. **Create social proof components:**
   - `components/social-proof/similar-experiences-badge.tsx`
   - `components/social-proof/witness-indicator.tsx`
   - `components/social-proof/endorsement-button.tsx`
   - `components/social-proof/credibility-badge.tsx`

3. **Build activity feed:**
   - Real-time updates via Supabase Realtime
   - Show last 10 activities
   - Filter by relevance to user

---

## 🎙️ Voice & Multimodal Interaction

### Why This Matters

**Research Finding (Enigma Labs Feature):**
- **Voice input reduces friction** for experience submission
- **Location-based discovery** critical for UFO/anomaly reporting
- **AR sky scanning** (Enigma's killer feature) enables real-time reporting
- **Mobile-first** design essential (most anomalies reported on-the-go)

**XPShare Opportunity:**
Many experiences happen in moment (UFO sighting, synchronicity). Voice + Location = instant capture.

### Core Features

**1. Voice Input for Discovery**

```tsx
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

<DiscoverySearch>
  <SearchInput
    value={query}
    onChange={setQuery}
    placeholder="Frag mich etwas..."
  />

  <VoiceInputButton onClick={startListening}>
    {isListening ? (
      <RecordingAnimation>
        <MicIcon className="animate-pulse text-red-500" />
        <span>Höre zu...</span>
      </RecordingAnimation>
    ) : (
      <>
        <MicIcon />
        <span>Spracheingabe</span>
      </>
    )}
  </VoiceInputButton>
</DiscoverySearch>

// Hook implementation
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Browser unterstützt keine Spracheingabe')
      return
    }

    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'de-DE'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }

  return { isListening, transcript, startListening }
}
```

**2. Location-Based Discovery**

```tsx
import { useGeolocation } from '@/hooks/use-geolocation'

<NearbyExperiencesButton>
  <MapPinIcon />
  <span>In meiner Nähe</span>
</NearbyExperiencesButton>

// Automatically add location context to queries
async function discoverNearby() {
  const { latitude, longitude } = await getGeolocation()

  const nearbyQuery = {
    intent: 'search',
    filters: {
      location: {
        latitude,
        longitude,
        radius: 50 // km
      }
    },
    naturalLanguageQuery: 'Experiences near me'
  }

  return await searchExperiences(nearbyQuery)
}
```

**3. AR Sky Scanning (Future - Enigma-style)**

```tsx
// Phase 4 feature (out of scope for MVP)
<ARSkyScanner>
  <CameraView />
  <OverlayMarkers>
    {nearbyUFOSightings.map(sighting => (
      <ARMarker
        key={sighting.id}
        position={calculateSkyPosition(sighting.location)}
        label={`${sighting.title} - ${formatDistance(sighting.distance)}`}
      />
    ))}
  </OverlayMarkers>
</ARSkyScanner>
```

**4. Quick Capture (Mobile-First)**

```tsx
<QuickCaptureModal>
  <h2>Erfahrung sofort festhalten</h2>

  {/* Voice recording */}
  <VoiceRecorder
    onRecordingComplete={(audioBlob) => {
      // Transcribe via Whisper API
      const text = await transcribeAudio(audioBlob)
      setDescription(text)
    }}
  />

  {/* Photo capture */}
  <PhotoCapture
    onCapture={(photo) => {
      // Auto-extract metadata (GPS, timestamp)
      const metadata = extractMetadata(photo)
      setLocation(metadata.gps)
      setTimestamp(metadata.timestamp)
    }}
  />

  {/* Auto-fill location & time */}
  <MetadataPreview>
    <LocationBadge>{currentLocation}</LocationBadge>
    <TimestampBadge>{new Date().toLocaleString()}</TimestampBadge>
  </MetadataPreview>

  <Button size="lg">
    💾 Speichern
  </Button>
</QuickCaptureModal>
```

**5. Offline Support (PWA)**

```typescript
// Service Worker for offline experience submission
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/experiences')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, save to IndexedDB
        return caches.match('/offline-submission.html')
      })
    )
  }
})

// Sync when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-experiences') {
    event.waitUntil(syncOfflineExperiences())
  }
})
```

### Implementation Tasks

1. **Add voice input:**
   - Install Web Speech API polyfill
   - Create `hooks/use-speech-recognition.ts`
   - Add voice button to search interface

2. **Enable geolocation:**
   - Request location permission on first use
   - Store user's preferred location in localStorage
   - Add "Near me" filter to search

3. **Build quick capture:**
   - PWA manifest for "Add to Home Screen"
   - Camera access for photos
   - Audio recording for voice notes
   - Auto-extract GPS + timestamp

4. **Optimize for mobile:**
   - Touch-optimized UI (larger tap targets)
   - Responsive visualizations
   - Reduced animations on low-end devices

---

## 🎲 Serendipity Engine (Anti-Filter Bubble)

### Why This Matters

**Research Finding (Semantic Web):**
- **Filter bubbles limit discovery** (Pariser 2011)
- Users only see content similar to what they've seen before
- **Serendipity = unexpected connections = insight**
- Balance: Exploration (discover new) vs. Exploitation (refine known)

**XPShare Challenge:**
If users only see patterns they expect, they miss **cross-category connections** (e.g., UFO dream → Dolphin synchronicity → shared symbolism).

### Serendipity Features

**1. "This Might Surprise You" Section**

```tsx
<SerendipityCard>
  <CardHeader>
    <SparklesIcon className="text-purple-500" />
    <h3>Das könnte dich überraschen...</h3>
  </CardHeader>

  <CardContent>
    <p>
      Obwohl du nach UFO-Träumen gesucht hast, haben wir ein
      <strong> unerwartetes Pattern</strong> gefunden:
    </p>

    <InsightCard>
      💡 12 UFO-Träume korrelieren mit <strong>Delfin-Sichtungen</strong>
      (gleiche Regionen, ähnliche Zeiträume)
    </InsightCard>

    <ExploreButton>
      🔍 Pattern erkunden
    </ExploreButton>
  </CardContent>
</SerendipityCard>

// Backend logic
async function findSerendipitousConnections(searchResults: Experience[]) {
  // Get different category experiences with semantic similarity
  const embeddings = await generateEmbeddings(searchResults.map(e => e.description))

  const crossCategoryMatches = await db.experience.findMany({
    where: {
      category: { not: searchResults[0].category }, // Different category
      embedding: {
        // Vector similarity > 0.7
        similarTo: embeddings[0],
        threshold: 0.7
      }
    },
    take: 3
  })

  return crossCategoryMatches
}
```

**2. Random Walk Exploration**

```tsx
<ExplorationMode>
  <h3>🎲 Zufalls-Entdeckung</h3>
  <p>Lass dich von uns überraschen!</p>

  <RandomWalkButton onClick={startRandomWalk}>
    🚶 Start
  </RandomWalkButton>
</ExplorationMode>

async function startRandomWalk() {
  // Start from random experience
  let current = await getRandomExperience()

  for (let i = 0; i < 5; i++) {
    // Show current experience
    yield current

    // Find semantically similar (but not too similar)
    const next = await findSimilarExperience(current, {
      minSimilarity: 0.5,
      maxSimilarity: 0.8, // Not too obvious
      differentCategory: Math.random() > 0.5 // 50% chance of category jump
    })

    current = next
  }
}
```

**3. Diversity Injection**

Inject diverse results into search rankings:

```typescript
async function hybridSearchWithDiversity(query: string) {
  // Standard hybrid search
  const results = await hybridSearch(query)

  // Inject diversity (20% of results)
  const diversityCount = Math.ceil(results.length * 0.2)

  const diverseResults = await db.experience.findMany({
    where: {
      category: { not: results[0].category }, // Different category
      // Still semantically related
      embedding: { similarTo: queryEmbedding, threshold: 0.6 }
    },
    take: diversityCount
  })

  // Interleave: [relevant, relevant, diverse, relevant, relevant, diverse, ...]
  const final = interleaveResults(results, diverseResults)

  return final
}
```

**4. "Explore Opposite" Button**

```tsx
<ExploreOppositeButton onClick={() => {
  // Invert semantic direction
  const oppositeQuery = await generateOppositeQuery(currentQuery)
  searchExperiences(oppositeQuery)
}}>
  ↔️ Gegenteil erkunden
</ExploreOppositeButton>

// Example:
// Current: "positive UFO dreams"
// Opposite: "frightening UFO dreams"
```

**5. Cross-Pollination Alerts**

Notify users of unexpected connections:

```tsx
<NotificationCenter>
  <Notification type="serendipity">
    <SparklesIcon />
    <div>
      <strong>Unerwartete Verbindung entdeckt!</strong>
      <p>
        Deine letzte Erfahrung hat Ähnlichkeiten mit 3 anderen
        Erfahrungen in <strong>komplett anderen Kategorien</strong>.
      </p>
    </div>
    <ExploreButton>Details</ExploreButton>
  </Notification>
</NotificationCenter>
```

### Implementation Tasks

1. **Create serendipity API:**
   - `/api/discover/serendipity` - Find unexpected connections
   - `/api/discover/random-walk` - Guided exploration
   - `/api/discover/opposite` - Invert search direction

2. **Add diversity to search:**
   - Modify `hybridSearch()` to inject diverse results
   - Create diversity scoring algorithm
   - A/B test diversity ratios (10%, 20%, 30%)

3. **Build serendipity UI:**
   - Serendipity card component
   - Random walk interface
   - Cross-category highlight badges

---

## 👥 Community & Social Features

### Why This Matters

**XPShare is NOT just a search tool - it's a community platform.**

**Research Gap:**
Current AISEARCH.md focuses on **discovery** but ignores **social connections**.

**User Need:**
- "Who else has experienced this?"
- "Can I follow users with similar experiences?"
- "Can I discuss patterns with others?"

### Core Social Features

**1. User Profiles (Enhanced)**

```tsx
<UserProfilePage username={username}>
  <ProfileHeader>
    <Avatar size="xl" src={user.avatar} />
    <UserInfo>
      <h1>{user.name}</h1>
      <Bio>{user.bio}</Bio>
      <CredibilityBadge score={user.credibilityScore} />
    </UserInfo>
    <SocialActions>
      <FollowButton userId={user.id} />
      <MessageButton userId={user.id} />
    </SocialActions>
  </ProfileHeader>

  <ProfileStats>
    <Stat label="Erfahrungen" value={user.experienceCount} />
    <Stat label="Patterns entdeckt" value={user.patternsDiscovered} />
    <Stat label="Follower" value={user.followerCount} />
    <Stat label="Following" value={user.followingCount} />
  </ProfileStats>

  <ProfileTabs>
    <Tab label="Erfahrungen">
      <ExperienceGrid experiences={userExperiences} />
    </Tab>

    <Tab label="Entdeckungen">
      <PatternGrid patterns={userPatterns} />
    </Tab>

    <Tab label="XP Twins">
      <XPTwinsList twins={user.xpTwins} />
    </Tab>
  </ProfileTabs>
</UserProfilePage>
```

**2. XP Twins (Similar Experiencers)**

```typescript
// Find users with similar experience patterns
async function findXPTwins(userId: string) {
  const userExperiences = await getUserExperiences(userId)
  const userEmbedding = await generateAggregateEmbedding(userExperiences)

  // Find users with similar aggregate embeddings
  const twins = await db.profile.findMany({
    where: {
      id: { not: userId },
      aggregateEmbedding: {
        similarTo: userEmbedding,
        threshold: 0.85 // High similarity
      }
    },
    take: 10,
    orderBy: {
      similarity: 'desc'
    }
  })

  return twins
}
```

```tsx
<XPTwinsCard>
  <CardHeader>
    <h3>👯 Deine XP Twins</h3>
    <p>User mit ähnlichen Erfahrungs-Mustern</p>
  </CardHeader>

  <TwinsList>
    {xpTwins.map(twin => (
      <TwinCard key={twin.id}>
        <Avatar user={twin} />
        <TwinInfo>
          <UserName>{twin.name}</UserName>
          <SimilarityScore score={twin.similarity}>
            {Math.round(twin.similarity * 100)}% Match
          </SimilarityScore>
          <SharedPatterns>
            {twin.sharedCategories.map(cat => (
              <Badge key={cat}>{cat}</Badge>
            ))}
          </SharedPatterns>
        </TwinInfo>
        <FollowButton userId={twin.id} />
      </TwinCard>
    ))}
  </TwinsList>
</XPTwinsCard>
```

**3. Comments & Discussions**

```tsx
<ExperienceDetailPage>
  <ExperienceContent />

  <DiscussionSection>
    <h3>💬 Diskussion</h3>

    <CommentInput
      placeholder="Teile deine Gedanken..."
      onSubmit={async (text) => {
        await createComment({
          experienceId,
          userId,
          content: text
        })
      }}
    />

    <CommentThread>
      {comments.map(comment => (
        <Comment key={comment.id}>
          <Avatar user={comment.user} />
          <CommentContent>
            <UserName>{comment.user.name}</UserName>
            <TimeAgo>{comment.createdAt}</TimeAgo>
            <CommentText>{comment.content}</CommentText>
            <CommentActions>
              <LikeButton commentId={comment.id} count={comment.likeCount} />
              <ReplyButton commentId={comment.id} />
            </CommentActions>
          </CommentContent>
        </Comment>
      ))}
    </CommentThread>
  </DiscussionSection>
</ExperienceDetailPage>
```

**4. Collaborative Pattern Discovery**

```tsx
<PatternDiscussionRoom patternId={pattern.id}>
  <PatternSummary pattern={pattern} />

  <CollaborativeNotes>
    <h4>Community-Notizen</h4>
    <NotesEditor
      collaborative={true}
      users={activeUsers}
      onChange={syncNotes}
    />
  </CollaborativeNotes>

  <VotingSection>
    <h4>Pattern-Validierung</h4>
    <VoteButtons>
      <VoteButton type="confirm">
        ✓ Bestätigen ({pattern.confirmVotes})
      </VoteButton>
      <VoteButton type="question">
        ? Unsicher ({pattern.questionVotes})
      </VoteButton>
      <VoteButton type="reject">
        ✗ Anzweifeln ({pattern.rejectVotes})
      </VoteButton>
    </VoteButtons>
  </VotingSection>
</PatternDiscussionRoom>
```

**5. Activity Feed (Following)**

```tsx
<FeedPage>
  <FeedTabs>
    <Tab label="Für dich">
      {/* Personalized feed based on interests */}
      <ActivityFeed activities={personalizedActivities} />
    </Tab>

    <Tab label="Folge ich">
      {/* Activities from followed users */}
      <ActivityFeed activities={followingActivities} />
    </Tab>

    <Tab label="Trending">
      {/* Popular content */}
      <ActivityFeed activities={trendingActivities} />
    </Tab>
  </FeedTabs>
</FeedPage>

<ActivityItem activity={activity}>
  <Avatar user={activity.user} />
  <ActivityContent>
    {activity.type === 'new_experience' && (
      <span>{activity.user.name} hat eine neue Erfahrung geteilt</span>
    )}
    {activity.type === 'pattern_discovered' && (
      <span>{activity.user.name} hat ein Pattern entdeckt</span>
    )}
    {activity.type === 'new_connection' && (
      <span>{activity.user.name} hat eine Verbindung gefunden</span>
    )}
  </ActivityContent>
  <TimeAgo>{activity.createdAt}</TimeAgo>
</ActivityItem>
```

**6. Notifications**

```tsx
<NotificationCenter>
  <NotificationList>
    <Notification type="new_follower">
      <Avatar user={follower} />
      <span>{follower.name} folgt dir jetzt</span>
    </Notification>

    <Notification type="comment">
      <Avatar user={commenter} />
      <span>{commenter.name} hat deine Erfahrung kommentiert</span>
    </Notification>

    <Notification type="xp_twin_found">
      <SparklesIcon />
      <span>Neuer XP Twin gefunden: {twin.name}</span>
    </Notification>

    <Notification type="pattern_match">
      <TrendingIcon />
      <span>Deine Erfahrung passt zu neuem Pattern</span>
    </Notification>
  </NotificationList>
</NotificationCenter>
```

### Implementation Tasks

1. **Add social tables:**
   ```sql
   CREATE TABLE user_follows (
     follower_id UUID REFERENCES profiles(id),
     following_id UUID REFERENCES profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     PRIMARY KEY (follower_id, following_id)
   );

   CREATE TABLE experience_comments (
     id UUID PRIMARY KEY,
     experience_id UUID REFERENCES experiences(id),
     user_id UUID REFERENCES profiles(id),
     content TEXT NOT NULL,
     parent_comment_id UUID REFERENCES experience_comments(id),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE pattern_collaborations (
     id UUID PRIMARY KEY,
     pattern_id UUID,
     user_id UUID REFERENCES profiles(id),
     contribution_type TEXT, -- 'confirm', 'question', 'reject', 'note'
     content JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Build social APIs:**
   - `/api/users/[id]/follow`
   - `/api/users/[id]/xp-twins`
   - `/api/experiences/[id]/comments`
   - `/api/patterns/[id]/collaborate`
   - `/api/feed` (personalized activity feed)

3. **Create social UI components:**
   - Enhanced user profile page
   - XP Twins discovery card
   - Comments section
   - Activity feed
   - Notification center

---

## 📝 Implementation Plan

### Phase 1: LLM Query Parser (Week 1)

**Goal:** Replace manual keyword extraction with AI-powered intent parsing.

**Tasks:**

**Day 1-2:**
1. ✅ Create `lib/ai/query-parser.ts`
2. ✅ Implement `parseQuery()` with Structured Output
3. ✅ Define Zod schemas for intent + filters
4. ✅ Add unit tests

**Day 3:**
1. ✅ Update `/api/chat/route.ts` to use parseQuery()
2. ✅ Remove `lib/search/keyword-extraction.ts`
3. ✅ Test edge cases (typos, mixed languages, ambiguous queries)

**Day 4:**
1. ✅ Add confidence scoring
2. ✅ Handle low-confidence queries (ask for clarification)
3. ✅ Deploy to staging

**Success Criteria:**
- Zero "keine exakten Treffer mit 'jemand, schon'" errors
- 95%+ parsing accuracy on test queries
- Response time < 500ms

**Code Example:**

```typescript
// lib/ai/query-parser.ts
import { generateObject } from 'ai'
import { openai } from '@/lib/openai/ai-sdk-client' // ✅ Use pre-configured provider
import { z } from 'zod'

const SearchIntentSchema = z.object({
  intent: z.enum(['search', 'pattern', 'comparison', 'timeline', 'question']),
  filters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    witnessesOnly: z.boolean().optional(),
    exclude: z.object({
      color: z.string().optional(),
      tags: z.array(z.string()).optional()
    }).optional()
  }),
  naturalLanguageQuery: z.string(),
  confidence: z.number().min(0).max(1)
})

export async function parseQuery(userQuery: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: SearchIntentSchema,
    system: `You are a query parser for XPShare, a platform for anomalous human experiences.

Extract search intent and structured filters from natural language queries.

Available categories: ufo-uap, dreams, paranormal-anomalies, synchronicities, deja-vu, premonitions
Common tags: ufo, dream, ghost, dolphin, bird, light, sound, fear, wonder

Examples:

Query: "hatte jemand in europa von ufos geträumt aber keine blauen?"
Output:
{
  "intent": "search",
  "filters": {
    "category": "dreams",
    "tags": ["ufo"],
    "location": "europa",
    "exclude": { "color": "blue" }
  },
  "naturalLanguageQuery": "UFO dreams in Europe, excluding blue UFOs",
  "confidence": 0.95
}

Query: "welche muster gibt es bei delfin sichtungen?"
Output:
{
  "intent": "pattern",
  "filters": {
    "tags": ["delfin", "dolphin"]
  },
  "naturalLanguageQuery": "patterns in dolphin sightings",
  "confidence": 0.9
}`,
    prompt: `Parse this query: "${userQuery}"`
  })

  return object
}
```

### Phase 2: Tool Calling Architecture (Week 2)

**Goal:** Build autonomous discovery agent with tool calling.

**Tasks:**

**Day 1:**
1. ✅ Create tool definitions (`lib/ai/tools/`)
   - search-tool.ts
   - pattern-tool.ts
   - connection-tool.ts
   - sentiment-tool.ts
   - visualization-tool.ts
   - statistics-tool.ts

**Day 2:**
1. ✅ Implement tool execution logic
2. ✅ Add error handling + retries
3. ✅ Create tool orchestration layer

**Day 3:**
1. ✅ Create `/api/discover` endpoint
2. ✅ Implement multi-step reasoning
3. ✅ Add conversation context management

**Day 4:**
1. ✅ Build simple chat UI for testing
2. ✅ Test complex multi-tool scenarios
3. ✅ Optimize for cost (caching, batching)

**Success Criteria:**
- Agent autonomously decides which tools to use
- Multi-step queries work (search → pattern → visualize)
- Conversation context maintained across turns
- Cost < $0.01 per query

**Code Example:**

```typescript
// app/api/discover/route.ts
import { generateText } from 'ai'
import { gpt4o } from '@/lib/openai/ai-sdk-client' // ✅ Use pre-configured provider
import { searchExperiencesTool } from '@/lib/ai/tools/search-tool'
import { detectPatternsTool } from '@/lib/ai/tools/pattern-tool'
import { visualizeTool } from '@/lib/ai/tools/visualization-tool'

const DISCOVERY_SYSTEM_PROMPT = `You are XPShare Discovery Assistant.

Your mission: Help users discover patterns and connections in anomalous human experiences.

Available data:
- 77 experiences across categories: ufo-uap (34), dreams (28), paranormal (15)
- Geocoded locations worldwide
- Temporal data (dates, times of day)
- Attributes: colors, sounds, witnesses, emotions, categories

Your approach:
1. Understand user's discovery intent
2. Use tools to search, analyze, detect patterns
3. Present findings conversationally with insights
4. Surface unexpected connections (serendipity!)
5. Suggest follow-up explorations

Guidelines:
- Be curious and pattern-focused
- Highlight statistical significance
- Use visualizations to clarify patterns
- Provide confidence scores for patterns
- Make connections between seemingly unrelated experiences
- Encourage exploration

Available tools: search_experiences, detect_patterns, find_connections, analyze_sentiment, visualize_data, get_statistics`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await generateText({
    model: gpt4o,
    messages,
    system: DISCOVERY_SYSTEM_PROMPT,

    tools: {
      search_experiences: searchExperiencesTool,
      detect_patterns: detectPatternsTool,
      find_connections: connectionTool,
      analyze_sentiment: sentimentTool,
      visualize_data: visualizeTool,
      get_statistics: statisticsTool
    },

    maxSteps: 5, // Allow up to 5 tool calls per query
    temperature: 0.7
  })

  return Response.json(result)
}
```

### Phase 3: Generative UI (Week 3)

**Goal:** Build Perplexity-style interface with streaming components.

**Tasks:**

**Day 1-2:**
1. ✅ Setup RSC (React Server Components)
2. ✅ Create renderable tools:
   - Map component (Leaflet/Mapbox)
   - Timeline chart (Recharts)
   - Network graph (react-force-graph)
   - Heatmap (Tremor)
   - Insight cards (custom)

**Day 3:**
1. ✅ Build Discovery Chat interface
2. ✅ Implement streaming responses
3. ✅ Add loading skeletons
4. ✅ Wire up interactive components

**Day 4:**
1. ✅ Add follow-up suggestions
2. ✅ Implement conversation history
3. ✅ Polish animations & transitions

**Day 5:**
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Deploy to production

**Success Criteria:**
- Perplexity-style UX (streaming, interactive)
- Response time < 3s for first token
- All visualizations interactive
- Mobile-responsive
- 95%+ user satisfaction

**Code Example:**

```typescript
// app/api/ui/route.ts
import { streamUI } from 'ai/rsc'
import { gpt4o } from '@/lib/openai/ai-sdk-client' // ✅ Use pre-configured provider
import { InteractiveMap } from '@/components/discovery/interactive-map'
import { TimelineChart } from '@/components/discovery/timeline-chart'
import { PatternInsightCard } from '@/components/discovery/pattern-insight-card'

export async function POST(req: Request) {
  const { message } = await req.json()

  return streamUI({
    model: gpt4o,
    messages: [
      { role: 'system', content: DISCOVERY_SYSTEM_PROMPT },
      { role: 'user', content: message }
    ],

    // Text responses
    text: ({ content }) => <ChatMessage>{content}</ChatMessage>,

    // Tool-generated UI components with progressive rendering
    tools: {
      search_experiences: {
        description: 'Search for experiences',
        parameters: SearchParamsSchema,
        generate: async function* (params) {
          // 1. Loading state
          yield (
            <Card className="animate-pulse">
              <Skeleton className="h-32" />
              <p>Suche in {params.location || 'allen Regionen'}...</p>
            </Card>
          )

          // 2. Execute search
          const results = await searchExperiences(params)

          // 3. Stream final UI
          return (
            <ExperienceGrid>
              {results.map(exp => (
                <ExperienceCard key={exp.id} data={exp} />
              ))}
              <InsightCard>
                Gefunden: {results.length} Erfahrungen
              </InsightCard>
            </ExperienceGrid>
          )
        }
      },

      show_map: {
        description: 'Show geographic distribution',
        parameters: z.object({ experienceIds: z.array(z.string()) }),
        generate: async function* ({ experienceIds }) {
          yield <MapSkeleton />

          const mapData = await getMapData(experienceIds)

          return (
            <InteractiveMap
              markers={mapData.markers}
              clusters={mapData.clusters}
              heatmap={mapData.heatmap}
              onMarkerClick={(exp) => {
                // Show experience detail modal
              }}
            />
          )
        }
      },

      show_timeline: {
        description: 'Show temporal patterns',
        parameters: z.object({ experienceIds: z.array(z.string()) }),
        generate: async function* ({ experienceIds }) {
          yield <TimelineSkeleton />

          const timelineData = await getTimelineData(experienceIds)

          return (
            <TimelineChart
              data={timelineData}
              interactive={true}
              onRangeSelect={(range) => {
                // User selects time range → new query
              }}
            />
          )
        }
      },

      show_pattern_insight: {
        description: 'Display detected pattern as insight card',
        parameters: z.object({
          pattern: z.string(),
          confidence: z.number(),
          dataPoints: z.array(z.any())
        }),
        generate: async function* (params) {
          return (
            <PatternInsightCard
              pattern={params.pattern}
              confidence={params.confidence}
              dataPoints={params.dataPoints}
            />
          )
        }
      }
    }
  })
}
```

---

## 💰 Cost Analysis

### Phase 1: Query Parser

**Model:** gpt-4o-mini
**Cost:** $0.15 / 1M input tokens

**Per Query:**
- Average: ~200 tokens
- Cost: $0.00003

**Monthly (1000 queries/day):**
- 30,000 queries
- Cost: ~$0.90/month

**Verdict:** ✅ Negligible

### Phase 2: Tool Calling Agent

**Model:** gpt-4o
**Cost:** $2.50 / 1M input tokens, $10 / 1M output tokens

**Per Session:**
- Average: ~1000 input + 500 output tokens
- Cost: $0.0025 + $0.005 = $0.0075

**Monthly (1000 sessions/day):**
- 30,000 sessions
- Cost: ~$225/month

**Optimization:**
- Cache common tool results: -30% = $157.50/month
- Use gpt-4o-mini for simple queries: -20% = $126/month

**Verdict:** ✅ Moderate, high value

### Phase 3: Generative UI

**Same as Phase 2** (no additional LLM costs)

**Total Monthly Cost (Optimized):**
- Query Parsing: $0.90
- Discovery Agent: $126
- Embeddings: ~$20
- **Total: ~$147/month**

**With 5000 users/day:**
- Cost per user: $0.001
- **Acceptable for freemium model**

---

## 📊 Success Metrics

### User Experience Metrics

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Zero "Keine exakten Treffer" errors | N/A | 100% | Error tracking |
| Natural language query success | 0% | 95% | Parse confidence > 0.8 |
| Follow-up question rate | 0% | 40% | Conversation depth > 1 |
| Pattern discovery per session | 0 | 2.5 | Avg patterns shown |
| Time to insight | 30s | 5s | First meaningful result |
| User satisfaction (NPS) | TBD | 8+/10 | Survey |

### Technical Metrics

| Metric | Target |
|--------|--------|
| Query parse time | < 500ms |
| First token response | < 1s |
| Full response time | < 5s |
| Tool call success rate | > 99% |
| Visualization render time | < 2s |
| Mobile performance score | > 90 |

### Business Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Avg session duration | TBD | 5+ min |
| Queries per session | TBD | 3+ |
| Return user rate (7-day) | TBD | 40% |
| Experience submissions (weekly) | TBD | 2x baseline |
| Pattern discoveries (weekly) | 0 | 50+ |

---

## 🚀 Migration Strategy

### Week 1: Foundation (Phase 1)

**Monday-Tuesday:**
- [ ] Install dependencies (`ai`, `zod`)
- [ ] Create `lib/ai/query-parser.ts`
- [ ] Write unit tests
- [ ] Benchmark performance

**Wednesday:**
- [ ] Update `/api/chat/route.ts`
- [ ] Remove `lib/search/keyword-extraction.ts`
- [ ] Test with existing UI

**Thursday:**
- [ ] Handle edge cases
- [ ] Add confidence thresholds
- [ ] Deploy to staging

**Friday:**
- [ ] QA testing
- [ ] Fix bugs
- [ ] Monitor metrics

### Week 2: Intelligence (Phase 2)

**Monday:**
- [ ] Create tool definitions
- [ ] Implement search tool
- [ ] Implement pattern tool

**Tuesday:**
- [ ] Implement connection tool
- [ ] Implement sentiment tool
- [ ] Implement visualization tool

**Wednesday:**
- [ ] Create `/api/discover` endpoint
- [ ] Wire up multi-step reasoning
- [ ] Add conversation context

**Thursday:**
- [ ] Build test UI
- [ ] Test complex scenarios
- [ ] Optimize costs

**Friday:**
- [ ] Load testing
- [ ] Deploy to staging
- [ ] Monitor performance

### Week 3: Experience (Phase 3)

**Monday-Tuesday:**
- [ ] Create Interactive Map component
- [ ] Create Timeline Chart component
- [ ] Create Network Graph component
- [ ] Create Pattern Insight Cards

**Wednesday:**
- [ ] Build Discovery Chat interface
- [ ] Implement streaming UI
- [ ] Add loading skeletons

**Thursday:**
- [ ] Wire up interactive events
- [ ] Add follow-up suggestions
- [ ] Polish animations

**Friday:**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] 🎉 Launch!

---

## ⚡ AI SDK 5.0 Best Practices

### 1. Provider Configuration

**✅ DO:** Use `createOpenAI()` with strict mode and pre-configured providers

```typescript
// lib/openai/ai-sdk-client.ts
import { createOpenAI } from '@ai-sdk/openai'

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict', // ✅ Enables AI SDK 5.0 strict mode
})

export const gpt4o = openai('gpt-4o')
export const gpt4oMini = openai('gpt-4o-mini')
```

**❌ DON'T:** Import providers directly in route files

```typescript
// ❌ Bad - Deprecated pattern
import { openai } from '@ai-sdk/openai'

const result = await generateText({
  model: openai('gpt-4o'), // ❌ Creates new instance each time
})
```

### 2. Tool Definitions

**✅ DO:** Use the `tool()` function from 'ai'

```typescript
// lib/ai/tools/search-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

export const searchTool = tool({
  description: 'Search for experiences',
  parameters: z.object({
    query: z.string(),
    filters: z.object({}).optional(),
  }),
  execute: async (params) => {
    // Implementation
    return results
  }
})
```

**❌ DON'T:** Define tools as plain objects

```typescript
// ❌ Bad - Not type-safe
export const searchTool = {
  description: 'Search for experiences',
  parameters: SearchSchema,
  execute: async (params) => { ... }
}
```

### 3. Generative UI

**✅ DO:** Use `streamUI()` for progressive rendering

```typescript
import { streamUI } from 'ai/rsc'
import { gpt4o } from '@/lib/openai/ai-sdk-client'

export async function POST(req: Request) {
  const { message } = await req.json()

  return streamUI({
    model: gpt4o,
    messages: [{ role: 'user', content: message }],

    // Progressive rendering with generate()
    tools: {
      search: tool({
        description: 'Search experiences',
        parameters: SearchSchema,
        generate: async function* (params) {
          // 1. Loading state
          yield <LoadingSkeleton />

          // 2. Execute search
          const results = await search(params)

          // 3. Final UI
          return <ResultsGrid data={results} />
        }
      })
    }
  })
}
```

**❌ DON'T:** Use deprecated `render()` function

```typescript
// ❌ Bad - render() is deprecated
import { render } from 'ai/rsc'

return render({ // ❌ Use streamUI instead
  tools: {
    search: {
      render: async function* () { } // ❌ Use generate instead
    }
  }
})
```

### 4. Structured Outputs

**✅ DO:** Use `generateObject()` with Zod schemas

```typescript
import { generateObject } from 'ai'
import { gpt4oMini } from '@/lib/openai/ai-sdk-client'
import { z } from 'zod'

const OutputSchema = z.object({
  intent: z.enum(['search', 'pattern', 'connection']),
  filters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
})

const result = await generateObject({
  model: gpt4oMini,
  schema: OutputSchema,
  schemaName: 'SearchIntent', // ✅ Improves accuracy
  schemaDescription: 'Parsed user search intent', // ✅ Context for model
  prompt: userQuery,
  temperature: 0.3, // ✅ Lower for structured outputs
})

// ✅ Fully typed
const { intent, filters } = result.object
```

### 5. Token Control & Cost Optimization

**✅ DO:** Use `maxCompletionTokens` to control output length

```typescript
const result = await generateText({
  model: gpt4o,
  messages,
  maxCompletionTokens: 1000, // ✅ Correct in AI SDK 5.0
  temperature: 0.7,
})
```

**❌ DON'T:** Use deprecated `maxTokens`

```typescript
const result = await generateText({
  model: gpt4o,
  messages,
  maxTokens: 1000, // ❌ Deprecated, use maxCompletionTokens
})
```

**Additional Cost Optimization Tips:**

- Use `gpt-4o-mini` for simple tasks (60× cheaper)
- Set appropriate `maxCompletionTokens` to prevent runaway costs
- Use `temperature: 0.3` or lower for structured outputs (more consistent)
- Implement streaming to provide faster perceived performance
- Cache system prompts when possible

### 6. Multi-Step Reasoning

**✅ DO:** Use `maxSteps` for tool calling workflows

```typescript
const result = await generateText({
  model: gpt4o,
  messages,
  tools: {
    search: searchTool,
    analyze: analyzeTool,
  },
  maxSteps: 5, // ✅ Allow up to 5 tool calls
})

// ✅ Access all steps
console.log(result.steps) // Array of tool calls
```

### 7. Client-Side Integration

**✅ DO:** Use `useChat()` with custom transports

```typescript
'use client'

import { useChat } from '@ai-sdk/react'

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: customTransport, // ✅ For custom routing
  })

  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} {...msg} />
      ))}
      <button onClick={() => sendMessage({ text: 'Search UFOs' })}>
        Send
      </button>
    </div>
  )
}
```

### 8. Error Handling

**✅ DO:** Handle errors gracefully with type guards

```typescript
import { generateObject } from 'ai'

try {
  const result = await generateObject({
    model: gpt4oMini,
    schema: MySchema,
    prompt: userInput,
  })

  // ✅ result.object is typed and validated
  return result.object

} catch (error) {
  // ✅ Handle API errors
  if (error instanceof Error) {
    console.error('AI SDK Error:', error.message)
  }

  // ✅ Return fallback
  return { intent: 'unknown', filters: {} }
}
```

### 9. Type Safety

**✅ DO:** Leverage TypeScript for full type safety

```typescript
import { tool } from 'ai'
import { z } from 'zod'

const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().default(10),
})

// ✅ Params are automatically inferred as { query: string; limit: number }
export const searchTool = tool({
  description: 'Search experiences',
  parameters: SearchSchema,
  execute: async (params) => {
    // params.query ✅ Typed as string
    // params.limit ✅ Typed as number
    return results
  }
})
```

### 10. Performance Best Practices

**Streaming for Better UX:**

```typescript
// ✅ Stream text responses
const result = streamText({
  model: gpt4o,
  messages,
})

// Client receives tokens as they're generated
return result.toDataStreamResponse()
```

**Progressive UI Rendering:**

```typescript
// ✅ Show loading states immediately
generate: async function* (params) {
  yield <Skeleton /> // ✅ Instant feedback

  const data = await fetchData(params)

  return <Results data={data} /> // ✅ Final UI
}
```

**Parallel Tool Calls (AI SDK 5.0+):**

```typescript
const result = await generateText({
  model: gpt4o,
  messages,
  tools: {
    searchUFO: ufoSearchTool,
    searchDreams: dreamSearchTool,
  },
  // ✅ AI SDK 5.0 can execute multiple tools in parallel
  maxSteps: 3,
})
```

---

## 🎯 Next Steps

1. **Review this document** with team
2. **Approve architecture** and tech stack
3. **Set up development environment**
4. **Begin Phase 1 implementation**

---

## 📚 References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Recharts Documentation](https://recharts.org/)
- [Tremor UI](https://tremor.so/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Enigma Labs](https://enigmalabs.io/)
- [Perplexity AI](https://www.perplexity.ai/)

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-10-19
**Next Review:** After Phase 1 completion
