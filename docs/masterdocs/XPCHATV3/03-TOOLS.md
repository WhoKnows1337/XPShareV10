# XPChat v3 - Tools Specification

**Status:** Planning Phase
**Created:** 2025-10-26
**Tool Count:** 4 Core Tools

> **Architecture Context:** Diese Tools werden vom AI SDK 6 ToolLoopAgent verwendet. Siehe [01A-ARCHITECTURE-DECISIONS.md](./01A-ARCHITECTURE-DECISIONS.md) für die vollständige Tech-Stack-Entscheidung.

---

## 🛠️ Tool Philosophy

**NICHT:** 15 spezialisierte Tools
**SONDERN:** 4 intelligente Multi-Purpose Tools

### Warum nur 4 Tools?

1. **Weniger Token Overhead** (1,200 tokens vs 3,500 tokens)
2. **Einfachere Agent-Entscheidungen** (weniger Optionen = schneller)
3. **Bessere Maintainability** (4 Tools pflegen statt 15)
4. **Klare Verantwortlichkeiten** (Search, Visualize, Analyze, Context)

---

## Tool 1: unifiedSearch

### Beschreibung

```typescript
description: `Searches experiences using Vector Search, Full-Text, or Geographic queries.
Use "explore" mode for pattern discovery (returns top 15-50 most relevant).
Use "browse" mode to find all matching experiences (with pagination).
Use "find" mode for specific experience lookup.`
```

### Parameters

```typescript
{
  query: string           // Search query or description
  mode: 'explore' | 'browse' | 'find'  // Default: 'explore'
  category?: string       // Optional: UFO, Dreams, NDE, etc.
  location?: string       // Optional: location filter
  dateFrom?: string       // Optional: ISO date
  dateTo?: string         // Optional: ISO date
  limit: number          // Default: 15
  offset: number         // Default: 0 (for pagination)
}
```

### Modi Erklärt

#### Mode: "explore" (Default)

**Wann:** User will Patterns entdecken, Insights bekommen
**Methode:** Vector Search (Similarity-based)
**Returns:** Top 15-50 relevanteste Experiences

```
Input: "UFO Sichtungen in Bayern"
→ Generate embedding
→ match_experiences(similarity > 0.3)
→ Return top 15 with similarity scores

Output: {
  mode: 'explore',
  experiences: [...15 items...],
  totalCount: 15,
  message: "Found 15 relevant experiences for exploration"
}
```

**Vorteile:**
- Findet semantisch ähnliche, nicht nur Keywords
- Optimiert für AI-Analyse
- Schnell (Top-K nur)

#### Mode: "browse"

**Wann:** User will ALLE Treffer sehen
**Methode:** Full-Text Search + Filters
**Returns:** Alle Treffer mit Pagination

```
Input: "Zeig mir alle Träume über Fliegen"
→ Full-text search on story_text
→ Apply filters
→ Return page with pagination info

Output: {
  mode: 'browse',
  experiences: [...20 items...],
  totalCount: 187,
  currentPage: 1,
  totalPages: 10,
  message: "Showing 1-20 of 187 experiences"
}
```

**Vorteile:**
- User kann ALLES durchblättern
- Exakte Treffer (nicht nur ähnliche)
- Pagination für große Datasets

#### Mode: "find"

**Wann:** User sucht spezifischen Eintrag
**Methode:** High-Similarity Vector Search
**Returns:** Top 5 exakte Matches

```
Input: "Mein UFO-Erlebnis vom 23. Juli in München"
→ Generate embedding
→ match_experiences(similarity > 0.8)  // High threshold!
→ Return only very close matches

Output: {
  mode: 'find',
  experiences: [...1-5 items...],
  totalCount: 2,
  message: "Found 2 matching experience(s)"
}
```

**Vorteile:**
- Für "Nadel im Heuhaufen" Suchen
- User sucht IHREN Eintrag
- Sehr hohe Precision

### Implementation Notes

