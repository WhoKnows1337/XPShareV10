# XPChat 2.0 - Architectural Decision Record

**Last Updated:** 2025-10-24

---

## Decision Log

This document records all major architectural decisions made during XPChat 2.0 design and implementation.

---

## ADR-001: Use Mastra with .stream() Instead of .network()

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Agent Network v3 was consuming 8,500 tokens/request, hitting Anthropic's 20k tokens/min rate limit after just 2 queries. This made the system:
- Too expensive ($2.55/100 requests)
- Unable to scale (only 2-3 concurrent users on free tier)
- Too slow for production use

### Decision

Use Mastra framework with `.stream()` instead of `.network()` for XPChat 2.0.

### Rationale

**Why Mastra?**
- ✅ Type-safe tool framework (compile-time errors)
- ✅ RLS-safe context injection (automatic Supabase client)
- ✅ Multi-provider support (easy to switch models)
- ✅ Built-in memory (optional conversation history)
- ✅ Observability (telemetry & tracing)

**Why .stream() over .network()?**
- ✅ **User-driven**: User controls tool chaining (no autonomous multi-step)
- ✅ **Cheaper**: ~2,900 tokens/request vs. 8,500 (-66%)
- ✅ **Same features**: Tools, streaming, Extended Thinking all available
- ✅ **Optional memory**: Only when threadId provided (no overhead)
- ✅ **Faster**: No network coordination overhead

### Consequences

**Positive:**
- 70% token reduction (8,500 → 2,900)
- 66% cost reduction ($2.55 → $0.87 per 100 requests)
- 400% scalability improvement (2-3 → 10-25 concurrent users on Build Tier)
- Simpler debugging and maintenance

**Negative:**
- User must provide follow-up prompts (not fully autonomous)
- Requires good agent instructions for multi-step reasoning

**Mitigation:**
- Clear agent instructions guide multi-step tasks
- Extended Thinking helps with complex queries

### Alternatives Considered

1. **Keep Agent Network v3**
   - ❌ Too expensive
   - ❌ Can't scale
   - ✅ Fully autonomous
   - **Verdict:** Rejected

2. **Switch to OpenAI Assistants API**
   - ✅ Similar to Agent Network
   - ❌ Vendor lock-in
   - ❌ Less control over tools
   - **Verdict:** Rejected

3. **Custom LangChain implementation**
   - ✅ Maximum flexibility
   - ❌ More code to maintain
   - ❌ No built-in memory or observability
   - **Verdict:** Rejected

---

## ADR-002: Keep Extended Thinking Mode

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Extended Thinking adds ~500 tokens per request (17% overhead). User initially questioned whether this was worth keeping.

### Decision

Keep Extended Thinking, but make it **adaptive** based on query complexity.

### Rationale

**Why Keep It?**
- ✅ Only 17% extra cost (~$0.0015 per request)
- ✅ **Significantly better reasoning quality** for complex queries
- ✅ Transparency: Users see how agent thinks
- ✅ Better multi-step planning

**Why Adaptive?**
- ✅ Simple queries don't need 10s thinking (use 3s standard mode)
- ✅ Complex queries benefit from 10s extended mode
- ✅ Optimizes cost while maintaining quality

### Complexity Analysis Algorithm

```typescript
function analyzeQueryComplexity(message: string) {
  let score = 0.3 // Base score

  // Multi-tool indicators (+0.2)
  if (hasMultiToolKeywords(message)) score += 0.2

  // Geographic + Temporal (+0.15)
  if (hasLocationAndTime(message)) score += 0.15

  // Statistical analysis (+0.2)
  if (hasStatisticalKeywords(message)) score += 0.2

  // Comparison keywords (+0.15)
  if (hasComparisonKeywords(message)) score += 0.15

  // Threshold: >= 0.5 = Extended Mode
  return { score, thinkingMode: score >= 0.5 ? 'extended' : 'standard' }
}
```

### Consequences

**Positive:**
- High quality for complex queries
- Low cost for simple queries
- Transparent reasoning

**Negative:**
- Slightly longer response times for complex queries (+2-3s)
- 17% extra cost on average

**Metrics:**
- Standard mode (70% of queries): 3s budget, ~2,400 tokens
- Extended mode (30% of queries): 10s budget, ~2,900 tokens
- Average: ~2,550 tokens/request

