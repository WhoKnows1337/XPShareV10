# XPChat v3 - AI Strategy

**Status:** Planning Phase
**Created:** 2025-10-26

---

## 🧠 Multi-Model Strategy

### Warum Multi-Model?

**Cost Optimization:** Verwende das günstigste Model das die Aufgabe löst
**Performance:** Schnellere Models für einfache Tasks
**Quality:** Beste Models nur wenn nötig

---

## 📊 The Model Stack

### Model 1: text-embedding-3-small (OpenAI)

**Use Case:** Vector Embeddings
**Cost:** $0.00002 per 1k tokens
**Speed:** ~50ms
**When:** IMMER für Similarity Search

```typescript
// Jede Search Query
const embedding = await generateEmbedding(query)
// → [0.234, -0.891, 0.456, ...] (1536 dimensions)
```

**Volume:** ~1000 calls/day
**Monthly Cost:** ~$0.60

---

### Model 2: gpt-4o-mini (OpenAI)

**Use Case:** Simple Classification, Intent Detection
**Cost:** $0.000150 per 1k input tokens
**Speed:** ~500ms
**When:** Simple Q&A, Category Detection

```typescript
// Example: Classify user intent
Input: "UFO Sichtungen in Bayern"
→ Intent: exploration
→ Category: UFO
→ Location: Bayern
```

**Volume:** ~200 calls/day
**Monthly Cost:** ~$0.90

---

### Model 3: claude-3-7-sonnet (Anthropic) ⭐ MAIN MODEL

**Use Case:** Complex Reasoning, Pattern Discovery, Conversations
**Cost:** $0.003 per 1k input tokens
**Speed:** ~2-4s
**When:** 90% of queries

```typescript
// Main Chat Agent
- Tool calling
- Multi-step reasoning
- Pattern analysis
- Conversational responses
```

**Avg Tokens per Query:** 2,500
**Avg Cost per Query:** $0.0075
**Volume:** ~500 calls/day
**Monthly Cost:** ~$112.50

---

### Model 4: claude-3-opus (Anthropic)

**Use Case:** Deep Research, Novel Insights, Academic Analysis
**Cost:** $0.015 per 1k input tokens
**Speed:** ~5-10s
**When:** User explicitly requests OR dataset > 1000 items

```typescript
// Only for:
- "Analysiere ALLE Träume in der Datenbank"
- "Finde bisher unentdeckte Patterns"
- "Deep research on cross-category correlations"
```

**Avg Tokens per Query:** 5,000
**Avg Cost per Query:** $0.075
**Volume:** ~20 calls/day (1% of total)
**Monthly Cost:** ~$45

---

## 💰 Cost Breakdown (REALISTIC)

⚠️ **Important:** These numbers include **real-world overhead** (retries, tool calling, streaming, caching reality).

### Base API Costs (Theoretical)

```
Embeddings:     1000 × $0.00001 = $0.01
Classification:  200 × $0.00045 = $0.09
Sonnet:          700 × $0.0075  = $5.25
Opus:             20 × $0.075   = $1.50
───────────────────────────────────────
Theoretical TOTAL per day:       $6.85
```

### Real-World Overhead Multipliers

```
❌ NAIVE (what docs say):           $6.85/day → $220/mo
✅ REALISTIC (production reality):   $13.70/day → $450/mo

Why 2x higher?
1. Retry Logic (errors, rate limits):  +20%
2. Tool Calling (multi-turn agents):   +30%
3. Streaming Overhead:                 +10%
4. Cache Miss Reality (not 15%):       +20%
5. Infrastructure (Redis, monitoring): +$100/mo flat
```

### Per Query Cost Distribution (Realistic)

```
Simple Query (exploration):
  Embedding:     $0.00001
  Sonnet:        $0.0120    (not $0.0060 - agent needs 2-3 turns!)
  Tool Calls:    $0.0030    (calls unifiedSearch, processes results)
  ─────────────────────────
  Total:         ~$0.0151   (not $0.0061!)

Complex Query (patterns):
  Embedding:     $0.00001
  Sonnet:        $0.0240    (4-5 agent turns)
  Tool Calls:    $0.0060    (visualize, discoverPatterns)
  ─────────────────────────
  Total:         ~$0.0301   (not $0.0121!)

Deep Research (opus):
  Embedding:     $0.00001
  Opus:          $0.1500    (much larger context for "all experiences")
  Tool Calls:    $0.0120    (multiple searches, aggregations)
  ─────────────────────────
  Total:         ~$0.1621   (not $0.0751!)
```