```typescript
// RLS ist AUTOMATISCH enforced via Supabase client!
// User sieht nur:
// - Public experiences (is_public = true)
// - Own experiences (user_id = auth.uid())

// Geographic Filter (client-side für MVP)
if (location) {
  filtered = filtered.filter(exp =>
    exp.location_text?.toLowerCase().includes(location.toLowerCase())
  )
}

// Später: PostGIS für echte Geo-Queries
// ST_DWithin(location_geo, ST_MakePoint(lng, lat), radius)
```

### Search Evolution Strategy

**Problem:** Vector Search allein findet semantisch ähnliche, aber nicht immer die BESTEN Results.

**Solution:** Progressive Enhancement - Start Simple, Add Complexity Only When Needed

#### Phase 1: Simple Vector Search (MVP - Week 1-4)

```typescript
// lib/tools/unified-search.ts

export async function unifiedSearch(params: {
  query: string;
  mode: 'explore' | 'browse' | 'find';
  limit: number;
}) {
  // ✅ Simple & Fast: Vector Search only
  const embedding = await generateEmbedding(params.query);

  const { data } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: params.mode === 'find' ? 0.8 : 0.3,
    match_count: params.limit
  });

  return {
    mode: params.mode,
    experiences: data,
    method: 'vector_only'
  };
}
```

**Performance:** 50ms avg, Good relevance (70-80%)

#### Phase 2: Add Reranker (RECOMMENDED - Week 5-8)

**Better approach than RRF:** Use specialized Reranker Model

```typescript
// lib/tools/unified-search-reranker.ts

import { CohereClient } from 'cohere-ai'; // oder Jina AI

export async function unifiedSearchWithReranker(params: {
  query: string;
  limit: number;
}) {
  // 1. Vector Search (fast, get top 50 candidates)
  const embedding = await generateEmbedding(params.query);

  const { data: candidates } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 50 // Get more candidates für reranking
  });

  // 2. Rerank mit Cohere (or Jina)
  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

  const reranked = await cohere.rerank({
    query: params.query,
    documents: candidates.map(c => c.description),
    top_n: params.limit, // Return only top N
    model: 'rerank-english-v3.0'
  });

  // 3. Return reranked results (viel bessere Relevanz!)
  return {
    experiences: reranked.results.map(r => candidates[r.index]),
    method: 'vector + reranker',
    relevanceBoost: '+30%'
  };
}
```

**Performance:** 120ms avg, Excellent relevance (90-95%)

**Cost:**
- Cohere Rerank: $0.002 per 1k searches
- Jina AI Rerank: $0.00005 per request

**When to use:** Complex queries, multi-word searches, when relevance is critical

#### Phase 3: Reciprocal Rank Fusion (ADVANCED - Optional)

```typescript
// lib/search/hybrid-ranker.ts

interface SearchSignal {
  results: Array<{ id: string; score: number }>;
  weight: number;
}

export function reciprocalRankFusion(
  signals: SearchSignal[],
  k: number = 60 // Constant for RRF formula
): Array<{ id: string; score: number }> {

  const scoreMap = new Map<string, number>();

  signals.forEach(signal => {
    signal.results.forEach((result, rank) => {
      const rrf = signal.weight / (k + rank + 1);
      scoreMap.set(
        result.id,
        (scoreMap.get(result.id) || 0) + rrf
      );
    });
  });

  return Array.from(scoreMap.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
```

#### Complete Implementation

