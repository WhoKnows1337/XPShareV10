# Phase 2: Tool Calling Architecture

**Status:** ⏳ To-Do
**Duration:** Week 2
**Goal:** Build autonomous discovery agent with 6 specialized tools

---

## 🎯 Objective

Create an intelligent agent that autonomously uses tools to:
- Search for experiences
- Detect patterns
- Find connections
- Analyze sentiment
- Generate visualizations
- Compute statistics

**Architecture:**
```
User Query → Phase 1 Parser → Phase 2 Agent → Tools → Results
                                   ↓
                            Multi-step reasoning:
                            1. Search (Tool 1)
                            2. Detect patterns (Tool 2)
                            3. Visualize (Tool 5)
```

## 📋 Implementation Tasks

### Day 1: Tool Definitions
Create 6 tool files in `/lib/ai/tools/`:

- [ ] `search-tool.ts` - Search experiences with hybrid search
- [ ] `pattern-tool.ts` - Detect temporal/geographic/semantic patterns
- [ ] `connection-tool.ts` - Find connections between experiences
- [ ] `sentiment-tool.ts` - Analyze emotional tone
- [ ] `visualization-tool.ts` - Generate chart/map data
- [ ] `statistics-tool.ts` - Compute aggregated stats

**Each tool must:**
- Use `tool()` function from AI SDK 5.0
- Have Zod schema for parameters
- Include error handling
- Return typed results

### Day 2: Tool Execution
- [ ] Implement execution logic for each tool
- [ ] Add retry logic with exponential backoff
- [ ] Create tool orchestration layer
- [ ] Add cost tracking per tool call

### Day 3: API Endpoint
- [ ] Create `/app/api/discover/route.ts`
- [ ] Implement multi-step reasoning with `generateText()`
- [ ] Add conversation context management
- [ ] Integrate all 6 tools

### Day 4: Testing & Optimization
- [ ] Build simple chat UI for testing
- [ ] Test complex multi-tool scenarios
- [ ] Optimize for cost (caching, batching)
- [ ] Performance benchmarks

## 📐 Endpoint: `/app/api/discover/route.ts`

```typescript
import { generateText } from 'ai'
import { gpt4o } from '@/lib/openai/ai-sdk-client' // ✅ Pre-configured provider
import { searchExperiencesTool } from '@/lib/ai/tools/search-tool'
import { detectPatternsTool } from '@/lib/ai/tools/pattern-tool'
import { connectionTool } from '@/lib/ai/tools/connection-tool'
import { sentimentTool } from '@/lib/ai/tools/sentiment-tool'
import { visualizeTool } from '@/lib/ai/tools/visualization-tool'
import { statisticsTool } from '@/lib/ai/tools/statistics-tool'

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
    model: gpt4o, // ✅ gpt-4o for complex reasoning
    messages,
    system: DISCOVERY_SYSTEM_PROMPT,

    // ✅ AI SDK 5.0: All 6 tools registered
    tools: {
      search_experiences: searchExperiencesTool,
      detect_patterns: detectPatternsTool,
      find_connections: connectionTool,
      analyze_sentiment: sentimentTool,
      visualize_data: visualizeTool,
      get_statistics: statisticsTool
    },

    maxSteps: 5, // ✅ Allow up to 5 tool calls per query
    maxCompletionTokens: 2000, // ✅ Cost control
    temperature: 0.7
  })

  // result.steps contains all tool calls made
  // result.text contains final AI response

  return Response.json({
    response: result.text,
    toolCalls: result.steps?.length || 0,
    tokens: result.usage
  })
}
```

## 🛠️ The 6 Tools

### Tool 1: Search Experiences
**File:** `/lib/ai/tools/search-tool.ts`
**Purpose:** Hybrid search (vector + FTS + RRF)
**Parameters:** category, tags, location, dateRange, attributes, exclude
**Returns:** Array of matching experiences

**Implementation Guide:** [tools/tool-1-search.md](./tools/tool-1-search.md)

### Tool 2: Detect Patterns
**File:** `/lib/ai/tools/pattern-tool.ts`
**Purpose:** Detect temporal, geographic, semantic, emotional patterns
**Parameters:** experienceIds, patternTypes, minConfidence
**Returns:** Array of detected patterns with confidence scores

**Implementation Guide:** [tools/tool-2-patterns.md](./tools/tool-2-patterns.md)

### Tool 3: Find Connections
**File:** `/lib/ai/tools/connection-tool.ts`
**Purpose:** Find semantic connections between experiences
**Parameters:** experienceIds, connectionTypes
**Returns:** Connection graph data

**Implementation Guide:** [tools/tool-3-connections.md](./tools/tool-3-connections.md)

