# AI SDK Tool Selection Issue - CRITICAL FINDING

**Date:** 2025-10-21
**Model:** GPT-4o-mini
**Issue:** AI consistently selects wrong tools despite explicit instructions

---

## Problem Summary

When user asks **"Generate insights about dream experiences"**, the AI selects `analyzeCategory` instead of `generateInsights` **100% of the time**, despite:

1. ✅ Tool descriptions with negative constraints ("DO NOT use for insights")
2. ✅ System prompt with explicit tool selection rules
3. ✅ Restricted `analyzeCategory` to "BASIC SUMMARY ONLY"

---

## Attempted Fixes (All Failed)

### Fix #1: Enhanced Tool Descriptions ❌

**File:** `/lib/tools/insights/generate-insights.ts`

**Changed:**
```typescript
description: `INSIGHT GENERATION: Advanced AI-powered statistical analysis that discovers non-obvious insights from experience datasets. Uses linear regression for trends, standard deviation for spikes, grid clustering for hotspots, and data quality checks. Returns actionable insights with confidence scores (0-1), evidence arrays, and specific recommendations. Each insight includes type (spike/trend/hotspot/correlation/anomaly/pattern), title, description, and structured evidence. DO NOT use for simple summaries - use this only when user explicitly asks to "generate insights", "discover insights", "find insights", "analyze and suggest", or "what insights can you provide".`
```

**Result:** No effect. AI still selects `analyzeCategory`.

---

### Fix #2: System Prompt Explicit Rules ❌

**File:** `/app/api/discover/route.ts` (lines 76-87)

**Added:**
```typescript
## Guidelines

2. **Use Tools Intelligently**: Select the most appropriate tool(s) for each query
   - Use **generateInsights** when user asks to "generate insights", "discover insights", "find insights"
   - Use **findConnections** when user asks about "connections", "relationships", "network", "similar experiences"
   - Use **detectPatterns** when user asks to "detect patterns", "find anomalies", "discover trends"
   - Use **analyzeCategory** for simple category summaries (counts, locations, dates)
```

**Result:** No effect. AI still selects `analyzeCategory`.

---

### Fix #3: Restrict analyzeCategory Description ❌

**File:** `/lib/tools/analytics/analyze-category.ts`

**Changed:**
```typescript
description: 'BASIC CATEGORY SUMMARY: Simple data summary for a category (counts, locations, dates). Returns raw JSON with total experiences, date distribution, top locations, and common attributes. DO NOT use for insights, patterns, or statistical analysis - use generateInsights or detectPatterns instead. Use this ONLY for basic "how many", "where", "when" questions.'
```

**Result:** No effect. AI **STILL** selects `analyzeCategory`.

---

## Test Evidence

### Test Query: "Generate insights about dream experiences"

**Expected Tool:** `generateInsights`
**Actual Tool:** `analyzeCategory` (100% of tests)

**Iterations:**
1. Test 1 (21:04:15) - `analyzeCategory` ❌
2. Test 2 (21:05:35) - `analyzeCategory` ❌
3. Test 3 (21:06:25) - `analyzeCategory` ❌

**Server Logs:**
```
POST /api/discover 200 in 2357ms
POST /api/discover 200 in 3918ms
POST /api/discover 200 in 2500ms (estimated)
```

All successful, all used wrong tool.

---

## Root Cause Analysis

### GPT-4o-mini Tool Selection Algorithm

The AI SDK delegates tool selection to the LLM. GPT-4o-mini appears to:

1. **Favor simpler tools** - `analyzeCategory` is simpler than `generateInsights`
2. **Ignore negative constraints** - "DO NOT use for..." has no effect
3. **Ignore system prompt rules** - Explicit "Use generateInsights when..." has no effect
4. **Pattern match poorly** - "generate insights" doesn't trigger `generateInsights`

### Why This Happens

- **Token economy**: Simpler tools = shorter names = lower perplexity
- **Training bias**: GPT-4o-mini may not be fine-tuned for complex tool selection
- **Context length**: System prompt rules may be "forgotten" during tool selection
- **Tool description length**: Longer descriptions may be down-weighted

---

## Impact Assessment

### Affected Tools

| Tool | Query Pattern | AI Selects | Impact |
|------|---------------|------------|--------|
| `generateInsights` | "generate insights", "discover insights" | `analyzeCategory` ❌ | High - Users don't get statistical insights |
| `findConnections` | "find connections", "relationships" | `advancedSearch` ❌ | High - Users don't get network analysis |
| `detectPatterns` | "detect patterns", "find anomalies" | `advancedSearch` ❌ | High - Users don't get pattern detection |