```typescript
// app/api/chat/tools/unified-search.ts

async function hybridSearch(params: {
  query: string;
  mode: 'explore' | 'browse' | 'find';
  category?: string;
  location?: string;
  userLocation?: [number, number]; // [lat, lng]
  limit: number;
}) {

  // 1. Vector Search (Semantic)
  const embedding = await generateEmbedding(params.query);
  const { data: vectorResults } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: params.mode === 'find' ? 0.8 : 0.3,
    match_count: params.limit * 2
  });

  const vectorSignal: SearchSignal = {
    results: vectorResults.map(r => ({ id: r.id, score: r.similarity })),
    weight: 0.4
  };

  // 2. Full-Text Search (Keywords)
  const { data: textResults } = await supabase
    .from('experiences')
    .select('id')
    .textSearch('story_text', params.query, {
      type: 'websearch',
      config: 'english'
    })
    .limit(params.limit * 2);

  const textSignal: SearchSignal = {
    results: textResults?.map((r, i) => ({
      id: r.id,
      score: 1 - (i / textResults.length) // Rank-based score
    })) || [],
    weight: 0.3
  };

  // 3. Temporal Signal (Recency)
  const { data: recentResults } = await supabase
    .from('experiences')
    .select('id, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(params.limit * 2);

  const now = Date.now();
  const temporalSignal: SearchSignal = {
    results: recentResults?.map(r => ({
      id: r.id,
      score: 1 - (now - new Date(r.occurred_at).getTime()) / (365 * 24 * 60 * 60 * 1000) // Decay over year
    })) || [],
    weight: 0.2
  };

  // 4. Geographic Signal (If user location provided)
  let geoSignal: SearchSignal | null = null;

  if (params.userLocation && params.location) {
    const { data: geoResults } = await supabase.rpc('find_nearby_experiences', {
      p_lat: params.userLocation[0],
      p_lng: params.userLocation[1],
      p_radius_km: 100,
      p_limit: params.limit * 2
    });

    geoSignal = {
      results: geoResults?.map(r => ({
        id: r.id,
        score: 1 - (r.distance_km / 100) // Inverse distance
      })) || [],
      weight: 0.1
    };
  }

  // 5. Combine with RRF
  const signals = [vectorSignal, textSignal, temporalSignal];
  if (geoSignal) signals.push(geoSignal);

  const rankedResults = reciprocalRankFusion(signals);

  // 6. Fetch full experiences
  const topIds = rankedResults.slice(0, params.limit).map(r => r.id);
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .in('id', topIds);

  // Preserve RRF order
  const ordered = topIds.map(id =>
    experiences?.find(exp => exp.id === id)
  ).filter(Boolean);

  return {
    experiences: ordered,
    totalCount: ordered.length,
    mode: params.mode,
    hybridScoring: true
  };
}
```

**When to use RRF:** Custom ranking needs, multiple signal sources, maximum control

**RRF Details:** Same as above (4 signals: Vector, Text, Temporal, Geographic)

#### Search Method Comparison

| Method | Complexity | Latency | Relevance | Cost | Use Case |
|--------|-----------|---------|-----------|------|----------|
| **Vector Only** | Low | 50ms | 70-80% | Baseline | MVP, simple queries |
| **Vector + Reranker** | Medium | 120ms | 90-95% | +$0.00005/query | **RECOMMENDED** for production |
| **RRF (4 signals)** | High | 200ms | 85-90% | Baseline | Advanced custom ranking |

#### Implementation Roadmap

```typescript
// Week 1-4 (MVP)
export const searchMethod = 'vector_only';

// Week 5-8 (Add Reranker)
export const searchMethod = process.env.ENABLE_RERANKER === 'true'
  ? 'vector_reranker'
  : 'vector_only';

// Week 9+ (Optional: Add RRF for specific use cases)
export const searchMethod = (query: string) => {
  if (needsCustomRanking(query)) return 'rrf';
  if (process.env.ENABLE_RERANKER) return 'vector_reranker';
  return 'vector_only';
};
```

**Recommendation:**
- ✅ **Start:** Vector Only (Week 1-4)
- ✅ **Production:** Vector + Reranker (Week 5-8)
- ⚠️ **Advanced:** RRF only if reranker insufficient

**See Also:** [14-PATTERN-DETECTION.md](./14-PATTERN-DETECTION.md) for similarity algorithms

---

## Tool 2: visualize

### Beschreibung

```typescript
description: `Creates visualizations from experience data.
Supports: map (geographic), timeline (temporal), network (connections), dashboard (stats)`
```

### Parameters

```typescript
{
  type: 'map' | 'timeline' | 'network' | 'dashboard'
  experienceIds: string[]   // Array of experience IDs to visualize
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year'  // For timeline
}
```

### Visualization Types

#### Type: "map"

**Output:** GeoJSON FeatureCollection

```json
{
  "type": "map",
  "geoJSON": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [11.5820, 48.1351]  // [lng, lat]
        },
        "properties": {
          "id": "uuid-123",
          "title": "UFO über München",
          "category": "UFO"
        }
      }
    ]
  },
  "count": 23
}
```

