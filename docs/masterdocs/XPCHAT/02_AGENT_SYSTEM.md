# XPShare AI - Multi-Agent System Implementation

**Version:** 1.0
**Related:** 01_ARCHITECTURE.md, 03_TOOLS_CATALOG.md

---

## 🤖 The 4 Core Agents

### Agent Hierarchy

```
ORCHESTRATOR (Master)
    ├─> QUERY AGENT (Data Specialist)
    ├─> VIZ AGENT (Visualization Specialist)
    └─> INSIGHT AGENT (Analysis Specialist)
```

---

## 1️⃣ Orchestrator Agent

**Role:** Master coordinator that orchestrates the entire workflow

**Model:** GPT-4o (best reasoning)

### Implementation

```typescript
// lib/agents/orchestrator.ts
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the XPShare AI Orchestrator.

Your role:
1. Understand complex user questions about extraordinary experiences
2. Break them into executable sub-tasks
3. Delegate to specialist agents
4. Synthesize responses with citations
5. Learn user preferences over time

Available Specialists:
- QUERY AGENT: Database searches, filtering, aggregations
- VIZ AGENT: Visualization selection and generation
- INSIGHT AGENT: Pattern detection, explanations, predictions

Database:
- 54 categories (UFO, Dreams, NDE, etc.)
- 164 attributes (dream_symbol, ufo_shape, etc.)
- Geographic, temporal, semantic data

Memory & Personalization:
- User Profile Memory: Long-term preferences (categories, visualization types, language)
- Session Memory: Short-term context (recent searches, active filters)
- Use memory to personalize responses and anticipate needs

Citations:
- ALWAYS generate citations when referencing specific experiences
- Use footnote style [1][2][3] in responses
- Link citations to source experiences

IMPORTANT:
- Use Query Agent for ALL data retrieval
- Use Viz Agent when user wants to "see" something
- Use Insight Agent for "why" questions or pattern analysis
- Combine multiple agents for complex queries
- Always include citations for factual claims
- Update user preferences based on conversation patterns
- Always explain your reasoning

Example Workflow:
User: "Zeig mir UFOs in Berlin und erkläre Muster"
1. Delegate to Query Agent → Get UFO experiences in Berlin
2. Delegate to Viz Agent → Generate map
3. Delegate to Insight Agent → Analyze patterns
4. Synthesize → Combine into coherent response`

export class OrchestratorAgent {
  private queryAgent: QueryAgent
  private vizAgent: VizAgent
  private insightAgent: InsightAgent

  async process(userMessage: string, conversationHistory: Message[]) {
    // Step 1: Analyze intent and create plan
    const plan = await this.createExecutionPlan(userMessage, conversationHistory)

    // Step 2: Execute plan with specialists
    const results = await this.executePlan(plan)

    // Step 3: Synthesize response
    return await this.synthesizeResponse(results, userMessage)
  }

  private async createExecutionPlan(
    userMessage: string,
    history: Message[]
  ): Promise<ExecutionPlan> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage }
      ],
      tools: {
        delegate_to_query_agent: tool({
          description: 'Delegate data retrieval task to Query Agent',
          parameters: z.object({
            task: z.string(),
            parameters: z.any()
          })
        }),
        delegate_to_viz_agent: tool({
          description: 'Delegate visualization task to Viz Agent',
          parameters: z.object({
            task: z.string(),
            data: z.any()
          })
        }),
        delegate_to_insight_agent: tool({
          description: 'Delegate analysis task to Insight Agent',
          parameters: z.object({
            task: z.string(),
            context: z.any()
          })
        })
      },
      maxSteps: 5
    })

    return this.parseExecutionPlan(text)
  }

  private async executePlan(plan: ExecutionPlan) {
    const results = []

    for (const step of plan.steps) {
      switch (step.agent) {
        case 'query':
          const queryResult = await this.queryAgent.execute(step.task, step.parameters)
          results.push({ agent: 'query', data: queryResult })
          break

        case 'viz':
          const vizResult = await this.vizAgent.execute(step.task, step.data)
          results.push({ agent: 'viz', data: vizResult })
          break

        case 'insight':
          const insightResult = await this.insightAgent.execute(step.task, step.context)
          results.push({ agent: 'insight', data: insightResult })
          break
      }
    }

    return results
  }

  private async synthesizeResponse(results: any[], userMessage: string) {
    // Combine all results into coherent response
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `
        User asked: "${userMessage}"

        Results from specialists:
        ${JSON.stringify(results, null, 2)}

        Create a comprehensive response that:
        1. Answers the user's question
        2. Includes visualizations where appropriate
        3. Provides insights and context
        4. Suggests follow-up questions

        Be conversational and helpful.
      `
    })

    return {
      text,
      visualizations: results.filter(r => r.agent === 'viz').map(r => r.data),
      insights: results.filter(r => r.agent === 'insight').map(r => r.data),
      data: results.filter(r => r.agent === 'query').map(r => r.data)
    }
  }
}
```

### Memory Integration

```typescript
// lib/agents/orchestrator-with-memory.ts
import { MemoryManager } from '@/lib/memory/manager'
import { generateCitations } from '@/lib/citations/generator'