### Monthly Breakdown (30k queries/mo) - REALISTIC

```
28,500 Simple Queries:   28,500 × $0.0151 = $430.35
1,400 Complex Queries:    1,400 × $0.0301 = $42.14
100 Deep Research:          100 × $0.1621 = $16.21
────────────────────────────────────────────────
AI API Costs:                              $488.70

Infrastructure (Redis, monitoring):        $100.00
────────────────────────────────────────────────
TOTAL per month:                           $588.70

Rounded with buffer:                       ~$600/mo
```

**Key Insight:** Agents cost 2-3x more than single-shot completions due to multi-turn tool calling!

---

## 🎯 When to Use Which Model?

### Decision Tree

```
User Query
    │
    ├─ Need Embedding? → text-embedding-3-small
    │
    ├─ Simple Classification? → gpt-4o-mini
    │   Examples:
    │   - "What category is this?"
    │   - "Extract keywords"
    │   - "Is this UFO or Paranormal?"
    │
    ├─ Conversation & Tools? → claude-3-7-sonnet (DEFAULT)
    │   Examples:
    │   - "UFO Sichtungen in Bayern"
    │   - "Zeig mir Patterns"
    │   - "Was sind Gemeinsamkeiten?"
    │
    └─ Deep Analysis? → claude-3-opus
        Triggers:
        - User says "analysiere ALLE"
        - Dataset > 1000 items
        - User explicitly requests "deep research"
```

### Auto-Selection Logic

```typescript
function selectModel(query: string, datasetSize: number) {
  // Always use embeddings for search
  if (query.includes('embedding')) {
    return 'text-embedding-3-small'
  }

  // Simple classification
  if (isSimpleClassification(query)) {
    return 'gpt-4o-mini'
  }

  // Deep research triggers
  if (
    query.toLowerCase().includes('alle') ||
    query.toLowerCase().includes('deep') ||
    datasetSize > 1000
  ) {
    return 'claude-3-opus'
  }

  // Default: Sonnet
  return 'claude-3-7-sonnet'
}
```

---

## 📈 Optimization Strategies

### 1. Prompt Optimization

**Before:**
```
"You are an AI assistant that helps users discover extraordinary experiences.
You have access to a database of paranormal, UFO, dream, and near-death
experiences. Your job is to search the database, find patterns, visualize
data, and provide insights. Always be helpful, accurate, and cite your sources.
When a user asks a question, you should..."
```
→ **650 tokens!** ❌

**After:**
```
"Du bist Discovery-Assistent für XPShare.

Tools: unifiedSearch, visualize
Verhalten: Prägnant, hilfreich, auf Deutsch
Nutze Tools aktiv. Biete Follow-ups."
```
→ **50 tokens!** ✅

**Savings:** 600 tokens × $0.003 = $0.0018 per query
**Monthly:** 30k queries × $0.0018 = $54 saved!

### 2. Caching (Reality Check)

```typescript
// Cache Embeddings (same queries)
// Using Upstash Redis ($10/mo)
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

async function getCachedEmbedding(text: string) {
  const cached = await redis.get(`emb:${text}`)
  if (cached) return cached as number[]

  const embedding = await generateEmbedding(text)
  await redis.set(`emb:${text}`, embedding, { ex: 86400 }) // 24h TTL
  return embedding
}
```

**Hit Rate (Reality):** ~5-8% (not 15%!)
- Why so low? Users ask unique, varied questions
- Long-tail distribution (power law)
- Only ~300 "popular" queries out of 30k

**Realistic Savings:**
- Cache hits: 30,000 × 0.07 = 2,100 queries/mo
- Savings: 2,100 × $0.00001 = $0.021/mo
- Redis cost: $10/mo
- **Net Cost: -$9.98/mo** ❌

**Verdict:** Caching embeddings is NOT worth it (costs more than it saves!)

**Better Strategy:** Cache full agent responses (not embeddings)
```typescript
// Cache agent responses for 1 hour (Vercel KV)
const cacheKey = `response:${hash(query)}`
const cached = await kv.get(cacheKey)
if (cached) return cached

// Only if exact same query in last hour
```

**Hit Rate:** ~3-5% (even lower, but higher value)
**Savings:** 1,200 queries/mo × $0.0151 = $18.12/mo
**Vercel KV cost:** Included in hosting
**Net Savings:** +$18/mo ✅

### 3. Response Streaming