**Frontend:** Rendert mit Mapbox GL

#### Type: "timeline"

**Output:** Time-series data

```json
{
  "type": "timeline",
  "timeline": [
    { "date": "2024-01", "count": 12 },
    { "date": "2024-02", "count": 18 },
    { "date": "2024-03", "count": 8 }
  ],
  "groupBy": "month"
}
```

**Frontend:** Rendert mit Recharts LineChart

#### Type: "dashboard"

**Output:** Aggregated statistics

```json
{
  "type": "dashboard",
  "metrics": {
    "total": 234,
    "byCategory": {
      "UFO": 89,
      "Dreams": 67,
      "Paranormal": 45,
      "NDE": 33
    },
    "byLocation": {
      "München": 34,
      "Berlin": 28,
      "Hamburg": 21
    },
    "topTags": [
      { "tag": "light", "count": 78 },
      { "tag": "flying", "count": 56 },
      { "tag": "night", "count": 45 }
    ]
  }
}
```

**Frontend:** Rendert mit Cards + Recharts BarChart

#### Type: "network" (TODO - Later)

**Output:** Graph data

```json
{
  "type": "network",
  "nodes": [
    { "id": "exp-1", "label": "UFO München", "category": "UFO" },
    { "id": "exp-2", "label": "UFO Hamburg", "category": "UFO" }
  ],
  "edges": [
    { "source": "exp-1", "target": "exp-2", "similarity": 0.87 }
  ]
}
```

**Frontend:** Rendert mit react-force-graph-2d

---

## Tool 3: discoverPatterns (TODO - Phase 2)

### Beschreibung

```typescript
description: `Discovers patterns and insights using AI analysis.
Finds temporal patterns, geographic clusters, semantic connections, and cross-category links.`
```

### Parameters

```typescript
{
  experienceIds: string[]
  dimensions: ('temporal' | 'geographic' | 'semantic' | 'cross-category')[]
  minConfidence?: number  // Default: 0.7
}
```

### Pattern Types

#### Temporal Patterns

```json
{
  "type": "temporal",
  "pattern": {
    "name": "Vollmond Spike",
    "description": "78% der Sichtungen passieren bei Vollmond ±3 Tage",
    "confidence": 0.87,
    "pValue": 0.012,
    "dataPoints": 45,
    "visualization": "timeline"
  }
}
```

#### Geographic Clusters

```json
{
  "type": "geographic",
  "pattern": {
    "name": "München Hotspot",
    "description": "Cluster von 23 Sichtungen im 5km Radius",
    "confidence": 0.92,
    "center": [48.1351, 11.5820],
    "radius": 5000,
    "count": 23,
    "visualization": "map_heatmap"
  }
}
```

#### Semantic Patterns

```json
{
  "type": "semantic",
  "pattern": {
    "name": "Licht-Beschreibungen",
    "description": "82% berichten von 'hellem weißen Licht'",
    "confidence": 0.85,
    "keywords": ["licht", "hell", "weiß", "strahlend"],
    "frequency": 0.82,
    "examples": ["exp-1", "exp-5", "exp-12"]
  }
}
```

#### Cross-Category Links

```json
{
  "type": "cross_category",
  "pattern": {
    "name": "Dreams ↔ Meditation",
    "description": "Personen mit Meditationserfahrung berichten 2.3x häufiger von luziden Träumen",
    "confidence": 0.79,
    "categories": ["Dreams", "Meditation"],
    "correlation": 0.68,
    "significance": "p < 0.05",
    "insight": "Meditation könnte Traumwahrnehmung beeinflussen"
  }
}
```

---

## Tool 4: manageContext (TODO - Phase 2)

### Beschreibung

```typescript
description: `Manages conversation context, user preferences, and search history.
Saves and loads context for better multi-turn conversations.`
```

### Parameters

```typescript
{
  action: 'save' | 'load' | 'clear'
  contextType: 'conversation' | 'preferences' | 'history'
  data?: any
}
```

### Context Types

#### Conversation Memory

```json
{
  "threadId": "thread-123",
  "messages": [...],
  "lastQuery": "UFO Sichtungen Bayern",
  "lastResults": ["exp-1", "exp-2", "exp-3"],
  "currentFocus": "geographic_analysis"
}
```

