# XPShare AI - Complete Testing Guide

**Version:** 1.0
**Last Updated:** 2025-10-21
**Status:** Ready for QA Testing

---

## 🎯 Purpose

This guide provides **step-by-step testing instructions** for ALL implemented XPCHAT features. Use this to verify:
- ✅ All 5 Agents work correctly
- ✅ All 16 AI Tools execute successfully
- ✅ All 6+ Visualization Components render properly
- ✅ All 17 Phase 8 UX Features function as expected
- ✅ All API Routes handle requests correctly
- ✅ Database operations execute without errors

**Testing Methods:**
1. **Browser MCP** - Visual testing with automated browser control
2. **API Calls** - Direct HTTP testing with curl/fetch
3. **Supabase MCP** - Database verification
4. **Manual UI Testing** - User interaction flows

---

## 📋 Testing Checklist Overview

| Category | Features | Test Method | Status |
|----------|----------|-------------|--------|
| **Agents** | 5 Agents | API + Browser | ✅ **COMPLETE** (Bugs #5, #6 Fixed) |
| **Tools** | 16 Tools | API + Browser | 🔄 **In Progress** (1/16 Complete) |
| **Visualizations** | 6 Components | Browser | ⏳ Pending |
| **Phase 8 UX** | 17 Features | Browser + API | ⏳ Pending |
| **API Routes** | 29 Routes | API | ⏳ Pending |
| **Database** | 7 Tables | Supabase MCP | ⏳ Pending |
| **PWA/Offline** | Service Worker | Browser | ⏳ Pending |

### ✅ Completed Tests (2025-10-21)
- **Section 1: Agent System** - All 4 agent tests passed
- **Section 2.1: advancedSearch Tool** - Verified working with timeOfDay enum filter
- **Bug #5 FIXED**: Removed activeTools parameter from prepareStep patterns (AI SDK 5.0 compatibility)
- **Bug #6 FIXED**: Fixed schema caching (timeRange → timeOfDay enum) via server restart

---

## 1️⃣ Agent System Testing

### 1.1 Orchestrator Agent

**What it does:** Routes queries to specialized agents, coordinates multi-agent tasks

**Test via Browser MCP:**
```javascript
// Navigate to discover page
await browser.navigate('http://localhost:3000/en/discover')

// Take snapshot
await browser.snapshot()

// Click input field and type complex query
await browser.type('[data-testid="chat-input"]', 'Show me UFO sightings in Berlin from 2020-2023 and create a timeline visualization', true)

// Wait for response
await browser.wait(5)

// Take screenshot of result
await browser.screenshot()
```

**Expected Result:**
- ✅ Query is routed to multiple agents (Query + Viz + Insight)
- ✅ Timeline visualization appears
- ✅ Search results show UFO experiences in Berlin
- ✅ No errors in console

**Test via API:**
```bash
curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Analyze dream patterns in Germany and show me a geographic heatmap"
    }]
  }'
```

**Expected JSON Response:**
```json
{
  "agentsUsed": ["orchestrator", "query", "viz"],
  "toolsCalled": ["advanced_search", "analyze_category", "generate_map"],
  "vizType": "heatmap",
  "results": [...]
}
```

---

### 1.2 Query Agent

**What it does:** Executes all search and analytics tools

**Test Queries:**
1. **Simple Search:** "Find all ghost encounters in the last month"
2. **Complex Filter:** "Show me dreams with symbol=water AND emotion=peaceful from users in Europe"
3. **Analytics:** "Rank top 10 users by experience count in the paranormal category"

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover')
await browser.type('[data-testid="chat-input"]', 'Find UFO sightings within 50km of Berlin', true)
await browser.wait(3)
await browser.screenshot()
```

**Verify:**
- ✅ Tool call shows `advancedSearch` or `geoSearch`
- ✅ Results display with location info
- ✅ Map visualization appears (if geographic)

---

### 1.3 Visualization Agent

**What it does:** Auto-selects best visualization for data

**Test Cases:**

| Query | Expected Viz | Reason |
|-------|--------------|--------|
| "UFO sightings over time" | Timeline | Temporal data |
| "Dreams by location" | Map | Geographic coordinates |
| "User connections network" | Network Graph | Relationship data |
| "Category distribution" | Heatmap | Multi-dimensional |

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]', 'Show temporal trends of dream reports', true)
await browser.wait(4)

// Verify timeline chart exists
const snapshot = await browser.snapshot()
// Look for <canvas> or <svg> element with timeline data
```

---

### 1.4 Insight Agent

**What it does:** Detects patterns, generates insights

**Test Query:**
```
"What patterns do you see in paranormal experiences during full moon nights?"
```

**Expected Output:**
- ✅ InsightCard components appear
- ✅ Confidence scores shown (e.g., 85%)
- ✅ Evidence data points listed
- ✅ Pattern types: `temporal`, `geographic`, or `attribute`

**API Test:**
```bash
curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Detect patterns in UFO sightings"
    }]
  }'
```

**Verify JSON contains:**
```json
{
  "toolCalls": [{
    "name": "generateInsights",
    "result": {
      "insights": [
        {
          "type": "temporal",
          "pattern": "Peak sightings at 22:00-23:00",
          "confidence": 0.82,
          "evidence": [...]
        }
      ]
    }
  }]
}
```

---

### 1.5 Export Agent

**What it does:** Exports data in JSON/CSV format

**Browser Test:**
```javascript
// After a search, click export button
await browser.click('[aria-label="Export results"]')

// Verify download initiated
// Check browser downloads folder for file
```

**API Test:**
```bash
curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Export all ghost encounters as CSV"
    }]
  }'
```

---

## 2️⃣ AI Tools Testing (16 Tools)

### 2.1 Search Tools (5 Tools)

#### Tool: `advancedSearch`

**Test Query:**
```
"Find experiences in Berlin from 2020-01-01 to 2023-12-31 with tag=verified"
```

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Search for dreams in New York with emotion=fear', true)
await browser.wait(3)
```

**Verify:**
- ✅ Card shows "Search Results"
- ✅ Experience count displayed
- ✅ First 10 results shown
- ✅ Export button present

**API Test:**
```bash
curl 'http://localhost:3000/api/tools/advanced-search' \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["dreams"],
    "location": { "city": "Berlin" },
    "tags": ["lucid"],
    "limit": 20
  }'