export class OrchestratorAgentWithMemory extends OrchestratorAgent {
  private memoryManager: MemoryManager

  constructor() {
    super()
    this.memoryManager = new MemoryManager()
  }

  async process(
    userMessage: string,
    conversationHistory: Message[],
    userId?: string,
    chatId?: string
  ) {
    // Step 1: Load user preferences and session memory
    const userPreferences = userId
      ? await this.memoryManager.getUserPreferences(userId)
      : null

    const sessionContext = chatId
      ? await this.memoryManager.getSessionMemory(chatId)
      : []

    // Step 2: Create enhanced execution plan with memory context
    const plan = await this.createExecutionPlan(
      userMessage,
      conversationHistory,
      { userPreferences, sessionContext }
    )

    // Step 3: Execute plan
    const results = await this.executePlan(plan)

    // Step 4: Generate citations for experiences referenced
    const experienceIds = this.extractExperienceIds(results)
    const citations = await generateCitations(messageId, experienceIds)

    // Step 5: Update memory based on conversation
    if (userId && chatId) {
      await this.updateMemoryFromConversation(
        userId,
        chatId,
        userMessage,
        results
      )
    }

    // Step 6: Synthesize response with citations
    return await this.synthesizeResponse(results, userMessage, {
      citations,
      userPreferences,
    })
  }

  private async updateMemoryFromConversation(
    userId: string,
    chatId: string,
    userMessage: string,
    results: any[]
  ) {
    // Infer user preferences from conversation
    const categoryMentions = this.extractCategories(userMessage)
    if (categoryMentions.length > 0) {
      const existingPrefs =
        (await this.memoryManager.getProfileMemory(userId, 'preferred_categories')) || []

      const updatedPrefs = [
        ...new Set([...existingPrefs, ...categoryMentions]),
      ].slice(0, 5)

      await this.memoryManager.setProfileMemory(
        userId,
        'preferred_categories',
        updatedPrefs,
        'inferred'
      )
    }

    // Store session context (last search parameters)
    const queryResults = results.filter((r) => r.agent === 'query')
    if (queryResults.length > 0) {
      await this.memoryManager.setSessionMemory(chatId, 'last_query', {
        parameters: queryResults[0].parameters,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private extractExperienceIds(results: any[]): string[] {
    const experienceIds: string[] = []

    results
      .filter((r) => r.agent === 'query')
      .forEach((result) => {
        if (result.data?.results) {
          result.data.results.forEach((exp: any) => {
            if (exp.id) experienceIds.push(exp.id)
          })
        }
      })

    return experienceIds
  }

  private extractCategories(message: string): string[] {
    const categories = [
      'ufo',
      'dreams',
      'nde',
      'synchronicity',
      'psychic',
      'ghost',
    ]
    return categories.filter((cat) =>
      message.toLowerCase().includes(cat)
    )
  }
}
```

---

## 2️⃣ Query Agent

**Role:** Database query specialist

**Model:** GPT-4o-mini (faster, cheaper for structured tasks)

### Implementation

```typescript
// lib/agents/query-agent.ts
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const QUERY_AGENT_SYSTEM_PROMPT = `You are the XPShare Query Specialist.

Your role: Build precise database queries for extraordinary experiences.

Available Tools:
1. advanced_search - Multi-dimensional filtering
2. search_by_attributes - Attribute-based queries
3. rank_users - User rankings
4. find_connections - Relationship discovery
5. temporal_analysis - Time-based patterns

Database Schema:
- experiences: category, location_text, location_lat, location_lng, date_occurred, time_of_day, tags, emotions
- experience_attributes: attribute_key, attribute_value, confidence
- user_profiles: username, location_city, total_experiences

RULES:
- Always validate filters before querying
- Use appropriate tools for each query type
- Return structured, complete data
- Handle edge cases (no results, invalid params)
- Optimize for performance`

export class QueryAgent {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  async execute(task: string, parameters: any) {
    const { toolCalls } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: QUERY_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: `Task: ${task}\nParameters: ${JSON.stringify(parameters)}` }
      ],
      tools: this.getTools(),
      maxSteps: 3
    })

    // Execute the selected tool
    return await this.executeToolCalls(toolCalls)
  }