### Alternatives Considered

1. **Always use Extended Thinking**
   - ✅ Best quality
   - ❌ 17% extra cost on all queries
   - **Verdict:** Rejected (unnecessary for simple queries)

2. **Never use Extended Thinking**
   - ✅ Lowest cost
   - ❌ Poor quality for complex queries
   - **Verdict:** Rejected (quality matters)

3. **Let user choose**
   - ✅ Maximum control
   - ❌ UX friction (most users won't know)
   - **Verdict:** Rejected (complexity analysis better UX)

---

## ADR-003: Consolidate 15 Tools into 8 Unified Tools

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Agent Network v3 had 15 specialized tools consuming ~3,000 tokens in tool definitions alone. This was a major contributor to the 8,500 tokens/request problem.

### Decision

Consolidate into 8 tools:
1. **unifiedSearch** (merges 5 search tools)
2. **visualize** (merges 4 viz tools)
3. **analyze** (merges 4 analytics tools)
4. **insights** (keep specialized)
5. **trends** (keep specialized)
6. **connections** (keep specialized)
7. **patterns** (keep specialized)
8. **userStats** (replaces rankUsers)

### Rationale

**Search Tools (5 → 1)**
- Old: advancedSearch, searchByAttributes, geoSearch, fullTextSearch, semanticSearch
- New: **unifiedSearch** with optional parameters
- Saves: ~1,500 tokens

**Visualization Tools (4 → 1)**
- Old: generateMap, generateTimeline, generateNetwork, generateDashboard
- New: **visualize** with `type` parameter
- Saves: ~800 tokens

**Analytics Tools (4 → 1)**
- Old: temporalAnalysis, analyzeCategory, compareCategories, attributeCorrelation
- New: **analyze** with `mode` parameter
- Saves: ~600 tokens

**Specialized Tools (Keep 4, Remove 2)**
- Keep: insights, trends, connections, patterns (unique capabilities)
- Remove: suggestFollowups (agent can do naturally), exportResults (not MVP)
- Saves: ~200 tokens

**Total Savings: ~3,100 tokens (74% reduction)**

### Consequences

**Positive:**
- 74% reduction in tool definition tokens (3,000 → 790)
- Simpler agent instructions (fewer tools to describe)
- Easier to maintain
- Clearer purpose for each tool

**Negative:**
- More complex tool implementations (need to handle multiple modes)
- Agent must choose correct mode/type parameter

**Mitigation:**
- Clear tool descriptions with mode/type examples
- Zod schema validation ensures correct parameters
- Extended Thinking helps with mode selection

### Alternatives Considered

1. **Keep all 15 tools**
   - ✅ Simpler implementations
   - ❌ 3,000 tokens overhead
   - **Verdict:** Rejected (too expensive)

2. **Merge into 3 mega-tools** (search, visualize, analyze)
   - ✅ Even fewer tokens
   - ❌ Too complex, loses clarity
   - **Verdict:** Rejected (diminishing returns)

3. **Use tool descriptions in agent memory instead of definitions**
   - ✅ Lower token count
   - ❌ Agent can't discover available tools
   - **Verdict:** Rejected (breaks tool discovery)

---

## ADR-004: Optimize Agent Instructions to 600 Tokens

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Agent Network v3 instructions were ~4,500 tokens - 53% of total request overhead. The instructions contained:
- Verbose tool descriptions (redundant with tool schemas)
- Detailed examples for each tool
- 200+ lines of text

### Decision

Reduce instructions to ~600 tokens by:
- Removing redundant tool descriptions (use schemas)
- Keeping only 1-line tool summaries
- Focusing on purpose and strategy
- Concise guidelines (3-5 bullet points)

### Instruction Structure

```
1. Purpose (2-3 sentences)               ~80 tokens
2. Tool List (8 × 20 tokens)            ~160 tokens
3. Response Strategy                    ~200 tokens
   - Simple queries: 1-2 tools
   - Complex queries: Chain tools
4. Always Guidelines (3-5 bullets)      ~100 tokens
5. Data Access Notes (RLS, privacy)      ~60 tokens
────────────────────────────────────────────────
Total:                                  ~600 tokens
```

### Consequences

**Positive:**
- 87% reduction (4,500 → 600)
- Faster to read and understand
- Easier to maintain and update
- Agent still performs well (Extended Thinking compensates)

**Negative:**
- Less hand-holding for agent
- Requires Extended Thinking for complex tasks

**Metrics:**
- v3: 4,500 tokens (53% of request)
- v2: 600 tokens (21% of request)
- Savings: 3,900 tokens per request

### Alternatives Considered

1. **Keep detailed instructions**
   - ✅ Maximum clarity
   - ❌ 4,500 tokens overhead
   - **Verdict:** Rejected (too expensive)

2. **Use minimal instructions (100-200 tokens)**
   - ✅ Lowest overhead
   - ❌ Agent struggles with edge cases
   - **Verdict:** Rejected (quality suffers)

3. **Dynamic instructions based on query**
   - ✅ Optimal per-query
   - ❌ Complex to implement and maintain
   - **Verdict:** Rejected (over-engineering)

---

## ADR-005: Use Optional Memory with ThreadId

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Conversation memory adds overhead (storing/retrieving messages) but enables multi-turn conversations.

### Decision

Make memory **optional** - only activate when `threadId` is provided.

### Implementation

```typescript
// With memory (multi-turn)
const stream = await agent.stream(messages, {
  runtimeContext,
  memory: {
    thread: { id: threadId },
    resource: userId
  }
})

// Without memory (stateless)
const stream = await agent.stream(messages, {
  runtimeContext
})
```

### Rationale

**When Memory Helps:**
- ✅ Follow-up questions ("show me more")
- ✅ Context retention ("compare that to...")
- ✅ Complex multi-turn tasks

**When Memory Hurts:**
- ❌ Simple one-off queries (unnecessary overhead)
- ❌ Token usage (previous messages included)
- ❌ Slower responses (DB lookups)

### Consequences

**Positive:**
- Flexible: Use when needed, skip when not
- Optimal token usage for simple queries
- Faster simple queries (no DB lookups)

**Negative:**
- Agent can't remember previous queries without threadId
- User must provide threadId for conversation

**Metrics:**
- Simple query without memory: ~2,400 tokens
- Simple query with memory (3 messages): ~3,200 tokens
- Memory overhead: ~800 tokens (33%)

### Alternatives Considered

1. **Always use memory**
   - ✅ Seamless multi-turn
   - ❌ 33% token overhead on all queries
   - **Verdict:** Rejected (too expensive)

2. **Never use memory**
   - ✅ Lowest cost
   - ❌ No follow-up capabilities
   - **Verdict:** Rejected (UX suffers)

3. **Automatic memory detection**
   - ✅ Smart behavior
   - ❌ Complex heuristics, unpredictable
   - **Verdict:** Rejected (explicit better)

---

## ADR-006: Use Claude 3.7 Sonnet (Not Haiku or Opus)

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Anthropic offers 3 models:
- Haiku: Fast, cheap, lower quality
- Sonnet: Balanced quality/speed/cost
- Opus: Highest quality, slow, expensive

### Decision

Use **Claude 3.7 Sonnet** with Extended Thinking for XPChat.

### Rationale

| Criteria | Haiku | Sonnet | Opus |
|----------|-------|--------|------|
| Quality | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Speed | Fast (1-2s) | Medium (3-5s) | Slow (8-12s) |
| Cost | $$ | $$$ | $$$$$ |
| Tool Use | Basic | Excellent | Excellent |
| Extended Thinking | ❌ No | ✅ Yes | ✅ Yes |

**Why Sonnet:**
- ✅ Excellent tool selection
- ✅ Good reasoning quality
- ✅ Extended Thinking support
- ✅ Reasonable cost ($3/1M tokens)
- ✅ Fast enough for production

**Why Not Haiku:**
- ❌ No Extended Thinking
- ❌ Weaker tool use
- ❌ Lower quality reasoning

**Why Not Opus:**
- ❌ 3× cost of Sonnet
- ❌ 2× slower
- ✅ Only marginally better quality

### Consequences

**Metrics:**
- Cost: $3 per 1M input tokens
- Quality: 4/5 (excellent for production)
- Speed: 3-5s for simple, 10-15s for complex
- Value: Best quality/cost ratio

### Alternatives Considered

1. **GPT-4 Turbo**
   - ✅ Good quality
   - ❌ No Extended Thinking
   - ❌ Weaker tool use
   - **Verdict:** Rejected

2. **Claude 3.5 Sonnet (older)**
   - ✅ Cheaper
   - ❌ No Extended Thinking
   - ❌ Lower quality
   - **Verdict:** Rejected

3. **Gemini 2.0**
   - ✅ Fast
   - ❌ Less mature tool use
   - ❌ Different API
   - **Verdict:** Rejected (stick with Anthropic)

---

## ADR-007: Deploy to Vercel (Not Self-Hosted)

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Need to choose deployment platform for XPChat 2.0.

### Decision

Deploy to **Vercel** (current platform).

### Rationale

**Why Vercel:**
- ✅ Already hosting XPShare
- ✅ Zero-config Next.js deployment
- ✅ Automatic SSL, CDN, edge functions
- ✅ SSE streaming support
- ✅ Easy environment variable management
- ✅ GitHub integration (auto-deploy)
- ✅ Rollback capability

**Why Not Self-Hosted:**
- ❌ More DevOps overhead
- ❌ Need to manage SSL, CDN, scaling
- ❌ Higher maintenance burden

### Consequences

**Positive:**
- Fast deployment
- Auto-scaling
- Monitoring built-in
- Low maintenance

**Negative:**
- Vendor lock-in (mitigated by Next.js portability)
- Function time limits (120s max)

**Cost:**
- Build Tier: $20/month
- Covers 10-25 concurrent users

### Alternatives Considered

1. **AWS (Fargate + API Gateway)**
   - ✅ Maximum control
   - ❌ Complex setup
   - ❌ More expensive
   - **Verdict:** Rejected (over-engineering)

2. **Cloudflare Workers**
   - ✅ Edge deployment
   - ❌ Different deployment model
   - ❌ Migration effort
   - **Verdict:** Rejected (not worth migration)

3. **Railway / Render**
   - ✅ Simple deployment
   - ❌ Less mature than Vercel for Next.js
   - **Verdict:** Rejected (Vercel better for Next.js)

---

## ADR-008: Use Server-Sent Events (Not WebSockets)

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

Need to stream agent responses to client in real-time.

### Decision

Use **Server-Sent Events (SSE)** with AI SDK's `toDataStreamResponse()`.

### Rationale

**Why SSE:**
- ✅ Built into AI SDK
- ✅ Simpler than WebSockets (HTTP-based)
- ✅ Auto-reconnect on disconnect
- ✅ Works with Vercel Functions
- ✅ No connection management needed

**Why Not WebSockets:**
- ❌ More complex (need socket server)
- ❌ Connection management overhead
- ❌ Not necessary (uni-directional streaming)

### Implementation

```typescript
// Server
const stream = await agent.stream(messages, { runtimeContext })
return stream.toDataStreamResponse()

// Client (AI SDK)
const { messages } = useChat({
  api: '/api/xpchat',
  streamProtocol: 'data'
})
```

### Consequences

**Positive:**
- Simple implementation
- Reliable streaming
- Built-in retry logic
- Works on all browsers

**Negative:**
- Uni-directional only (server → client)
- Slightly higher latency than WebSockets

**Verdict:** SSE perfect for agent streaming use-case

### Alternatives Considered

1. **WebSockets**
   - ✅ Bi-directional
   - ❌ More complex
   - ❌ Not needed for our use-case
   - **Verdict:** Rejected (over-engineering)

2. **Polling**
   - ✅ Simplest
   - ❌ Higher latency
   - ❌ More server load
   - **Verdict:** Rejected (SSE better)

---

## Summary of Key Decisions

| # | Decision | Impact | Status |
|---|----------|--------|--------|
| 001 | Use Mastra .stream() | -66% tokens, -66% cost | ✅ Accepted |
| 002 | Keep Extended Thinking (adaptive) | +17% cost, much better quality | ✅ Accepted |
| 003 | Consolidate 15 → 8 tools | -74% tool tokens | ✅ Accepted |
| 004 | Optimize instructions to 600 tokens | -87% instruction tokens | ✅ Accepted |
| 005 | Optional memory with threadId | Flexible overhead | ✅ Accepted |
| 006 | Use Claude 3.7 Sonnet | Best quality/cost ratio | ✅ Accepted |
| 007 | Deploy to Vercel | Zero-config, auto-scaling | ✅ Accepted |
| 008 | Use SSE (not WebSockets) | Simple streaming | ✅ Accepted |
| 009 | Transform to Discovery-First UX | +40% engagement, +30% retention, +38 tasks | ✅ Accepted |

---

## ADR-009: Transform XPChat to Discovery-First Experience

**Date:** 2025-10-24
**Status:** ✅ Accepted
**Deciders:** Tom, Claude Code

### Context

After comprehensive UI/UX analysis using Extended Thinking, we identified 5 critical problems with XPChat 2.0:

1. **Zero Onboarding** - Users land on empty chat with no guidance
2. **Visualization Overload** - 11 components when 5 would suffice
3. **No Pattern Persistence** - Discovered patterns disappear after chat
4. **Passive Agent** - Only responds to explicit queries
5. **Untested Mobile UX** - Complex visualizations likely broken on mobile

These issues would result in:
- High bounce rate (estimated 60%+)
- Low retention (users don't return)
- Poor mobile experience
- No viral loop (can't share discoveries)

### Decision

Implement comprehensive UI/UX improvements across 4 dimensions:

1. **Welcome Screen Onboarding** - CategoryCards + Popular Discoveries
2. **Component Consolidation** - 11 → 5 visualization components
3. **Pattern Library** - Save, organize, share discovered patterns
4. **Proactive Insights** - AI detects patterns and suggests visualizations

### Rationale

#### 1. Welcome Screen Onboarding

**Problem:** Users don't know what XPChat can do
**Solution:** WelcomeOverlay with 6 CategoryCards (UFOs, Dreams, NDEs, etc.)

**Implementation:**
- Hero section with gradient heading
- 6 interactive category cards with example queries
- Popular Discoveries section (trending patterns)
- Disappears after first message

**Expected Impact:** +40% engagement, -30% bounce rate

#### 2. Component Consolidation (11 → 5)

**Problem:** Too many components, inconsistent UX
**Solution:** Merge related components

**Consolidation Strategy:**
- **ExperienceCards** (unified): Merges ResultsList + ConnectionsView + PatternsView
- **MapView** (enhanced): Mobile fallbacks (static preview + location list)
- **TimelineView** (enhanced): Merges TrendsView, adds annotations
- **NetworkView** (enhanced): Mobile fallback (hierarchical list)
- **InsightsPanel** (unified): Merges DashboardView + AnalysisView + InsightsView + UserStatsView

**Expected Impact:** Simpler codebase, consistent UX, easier cross-cutting features

#### 3. Pattern Library

**Problem:** Patterns disappear, no retention, no viral loop
**Solution:** Save/organize/share feature

**Implementation:**
- Database schema: `patterns` + `pattern_tags` tables
- 6 RLS policies (own patterns + public patterns)
- 3 API routes: save, list, share
- Frontend: PatternsPage + PatternCard + PatternDetailModal
- SavePatternButton in all visualizations
- Share flow with nanoid tokens
- Export (CSV/JSON)

**Viral Loop:**
1. User discovers pattern → Saves it
2. Shares public link → Non-user views pattern
3. CTA to sign up → New user discovers patterns
4. New user shares → Loop repeats

**Expected Impact:** +30% retention, viral growth activation

#### 4. Proactive Insights

**Problem:** Agent only responds to explicit queries
**Solution:** Detect "Aha Moments" and suggest visualizations

**Implementation:**
- `detectAhaMoments()` function with 4 detection algorithms:
  1. **Wave Detection**: Geographic clustering (DBSCAN-like, 50km radius, min 5 experiences)
  2. **Temporal Correlation**: Peak hour detection (>70% in specific timeframe)
  3. **Geographic Hotspots**: Grid-based density (>2× average density)
  4. **Pattern Matching**: Recurring keywords (>20% occurrence)

**Example:**
```
Agent: "🌊 Ich habe eine Welle entdeckt: 3 geografische Cluster gefunden!"
Action: [Auf Karte zeigen]
```

**Expected Impact:** Agent becomes discovery guide, users find patterns they didn't search for

### Consequences

**Positive:**
- **Engagement:** +40% expected (onboarding + proactive insights)
- **Retention:** +30% expected (pattern library)
- **Mobile:** -50% bounce rate (mobile fallbacks)
- **Viral Loop:** Share → signup → share cycle activated
- **Maintainability:** 11 → 5 components easier to maintain
- **Consistency:** Unified components = consistent UX

**Negative:**
- **Development Time:** +38 tasks (Phase 8: 18 tasks, Phase 9: 20 tasks)
- **Complexity:** Pattern sharing requires careful RLS setup
- **Token Usage:** Proactive insights add ~100-200 tokens per detection

**Mitigation:**
- Phased rollout (Phase 8 → Phase 9)
- Proactive insights only trigger on significant patterns (thresholds)
- Pattern library optional (doesn't block core chat)

### Mobile-First Strategy

**MapView:**
- Desktop: Interactive Mapbox map
- Mobile: Static preview + location list + "Open fullscreen" button

**NetworkView:**
- Desktop: Force-directed graph (D3.js)
- Mobile: Hierarchical list view with expand/collapse

**All Components:**
- Responsive breakpoints (sm/md/lg/xl)
- Touch-optimized interactions
- Swipe gestures where appropriate

### Technical Decisions

1. **Pattern Share Tokens:** Use `nanoid(10)` for short, unique URLs
2. **Geographic Clustering:** DBSCAN-like algorithm with Haversine distance
3. **Proactive Detection:** Run after tool execution, non-blocking
4. **Component Architecture:** Use composition (smaller reusable components)
5. **Mobile Fallbacks:** Progressive enhancement (full features on desktop, adapted on mobile)

### Alternatives Considered

1. **Skip Onboarding, Add Tutorial Instead**
   - ✅ Less intrusive
   - ❌ Tutorials are often skipped
   - ❌ Doesn't showcase capabilities immediately
   - **Verdict:** Rejected (welcome screen better)

2. **Keep All 11 Components**
   - ✅ Simpler implementations
   - ❌ Maintenance overhead
   - ❌ Inconsistent UX
   - **Verdict:** Rejected (consolidation better)

3. **Pattern Library as Separate App**
   - ✅ Cleaner separation
   - ❌ More complex to build
   - ❌ Worse UX (need to switch apps)
   - **Verdict:** Rejected (integrated better)

4. **Always Show Proactive Insights**
   - ✅ Maximum discovery
   - ❌ Annoying for simple queries
   - ❌ Higher token usage
   - **Verdict:** Rejected (only show significant patterns)

### Success Metrics (First 30 Days)

**Engagement:**
- [ ] >60% users click a CategoryCard on first visit
- [ ] >30% users receive at least 1 proactive insight
- [ ] Average session time >3 minutes

**Retention:**
- [ ] >20% users save at least 1 pattern
- [ ] >10% users return within 7 days
- [ ] >5% users share a pattern

**Mobile:**
- [ ] Mobile bounce rate <40% (down from ~60%)
- [ ] Mobile session time >2 minutes
- [ ] >50% mobile visualizations render correctly

**Viral Loop:**
- [ ] >5 patterns shared publicly
- [ ] >2 signups via shared patterns

### Implementation Plan

**Phase 8: UI/UX Enhancements (18 tasks)**
- 8.1 Welcome Screen Onboarding (7 tasks)
- 8.2 CategoryCard Component (6 tasks)
- 8.3 ProactiveInsight Component (6 tasks)

**Phase 9: Pattern Library (20 tasks)**
- 9.1 Database Setup (6 tasks)
- 9.2 API Routes (6 tasks)
- 9.3 Frontend Components (6 tasks)
- 9.4 Share & Export Features (6 tasks)

**Total:** 38 new tasks added to TODO.md

---

## Future Decisions (To Be Made)

### Under Consideration

1. **ADR-010: Add Rate Limiting?**
   - When: Before public launch
   - Options: Upstash Ratelimit, custom middleware
   - Impact: Prevent abuse, protect API costs

2. **ADR-011: Add Caching Layer?**
   - When: If high query overlap detected
   - Options: Redis, Vercel KV
   - Impact: Reduce costs, faster responses

3. **ADR-012: Add More Tools?**
   - When: Based on user feedback
   - Candidates: export, bookmark, annotation
   - Impact: More capabilities, more tokens

4. **ADR-013: Multi-Language Support?**
   - When: After v2.0 stable
   - Options: English, French, Spanish
   - Impact: Broader audience, more complexity

---

**Maintained By:** Tom, Claude Code
**Review Cycle:** Monthly
**Next Review:** 2025-11-24