```

**Expected Response:**
```json
{
  "results": [...],
  "count": 15,
  "hasMore": false
}
```

---

#### Tool: `semanticSearch`

**Test Query:**
```
"Find experiences similar to 'bright light in the sky'"
```

**Verify:**
- ✅ Results sorted by similarity score
- ✅ Scores shown (0.7 - 1.0)
- ✅ Minimum 5 results

---

#### Tool: `fullTextSearch`

**Test Query:**
```
"Search for 'alien encounter' in descriptions"
```

**API Test:**
```bash
curl 'http://localhost:3000/api/tools/full-text-search' \
  -H "Content-Type: application/json" \
  -d '{
    "query": "triangle lights",
    "categories": ["ufo"],
    "limit": 50
  }'
```

---

#### Tool: `searchByAttributes`

**Test Query:**
```
"Find UFOs with shape=triangle AND color=red"
```

**Expected:**
- ✅ Attribute filters applied correctly
- ✅ Results match ALL conditions (AND logic)

---

#### Tool: `geoSearch`

**Test Query:**
```
"Show paranormal events within 100km of Paris"
```

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Find ghost sightings near London', true)
await browser.wait(5)

// Verify map appears
const snapshot = await browser.snapshot()
// Look for MapToolUI component
```

**Verify:**
- ✅ Map visualization loads
- ✅ Markers clustered by location
- ✅ Popup shows experience details

---

### 2.2 Analytics Tools (5 Tools)

#### Tool: `rankUsers`

**Test Query:**
```
"Top 10 users by experience count"
```

**Expected Output:**
- ✅ User list with usernames
- ✅ Experience counts per user
- ✅ Sorted descending

**API Test:**
```bash
curl 'http://localhost:3000/api/tools/rank-users' \
  -H "Content-Type: application/json" \
  -d '{
    "metric": "experience_count",
    "topN": 10
  }'
```

---

#### Tool: `analyzeCategory`

**Test Query:**
```
"Analyze the dreams category in detail"
```

**Expected:**
- ✅ Total experience count
- ✅ Top attributes (dream_symbol, dream_emotion, etc.)
- ✅ Temporal distribution (monthly counts)
- ✅ Top locations

---

#### Tool: `compareCategories`

**Test Query:**
```
"Compare UFO vs Ghost categories"
```

**Expected:**
- ✅ Side-by-side metrics
- ✅ Experience counts
- ✅ User counts
- ✅ Geographic spread

---

#### Tool: `temporalAnalysis`

**Test Query:**
```
"Show UFO sighting trends over the last 5 years"
```

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Temporal analysis of dream reports by month', true)
await browser.wait(4)

// Verify TimelineToolUI appears
const snapshot = await browser.snapshot()
```

**Verify:**
- ✅ Line chart with time axis
- ✅ Data points for each month/year
- ✅ Responsive design

---

#### Tool: `attributeCorrelation`

**Test Query:**
```
"What dream symbols appear together frequently?"
```

**Expected:**
- ✅ Correlation pairs listed
- ✅ Co-occurrence counts shown
- ✅ Confidence scores (Jaccard similarity)

---

### 2.3 Relationship Tools (2 Tools)

#### Tool: `findConnections`

**Test Query:**
```
"Find experiences similar to experience ID xxx"
```

**API Test:**
```bash
curl 'http://localhost:3000/api/tools/find-connections' \
  -H "Content-Type: application/json" \
  -d '{
    "experienceId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "dimensions": ["semantic", "geographic", "temporal"],
    "maxResults": 10
  }'