#### User Preferences

```json
{
  "favoriteCategories": ["UFO", "NDE"],
  "location": "München",
  "language": "de",
  "notificationSettings": {
    "patterns": true,
    "similarUsers": false
  }
}
```

#### Search History

```json
{
  "recentQueries": [
    "UFO Sichtungen Bayern",
    "Nahtoderfahrungen",
    "Luzide Träume"
  ],
  "savedSearches": [
    { "name": "UFOs in meiner Nähe", "query": "...", "filters": {...} }
  ]
}
```

---

## 🎯 Tool Decision Matrix

Agent soll entscheiden welches Tool basierend auf User Intent:

| User Intent | Tool Combo | Example |
|------------|-----------|---------|
| **Exploration** | search(explore) + visualize | "UFO Sichtungen Bayern" |
| **Browse All** | search(browse) | "Zeig mir alle Träume über Fliegen" |
| **Find Specific** | search(find) | "Mein Eintrag vom 23. Juli" |
| **Temporal Analysis** | search + visualize(timeline) + patterns | "Wann passieren die meisten Sichtungen?" |
| **Geographic Analysis** | search + visualize(map) + patterns | "Wo gibt es Hotspots?" |
| **Pattern Discovery** | search + patterns | "Was sind Gemeinsamkeiten bei NDEs?" |
| **Stats Overview** | search + visualize(dashboard) | "Gib mir einen Überblick" |
| **Connections** | search + visualize(network) | "Welche Erlebnisse hängen zusammen?" |

---

## 📊 Tool Performance Targets

| Tool | Avg Exec Time | Token Usage | Cost |
|------|---------------|-------------|------|
| **unifiedSearch** | 50-200ms | 500 | $0.00001 |
| **visualize** | 100-500ms | 200 | $0.00001 |
| **discoverPatterns** | 1-3s | 1500 | $0.005 |
| **manageContext** | 10-50ms | 100 | $0.000005 |

**Total avg per query:** 2-5s, ~2500 tokens, ~$0.0075

---

## 🔄 Tool Chaining Examples

### Simple Query

```
User: "UFO Sichtungen in Deutschland"

Agent Plan:
1. unifiedSearch(query: "UFO Deutschland", mode: "explore", category: "UFO")
2. [Optional] visualize(type: "map", experienceIds: results)

Response:
"Ich habe 47 UFO-Sichtungen in Deutschland gefunden. [Shows map]
Die meisten sind in Bayern (18) und Baden-Württemberg (12).
Möchtest du mehr über eine bestimmte Region erfahren?"
```

### Complex Query

```
User: "Analysiere Traum-Patterns in Deutschland 2024"

Agent Plan:
1. unifiedSearch(query: "Träume Deutschland", mode: "explore", limit: 50,
                 dateFrom: "2024-01-01", dateTo: "2024-12-31")
2. visualize(type: "timeline", experienceIds: results, groupBy: "month")
3. visualize(type: "dashboard", experienceIds: results)
4. discoverPatterns(experienceIds: results, dimensions: ["temporal", "semantic"])

Response:
"Ich habe 2.847 Träume aus 2024 analysiert. [Shows timeline + dashboard]

Entdeckte Patterns:
🌕 Vollmond-Korrelation: 78% mehr luzide Träume
📍 Regional: Hotspot in Berlin, Hamburg, München
🔗 Semantic: 'Fliegen' ist häufigstes Motiv (34%)

Möchtest du tiefer in ein Pattern eintauchen?"
```

---

## 🚀 Future Tools (Post-MVP)

### Tool 5: recommendExperiences

```typescript
// Personalized recommendations based on:
// - User's own experiences
// - Read history
// - Saved searches
// - Similar users
```

### Tool 6: exportData

```typescript
// Export experiences, patterns, visualizations
// Formats: CSV, JSON, PDF
// For research, backup, sharing
```

### Tool 7: annotateExperience

```typescript
// Expert annotations
// Fact-checking
// Additional context
// Research notes
```

---

**Ready to implement? → Start with unifiedSearch + visualize!** 🛠️
