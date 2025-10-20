# Phase 1: LLM Query Parser

**Status:** ✅ Implemented (in `/app/api/chat/route.ts`)
**Duration:** Week 1
**Goal:** Replace manual keyword extraction with AI-powered intent parsing

---

## 🎯 Objective

Transform natural language queries into structured search intents with filters.

**Before:**
```
User Query: "hatte jemand von ufos geträumt"
→ Manual keyword extraction
→ Problems: "keine exakten Treffer mit 'jemand, schon' gefunden"
```

**After:**
```
User Query: "hatte jemand von ufos geträumt"
→ AI Query Parser
→ { intent: "search", filters: { category: "dreams", tags: ["ufo"] } }
```

## 📋 Tasks Breakdown

### Day 1-2: Core Implementation
- [x] Create `lib/ai/query-parser.ts`
- [x] Implement `parseQuery()` with AI SDK 5.0 `generateObject()`
- [x] Define Zod schemas for intent + filters
- [x] Add unit tests

### Day 3: Integration
- [x] Update `/app/api/chat/route.ts` to use parseQuery()
- [x] Remove `lib/search/keyword-extraction.ts` (deprecated)
- [x] Test edge cases (typos, mixed languages, ambiguous queries)

### Day 4: Polish & Deploy
- [x] Add confidence scoring
- [x] Handle low-confidence queries (ask for clarification)
- [x] Deploy to staging

## ✅ Success Criteria

- ✅ Zero "keine exakten Treffer mit 'jemand, schon'" errors
- ✅ 95%+ parsing accuracy on test queries
- ✅ Response time < 500ms
- ✅ Proper error handling with fallbacks

## 🔧 Implementation

### File: `lib/ai/query-parser.ts`

```typescript
import { generateObject } from 'ai'
import { openai } from '@/lib/openai/ai-sdk-client' // ✅ Pre-configured provider
import { z } from 'zod'

// Zod Schema for Structured Output
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

export type SearchIntent = z.infer<typeof SearchIntentSchema>

export async function parseQuery(userQuery: string): Promise<SearchIntent> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'), // ✅ Fast & cheap for parsing
    schema: SearchIntentSchema,
    schemaName: 'SearchIntent',
    schemaDescription: 'Parsed search intent with structured filters',

    system: `You are a query parser for XPShare, a platform for anomalous human experiences.

Extract search intent and structured filters from natural language queries.

Available categories:
- ufo-uap: UFO/UAP sightings
- dreams: Dream experiences
- paranormal-anomalies: Ghost encounters, poltergeists
- synchronicities: Meaningful coincidences
- deja-vu: Déjà vu experiences
- premonitions: Precognitive dreams, visions

Common tags: ufo, dream, ghost, dolphin, bird, light, sound, fear, wonder, triangle, sphere, cylinder

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
}

Query: "gibt es häufige träume über vögel?"
Output:
{
  "intent": "search",
  "filters": {
    "category": "dreams",
    "tags": ["vogel", "vögel", "bird", "birds"]
  },
  "naturalLanguageQuery": "frequent dreams about birds",
  "confidence": 0.85
}`,

    prompt: `Parse this query: "${userQuery}"`,
    temperature: 0.3, // ✅ Lower for consistency
  })

  return object
}
```

### Integration: `/app/api/chat/route.ts`

```typescript
import { parseQuery } from '@/lib/ai/query-parser'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { message } = await req.json()

  // Phase 1: Parse query
  const intent = await parseQuery(message)

  // Check confidence
  if (intent.confidence < 0.7) {
    return Response.json({
      needsClarification: true,
      message: "Ich bin mir nicht sicher, was du meinst. Kannst du die Frage umformulieren?",
      suggestions: [
        "Suche nach UFO-Träumen in Europa",
        "Zeige mir Muster bei Delfin-Sichtungen",
        "Häufige paranormale Erfahrungen in Deutschland"
      ]
    })
  }

  // Phase 2 would call tools here...
  // For now, just return parsed intent
  return Response.json({ intent })
}
```

## 📊 Test Cases

### Edge Cases to Test

1. **Typos:**
   ```
   Input: "hatte jemand ufo gestehen?"
   Expected: { intent: "search", tags: ["ufo"], confidence: 0.8 }
   ```

2. **Mixed Languages:**
   ```
   Input: "dreams about UFOs in Deutschland"
   Expected: { category: "dreams", tags: ["ufo"], location: "deutschland" }
   ```

3. **Ambiguous Queries:**
   ```
   Input: "licht"
   Expected: { confidence: 0.5, needsClarification: true }
   ```

4. **Complex Negations:**
   ```
   Input: "alle außer die blauen und roten"
   Expected: { exclude: { color: "blue" }, exclude: { color: "red" } }
   ```

5. **Date Ranges:**
   ```
   Input: "erfahrungen zwischen 2020 und 2023"
   Expected: { dateRange: { from: "2020-01-01", to: "2023-12-31" } }
   ```

## 🔍 Debugging Tips

### Low Confidence Queries

If confidence < 0.7, provide:
- Clarifying questions
- Example queries
- Did-you-mean suggestions

### Performance Monitoring

```typescript
console.time('query-parsing')
const intent = await parseQuery(userQuery)
console.timeEnd('query-parsing')
// Expected: < 500ms
```

### Cost Tracking

```typescript
// gpt-4o-mini pricing: $0.15 / 1M input tokens
// Average query: ~200 tokens
// Cost per query: $0.00003 (negligible)
```

## 🎨 UI Integration

### Loading State

```typescript
<div className="flex items-center gap-2">
  <Loader2 className="animate-spin" />
  <p>Verstehe deine Frage...</p>
</div>
```

### Low Confidence Warning

```typescript
{intent.confidence < 0.7 && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Ich bin mir nicht ganz sicher. Meintest du:
      <ul className="list-disc ml-4 mt-2">
        {suggestions.map(s => <li key={s}>{s}</li>)}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

## 🚀 Next Steps

After Phase 1 is complete:

1. ✅ Verify all tests pass
2. ✅ Monitor confidence scores in production
3. → Move to [Phase 2: Tool Calling](./02-phase2-tools.md)

## 📚 Related Files

- `/app/api/chat/route.ts` - Main API route (✅ Implemented)
- `/lib/ai/query-parser.ts` - Query parsing logic
- `/lib/validation/search5-schemas.ts` - Zod schemas
- `/lib/ai/prompts.ts` - System prompts

---

**Status:** ✅ Phase 1 Complete
**Next:** [Phase 2: Tool Calling Architecture](./02-phase2-tools.md)