```

**Verify:**
- ✅ Similar experiences returned
- ✅ Similarity scores per dimension
- ✅ Total similarity score (weighted)

---

#### Tool: `detectPatterns`

**Test Query:**
```
"Detect temporal patterns in paranormal category"
```

**Expected:**
- ✅ Pattern list with types
- ✅ Confidence scores
- ✅ Supporting data points

---

### 2.4 Advanced Tools (4 Tools)

#### Tool: `generateInsights`

**Test Query:**
```
"Generate insights from UFO data"
```

**Verify:**
- ✅ InsightCard components render
- ✅ 3-5 insights generated
- ✅ Types: spike, trend, hotspot, pattern, anomaly

---

#### Tool: `predictTrends`

**Test Query:**
```
"Predict future dream report trends"
```

**Expected:**
- ✅ TrendChart component
- ✅ Forecast data points
- ✅ Confidence intervals
- ✅ R² score shown

---

#### Tool: `suggestFollowups`

**Test Query:**
```
"What should I explore next?"
```

**Expected:**
- ✅ 3-5 follow-up suggestions
- ✅ Each with query text
- ✅ Clickable to execute

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Suggest follow-up questions about dreams', true)
await browser.wait(3)

// Click first suggestion
await browser.click('[data-testid="suggestion-0"]')
await browser.wait(3)

// Verify new query executed
```

---

#### Tool: `exportResults`

**Test Query:**
```
"Export search results as CSV"
```

**Verify:**
- ✅ Download button appears
- ✅ CSV file downloads
- ✅ Contains all result rows

---

## 3️⃣ Visualization Testing

### 3.1 Timeline Chart

**Test Query:**
```
"Show UFO sightings timeline from 2020 to 2024"
```

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover')
await browser.type('[data-testid="chat-input"]',
  'Analyze temporal trends in dream reports', true)
await browser.wait(5)

// Take screenshot of timeline
await browser.screenshot()
```

**Verify:**
- ✅ Recharts LineChart renders
- ✅ X-axis shows time periods
- ✅ Y-axis shows counts
- ✅ Tooltip works on hover
- ✅ Responsive (resize window)

---

### 3.2 Map Visualization

**Test Query:**
```
"Show ghost encounters on a map"
```

**Verify:**
- ✅ Leaflet map loads
- ✅ Markers appear at coordinates
- ✅ Popup shows experience details
- ✅ Auto-center/zoom works
- ✅ Category colors applied

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Geographic distribution of paranormal events', true)
await browser.wait(6)

// Verify map component
const snapshot = await browser.snapshot()
// Look for .leaflet-container element
```

---

### 3.3 Network Graph

**Test Query:**
```
"Show user connection network in dreams category"
```

**Verify:**
- ✅ Force graph 3D renders
- ✅ Nodes = users/experiences
- ✅ Links = connections
- ✅ Interactive controls (zoom, rotate)
- ✅ Node colors by category

---

### 3.4 Heatmap

**Test Query:**
```
"Create heatmap of category × time distribution"
```

**Verify:**
- ✅ Matrix grid renders
- ✅ Color intensity shows counts
- ✅ Legend/scale present
- ✅ Axis labels clear

---

### 3.5 Dashboard (Multi-Viz)

**Test Query:**
```
"Create comprehensive dashboard for UFO data"
```

**Verify:**
- ✅ Summary stats cards
- ✅ Tabs for Map/Timeline/Network
- ✅ All visualizations load
- ✅ Responsive grid layout

---

### 3.6 Tool UI Wrappers

**Test all 4 Tool UIs:**

1. **TimelineToolUI** - `analyze_timeline` tool
2. **MapToolUI** - `analyze_geographic` tool
3. **NetworkToolUI** - `analyze_network` tool
4. **HeatmapToolUI** - `analyze_heatmap` tool

**Browser Test Script:**
```javascript
const queries = [
  'Create timeline of dream reports',
  'Show geographic map of UFO sightings',
  'Generate user connection network',
  'Create category heatmap'
]

for (const query of queries) {
  await browser.type('[data-testid="chat-input"]', query, true)
  await browser.wait(5)
  await browser.screenshot()
}
```

---

## 4️⃣ Phase 8 UX Features Testing

### Feature 1: Citations & Source Attribution

**Test Steps:**
1. Navigate to `/en/discover`
2. Type: "Show me 3 UFO experiences in Berlin"
3. Wait for AI response
4. Scroll to bottom of message

