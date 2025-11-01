# XPChat v3 - Master TODO (0% → 100%)

**Status:** Ready to Execute
**Created:** 2025-10-26
**Timeline:** 8 Weeks to Production
**Effort:** ~160 hours

---

## 🎯 Overview

This is the **complete** implementation path from 0% (current state) to 100% (production-ready XPChat v3).

**Follow this document step-by-step to avoid context loss.**

---

## 📊 Progress Tracking

```
Week 1: [░░░░░░░░░░] 0% - Foundation
Week 2: [░░░░░░░░░░] 0% - Core Backend
Week 3: [░░░░░░░░░░] 0% - Core Frontend
Week 4: [░░░░░░░░░░] 0% - Visualizations
Week 5: [░░░░░░░░░░] 0% - Integration
Week 6: [░░░░░░░░░░] 0% - AI Features
Week 7: [░░░░░░░░░░] 0% - Polish & Testing
Week 8: [░░░░░░░░░░] 0% - Production Deploy
```

**Current Phase:** Not Started
**Last Updated:** 2025-10-26

---

## 🗓️ Week 1: Foundation (20h)

### Phase 1.1: Project Setup (4h)

**Goal:** Set up development environment and dependencies

#### Step 1.1.1: Verify Prerequisites

```bash
# Check versions
node --version  # Should be 18+
npm --version
git --version

# Check Supabase connection
psql $DATABASE_URL -c "SELECT version();"

# Check API keys
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY
echo $NEXT_PUBLIC_MAPBOX_TOKEN
```

- [ ] Node.js 18+ installed
- [ ] Supabase project accessible
- [ ] OpenAI API key valid
- [ ] Anthropic API key valid (optional but recommended)
- [ ] Mapbox token valid

#### Step 1.1.2: Install AI SDK Dependencies

```bash
cd /home/tom/XPShareV10

# AI SDK packages
npm install ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic

# Visualization libraries
npm install recharts mapbox-gl
npm install -D @types/mapbox-gl

# Utility libraries
npm install date-fns zod
```

- [ ] All packages installed successfully
- [ ] No dependency conflicts
- [ ] `npm run dev` starts without errors

#### Step 1.1.3: Environment Variables

Create or update `.env.local`:

```bash
# AI Models
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk...

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

- [ ] All ENV vars set
- [ ] Verified in Vercel dashboard (for production)
- [ ] `.env.local` added to `.gitignore`

**Checkpoint:** ✅ All dependencies installed, ENV vars set, dev server runs

---

### Phase 1.2: Database Schema Updates (6h)

**Goal:** Add tables and functions needed for XPChat v3 + migrate to structured attributes

**IMPORTANT:** See [13-DATABASE-SCHEMA.md](./13-DATABASE-SCHEMA.md) for full schema details

#### Step 1.2.1: Structured Attributes Migration (NEW! 2h)

**Why:** Migrate from JSONB attributes to structured tables for 37x faster queries

```sql
-- 1. Create experience_attributes table
CREATE TABLE IF NOT EXISTS experience_attributes (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence INT DEFAULT 100,
  source TEXT DEFAULT 'user',  -- 'ai' | 'user' | 'question'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experience_id, key)
);

-- 2. Create experience_tags table
CREATE TABLE IF NOT EXISTS experience_tags (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  added_by TEXT DEFAULT 'user',  -- 'user' | 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (experience_id, tag)
);

-- 3. Add indexes (CRITICAL for performance!)
CREATE INDEX idx_attributes_experience ON experience_attributes(experience_id);
CREATE INDEX idx_attributes_key ON experience_attributes(key);
CREATE INDEX idx_attributes_key_value ON experience_attributes(key, value);
CREATE INDEX idx_attributes_confidence ON experience_attributes(confidence);
CREATE INDEX idx_tags_experience ON experience_tags(experience_id);
CREATE INDEX idx_tags_tag ON experience_tags(tag);

-- 4. Enable RLS
ALTER TABLE experience_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_tags ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Attributes visible if experience visible"
  ON experience_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
        AND (e.is_public = true OR e.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own attributes"
  ON experience_attributes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attributes"
  ON experience_attributes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Tags visible if experience visible"
  ON experience_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_tags.experience_id
        AND (e.is_public = true OR e.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own tags"
  ON experience_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_tags.experience_id
        AND e.user_id = auth.uid()
    )
  );

-- 6. OPTIONAL: Migrate existing JSONB data (if you have any)
-- See 13-DATABASE-SCHEMA.md for migration script
```

Test:
```bash
# Test table creation
psql $DATABASE_URL -c "\d experience_attributes"
psql $DATABASE_URL -c "\d experience_tags"

# Test indexes
psql $DATABASE_URL -c "\di experience_attributes*"
psql $DATABASE_URL -c "\di experience_tags*"