```typescript
// User sees response SOFORT, nicht erst nach completion
const stream = await streamText({
  model,
  messages,
  tools
})

return stream.toDataStreamResponse()
```

**Benefits:**
- User Satisfaction ↑ (feels instant)
- Can abort early if user satisfied
- Saves tokens on abandoned queries

---

## 🔍 Quality Monitoring

### Metrics to Track

```typescript
const queryMetrics = {
  // Performance
  responseTime: number        // Target: < 5s
  tokenCount: number          // Target: < 3000
  cost: number               // Target: < $0.01

  // Quality
  toolCallsSuccess: boolean   // Target: > 95%
  userSatisfaction: 1-5      // Implicit: Did user engage?
  patternQuality: number      // Confidence scores

  // Business
  conversionToAction: boolean // Did user click, save, submit?
}
```

### A/B Testing

```typescript
// Test: Sonnet vs Opus for complex queries
const experiment = {
  variantA: 'claude-3-7-sonnet',  // Current
  variantB: 'claude-3-opus',       // Test

  metric: 'userSatisfaction',
  sampleSize: 1000,

  results: {
    variantA: { satisfaction: 4.2, cost: $0.0075 },
    variantB: { satisfaction: 4.7, cost: $0.075 }
  },

  decision: 'Keep variantA - 0.5 satisfaction gain not worth 10x cost'
}
```

---

## 🚀 Future Optimizations

### Fine-Tuning (Maybe Later)

```
Idea: Fine-tune GPT-4o-mini on XPShare queries
Cost: $3,000 one-time + $0.012/1k tokens
Break-even: Never (Sonnet is better quality for similar cost)
Decision: ❌ Don't do it
```

### Local Embeddings (Maybe Later)

```
Idea: Run embeddings locally (FastText, Sentence-BERT)
Cost: $0 API, but $50/mo GPU
Break-even: At ~250k queries/mo
Decision: ⏳ Wait until > 200k queries/mo
```

### Prompt Caching (Anthropic Feature)

```
Idea: Cache system prompts (reduces input tokens)
Savings: ~40% on repeat queries
Cost: $0.003 × 0.6 = $0.0018 (40% off!)
Decision: ✅ Enable when available
```

---

## 📊 ROI Analysis (REALISTIC)

### Current Cost Structure (30k queries/mo)

```
Infrastructure (Vercel, Supabase): $265/mo
AI (30k queries, REALISTIC):       $600/mo
─────────────────────────────────────────
Total Operating Cost:              $865/mo

Revenue (500 users @ $5/mo):       $2,500/mo
Profit:                            $1,635/mo (189% margin)
```

**Break-Even:** ~173 users (not 60!) ⚠️

### Scaling (100k queries/mo)

```
Infrastructure:                    $500/mo
AI (100k queries, REALISTIC):      $2,000/mo
─────────────────────────────────────────
Total Operating Cost:              $2,500/mo

Revenue (1,500 users @ $5/mo):     $7,500/mo
Profit:                            $5,000/mo (200% margin)
```

### Scaling (300k queries/mo) - Mature Product

```
Infrastructure:                    $800/mo
AI (300k queries):                 $6,000/mo
─────────────────────────────────────────
Total Operating Cost:              $6,800/mo

Revenue (5,000 users @ $5/mo):     $25,000/mo
Profit:                            $18,200/mo (268% margin)
```

**Key Insights:**
- ✅ Still profitable, but margins lower than naive estimates
- ✅ Break-even at 173 users (achievable in Month 2-3)
- ✅ AI costs scale LINEAR, revenue scales EXPONENTIAL
- ⚠️ Cost per user: $1.73/mo (not $0.97!) - leaves room for $5 pricing

**Pricing Strategy:**
- Free tier: 10 queries/mo (sustainable)
- Pro tier: $5/mo unlimited (profitable at scale)
- Team tier: $15/mo (enterprise features)

---

## 🎯 Recommendations

### Phase 1 (Now)

✅ Use Claude Sonnet for 95% of queries
✅ Use text-embedding-3-small for all embeddings
✅ Optimize prompts (< 100 tokens system prompt)
✅ Enable streaming responses

### Phase 2 (Month 2)

✅ Implement embedding caching
✅ A/B test Opus for complex queries
✅ Monitor quality metrics
✅ Optimize based on data

### Phase 3 (Month 6)

✅ Consider Anthropic Prompt Caching
✅ Evaluate local embeddings (if > 200k queries/mo)
✅ Negotiate volume discounts with providers

---

**Cost-conscious AI that delivers quality! 💰🧠**