### Tool 4: Analyze Sentiment
**File:** `/lib/ai/tools/sentiment-tool.ts`
**Purpose:** Analyze emotional tone of experiences
**Parameters:** experienceIds, dimensions
**Returns:** Sentiment scores (fear, wonder, confusion, etc.)

**Implementation Guide:** [tools/tool-4-sentiment.md](./tools/tool-4-sentiment.md)

### Tool 5: Generate Visualization
**File:** `/lib/ai/tools/visualization-tool.ts`
**Purpose:** Generate data for charts/maps/graphs
**Parameters:** visualizationType, experienceIds, config
**Returns:** Chart data in format for Recharts/Leaflet/etc.

**Implementation Guide:** [tools/tool-5-visualization.md](./tools/tool-5-visualization.md)

### Tool 6: Get Statistics
**File:** `/lib/ai/tools/statistics-tool.ts`
**Purpose:** Compute aggregated statistics
**Parameters:** experienceIds, metrics
**Returns:** Stats object (count, avg, distribution, etc.)

**Implementation Guide:** [tools/tool-6-statistics.md](./tools/tool-6-statistics.md)

## 🎬 Multi-Step Reasoning Example

**User Query:** "gibt es muster bei ufo träumen in europa?"

**Agent Reasoning:**
```
Step 1: search_experiences({ category: "dreams", tags: ["ufo"], location: "europa" })
  → Returns 3 experiences

Step 2: detect_patterns({ experienceIds: [...], types: ["temporal", "geographic"] })
  → Pattern 1: All at night (22-3 Uhr) - confidence: 0.9
  → Pattern 2: Clustered in Germany - confidence: 0.8

Step 3: visualize_data({ type: "timeline", experienceIds: [...] })
  → Returns timeline chart data

Step 4: get_statistics({ experienceIds: [...], metrics: ["time_distribution"] })
  → 100% between 22:00-03:00

Final Response:
"Ja, ich habe ein interessantes Muster gefunden! Alle 3 UFO-Träume in Europa
fanden nachts zwischen 22-3 Uhr statt. Hier ist eine Timeline..."
```

## ✅ Success Criteria

- [ ] Agent autonomously decides which tools to use
- [ ] Multi-step queries work (search → pattern → visualize)
- [ ] Conversation context maintained across turns
- [ ] Cost < $0.01 per query (average)
- [ ] All 6 tools properly typed and tested
- [ ] Error handling with retries
- [ ] Tool call logging for debugging

## 💰 Cost Optimization

**Per Query Estimate:**
- Phase 1 (Query Parser): ~$0.00003 (gpt-4o-mini)
- Phase 2 (Tool Calling): ~$0.005 (gpt-4o, avg 2 tool calls)
- **Total:** < $0.01 per query ✅

**Optimization Strategies:**
- Use caching for repeated searches
- Batch similar tool calls
- Set `maxSteps: 5` to prevent runaway costs
- Monitor token usage per query

## 🔍 Testing Scenarios

1. **Simple Search:**
   - "zeige mir ufo träume"
   - Expected: 1 tool call (search)

2. **Pattern Detection:**
   - "welche muster gibt es bei delfin sichtungen?"
   - Expected: 2 tool calls (search → pattern)

3. **Multi-Step Complex:**
   - "vergleiche ufo träume mit paranormalen erfahrungen"
   - Expected: 3-4 tool calls (search × 2 → compare → visualize)

4. **Conversation Context:**
   - User: "zeige mir ufo träume"
   - Agent: [Returns results]
   - User: "gibt es muster?"
   - Expected: Agent remembers previous search, only calls pattern tool

## 📚 Related Files

- [tools/tool-1-search.md](./tools/tool-1-search.md) - Search tool implementation
- [tools/tool-2-patterns.md](./tools/tool-2-patterns.md) - Pattern detection tool
- [tools/tool-3-connections.md](./tools/tool-3-connections.md) - Connections tool
- [tools/tool-4-sentiment.md](./tools/tool-4-sentiment.md) - Sentiment analysis tool
- [tools/tool-5-visualization.md](./tools/tool-5-visualization.md) - Visualization tool
- [tools/tool-6-statistics.md](./tools/tool-6-statistics.md) - Statistics tool
- [05-best-practices.md](./05-best-practices.md) - AI SDK 5.0 best practices

## 🚀 Next Steps

1. Implement all 6 tools following individual guides in `tools/`
2. Create `/app/api/discover/route.ts`
3. Test multi-step reasoning
4. Move to [Phase 3: Generative UI](./03-phase3-generative-ui.md)

---

**Status:** ⏳ Phase 2 To-Do
**Next:** Start with [Tool 1: Search](./tools/tool-1-search.md)