# Test RLS
psql $DATABASE_URL -c "SELECT * FROM experience_attributes LIMIT 1;"
```

- [ ] experience_attributes table created
- [ ] experience_tags table created
- [ ] All indexes created (6 total)
- [ ] RLS enabled on both tables
- [ ] RLS policies created (5 total)
- [ ] Test queries run successfully
- [ ] (Optional) Migrated existing JSONB data

**Why this matters:**
- ⚡ 37x faster queries for attribute filtering
- 🎯 Easy incremental AI updates (single row vs entire JSONB)
- 📊 Pattern detection becomes trivial (GROUP BY key, value)
- ✅ Source tracking (know if AI or user provided value)

#### Step 1.2.2: Discovery History Table

```sql
-- Store user's discovery queries and patterns
CREATE TABLE IF NOT EXISTS discovery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  categories_explored TEXT[],
  patterns_found INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 1,
  cost DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_discovery_user_id (user_id),
  INDEX idx_discovery_created_at (created_at)
);

-- Enable RLS
ALTER TABLE discovery_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discovery history"
  ON discovery_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discovery history"
  ON discovery_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Test:
```bash
psql $DATABASE_URL -c "SELECT * FROM discovery_history LIMIT 1;"
```

- [ ] Table created
- [ ] RLS enabled
- [ ] Indexes created
- [ ] Test query runs

#### Step 1.2.2: Update Profiles Table

```sql
-- Add discovery preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discovery_preferences JSONB DEFAULT '{
  "categories": [],
  "notification_frequency": "daily",
  "auto_match": true,
  "favorite_locations": []
}'::jsonb;

-- Function to update preferences
CREATE OR REPLACE FUNCTION update_user_discovery_preferences(
  p_user_id UUID,
  p_categories TEXT[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET discovery_preferences = jsonb_set(
    COALESCE(discovery_preferences, '{}'::jsonb),
    '{categories}',
    to_jsonb(p_categories)
  )
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Test:
```bash
psql $DATABASE_URL -c "SELECT discovery_preferences FROM profiles LIMIT 1;"
```

- [ ] Column added
- [ ] Function created
- [ ] Test query runs

#### Step 1.2.3: Suggestion Clicks Tracking

```sql
-- Track which suggestions users click (for A/B testing)
CREATE TABLE IF NOT EXISTS suggestion_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context TEXT NOT NULL, -- 'welcome', 'followup', 'personalized'
  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_suggestion_clicks_id (suggestion_id),
  INDEX idx_suggestion_clicks_user (user_id)
);

ALTER TABLE suggestion_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clicks"
  ON suggestion_clicks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks"
  ON suggestion_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

- [ ] Table created
- [ ] RLS enabled
- [ ] Test query runs

**Checkpoint:** ✅ All database changes applied and tested

---

### Phase 1.3: Review Existing Code (6h)

**Goal:** Understand what already exists before building

#### Step 1.3.1: Read Existing API Routes

Read and document:

```bash
# Current chat implementation
cat app/api/chat/route.ts

# Experience submission
cat app/api/experiences/route.ts

# Supabase client
cat lib/supabase/client.ts

# OpenAI utilities
cat lib/openai/client.ts
```

Document in a notebook:
- [ ] How does `/api/chat` work currently?
- [ ] What's the generateEmbedding() function signature?
- [ ] How is RLS handled?
- [ ] What's the match_experiences RPC function signature?

#### Step 1.3.2: Read Existing Components

```bash
# Current search UI
cat components/search/ask-ai-stream.tsx

# Experience cards
cat components/experiences/experience-card.tsx

# Submission form
cat app/[locale]/submit/page.tsx
```

Document:
- [ ] What UI components already exist?
- [ ] Can any be reused for XPChat v3?
- [ ] What patterns are used (state management, styling, etc.)?

#### Step 1.3.3: Test Existing Features

```bash
npm run dev
```

Test manually:
- [ ] Navigate to /search (or wherever current chat is)
- [ ] Try a query
- [ ] Check browser console for errors
- [ ] Check network tab for API calls
- [ ] Document response format

**Checkpoint:** ✅ Existing codebase understood, documented, tested

---

### Phase 1.4: Create Directory Structure (2h)

**Goal:** Organize new code cleanly

```bash
# Tools
mkdir -p lib/ai/tools

# API Routes
mkdir -p app/api/xpchat
mkdir -p app/api/suggestions
mkdir -p app/api/submit/chat

# Frontend
mkdir -p app/[locale]/discover
mkdir -p components/discover
mkdir -p components/discover/visualizations

# Utilities
mkdir -p lib/ai/prompts
mkdir -p lib/ai/models
```

Create placeholder files:

