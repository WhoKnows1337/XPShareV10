# XPChat v3 - Architecture Decisions

**Status:** Finalized
**Created:** 2025-10-26
**Last Updated:** 2025-10-26

---

## 🎯 TL;DR

**Hybrid Architecture:** AI SDK 6 (core chat) + Mastra (memory, workflows, evals)

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Chat Agent** | AI SDK 6 ToolLoopAgent | Stable, native MCP, tool approval |
| **Memory** | Mastra Memory + Supabase | Resource-scoped, serverless-ready |
| **Workflows** | Mastra Workflows | 7-phase submission with suspend/resume |
| **Storage** | Supabase Postgres | Already in use, pgvector built-in |
| **Vector DB** | Supabase pgvector | Integrated, no extra service |
| **Evals** | Mastra Evals | 15 evaluators for production quality |
| **Deployment** | Vercel (serverless) | Existing infrastructure |

---

## 🤔 The Decision: Why Hybrid?

### Option 1: AI SDK 6 Only ❌
**Problem:** No native memory, workflows, or evals
- ✅ Stable, production-ready
- ❌ Must implement memory ourselves
- ❌ Must implement workflow state machine
- ❌ No built-in evaluators

### Option 2: Mastra Only ❌
**Problem:** Mastra agents are built on AI SDK, so we'd still use it
- ✅ Memory, workflows, evals included
- ❌ Adds abstraction layer we don't need for simple chat
- ❌ ToolLoopAgent has features Mastra doesn't expose yet

### Option 3: Hybrid ✅
**Solution:** Best of both worlds
- ✅ AI SDK 6 for core chat (ToolLoopAgent, MCP native)
- ✅ Mastra for memory (resource-scoped, Supabase-backed)
- ✅ Mastra for workflows (7-phase submission flow)
- ✅ Mastra for evals (production quality checks)
- ✅ Both work serverless on Vercel

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               Vercel (Serverless)               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐        ┌────────────────┐   │
│  │  AI SDK 6     │        │  Mastra        │   │
│  │  ToolLoopAgent│◄──────►│  Memory API    │   │
│  │               │        │  Workflows     │   │
│  │  - Chat Loop  │        │  Evals         │   │
│  │  - Tools      │        └────────┬───────┘   │
│  │  - MCP        │                 │           │
│  └───────┬───────┘                 │           │
│          │                         │           │
│          └─────────────┬───────────┘           │
│                        │                       │
│                        ▼                       │
│              ┌─────────────────┐               │
│              │  Supabase       │               │
│              │  - Postgres     │               │
│              │  - pgvector     │               │
│              │  - Auth         │               │
│              │  - Storage      │               │
│              └─────────────────┘               │
└─────────────────────────────────────────────────┘
```

---

## 💾 Memory Strategy

### Why Mastra Memory?

**Problem (Serverless):** XPShare runs on Vercel serverless - no persistent filesystem, no long-running processes

**Incompatible:**
- ❌ LibSQLStore (`file:./memory.db`) - needs filesystem
- ❌ In-memory storage - lost on each function invocation

**Compatible:**
- ✅ PgStore (Supabase) - HTTP/connection pooling
- ✅ UpstashStore - HTTP REST API
- ✅ MongoDBStore - cloud-based

**Why Supabase?**
- ✅ Already using it for auth, experiences, users
- ✅ pgvector extension for semantic search built-in
- ✅ Supavisor connection pooling (serverless-optimized)
- ✅ One service, one bill, one dashboard

### Configuration

```typescript
import { Memory } from "@mastra/memory";
import { PgStore, PgVector } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";

export const memory = new Memory({
  // Storage: conversation history, threads, working memory
  storage: new PgStore({
    connectionString: process.env.DATABASE_URL, // Supabase pooled connection
  }),

  // Vector: semantic recall via pgvector
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL,
  }),

  // Embedder: convert messages to vectors
  embedder: openai.embedding("text-embedding-3-small"),

  options: {
    // Recent conversation history (10 last messages)
    lastMessages: 10,

    // Semantic recall: RAG-based memory search
    semanticRecall: {
      topK: 5,              // Retrieve 5 most similar messages
      messageRange: 2,      // Include 2 messages before/after
      scope: 'resource'     // Search across ALL user threads
    },

    // Working memory: persistent user context
    workingMemory: {
      enabled: true,
      scope: 'resource',    // Shared across all user threads
      template: `# User Context
- **Name:**
- **Preferences:**
- **Interests:**
- **Discovery History:**
`
    }
  }
});
```

### Memory Scopes

| Scope | Persistence | Use Case |
|-------|------------|----------|
| `thread` | Per conversation | Isolated chat sessions |
| `resource` | Per user (all threads) | User preferences, discovery history |

**XPShare uses `resource` scope** - user's preferences persist across all conversations!

### Storage Adapters Matrix

| Adapter | Serverless? | Latency | Cost | XPShare Use |
|---------|------------|---------|------|-------------|
| **LibSQLStore** | ❌ No | ~1ms | Free | Dev only |
| **PgStore (Supabase)** | ✅ Yes | ~20ms | Existing | Production ✅ |
| **UpstashStore** | ✅ Yes | ~15ms | $0.20/100k | Alternative |
| **MongoDBStore** | ✅ Yes | ~25ms | Variable | Not needed |

**Decision:** Use PgStore with Supabase (already paying for it!)

---

## 🔄 Workflow Strategy

### Why Mastra Workflows?

**Problem:** 7-phase AI-guided submission flow needs:
1. State persistence (conversation context)
2. Suspend/resume (wait for user input)
3. Error handling & retries
4. Progress tracking

**Alternatives:**

| Approach | Pros | Cons |
|----------|------|------|
| **Client State** | Simple | Lost on refresh, no backend visibility |
| **Next.js API Routes** | Flexible | Must implement state machine ourselves |
| **Mastra Workflows** | Built-in suspend/resume | Learning curve |

**Decision:** Use Mastra Workflows

### Submission Flow as Workflow

```typescript
// workflows/ai-guided-submission.ts
import { Workflow } from '@mastra/core/workflow';