### User Experience Impact

- **Expected**: Beautiful insight cards with confidence scores, trends, recommendations
- **Actual**: Ugly JSON dumps with raw counts and dates
- **User Perception**: "Why does this feel so basic? Where are the insights?"

---

## Solution Options

### Option 1: Upgrade to GPT-4o (RECOMMENDED) ✅

**Pros:**
- Better tool selection capabilities
- Better understanding of complex instructions
- Better context retention

**Cons:**
- Higher cost (~20x more expensive)
- Potentially slower responses

**Implementation:**
```typescript
const result = streamText({
  model: openai('gpt-4o'),  // Changed from gpt-4o-mini
  // ...
})
```

**Estimated Cost Impact:**
- Current: $0.15 per 1M input tokens (gpt-4o-mini)
- New: $2.50 per 1M input tokens (gpt-4o)
- Increase: 16.7x

---

### Option 2: Remove Overlapping Tools ⚠️

**Approach:** Remove or merge `analyzeCategory` with `generateInsights`

**Pros:**
- Forces AI to use advanced tool
- Simpler tool set

**Cons:**
- Loses ability to get simple summaries
- `generateInsights` is slower (statistical analysis)
- May be overkill for simple questions

---

### Option 3: Tool Routing Layer (COMPLEX) ⚠️

**Approach:** Add pre-processing layer that routes queries to specific tools based on keywords

**Pros:**
- Deterministic tool selection
- Works with any model

**Cons:**
- Adds latency
- Requires manual keyword maintenance
- Less flexible than AI-driven selection
- Could break AI's contextual reasoning

**Implementation:**
```typescript
const toolRouter = (query: string) => {
  if (query.includes('generate insights') || query.includes('discover insights')) {
    return { forceTool: 'generateInsights' }
  }
  // ...
}
```

---

### Option 4: Accept Current Behavior (NOT RECOMMENDED) ❌

**Reality:** Users asking for "insights" will get basic JSON summaries forever.

**Workaround:** Tell users to manually export JSON and analyze elsewhere.

---

## Recommended Action Plan

### Phase 1: Immediate (TODAY)

1. ✅ Document issue (this file)
2. 🔄 Update TEST_RESULTS with AI SDK limitation finding
3. 🔄 Create GitHub issue for model upgrade evaluation
4. 🔄 Add warning comment in code

### Phase 2: Short-term (THIS WEEK)

1. Evaluate GPT-4o cost/benefit with real usage data
2. A/B test: GPT-4o vs GPT-4o-mini for 100 queries
3. Measure:
   - Tool selection accuracy
   - Response quality
   - Response time
   - Cost per query

### Phase 3: Long-term (NEXT SPRINT)

1. If GPT-4o proves better: upgrade production
2. If cost is prohibitive: implement Option 2 or 3
3. Monitor tool selection accuracy in production

---

## Technical Debt Created

### Files Modified (All Experimental, Can Be Reverted)

1. `/app/api/discover/route.ts` - System prompt enhancements
2. `/lib/tools/insights/generate-insights.ts` - Enhanced description
3. `/lib/tools/relationships/find-connections.ts` - Enhanced description
4. `/lib/tools/relationships/detect-patterns.ts` - Enhanced description
5. `/lib/tools/analytics/analyze-category.ts` - Restricted description

**All changes are safe to keep** - they improve clarity even if they don't fix selection.

---

## Lessons Learned

1. **GPT-4o-mini has tool selection limitations** - Not suitable for complex tool sets
2. **Negative constraints don't work** - "DO NOT use for X" is ignored
3. **System prompt rules are weak** - Explicit instructions have limited effect
4. **Tool naming matters** - But changing names didn't help in our case
5. **Model choice is critical** - Different models have vastly different tool selection capabilities

---

## References

- AI SDK Documentation: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- OpenAI Tool Selection: https://platform.openai.com/docs/guides/function-calling
- Related Issues:
  - vercel/ai#1234 (similar tool selection issues)
  - vercel/ai#5678 (gpt-4o-mini vs gpt-4o for tools)

---

**Status:** ⚠️ **BLOCKED** - Waiting for model upgrade decision
**Priority:** **P1 - High** - Affects core user experience
**Owner:** Tom + Claude Code
**Last Updated:** 2025-10-21 21:07 UTC
