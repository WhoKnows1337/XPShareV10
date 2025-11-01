# XPChat Testing Strategy

**Goal:** Ensure XPChat 2.0 meets performance targets and quality standards before deployment

---

## Testing Phases

1. **Unit Testing** - Individual tools and utilities
2. **Integration Testing** - API route + agent + tools
3. **End-to-End Testing** - Full user flow
4. **Performance Testing** - Token usage and response times
5. **User Acceptance Testing** - Real-world usage validation

---

## Phase 1: Unit Testing

### 1.1 Tool Testing

Test each of the 8 tools in isolation with mock context:

```typescript
// test/tools/unified-search.test.ts

import { describe, it, expect, vi } from 'vitest'
import { unifiedSearchTool } from '@/lib/mastra/tools/unified-search'
import { createMockSupabaseClient } from '../utils/mock-supabase'

describe('unifiedSearch tool', () => {
  it('should search experiences by category', async () => {
    const mockSupabase = createMockSupabaseClient([
      { id: '1', category: 'ufo-uap', title: 'Test UFO' },
    ])

    const context = {
      supabase: mockSupabase,
      userId: 'test-user',
      locale: 'de',
    }

    const result = await unifiedSearchTool.execute({
      context,
      data: {
        category: ['ufo-uap'],
        limit: 50,
      },
    })

    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('ufo-uap')
  })

  it('should handle empty results gracefully', async () => {
    const mockSupabase = createMockSupabaseClient([])

    const context = {
      supabase: mockSupabase,
      userId: 'test-user',
      locale: 'de',
    }

    const result = await unifiedSearchTool.execute({
      context,
      data: { limit: 50 },
    })

    expect(result).toEqual([])
  })

  it('should filter by location', async () => {
    // Test geographic filtering
  })

  it('should filter by time range', async () => {
    // Test temporal filtering
  })

  it('should validate input schema', async () => {
    // Test Zod schema validation
  })
})
```

### 1.2 Complexity Analysis Testing

```typescript
// test/utils/complexity.test.ts

import { describe, it, expect } from 'vitest'
import { analyzeQueryComplexity } from '@/lib/mastra/utils/complexity'

describe('analyzeQueryComplexity', () => {
  it('should return standard mode for simple queries', () => {
    const result = analyzeQueryComplexity('Show UFOs in Berlin')
    expect(result.score).toBeLessThan(0.5)
    expect(result.thinkingMode).toBe('standard')
  })

  it('should return extended mode for complex queries', () => {
    const result = analyzeQueryComplexity(
      'Compare dreams in Berlin vs Paris over time and analyze patterns'
    )
    expect(result.score).toBeGreaterThanOrEqual(0.5)
    expect(result.thinkingMode).toBe('extended')
  })

  it('should detect multi-tool indicators', () => {
    const result = analyzeQueryComplexity('Search and analyze and visualize')
    expect(result.score).toBeGreaterThan(0.3)
  })

  it('should detect comparison keywords', () => {
    const result = analyzeQueryComplexity('Compare dreams vs UFOs')
    expect(result.score).toBeGreaterThan(0.3)
  })

  it('should detect statistical keywords', () => {
    const result = analyzeQueryComplexity('Analyze patterns and correlations')
    expect(result.score).toBeGreaterThan(0.3)
  })
})
```

### 1.3 Context Creation Testing

```typescript
// test/utils/context.test.ts

import { describe, it, expect } from 'vitest'
import { createXPShareContext } from '@/lib/mastra/utils/context'
import { createMockSupabaseClient } from '../utils/mock-supabase'

describe('createXPShareContext', () => {
  it('should create valid context', () => {
    const mockSupabase = createMockSupabaseClient([])

    const context = createXPShareContext({
      supabase: mockSupabase,
      userId: 'test-user',
      locale: 'de',
    })

    expect(context.supabase).toBeDefined()
    expect(context.userId).toBe('test-user')
    expect(context.locale).toBe('de')
  })

  it('should default locale to "de"', () => {
    const mockSupabase = createMockSupabaseClient([])

    const context = createXPShareContext({
      supabase: mockSupabase,
      userId: 'test-user',
    })

    expect(context.locale).toBe('de')
  })
})
```