export const submissionWorkflow = new Workflow({
  name: 'ai-guided-submission',
  triggerSchema: z.object({
    userId: z.string(),
    initialContext: z.object({}).optional()
  })
})
  .step('discovery-context', async ({ context }) => {
    // Phase 1: Optional discovery context
    return { category: context.initialContext?.category }
  })
  .then('story-collection', async ({ context }) => {
    // Phase 2: User tells their story
    // AI analyzes and extracts initial data
    return { story: await collectStory(context) }
  })
  .suspend('clarifying-questions') // WAIT for user input!
  .then('attribute-extraction', async ({ context }) => {
    // Phase 4: AI extracts structured attributes
    return { attributes: await extractAttributes(context.story) }
  })
  .then('similarity-matching', async ({ context }) => {
    // Phase 5: Find similar experiences
    return { matches: await findMatches(context.attributes) }
  })
  .suspend('privacy-selection') // WAIT for user to choose visibility
  .then('final-review', async ({ context }) => {
    // Phase 7: Show summary, submit on approval
    return { experienceId: await submitExperience(context) }
  });
```

**Benefits:**
- ✅ State persisted in Supabase (survives page refresh)
- ✅ Suspend/resume built-in (no manual state machine)
- ✅ Progress visible in Mastra dashboard
- ✅ Error handling & retries included

### Workflow Storage

```typescript
import { Mastra } from "@mastra/core/mastra";
import { PgStore } from "@mastra/pg";

export const mastra = new Mastra({
  storage: new PgStore({
    connectionString: process.env.DATABASE_URL
  }),
  workflows: [submissionWorkflow]
});
```

---

## 🧠 Chat Agent Implementation

### Why AI SDK 6 ToolLoopAgent?

**Features we need:**
- ✅ Automatic tool execution loop
- ✅ Tool approval (human-in-the-loop)
- ✅ Native MCP support
- ✅ Streaming responses

**Why not Mastra Agent?**
- Mastra agents ARE built on AI SDK
- ToolLoopAgent has features not exposed yet in Mastra
- We can still use Mastra memory with AI SDK agent

### Implementation

```typescript
// app/api/xpchat/route.ts
import { ToolLoopAgent } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { unifiedSearch, visualize, discoverPatterns, manageContext } from '@/tools';

const chatAgent = new ToolLoopAgent({
  model: anthropic('claude-3-7-sonnet-20250219'),
  instructions: `You help users discover extraordinary experiences.
  Use tools to search, visualize, and analyze patterns.`,
  tools: {
    unifiedSearch,
    visualize,
    discoverPatterns,
    manageContext
  },
  maxSteps: 10,
  onStepFinish: async ({ step }) => {
    // Optional: log to Mastra observability
  }
});

export async function POST(req: Request) {
  const { messages, threadId, resourceId } = await req.json();

  // Get memory context (Mastra Memory!)
  const memoryMessages = await memory.query({
    threadId,
    resourceId,
    threadConfig: {
      lastMessages: 10,
      semanticRecall: true
    }
  });

  // Combine memory + new messages
  const allMessages = [...memoryMessages.messages, ...messages];

  // Generate response
  const stream = await chatAgent.generate({
    messages: allMessages
  });

  // Save to memory
  stream.on('finish', async () => {
    await memory.saveMessages({
      threadId,
      resourceId,
      messages: stream.messages
    });
  });

  return stream.toUIMessageStreamResponse();
}
```

---

## 📊 Evaluation Strategy

### Why Mastra Evals?

**Production Requirements:**
1. Accuracy: Are search results relevant?
2. Safety: No harmful content
3. Quality: Responses are helpful
4. Cost: Stay within budget

**Mastra provides 15 evaluators:**
- ✅ Factual correctness
- ✅ Toxicity detection
- ✅ Prompt injection detection
- ✅ Context relevance (RAG)
- ✅ Answer correctness
- ✅ Cost tracking
- ... and 9 more

### Configuration

```typescript
import { createEval } from '@mastra/evals';

