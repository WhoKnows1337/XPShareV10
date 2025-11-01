# XPChat 2.0 - Implementation Checklist

**Last Updated:** 2025-10-24
**Status:** Not Started
**Progress:** 0/68 tasks completed

---

## Phase 1: Tool Optimization (14 tasks)

### 1.1 Create Unified Search Tool
- [ ] Create `lib/mastra/tools/unified-search.ts`
- [ ] Import Supabase types and helpers
- [ ] Define tool schema with z.object (text, category, location, timeRange, attributes, semantic, limit)
- [ ] Implement text search logic (full-text)
- [ ] Implement semantic search logic (pgvector)
- [ ] Implement geographic search logic (PostGIS radius & bbox)
- [ ] Implement temporal filtering (date ranges)
- [ ] Implement category-specific attribute filtering
- [ ] Implement result ranking & sorting
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Test search combinations
- [ ] Document usage examples
- [ ] **Token Target: ~150 tokens** (vs 5×200 = 1,000 tokens before)

### 1.2 Create Unified Visualize Tool
- [ ] Create `lib/mastra/tools/visualize.ts`
- [ ] Define tool schema with type parameter ('map' | 'timeline' | 'network' | 'dashboard')
- [ ] Implement map data generation (GeoJSON)
- [ ] Implement timeline data generation (time-series)
- [ ] Implement network data generation (nodes & edges)
- [ ] Implement dashboard data generation (metrics)
- [ ] Add visualization config options
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Document viz formats
- [ ] **Token Target: ~120 tokens** (vs 4×150 = 600 tokens before)

### 1.3 Create Unified Analyze Tool
- [ ] Create `lib/mastra/tools/analyze.ts`
- [ ] Define tool schema with mode parameter ('temporal' | 'category' | 'compare' | 'correlation')
- [ ] Implement temporal aggregation (hour/day/week/month)
- [ ] Implement category deep-dive analysis
- [ ] Implement cross-category comparison
- [ ] Implement attribute correlation detection
- [ ] Add statistical calculations
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Document analysis modes
- [ ] **Token Target: ~110 tokens** (vs 4×120 = 480 tokens before)

### 1.4 Create User Stats Tool
- [ ] Create `lib/mastra/tools/user-stats.ts`
- [ ] Define tool schema (minimal params)
- [ ] Query top contributors by experience count
- [ ] Calculate category diversity scores
- [ ] Calculate engagement metrics
- [ ] Format leaderboard data
- [ ] Add error handling
- [ ] **Token Target: ~80 tokens**

### 1.5 Review Specialized Tools (Keep Existing)
- [ ] Review `lib/mastra/tools/insights.ts` (keep as-is)
- [ ] Review `lib/mastra/tools/trends.ts` (keep as-is, or create if missing)
- [ ] Review `lib/mastra/tools/connections.ts` (keep as-is, or create if missing)
- [ ] Review `lib/mastra/tools/patterns.ts` (keep as-is, or create if missing)
- [ ] Verify all 4 tools use XPShareContext type
- [ ] Verify all 4 tools have concise descriptions (~80 tokens each)

**Phase 1 Checkpoint:**
- [ ] All 8 tools created/verified
- [ ] Total tool definition tokens < 1,200 (measure with token counter)
- [ ] All tools compile without errors
- [ ] Basic unit tests pass

---

## Phase 2: Agent Creation (10 tasks)

### 2.1 Create XPChat Agent
- [ ] Create `lib/mastra/agents/xpchat-agent.ts`
- [ ] Import all 8 tools
- [ ] Write optimized agent instructions (target: 600 tokens)
  - [ ] Define agent purpose (2-3 sentences)
  - [ ] List 8 tools with 1-line descriptions each
  - [ ] Define response strategy for simple queries
  - [ ] Define response strategy for complex queries
  - [ ] Add "Always" guidelines (3-5 bullet points)
  - [ ] Add data access notes (RLS, privacy)
- [ ] Configure Claude 3.7 Sonnet model
- [ ] Configure Extended Thinking (adaptive)
- [ ] Add Memory configuration (optional)
- [ ] Add temperature & other model settings
- [ ] Export agent
- [ ] Measure instruction token count (must be < 650)

### 2.2 Register Agent in Mastra Instance
- [ ] Open `lib/mastra/index.ts`
- [ ] Import xpchat-agent
- [ ] Add to agents object: `xpchat: xpchatAgent`
- [ ] Verify no conflicts with existing agents
- [ ] Test Mastra instance initialization

