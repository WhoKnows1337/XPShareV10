# XPChat Agent Configuration

**File:** `lib/mastra/agents/xpchat-agent.ts`
**Token Target:** 600 tokens (vs. 4,500 in v3)
**Model:** Claude 3.7 Sonnet with Adaptive Extended Thinking

---

## Overview

The XPChat Agent is a **single-agent** implementation (not Agent Network) that uses `.stream()` for user-driven tool execution. This provides:

- ✅ **70% Token Reduction**: 600-token instructions vs. 4,500 in v3
- ✅ **User-Driven Flow**: No autonomous multi-step overhead
- ✅ **Same Capabilities**: All 8 tools available
- ✅ **Adaptive Thinking**: Extended Thinking only when needed
- ✅ **Optional Memory**: Conversation history when threadId provided

---

## Agent Architecture

```
┌──────────────────────────────────────────────────┐
│           XPChat Agent (Single Agent)            │
├──────────────────────────────────────────────────┤
│  Model: Claude 3.7 Sonnet                        │
│  Instructions: 600 tokens                        │
│  Tools: 8 unified + specialized                  │
│  Memory: Optional (threadId-based)               │
│  Thinking: Adaptive (complexity-based)           │
└──────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│              API Route: /api/xpchat              │
│  - Analyze complexity                            │
│  - Call agent.stream()                           │
│  - Return SSE stream                             │
└──────────────────────────────────────────────────┘
```

---

## Optimized Instructions (600 Tokens)

### Instruction Design Principles

1. **Purpose First** (2-3 sentences)
2. **Tool List** (1 line per tool)
3. **Response Strategy** (Simple vs Complex queries)
4. **Always Guidelines** (3-5 bullet points)
5. **Data Access Notes** (RLS, privacy)

**Token Breakdown**:
- Purpose: ~80 tokens
- Tool list: ~160 tokens (8 tools × 20 tokens)
- Response strategy: ~200 tokens
- Guidelines: ~100 tokens
- Data notes: ~60 tokens
- **Total: ~600 tokens**

---

## Full Agent Code

```typescript
// lib/mastra/agents/xpchat-agent.ts

import { Agent, Memory } from '@mastra/core'
import { anthropic } from '@ai-sdk/anthropic'

// Import all 8 tools
import { unifiedSearchTool } from '../tools/unified-search'
import { visualizeTool } from '../tools/visualize'
import { analyzeTool } from '../tools/analyze'
import { insightsTool } from '../tools/insights'
import { trendsTool } from '../tools/trends'
import { connectionsTool } from '../tools/connections'
import { patternsTool } from '../tools/patterns'
import { userStatsTool } from '../tools/user-stats'

export const xpchatAgent = new Agent({
  name: 'xpchat',

  // Model configuration
  model: anthropic('claude-3-7-sonnet-20250219'),

  // Optimized instructions (600 tokens)
  instructions: `
You are the XPShare AI Discovery Assistant powered by Claude 3.7 Sonnet. You help users explore, analyze, and visualize extraordinary human experiences (UFOs, dreams, psychic phenomena, NDEs, synchronicities).

**Your 8 Tools:**
1. **unifiedSearch** - Search with text, geo, temporal, semantic, or attribute filters
2. **visualize** - Generate maps, timelines, networks, or dashboards
3. **analyze** - Temporal trends, category analysis, comparisons, correlations
4. **insights** - AI-powered pattern detection and insights
5. **trends** - Forecast future patterns based on historical data
6. **connections** - Find similar experiences by content or attributes
7. **patterns** - Detect anomalies and unusual patterns
8. **userStats** - Community metrics and leaderboards

**For Simple Queries** (e.g., "Show UFOs in Berlin"):
- Use 1-2 tools directly
- Provide concise answers
- Offer visual results when helpful

**For Complex Queries** (e.g., "Compare dreams vs psychic experiences over time and show correlations"):
- Use Extended Thinking to plan approach
- Chain tools logically (search → analyze → visualize)
- Explain reasoning transparently
- Provide comprehensive insights

**Always:**
- Respect user privacy (RLS-enforced data access)
- Explain tool choices briefly
- Format responses clearly (markdown)
- Suggest follow-up explorations
- Handle errors gracefully

**Data Access:**
All queries respect Row-Level Security. Users only see public experiences or their own private ones. Geographic, temporal, and category filters are always available.
  `.trim(),

  // Tool registration
  tools: {
    unifiedSearch: unifiedSearchTool,
    visualize: visualizeTool,
    analyze: analyzeTool,
    insights: insightsTool,
    trends: trendsTool,
    connections: connectionsTool,
    patterns: patternsTool,
    userStats: userStatsTool,
  },

  // Memory configuration (optional)
  memory: new Memory({}),
})
```

---

## Instruction Optimization Techniques