**Verify:**
- ✅ CitationList component appears
- ✅ Shows "Sources (3)"
- ✅ Each citation has [1][2][3] badge
- ✅ Click citation opens experience page
- ✅ Snippet preview shown

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover')
await browser.type('[data-testid="chat-input"]',
  'Find 5 ghost encounters and cite sources', true)
await browser.wait(5)

// Verify citations
const snapshot = await browser.snapshot()
// Look for CitationList component
```

---

### Feature 2: Memory System

**Test Steps:**
1. Navigate to `/en/discover/preferences`
2. Verify memories loaded
3. Add new memory manually
4. Delete a memory
5. Return to chat, verify AI uses memories

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover/preferences')
await browser.snapshot()

// Add memory
await browser.click('[data-testid="add-memory"]')
await browser.type('[name="key"]', 'preferred_category', false)
await browser.type('[name="value"]', 'dreams', false)
await browser.click('[data-testid="save-memory"]')
await browser.wait(2)

// Verify appears in list
await browser.screenshot()
```

**Verify:**
- ✅ Memory list loads
- ✅ Stats cards show counts
- ✅ Search/filter works
- ✅ Delete removes memory
- ✅ AI responses personalized

---

### Feature 3: Message Actions

**Test Steps:**
1. Start chat, send message
2. Hover over assistant response
3. Test all actions

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover')
await browser.type('[data-testid="chat-input"]', 'Hello', true)
await browser.wait(3)

// Hover message to show actions
await browser.hover('[data-testid="message-1"]')
await browser.snapshot()

// Click copy button
await browser.click('[aria-label="Copy"]')
await browser.wait(1)

// Verify toast
```

**Verify Each Action:**
- ✅ **Copy** - Clipboard contains text
- ✅ **Thumbs Up** - Rating saved to DB
- ✅ **Thumbs Down** - Negative rating saved
- ✅ **Edit** (user msg) - Message editable
- ✅ **Regenerate** (AI msg) - New response generated
- ✅ **Share** - Share dialog opens

---

### Feature 4: Abort/Stop Streaming

**Test Steps:**
1. Send long query (e.g., "Analyze all categories")
2. Click "Stop generating" button while streaming

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Perform comprehensive analysis of all 10 categories with detailed insights', true)

// Wait 1 second
await browser.wait(1)

// Click stop button
await browser.click('[aria-label="Stop generating"]')
await browser.wait(2)
```

**Verify:**
- ✅ FloatingStopButton appears during streaming
- ✅ Button stops generation
- ✅ Partial response preserved
- ✅ No errors in console

---

### Feature 5: Multi-Modal Attachments

**Test Steps:**
1. Click "Attach files" button
2. Upload image (PNG/JPEG)
3. Send message with image
4. Wait for AI response

**Browser Test:**
```javascript
// Navigate and open file dialog
await browser.click('[aria-label="Attach files"]')

// Upload file (use browser file upload simulation)
// Note: File upload in browser MCP may require manual step

// Verify preview
await browser.wait(2)
await browser.screenshot()

// Send message
await browser.type('[data-testid="chat-input"]', 'What is in this image?', true)
await browser.wait(5)
```

**Verify:**
- ✅ File upload dialog works
- ✅ Image preview shown
- ✅ GPT-4o vision analyzes image
- ✅ AI describes image content

---

### Feature 6: Structured Error States

**Test Steps:**
1. Trigger rate limit error (send 10 requests rapidly)
2. Trigger network error (disconnect internet)
3. Trigger timeout (send query, wait 120s)

**Verify ErrorDisplay shows:**
- ✅ Error title
- ✅ User-friendly message
- ✅ Recovery action button
- ✅ Technical details (collapsed)

**API Test:**
```bash
# Trigger rate limit
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/discover \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done
```

**Expected:**
```json
{
  "error": {
    "type": "rate_limit",
    "message": "Too many requests. Please wait 60 seconds.",
    "recoveryActions": ["wait", "refresh"]
  }
}
```

---

### Feature 7: Context Banner

**Test Steps:**
1. Start search query
2. Verify ContextBanner appears above chat
3. Remove filter from banner
4. Verify filter removed

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Search UFOs in Berlin from 2020-2023', true)
await browser.wait(3)

// Verify ContextBanner
const snapshot = await browser.snapshot()
// Look for ContextBanner component with filters

// Click remove filter
await browser.click('[data-testid="remove-filter-0"]')
await browser.wait(1)
```

**Verify:**
- ✅ Banner shows active filters (category, location, date)
- ✅ Banner shows active tools (advancedSearch, etc.)
- ✅ Remove button works
- ✅ "Clear all" button clears all filters

---

### Feature 8: Rich Content Rendering

**Test Steps:**
1. Send query that triggers code response
2. Verify CodeBlock component renders
3. Click copy button
4. Click download button

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'Show me SQL query to count UFO sightings', true)
await browser.wait(3)

// Verify code block
const snapshot = await browser.snapshot()
// Look for <pre><code> with CodeBlock wrapper

// Click copy
await browser.click('[aria-label="Copy code"]')
await browser.wait(1)

// Verify clipboard
```