  private getTools() {
    return {
      advanced_search: tool({
        description: 'Search experiences with complex multi-dimensional filters',
        parameters: z.object({
          categories: z.array(z.string()).optional(),
          location: z.object({
            city: z.string().optional(),
            radius: z.number().optional()
          }).optional(),
          timeRange: z.object({
            from: z.string(),
            to: z.string()
          }).optional(),
          dateRange: z.object({
            from: z.string(),
            to: z.string()
          }).optional(),
          attributes: z.array(z.object({
            key: z.string(),
            value: z.any(),
            operator: z.enum(['equals', 'contains', 'gt', 'lt'])
          })).optional(),
          tags: z.array(z.string()).optional(),
          limit: z.number().default(50)
        }),
        execute: async (params) => {
          return await this.advancedSearch(params)
        }
      }),

      search_by_attributes: tool({
        description: 'Find experiences with specific attributes',
        parameters: z.object({
          category: z.string(),
          attributeFilters: z.array(z.object({
            key: z.string(),
            value: z.any(),
            operator: z.enum(['equals', 'contains', 'exists'])
          })),
          logic: z.enum(['AND', 'OR']).default('AND')
        }),
        execute: async (params) => {
          return await this.searchByAttributes(params)
        }
      }),

      rank_users: tool({
        description: 'Get top users by metric',
        parameters: z.object({
          metric: z.enum(['experience_count', 'category_count', 'total_xp']),
          filters: z.object({
            category: z.string().optional(),
            location: z.string().optional()
          }).optional(),
          topN: z.number().default(10)
        }),
        execute: async (params) => {
          return await this.rankUsers(params)
        }
      })
    }
  }