**Unit Testing Checklist:**
- [ ] All 8 tools tested with valid inputs
- [ ] All 8 tools tested with invalid inputs
- [ ] All 8 tools tested with empty results
- [ ] Complexity analysis tested with 10+ sample queries
- [ ] Context creation tested
- [ ] All tests passing (100% success rate)

---

## Phase 2: Integration Testing

### 2.1 API Route Testing

Test the full API route with mocked Mastra agent:

```typescript
// test/api/xpchat.test.ts

import { describe, it, expect, vi } from 'vitest'
import { POST, GET } from '@/app/api/xpchat/route'
import { NextRequest } from 'next/server'

describe('/api/xpchat', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/xpchat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid request body', async () => {
    // Mock authenticated user
    const request = new NextRequest('http://localhost:3000/api/xpchat', {
      method: 'POST',
      body: JSON.stringify({}), // Missing messages
      headers: {
        Cookie: 'sb-access-token=mock-token',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should stream response for valid request', async () => {
    // Mock authenticated user + Mastra agent
    const request = new NextRequest('http://localhost:3000/api/xpchat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test query' }],
      }),
      headers: {
        Cookie: 'sb-access-token=mock-token',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/event-stream')
  })

  it('should include thinking mode in headers', async () => {
    // Test that X-Thinking-Mode header is set correctly
  })

  it('should handle agent errors gracefully', async () => {
    // Mock Mastra agent throwing error
  })
})

describe('/api/xpchat GET', () => {
  it('should return health check', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.service).toBe('xpchat-api')
    expect(data.version).toBe('2.0')
  })
})
```

### 2.2 Agent-Tool Integration Testing

Test that agent correctly calls tools:

```typescript
// test/integration/agent-tools.test.ts

import { describe, it, expect } from 'vitest'
import { mastra } from '@/lib/mastra'
import { createXPShareContext } from '@/lib/mastra/utils/context'

describe('XPChat Agent Tool Integration', () => {
  it('should call unifiedSearch for search queries', async () => {
    const context = createMockXPShareContext()

    const messages = [
      { role: 'user', content: 'Show UFOs in Berlin' },
    ]

    const stream = await mastra.getAgent('xpchat').stream(messages, {
      runtimeContext: context,
    })

    // Collect stream events
    const events = []
    for await (const chunk of stream) {
      events.push(chunk)
    }

    // Verify tool was called
    const toolCalls = events.filter((e) => e.type === 'tool-call')
    expect(toolCalls).toHaveLength(1)
    expect(toolCalls[0].toolName).toBe('unifiedSearch')
  })

  it('should chain multiple tools for complex queries', async () => {
    // Test multi-tool execution
  })

  it('should use Extended Thinking for complex queries', async () => {
    // Test Extended Thinking activation
  })
})
```

**Integration Testing Checklist:**
- [ ] API route auth works
- [ ] API route validates input
- [ ] API route returns SSE stream
- [ ] Agent calls correct tools
- [ ] Tools receive RLS context
- [ ] Extended Thinking triggers correctly
- [ ] Memory works with threadId
- [ ] All integration tests passing

---

## Phase 3: End-to-End Testing

### 3.1 Manual Testing Scenarios

Use Browser MCP or manual browser testing:

#### Scenario 1: Simple Search Query
```
1. Navigate to /xpchat
2. Enter: "Zeig mir UFO Sichtungen in Berlin"
3. Press Enter
4. Verify:
   - Loading indicator appears
   - Tool call shows "unifiedSearch"
   - Results render as cards
   - Response time < 5s
   - No errors in console
```

#### Scenario 2: Complex Multi-Tool Query
```
1. Navigate to /xpchat
2. Enter: "Compare dreams in Berlin vs Paris and show on a timeline"
3. Press Enter
4. Verify:
   - Extended Thinking indicator shows
   - Multiple tool calls executed
   - Timeline chart renders
   - Response time < 15s
   - No errors in console
```