**Verify:**
- ✅ Code blocks have copy button
- ✅ Download button creates .txt file
- ✅ Language badge shown (e.g., SQL, JSON)
- ✅ Line numbers optional

---

### Feature 9: Session Management

**Test Steps:**
1. Create chat
2. Pin chat (dropdown menu)
3. Archive chat
4. Search chats
5. Export chat as JSON/MD/CSV

**Browser Test:**
```javascript
await browser.navigate('http://localhost:3000/en/discover')

// Create chat
await browser.type('[data-testid="chat-input"]', 'Test chat', true)
await browser.wait(3)

// Open chat dropdown
await browser.click('[data-testid="chat-menu"]')
await browser.snapshot()

// Pin chat
await browser.click('[data-testid="pin-chat"]')
await browser.wait(1)

// Verify pinned icon appears
```

**Verify:**
- ✅ Pin chat moves to top
- ✅ Archive hides from main list
- ✅ Search finds chats by title
- ✅ Export downloads file

---

### Feature 10: Keyboard Shortcuts

**Test Shortcuts:**

| Shortcut | Action | Test |
|----------|--------|------|
| `Cmd/Ctrl + K` | Focus input | Press keys, verify focus |
| `Cmd/Ctrl + N` | New chat | Press keys, verify new chat created |
| `Cmd/Ctrl + /` or `?` | Show shortcuts modal | Press keys, verify modal opens |
| `Escape` | Close modal | Press Esc, verify modal closes |

**Browser Test:**
```javascript
// Test Cmd+K
await browser.press_key('Meta+k') // or 'Control+k' on Windows
await browser.wait(1)
// Verify input focused

// Test Cmd+N
await browser.press_key('Meta+n')
await browser.wait(2)
// Verify new chat created

// Test Cmd+/
await browser.press_key('Meta+/')
await browser.wait(1)
await browser.screenshot()
// Verify ShortcutsModal visible
```

**Verify:**
- ✅ All shortcuts work
- ✅ Modal shows all shortcuts
- ✅ Platform-aware (Cmd on Mac, Ctrl on Windows)

---

### Feature 11: Accessibility (ARIA)

**Test with Screen Reader:**
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate with Tab key
3. Verify ARIA labels read correctly

**Verify:**
- ✅ All buttons have `aria-label`
- ✅ Messages have `role="log"` and `aria-live="polite"`
- ✅ Input has `aria-describedby`
- ✅ Keyboard navigation works (Tab, Enter, Escape)

**Browser Test:**
```javascript
const snapshot = await browser.snapshot()

// Check for ARIA attributes in HTML
// role="main", role="log", aria-label, aria-live, etc.
```

---

### Feature 12: Branching Conversations

**Test Steps:**
1. Send message
2. Click "Branch" button on message
3. Type new message in branch
4. Verify branch selector shows 2 branches
5. Switch between branches

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]', 'First message', true)
await browser.wait(3)

// Click branch button
await browser.hover('[data-testid="message-0"]')
await browser.click('[data-testid="branch-button"]')
await browser.wait(2)

// Verify BranchSelector appears
const snapshot = await browser.snapshot()
```

**Verify:**
- ✅ BranchButton appears on hover
- ✅ New branch created in DB
- ✅ BranchSelector shows branch list
- ✅ Messages filter by branch_id
- ✅ Message counts per branch

---

### Feature 13: Collaborative Sharing

**Test Steps:**
1. Create chat with messages
2. Click "Share" in chat dropdown
3. Select expiry (1 hour, 24 hours, never)
4. Copy share link
5. Open link in incognito window
6. Verify read-only view

**Browser Test:**
```javascript
// Create chat
await browser.type('[data-testid="chat-input"]', 'Shareable chat', true)
await browser.wait(3)

// Open share dialog
await browser.click('[data-testid="chat-menu"]')
await browser.click('[data-testid="share-chat"]')
await browser.wait(1)

// Select expiry
await browser.click('[data-testid="expiry-24h"]')

// Click create link
await browser.click('[data-testid="create-link"]')
await browser.wait(2)

// Verify link appears
const snapshot = await browser.snapshot()
```

**Verify:**
- ✅ Share link generated
- ✅ Link works in new window
- ✅ Read-only view (no input)
- ✅ View count increments
- ✅ Expiry enforced

---

### Feature 14: Cost/Token Tracking

**Test Steps:**
1. Send message
2. Verify token count badge appears
3. Check session cost summary
4. Navigate to preferences/usage page

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]',
  'This is a test message to calculate tokens', true)
await browser.wait(3)

// Verify token badge
const snapshot = await browser.snapshot()
// Look for CostBadge component with token count
```