export const searchEval = createEval({
  name: 'search-quality',
  evaluators: [
    'context-relevance',  // Are search results relevant?
    'answer-correctness', // Does AI answer match results?
    'factual-correctness' // Is info factually correct?
  ],
  dataset: './evals/search-queries.jsonl'
});

// Run evals in CI/CD
await searchEval.run();
```

---

## 🚀 Deployment

### Vercel Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"], // Don't bundle Mastra
};

export default nextConfig;
```

### Environment Variables

```bash
# Supabase (already configured)
DATABASE_URL=postgresql://...@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Optional: Mastra Cloud (for observability)
MASTRA_API_KEY=msk_...
```

### Installation

```bash
pnpm add @mastra/core @mastra/memory @mastra/pg @mastra/evals
```

---

## 🔍 Why NOT Alternatives?

### Why not LibSQL for Production?

```typescript
// ❌ This works in development:
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./memory.db"
  })
});

// ❌ But NOT in Vercel serverless:
// - Each function invocation = new container
// - No persistent filesystem
// - File writes are lost after function ends
// - Works in dev, breaks in production!
```

### Why not Upstash?

```typescript
// ✅ Upstash WOULD work:
const memory = new Memory({
  storage: new UpstashStore({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  })
});

// ❌ But we'd pay for ANOTHER service:
// - Supabase: $25/month (already paying)
// - Upstash: $0.20 per 100k ops (extra cost)
//
// Why pay twice when Supabase does both?
```

---

## 📈 Performance Expectations

### Memory Operations

| Operation | Latency | Cost |
|-----------|---------|------|
| Query memory (10 msgs) | ~30ms | Free (Supabase) |
| Semantic recall (5 matches) | ~50ms | $0.00001 (embedding) |
| Save messages | ~20ms | Free (Supabase) |
| Working memory update | ~15ms | Free (Supabase) |

### Workflow Operations

| Operation | Latency | Cost |
|-----------|---------|------|
| Start workflow | ~40ms | Free (Supabase) |
| Suspend (save state) | ~25ms | Free (Supabase) |
| Resume workflow | ~35ms | Free (Supabase) |

### Chat Operations

| Operation | Latency | Cost |
|-----------|---------|------|
| Chat response (no tools) | ~2s | $0.005 (Anthropic) |
| Chat + unifiedSearch | ~3s | $0.0075 |
| Chat + visualize | ~4s | $0.01 |
| Chat + discoverPatterns | ~8s | $0.02 |

---

## 🎯 Success Criteria

**Memory:**
- ✅ User preferences persist across sessions
- ✅ Semantic recall finds relevant past conversations
- ✅ Working memory updates automatically
- ✅ <100ms memory retrieval latency

**Workflows:**
- ✅ 7-phase submission completes successfully
- ✅ State persists across page refreshes
- ✅ User can pause and resume at any step
- ✅ <5% error rate

**Chat:**
- ✅ <3s response time (80th percentile)
- ✅ Tools execute correctly >95% of time
- ✅ MCP integration works seamlessly
- ✅ Cost <$0.01 per conversation

---

## 📚 Related Documentation

- [03-TOOLS.md](./03-TOOLS.md) - Tool specifications (unifiedSearch, visualize, etc.)
- [08-INTEGRATION.md](./08-INTEGRATION.md) - How Chat/Submit/Profile integrate
- [11-SUBMISSION-FLOW.md](./11-SUBMISSION-FLOW.md) - AI-guided submission details
- [13-DATABASE-SCHEMA.md](./13-DATABASE-SCHEMA.md) - Supabase tables & RLS
- [16-DATA-QUALITY.md](./16-DATA-QUALITY.md) - AI attribute extraction

---

## 🔄 Migration Path (Future)

**If we need to change later:**

1. **Switch from Supabase to Upstash:**
   ```typescript
   // Just swap the adapter, rest stays same!
   import { UpstashStore, UpstashVector } from "@mastra/upstash";

   const memory = new Memory({
     storage: new UpstashStore({ ... }),
     vector: new UpstashVector({ ... }),
     // ... options stay identical
   });
   ```

2. **Switch from AI SDK to Mastra Agent:**
   ```typescript
   // If Mastra Agent gets ToolLoopAgent features:
   import { Agent } from "@mastra/core/agent";

   const chatAgent = new Agent({
     model: anthropic('claude-3-7-sonnet-20250219'),
     tools: { unifiedSearch, visualize, ... },
     memory, // Already using Mastra Memory!
   });
   ```

**Abstraction protects us** - changing one part doesn't break everything!

---

**Last Updated:** 2025-10-26
**Status:** ✅ Finalized - Ready for implementation