**Phase 2 Checkpoint:**
- [ ] Agent instructions < 650 tokens
- [ ] Agent compiles without errors
- [ ] Mastra instance includes xpchat agent
- [ ] Can call `mastra.getAgent('xpchat')`

---

## Phase 3: API Route (8 tasks)

### 3.1 Create XPChat API Route
- [ ] Create `app/api/xpchat/route.ts`
- [ ] Import necessary dependencies (Next.js, Mastra, Supabase)
- [ ] Implement POST handler
  - [ ] Auth: Get user from Supabase
  - [ ] Return 401 if not authenticated
  - [ ] Parse request body (messages, threadId, locale)
  - [ ] Validate messages array
  - [ ] Create RLS-safe RuntimeContext with createXPShareContext()
  - [ ] Analyze query complexity with analyzeQueryComplexity()
  - [ ] Call mastra.getAgent('xpchat').stream() with:
    - [ ] messages
    - [ ] runtimeContext
    - [ ] optional memory (if threadId provided)
    - [ ] modelSettings with Extended Thinking config
  - [ ] Return SSE stream with stream.toDataStreamResponse()
- [ ] Implement GET handler (health check)
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Export runtime config (nodejs, maxDuration: 120)

### 3.2 Create/Update Complexity Analysis
- [ ] Check if `analyzeQueryComplexity()` exists in codebase
- [ ] If not, create in `lib/mastra/utils/complexity.ts`
- [ ] Implement scoring algorithm:
  - [ ] Base score: 0.3
  - [ ] Multi-tool indicators: +0.2
  - [ ] Geographic + Temporal: +0.15
  - [ ] Statistical keywords: +0.2
  - [ ] Comparison keywords: +0.15
  - [ ] Return { score, thinkingMode, reason }
- [ ] Test complexity detection with sample queries

**Phase 3 Checkpoint:**
- [ ] API route responds to requests
- [ ] Auth works correctly
- [ ] Complexity analysis triggers Extended Thinking for complex queries
- [ ] SSE streaming works
- [ ] Can test with curl or Postman

---

## Phase 4: Frontend Page (12 tasks)

### 4.1 Create XPChat Page
- [ ] Create `app/[locale]/xpchat/page.tsx`
- [ ] Import AI SDK's useChat hook
- [ ] Configure useChat:
  - [ ] api: '/api/xpchat'
  - [ ] initialMessages with welcome message
  - [ ] streamProtocol: 'data'
- [ ] Create page layout:
  - [ ] Header with title/logo
  - [ ] Messages container (scrollable)
  - [ ] Input area (sticky bottom)
- [ ] Map messages to Message components
- [ ] Handle tool invocations rendering
- [ ] Add loading states
- [ ] Add error states
- [ ] Add TypeScript types
- [ ] Add responsive design (mobile/desktop)
- [ ] Add accessibility (ARIA labels, keyboard nav)
- [ ] Test page rendering

### 4.2 Create Message Component
- [ ] Create `components/xpchat/Message.tsx`
- [ ] Accept message prop (UIMessage type)
- [ ] Render user messages (right-aligned, blue)
- [ ] Render assistant messages (left-aligned, gray)
- [ ] Render thinking indicator (when Extended Thinking active)
- [ ] Render tool invocations (pass to ToolRenderer)
- [ ] Add message timestamps
- [ ] Add copy button
- [ ] Add markdown rendering (react-markdown)
- [ ] Add code syntax highlighting
- [ ] Style with Tailwind

### 4.3 Create Chat Input Component
- [ ] Create `components/xpchat/ChatInput.tsx`
- [ ] Accept value, onChange, onSubmit, loading props
- [ ] Create textarea with auto-resize
- [ ] Add submit button
- [ ] Add loading indicator
- [ ] Add example suggestions (3-5 preset queries)
- [ ] Handle Enter key (send), Shift+Enter (newline)
- [ ] Disable when loading
- [ ] Add placeholder text
- [ ] Style with Tailwind

### 4.4 Create Thinking Indicator Component
- [ ] Create `components/xpchat/ThinkingIndicator.tsx`
- [ ] Accept thinkingContent prop
- [ ] Render brain emoji 🧠
- [ ] Render thinking text
- [ ] Add pulsing animation
- [ ] Render in collapsed/expanded states
- [ ] Style with Tailwind

**Phase 4 Checkpoint:**
- [ ] Page loads without errors
- [ ] Can send messages
- [ ] Messages display correctly
- [ ] Input works (typing, submitting)
- [ ] Loading states show
- [ ] Mobile responsive

