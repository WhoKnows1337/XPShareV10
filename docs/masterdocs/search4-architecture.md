# Search 2.0 Architecture Decision Record (ADR)

**Date**: 2025-10-18
**Status**: Phase 0 Complete - Ready for Implementation
**Decision Authority**: Tom + VibeCoder MCP Analysis
**Related Docs**: `/docs/masterdocs/search4.md`

---

## Executive Summary

This document formalizes critical architectural decisions for Search 2.0 implementation based on:
1. **Data Quality Validation** (Phase 0 completed)
2. **VibeCoder MCP recommendations** for structured planning
3. **2025 UX/UI trends** research via EXA MCP

**Critical Finding**: Database contains only **10 experiences** (4 UFO, 3 Dreams, 1 Altered States, 1 Glitch Matrix). This fundamentally shapes our pattern detection architecture.

---

## Table of Contents

1. [Data Quality Assessment](#1-data-quality-assessment)
2. [Pattern Detection Strategy](#2-pattern-detection-strategy)
3. [External Data Integration](#3-external-data-integration)
4. [Component Sharing Strategy](#4-component-sharing-strategy)
5. [Performance Optimization](#5-performance-optimization)
6. [User Experience Adaptations](#6-user-experience-adaptations)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Risk Mitigation](#8-risk-mitigation)

---

## 1. Data Quality Assessment

### 1.1 Current Database State (Validated 2025-10-18)

```sql
-- Total Experiences: 10
SELECT COUNT(*) FROM experiences WHERE visibility = 'public';
-- Result: 9 public experiences

-- Category Distribution
SELECT category, COUNT(*) as count
FROM experiences
WHERE visibility = 'public'
GROUP BY category
ORDER BY count DESC;
```

**Results**:
| Category | Count | % of Total |
|----------|-------|------------|
| UFO | 4 | 44.4% |
| Dreams | 3 | 33.3% |
| Altered States | 1 | 11.1% |
| Glitch Matrix | 1 | 11.1% |
| **Total** | **9** | **100%** |

### 1.2 Data Quality Metrics

| Metric | Status | Impact on Patterns |
|--------|--------|-------------------|
| **Total Records** | 10 (9 public) | ⚠️ Critical - Too sparse for traditional clustering |
| **Embeddings** | 100% (10/10) | ✅ Excellent - Semantic search fully functional |
| **Geographic Data** | 44.4% (4/9) | ⚠️ Moderate - Limited for geo clustering |
| **Temporal Data** | 50% (5/10) | ⚠️ Moderate - Limited for time series |
| **Tags** | Present but varied | ✅ Good - Cross-tagging possible |
| **Category Distribution** | 4 categories active | ⚠️ Uneven - UFO dominates |

### 1.3 Critical Implications

**Traditional Clustering Requirements**:
- Minimum 3 experiences per cluster for statistical significance
- Current data: Only UFO (4) and Dreams (3) meet this threshold

**Decision**:
> **We cannot implement traditional cluster-based pattern detection with current data.**
>
> **Alternative Strategy**: Focus on **relationship-based patterns** (similarity, co-occurrence, metadata correlations) that work with sparse data.

---

## 2. Pattern Detection Strategy

### 2.1 Decision: HYBRID APPROACH (Sparse Data Optimized)

**Pre-compute** (Static Patterns):
- ✅ **Category co-occurrence** (works with 2+ experiences)
- ✅ **Tag correlations** (works with any dataset size)
- ✅ **Temporal proximity** (events within X days)
- ❌ ~~Geographic clusters~~ (requires 3+ with coordinates)
- ❌ ~~Temporal clusters~~ (requires larger time series)

**On-the-fly** (Dynamic Patterns):
- ✅ **Similarity explanations** (1-to-1 comparisons)
- ✅ **Vector distance analysis** (embedding-based)
- ✅ **Moon phase calculations** (algorithmic)
- ✅ **User-specific patterns** (search history, bookmarks)

### 2.2 SQL Functions to Implement

#### Function 1: Similarity Explanation Generator
```sql
CREATE OR REPLACE FUNCTION get_similarity_explanation(
  p_experience_id_1 UUID,
  p_experience_id_2 UUID
)
RETURNS JSONB AS $$
DECLARE
  exp1 experiences%ROWTYPE;
  exp2 experiences%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO exp1 FROM experiences WHERE id = p_experience_id_1;
  SELECT * INTO exp2 FROM experiences WHERE id = p_experience_id_2;

  result := jsonb_build_object(
    'category_match', exp1.category = exp2.category,
    'tag_overlap', (
      SELECT COUNT(*)
      FROM unnest(exp1.tags) t1
      JOIN unnest(exp2.tags) t2 ON t1 = t2
    ),
    'location_proximity_km', (
      CASE
        WHEN exp1.location_lat IS NOT NULL AND exp2.location_lat IS NOT NULL
        THEN ST_Distance(
          ST_MakePoint(exp1.location_lng, exp1.location_lat)::geography,
          ST_MakePoint(exp2.location_lng, exp2.location_lat)::geography
        ) / 1000
        ELSE NULL
      END
    ),
    'days_apart', (
      CASE
        WHEN exp1.date_occurred IS NOT NULL AND exp2.date_occurred IS NOT NULL
        THEN ABS(EXTRACT(DAY FROM exp1.date_occurred - exp2.date_occurred))
        ELSE NULL
      END
    ),
    'vector_similarity', 1 - (exp1.embedding <=> exp2.embedding),
    'witness_correlation', (exp1.witness_count > 0 AND exp2.witness_count > 0)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### Function 2: Category Co-occurrence (Works with Sparse Data)
```sql
CREATE OR REPLACE FUNCTION get_category_cooccurrence()
RETURNS TABLE(
  category_1 TEXT,
  category_2 TEXT,
  co_occurrence_count BIGINT,
  shared_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e1.category,
    e2.category,
    COUNT(*) as co_occurrence_count,
    ARRAY_AGG(DISTINCT unnest) as shared_tags
  FROM experiences e1
  CROSS JOIN experiences e2
  WHERE e1.id < e2.id  -- Avoid duplicate pairs
    AND e1.visibility = 'public'
    AND e2.visibility = 'public'
    AND e1.tags && e2.tags  -- Has at least 1 shared tag
  CROSS JOIN LATERAL unnest(e1.tags)
  WHERE unnest = ANY(e2.tags)
  GROUP BY e1.category, e2.category
  HAVING COUNT(*) >= 1;  -- Lowered threshold for sparse data
END;
$$ LANGUAGE plpgsql;
```

#### Function 3: Temporal Proximity Detection (Adaptive Threshold)
```sql
CREATE OR REPLACE FUNCTION get_temporal_clusters(
  p_days_threshold INT DEFAULT 30  -- Wider window for sparse data
)
RETURNS TABLE(
  experience_id UUID,
  cluster_experiences UUID[],
  avg_days_apart NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH temporal_pairs AS (
    SELECT
      e1.id as exp1_id,
      e2.id as exp2_id,
      ABS(EXTRACT(DAY FROM e1.date_occurred - e2.date_occurred)) as days_apart
    FROM experiences e1
    JOIN experiences e2 ON e1.id < e2.id
    WHERE e1.date_occurred IS NOT NULL
      AND e2.date_occurred IS NOT NULL
      AND e1.visibility = 'public'
      AND e2.visibility = 'public'
      AND ABS(EXTRACT(DAY FROM e1.date_occurred - e2.date_occurred)) <= p_days_threshold
  )
  SELECT
    tp.exp1_id,
    ARRAY_AGG(tp.exp2_id) as cluster_experiences,
    AVG(tp.days_apart) as avg_days_apart
  FROM temporal_pairs tp
  GROUP BY tp.exp1_id
  HAVING COUNT(*) >= 1;  -- Accept even 1 match for sparse data
END;
$$ LANGUAGE plpgsql;
```

### 2.3 Pattern Badges (Adapted for Sparse Data)

Instead of showing "Part of X-experience cluster", show **relationship-based badges**:

| Badge | Condition | Example |
|-------|-----------|---------|
| 🌙 **Moon Phase Match** | Same lunar phase | "New Moon (2 experiences)" |
| 🏷️ **Tag Network** | Shares 2+ tags | "Connected via #abduction #lights" |
| 📍 **Location Proximity** | Within 100km | "68km from similar UFO sighting" |
| ⏱️ **Temporal Echo** | Within 30 days | "23 days after related dream" |
| 🎯 **Category Bridge** | Cross-category similarity | "Similar to Dreams despite being UFO" |
| 🔗 **High Similarity** | Vector distance > 0.8 | "87% similar to experience #42" |

**Key Change**: Focus on **pairwise relationships** instead of **cluster membership**.

---

## 3. External Data Integration

### 3.1 Moon Phase Calculation

**Decision**: ✅ **Algorithmic (No API)**

**Library**: Use existing JS lunar phase algorithms (e.g., `suncalc` or custom)

**Implementation**: `lib/utils/lunar-phase.ts`

```typescript
/**
 * Calculate moon phase for a given date
 * Based on astronomical algorithms
 */
export function getMoonPhase(date: Date): {
  phase: number // 0-1 (0 = new moon, 0.5 = full moon)
  phaseName: string // "New Moon", "First Quarter", etc.
  illumination: number // 0-100%
} {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Julian date calculation
  const jd = julianDate(year, month, day)

  // Moon phase algorithm (simplified)
  const daysSinceNew = (jd - 2451549.5) % 29.53058867
  const phase = daysSinceNew / 29.53058867

  return {
    phase,
    phaseName: getPhaseName(phase),
    illumination: Math.round(50 * (1 - Math.cos(phase * 2 * Math.PI)))
  }
}

function getPhaseName(phase: number): string {
  if (phase < 0.0625) return 'New Moon'
  if (phase < 0.1875) return 'Waxing Crescent'
  if (phase < 0.3125) return 'First Quarter'
  if (phase < 0.4375) return 'Waxing Gibbous'
  if (phase < 0.5625) return 'Full Moon'
  if (phase < 0.6875) return 'Waning Gibbous'
  if (phase < 0.8125) return 'Last Quarter'
  return 'Waning Crescent'
}
```

### 3.2 External Correlation Data

**Decision**: ⚠️ **Deferred to Phase 2**

Potential future integrations:
- ☀️ Solar activity (NOAA Space Weather API)
- 🌍 Seismic data (USGS API)
- 🛰️ Satellite passes (Celestrak API)

**Reason**: Requires external API dependencies + sparse data makes correlations unreliable.

---

## 4. Component Sharing Strategy

### 4.1 Decision: SHARED INFRASTRUCTURE, SEPARATE FEATURES

**Shared** (between `/search` and `/search2`):
- ✅ `components/ui/*` (shadcn primitives)
- ✅ `lib/supabase/*` (DB client)
- ✅ `lib/openai/*` (Embedding generation)
- ✅ `app/api/search/unified/route.ts` (Enhanced with pattern metadata)
- ✅ `app/api/search/autocomplete/route.ts`
- ✅ `app/api/search/filter-counts/route.ts`

**Separate** (Search 2.0 only):
- 🆕 `components/search2/pattern-badges.tsx`
- 🆕 `components/search2/similarity-explanation-tooltip.tsx`
- 🆕 `components/search2/pattern-insights-panel.tsx`
- 🆕 `components/search2/temporal-knowledge-graph.tsx`
- 🆕 `app/api/patterns/similarity-explanation/route.ts`
- 🆕 `app/api/patterns/category-network/route.ts`

### 4.2 Directory Structure

```
app/[locale]/
  search/                    # Original (unchanged)
    page.tsx
    unified-search-page-client.tsx

  search2/                   # New A/B test version
    page.tsx                 # Minimal wrapper
    search2-page-client.tsx  # Main client component
    layout.tsx               # Optional: custom layout

components/
  search/                    # Shared search components
    unified-search-bar.tsx   # ENHANCED: Add pattern hints
    collapsible-filters.tsx  # ENHANCED: Add pattern filters
    date-range-slider.tsx    # Unchanged

  search2/                   # Search 2.0 exclusive
    pattern-badges.tsx
    similarity-explanation-tooltip.tsx
    pattern-insights-panel.tsx
    temporal-knowledge-graph.tsx

  ui/                        # Shared primitives (unchanged)
    button.tsx
    card.tsx
    ...

app/api/
  search/                    # Existing search APIs
    unified/route.ts         # ENHANCED: Add pattern metadata to response
    autocomplete/route.ts    # Unchanged
    filter-counts/route.ts   # Unchanged

  patterns/                  # New pattern detection APIs
    similarity-explanation/route.ts
    category-network/route.ts
    temporal-clusters/route.ts
```

### 4.3 API Enhancement Strategy

**Enhance existing** `/api/search/unified/route.ts`:

```typescript
// AFTER hybrid search results are returned
const resultsWithPatterns = await Promise.all(
  filteredResults.map(async (exp) => {
    // Calculate moon phase if date exists
    const moonPhase = exp.date_occurred
      ? getMoonPhase(new Date(exp.date_occurred))
      : null

    // Find similar experiences (top 3)
    const { data: similarExperiences } = await supabase.rpc(
      'find_similar_experiences',
      {
        p_experience_id: exp.id,
        p_limit: 3,
        p_threshold: 0.7  // Lower threshold for sparse data
      }
    )

    return {
      ...exp,
      pattern_metadata: {
        moon_phase: moonPhase,
        similar_count: similarExperiences?.length || 0,
        similar_experiences: similarExperiences || [],
        temporal_cluster_size: 0,  // TODO: Implement after temporal function
        geographic_cluster_size: 0 // TODO: Defer (not enough data)
      }
    }
  })
)

return NextResponse.json({
  results: resultsWithPatterns,
  metadata: {
    ...existingMetadata,
    pattern_detection_enabled: true,
    sparse_data_mode: true  // Flag for UI to adjust expectations
  }
})
```

---

## 5. Performance Optimization

### 5.1 Pre-computation Strategy

**What to Pre-compute** (Nightly cron job):
- ✅ Category co-occurrence matrix
- ✅ Tag correlation graph
- ✅ Global tag statistics

**Store in**: New table `pattern_cache`

```sql
CREATE TABLE pattern_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type TEXT NOT NULL, -- 'category_network', 'tag_correlation', etc.
  cache_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_pattern_cache_type ON pattern_cache(cache_type);
CREATE INDEX idx_pattern_cache_valid ON pattern_cache(valid_until);
```

**What to Compute On-the-fly**:
- ✅ Similarity explanations (requires user query context)
- ✅ Moon phase (fast calculation)
- ✅ User-specific patterns

### 5.2 Caching Strategy

| Data Type | Cache Duration | Invalidation Trigger |
|-----------|----------------|---------------------|
| Category network | 24 hours | New experience published |
| Tag correlations | 24 hours | New experience published |
| Similarity explanations | 5 minutes | N/A (query-specific) |
| Moon phases | Permanent | N/A (deterministic) |

### 5.3 Performance Targets (Sparse Data)

| Operation | Target | Current Baseline |
|-----------|--------|------------------|
| Hybrid search | < 200ms | ~150ms ✅ |
| Pattern metadata enrichment | < 100ms | TBD |
| Similarity explanation | < 50ms | TBD |
| Category network fetch | < 20ms | TBD (cached) |

---

## 6. User Experience Adaptations

### 6.1 Sparse Data Communication

**Problem**: With only 10 experiences, users may expect more patterns than exist.

**Solution**: Transparent communication + focus on quality over quantity

**UI Copy Examples**:

❌ **Avoid**:
> "Showing 0 temporal clusters"

✅ **Instead**:
> "🌱 Growing dataset: 10 experiences analyzed. Patterns emerge with more contributions!"

❌ **Avoid**:
> "No similar experiences found"

✅ **Instead**:
> "🔍 This is unique! The first of its kind in our collection."

### 6.2 Progressive Disclosure

**Phase 1**: Show patterns that work with ANY dataset size
- ✅ Similarity explanations (1-to-1)
- ✅ Tag networks
- ✅ Moon phase annotations

**Phase 2** (Unlock when data >= 30 experiences):
- 🔒 Geographic clusters
- 🔒 Temporal trends
- 🔒 Cross-category insights

**Phase 3** (Unlock when data >= 100 experiences):
- 🔒 Anomaly detection
- 🔒 Predictive patterns
- 🔒 External correlations

### 6.3 Empty State Design

**Pattern Insights Panel** when < 3 related experiences:

```tsx
<Card className="border-dashed">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-muted-foreground" />
      Pattern Detection Growing
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      This experience is part of our early collection. As more people share their stories,
      we'll discover fascinating patterns connecting:
    </p>
    <ul className="mt-3 space-y-2 text-sm">
      <li>✨ Time & location correlations</li>
      <li>🌙 Lunar phase connections</li>
      <li>🏷️ Thematic clusters</li>
    </ul>
    <Button className="mt-4" variant="outline" size="sm">
      Share Your Experience
    </Button>
  </CardContent>
</Card>
```

---

## 7. Implementation Roadmap

### Phase 0: ✅ COMPLETE (2025-10-18)
- [x] Data quality validation
- [x] Architecture decisions documented
- [x] Sparse data strategy defined

### Phase 1: Setup (1 day)
**Goal**: Parallel `/search2` route functional

**Tasks**:
1. Create `/app/[locale]/search2/` directory
2. Copy `page.tsx` and `*-client.tsx` from `/search`
3. Add navbar toggle:
   ```tsx
   // In components/layout/navbar.tsx
   <NavigationMenu>
     <NavigationMenuItem>
       <Link href={`/${locale}/search`}>Search v1</Link>
     </NavigationMenuItem>
     <NavigationMenuItem>
       <Link href={`/${locale}/search2`} className="flex items-center gap-1">
         Search v2 <Badge variant="outline">BETA</Badge>
       </Link>
     </NavigationMenuItem>
   </NavigationMenu>
   ```
4. Verify both routes load identically

### Phase 2: Backend (3 days)

**Day 1**: SQL Functions
- [ ] Implement `get_similarity_explanation()`
- [ ] Implement `get_category_cooccurrence()`
- [ ] Implement `get_temporal_clusters()`
- [ ] Create `pattern_cache` table

**Day 2**: Lunar Phase Utility
- [ ] Create `lib/utils/lunar-phase.ts`
- [ ] Write unit tests (10 known dates)
- [ ] Integrate into API

**Day 3**: API Enhancement
- [ ] Enhance `/api/search/unified/route.ts` with pattern metadata
- [ ] Create `/api/patterns/similarity-explanation/route.ts`
- [ ] Create `/api/patterns/category-network/route.ts`

### Phase 3: Frontend - Pattern Badges (1 day)

**Component**: `components/search2/pattern-badges.tsx`

```tsx
<PatternBadges
  experience={exp}
  patternMetadata={exp.pattern_metadata}
  onBadgeClick={(badgeType) => {
    // Show detailed explanation
    openSimilarityTooltip(badgeType)
  }}
/>
```

**Displays**:
- 🌙 Moon phase badge (if date exists)
- 🔗 Similarity count (if > 0 similar)
- 🏷️ Tag network size
- ⏱️ Temporal proximity (if applicable)

### Phase 4: Frontend - Similarity Tooltip (2 days)

**Component**: `components/search2/similarity-explanation-tooltip.tsx`

**Shows**:
- **Why Similar**: "82% semantic similarity"
- **Shared Elements**:
  - Category match ✓
  - 3 common tags: #abduction, #lights, #fear
  - 68km proximity
  - 23 days apart
- **Visual**: Mini similarity graph

### Phase 5: Frontend - Insights Panel (3 days)

**Component**: `components/search2/pattern-insights-panel.tsx`

**Sections** (Progressive Disclosure):
1. **Your Results** (Always shown)
   - "3 UFO experiences, 2 Dreams"
   - "2 moon phase matches"

2. **Discovered Patterns** (If >= 3 related)
   - Tag network visualization
   - Temporal timeline

3. **Suggested Exploration** (Always shown)
   - "Explore similar Dreams"
   - "See other Full Moon experiences"

### Phase 6: Testing & Refinement (1 day)

**Test Cases**:
- [ ] Search with 0 results → Empty state
- [ ] Search with 1 result → No patterns shown gracefully
- [ ] Search with 3+ results → Pattern badges appear
- [ ] Click pattern badge → Tooltip opens
- [ ] Sparse data messaging appears appropriately

**Performance**:
- [ ] Lighthouse score >= 90
- [ ] Search response < 300ms (with patterns)
- [ ] No hydration errors

---

## 8. Risk Mitigation

### Risk 1: Sparse Data → No Patterns Visible
**Likelihood**: HIGH
**Impact**: Medium (user disappointment)

**Mitigation**:
1. ✅ Show 1-to-1 patterns instead of clusters
2. ✅ Transparent communication about dataset size
3. ✅ Progressive unlocking of features
4. ✅ Focus on "unique" as valuable (not "no patterns")

### Risk 2: Performance Degradation
**Likelihood**: Low
**Impact**: High (slow search)

**Mitigation**:
1. ✅ Pre-compute category network (24h cache)
2. ✅ Limit similarity checks to top 3 per experience
3. ✅ Use `EXPLAIN ANALYZE` on all SQL functions
4. ✅ Add query timeouts (5s max)

### Risk 3: Over-Engineering for MVP
**Likelihood**: Medium
**Impact**: Medium (delayed launch)

**Mitigation**:
1. ✅ Phase 1-3 are MANDATORY (pattern visibility)
2. ⚠️ Phase 4-5 are OPTIONAL (can ship without)
3. ✅ A/B test allows reverting to `/search` anytime

### Risk 4: User Confusion (Two Search Pages)
**Likelihood**: Low
**Impact**: Low (minor UX friction)

**Mitigation**:
1. ✅ Clear "BETA" badge on Search v2
2. ✅ Tooltip explaining differences
3. ✅ Easy toggle in navbar
4. ✅ Preserve search state when switching

---

## 9. Success Metrics

### Quantitative

| Metric | Baseline (/search) | Target (/search2) |
|--------|-------------------|-------------------|
| Search CTR | TBD | +15% |
| Time on Results Page | TBD | +30% |
| "Similar Experience" Clicks | 0 | > 20% of users |
| Pattern Badge Interactions | 0 | > 40% of results |
| Bounce Rate | TBD | -10% |

### Qualitative

- [ ] Users understand pattern badges without training
- [ ] "Aha moments" reported in feedback
- [ ] No user reports of "missing features" from v1
- [ ] Pattern explanations rated "helpful" > 80%

---

## 10. Future Considerations (Post-MVP)

### When Dataset >= 30 Experiences:
- Enable geographic clustering (min 3 per cluster)
- Enable temporal trend analysis
- Unlock "Anomaly Detection" badge

### When Dataset >= 100 Experiences:
- Machine learning-based pattern detection
- Predictive "You might also find..." recommendations
- External correlation analysis (solar, seismic)

### When Dataset >= 1000 Experiences:
- Full knowledge graph visualization
- Community-detected patterns
- Automated insight generation

---

## 11. Decision Log

| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| Hybrid pattern detection (not cluster-based) | 2025-10-18 | Only 10 experiences → clusters impossible | ✅ Approved |
| Algorithmic moon phase (no API) | 2025-10-18 | Simple, no dependencies, deterministic | ✅ Approved |
| Defer geographic clustering | 2025-10-18 | Only 44% have coordinates | ✅ Approved |
| **Event-driven cache invalidation** | 2025-10-18 | With only 10 experiences, event-driven is simpler than 24h cron | ✅ Approved |
| Separate `/search2` route | 2025-10-18 | Safe A/B testing, easy rollback | ✅ Approved |
| Lower clustering threshold (min 2) | 2025-10-18 | Sparse data requires flexibility | ✅ Approved |
| Progressive feature unlocking | 2025-10-18 | Manage expectations, incentivize contributions | ✅ Approved |
| **MVP: Moon Phase + Similarity badges only** | 2025-10-18 | Only these work with sparse data reliably | ✅ Approved |
| **Transparent messaging (no fake data)** | 2025-10-18 | Authenticity > demonstration, use real data only | ✅ Approved |

## 12. VibeCoder Uncertainty Resolution

### Uncertainty 1: Pre-populate Test Data vs. Transparent Messaging?

**Decision**: ✅ **Transparent Messaging Only (No Test Data)**

**Rationale**:
- **Authenticity is Core Value**: XP Share's differentiation is REAL pattern discovery, not synthetic demonstrations
- **Trust > Demo**: Fake data would undermine credibility in a platform about genuine experiences
- **Sparse Data = Opportunity**: Position as "early discovery phase" - users contribute to pattern emergence
- **Progressive Disclosure**: Features unlock as data grows (gamification!)

**Implementation**:
```tsx
// Sparse Data Messaging Example
{results.length < 20 && (
  <Alert className="bg-blue-50 dark:bg-blue-950">
    <Sparkles className="h-4 w-4" />
    <AlertTitle>Growing Pattern Database</AlertTitle>
    <AlertDescription>
      With {results.length} experiences analyzed, patterns are beginning to emerge.
      As more people share their stories, we'll discover increasingly fascinating connections.
      <Button variant="link" className="p-0 h-auto mt-1">
        Be among the first to contribute →
      </Button>
    </AlertDescription>
  </Alert>
)}
```

**Alternative Considered**: Optional "Demo Mode" toggle
- **Rejected**: Too complex, confuses real vs. fake, undermines trust
- **Future Option**: If absolutely needed for investor demos, use separate `/demo` route with clear warnings

---

### Uncertainty 2: 24h Cache Refresh vs. Event-Driven Invalidation?

**Decision**: ✅ **Event-Driven Invalidation (Hybrid Approach)**

**Rationale**:
- **Small Dataset**: With only 10 experiences, event-driven is SIMPLER than cron jobs
- **Better UX**: New experience submitted → patterns update immediately → contributor sees their impact
- **Implementation Simplicity**: Single Postgres trigger > complex caching infrastructure
- **Scalability Path**: Can switch to scheduled if dataset grows to 1000+

**Implementation**:
```sql
-- Event-driven pattern cache invalidation
CREATE OR REPLACE FUNCTION invalidate_pattern_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Invalidate relevant cache entries when new experience added
  DELETE FROM pattern_cache
  WHERE cache_type IN ('category_network', 'tag_correlation')
    AND (
      -- Invalidate if new experience affects category network
      (cache_data->>'categories')::jsonb ? NEW.category
      OR
      -- Invalidate if new experience has overlapping tags
      EXISTS (
        SELECT 1 FROM unnest(NEW.tags) tag
        WHERE (cache_data->>'tags')::jsonb ? tag
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_pattern_cache
  AFTER INSERT OR UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_pattern_cache();
```

**Cache Strategy**:
| Pattern Type | Refresh Trigger | Fallback |
|-------------|----------------|----------|
| Category Network | New experience inserted | Re-compute on-demand |
| Tag Correlations | New experience inserted | Re-compute on-demand |
| Similarity Explanations | Never cached | Always on-the-fly |
| Moon Phases | Deterministic | Never invalidate |

**Performance Target**: Pattern cache regeneration < 50ms (acceptable for 10 experiences)

---

### Uncertainty 3: All 6 Pattern Badges vs. MVP (Moon Phase + Similarity)?

**Decision**: ✅ **MVP: Moon Phase + Similarity Only**

**Rationale**:

**Data-Driven Decision Matrix**:
| Badge Type | Works with Sparse Data? | User Value | Implementation Effort | Include in MVP? |
|-----------|-------------------------|-----------|---------------------|----------------|
| 🌙 Moon Phase | ✅ YES (50% have dates) | HIGH (unique, scientific) | LOW (algorithmic) | ✅ **YES** |
| 🔗 Similarity | ✅ YES (100% have embeddings) | CRITICAL (core feature) | LOW (already computed) | ✅ **YES** |
| 🏷️ Tag Network | ⚠️ MAYBE (depends on tag overlap) | MEDIUM (nice-to-have) | LOW | ⏸️ Phase 1.5 |
| 📍 Location Proximity | ❌ NO (only 44% have coords) | HIGH (but unreliable now) | MEDIUM | ❌ Defer to Phase 2 |
| ⏱️ Temporal Echo | ❌ NO (only 50% have dates, need 2+ matches) | MEDIUM | MEDIUM | ❌ Defer to Phase 2 |
| ✨ Category Bridge | ⚠️ MAYBE (requires cross-category data) | HIGH (serendipity) | HIGH (complex logic) | ❌ Defer to Phase 3 |

**MVP Implementation** (Phase 1):
```tsx
// Only show badges that WORK with current data
export function PatternBadges({ experience, similarity }: PatternBadgesProps) {
  const badges: PatternBadge[] = []

  // Badge 1: Moon Phase (if date exists)
  if (experience.date_occurred && experience.moon_phase) {
    badges.push({
      type: 'moon_phase',
      icon: experience.moon_phase.icon, // 🌕 🌑 etc.
      label: experience.moon_phase.name,
      count: experience.moon_phase.similar_count || 0,
      color: 'border-purple-500'
    })
  }

  // Badge 2: Similarity (always present)
  if (similarity && similarity.similar_count > 0) {
    badges.push({
      type: 'similarity',
      icon: '🔗',
      label: `${similarity.similar_count} similar`,
      count: similarity.similar_count,
      color: 'border-blue-500'
    })
  }

  // Future: Tag network badge (Phase 1.5 - conditional)
  if (experience.tag_network && experience.tag_network.strength > 0.5) {
    badges.push({
      type: 'tag_network',
      icon: '🏷️',
      label: `${experience.tag_network.shared_tags.length} shared tags`,
      count: experience.tag_network.connection_count,
      color: 'border-green-500'
    })
  }

  return badges.length > 0 ? (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map(badge => <PatternBadge key={badge.type} {...badge} />)}
    </div>
  ) : null
}
```

**Why This MVP is Sufficient**:
1. **Moon Phase**: Scientifically intriguing, works with 50% of data, differentiator
2. **Similarity**: Core value proposition, works 100%, builds trust in pattern detection
3. **Together**: Enough to demonstrate pattern discovery concept without overwhelming sparse data

**Phase 1.5 Addition** (When tag overlap detected):
- 🏷️ Tag Network badge (opportunistic - only show if >= 2 shared tags found)

**Phase 2 Unlocks** (When dataset >= 30 experiences):
- 📍 Location Proximity (need geographic density)
- ⏱️ Temporal Echo (need temporal clusters)

**Phase 3 Unlocks** (When dataset >= 100 experiences):
- ✨ Category Bridge (need cross-category patterns)
- 🌐 External Events (need solar activity correlation)

**User Communication**:
```tsx
// Tooltip explaining why only some badges appear
<InfoTooltip>
  Pattern badges appear as our database grows:
  • ✅ Moon Phase & Similarity (active now)
  • 🔒 Location Clusters (unlocks at 30+ experiences)
  • 🔒 Temporal Patterns (unlocks at 30+ experiences)
  • 🔒 Cross-Category Insights (unlocks at 100+ experiences)

  Your contributions help unlock new pattern types!
</InfoTooltip>
```

---

## 13. Final MVP Scope (Phase 1)

### ✅ Included in Initial Launch
1. **Pattern Badges** (2 types only):
   - 🌙 Moon Phase (if date exists)
   - 🔗 Similarity Score

2. **Similarity Explanation Tooltip**:
   - Semantic match breakdown
   - Vector distance visualization
   - Simple, clear language

3. **Pattern Insights Panel**:
   - "Your Results" summary
   - Moon phase distribution (if applicable)
   - Similarity network preview
   - Transparent messaging about data growth

4. **Event-Driven Cache**:
   - Auto-invalidate on new experience
   - Simple Postgres triggers
   - On-demand regeneration

### ⏸️ Phase 1.5 (Opportunistic - No Promises)
- 🏷️ Tag Network badge (only if >= 2 shared tags detected)

### ❌ Explicitly Deferred to Phase 2+
- 📍 Geographic clustering
- ⏱️ Temporal clustering
- Interactive graph exploration
- Wave detection
- Cross-category insights

---

## 14. Success Criteria for Phase 1 MVP

**Must Have**:
- [ ] Moon phase badges appear on >= 40% of results (those with dates)
- [ ] Similarity badges appear on 100% of results
- [ ] Similarity tooltip click-through rate >= 5%
- [ ] Zero user reports of "confusing" or "fake" patterns
- [ ] Pattern cache invalidates < 100ms after new experience

**Nice to Have**:
- [ ] Users share screenshots of moon phase patterns on social media
- [ ] "Unlock new patterns" gamification drives 10% more submissions
- [ ] Transparent messaging rated "helpful" by >= 80% of users

**Red Flags to Monitor**:
- ⚠️ Users complain "not enough patterns" (indicates messaging failure)
- ⚠️ Low engagement with pattern badges (< 5% click rate)
- ⚠️ Performance degradation (> 300ms search response time)

---

## Appendix A: SQL Schema Changes

### Migration: `20251018_pattern_detection.sql`

```sql
-- Pattern cache table for pre-computed patterns
CREATE TABLE pattern_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type TEXT NOT NULL,
  cache_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  CONSTRAINT valid_cache_type CHECK (cache_type IN (
    'category_network',
    'tag_correlation',
    'temporal_clusters'
  ))
);

CREATE INDEX idx_pattern_cache_type ON pattern_cache(cache_type);
CREATE INDEX idx_pattern_cache_valid ON pattern_cache(valid_until);

-- Add pattern-related columns to experiences (optional - for caching)
ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS moon_phase_cached NUMERIC,
  ADD COLUMN IF NOT EXISTS similar_experiences_count INT DEFAULT 0;

-- Function: Similarity Explanation (see Section 2.2)
-- (Full SQL in implementation phase)

-- Function: Category Co-occurrence (see Section 2.2)
-- (Full SQL in implementation phase)

-- Function: Temporal Clusters (see Section 2.2)
-- (Full SQL in implementation phase)

-- RLS for pattern_cache (read-only for authenticated users)
ALTER TABLE pattern_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pattern cache readable by authenticated users"
  ON pattern_cache FOR SELECT
  TO authenticated
  USING (valid_until > NOW());
```

---

## Appendix B: VibeCoder Recommendations (Addressed)

✅ **1. Pre-compute vs On-the-fly**
- Documented in Section 2.1
- Hybrid approach chosen

✅ **2. Data Quality Validation**
- Completed in Phase 0
- Results documented in Section 1

✅ **3. External Data Sources**
- Moon phase: Algorithmic (Section 3.1)
- Others deferred (Section 3.2)

✅ **4. Component Sharing**
- Strategy defined in Section 4
- Clear separation between shared/separate

✅ **5. Performance Optimization**
- Addressed in Section 5
- Caching strategy defined

---

## Document Status

**Last Updated**: 2025-10-18
**Next Review**: After Phase 1 implementation
**Approval**: Ready for Implementation

---

**Questions or Concerns?**
Contact: Tom (@tom) or review in Linear issue #XP-7
