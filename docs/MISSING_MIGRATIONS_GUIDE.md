# Missing SQL Migrations Guide

## Problem

Die folgenden 9 Tabellen existieren in der Produktions-Datenbank und in `database.types.ts`, haben aber **keine Migrations** im `/supabase/migrations` Ordner:

1. `citations` - Citations & Source Attribution (Phase 8)
2. `discovery_chats` - Discovery Chat Persistence (Core Feature)
3. `discovery_messages` - Discovery Messages Storage (Core Feature)
4. `message_attachments` - File Uploads (Phase 8)
5. `message_branches` - Branching Conversations (Phase 8)
6. `prompt_templates` - Prompt Library (Phase 8)
7. `shared_chats` - Collaborative Sharing (Phase 8)
8. `usage_tracking` - Cost/Token Tracking (Phase 8)
9. `user_memory` - Memory System (Phase 8)

**Impact:**
- ❌ Deployment zu neuem Environment = Tabellen fehlen
- ❌ Reproduzierbarkeit nicht gegeben
- ❌ Team-Onboarding schwierig
- ❌ Supabase CLI `supabase db push` = incomplete

---

## Solution Option 1: Auto-Generate from Current DB (RECOMMENDED)

### Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase Access Token (from https://supabase.com/dashboard/account/tokens)

### Steps

```bash
# 1. Set your Supabase Access Token
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_TOKEN_HERE"

# 2. Generate diff migration from current DB state
supabase db diff \
  --project-id gtuxnucmbocjtnaiflds \
  --file phase8_tables \
  --linked

# This creates: supabase/migrations/YYYYMMDDHHMMSS_phase8_tables.sql
```

### What This Does
- Connects to your production DB
- Compares with local schema (empty)
- Generates CREATE TABLE statements for all 9 missing tables
- Includes indexes, RLS policies, triggers, functions

### Verification
```bash
# Count CREATE TABLE statements
grep -c "CREATE TABLE" supabase/migrations/*_phase8_tables.sql

# Expected: 9 (one for each table)
```

---

## Solution Option 2: Manual Migration Creation

If auto-generation fails, create migrations manually by exporting table definitions from Supabase Dashboard:

### Steps

1. **Login to Supabase Dashboard:** https://supabase.com/dashboard/project/gtuxnucmbocjtnaiflds

2. **For Each Table (9 total):**
   - Go to Table Editor → Select table → "..." menu → "View SQL Definition"
   - Copy the CREATE TABLE statement
   - Save to `/supabase/migrations/YYYYMMDD_[table_name].sql`

3. **Example for `citations` table:**

```sql
-- supabase/migrations/20251022_citations.sql

CREATE TABLE IF NOT EXISTS public.citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.discovery_messages(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  relevance_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_citations_message_id ON public.citations(message_id);
CREATE INDEX idx_citations_experience_id ON public.citations(experience_id);
CREATE INDEX idx_citations_relevance ON public.citations(relevance_score DESC);

-- RLS Policies
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view citations for their own messages"
  ON public.citations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.discovery_messages dm
      JOIN public.discovery_chats dc ON dm.chat_id = dc.id
      WHERE dm.id = message_id AND dc.user_id = auth.uid()
    )
  );

-- Grants
GRANT SELECT ON public.citations TO authenticated;
GRANT SELECT ON public.citations TO anon;
```

4. **Repeat for all 9 tables**

---

## Solution Option 3: One-Time Export Script

Run the provided helper script to generate all migrations at once:

```bash
# Generate all missing migrations
npx tsx scripts/generate-missing-migrations.ts

# This will create 9 migration files in /supabase/migrations/
```

**Note:** Script is located at `/scripts/generate-missing-migrations.ts` (created with this guide)

---

## Verification After Migration Creation

### 1. Check Migration Files
```bash
# Count migration files for Phase 8 tables
ls -1 supabase/migrations/*citations* \
      supabase/migrations/*discovery_chats* \
      supabase/migrations/*user_memory* | wc -l

# Expected: At least 9 files
```

### 2. Apply to Test Environment
```bash
# Create fresh local test environment
supabase db reset

# Verify all tables exist
supabase db dump --schema-only | grep "CREATE TABLE"

# Expected: Should include all 9 tables
```

### 3. Test Deployment Flow
```bash
# Simulate production deployment
supabase db push --project-id <test-project-id>

# Verify no errors
```

---

## Priority Order

**High Priority (Core Features):**
1. `discovery_chats` - Without this, entire Discovery feature breaks
2. `discovery_messages` - Without this, no messages can be stored

**Medium Priority (Phase 8 Features):**
3. `citations` - Source attribution
4. `shared_chats` - Sharing functionality
5. `user_memory` - Personalization
6. `message_branches` - Branching conversations
7. `message_attachments` - File uploads
8. `usage_tracking` - Cost tracking
9. `prompt_templates` - Prompt library

---

## Current Status (2025-10-21)

- ✅ Tables exist in production DB
- ✅ Tables exist in `database.types.ts` (6053 lines)
- ❌ No migrations in `/supabase/migrations/`
- ⚠️ Deployment risk: HIGH

## Estimated Time to Fix

- **Option 1 (Auto):** 10 minutes
- **Option 2 (Manual):** 2-3 hours (9 tables × 15-20 min each)
- **Option 3 (Script):** 30 minutes

**Recommendation:** Use Option 1 (Auto-Generate) for fastest, most accurate results.