---

## Phase 5: Tool Visualization Components (14 tasks)

### 5.1 Create Tool Renderer
- [ ] Create `components/xpchat/ToolRenderer.tsx`
- [ ] Accept toolInvocation prop
- [ ] Route to correct visualization based on tool name:
  - [ ] 'unifiedSearch' → ResultsList
  - [ ] 'visualize' → MapView | TimelineView | NetworkView | DashboardView (based on type)
  - [ ] 'analyze' → AnalysisView
  - [ ] 'insights' → InsightsView
  - [ ] 'trends' → TrendsView
  - [ ] 'connections' → ConnectionsView
  - [ ] 'patterns' → PatternsView
  - [ ] 'userStats' → UserStatsView
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add TypeScript types

### 5.2 Create Results List Component (Reuse Existing)
- [ ] Check if `components/discover/ResultsList.tsx` exists
- [ ] If yes, export and reuse
- [ ] If no, create basic experience cards list
- [ ] Accept experiences[] prop
- [ ] Render cards with title, category, location, date
- [ ] Add hover effects
- [ ] Add click to expand
- [ ] Style with Tailwind

### 5.3 Create Map View Component (Reuse Existing)
- [ ] Check if Mapbox component exists in codebase
- [ ] If yes, export and reuse
- [ ] If no, create `components/xpchat/visualizations/MapView.tsx`:
  - [ ] Install react-map-gl if needed
  - [ ] Accept geoJSON prop
  - [ ] Render Mapbox map
  - [ ] Add markers from geoJSON
  - [ ] Add optional heatmap layer
  - [ ] Add zoom controls
  - [ ] Center on data bounds
- [ ] Style with Tailwind

### 5.4 Create Timeline View Component
- [ ] Create `components/xpchat/visualizations/TimelineView.tsx`
- [ ] Install recharts if needed
- [ ] Accept timelineData prop (array of {date, count})
- [ ] Render LineChart or AreaChart
- [ ] Add X-axis (time)
- [ ] Add Y-axis (count)
- [ ] Add tooltips
- [ ] Add responsive container
- [ ] Style with Tailwind

### 5.5 Create Network View Component
- [ ] Create `components/xpchat/visualizations/NetworkView.tsx`
- [ ] Install react-force-graph-2d or similar
- [ ] Accept networkData prop ({nodes[], links[]})
- [ ] Render force-directed graph
- [ ] Add node labels
- [ ] Add link weights
- [ ] Add zoom/pan
- [ ] Add node click handler
- [ ] Style with Tailwind

### 5.6 Create Dashboard View Component
- [ ] Create `components/xpchat/visualizations/DashboardView.tsx`
- [ ] Accept dashboardData prop (metrics object)
- [ ] Render metric cards in grid
- [ ] Add bar charts for distributions
- [ ] Add pie charts for categories
- [ ] Add number cards for totals
- [ ] Add responsive grid layout
- [ ] Style with Tailwind

### 5.7 Create Simple Data Views
- [ ] Create `components/xpchat/visualizations/AnalysisView.tsx` (table/cards)
- [ ] Create `components/xpchat/visualizations/InsightsView.tsx` (text + highlights)
- [ ] Create `components/xpchat/visualizations/TrendsView.tsx` (line chart)
- [ ] Create `components/xpchat/visualizations/ConnectionsView.tsx` (similarity cards)
- [ ] Create `components/xpchat/visualizations/PatternsView.tsx` (anomaly highlights)
- [ ] Create `components/xpchat/visualizations/UserStatsView.tsx` (leaderboard table)

**Phase 5 Checkpoint:**
- [ ] All visualizations render without errors
- [ ] Data displays correctly
- [ ] Interactive elements work (zoom, hover, click)
- [ ] Mobile responsive
- [ ] No console errors

---

## Phase 6: Testing & Optimization (10 tasks)

### 6.1 Unit Testing
- [ ] Test unifiedSearch tool with various params
- [ ] Test visualize tool with different types
- [ ] Test analyze tool with different modes
- [ ] Test complexity analysis with sample queries
- [ ] Test API route auth
- [ ] Test API route error handling
- [ ] Fix any bugs found

### 6.2 Integration Testing
- [ ] Test simple query end-to-end ("Show UFOs in Berlin")
- [ ] Test complex query end-to-end ("Compare dreams Berlin vs Paris and show on map")
- [ ] Test visualization rendering for all tool types
- [ ] Test Extended Thinking activation
- [ ] Test conversation memory (if implemented)
- [ ] Fix any bugs found