### Before (4,500 tokens)
```typescript
instructions: `
You are the XPShare AI Discovery Agent powered by Claude 3.7 Sonnet with Extended Thinking.

Your primary role is to help users explore...

[200+ lines of detailed tool descriptions]

### Tool 1: advancedSearch
Description: This tool allows you to search...
Parameters:
- categories: An array of category strings...
- location: An object containing...
[50+ lines per tool × 15 tools]
...
`
```

**Problems:**
- ❌ 4,500 tokens
- ❌ Redundant with tool schemas
- ❌ Too verbose
- ❌ Hard to maintain

### After (600 tokens)
```typescript
instructions: `
You are the XPShare AI Discovery Assistant powered by Claude 3.7 Sonnet.

[3 sentences purpose]

**Your 8 Tools:**
1. unifiedSearch - Search with filters
2. visualize - Generate visualizations
[8 lines total]

**For Simple Queries:** Use 1-2 tools
**For Complex Queries:** Chain tools logically

**Always:** [5 bullet points]
**Data Access:** [2 sentences]
`.trim()
```

**Benefits:**
- ✅ 600 tokens (-87%)
- ✅ Tool schemas provide details
- ✅ Clear and scannable
- ✅ Easy to maintain

---

## Extended Thinking Configuration

Extended Thinking is **configured at runtime** in the API route, not in the agent definition:

```typescript
// app/api/xpchat/route.ts

const { score, thinkingMode } = analyzeQueryComplexity(lastMessage)

const stream = await mastra.getAgent('xpchat').stream(messages, {
  runtimeContext,
  memory: threadId ? {
    thread: { id: threadId },
    resource: user.id
  } : undefined,
  modelSettings: {
    // Adaptive Extended Thinking
    extended_thinking: thinkingMode === 'extended'
      ? { budget_tokens: 10000 }
      : { budget_tokens: 3000 }
  }
})
```

**Why Runtime Config?**
- ✅ No token overhead in agent instructions
- ✅ Adaptive based on query complexity
- ✅ Can be adjusted per-request
- ✅ Easier to experiment with budgets

---

## Memory Configuration

Memory is **optional** and configured per-request:

```typescript
// With memory (conversation history)
const stream = await mastra.getAgent('xpchat').stream(messages, {
  runtimeContext,
  memory: {
    thread: {
      id: `thread-${userId}-${timestamp}`,
      metadata: { locale, userId }
    },
    resource: user.id
  }
})

// Without memory (stateless)
const stream = await mastra.getAgent('xpchat').stream(messages, {
  runtimeContext
})
```

**When to Use Memory:**
- ✅ Multi-turn conversations ("show me more", "compare that to...")
- ✅ User explicitly requests follow-up
- ✅ Complex queries that benefit from context

**When to Skip Memory:**
- ✅ Single-shot queries ("show UFOs in Berlin")
- ✅ Reduce token overhead
- ✅ Faster responses

---

## Model Settings

```typescript
export const xpchatAgent = new Agent({
  name: 'xpchat',
  model: anthropic('claude-3-7-sonnet-20250219'),

  // Optional default model settings
  // (can be overridden at runtime)
  modelSettings: {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
  },

  // ...
})
```

**Model Choice:**
- **Claude 3.7 Sonnet**: Best balance of quality/speed/cost
- **Extended Thinking**: Adaptive (3s standard, 10s complex)
- **Temperature 0.7**: Good for conversational + analytical tasks

---

## Tool Registration

All 8 tools must be imported and registered:

```typescript
import { unifiedSearchTool } from '../tools/unified-search'
import { visualizeTool } from '../tools/visualize'
import { analyzeTool } from '../tools/analyze'
import { insightsTool } from '../tools/insights'
import { trendsTool } from '../tools/trends'
import { connectionsTool } from '../tools/connections'
import { patternsTool } from '../tools/patterns'
import { userStatsTool } from '../tools/user-stats'

export const xpchatAgent = new Agent({
  // ...
  tools: {
    unifiedSearch: unifiedSearchTool,
    visualize: visualizeTool,
    analyze: analyzeTool,
    insights: insightsTool,
    trends: trendsTool,
    connections: connectionsTool,
    patterns: patternsTool,
    userStats: userStatsTool,
  },
})
```

**Tool Context:**
All tools receive `XPShareContext` with RLS-safe Supabase client:

```typescript
// Defined in lib/mastra/types.ts
export type XPShareContext = {
  supabase: SupabaseClient<Database>
  userId: string
  locale: string
}
```

---

## Agent Registration

Register the agent in the main Mastra instance:

```typescript
// lib/mastra/index.ts

import { xpchatAgent } from './agents/xpchat-agent'
import { orchestratorAgent } from './agents/orchestrator'
import { networkOrchestratorAgent } from './agents/orchestrator-network'

export const mastra = new Mastra({
  agents: {
    orchestrator: orchestratorAgent,
    networkOrchestrator: networkOrchestratorAgent,
    xpchat: xpchatAgent, // ✅ Add XPChat agent
  },
  storage: storageProvider,
})
```