**Verify:**
- ✅ Token count shown per message
- ✅ Total session cost displayed
- ✅ Costs accurate (GPT-4o-mini pricing)
- ✅ Usage stats in DB

**Database Check:**
```sql
SELECT * FROM usage_tracking
WHERE user_id = 'xxx'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Feature 15: Prompt Library

**Test Steps:**
1. Navigate to `/en/discover`
2. Click "Prompt Library" button
3. Browse templates
4. Click template
5. Fill variables
6. Execute

**Browser Test:**
```javascript
await browser.click('[data-testid="prompt-library"]')
await browser.wait(2)
await browser.screenshot()

// Click template
await browser.click('[data-testid="template-0"]')
await browser.wait(1)

// Fill variable
await browser.type('[name="location"]', 'Berlin', false)
await browser.click('[data-testid="use-template"]')
await browser.wait(3)
```

**Verify:**
- ✅ Template grid loads
- ✅ Categories filter works
- ✅ Variable substitution correct
- ✅ Favorite star works
- ✅ Use count increments

---

### Feature 16: Message Threading

**Test Steps:**
1. Send message
2. Click "Reply" button
3. Type reply
4. Verify nested thread
5. Collapse/expand thread

**Browser Test:**
```javascript
await browser.type('[data-testid="chat-input"]', 'Parent message', true)
await browser.wait(3)

// Click reply
await browser.hover('[data-testid="message-0"]')
await browser.click('[data-testid="reply-button"]')
await browser.wait(1)

// Type reply
await browser.type('[data-testid="chat-input"]', 'This is a reply', true)
await browser.wait(3)

// Verify thread
const snapshot = await browser.snapshot()
```

**Verify:**
- ✅ ThreadView shows nested messages
- ✅ Visual connectors (lines)
- ✅ Reply count badge
- ✅ Collapse button works
- ✅ reply_to_id saved in DB

---

### Feature 17: Offline Mode

**Test Steps:**
1. Enable offline mode (Chrome DevTools → Network → Offline)
2. Send message
3. Verify queued
4. Re-enable network
5. Verify auto-sync

**Browser Test:**
```javascript
// Disconnect network (manual step)

await browser.type('[data-testid="chat-input"]', 'Offline message', true)
await browser.wait(2)

// Verify OfflineBanner appears
const snapshot = await browser.snapshot()

// Reconnect network (manual step)
await browser.wait(3)

// Verify message sent
```

**Verify:**
- ✅ OfflineBanner shows "Offline"
- ✅ Queue count badge (e.g., "2 pending")
- ✅ Service Worker active
- ✅ Messages sync on reconnect

---

## 5️⃣ API Routes Testing

### 5.1 Main Discover API

**Endpoint:** `POST /api/discover`

**Test:**
```bash
curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Find UFO sightings in Berlin"}
    ]
  }'
```

**Expected:**
- ✅ Streaming response (Server-Sent Events)
- ✅ Tool calls included
- ✅ Citations attached
- ✅ No errors

---

### 5.2 Memory API

**Endpoints:**
- `GET /api/memories` - List memories
- `POST /api/memories` - Create memory
- `DELETE /api/memories/[id]` - Delete memory

**Test GET:**
```bash
curl http://localhost:3000/api/memories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test POST:**
```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "scope": "profile",
    "key": "preferred_category",
    "value": "dreams",
    "source": "user_stated"
  }'
```

**Test DELETE:**
```bash
curl -X DELETE http://localhost:3000/api/memories/xxx \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5.3 Attachments API

**Endpoint:** `POST /api/attachments/upload`

**Test:**
```bash
curl -X POST http://localhost:3000/api/attachments/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.png" \
  -F "messageId=xxx"
```

**Expected Response:**
```json
{
  "url": "https://xxx.supabase.co/storage/v1/object/public/discovery-attachments/xxx.png",
  "id": "xxx",
  "filename": "image.png",
  "size": 12345,
  "mediaType": "image/png"
}
```

---

### 5.4 Share API

**Endpoints:**
- `POST /api/share` - Create share link
- `GET /api/share?token=xxx` - Get shared chat

**Test POST:**
```bash
curl -X POST http://localhost:3000/api/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "chatId": "xxx",
    "expiresIn": "24h"
  }'
```

**Expected:**
```json
{
  "shareToken": "abc123xyz",
  "url": "http://localhost:3000/en/share/abc123xyz",
  "expiresAt": "2025-10-22T12:00:00Z"
}
```

**Test GET:**
```bash
curl http://localhost:3000/api/share?token=abc123xyz
```

---

### 5.5 Feedback API

**Endpoint:** `POST /api/feedback`

**Test:**
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg_123",
    "rating": 1,
    "reason": "Very helpful"
  }'
```

