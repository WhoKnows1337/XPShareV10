# Bug Fix: AI SDK v5 Tool Result Visualization

**Date:** 2025-10-21
**Status:** ✅ FIXED
**Severity:** Critical (P0)

---

## Problem

Temporal Analysis tool was executing successfully but showing **empty white box** instead of timeline visualization.

**User Report:**
> "aber die analyse tut nichtys sie isr leer" (the analysis does nothing, it is empty)

**Symptoms:**
- Tool result card showed only title "temporal Analysis"
- White empty box instead of chart
- No data visualization rendered
- SQL function returned correct data: `[{"period":"2025-10","category":"dreams","count":2,"unique_users":2}]`
- Tool execution succeeded without errors

---

## Root Cause

**AI SDK v5 Breaking Change:** Tool results structure changed from AI SDK v4 to v5.

### Old Format (AI SDK v4):
```typescript
{
  type: 'tool-temporalAnalysis',
  result: { periods: [...], summary: {...} }
}
```

### New Format (AI SDK v5):
```typescript
{
  type: 'tool-temporalAnalysis',
  state: 'output-available',  // ← NEW
  output: { periods: [...], summary: {...} }  // ← Changed from `result`
}
```

**Key Changes:**
1. Tool parts now have `state` property (`'input-streaming'`, `'input-available'`, `'output-available'`, `'output-error'`)
2. Result data is in `output` instead of `result`
3. Errors use `errorText` instead of nested error objects