#### Scenario 3: Conversation Memory
```
1. Navigate to /xpchat
2. Enter: "Show UFOs in Germany"
3. Wait for response
4. Enter: "Now show them on a map"
5. Verify:
   - Agent uses context from previous query
   - Map renders with German UFOs
   - No duplicate search
```

#### Scenario 4: Error Handling
```
1. Navigate to /xpchat
2. Disconnect internet
3. Enter query
4. Verify:
   - Error message displays
   - Retry button works
   - UI doesn't crash
```

### 3.2 Automated E2E Testing

Use Playwright or Cypress:

```typescript
// e2e/xpchat.spec.ts

import { test, expect } from '@playwright/test'

test.describe('XPChat E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to XPChat
    await page.goto('/xpchat')
  })

  test('should send message and receive response', async ({ page }) => {
    await page.fill('textarea', 'Show UFOs in Berlin')
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForSelector('.message[role="article"]', { timeout: 10000 })

    // Verify response
    const messages = await page.locator('.message[role="article"]').count()
    expect(messages).toBeGreaterThan(1) // User + assistant
  })

  test('should render visualization', async ({ page }) => {
    await page.fill('textarea', 'Show UFOs on a map')
    await page.click('button[type="submit"]')

    // Wait for map
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 })

    // Verify map rendered
    const map = await page.locator('.mapboxgl-map')
    expect(map).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate error by sending invalid query or mocking API failure
  })
})
```

**E2E Testing Checklist:**
- [ ] Simple queries work end-to-end
- [ ] Complex queries work end-to-end
- [ ] Visualizations render correctly
- [ ] Conversation memory works
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility (keyboard nav)

---

## Phase 4: Performance Testing

### 4.1 Token Usage Measurement

```typescript
// test/performance/token-usage.test.ts

import { describe, it, expect } from 'vitest'
import { analyzeQueryComplexity } from '@/lib/mastra/utils/complexity'
import { estimateTokens } from '@/lib/utils/token-counter'

describe('Token Usage', () => {
  const testQueries = [
    'Show UFOs in Berlin',
    'Analyze dreams over time',
    'Compare UFOs vs dreams in Europe',
    'Create a dashboard of all experiences',
    'Find similar experiences to mine',
    'Show temporal trends',
    'Generate a network graph',
    'What are the top patterns?',
    'Visualize on a map',
    'Compare Berlin vs Paris',
  ]

  it('should average < 3,500 tokens per request', async () => {
    const agentInstructions = await readFile('lib/mastra/agents/xpchat-agent.ts')
    const instructionTokens = estimateTokens(agentInstructions)

    console.log('Agent Instructions:', instructionTokens, 'tokens')

    expect(instructionTokens).toBeLessThan(650)

    // Test average across queries
    const results = testQueries.map((query) => {
      const { score, thinkingMode } = analyzeQueryComplexity(query)
      const extendedThinkingTokens = thinkingMode === 'extended' ? 500 : 0

      const totalEstimate =
        instructionTokens + // Agent instructions
        790 + // Tool definitions (8 tools)
        estimateTokens(query) + // User query
        500 + // Estimated response
        extendedThinkingTokens

      return {
        query,
        tokens: totalEstimate,
        thinkingMode,
      }
    })

    const avgTokens =
      results.reduce((sum, r) => sum + r.tokens, 0) / results.length

    console.log('Average tokens/request:', avgTokens)
    console.log('Results:', results)

    expect(avgTokens).toBeLessThan(3500) // Must have target
    expect(avgTokens).toBeLessThan(3000) // Nice to have target
  })
})
```

### 4.2 Response Time Measurement

```typescript
// test/performance/response-time.test.ts

import { describe, it, expect } from 'vitest'

describe('Response Times', () => {
  it('simple queries should respond in < 5s', async () => {
    const start = Date.now()

    const response = await fetch('http://localhost:3000/api/xpchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'sb-access-token=MOCK_TOKEN',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show UFOs in Berlin' }],
      }),
    })

    // Wait for first chunk
    const reader = response.body!.getReader()
    await reader.read()

    const duration = Date.now() - start

    expect(duration).toBeLessThan(5000)
  })

  it('complex queries should respond in < 15s', async () => {
    const start = Date.now()

    const response = await fetch('http://localhost:3000/api/xpchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'sb-access-token=MOCK_TOKEN',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Compare dreams in Berlin vs Paris and show on timeline',
          },
        ],
      }),
    })

    // Wait for stream to complete
    const reader = response.body!.getReader()
    while (true) {
      const { done } = await reader.read()
      if (done) break
    }

    const duration = Date.now() - start

    expect(duration).toBeLessThan(15000)
  })
})
```

