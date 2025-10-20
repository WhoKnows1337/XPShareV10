# XPShare AI - Code Examples & Templates

**Version:** 1.0
**Related:** All other documents

---

## 🎯 Ready-to-Use Code Snippets

### Complete API Route

```typescript
// app/api/discover/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, smoothStream } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/openai/client'
import { hybridSearch } from '@/lib/search/hybrid'
import {
  advancedSearchTool,
  searchByAttributesTool,
  semanticSearchTool,
  rankUsersTool,
  analyzeCategoryTool,
  temporalAnalysisTool,
  findConnectionsTool,
} from '@/lib/tools'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are XPShare Discovery Assistant.

Tools available:
- advanced_search: Multi-dimensional filtering
- search_by_attributes: Attribute-based queries
- semantic_search: Vector similarity
- rank_users: User rankings
- analyze_category: Category deep-dive
- temporal_analysis: Time patterns
- find_connections: Relationship discovery

Always provide context and insights.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    tools: {
      advanced_search: advancedSearchTool,
      search_by_attributes: searchByAttributesTool,
      semantic_search: semanticSearchTool,
      rank_users: rankUsersTool,
      analyze_category: analyzeCategoryTool,
      temporal_analysis: temporalAnalysisTool,
      find_connections: findConnectionsTool,
    },
    temperature: 0.3,
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse({
    transform: smoothStream({ chunking: 'word' }),
  })
}
```

---

### Complete Tool Implementation Template

```typescript
// lib/tools/example-tool.ts
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

export const exampleTool = tool({
  description: 'Clear description of what this tool does',
  parameters: z.object({
    requiredParam: z.string().describe('Description of parameter'),
    optionalParam: z.number().optional().default(10),
  }),
  execute: async ({ requiredParam, optionalParam }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    try {
      // Your logic here
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .limit(optionalParam)

      if (error) throw error

      return {
        results: data,
        count: data.length,
        param_used: requiredParam,
      }
    } catch (error) {
      console.error('Tool execution failed:', error)
      throw new Error(`Failed to execute tool: ${error.message}`)
    }
  },
})
```

---

### Agent Template

```typescript
// lib/agents/example-agent.ts
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const AGENT_PROMPT = `You are a specialist agent.

Your capabilities:
- Thing 1
- Thing 2

Always return structured responses.`

export class ExampleAgent {
  async execute(task: string, context: any) {
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: AGENT_PROMPT },
        {
          role: 'user',
          content: `Task: ${task}\nContext: ${JSON.stringify(context)}`
        },
      ],
      tools: {
        // Your tools here
      },
      maxSteps: 3,
      temperature: 0.3,
    })

    return {
      result: text,
      toolCalls,
    }
  }
}
```

---

### Complete Discover Page

```typescript
// app/[locale]/discover/page.tsx (simplified)
'use client'

import { useChat } from '@ai-sdk/react'
import { Message, Response } from '@/components/ai-elements/message'
import { PromptInput } from '@/components/ai-elements/prompt-input'

export default function DiscoverPage() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/discover',
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  return (
    <div className="h-screen flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            {message.parts?.map((part, i) => {
              if (part.type === 'text') {
                return <Response key={i}>{part.text}</Response>
              }
              // Render tool UIs here
              return null
            })}
          </Message>
        ))}
      </div>

      {/* Input */}
      <PromptInput
        onSubmit={(data) => {
          if (!data.text?.trim() || isLoading) return
          sendMessage({ text: data.text })
        }}
      />
    </div>
  )
}
```

---

### Hybrid Search Implementation

```typescript
// lib/search/hybrid.ts
import { createClient } from '@supabase/supabase-js'

interface HybridSearchParams {
  embedding: number[]
  query: string
  filters?: {
    categories?: string[]
    dateRange?: { from: string; to: string }
  }
  maxResults?: number
  similarityThreshold?: number
  useReranking?: boolean
}

export async function hybridSearch(params: HybridSearchParams) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  // Step 1: Vector search
  const { data: vectorResults } = await supabase.rpc('match_experiences', {
    query_embedding: params.embedding,
    match_threshold: params.similarityThreshold || 0.7,
    match_count: params.maxResults || 20,
  })

  // Step 2: Full-text search
  let ftsQuery = supabase
    .from('experiences')
    .select('*')
    .textSearch('fts', params.query)
    .limit(params.maxResults || 20)

  if (params.filters?.categories) {
    ftsQuery = ftsQuery.in('category_slug', params.filters.categories)
  }

  const { data: ftsResults } = await ftsQuery

  // Step 3: Merge and deduplicate
  const merged = new Map()

  vectorResults?.forEach((r: any) => {
    merged.set(r.id, { ...r, vector_score: r.similarity })
  })

  ftsResults?.forEach((r: any) => {
    if (merged.has(r.id)) {
      merged.get(r.id).fts_score = 1
    } else {
      merged.set(r.id, { ...r, fts_score: 1 })
    }
  })

  // Step 4: Rank
  const ranked = Array.from(merged.values()).map((r) => ({
    ...r,
    rank_score: (r.vector_score || 0) * 0.7 + (r.fts_score || 0) * 0.3,
  }))

  ranked.sort((a, b) => b.rank_score - a.rank_score)

  return ranked.slice(0, params.maxResults || 20)
}
```

---

### Supabase Migration Template

```typescript
// Using Supabase MCP
import { mcp__supabase__apply_migration } from 'mcp'

await mcp__supabase__apply_migration({
  name: 'add_my_feature',
  query: `
    -- Add column
    ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS my_column TEXT;

    -- Add index
    CREATE INDEX IF NOT EXISTS experiences_my_column_idx
    ON experiences(my_column);

    -- Add function
    CREATE OR REPLACE FUNCTION my_function(p_param TEXT)
    RETURNS TABLE (id UUID, name TEXT)
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT e.id, e.title
      FROM experiences e
      WHERE e.category_slug = p_param;
    END;
    $$;
  `,
})
```

---

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-proj-xxx
```

---

### Test Template

```typescript
// __tests__/agents/query-agent.test.ts
import { QueryAgent } from '@/lib/agents/query-agent'
import { describe, it, expect } from 'vitest'

describe('QueryAgent', () => {
  it('should execute advanced search', async () => {
    const agent = new QueryAgent()

    const result = await agent.execute(
      'Find UFO sightings in Berlin',
      { categories: ['ufo'], location: 'Berlin' }
    )

    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should handle errors gracefully', async () => {
    const agent = new QueryAgent()

    await expect(
      agent.execute('Invalid query', {})
    ).rejects.toThrow()
  })
})
```

---

**Next:** See 09_API_REFERENCE.md for complete API docs.
