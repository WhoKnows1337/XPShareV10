# AI Discovery System - Architecture Overview

**Purpose:** High-level architecture and technology stack for XPShare AI Chat
**Status:** Reference Document
**Last Updated:** 2025-10-20

---

## 🎯 Vision

Transform XPShare into a **Conversational Discovery Platform** where:
- ✅ Users ask questions in natural language
- ✅ AI understands intent and extracts filters automatically
- ✅ System generates dynamic visualizations (Maps, Charts, Networks)
- ✅ Patterns are detected and surfaced automatically
- ✅ Community connections are discovered
- ✅ Follow-up questions work contextually

## 🏗️ Three-Phase Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    USER QUERY                                 │
│     "hatte jemand in europa von ufos geträumt                │
│      aber keine blauen?"                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│              PHASE 1: LLM Query Parser                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Model: gpt-4o-mini (fast, cheap)                       │  │
│  │ Input: Natural language question                       │  │
│  │ Output: Structured intent + filters                    │  │
│  │                                                         │  │
│  │ {                                                       │  │
│  │   intent: "search",                                    │  │
│  │   filters: {                                           │  │
│  │     category: "dreams",                                │  │
│  │     tags: ["ufo"],                                     │  │
│  │     location: "europa",                                │  │
│  │     exclude: { color: "blue" }                         │  │
│  │   },                                                   │  │
│  │   confidence: 0.95                                     │  │
│  │ }                                                       │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│           PHASE 2: Tool Calling Agent                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Search     │  │   Pattern    │  │  Sentiment   │      │
│  │   Tool       │  │   Detection  │  │  Analysis    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Connections  │  │ Visualization│  │  Statistics  │      │
│  │   Tool       │  │    Tool      │  │    Tool      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  LLM (gpt-4o) decides which tools to call, in what order    │
│  Multi-step reasoning: Search → Pattern → Visualize         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│          PHASE 3: Generative UI Response                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Streaming Components (React Server Components)         │  │
│  │                                                         │  │
│  │ 1. Text Response (AI-written insight)                  │  │
│  │ 2. Interactive Map (clustered markers)                 │  │
│  │ 3. Timeline Chart (temporal patterns)                  │  │
│  │ 4. Pattern Cards (auto-detected insights)              │  │
│  │ 5. Experience Cards (related results)                  │  │
│  │ 6. Follow-up Suggestions (next questions)              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Core AI

| Technology | Version | Purpose | Cost |
|-----------|---------|---------|------|
| OpenAI gpt-4o-mini | Latest | Query parsing (Phase 1) | $0.15/1M input tokens |
| OpenAI gpt-4o | Latest | Tool calling agent (Phase 2) | $2.50/1M input tokens |
| OpenAI text-embedding-3-small | 1536 dims | Vector embeddings | $0.02/1M tokens |
| Vercel AI SDK | 5.x | Generative UI + Streaming | Free |

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

## 📌 Important Design Decisions

### Embedding Model: text-embedding-3-small

**Why NOT text-embedding-3-large?**

- ⚠️ **Supabase pgvector 0.8.0 has a 2,000 dimension limit** for both IVFFlat and HNSW indexes
- `text-embedding-3-large` produces 3,072 dimensions (exceeds index limit)
- `text-embedding-3-small` (1536 dims) fits within limit
- More cost-effective: $0.02 vs $0.13 per 1M tokens
- For our dataset size (~111 experiences), accuracy difference is negligible

**Future Upgrade Path:**
When Supabase upgrades to pgvector 0.9.0+ (16,000 dim limit):
- Use `text-embedding-3-large` with `dimensions: 1536` parameter (better accuracy)
- Or remove indexes entirely for small datasets (<10,000 rows)

### Hybrid Search Strategy

Modern approach (Shopify, GitHub Copilot, Voiceflow):

```
User Query → Vector Search (Semantic)
          → Full-Text Search (PostgreSQL FTS)
          → Reciprocal Rank Fusion (RRF)
          → Ranked Results
```

**NOT manual keyword extraction!** PostgreSQL FTS handles:
- Stop-word filtering
- Stemming/Lemmatization
- Normalization
- All automatically

## 🎨 Generative UI Patterns

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

## 📂 File Structure

```
/app/api/
├── chat/route.ts              # Phase 1: Query Parser (✅ Implemented)
├── discover/route.ts          # Phase 2: Tool Calling (To-Do)
└── ui/route.ts                # Phase 3: Generative UI (To-Do)

/lib/ai/
├── tools/
│   ├── search-tool.ts         # Tool 1: Search Experiences
│   ├── pattern-tool.ts        # Tool 2: Detect Patterns
│   ├── connection-tool.ts     # Tool 3: Find Connections
│   ├── sentiment-tool.ts      # Tool 4: Analyze Sentiment
│   ├── visualization-tool.ts  # Tool 5: Generate Visualization
│   └── statistics-tool.ts     # Tool 6: Get Statistics
└── prompts.ts                 # System prompts

/components/discovery/
├── interactive-map.tsx        # Map visualization
├── timeline-chart.tsx         # Temporal patterns
├── pattern-insight-card.tsx   # Pattern cards
└── experience-grid.tsx        # Results display
```

## 🔗 Related Guides

- [01-phase1-query-parser.md](./01-phase1-query-parser.md) - Query parsing implementation
- [02-phase2-tools.md](./02-phase2-tools.md) - Tool calling architecture
- [03-phase3-generative-ui.md](./03-phase3-generative-ui.md) - Generative UI implementation
- [04-attributes.md](./04-attributes.md) - Category-specific attributes
- [05-best-practices.md](./05-best-practices.md) - AI SDK 5.0 best practices
- [tools/](./tools/) - Individual tool implementation guides

## 🚀 Quick Start

**To implement Phase 2 (Tool Calling):**

1. Read [02-phase2-tools.md](./02-phase2-tools.md) for overall architecture
2. Implement each tool following [tools/tool-X-*.md](./tools/) guides
3. Follow [05-best-practices.md](./05-best-practices.md) for AI SDK 5.0 patterns
4. Refer to [CHECKLIST.md](./CHECKLIST.md) to track progress

**To implement Phase 3 (Generative UI):**

1. Read [03-phase3-generative-ui.md](./03-phase3-generative-ui.md)
2. Follow progressive rendering patterns from [05-best-practices.md](./05-best-practices.md)
3. Build interactive components with streaming support

---

**Next:** Read [CHECKLIST.md](./CHECKLIST.md) to see current implementation status