```bash
# Tools
touch lib/ai/tools/unified-search.ts
touch lib/ai/tools/visualize.ts
touch lib/ai/tools/discover-patterns.ts
touch lib/ai/tools/manage-context.ts
touch lib/ai/tools/index.ts

# Prompts
touch lib/ai/prompts/system.ts
touch lib/ai/prompts/submission.ts

# Models
touch lib/ai/models/index.ts
```

- [ ] All directories created
- [ ] Placeholder files created
- [ ] Git committed

**Checkpoint:** ✅ Directory structure ready

---

### Phase 1.5: Documentation Review (4h)

**Goal:** Re-read all docs to ensure understanding

Read in order:
- [ ] [00-VISION.md](./00-VISION.md) - Understand philosophy
- [ ] [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) - Understand system design
- [ ] [02-IMPLEMENTATION-PLAN.md](./02-IMPLEMENTATION-PLAN.md) - Understand technical approach
- [ ] [03-TOOLS.md](./03-TOOLS.md) - Understand tool specifications

Take notes on:
- Key decisions and why they were made
- Potential pitfalls
- Questions to ask

**Checkpoint:** ✅ Week 1 Complete! Foundation laid.

---

## 🗓️ Week 2: Core Backend (24h)

### Phase 2.1: Tool #1 - unifiedSearch (6h)

**Goal:** Implement the search tool with 3 modes

#### Step 2.1.1: Create Tool File

File: `lib/ai/tools/unified-search.ts`

```typescript
import { tool } from 'ai'
import { z } from 'zod'
import { generateEmbedding } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export const unifiedSearchTool = tool({
  description: `Search experiences using three modes:
- explore: Vector search for pattern discovery (semantic, finds similar)
- browse: Full-text search with pagination (finds all matching)
- find: High-similarity exact match (finds specific)`,

  parameters: z.object({
    query: z.string().describe('The search query'),
    mode: z.enum(['explore', 'browse', 'find']).default('explore'),
    category: z.string().optional().describe('Filter by category: UFO, Dreams, NDE, Paranormal'),
    location: z.string().optional().describe('Filter by location (city, country)'),
    limit: z.number().default(15).describe('Number of results to return'),
    offset: z.number().default(0).describe('Pagination offset (for browse mode)')
  }),

  execute: async ({ query, mode, category, location, limit, offset }, { context }) => {
    const supabase = context.supabase

    // Generate embedding for query
    const embedding = await generateEmbedding(query)

    if (mode === 'explore') {
      // Vector search (semantic similarity)
      const { data, error } = await supabase.rpc('match_experiences', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: limit,
        filter_category: category || null
      })

      if (error) throw error

      return {
        mode: 'explore',
        query,
        experiences: data,
        total: data.length,
        message: `Found ${data.length} experiences matching "${query}"`
      }
    }

    if (mode === 'browse') {
      // Full-text search with pagination
      let dbQuery = supabase
        .from('experiences')
        .select('*', { count: 'exact' })
        .textSearch('description', query)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (category) {
        dbQuery = dbQuery.eq('category', category)
      }

      const { data, error, count } = await dbQuery

      if (error) throw error

      return {
        mode: 'browse',
        query,
        experiences: data,
        total: count,
        offset,
        limit,
        hasMore: count > offset + limit,
        message: `Showing ${offset + 1}-${offset + data.length} of ${count} results`
      }
    }

    if (mode === 'find') {
      // High-similarity exact match
      const { data, error } = await supabase.rpc('match_experiences', {
        query_embedding: embedding,
        match_threshold: 0.75, // High threshold
        match_count: 5
      })

      if (error) throw error

      return {
        mode: 'find',
        query,
        experiences: data,
        total: data.length,
        message: data.length > 0
          ? `Found ${data.length} highly similar experiences`
          : 'No exact matches found. Try explore mode for broader results.'
      }
    }
  }
})
```

#### Step 2.1.2: Test Tool Standalone

Create test file: `lib/ai/tools/__tests__/unified-search.test.ts`

```typescript
import { unifiedSearchTool } from '../unified-search'

// Manual test (run with: npx tsx lib/ai/tools/__tests__/unified-search.test.ts)
async function testUnifiedSearch() {
  const context = {
    supabase: createClient(),
    userId: 'test-user-id'
  }

  // Test explore mode
  console.log('Testing explore mode...')
  const exploreResult = await unifiedSearchTool.execute(
    { query: 'UFO Bayern', mode: 'explore', limit: 5 },
    { context }
  )
  console.log('Explore result:', exploreResult)

  // Test browse mode
  console.log('Testing browse mode...')
  const browseResult = await unifiedSearchTool.execute(
    { query: 'UFO', mode: 'browse', limit: 10, offset: 0 },
    { context }
  )
  console.log('Browse result:', browseResult)

  // Test find mode
  console.log('Testing find mode...')
  const findResult = await unifiedSearchTool.execute(
    { query: 'helles Licht am Himmel', mode: 'find' },
    { context }
  )
  console.log('Find result:', findResult)
}

testUnifiedSearch().catch(console.error)
```

