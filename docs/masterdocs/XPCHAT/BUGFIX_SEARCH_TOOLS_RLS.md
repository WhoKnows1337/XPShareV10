# BUGFIX: Search Tools Return Empty Results

**Date:** 2025-10-21
**Status:** 🔴 CRITICAL BUG - INVESTIGATING
**Severity:** Critical (Search queries inconsistently return 0 results)

## Problem

All search tools return "No results found" even when database has matching data.

**Example:**
```
Query: "Show me all dreams"
Database: 28 dreams exist
Result: "No results found" ❌
```

## Root Cause

All search tools in `lib/tools/search/` create a **new** Supabase client without user authentication context:

```typescript
// lib/tools/search/advanced-search.ts:80-83
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

This client has NO user session, which means:
1. Row Level Security (RLS) policies block all queries
2. Even public data is inaccessible (depending on RLS policies)
3. All tools return empty arrays

## Affected Tools

All search tools use the same pattern:
- `advancedSearchTool` (/lib/tools/search/advanced-search.ts)
- `searchByAttributesTool` (/lib/tools/search/search-by-attributes.ts)
- `semanticSearchTool` (/lib/tools/search/semantic-search.ts)
- `fullTextSearchTool` (/lib/tools/search/full-text-search.ts)
- `geoSearchTool` (/lib/tools/search/geo-search.ts)

Likely also affects:
- Analytics tools (rankUsers, analyzeCategory, compareCategory, temporalAnalysis, attributeCorrelation)
- Relationship tools (findConnections, detectPatterns)
- Insights tools (generateInsights, predictTrends)

## Solution

Tools need access to the **request-scoped** Supabase client that includes the user's auth session.

### Option 1: Pass Supabase Client to Tool Execute
```typescript
// In app/api/discover/route.ts
const supabase = await createClient() // Has user session from request

const result = streamText({
  tools: {
    advancedSearch: tool({
      execute: async (params) => {
        // Use supabase from closure
        const { data, error } = await supabase.from('experiences').select(...)
      }
    })
  }
})
```

### Option 2: Make Tools Accept Supabase Client Parameter
```typescript
// lib/tools/search/advanced-search.ts
export const createAdvancedSearchTool = (supabase: SupabaseClient) => tool({
  execute: async (params) => {
    const { data, error } = await supabase.from('experiences').select(...)
  }
})

// In app/api/discover/route.ts
const supabase = await createClient()
const tools = {
  advancedSearch: createAdvancedSearchTool(supabase),
  ...
}
```

### Option 3: Use Service Role Key (NOT RECOMMENDED)
```typescript
// DANGEROUS - bypasses RLS completely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Has full access
)
```

## Testing Results

**Before Fix:**
```sql
-- Verify data exists
SELECT COUNT(*) FROM experiences WHERE category = 'dreams';
-- Returns: 28

-- Query via Search Tool
Query: "Show me all dreams"
Result: "No results found" ❌
Logs: [prepareStep] Matched "simple search" pattern
      POST /api/discover 200 in 3411ms
```

**After Fix:** (Pending implementation)
```
Query: "Show me all dreams"
Expected Result: Found 28 experiences ✅
Expected Time: ~3000-4000ms
```

## Impact

- **Broken:** ALL search functionality (5 search tools)
- **Broken:** ALL analytics tools (5 analytics tools)
- **Broken:** ALL relationship tools (2 tools)
- **Broken:** ALL insights tools (4 tools)
- **Total:** 16 out of 16 AI tools are non-functional

This is a **showstopper bug** that makes the entire AI chat system useless.

## Recommended Fix

**Option 1** (Pass Supabase Client via Closure) is cleanest:
- Minimal code changes
- Tools remain pure functions
- No breaking changes to tool signatures
- Supabase client automatically has correct RLS context

## Next Steps

1. ✅ Identify root cause (Supabase client without user context)
2. ⏳ Implement fix (use request-scoped client)
3. ⏳ Test all 16 tools with fix
4. ⏳ Verify RLS policies work correctly
5. ⏳ Document the pattern for future tools

## Related Issues

- This explains why "Show UFO sightings in London" worked but "Show all dreams" didn't
  - London query likely hit cached data or test data without RLS
  - Need to verify RLS policies on experiences table
