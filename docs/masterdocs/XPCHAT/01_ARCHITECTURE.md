# XPShare AI System - Detailed Architecture

**Version:** 1.0
**Last Updated:** 2025-01-21
**Related Docs:** 00_OVERVIEW.md, 02_AGENT_SYSTEM.md

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Web Interface   │  │  Mobile (Future) │  │  API Client      │  │
│  │  (Next.js)       │  │  (React Native)  │  │  (REST/GraphQL)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               Next.js 15 App Router                          │   │
│  │  /api/discover-v2/route.ts (Main AI Endpoint)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Orchestrator │  │ Query Agent  │  │  Viz Agent   │             │
│  │   (GPT-4o)   │  │ (GPT-4o-mini)│  │(GPT-4o-mini) │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                    ┌──────────────┐                                 │
│                    │ Insight Agent│                                 │
│                    │  (GPT-4o)    │                                 │
│                    └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         TOOL LAYER                                   │
│  20+ Specialized Tools (Search, Aggregate, Analyze, Visualize)     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  PostgreSQL      │  │  pgvector        │                        │
│  │  (Supabase)      │  │  (Embeddings)    │                        │
│  └──────────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Multi-Agent Architecture Pattern

### Pattern: Hierarchical Multi-Agent System

```
                    ┌─────────────────────┐
                    │  ORCHESTRATOR       │
                    │  (Master Agent)     │
                    │  - Parse Intent     │
                    │  - Plan Workflow    │
                    │  - Coordinate       │
                    └─────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ↓               ↓               ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ QUERY AGENT  │ │  VIZ AGENT   │ │INSIGHT AGENT │
    │ (Specialist) │ │ (Specialist) │ │(Specialist)  │
    │              │ │              │ │              │
    │ - SQL Build  │ │ - Viz Select │ │ - Patterns   │
    │ - Filtering  │ │ - Config Gen │ │ - Explain    │
    │ - Validation │ │ - Multi-Viz  │ │ - Narratives │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ↓
                    ┌──────────────┐
                    │  TOOL LAYER  │
                    └──────────────┘
```

### Communication Protocol

**Orchestrator → Specialist**
```typescript
{
  type: 'delegate',
  agent: 'query' | 'viz' | 'insight',
  task: {
    instruction: string,
    context: object,
    expectedOutput: string
  },
  priority: 'high' | 'normal' | 'low'
}
```

**Specialist → Orchestrator**
```typescript
{
  type: 'result',
  agent: 'query' | 'viz' | 'insight',
  status: 'success' | 'error',
  data: any,
  metadata: {
    executionTime: number,
    tokensUsed: number,
    confidence: number
  }
}
```

---

## 🔄 Request Flow

### Example: "Zeig mir UFOs und NDEs in Berlin zwischen 20-22 Uhr"

```
1. USER INPUT
   │
   ├─> POST /api/discover-v2
   │   Body: { messages: [...] }
   │
2. ORCHESTRATOR RECEIVES
   │
   ├─> Analyzes: "This needs data retrieval + visualization"
   │
   ├─> Plans:
   │   Step 1: Query Agent → Get experiences
   │   Step 2: Viz Agent → Generate map
   │   Step 3: Synthesize response
   │
3. DELEGATES TO QUERY AGENT
   │
   ├─> Query Agent calls tool: advanced_search
   │   {
   │     categories: ['ufo-uap', 'nde-obe'],
   │     location: { city: 'Berlin' },
   │     timeRange: { from: '20:00', to: '22:00' }
   │   }
   │
   ├─> SQL Executed:
   │   SELECT e.*, ea.*
   │   FROM experiences e
   │   LEFT JOIN experience_attributes ea ON e.id = ea.experience_id
   │   WHERE e.category IN ('ufo-uap', 'nde-obe')
   │     AND e.location_text ILIKE '%Berlin%'
   │     AND e.time_of_day BETWEEN '20:00' AND '22:00'
   │
   ├─> Returns: 12 experiences
   │
4. DELEGATES TO VIZ AGENT
   │
   ├─> Viz Agent analyzes data structure
   │   - Has lat/lng: ✓
   │   - Geographic query: ✓
   │   → Selects: Map visualization
   │
   ├─> Generates config:
   │   {
   │     type: 'map',
   │     markers: [...],
   │     config: { clustering: true, filters: true }
   │   }
   │
5. ORCHESTRATOR SYNTHESIZES
   │
   ├─> Combines:
   │   - Query results (12 experiences)
   │   - Map visualization
   │   - Natural language summary
   │
   ├─> Generates:
   │   "Ich habe 12 Erfahrungen gefunden:
   │    - 8 UFO-Sichtungen
   │    - 4 Nahtoderfahrungen
   │    Alle in Berlin zwischen 20-22 Uhr.
   │
   │    [Interactive Map Component]
   │
   │    Möchtest du mehr über die Muster erfahren?"
   │
6. STREAM TO USER
   │
   └─> Response streamed via Server-Sent Events
```