Run:
```bash
npx tsx lib/ai/tools/__tests__/unified-search.test.ts
```

- [ ] Explore mode works
- [ ] Browse mode works with pagination
- [ ] Find mode works with high threshold
- [ ] Category filter works
- [ ] No errors in console

**Checkpoint:** ✅ unifiedSearch tool complete and tested

---

### Phase 2.2: Tool #2 - visualize (6h)

**Goal:** Implement visualization data preparation tool

File: `lib/ai/tools/visualize.ts`

```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const visualizeTool = tool({
  description: `Generate visualization data from experiences. Supports:
- map: GeoJSON for geographic visualization
- timeline: Time-series data aggregation
- dashboard: Statistical overview
- network: Relationship visualization`,

  parameters: z.object({
    type: z.enum(['map', 'timeline', 'dashboard', 'network']),
    experienceIds: z.array(z.string()).describe('IDs of experiences to visualize'),
    groupBy: z.enum(['day', 'month', 'year']).optional().describe('For timeline'),
    metric: z.string().optional().describe('Metric to visualize')
  }),

  execute: async ({ type, experienceIds, groupBy, metric }, { context }) => {
    const supabase = context.supabase

    // Fetch experiences
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*')
      .in('id', experienceIds)

    if (error) throw error

    if (type === 'map') {
      // Generate GeoJSON
      const features = experiences
        .filter(exp => exp.lat && exp.lng)
        .map(exp => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [exp.lng, exp.lat]
          },
          properties: {
            id: exp.id,
            title: exp.title,
            category: exp.category,
            date: exp.date_occurred
          }
        }))

      return {
        type: 'map',
        geoJSON: {
          type: 'FeatureCollection',
          features
        },
        stats: {
          total: features.length,
          withLocation: features.length,
          withoutLocation: experiences.length - features.length
        }
      }
    }

    if (type === 'timeline') {
      // Aggregate by time period
      const grouped = experiences.reduce((acc, exp) => {
        if (!exp.date_occurred) return acc

        const date = new Date(exp.date_occurred)
        let key: string

        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0]
        } else if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else {
          key = String(date.getFullYear())
        }

        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const data = Object.entries(grouped)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        type: 'timeline',
        data,
        groupBy,
        stats: {
          total: experiences.length,
          dataPoints: data.length,
          peak: data.reduce((max, curr) => curr.count > max.count ? curr : max, data[0])
        }
      }
    }

    if (type === 'dashboard') {
      // Statistical overview
      const byCategory = experiences.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byLocation = experiences.reduce((acc, exp) => {
        if (exp.location) {
          acc[exp.location] = (acc[exp.location] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const topLocations = Object.entries(byLocation)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }))

      return {
        type: 'dashboard',
        stats: {
          total: experiences.length,
          byCategory,
          topLocations,
          timeRange: {
            earliest: experiences.reduce((min, exp) =>
              exp.date_occurred < min ? exp.date_occurred : min,
              experiences[0]?.date_occurred
            ),
            latest: experiences.reduce((max, exp) =>
              exp.date_occurred > max ? exp.date_occurred : max,
              experiences[0]?.date_occurred
            )
          }
        }
      }
    }

    if (type === 'network') {
      // Relationship visualization
      // Implementation depends on what relationships to show
      // For now, return category connections
      const categories = Array.from(new Set(experiences.map(e => e.category)))

      return {
        type: 'network',
        nodes: categories.map(cat => ({
          id: cat,
          label: cat,
          value: experiences.filter(e => e.category === cat).length
        })),
        links: [], // TODO: Implement cross-category connections
        message: 'Network visualization data prepared'
      }
    }
  }
})
```

Test similarly to unifiedSearch.

- [ ] Map visualization data generated correctly
- [ ] Timeline aggregation works
- [ ] Dashboard stats calculated
- [ ] Network data prepared

**Checkpoint:** ✅ visualize tool complete

---

### Phase 2.3: Tool #3 & #4 - Patterns & Context (6h)

**Goal:** Implement remaining tools

Create `lib/ai/tools/discover-patterns.ts` and `lib/ai/tools/manage-context.ts` based on [03-TOOLS.md](./03-TOOLS.md).

(Implementation details similar to above, following the specifications in 03-TOOLS.md)

- [ ] discoverPatterns tool created
- [ ] manageContext tool created
- [ ] Both tested standalone
- [ ] All 4 tools exported from index.ts

**Checkpoint:** ✅ All 4 core tools implemented

---

### Phase 2.4: API Route - /api/xpchat (6h)

**Goal:** Create main chat endpoint

File: `app/api/xpchat/route.ts`