**Access Pattern:**
```typescript
// In API route
import { mastra } from '@/lib/mastra'

const stream = await mastra.getAgent('xpchat').stream(...)
```

---

## Comparison: Agent Network vs Stream

### Agent Network (.network()) - NOT USED
```typescript
// ❌ TOO EXPENSIVE
const networkStream = await mastra
  .getAgent('networkOrchestrator')
  .network(messages, {
    runtimeContext,
    memory: { thread: { id: threadId }, resource: userId }
  })

// Token cost: ~8,500/request
// - Agent instructions: 4,500
// - Tool definitions: 3,000
// - Extended Thinking: 500
// - Autonomous multi-step overhead: 500
```

### Agent Stream (.stream()) - USED ✅
```typescript
// ✅ OPTIMIZED
const stream = await mastra
  .getAgent('xpchat')
  .stream(messages, {
    runtimeContext,
    memory: threadId ? { thread: { id: threadId }, resource: userId } : undefined,
    modelSettings: {
      extended_thinking: thinkingMode === 'extended'
        ? { budget_tokens: 10000 }
        : { budget_tokens: 3000 }
    }
  })

// Token cost: ~2,900/request
// - Agent instructions: 600
// - Tool definitions: 790
// - Extended Thinking: 500 (adaptive)
// - User messages: ~1,000
```

**Savings**: 8,500 → 2,900 tokens (-66%)

---

## Testing the Agent

### Local Test (Before API Integration)

```typescript
// test/xpchat-agent.test.ts

import { mastra } from '@/lib/mastra'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function testXPChatAgent() {
  // Create test context
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const runtimeContext = {
    supabase,
    userId: user.id,
    locale: 'de'
  }

  // Test query
  const messages = [
    { role: 'user', content: 'Zeig mir UFO Sichtungen in Berlin' }
  ]

  // Stream response
  const stream = await mastra.getAgent('xpchat').stream(messages, {
    runtimeContext,
    modelSettings: {
      extended_thinking: { budget_tokens: 3000 }
    }
  })

  // Log events
  for await (const chunk of stream) {
    console.log('[Stream Event]', chunk)
  }
}
```

---

## Token Usage Analysis

### Breakdown per Request

| Component | Tokens | % |
|-----------|--------|---|
| Agent Instructions | 600 | 21% |
| Tool Definitions (8 tools) | 790 | 27% |
| User Messages | ~1,000 | 34% |
| Extended Thinking (adaptive) | 0-500 | 0-17% |
| **Total (Standard Mode)** | **~2,390** | **100%** |
| **Total (Extended Mode)** | **~2,890** | **100%** |

**Average**: ~2,900 tokens/request

### Comparison with v3

| Version | Agent Instructions | Tool Definitions | Total |
|---------|-------------------|------------------|-------|
| Agent Network v3 | 4,500 | 3,000 (15 tools) | 8,500 |
| XPChat 2.0 | 600 | 790 (8 tools) | 2,900 |
| **Reduction** | **-87%** | **-74%** | **-66%** |

---

## Success Criteria

### Agent Quality ✅
- [ ] Responds correctly to simple queries (1-2 tool calls)
- [ ] Chains tools logically for complex queries
- [ ] Provides clear explanations
- [ ] Handles errors gracefully
- [ ] Respects RLS and privacy

### Performance ✅
- [ ] Token usage < 650 for instructions
- [ ] Total tokens < 3,500/request (average)
- [ ] Response time < 5s for simple queries
- [ ] Response time < 15s for complex queries

### Maintainability ✅
- [ ] Instructions easy to update
- [ ] Clear separation of concerns
- [ ] Well-documented
- [ ] TypeScript types enforced

---

## Next Steps

After creating this agent:

1. ✅ **Register in Mastra instance** (`lib/mastra/index.ts`)
2. ⏸️ **Create API route** (`app/api/xpchat/route.ts`)
3. ⏸️ **Test locally** with sample queries
4. ⏸️ **Measure token usage** (must be < 3,500/request)
5. ⏸️ **Create frontend** (`app/[locale]/xpchat/page.tsx`)

**See:** `04-API.md` for API route implementation details

---

## Notes

- Agent instructions are intentionally concise (600 tokens)
- Tool schemas provide detailed parameter descriptions
- Extended Thinking configured at runtime (not in agent)
- Memory is optional (only when threadId provided)
- RLS context injected via XPShareContext

**Token Budget Validation:**
```bash
# Count tokens in instructions
echo "Agent instruction tokens:"
cat lib/mastra/agents/xpchat-agent.ts | grep -A 50 "instructions:" | wc -w

# Expected: ~450 words = ~600 tokens
```

---

**Status:** Ready to Implement ✅