---

## 🧠 Agent Design Patterns

### 1. Orchestrator Pattern (Master Coordinator)

**Responsibilities:**
- Parse complex user intent
- Decompose into sub-tasks
- Delegate to specialist agents
- Manage dependencies
- Synthesize final response

**Implementation:**
```typescript
class OrchestratorAgent {
  async process(userMessage: string, context: ConversationContext) {
    // 1. Analyze intent
    const intent = await this.analyzeIntent(userMessage)

    // 2. Create execution plan
    const plan = await this.createPlan(intent, context)

    // 3. Execute plan with specialists
    const results = await this.executePlan(plan)

    // 4. Synthesize response
    return await this.synthesize(results, context)
  }

  private async executePlan(plan: ExecutionPlan) {
    const results = []

    for (const step of plan.steps) {
      if (step.canRunInParallel) {
        // Parallel execution
        const parallelResults = await Promise.all(
          step.tasks.map(task => this.delegateToAgent(task))
        )
        results.push(...parallelResults)
      } else {
        // Sequential execution
        const result = await this.delegateToAgent(step)
        results.push(result)
      }
    }

    return results
  }
}
```

### 2. Specialist Pattern (Single Responsibility)

**Query Agent Example:**
```typescript
class QueryAgent {
  async execute(task: QueryTask) {
    // 1. Validate parameters
    this.validate(task.parameters)

    // 2. Select appropriate tool
    const tool = this.selectTool(task.type)

    // 3. Execute tool
    const result = await tool.execute(task.parameters)

    // 4. Post-process
    return this.postProcess(result, task.format)
  }

  private selectTool(type: QueryType) {
    switch (type) {
      case 'simple_search':
        return this.tools.advanced_search
      case 'attribute_search':
        return this.tools.search_by_attributes
      case 'semantic_search':
        return this.tools.semantic_search
      // ...
    }
  }
}
```

---

## 🛠️ Tool Architecture

### Tool Interface

```typescript
interface Tool {
  name: string
  description: string
  parameters: ZodSchema
  execute: (params: any) => Promise<ToolResult>
  validate?: (params: any) => ValidationResult
  cache?: CacheStrategy
}

interface ToolResult {
  success: boolean
  data: any
  metadata: {
    executionTime: number
    cacheHit: boolean
    rowsAffected?: number
  }
  error?: {
    code: string
    message: string
    details: any
  }
}
```

### Tool Categories

**1. Search Tools**
- `advanced_search`: Multi-dimensional filtering
- `search_by_attributes`: Attribute-based queries
- `semantic_search`: Vector similarity
- `full_text_search`: PostgreSQL FTS
- `geo_search`: Geographic queries

**2. Aggregation Tools**
- `rank_users`: User rankings
- `analyze_category`: Category statistics
- `compare_categories`: Cross-category analysis
- `temporal_analysis`: Time-based aggregations
- `attribute_correlation`: Correlation analysis

**3. Relationship Tools**
- `find_connections`: Multi-dimensional similarity
- `detect_patterns`: Pattern discovery
- `cluster_analysis`: Clustering algorithms
- `user_similarity`: User-user similarity

**4. Visualization Tools**
- `generate_map`: Geographic visualizations
- `generate_timeline`: Temporal visualizations
- `generate_network`: Network graphs
- `generate_dashboard`: Multi-viz dashboards

**5. Insight Tools**
- `generate_insights`: Auto insight cards
- `predict_trends`: Predictive analytics
- `suggest_followups`: Follow-up questions
- `explain_pattern`: Pattern explanations

**6. Utility Tools**
- `export_results`: Export functionality
- `save_query`: Save queries
- `create_alert`: Alert creation
- `share_results`: Sharing functionality

---

## 📊 Data Flow Architecture