```typescript
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { unifiedSearchTool, visualizeTool, discoverPatternsTool, manageContextTool } from '@/lib/ai/tools'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Auth check
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Create RLS-safe context
    const context = {
      supabase,
      userId: user.id
    }

    // Stream response with tools
    const stream = await streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages,
      system: `Du bist Discovery-Assistent für XPShare.

Tools: unifiedSearch, visualize, discoverPatterns, manageContext
Verhalten: Prägnant, hilfreich, auf Deutsch
Nutze Tools aktiv. Biete Follow-ups.`,
      tools: {
        unifiedSearch: unifiedSearchTool,
        visualize: visualizeTool,
        discoverPatterns: discoverPatternsTool,
        manageContext: manageContextTool
      },
      experimental_context: context,

      // Save to history on finish
      onFinish: async ({ usage, text }) => {
        await supabase.from('discovery_history').insert({
          user_id: user.id,
          query: messages[messages.length - 1].content,
          categories_explored: [], // Extract from tool results
          interactions: messages.length,
          cost: calculateCost(usage)
        })
      }
    })

    return stream.toDataStreamResponse()
  } catch (error) {
    console.error('[xpchat] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}

function calculateCost(usage: any): number {
  // Rough estimate: $0.003 per 1k tokens for Sonnet
  const totalTokens = (usage.promptTokens || 0) + (usage.completionTokens || 0)
  return (totalTokens / 1000) * 0.003
}
```

Test:

```bash
curl -X POST http://localhost:3000/api/xpchat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages":[{"role":"user","content":"UFO in Bayern"}]}'
```

- [ ] API route responds
- [ ] Tools are called
- [ ] Streaming works
- [ ] Discovery history saved
- [ ] Auth works

**Checkpoint:** ✅ Week 2 Complete! Backend ready.

---

## 🗓️ Week 3: Core Frontend (24h)

### Phase 3.1: Welcome Screen (4h)

**Goal:** Create the initial landing experience

File: `components/discover/WelcomeScreen.tsx`

(Implementation as per [10-SMART-SUGGESTIONS.md](./10-SMART-SUGGESTIONS.md))

- [ ] WELCOME_SUGGESTIONS defined
- [ ] SuggestionCard components render
- [ ] Click handlers work
- [ ] Responsive layout (mobile + desktop)

**Checkpoint:** ✅ Welcome screen complete

---

### Phase 3.2: Chat Page (6h)

**Goal:** Build main /discover page

File: `app/[locale]/discover/page.tsx`

```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { WelcomeScreen } from '@/components/discover/WelcomeScreen'
import { MessageBubble } from '@/components/discover/MessageBubble'
import { ChatInput } from '@/components/discover/ChatInput'

export default function DiscoverPage() {
  const { messages, input, setInput, sendMessage, status } = useChat({
    api: '/api/xpchat'
  })

  const handleSend = (text: string) => {
    sendMessage({ content: text })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Entdecke das Außergewöhnliche</h1>
        <button
          onClick={() => {
            // Reset conversation
            window.location.reload()
          }}
          className="text-sm text-gray-600"
        >
          Neue Suche
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <WelcomeScreen onQuestionSelect={handleSend} />
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {status === 'pending' && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="border-t">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={status !== 'idle'}
        />
      </footer>
    </div>
  )
}
```

- [ ] Page renders
- [ ] Welcome screen shows on first visit
- [ ] Messages display correctly
- [ ] Input works
- [ ] Can send queries
- [ ] Responses stream in

**Checkpoint:** ✅ Chat page functional

---

### Phase 3.3: Message Bubble (4h)

**Goal:** Display user and AI messages with tool results

File: `components/discover/MessageBubble.tsx`

```typescript
'use client'

import { Message } from 'ai'
import { cn } from '@/lib/utils'
import { ToolRenderer } from './ToolRenderer'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      'flex',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-900'
      )}>
        {/* Text Content */}
        {message.content && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Tool Invocations */}
        {message.toolInvocations?.map(tool => (
          <ToolRenderer key={tool.toolCallId} tool={tool} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] User messages styled correctly
- [ ] AI messages styled correctly
- [ ] Tool results render
- [ ] Markdown formatting works (if using react-markdown)

**Checkpoint:** ✅ Message bubbles complete

---

### Phase 3.4: Tool Renderer (6h)

**Goal:** Render tool results appropriately

File: `components/discover/ToolRenderer.tsx`

```typescript
'use client'

import { ExperiencesList } from './ExperiencesList'
import { MapView, TimelineView, DashboardView } from './visualizations'