  private async advancedSearch(params: any) {
    let query = this.supabase
      .from('experiences')
      .select(`
        *,
        experience_attributes (
          attribute_key,
          attribute_value
        )
      `)

    // Apply filters
    if (params.categories) {
      query = query.in('category', params.categories)
    }

    if (params.location?.city) {
      query = query.ilike('location_text', `%${params.location.city}%`)
    }

    if (params.timeRange) {
      query = query
        .gte('time_of_day', params.timeRange.from)
        .lte('time_of_day', params.timeRange.to)
    }

    if (params.dateRange) {
      query = query
        .gte('date_occurred', params.dateRange.from)
        .lte('date_occurred', params.dateRange.to)
    }

    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags)
    }

    const { data, error } = await query.limit(params.limit)

    if (error) throw error

    // Post-filter by attributes if specified
    if (params.attributes && params.attributes.length > 0) {
      return this.filterByAttributes(data, params.attributes)
    }

    return {
      results: data,
      count: data.length,
      summary: `Found ${data.length} experiences`
    }
  }

  private async searchByAttributes(params: any) {
    // Build complex attribute query
    const { data, error } = await this.supabase.rpc('search_by_attributes', {
      p_category: params.category,
      p_attribute_filters: params.attributeFilters,
      p_logic: params.logic
    })

    if (error) throw error

    return {
      results: data,
      count: data.length
    }
  }

  private async rankUsers(params: any) {
    let query = this.supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        location_city,
        total_experiences,
        total_xp
      `)

    if (params.filters?.location) {
      query = query.eq('location_city', params.filters.location)
    }

    const orderBy = params.metric === 'experience_count'
      ? 'total_experiences'
      : params.metric === 'total_xp'
      ? 'total_xp'
      : 'total_experiences'

    query = query.order(orderBy, { ascending: false }).limit(params.topN)

    const { data, error } = await query

    if (error) throw error

    return {
      users: data,
      count: data.length,
      metric: params.metric
    }
  }
}
```

---

## 3️⃣ Visualization Agent

**Role:** Auto-select and generate visualizations

**Model:** GPT-4o-mini

### Implementation

```typescript
// lib/agents/viz-agent.ts
const VIZ_AGENT_SYSTEM_PROMPT = `You are the XPShare Visualization Specialist.

Your role: Select optimal visualizations based on data structure.

Decision Rules:
- Geographic data (lat/lng) → Map
- Temporal data (dates/times) → Timeline
- Relationships/connections → Network Graph
- Category × Time → Heatmap
- Distributions → Bar/Pie Chart
- Rankings → Table/Leaderboard
- Comparisons → Side-by-side

For complex queries, generate multiple visualizations in a dashboard.

Always return:
1. Visualization type
2. Configuration
3. Data formatted for viz
4. Layout (if multi-viz)`

export class VizAgent {
  async execute(task: string, data: any) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `
        Task: ${task}

        Data Structure:
        ${JSON.stringify(this.analyzeDataStructure(data), null, 2)}

        Select the best visualization(s) and generate configuration.
        Return as JSON:
        {
          "type": "map" | "timeline" | "network" | "heatmap" | "dashboard",
          "config": {...},
          "data": [...]
        }
      `
    })

    const vizSpec = JSON.parse(text)
    return this.generateVisualization(vizSpec)
  }

  private analyzeDataStructure(data: any[]) {
    return {
      hasGeo: data.some(d => d.latitude && d.longitude),
      hasTemporal: data.some(d => d.date_occurred),
      hasCategories: data.some(d => d.category),
      hasTags: data.some(d => d.tags?.length > 0),
      count: data.length
    }
  }

  private generateVisualization(spec: any) {
    switch (spec.type) {
      case 'map':
        return {
          type: 'map',
          component: 'DynamicExperienceMapCard',
          props: {
            markers: spec.data,
            config: spec.config
          }
        }

      case 'timeline':
        return {
          type: 'timeline',
          component: 'DynamicTimelineChart',
          props: {
            data: spec.data,
            config: spec.config
          }
        }

      case 'network':
        return {
          type: 'network',
          component: 'DynamicNetworkGraph',
          props: {
            nodes: spec.data.nodes,
            edges: spec.data.edges,
            config: spec.config
          }
        }

      default:
        return spec
    }
  }
}
```

---

## 4️⃣ Insight Agent

**Role:** Pattern analysis and explanations

**Model:** GPT-4o (deep reasoning)

### Implementation

```typescript
// lib/agents/insight-agent.ts
const INSIGHT_AGENT_SYSTEM_PROMPT = `You are the XPShare Insight Specialist.

Your role: Detect patterns, explain phenomena, answer "why" questions.

Capabilities:
1. Pattern Detection: Identify temporal, geographic, semantic patterns
2. Correlation Analysis: Find attribute correlations
3. Anomaly Detection: Spot unusual trends
4. Explanation Generation: Explain patterns in natural language
5. Prediction: Basic trend forecasting

Always provide:
- Clear, data-backed insights
- Confidence scores
- Supporting evidence
- Actionable recommendations`

export class InsightAgent {
  async execute(task: string, context: any) {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'system', content: INSIGHT_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: `Task: ${task}\n\nContext: ${JSON.stringify(context)}` }
      ],
      tools: {
        detect_pattern: tool({
          description: 'Detect patterns in data',
          parameters: z.object({
            patternType: z.enum(['temporal', 'geographic', 'semantic', 'correlation']),
            data: z.any()
          }),
          execute: async (params) => {
            return await this.detectPattern(params)
          }
        }),

        generate_insight_card: tool({
          description: 'Generate insight card',
          parameters: z.object({
            title: z.string(),
            summary: z.string(),
            confidence: z.number(),
            dataPoints: z.array(z.object({
              label: z.string(),
              value: z.any()
            }))
          }),
          execute: async (params) => {
            return {
              type: 'insight_card',
              component: 'InsightCard',
              props: params
            }
          }
        })
      }
    })

    return text
  }

  private async detectPattern(params: any) {
    // Pattern detection logic
    switch (params.patternType) {
      case 'temporal':
        return this.detectTemporalPattern(params.data)
      case 'geographic':
        return this.detectGeographicPattern(params.data)
      case 'correlation':
        return this.detectCorrelation(params.data)
      default:
        return null
    }
  }
}
```

---

## 🔄 Agent Communication Protocol

```typescript
interface AgentMessage {
  from: 'orchestrator' | 'query' | 'viz' | 'insight'
  to: 'orchestrator' | 'query' | 'viz' | 'insight'
  type: 'request' | 'response' | 'error'
  payload: any
  metadata: {
    timestamp: number
    requestId: string
    priority: 'high' | 'normal' | 'low'
  }
}

// Message bus for agent communication
class AgentBus {
  private handlers = new Map<string, (msg: AgentMessage) => Promise<any>>()

  register(agentType: string, handler: (msg: AgentMessage) => Promise<any>) {
    this.handlers.set(agentType, handler)
  }

  async send(message: AgentMessage) {
    const handler = this.handlers.get(message.to)
    if (!handler) throw new Error(`No handler for ${message.to}`)

    return await handler(message)
  }
}
```

---

**Next:** See 03_TOOLS_CATALOG.md for complete tool implementations.