### Search Flow

```
User Query
    ↓
[Intent Analysis]
    ↓
[Query Construction]
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Semantic   │  Attribute  │    FTS      │
│   Search    │   Filter    │   Search    │
│  (pgvector) │   (JOIN)    │ (tsvector)  │
└─────────────┴─────────────┴─────────────┘
    ↓            ↓            ↓
[Merge & Deduplicate]
    ↓
[Rerank (Optional)]
    ↓
[Post-process]
    ↓
Results
```

### Aggregation Flow

```
User Query
    ↓
[Parse Aggregation Type]
    ↓
┌──────────────────────────────┐
│  Select Aggregation Function │
│  - COUNT                     │
│  - AVG                       │
│  - SUM                       │
│  - GROUP BY                  │
│  - RANK                      │
└──────────────────────────────┘
    ↓
[Apply Filters]
    ↓
[Execute SQL]
    ↓
[Format Results]
    ↓
Aggregated Data
```

---

## 🎨 Visualization Selection Logic

### Decision Tree

```typescript
function selectVisualization(data: any[], queryType: string): VizType {
  // Check data structure
  const hasGeo = data.some(d => d.latitude && d.longitude)
  const hasTemporal = data.some(d => d.date_occurred || d.created_at)
  const hasRelationships = queryType.includes('connection') || queryType.includes('similar')
  const hasCategorical = data.some(d => d.category)

  // Decision logic
  if (hasGeo && data.length > 5) {
    return 'map'
  }

  if (hasTemporal && data.length > 10) {
    return 'timeline'
  }

  if (hasRelationships) {
    return 'network'
  }

  if (hasCategorical && hasTemporal) {
    return 'heatmap'
  }

  if (queryType.includes('rank') || queryType.includes('top')) {
    return 'table'
  }

  if (data.length < 20) {
    return 'card_grid'
  }

  // Default
  return 'table'
}
```

### Multi-Viz Strategy

For complex queries, generate multiple visualizations:

```typescript
interface MultiVizConfig {
  primary: {
    type: VizType
    data: any[]
    config: any
  }
  secondary?: {
    type: VizType
    data: any[]
    config: any
  }
  layout: 'tabs' | 'grid' | 'split'
}

// Example: Geographic + Temporal
{
  primary: {
    type: 'map',
    data: experiences,
    config: { clustering: true }
  },
  secondary: {
    type: 'timeline',
    data: timelineData,
    config: { granularity: 'month' }
  },
  layout: 'split'
}
```

---

## 🔐 Security Architecture

### Authentication Flow

```
User Request
    ↓
[Check Supabase Session]
    ↓
┌──────────────┬──────────────┐
│  Authenticated│ Anonymous   │
│  User         │ User         │
└──────────────┴──────────────┘
    ↓                ↓
[Full Access]   [Limited Access]
    ↓                ↓
[RLS Policies]  [Public Data Only]
    ↓                ↓
Data Access
```

### Row-Level Security (RLS)

```sql
-- Experiences: Public visibility only
CREATE POLICY "Users can view public experiences"
ON experiences FOR SELECT
USING (visibility = 'public' OR user_id = auth.uid());

-- User profiles: Public info only
CREATE POLICY "Public profiles visible"
ON user_profiles FOR SELECT
USING (true);

-- Prevent data leakage in AI responses
CREATE POLICY "No private experience attributes in AI"
ON experience_attributes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM experiences
    WHERE id = experience_id
      AND (visibility = 'public' OR user_id = auth.uid())
  )
);
```

---

## ⚡ Performance Architecture

### Caching Strategy

**1. Query Result Caching**
```typescript
// In-memory cache for frequent queries
const queryCache = new Map<string, CachedResult>()

async function executeWithCache(query: string, ttl: number = 300) {
  const cacheKey = hashQuery(query)

  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey)
    if (Date.now() - cached.timestamp < ttl * 1000) {
      return cached.data
    }
  }

  const result = await db.execute(query)
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  })

  return result
}
```

**2. Embedding Caching**
```typescript
// Cache embeddings to avoid re-computation
const embeddingCache = new Map<string, number[]>()

async function getCachedEmbedding(text: string) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)
  }

  const embedding = await generateEmbedding(text)
  embeddingCache.set(text, embedding)

  return embedding
}
```

