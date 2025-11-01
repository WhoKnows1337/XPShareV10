# XPChat v3 - TODO Checklist

**Status:** Ready to Execute
**Created:** 2025-10-26
**Total Effort:** 8 hours → Production!

---

## 🎯 Quick Start: 8-Hour Implementation

### ✅ Prerequisites (Check These First!)

- [ ] Node.js 18+ installed
- [ ] Supabase project exists
- [ ] OpenAI API key available
- [ ] Anthropic API key available (optional but recommended)
- [ ] Mapbox token available (for maps)
- [ ] Git repo initialized

---

## 📋 Phase 0: Preparation (15 Min)

### Dependencies

- [ ] Install AI SDK packages
  ```bash
  npm install ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic
  ```

- [ ] Install visualization libraries
  ```bash
  npm install recharts mapbox-gl
  npm install -D @types/mapbox-gl
  ```

### Environment Variables

- [ ] Create/update `.env.local`
  ```env
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...
  NEXT_PUBLIC_MAPBOX_TOKEN=pk...
  ```

- [ ] Verify Supabase ENV vars exist
  ```env
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

### Review Existing Code

- [ ] Read `app/api/chat/route.ts` (understand current implementation)
- [ ] Read `components/search/ask-ai-stream.tsx` (existing UI)
- [ ] Read `lib/openai/client.ts` (check generateEmbedding exists)

**Checkpoint:** ✅ All dependencies installed, ENV vars set

---

## 🛠️ Phase 1: Backend - Tools (2h)

### Step 1.1: Create Tool Files (45 min)

- [ ] Create `lib/ai/tools/` directory
  ```bash
  mkdir -p lib/ai/tools
  ```

- [ ] Create `lib/ai/tools/unified-search.ts`
  - [ ] Import dependencies (ai, z, generateEmbedding, supabase)
  - [ ] Define tool with description
  - [ ] Define parameters schema (query, mode, category, location, limit, offset)
  - [ ] Implement `mode: explore` (vector search)
  - [ ] Implement `mode: browse` (full-text search with pagination)
  - [ ] Implement `mode: find` (high-similarity match)
  - [ ] Add location filtering (client-side for now)
  - [ ] Export tool

- [ ] Create `lib/ai/tools/visualize.ts`
  - [ ] Import dependencies
  - [ ] Define tool with description
  - [ ] Define parameters schema (type, experienceIds, groupBy)
  - [ ] Implement `type: map` (GeoJSON generation)
  - [ ] Implement `type: timeline` (time-series aggregation)
  - [ ] Implement `type: dashboard` (statistics aggregation)
  - [ ] Export tool

- [ ] Create `lib/ai/tools/index.ts`
  ```typescript
  export { unifiedSearchTool } from './unified-search'
  export { visualizeTool } from './visualize'
  ```

**Checkpoint:** ✅ 2 tools created, compile without errors

### Step 1.2: Create API Route (45 min)

- [ ] Create `app/api/xpchat/route.ts`
  - [ ] Import streamText from 'ai'
  - [ ] Import anthropic provider
  - [ ] Import createClient from supabase
  - [ ] Import tools (unifiedSearchTool, visualizeTool)
  - [ ] Set runtime & maxDuration
  - [ ] Implement POST handler:
    - [ ] Auth check (get user)
    - [ ] Parse request body (messages)
    - [ ] Create RLS-safe context ({ supabase, userId })
    - [ ] Call streamText with:
      - [ ] model: claude-3-7-sonnet
      - [ ] messages
      - [ ] system prompt (concise!)
      - [ ] tools object
      - [ ] experimental_context
    - [ ] Return stream.toDataStreamResponse()
  - [ ] Add error handling

**Checkpoint:** ✅ API route compiles, can start dev server

### Step 1.3: Test API (10 min)

- [ ] Start dev server
  ```bash
  npm run dev
  ```

- [ ] Test with curl
  ```bash
  curl -X POST http://localhost:3000/api/xpchat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"messages":[{"role":"user","content":"UFO in Bayern"}]}'
  ```

- [ ] Verify:
  - [ ] Response streams
  - [ ] No errors in console
  - [ ] Tools are called (check logs)

**Checkpoint:** ✅ Backend working!

---

## 🎨 Phase 2: Frontend - UI (2h)

### Step 2.1: Welcome Screen (30 min)

- [ ] Create `components/discover/` directory
  ```bash
  mkdir -p components/discover
  ```

- [ ] Create `components/discover/WelcomeScreen.tsx`
  - [ ] Define EXAMPLE_QUESTIONS array (6 categories)
  - [ ] Create component with props (onQuestionSelect)
  - [ ] Build hero section (title, subtitle)
  - [ ] Map example questions to Cards
  - [ ] Add hover effects
  - [ ] Export component

**Checkpoint:** ✅ Welcome screen renders

### Step 2.2: Chat Page (30 min)

- [ ] Create `app/[locale]/discover/page.tsx`
  - [ ] Import useChat from '@ai-sdk/react'
  - [ ] Import WelcomeScreen
  - [ ] Configure useChat({ api: '/api/xpchat' })
  - [ ] Create page layout:
    - [ ] Header (title, "Neue Suche" button)
    - [ ] Main content (conditional: Welcome or Messages)
    - [ ] Footer (input, sticky bottom)
  - [ ] Implement message rendering:
    - [ ] User messages (right, blue)
    - [ ] Assistant messages (left, gray)
  - [ ] Handle question select (setInput + auto-submit)
  - [ ] Add loading state

**Checkpoint:** ✅ Can send messages, see responses

### Step 2.3: Tool Rendering (60 min)

- [ ] Create `components/discover/ToolRenderer.tsx`
  - [ ] Accept toolInvocation prop
  - [ ] Extract toolName, args, result, state
  - [ ] Switch on toolName:
    - [ ] 'unifiedSearch' → ExperiencesList
    - [ ] 'visualize' → MapView | TimelineView | DashboardView
  - [ ] Export component

- [ ] Create `components/discover/ExperiencesList.tsx`
  - [ ] Accept experiences[] prop
  - [ ] Map to ExperienceCard components
  - [ ] Add "Showing X of Y" message
  - [ ] Export

- [ ] Create `components/discover/visualizations/MapView.tsx`
  - [ ] Import mapbox-gl
  - [ ] Accept geoJSON prop
  - [ ] useEffect to initialize map
  - [ ] Add source & layer
  - [ ] Fit bounds to data
  - [ ] Add markers
  - [ ] Cleanup on unmount
  - [ ] Export

- [ ] Create `components/discover/visualizations/TimelineView.tsx`
  - [ ] Import Recharts (LineChart, XAxis, YAxis, etc.)
  - [ ] Accept data prop (array of {date, count})
  - [ ] Render ResponsiveContainer
  - [ ] Configure chart
  - [ ] Export

- [ ] Create `components/discover/visualizations/DashboardView.tsx`
  - [ ] Accept metrics prop
  - [ ] Render metric cards (total, byCategory, etc.)
  - [ ] Use BarChart for distributions
  - [ ] Export

- [ ] Update MessageBubble in page.tsx to use ToolRenderer
  - [ ] Check if message has toolInvocations
  - [ ] Map and render ToolRenderer for each

**Checkpoint:** ✅ Tools render with visualizations

---

## 🧪 Phase 3: Testing (1h)

### Manual Testing

- [ ] Test 1: Simple Query
  - [ ] Input: "UFO Sichtungen in Bayern"
  - [ ] Verify: unifiedSearch called
  - [ ] Verify: Experiences displayed
  - [ ] Verify: Map rendered (if geo data)
  - [ ] Verify: Response < 5s

- [ ] Test 2: Timeline Query
  - [ ] Input: "Wann passieren die meisten UFO Sichtungen?"
  - [ ] Verify: unifiedSearch + visualize(timeline) called
  - [ ] Verify: Chart displayed
  - [ ] Verify: Insights in text

- [ ] Test 3: Dashboard Query
  - [ ] Input: "Gib mir einen Überblick über alle Kategorien"
  - [ ] Verify: visualize(dashboard) called
  - [ ] Verify: Stats cards displayed

- [ ] Test 4: Conversation Flow
  - [ ] Input 1: "Träume über Fliegen"
  - [ ] Input 2: "Nur luzide Träume"
  - [ ] Verify: Context maintained
  - [ ] Verify: Filters applied

- [ ] Test 5: Mobile
  - [ ] Open on mobile browser
  - [ ] Verify: Responsive layout
  - [ ] Verify: Input works
  - [ ] Verify: Visualizations adapt

### Bug Fixes

- [ ] Fix any errors found
- [ ] Test fixes
- [ ] Verify all tests pass

**Checkpoint:** ✅ All tests passing, no critical bugs

---

## 🚀 Phase 4: Deploy (30 min)

### Pre-Deploy Checks

- [ ] Run build locally
  ```bash
  npm run build
  ```

- [ ] Fix any build errors
- [ ] Verify no TypeScript errors
- [ ] Check bundle size (< 500kb for /discover page)

### Deploy to Vercel

- [ ] Commit changes
  ```bash
  git add .
  git commit -m "Add XPChat v3 Discovery Interface

  - Create 2 core tools (unifiedSearch, visualize)
  - Add /api/xpchat route with Claude Sonnet
  - Build /discover page with chat UI
  - Implement map, timeline, dashboard visualizations
  - Add welcome screen with example questions

  Ready for testing!"
  ```

- [ ] Push to GitHub
  ```bash
  git push origin main
  ```

- [ ] Wait for Vercel deploy (auto)

### Production Setup

- [ ] Add ENV vars in Vercel dashboard:
  - [ ] OPENAI_API_KEY
  - [ ] ANTHROPIC_API_KEY
  - [ ] NEXT_PUBLIC_MAPBOX_TOKEN
  - [ ] (Supabase vars should already exist)

- [ ] Verify deployment
  - [ ] Visit https://yourapp.vercel.app/discover
  - [ ] Test simple query
  - [ ] Check error logs (Vercel dashboard)

**Checkpoint:** ✅ Production deployed and working!

---

## 🎉 Phase 5: Launch (30 min)

### Beta Testing

- [ ] Invite 5-10 beta users
- [ ] Send them /discover link
- [ ] Ask for feedback:
  - [ ] Response times acceptable?
  - [ ] Visualizations helpful?
  - [ ] Found what they needed?
  - [ ] Any bugs?

### Monitoring

- [ ] Monitor Vercel logs for errors
- [ ] Track costs in OpenAI dashboard
- [ ] Track costs in Anthropic dashboard
- [ ] Verify < $0.01 per query

### Iterate

- [ ] Fix urgent bugs
- [ ] Note feature requests
- [ ] Plan Phase 2 (next week)

**Checkpoint:** ✅ Live and collecting feedback!

---

## 📊 Success Metrics (After 1 Week)

- [ ] 50+ queries processed
- [ ] 0 critical bugs
- [ ] Average response time < 5s
- [ ] Average cost < $0.01 per query
- [ ] 5+ positive feedback from beta users
- [ ] Tools used in 80%+ of queries
- [ ] Visualizations rendered successfully

---

## 🔄 Phase 6: Enhancements (Week 2+)

### Tool 3: discoverPatterns (Optional)

- [ ] Create `lib/ai/tools/discover-patterns.ts`
- [ ] Implement temporal pattern detection
- [ ] Implement geographic clustering
- [ ] Implement semantic pattern matching
- [ ] Add confidence scores
- [ ] Integrate with visualizations

### Tool 4: manageContext (Optional)

- [ ] Create `lib/ai/tools/manage-context.ts`
- [ ] Implement conversation memory storage
- [ ] Implement user preferences
- [ ] Implement search history
- [ ] Add load/save/clear actions

### UI Enhancements

- [ ] Add markdown rendering to messages
- [ ] Add code syntax highlighting
- [ ] Add copy button for code blocks
- [ ] Add source citations as clickable links
- [ ] Improve loading states (skeleton UI)
- [ ] Add error boundaries

### Performance

- [ ] Implement embedding caching
- [ ] Add response streaming indicators
- [ ] Optimize bundle size
- [ ] Add lazy loading for visualizations

---

## 🐛 Known Issues / Technical Debt

### To Fix Later

- [ ] Location filter is client-side (should be PostGIS query)
- [ ] No pagination UI for browse mode (just shows first page)
- [ ] Network visualization not implemented
- [ ] No export functionality yet
- [ ] No user preferences saving
- [ ] No conversation history persistence

### Nice-to-Have

- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Voice input
- [ ] Share conversation link
- [ ] Embed visualizations
- [ ] Mobile app (PWA)

---

## 📝 Notes & Learnings

### What Went Well

- _(Fill in after implementation)_

### What Was Challenging

- _(Fill in after implementation)_

### What to Do Differently Next Time

- _(Fill in after implementation)_

---

## 🎯 Next Steps After MVP

1. **Week 2:** Add discoverPatterns tool
2. **Week 3:** Implement auto-matching on experience submission
3. **Week 4:** Build smart notifications
4. **Month 2:** Community features
5. **Month 3:** Research tools & API

---

**Ready? Let's build! 🚀**

Start with Phase 0, work through Phase 1-4, and you'll have a working Discovery Chat in ~8 hours!

**Good luck! You got this! 💪**
