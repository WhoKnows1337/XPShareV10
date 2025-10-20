# AI SDK 5.0 Best Practices

**Purpose:** Ensure all implementations follow Vercel AI SDK 5.0 patterns
**Importance:** Prevents deprecated patterns, ensures type safety, optimizes costs
**Reference:** https://sdk.vercel.ai/

---

## 1. Provider Configuration

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

---

## 2. Tool Definitions

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

---

## 3. Generative UI

**✅ DO:** Use `streamUI()` for progressive rendering

```typescript
import { streamUI } from '@ai-sdk/rsc' // ✅ AI SDK 5.0 package
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

**❌ DON'T:** Use deprecated `render()` function or old import path

```typescript
// ❌ Bad - render() is deprecated
import { render } from 'ai/rsc' // ❌ Wrong package (deprecated)

return render({ // ❌ Use streamUI instead
  tools: {
    search: {
      render: async function* () { } // ❌ Use generate instead
    }
  }
})
```

---

## 4. Structured Outputs

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

---

## 5. Token Control & Cost Optimization

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

---

## 6. Multi-Step Reasoning

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

---

## 7. Client-Side Integration

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

---

## 8. Error Handling

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

---

## 9. Type Safety

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

---

## 10. Performance Best Practices

### Streaming for Better UX

```typescript
// ✅ Stream text responses
const result = streamText({
  model: gpt4o,
  messages,
})

// Client receives tokens as they're generated
return result.toDataStreamResponse()
```

### Progressive UI Rendering

```typescript
// ✅ Show loading states immediately
generate: async function* (params) {
  yield <Skeleton /> // ✅ Instant feedback

  const data = await fetchData(params)

  return <Results data={data} /> // ✅ Final UI
}
```

### Parallel Tool Calls (AI SDK 5.0+)

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

## 🚨 Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| `import { openai } from '@ai-sdk/openai'` | Use pre-configured provider from `/lib/openai/ai-sdk-client` |
| `maxTokens: 1000` | Use `maxCompletionTokens: 1000` |
| `import { streamUI } from 'ai/rsc'` | Use `import { streamUI } from '@ai-sdk/rsc'` (AI SDK 5.0) |
| `render()` function | Use `streamUI()` instead |
| Plain object tool definitions | Use `tool()` function |
| `render: async function*` | Use `generate: async function*` |
| No error handling | Wrap in try-catch with fallbacks |
| Missing `schemaName` in generateObject | Add for better accuracy |
| High temperature for structured outputs | Use 0.3 or lower |

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All tools use `tool()` from 'ai'
- [ ] All imports from `/lib/openai/ai-sdk-client.ts`
- [ ] No usage of `maxTokens` (use `maxCompletionTokens`)
- [ ] No usage of `render()` (use `streamUI()`)
- [ ] No usage of `render:` property (use `generate:`)
- [ ] All Zod schemas have `schemaName` and `schemaDescription`
- [ ] Error handling with try-catch
- [ ] TypeScript types properly inferred
- [ ] Streaming enabled where appropriate
- [ ] Cost controls in place (`maxSteps`, `maxCompletionTokens`)

---

## 📚 Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [AI SDK 5.0 Migration Guide](https://sdk.vercel.ai/docs/ai-sdk-core/migration)
- [Structured Outputs Guide](https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data)
- [Tool Calling Guide](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Generative UI Guide](https://sdk.vercel.ai/docs/ai-sdk-rsc)

---

**Status:** Reference Document
**Apply to:** All AI implementations (Phase 1, 2, 3)