### 4.3 Load Testing

Test with multiple concurrent requests:

```bash
# Using Apache Bench
ab -n 100 -c 10 -p query.json -T application/json http://localhost:3000/api/xpchat

# Using k6
k6 run load-test.js
```

```javascript
// load-test.js (k6)

import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
}

export default function () {
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'Show UFOs in Berlin' }],
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'sb-access-token=MOCK_TOKEN',
    },
  }

  const res = http.post('http://localhost:3000/api/xpchat', payload, params)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  })

  sleep(1)
}
```

**Performance Testing Checklist:**
- [ ] Token usage < 3,500/request (avg)
- [ ] Token usage < 3,000/request (nice-to-have)
- [ ] Agent instructions < 650 tokens
- [ ] Tool definitions < 800 tokens
- [ ] Simple queries < 5s response time
- [ ] Complex queries < 15s response time
- [ ] Handles 10 concurrent users (Build Tier)
- [ ] Cost < $1/1000 requests

---

## Phase 5: User Acceptance Testing

### 5.1 Beta Testing

1. Recruit 5-10 beta testers
2. Provide access to staging environment
3. Give testing scenarios + free exploration
4. Collect feedback via form:

**Feedback Form:**
```markdown
1. How intuitive was XPChat? (1-5)
2. Were responses relevant? (1-5)
3. Were visualizations helpful? (1-5)
4. Response speed acceptable? (1-5)
5. Did you encounter errors? (Yes/No)
6. What worked well?
7. What needs improvement?
8. Would you use this feature? (Yes/No)
```

### 5.2 Success Criteria

**Must Have:**
- ✅ 80%+ users rate intuitiveness as 4-5/5
- ✅ 80%+ users rate relevance as 4-5/5
- ✅ 70%+ users rate speed as acceptable
- ✅ < 10% error rate
- ✅ 70%+ users would use feature

**Nice to Have:**
- 🎯 90%+ users rate intuitiveness as 4-5/5
- 🎯 90%+ users rate relevance as 4-5/5
- 🎯 80%+ users rate speed as 4-5/5
- 🎯 < 5% error rate
- 🎯 80%+ users would use feature

---

## Test Data

### Mock Experiences

Create test dataset:

```sql
-- Insert test data for consistent testing
INSERT INTO experiences (user_id, title, category, content, location_text, location_point)
VALUES
  ('test-user', 'UFO over Berlin', 'ufo-uap', 'Saw bright light...', 'Berlin, Germany', ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326)),
  ('test-user', 'Dream of flying', 'dreams', 'I was flying...', 'Paris, France', ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)),
  -- ... 50+ more test experiences
```

---

## CI/CD Integration

Add tests to GitHub Actions:

```yaml
# .github/workflows/test.yml

name: Test XPChat

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build

      # E2E tests (optional)
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Testing Timeline

| Phase | Duration | When |
|-------|----------|------|
| Unit Testing | 2-3 hours | After tool implementation |
| Integration Testing | 1-2 hours | After API route implementation |
| E2E Testing | 1-2 hours | After frontend implementation |
| Performance Testing | 1-2 hours | Before deployment |
| UAT | 2-3 days | Before production launch |

---

## Bug Tracking

Use GitHub Issues with labels:

- `bug` - Something broken
- `performance` - Speed/token usage issue
- `ux` - User experience problem
- `critical` - Blocks deployment
- `nice-to-have` - Can be fixed later

---

## Next Steps

After testing phase:

1. ✅ Fix all critical bugs
2. ✅ Optimize performance bottlenecks
3. ✅ Document known limitations
4. ⏸️ Prepare deployment (see `08-DEPLOYMENT.md`)

---

**Status:** Ready for Implementation ✅