### 6.3 Performance Testing
- [ ] Measure token usage for 10 sample queries
- [ ] Verify average < 3,000 tokens/request
- [ ] Measure response times for simple queries (target < 5s)
- [ ] Measure response times for complex queries (target < 15s)
- [ ] Test with multiple concurrent requests (5-10)
- [ ] Identify bottlenecks
- [ ] Optimize slow queries

### 6.4 Token Optimization
- [ ] Count agent instruction tokens (target < 650)
- [ ] Count total tool definition tokens (target < 1,200)
- [ ] Identify verbose tool descriptions
- [ ] Shorten descriptions while keeping clarity
- [ ] Re-test after optimization
- [ ] Document final token counts

**Phase 6 Checkpoint:**
- [ ] All tests passing
- [ ] Token usage < 3,000/request (average)
- [ ] Response times within targets
- [ ] No critical bugs
- [ ] Performance acceptable

---

## Phase 7: Documentation & Deployment (10 tasks)

### 7.1 Code Documentation
- [ ] Add JSDoc comments to all tools
- [ ] Add JSDoc comments to agent
- [ ] Add JSDoc comments to API route
- [ ] Add README in components/xpchat/
- [ ] Document ENV variables needed
- [ ] Create API usage examples

### 7.2 User Documentation
- [ ] Create user guide for XPChat features
- [ ] Document example queries
- [ ] Create video/GIF demos
- [ ] Add help text in UI

### 7.3 Deployment Preparation
- [ ] Verify ANTHROPIC_API_KEY in Vercel env vars
- [ ] Verify DIRECT_DATABASE_URL in Vercel env vars
- [ ] Check for any hardcoded values
- [ ] Test build locally (`npm run build`)
- [ ] Fix any build errors
- [ ] Review bundle size

### 7.4 Deployment
- [ ] Push code to GitHub
- [ ] Trigger Vercel deployment
- [ ] Monitor build logs
- [ ] Test production deployment
- [ ] Monitor error logs
- [ ] Rollback if critical issues

**Phase 7 Checkpoint:**
- [ ] Deployed to production
- [ ] No errors in production logs
- [ ] Performance acceptable in production
- [ ] Documentation complete

---

## Final Checklist

### Must Have ✅
- [ ] Token usage < 3,500/request (average)
- [ ] Response time < 5s for simple queries
- [ ] Response time < 15s for complex queries
- [ ] All 8 tools working correctly
- [ ] Visualizations rendering properly
- [ ] Extended Thinking activates for complex queries
- [ ] Cost < $1/1000 requests
- [ ] No critical bugs
- [ ] Mobile responsive
- [ ] Authentication working
- [ ] RLS enforced

### Nice to Have 🎯
- [ ] Token usage < 3,000/request (average)
- [ ] Response time < 3s for simple queries
- [ ] Response time < 12s for complex queries
- [ ] Smooth animations & transitions
- [ ] Conversation memory working
- [ ] Cost < $0.90/1000 requests
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Export functionality

---

## Phase 8: UI/UX Enhancements

**Goal:** Transform XPChat from passive chat interface to discovery-first experience

**Impact:** Expected +40% engagement, -30% bounce rate

### 8.1 Welcome Screen Onboarding

- [ ] Create WelcomeOverlay component
- [ ] Add showWelcome state management to XPChatPage
- [ ] Implement handleStartChat function
- [ ] Add hero section with gradient heading
- [ ] Create CategoryCards grid (6 categories)
- [ ] Add Popular Discoveries section
- [ ] Test first-visit experience

### 8.2 CategoryCard Component

- [ ] Create CategoryCard component
- [ ] Add icon, title, description props
- [ ] Implement exampleQuery click handler
- [ ] Add hover animations
- [ ] Style with gradient backgrounds
- [ ] Test on mobile/desktop

### 8.3 ProactiveInsight Component

- [ ] Create ProactiveInsight component
- [ ] Add dismissible UI (close button)
- [ ] Implement 4 insight types (wave, temporal, hotspot, pattern)
- [ ] Add action button (e.g., "Show on map")
- [ ] Style with subtle animations
- [ ] Test integration in chat flow

### 8.4 Pattern Quality Indicators (HIGH Priority)

- [ ] Create lib/mastra/utils/pattern-quality.ts
- [ ] Implement calculatePatternQuality() function
  - [ ] Calculate confidence score based on sample size + clustering strength
  - [ ] Implement Chi-square test for p-value calculation
  - [ ] Calculate Cohen's d for effect size
  - [ ] Calculate Silhouette coefficient for clustering quality