export function ToolRenderer({ tool }: { tool: ToolInvocation }) {
  const { toolName, args, result, state } = tool

  if (state === 'call') {
    return (
      <div className="mt-2 text-sm text-gray-600 italic">
        Calling {toolName}...
      </div>
    )
  }

  if (state === 'result' && result) {
    if (toolName === 'unifiedSearch') {
      return <ExperiencesList experiences={result.experiences} />
    }

    if (toolName === 'visualize') {
      if (result.type === 'map') {
        return <MapView geoJSON={result.geoJSON} />
      }
      if (result.type === 'timeline') {
        return <TimelineView data={result.data} />
      }
      if (result.type === 'dashboard') {
        return <DashboardView stats={result.stats} />
      }
    }

    // Default: Show raw result
    return (
      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    )
  }

  return null
}
```

- [ ] unifiedSearch results render as experience cards
- [ ] visualize results render as appropriate viz
- [ ] Loading states show
- [ ] Error states handle gracefully

**Checkpoint:** ✅ Tool rendering complete

---

### Phase 3.5: ChatInput Component (4h)

**Goal:** Create responsive, mobile-friendly input

File: `components/discover/ChatInput.tsx`

(Implementation as per [12-MOBILE-FIRST.md](./12-MOBILE-FIRST.md))

- [ ] Auto-resizing textarea
- [ ] Send button
- [ ] Attachment button (placeholder)
- [ ] Enter to send, Shift+Enter for newline
- [ ] Mobile-optimized

**Checkpoint:** ✅ Week 3 Complete! Core UI functional.

---

## 🗓️ Week 4: Visualizations (24h)

### Phase 4.1: Map View (6h)

File: `components/discover/visualizations/MapView.tsx`

(Implementation as per [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md))

- [ ] Mapbox integration
- [ ] GeoJSON rendering
- [ ] Clustering
- [ ] Popups on click
- [ ] Fit bounds to data

**Checkpoint:** ✅ Map view complete

---

### Phase 4.2: Timeline View (6h)

File: `components/discover/visualizations/TimelineView.tsx`

(Implementation as per [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md))

- [ ] Recharts integration
- [ ] Time aggregation (day/month/year)
- [ ] Interactive chart
- [ ] Mobile responsive

**Checkpoint:** ✅ Timeline view complete

---

### Phase 4.3: Dashboard View (6h)

File: `components/discover/visualizations/DashboardView.tsx`

(Implementation as per [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md))

- [ ] Metric cards
- [ ] Category distribution chart
- [ ] Top locations list
- [ ] Time range display

**Checkpoint:** ✅ Dashboard view complete

---

### Phase 4.4: Experiences List (3h)

File: `components/discover/ExperiencesList.tsx`

```typescript
'use client'

import { ExperienceCard } from '@/components/experiences/experience-card'

export function ExperiencesList({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) {
    return (
      <div className="text-gray-600 text-center py-8">
        Keine Erlebnisse gefunden.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-gray-600">
        {experiences.length} Erlebnisse gefunden
      </p>
      {experiences.map(exp => (
        <ExperienceCard key={exp.id} experience={exp} compact />
      ))}
    </div>
  )
}
```

- [ ] Renders experience cards
- [ ] Compact mode
- [ ] Click to open detail page
- [ ] Shows count

**Checkpoint:** ✅ Experiences list complete

---

### Phase 4.5: Visual System Integration (3h)

**Goal:** Connect visualization selection logic

File: `lib/ai/visualization-selector.ts`

(Implementation as per [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md))

- [ ] shouldShowMap() logic
- [ ] shouldShowTimeline() logic
- [ ] shouldShowDashboard() logic
- [ ] selectVisualization() prioritization

**Checkpoint:** ✅ Week 4 Complete! Visualizations ready.

---

## 🗓️ Week 5: Integration (20h)

### Phase 5.1: Discovery → Submission Context (6h)

**Goal:** Pass context from chat to submission

Modify `/discover/page.tsx` to detect submission intent:

```typescript
const shouldShowSubmissionPrompt = useMemo(() => {
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'assistant') {
    const searchResults = lastMessage.toolInvocations
      ?.find(t => t.toolName === 'unifiedSearch')
      ?.result

    return searchResults?.experiences?.length > 0
  }
  return false
}, [messages])
```

Add SubmissionPrompt component:

```typescript
{shouldShowSubmissionPrompt && (
  <SubmissionPrompt
    onSubmit={() => {
      const context = extractContextFromMessages(messages)
      router.push(`/submit?context=${encodeContext(context)}`)
    }}
  />
)}
```

- [ ] Context extraction works
- [ ] URL encoding works
- [ ] Submission page receives context

**Checkpoint:** ✅ Discovery → Submission link complete

---

### Phase 5.2: Auto-Matching After Submission (6h)

**Goal:** Match experiences automatically after submission

Modify `app/api/experiences/route.ts`:

```typescript
// After inserting experience and generating embedding
const { data: matches } = await supabase.rpc('match_experiences', {
  query_embedding: embedding,
  match_threshold: 0.75,
  match_count: 10
})