**3. Tool Result Caching**
```typescript
// Cache expensive tool results
const toolCache = new Map<string, any>()

async function executeTool(toolName: string, params: any) {
  const cacheKey = `${toolName}:${JSON.stringify(params)}`

  if (toolCache.has(cacheKey)) {
    return toolCache.get(cacheKey)
  }

  const result = await tools[toolName].execute(params)
  toolCache.set(cacheKey, result)

  return result
}
```

### Database Optimization

**Indexes:**
```sql
-- Geo queries
CREATE INDEX idx_experiences_geo
ON experiences USING GIST (
  geography(ST_MakePoint(location_lng, location_lat))
);

-- Temporal queries
CREATE INDEX idx_experiences_temporal
ON experiences (date_occurred, time_of_day);

-- Category queries
CREATE INDEX idx_experiences_category
ON experiences (category);

-- Attribute queries
CREATE INDEX idx_experience_attributes_key_value
ON experience_attributes (attribute_key, attribute_value);

-- Vector similarity
CREATE INDEX idx_experiences_embedding
ON experiences USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 🔄 Scalability Architecture

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│       Load Balancer (Vercel Edge)       │
└─────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
┌────────┐┌────────┐┌────────┐
│ Node 1 ││ Node 2 ││ Node 3 │
│Stateless││Stateless││Stateless│
└────────┘└────────┘└────────┘
    │         │         │
    └─────────┼─────────┘
              ↓
    ┌──────────────────┐
    │  Supabase Pool   │
    │  (Connection     │
    │   Pooling)       │
    └──────────────────┘
```

### Rate Limiting

```typescript
// Per-user rate limiting
const rateLimiter = new Map<string, RateLimit>()

async function checkRateLimit(userId: string) {
  const limit = rateLimiter.get(userId) || { count: 0, resetAt: Date.now() + 60000 }

  if (Date.now() > limit.resetAt) {
    limit.count = 0
    limit.resetAt = Date.now() + 60000
  }

  if (limit.count >= 100) { // 100 requests per minute
    throw new Error('Rate limit exceeded')
  }

  limit.count++
  rateLimiter.set(userId, limit)
}
```

---

## 📈 Monitoring Architecture

### Metrics to Track

```typescript
interface Metrics {
  // Performance
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number

  // AI
  avgTokensPerRequest: number
  llmCostPerRequest: number
  toolCallsPerRequest: number

  // Database
  avgQueryTime: number
  slowQueries: Query[]
  cacheHitRate: number

  // Business
  queriesPerUser: number
  visualizationsGenerated: number
  exportCount: number
}
```

### Logging Strategy

```typescript
// Structured logging
logger.info('ai_query_completed', {
  userId: user.id,
  query: userMessage,
  responseTime: duration,
  tokensUsed: tokens,
  toolsCalled: tools.map(t => t.name),
  vizGenerated: viz.type,
  success: true
})

// Error logging
logger.error('tool_execution_failed', {
  tool: toolName,
  params: sanitize(params),
  error: error.message,
  stack: error.stack,
  userId: user.id
})
```

---

## 🧪 Testing Architecture

### Test Pyramid

```
        ┌────────────┐
        │    E2E     │  ← 10% (Full user flows)
        └────────────┘
      ┌──────────────────┐
      │  Integration     │  ← 30% (Agent + Tools)
      └──────────────────┘
    ┌────────────────────────┐
    │      Unit Tests        │  ← 60% (Individual functions)
    └────────────────────────┘
```

### Test Categories

**1. Unit Tests**
- Tool parameter validation
- Query builders
- Utility functions
- Data transformers

**2. Integration Tests**
- Agent workflows
- Tool execution
- Database queries
- API endpoints

**3. E2E Tests**
- Complete user flows
- Multi-step queries
- Visualization generation
- Error handling

---

## 🔮 Future Architecture Enhancements

### Phase 7+

1. **Agent Memory System**
   - Long-term conversation memory
   - User preference learning
   - Query pattern recognition

2. **Custom Agent Training**
   - Fine-tuned models for specific domains
   - Domain-specific embeddings
   - Custom reranking models

3. **Real-time Collaboration**
   - Multi-user sessions
   - Shared analyses
   - Live updates

4. **Advanced Caching**
   - Redis for distributed caching
   - Pre-computed common queries
   - Materialized views

---

**Next:** Read 02_AGENT_SYSTEM.md for detailed agent implementation guide.