- [ ] Add PatternQualityMetrics type to types.ts
- [ ] Integrate quality metrics into insights/patterns tools
- [ ] Add quality indicators to UI (badges, tooltips)
- [ ] Document algorithm in code comments
- [ ] Test with various pattern sizes (n=10, n=50, n=100+)

---

## Phase 9: Pattern Library Feature

**Goal:** Enable users to save, organize, and share discovered patterns

**Impact:** Expected +30% retention, viral loop activation

### 9.1 Database Setup

- [ ] Create patterns table migration
- [ ] Create pattern_tags table migration
- [ ] Add 6 RLS policies
- [ ] Add 7 indexes for performance
- [ ] Test insert/select permissions
- [ ] Generate TypeScript types

### 9.2 API Routes

- [ ] Create /api/patterns/save route (POST)
- [ ] Create /api/patterns/list route (GET)
- [ ] Create /api/patterns/share route (GET)
- [ ] Add nanoid for share tokens
- [ ] Test authentication
- [ ] Test RLS enforcement

### 9.3 Frontend Components

- [ ] Create PatternsPage (app/[locale]/patterns/page.tsx)
- [ ] Create PatternCard component
- [ ] Create PatternDetailModal component
- [ ] Add SavePatternButton to all visualizations
- [ ] Implement search & filters
- [ ] Test my/public view switching

### 9.4 Share & Export Features

- [ ] Implement share flow (copy link)
- [ ] Create public pattern view page
- [ ] Add CSV export functionality
- [ ] Add JSON export functionality
- [ ] Test viral loop (share → signup → share)
- [ ] Add analytics tracking

---

## Phase 10: Polish & Optimization

**Goal:** Production-ready refinements for mobile, accessibility, and performance

**Impact:** Professional polish, better mobile UX, faster performance

### 10.1 NetworkView Mobile Implementation (MEDIUM Priority)

- [ ] Create NetworkViewMobile component (components/xpchat/visualizations/NetworkViewMobile.tsx)
- [ ] Implement hierarchical list view grouped by category
- [ ] Add expand/collapse functionality with ChevronRight icons
- [ ] Display connection counts and similarity percentages
- [ ] Add touch-optimized tap targets (min 44×44px)
- [ ] Test on iOS Safari and Android Chrome
- [ ] Add responsive breakpoint detection (< 768px → mobile view)

### 10.2 Accessibility Improvements (MEDIUM Priority)

- [ ] Add skip-to-content link in XPChatPage header
- [ ] Implement ARIA live regions for message updates
- [ ] Add keyboard shortcuts (ESC to dismiss modals)
- [ ] Implement focus trap for modals and overlays
- [ ] Add screen reader announcements for pattern saves
- [ ] Test with VoiceOver (macOS) and NVDA (Windows)
- [ ] Audit with axe DevTools and fix violations
- [ ] Document keyboard navigation in user guide

### 10.3 Performance Optimization (MEDIUM Priority)

- [ ] Install lru-cache package (npm install lru-cache)
- [ ] Create lib/mastra/utils/aha-moments-cache.ts
- [ ] Implement detectAhaMomentsCached() with 15-minute TTL
- [ ] Add threshold check (skip detection if < 50 experiences)
- [ ] Make detection non-blocking (async without await in stream)
- [ ] Add performance metrics logging
- [ ] Test cache hit rates in production
- [ ] Document caching strategy in code comments

---

## Progress Tracking

### Phase 1: ⬜ Not Started (0%)
### Phase 2: ⬜ Not Started (0%)
### Phase 3: ⬜ Not Started (0%)
### Phase 4: ⬜ Not Started (0%)
### Phase 5: ⬜ Not Started (0%)
### Phase 6: ⬜ Not Started (0%)
### Phase 7: ⬜ Not Started (0%)
### Phase 8: ⬜ Not Started (0%) - UI/UX Enhancements
### Phase 9: ⬜ Not Started (0%) - Pattern Library
### Phase 10: ⬜ Not Started (0%) - Polish & Optimization

### Overall: 0/120 tasks completed (0%)

---

## Notes

- Mark tasks with `[x]` when completed
- Update progress percentages after each phase
- Document any blockers or issues in DECISIONS.md
- Track actual vs. estimated time for future planning
- Celebrate milestones! 🎉

**Start Date:** TBD
**Target Completion:** TBD (est. 2-3 days)
**Actual Completion:** TBD