---

### 5.6 Transcribe API (Whisper)

**Endpoint:** `POST /api/transcribe`

**Test:**
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "file=@/path/to/audio.webm"
```

**Expected:**
```json
{
  "text": "Hello, this is a test transcription",
  "language": "en",
  "duration": 5.2
}
```

---

## 6️⃣ Database Testing (Supabase MCP)

### 6.1 Verify All Tables Exist

**Supabase MCP:**
```javascript
await supabase.list_tables()
```

**Expected Tables:**
1. `experiences` ✅
2. `discovery_chats` ✅
3. `discovery_messages` ✅
4. `citations` ✅
5. `user_memory` ✅
6. `message_attachments` ✅
7. `shared_chats` ✅
8. `message_branches` ✅
9. `prompt_templates` ✅
10. `usage_tracking` ✅
11. `message_feedback` ✅
12. `session_memory` ✅

---

### 6.2 Test RLS Policies

**Test as Authenticated User:**
```sql
-- Should work
SELECT * FROM discovery_chats WHERE user_id = auth.uid();

-- Should fail
SELECT * FROM discovery_chats WHERE user_id != auth.uid();
```

**Test as Anonymous:**
```sql
-- Should work (public experiences)
SELECT * FROM experiences LIMIT 10;

-- Should fail
INSERT INTO discovery_chats (user_id, title) VALUES (auth.uid(), 'Test');
```

---

### 6.3 Test SQL Functions

**Function: `search_by_attributes`**
```sql
SELECT * FROM search_by_attributes(
  'dreams',
  '[{"key": "dream_symbol", "value": "water", "operator": "equals"}]'::jsonb,
  'AND',
  0.7,
  50
);
```

**Function: `geo_search`**
```sql
SELECT * FROM geo_search(
  52.5200, -- Berlin lat
  13.4050, -- Berlin lng
  50, -- 50km radius
  null,
  ARRAY['ufo'],
  100
);
```

**Function: `detect_geo_clusters`**
```sql
SELECT * FROM detect_geo_clusters(
  ARRAY['paranormal'],
  5 -- min points per cluster
);
```

---

## 7️⃣ PWA & Service Worker Testing

### 7.1 Service Worker Registration

**Browser Console:**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs)
})
```

**Verify:**
- ✅ `/sw.js` registered
- ✅ State: `activated`

---

### 7.2 Offline Caching

**Test Steps:**
1. Load page online
2. Go offline (DevTools → Network → Offline)
3. Navigate to `/en/discover`
4. Verify page loads from cache

**Browser Test:**
```javascript
// Enable offline mode
await browser.navigate('http://localhost:3000/en/discover')
await browser.wait(2)

// Disconnect network (manual)

// Refresh page
await browser.navigate('http://localhost:3000/en/discover')
await browser.wait(2)

// Verify page loads
await browser.screenshot()
```

---

### 7.3 Message Queue

**Test Offline Message:**
1. Go offline
2. Send message
3. Check localStorage for queue
4. Go online
5. Verify message syncs

**Browser Console:**
```javascript
// Check queue
const queue = JSON.parse(localStorage.getItem('xpshare-message-queue') || '[]')
console.log('Queued messages:', queue)
```

---

## 8️⃣ Performance Testing

### 8.1 Page Load Time

**Test with Lighthouse:**
```bash
npx lighthouse http://localhost:3000/en/discover --view
```

**Targets:**
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s
- ✅ Largest Contentful Paint < 2.5s

---

### 8.2 API Response Time

**Test Query Speed:**
```bash
time curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Find UFOs in Berlin"}]}'
```

**Target:** < 2 seconds for simple queries

---

### 8.3 Database Query Performance

**Test with EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM experiences
WHERE category_slug = 'ufo'
  AND latitude IS NOT NULL
  AND date_occurred > '2020-01-01'
