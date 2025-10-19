# Profile Redesign - Integration Guide

Complete implementation guide for the XPShare Profile Redesign based on `profil.md` specification.

## 📦 What Was Implemented

### Phase 1: Database Foundation ✅

**Migration Files:**
- `supabase/migrations/XXXXX_create_user_stats_tables.sql`
- `supabase/migrations/XXXXX_create_similarity_functions.sql`
- `supabase/migrations/XXXXX_create_triggers_only.sql`

**Database Objects:**

1. **Tables:**
   - `user_category_stats` - Pre-calculated category distribution per user
   - `user_pattern_contributions` - Pattern discovery tracking

2. **Functions:**
   - `calculate_jaccard_similarity(user_id_1, user_id_2)` - Set overlap similarity
   - `calculate_cosine_similarity(user_id_1, user_id_2)` - Distribution similarity
   - `calculate_similarity_score(user_id_1, user_id_2)` - Weighted combination (40% Jaccard + 60% Cosine)
   - `find_xp_twins(target_user_id, match_limit, min_similarity)` - Find similar users

3. **Triggers:**
   - `update_user_category_stats()` - Auto-updates category stats on experience changes

**RLS Policies:**
- All tables have RLS enabled
- Public read access for user_category_stats
- Authenticated write for contributions

---

### Phase 2: API Routes ✅

**Created Routes:**

1. **`/api/users/[id]/similar`** - XP Twins Finder
   ```typescript
   GET /api/users/123/similar?limit=10&minSimilarity=0.3

   Response:
   {
     users: [
       {
         similar_user_id: "...",
         similarity_score: 0.85,
         shared_categories: ["ufo-sighting", "lucid-dream"],
         shared_category_count: 2,
         match_quality: "EXCELLENT",
         profile: { ... }
       }
     ],
     count: 10,
     filters: { limit: 10, minSimilarity: 0.3 }
   }
   ```

2. **`/api/users/[id]/category-stats`** - XP DNA Distribution
   ```typescript
   GET /api/users/123/category-stats

   Response:
   {
     stats: [
       {
         category: "ufo-sighting",
         experience_count: 42,
         percentage: 35.2,
         last_experience_date: "2025-01-15"
       }
     ],
     total: 119,
     dominantCategory: {
       category: "ufo-sighting",
       percentage: 35.2
     },
     metadata: { userId, calculatedAt, categoryCount }
   }
   ```

3. **`/api/users/[id]/pattern-contributions`** - Pattern Discoveries
   ```typescript
   GET /api/users/123/pattern-contributions?limit=10

   Response:
   {
     contributions: [ ... ],
     total: 15,
     metadata: { userId, patternsDiscovered, limit }
   }
   ```

---

### Phase 3: UI Components ✅

All components created in `/components/profile/`:

#### 1. **XPDNABadge** - Category Identity Visualization
```tsx
import { XPDNABadge } from '@/components/profile/xp-dna-badge'

<XPDNABadge
  categoryStats={[
    { category: 'ufo-sighting', percentage: 35.2, count: 42 },
    { category: 'lucid-dream', percentage: 28.1, count: 34 }
  ]}
  size={128}
  showTooltip={true}
/>
```

**Features:**
- Conic gradient from top 3 categories
- Hover animation (scale + glow)
- Tooltip with category breakdown
- Responsive sizing

#### 2. **XPTwinsCard** - Similarity Match Display
```tsx
import { XPTwinsCard } from '@/components/profile/xp-twins-card'

<XPTwinsCard
  similarity={{
    score: 0.85,
    shared_categories: ['ufo-sighting', 'lucid-dream'],
    match_quality: 'EXCELLENT'
  }}
  onConnect={() => handleConnect()}
/>
```

**Features:**
- Similarity percentage with progress bar
- Shared categories badges
- Match quality indicator
- Connect button

#### 3. **ActivityHeatmap** - GitHub-Style Calendar
```tsx
import { LazyActivityHeatmap } from '@/components/profile/lazy-profile-components'

<LazyActivityHeatmap
  activityData={[
    { date: '2025-01-15', count: 3 },
    { date: '2025-01-16', count: 1 }
  ]}
  height={400}
/>
```

**Features:**
- Cal-Heatmap integration
- 12-month view
- Hover tooltips
- Summary stats (Total, Active Days, Best Day)

#### 4. **ExperienceMap** - Geographic Clustering
```tsx
import { LazyExperienceMap } from '@/components/profile/lazy-profile-components'

<LazyExperienceMap
  experiences={[
    {
      id: '...',
      title: 'UFO Over Phoenix',
      category: 'ufo-sighting',
      latitude: 33.4484,
      longitude: -112.0740,
      date: '2025-01-15'
    }
  ]}
  enableClustering={true}
  height={400}
/>
```

**Features:**
- Leaflet + MarkerCluster
- Category-based color coding
- Interactive popups
- Auto zoom-to-bounds