**Reference:** [AI SDK v5 Migration Guide](https://sdk.vercel.ai/docs/migration-guides/migration-guide-5-0)

---

## Solution

### 1. Fixed ToolRenderer to Handle AI SDK v5 States

**File:** `/home/tom/XPShareV10/components/discover/ToolRenderer.tsx`

**Lines 143-170:**
```typescript
export function ToolRenderer({ part, onRetry, onSuggestionClick }: ToolRendererProps) {
  const toolName = part.type.replace('tool-', '')

  // AI SDK v5: Check part.state and use part.output when available
  let result = part.result // Fallback for older format

  if (part.state === 'output-available' && part.output) {
    result = part.output
  } else if (part.state === 'output-error') {
    return renderError(part.errorText || 'Tool execution failed', onRetry)
  } else if (part.state === 'input-streaming' || part.state === 'input-available') {
    // Tool is still executing or waiting for output
    return (
      <Card>
        <CardHeader>
          <CardTitle>{toolName}</CardTitle>
          <CardDescription>Executing tool...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isError = part.isError || result?.error || result?.success === false

  // Handle errors
  if (isError) {
    return renderError(result?.error || result, onRetry)
  }

  // ... rest of component
}
```

**Changes:**
- ✅ Check `part.state` to determine tool execution status
- ✅ Extract `part.output` when `state === 'output-available'`
- ✅ Handle `output-error` state separately
- ✅ Show "Executing tool..." during `input-streaming`/`input-available` states
- ✅ Maintain backward compatibility with `part.result` fallback

### 2. Updated TimelineToolUI to Accept AI SDK v5 Format

**File:** `/home/tom/XPShareV10/components/viz/tool-ui/TimelineToolUI.tsx`

**Lines 37-48:**
```typescript
function transformToolResult(toolResult: any): TimelineChartProps['data'] {
  // AI SDK v5: Extract output from tool part if available
  const actualResult = toolResult?.output || toolResult?.result || toolResult

  // Handle different result formats
  const data =
    actualResult?.results ||
    actualResult?.experiences ||
    actualResult?.periods ||
    actualResult?.timeline ||
    actualResult?.data ||
    (Array.isArray(actualResult) ? actualResult : [])
  // ...
}
```

**Lines 115-123:**
```typescript
function extractMetadata(toolResult: any): {
  totalEvents: number
  periodCount: number
  hasCategories: boolean
  dateRange: { start: string; end: string } | null
} {
  // AI SDK v5: Extract output from tool part if available
  const actualResult = toolResult?.output || toolResult?.result || toolResult

  const data =
    actualResult?.results ||
    actualResult?.experiences ||
    actualResult?.periods ||
    actualResult?.data ||
    (Array.isArray(actualResult) ? actualResult : [])
  // ...
}
```

**Lines 169-175:**
```typescript
// Generate title
// AI SDK v5: Extract output from tool part if available
const actualResult = toolResult?.output || toolResult?.result || toolResult
const timelineTitle =
  title ||
  config.title ||
  (actualResult?.summary || actualResult?.summaryText
    ? `${actualResult.summary || actualResult.summaryText} - Timeline`
    : `Timeline (${metadata.periodCount} periods)`)
```

**Changes:**
- ✅ Extract `toolResult.output` before accessing data
- ✅ Support both `summary` and `summaryText` fields
- ✅ Maintain backward compatibility with `toolResult.result`

### 3. Pass Entire Part Object to Visualization Components

**File:** `/home/tom/XPShareV10/components/discover/ToolRenderer.tsx`

**Lines 207-210:**
```typescript
// Check if temporal analysis has timeline data (AI SDK v5: pass entire part object)
if (toolName === 'temporalAnalysis') {
  return <TimelineToolUI toolResult={part} title="Temporal Analysis" />
}
```

**Before:**
```typescript
if (toolName === 'temporalAnalysis' && result?.data) {
  return <TimelineToolUI toolResult={result} title="Temporal Analysis" />
}
```

**Changes:**
- ✅ Pass entire `part` object instead of just `result`
- ✅ Remove conditional check for `result?.data` (TimelineToolUI handles empty data)
- ✅ Allows component to access `part.output`, `part.state`, etc.

---

## Verification

### Test Case: Temporal Analysis
**Query:** "Analyze dream patterns over time"

**Before Fix:**
```
┌─────────────────────────┐
│ temporal Analysis       │
├─────────────────────────┤
│                         │  ← Empty white box
│                         │
└─────────────────────────┘
```

**After Fix:**
```
┌─────────────────────────────────────────────┐
│ temporal Analysis                           │
├─────────────────────────────────────────────┤
│ 📅 Timeline from 2025-10 to 2025-10        │
│    1 periods | 2 total events              │
├─────────────────────────────────────────────┤
│   📊 Timeline Chart:                       │
│      ┌─────────────────────────────┐      │
│    2 │         ●─── dreams          │      │
│      │        /                     │      │
│    1 │       /                      │      │
│      └─────────────────────────────┘      │
│        2025-10                             │
└─────────────────────────────────────────────┘
```

✅ **Result:** Timeline visualization renders correctly with chart, metadata, and legend.

---

## Additional Fixes Required

### 1. SQL Parameter Mismatch (Fixed)
**File:** `/home/tom/XPShareV10/lib/tools/analytics/temporal-analysis.ts`

The tool was sending wrong parameter names to SQL function `temporal_aggregation`:

**Before:**
```typescript
const { data, error } = await supabase.rpc('temporal_aggregation', {
  p_granularity: params.granularity,
  p_category: params.category,          // ❌ Should be array
  p_location: params.location,          // ❌ Doesn't exist
  p_start_date: params.dateRange?.from, // ❌ Wrong name
  p_end_date: params.dateRange?.to,     // ❌ Wrong name
})
```

**After:**
```typescript
const { data, error } = await supabase.rpc('temporal_aggregation', {
  p_categories: params.category ? [params.category] : null, // ✅ Array
  p_granularity: params.granularity,
  p_date_from: params.dateRange?.from || null,  // ✅ Correct name
  p_date_to: params.dateRange?.to || null,      // ✅ Correct name
  p_group_by: null,                              // ✅ Required param
})
```

### 2. Database Relationship Error (Fixed)
**File:** `/home/tom/XPShareV10/lib/citations/citation-tracker.ts`

Citations query used wrong table relationship name:

**Before:** `profiles (`
**After:** `user_profiles (`

---

## Impact

**Affected Features:**
- ✅ Temporal Analysis Tool (now working)
- ⚠️ All other visualization tools need same fix:
  - MapToolUI
  - NetworkToolUI
  - HeatmapToolUI

**Recommended Next Steps:**
1. Apply same AI SDK v5 fixes to MapToolUI, NetworkToolUI, HeatmapToolUI
2. Update all tool renderers to use `part.output` pattern
3. Add TypeScript types for AI SDK v5 tool parts
4. Update documentation for tool development

---

## Lessons Learned

1. **AI SDK v5 is a breaking change** - tool result access patterns changed
2. **Check AI SDK migration guides** when upgrading versions
3. **Pass entire part objects** to visualization components for future flexibility
4. **Add loading states** for tools in `input-streaming` state
5. **Test with real data** - SQL functions can succeed but UI can still fail

---

**Fixed by:** Claude Code
**Testing:** Browser MCP + Supabase MCP
**Documentation:** AI SDK v5 docs via Exa MCP