LIMIT 100;
```

**Target:** < 100ms for indexed queries

---

## 9️⃣ Error Handling Testing

### 9.1 Network Errors

**Test:**
1. Disconnect internet
2. Send message
3. Verify ErrorDisplay

**Expected:**
- ✅ "Connection lost" error
- ✅ Retry button appears
- ✅ Message queued offline

---

### 9.2 Rate Limiting

**Test:**
```bash
# Send 15 requests rapidly
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/discover \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}' &
done
wait
```

**Expected:**
- ✅ Rate limit error after 10 requests (anon)
- ✅ Error message: "Too many requests"
- ✅ Retry-After header

---

### 9.3 Authentication Errors

**Test:**
```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -d '{}'
```

**Expected:**
- ✅ 401 Unauthorized
- ✅ Error message: "Invalid or expired token"

---

## 🔟 Complete Integration Test Script

**Run this complete test sequence:**

```javascript
// Complete XPCHAT Integration Test
async function runCompleteTest() {
  console.log('🚀 Starting XPCHAT Complete Integration Test...')

  // 1. Navigate to discover page
  console.log('1️⃣ Testing Discover Page...')
  await browser.navigate('http://localhost:3000/en/discover')
  await browser.wait(2)
  await browser.screenshot()

  // 2. Test Agent Routing (Orchestrator)
  console.log('2️⃣ Testing Orchestrator Agent...')
  await browser.type('[data-testid="chat-input"]',
    'Show me UFO sightings in Berlin from 2020-2023 with a timeline visualization', true)
  await browser.wait(6)
  await browser.screenshot()

  // 3. Test Search Tool
  console.log('3️⃣ Testing Search Tools...')
  await browser.type('[data-testid="chat-input"]',
    'Find dreams with emotion=peaceful', true)
  await browser.wait(4)

  // 4. Test Visualization
  console.log('4️⃣ Testing Visualizations...')
  await browser.type('[data-testid="chat-input"]',
    'Create geographic map of paranormal events', true)
  await browser.wait(6)
  await browser.screenshot()

  // 5. Test Message Actions
  console.log('5️⃣ Testing Message Actions...')
  await browser.hover('[data-testid="message-1"]')
  await browser.wait(1)
  await browser.click('[aria-label="Copy"]')
  await browser.wait(1)

  // 6. Test Keyboard Shortcuts
  console.log('6️⃣ Testing Keyboard Shortcuts...')
  await browser.press_key('Meta+k')
  await browser.wait(1)
  await browser.press_key('Meta+n')
  await browser.wait(2)

  // 7. Test Memory System
  console.log('7️⃣ Testing Memory System...')
  await browser.navigate('http://localhost:3000/en/discover/preferences')
  await browser.wait(2)
  await browser.screenshot()

  // 8. Test Prompt Library
  console.log('8️⃣ Testing Prompt Library...')
  await browser.navigate('http://localhost:3000/en/discover')
  await browser.click('[data-testid="prompt-library"]')
  await browser.wait(2)
  await browser.click('[data-testid="template-0"]')
  await browser.wait(2)

  // 9. Test Branching
  console.log('9️⃣ Testing Branching...')
  await browser.hover('[data-testid="message-0"]')
  await browser.click('[data-testid="branch-button"]')
  await browser.wait(2)

  // 10. Test Share
  console.log('🔟 Testing Share...')
  await browser.click('[data-testid="chat-menu"]')
  await browser.click('[data-testid="share-chat"]')
  await browser.wait(2)
  await browser.screenshot()

  console.log('✅ Complete Integration Test Finished!')
}

// Execute
await runCompleteTest()
```

---

## 📊 Test Results Checklist

**After running all tests, verify:**

- [ ] ✅ All 5 Agents respond correctly
- [ ] ✅ All 16 Tools execute without errors
- [ ] ✅ All 6 Visualizations render
- [ ] ✅ All 17 Phase 8 Features work
- [ ] ✅ All API Routes return expected data
- [ ] ✅ All Database Tables accessible
- [ ] ✅ Service Worker active
- [ ] ✅ No console errors
- [ ] ✅ No TypeScript errors (critical)
- [ ] ✅ Page load < 3s
- [ ] ✅ API response < 2s
- [ ] ✅ Lighthouse score > 90

---

## 🐛 Known Issues & Workarounds

### Issue 1: File Upload in Browser MCP
**Problem:** Browser MCP may not support file input simulation
**Workaround:** Test file upload manually or with Playwright

### Issue 2: Network Toggle
**Problem:** Browser MCP cannot toggle network on/off
**Workaround:** Use Chrome DevTools manually

### Issue 3: Service Worker Debugging
**Problem:** SW updates may not reflect immediately
**Workaround:** Hard refresh (Cmd+Shift+R) or unregister SW

---

## 📝 Testing Protocols

### Daily Testing (5 min)
1. Load discover page ✅
2. Send simple query ✅
3. Check console for errors ✅
4. Verify visualization loads ✅

### Weekly Testing (30 min)
1. Test all 16 tools ✅
2. Test Phase 8 features ✅
3. Run database checks ✅
4. Performance audit ✅

### Pre-Deployment (60 min)
1. Complete integration test script ✅
2. All API routes ✅
3. Error handling ✅
4. Lighthouse audit ✅
5. Browser compatibility ✅

---

## 🎯 Success Criteria

**Production Ready if:**
- ✅ 100% of critical features work
- ✅ 0 critical errors in production build
- ✅ Lighthouse score > 90
- ✅ All Phase 8 features integrated
- ✅ Database migrations applied
- ✅ No security vulnerabilities

---

**END OF TESTING GUIDE**

Ready to verify all XPCHAT features! 🚀