#### 5. **PatternContributionsCard** - Pattern Stats
```tsx
import { LazyPatternContributionsCard } from '@/components/profile/lazy-profile-components'

<LazyPatternContributionsCard
  contributions={[
    {
      pattern_id: '...',
      pattern_name: 'Phoenix Lights Pattern',
      pattern_type: 'geographic',
      contribution_count: 12,
      total_experiences: 50,
      first_contributed: '2024-06-10',
      is_top_contributor: true
    }
  ]}
  totalPatterns={15}
  maxVisible={5}
/>
```

**Features:**
- Top contributor badge
- Progress bars
- Pattern type badges
- Expandable list

#### 6. **UserComparisonModal** - Side-by-Side Comparison
```tsx
import { LazyUserComparisonModal } from '@/components/profile/lazy-profile-components'

<LazyUserComparisonModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  currentUser={currentUserProfile}
  comparisonUser={twinProfile}
  similarityScore={0.85}
  sharedCategories={['ufo-sighting', 'lucid-dream']}
  onConnect={handleConnect}
/>
```

**Features:**
- Similarity gauge
- XP/Level comparison
- Category-by-category breakdown
- Shared categories highlight

#### 7. **ConnectionsTab** - 4 Sub-Tabs
```tsx
import { LazyConnectionsTab } from '@/components/profile/lazy-profile-components'

<LazyConnectionsTab
  userId={currentUserId}
  xpTwins={xpTwinsData}
  locationConnections={locationData}
  patternConnections={patternData}
  mutualConnections={mutualData}
  onConnect={handleConnect}
  onViewProfile={handleViewProfile}
/>
```

**Sub-Tabs:**
1. **XP Twins** - Similar users by experience profile
2. **Location** - Geographic proximity connections
3. **Patterns** - Shared pattern contributors
4. **Mutual** - Bidirectional connections

**Features:**
- Tab navigation
- Search filtering
- Connect/View actions
- Empty states

---

### Phase 4: Performance Optimization ✅

#### Lazy Loading with Dynamic Imports

**File:** `/components/profile/lazy-profile-components.tsx`

All heavy components are lazy-loaded:

```tsx
// Heavy components (Map, Heatmap) - SSR disabled
export const LazyExperienceMap = dynamic(
  () => import('./experience-map').then(mod => ({ default: mod.ExperienceMap })),
  {
    loading: () => <ExperienceMapSkeleton />,
    ssr: false // Requires browser APIs
  }
)

// Medium components - SSR enabled
export const LazyConnectionsTab = dynamic(
  () => import('./connections-tab').then(mod => ({ default: mod.ConnectionsTab })),
  {
    loading: () => <ConnectionsTabSkeleton />
  }
)
```

**Benefits:**
- Reduced initial bundle size
- Code splitting per component
- Skeleton loaders for UX
- SSR control for browser-only libs

#### Progressive Loading with Intersection Observer

```tsx
import { ProgressiveLoader } from '@/components/profile/lazy-profile-components'

<ProgressiveLoader rootMargin="200px" skeleton={<MapSkeleton />}>
  <LazyExperienceMap experiences={data} />
</ProgressiveLoader>
```

**Benefits:**
- Components load 200px before viewport
- Reduces initial page weight
- Smooth progressive hydration

#### Parallel Data Fetching (Already Implemented)

In `/app/[locale]/profile/[id]/page.tsx`:

```typescript
// Parallel fetching with Promise.all
const [{ count: drafts }, { count: privateExp }] = await Promise.all([
  supabase.from('experiences')...eq('visibility', 'draft'),
  supabase.from('experiences')...eq('visibility', 'private')
])
```

**Future Enhancement:**
Add API route aggregation for XP Twins + Category Stats + Patterns:

```typescript
// In page.tsx
const [similarUsers, categoryStats, patterns] = await Promise.all([
  fetch(`/api/users/${id}/similar`).then(r => r.json()),
  fetch(`/api/users/${id}/category-stats`).then(r => r.json()),
  fetch(`/api/users/${id}/pattern-contributions`).then(r => r.json())
])
```

---

## 🚀 Integration Steps

### Step 1: Database Migrations

```bash
# Apply migrations (already applied if you ran them)
supabase migration up
```

### Step 2: Regenerate Supabase Types

```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

**Note:** Until types are regenerated, use `(supabase as any)` for new tables:
- `user_category_stats`
- `user_pattern_contributions`

### Step 3: Import Components

**Option A: Lazy-Loaded (Recommended for heavy components)**
```tsx
import {
  LazyActivityHeatmap,
  LazyExperienceMap,
  LazyConnectionsTab,
  LazyPatternContributionsCard,
  LazyUserComparisonModal,
  ProgressiveLoader
} from '@/components/profile/lazy-profile-components'
```

**Option B: Direct Import (Lightweight components)**
```tsx
import { XPDNABadge } from '@/components/profile/xp-dna-badge'
import { XPTwinsCard } from '@/components/profile/xp-twins-card'
```

### Step 4: Fetch Data in Profile Page

```tsx
// In app/[locale]/profile/[id]/page.tsx