// Create notifications for matched users
if (matches.length > 0) {
  await Promise.all(
    matches.map(match =>
      supabase.from('notifications').insert({
        user_id: match.user_id,
        type: 'experience_match',
        title: 'Ähnliches Erlebnis gefunden!',
        message: `Jemand hat ein Erlebnis geteilt, das deinem sehr ähnlich ist.`,
        link: `/experiences/${experience.id}`,
        metadata: {
          similarity: match.similarity,
          new_experience_id: experience.id,
          your_experience_id: match.id
        }
      })
    )
  )
}
```

- [ ] Auto-matching runs after submission
- [ ] Notifications created
- [ ] High threshold (0.75) works

**Checkpoint:** ✅ Auto-matching complete

---

### Phase 5.3: Notification Bell (4h)

**Goal:** Show notifications in navbar

File: `components/layout/NotificationBell.tsx`

(Implementation as per [08-INTEGRATION.md](./08-INTEGRATION.md))

- [ ] Bell icon with badge
- [ ] Popover with notifications
- [ ] Mark as read functionality
- [ ] Polling every 30s

**Checkpoint:** ✅ Notifications complete

---

### Phase 5.4: Profile Integration (4h)

**Goal:** Show discovery stats on profile

Modify `app/[locale]/profile/page.tsx`:

```typescript
// Fetch discovery history
const { data: discoveryStats } = await supabase
  .from('discovery_history')
  .select('*')
  .eq('user_id', user.id)

const topCategories = extractTopCategories(discoveryStats)
```

Add DiscoveryStats component showing:
- Total queries
- Patterns discovered
- Top categories
- Saved searches

- [ ] Discovery stats display
- [ ] Category cloud renders
- [ ] Links back to /discover

**Checkpoint:** ✅ Week 5 Complete! Integration done.

---

## 🗓️ Week 6: AI Features (20h)

### Phase 6.1: Smart Suggestions API (6h)

**Goal:** Create personalized suggestions

File: `app/api/suggestions/route.ts`

(Implementation as per [10-SMART-SUGGESTIONS.md](./10-SMART-SUGGESTIONS.md))

- [ ] Welcome suggestions
- [ ] Follow-up suggestions
- [ ] Personalized suggestions (based on history)
- [ ] Submission questions

**Checkpoint:** ✅ Suggestions API complete

---

### Phase 6.2: Follow-Up Bar (4h)

**Goal:** Show AI-generated follow-ups after each response

File: `components/discover/FollowUpBar.tsx`

(Implementation as per [10-SMART-SUGGESTIONS.md](./10-SMART-SUGGESTIONS.md))

- [ ] Appears after AI response
- [ ] Shows 3-4 relevant suggestions
- [ ] Click sends as new query
- [ ] Mobile-optimized buttons

**Checkpoint:** ✅ Follow-ups complete

---

### Phase 6.3: AI-Guided Submission (Start) (10h)

**Goal:** Build conversational submission flow

File: `app/[locale]/submit/ai-guided/page.tsx`

(Implementation as per [11-SUBMISSION-FLOW.md](./11-SUBMISSION-FLOW.md))

Phases to implement:
1. Discovery Context
2. Story Collection
3. Clarifying Questions
4. Context & Enrichment
5. AI Analysis & Tagging
6. Similarity Matching
7. Privacy & Visibility
8. Final Review

- [ ] Multi-phase flow works
- [ ] Context passed between phases
- [ ] Progress bar shows current phase
- [ ] Can go back to edit

**Checkpoint:** ✅ AI-Guided Submission MVP complete

---

## 🗓️ Week 7: Polish & Testing (20h)

### Phase 7.1: Mobile Optimization (6h)

**Goal:** Ensure mobile experience is excellent

Tasks:
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Fix touch target sizes (min 44×44px)
- [ ] Fix safe area insets
- [ ] Optimize images (Next.js Image)
- [ ] Add loading skeletons
- [ ] Test offline behavior

(Reference [12-MOBILE-FIRST.md](./12-MOBILE-FIRST.md))

**Checkpoint:** ✅ Mobile optimized

---

### Phase 7.2: Error Handling (4h)

**Goal:** Graceful error handling everywhere

Add error boundaries:
- [ ] Chat page error boundary
- [ ] Visualization error boundaries
- [ ] API error responses (proper status codes)
- [ ] User-friendly error messages
- [ ] Retry mechanisms for failed requests

**Checkpoint:** ✅ Error handling complete

---

### Phase 7.3: Manual Testing (6h)

**Goal:** Test all user journeys

Test scenarios from [04-UX-SCENARIOS.md](./04-UX-SCENARIOS.md):
- [ ] Journey 1: First-Time Experiencer (Sarah)
- [ ] Journey 2: Pattern Explorer (Michael)
- [ ] Journey 3: Academic Researcher (Dr. Anna)
- [ ] Journey 4: Casual Browser (Tom)

Document bugs in GitHub Issues.

**Checkpoint:** ✅ Manual testing complete

---

### Phase 7.4: Performance Optimization (4h)

**Goal:** Ensure fast load times

Tasks:
- [ ] Lazy load visualizations
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle size analysis
- [ ] Lighthouse audit (score > 90)

```bash
npm run build
npm run analyze # If using @next/bundle-analyzer
```

- [ ] Initial load < 3s
- [ ] Time to interactive < 5s
- [ ] Lighthouse Performance > 90

**Checkpoint:** ✅ Performance optimized

---

## 🗓️ Week 8: Production Deploy (12h)

### Phase 8.1: Environment Setup (2h)

**Goal:** Configure production environment

Vercel Dashboard:
- [ ] Add all ENV vars
- [ ] Configure custom domain (if any)
- [ ] Set up preview deployments
- [ ] Configure edge functions region

**Checkpoint:** ✅ Environment configured

---

### Phase 8.2: Database Migrations (2h)

**Goal:** Apply all schema changes to production

```bash
# Review all migrations
ls supabase/migrations/