// Parallel fetch for new data
const [similarUsers, categoryStats, patterns, activityData] = await Promise.all([
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/${id}/similar`),
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/${id}/category-stats`),
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/${id}/pattern-contributions`),
  // Activity data from experiences table
  supabase
    .from('experiences')
    .select('created_at')
    .eq('user_id', id)
    .eq('visibility', 'public')
])

// Transform to component format
const activityMap = activityData.data?.reduce((acc, exp) => {
  const date = new Date(exp.created_at).toISOString().split('T')[0]
  acc[date] = (acc[date] || 0) + 1
  return acc
}, {})

const activityArray = Object.entries(activityMap).map(([date, count]) => ({
  date,
  count: count as number
}))
```

### Step 5: Use Components in Tab Layout

Example integration in existing `ProfileClientTabs`:

```tsx
// Add new tab
<TabsContent value="insights" className="space-y-6">
  {/* XP DNA Badge */}
  <div className="flex justify-center">
    <XPDNABadge
      categoryStats={categoryStats.stats}
      size={128}
      showTooltip={true}
    />
  </div>

  {/* Activity Heatmap */}
  <ProgressiveLoader skeleton={<ActivityHeatmapSkeleton />}>
    <LazyActivityHeatmap
      activityData={activityArray}
      title="Activity Calendar"
    />
  </ProgressiveLoader>

  {/* Experience Map */}
  <ProgressiveLoader skeleton={<ExperienceMapSkeleton />}>
    <LazyExperienceMap
      experiences={experiencesWithLocation}
      enableClustering={true}
    />
  </ProgressiveLoader>

  {/* Pattern Contributions */}
  <LazyPatternContributionsCard
    contributions={patterns.contributions}
    totalPatterns={patterns.total}
  />
</TabsContent>

<TabsContent value="connections">
  <LazyConnectionsTab
    userId={userId}
    xpTwins={similarUsers.users}
    onConnect={handleConnect}
    onViewProfile={(id) => router.push(`/profile/${id}`)}
  />
</TabsContent>
```

---

## 🎨 Accessibility Features

All components include:
- **ARIA labels** on interactive elements
- **Keyboard navigation** support
- **Screen reader** friendly descriptions
- **Focus indicators** on all buttons/links
- **Semantic HTML** structure

Example:
```tsx
<div
  role="img"
  aria-label="Activity heatmap showing experience submission frequency"
>
  {/* Calendar visualization */}
</div>
```

---

## 🧪 Testing

### Build Test
```bash
npm run build
```

All TypeScript errors have been resolved with type casts for new tables.

### Component Tests (Future)
```tsx
// Example with React Testing Library
import { render, screen } from '@testing-library/react'
import { XPDNABadge } from '@/components/profile/xp-dna-badge'

test('renders XP DNA badge with tooltip', () => {
  render(
    <XPDNABadge
      categoryStats={mockStats}
      showTooltip={true}
    />
  )
  expect(screen.getByText('XP DNA')).toBeInTheDocument()
})
```

---

## 📊 Performance Metrics

**Expected Improvements:**
- **Initial Bundle Size:** -180KB (Map + Heatmap lazy-loaded)
- **First Contentful Paint:** Faster due to code splitting
- **Time to Interactive:** Progressive loading reduces blocking

**Monitoring:**
```tsx
// Add to page.tsx for real user monitoring
import { trackPerformance } from '@/lib/analytics'

useEffect(() => {
  trackPerformance({
    page: 'profile',
    metrics: {
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime
    }
  })
}, [])
```

---

## 🔒 Security Considerations

1. **RLS Policies:** All new tables have RLS enabled
2. **Type Casting:** Use `(supabase as any)` only until types regenerated
3. **Input Validation:** API routes validate user IDs and params
4. **Rate Limiting:** Consider adding to similarity endpoints (expensive queries)

---

## 📝 TODO for Full Production

- [ ] Regenerate Supabase types after migrations
- [ ] Add rate limiting to `/api/users/[id]/similar` (10 req/min)
- [ ] Create materialized view for user_similarity (nightly refresh)
- [ ] Add E2E tests for new components
- [ ] Add performance monitoring
- [ ] Create admin dashboard for similarity tuning
- [ ] Document pattern contribution scoring algorithm

---

## 🐛 Troubleshooting

### Issue: TypeScript errors on new tables
**Solution:** Use `(supabase as any)` until types regenerated:
```tsx
const { data } = await (supabase as any)
  .from('user_category_stats')
  .select('*')
```

### Issue: Leaflet not loading
**Solution:** Ensure `ssr: false` in dynamic import:
```tsx
export const LazyExperienceMap = dynamic(
  () => import('./experience-map'),
  { ssr: false }
)
```

### Issue: Cal-Heatmap CSS not applying
**Solution:** Import CSS in component:
```tsx
import 'cal-heatmap/cal-heatmap.css'
```

---

## 🎯 Success Criteria

✅ All database migrations applied
✅ All API routes functional
✅ All UI components created
✅ Lazy loading implemented
✅ Production build passes
✅ Accessibility features included
✅ Performance optimized

**Status:** Complete - Ready for integration into profile page!