# Apply to production (via Supabase dashboard or CLI)
supabase db push --linked
```

- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Functions deployed

**Checkpoint:** ✅ Database migrated

---

### Phase 8.3: Deploy to Production (2h)

**Goal:** Ship it!

```bash
git add .
git commit -m "Complete XPChat v3 implementation

- Add AI SDK 5.0 with tool calling
- Create 4 core tools (unifiedSearch, visualize, discoverPatterns, manageContext)
- Build /discover page with chat UI
- Implement map, timeline, dashboard visualizations
- Add AI-guided submission flow
- Integrate discovery → submission → profile flows
- Add smart suggestions & follow-ups
- Mobile-first design
- Auto-matching after submission
- Notification system

Ready for testing!

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

Vercel will auto-deploy.

- [ ] Deploy succeeds
- [ ] No build errors
- [ ] Preview URL works

**Checkpoint:** ✅ Deployed!

---

### Phase 8.4: Smoke Testing (2h)

**Goal:** Test critical paths in production

Test on production URL:
- [ ] Can open /discover
- [ ] Can send query
- [ ] AI responds
- [ ] Tools work
- [ ] Visualizations render
- [ ] Can submit experience
- [ ] Auto-matching works
- [ ] Notifications appear

**Checkpoint:** ✅ Production validated

---

### Phase 8.5: Monitoring Setup (2h)

**Goal:** Set up observability

Tools:
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry or similar)
- [ ] API cost monitoring (OpenAI/Anthropic dashboards)
- [ ] Supabase metrics

Create dashboard to monitor:
- Queries per day
- Average response time
- Error rate
- Cost per query
- User engagement

**Checkpoint:** ✅ Monitoring active

---

### Phase 8.6: Documentation Update (2h)

**Goal:** Update docs with learnings

Add to each doc (00-VISION through 12-MOBILE):

```markdown
## 📝 Notes & Learnings

### What Went Well
- ...

### What Was Challenging
- ...

### What to Do Differently Next Time
- ...
```

Update this TODO-MASTER.md:
- [ ] Mark all phases as complete
- [ ] Update progress bars
- [ ] Note any deviations from plan

**Checkpoint:** ✅ Week 8 Complete! 🎉

---

## ✅ Final Checklist

### **Feature Completeness**

- [ ] Chat UI functional
- [ ] All 4 tools working
- [ ] Visualizations rendering
- [ ] Smart suggestions appearing
- [ ] Auto-matching after submission
- [ ] Notifications working
- [ ] Mobile optimized
- [ ] Error handling in place

### **Quality**

- [ ] No critical bugs
- [ ] Response time < 5s avg
- [ ] Cost per query < $0.01
- [ ] Lighthouse score > 90
- [ ] Mobile experience excellent
- [ ] Accessibility basics (skip links, ARIA)

### **Documentation**

- [ ] All docs updated with learnings
- [ ] Code commented
- [ ] README updated
- [ ] ENV vars documented

### **Business**

- [ ] Monitoring active
- [ ] Cost tracking setup
- [ ] User feedback mechanism
- [ ] Success metrics defined

---

## 🎉 DONE!

**Congratulations!** You've built XPChat v3 from 0% to 100%.

**Next Steps:**
1. Monitor for 1 week
2. Collect user feedback
3. Iterate based on data
4. Plan Phase 2 enhancements (see docs for ideas)

**Remember:** This is a **Discovery Ecosystem**, not just a feature. Keep iterating!

---

**Estimated Total Time:** 160 hours
**Actual Time:** _____ hours (fill in after completion)

**Start Date:** _____
**End Date:** _____

**Team:**
- Developer: _____
- Designer: _____ (optional)
- PM: _____ (optional)

**Success!** 🚀
