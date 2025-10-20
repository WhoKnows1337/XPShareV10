# XPShare Profile - UI Components

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu API Routes](./04-api-routes.md) | [➡️ Weiter zu Accessibility](./06-accessibility.md)

---

## 📦 Component Specifications

### 1. XPDNABadge ✅ IMPLEMENTED

**File:** `components/profile/xp-dna-badge.tsx`

**Purpose:** Visual "fingerprint" showing user's Top-3 categories with gradient

**Props:**
```typescript
interface XPDNABadgeProps {
  topCategories: string[]
  categoryDistribution: Record<string, number>
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}
```

**Implementation:**
```typescript
export function XPDNABadge({
  topCategories,
  categoryDistribution,
  size = 'md',
  showLabel = false,
  className
}: XPDNABadgeProps) {
  const top3 = topCategories.slice(0, 3)

  // Generate gradient from top 3 category colors
  const colors = top3.map(cat => getCategoryColor(cat))
  const gradient = `linear-gradient(135deg, ${colors.join(', ')})`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'rounded-full flex items-center justify-center font-bold text-white shadow-lg',
              size === 'sm' && 'w-12 h-12 text-xs',
              size === 'md' && 'w-16 h-16 text-sm',
              size === 'lg' && 'w-24 h-24 text-lg',
              className
            )}
            style={{ background: gradient }}
          >
            🌈
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {top3.map(cat => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: getCategoryColor(cat) }} />
                <span>{cat} ({categoryDistribution[cat]}%)</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

**Features:**
- Gradient badge based on Top-3 categories
- Hover tooltip shows exact distribution
- 3 size variants (sm, md, lg)
- Optional label display

---

### 2. XPDNASpectrumBar ✅ IMPLEMENTED

**File:** `components/profile/xp-dna-spectrum-bar.tsx`

**Purpose:** Horizontal stacked bar chart showing all category distribution

**Props:**
```typescript
interface XPDNASpectrumBarProps {
  categoryDistribution: Record<string, number>
  showTopLabels?: boolean
  interactive?: boolean
}
```

**Implementation:**
```typescript
export function XPDNASpectrumBar({
  categoryDistribution,
  showTopLabels = true,
  interactive = true
}: XPDNASpectrumBarProps) {
  const sortedCategories = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-2">
      {/* Stacked Bar */}
      <div className="flex h-8 rounded-lg overflow-hidden">
        {sortedCategories.map(([category, percentage]) => (
          <div
            key={category}
            style={{
              width: `${percentage}%`,
              background: getCategoryColor(category)
            }}
            className={cn(
              "transition-all",
              interactive && "hover:opacity-80 cursor-pointer"
            )}
            title={`${category}: ${percentage}%`}
          />
        ))}
      </div>

      {/* Top 3 Labels */}
      {showTopLabels && (
        <div className="flex gap-2 text-sm text-muted-foreground">
          {sortedCategories.slice(0, 3).map(([category, percentage]) => (
            <span key={category}>
              {getCategoryEmoji(category)} {category} ({percentage}%)
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Features:**
- Proportional stacked bar chart
- Color-coded per category
- Interactive hover effects
- Top-3 labels below

---

### 3. SimilarityScoreBadge ✅ IMPLEMENTED

**File:** `components/profile/similarity-score-badge.tsx`

**Purpose:** Compact badge showing similarity % between users

**Props:**
```typescript
interface SimilarityScoreBadgeProps {
  profileUserId: string
  currentUserId: string
  minScore?: number
}
```

**Implementation:**
```typescript
export function SimilarityScoreBadge({
  profileUserId,
  currentUserId,
  minScore = 30
}: SimilarityScoreBadgeProps) {
  const [similarity, setSimilarity] = useState<number | null>(null)

  useEffect(() => {
    // Check sessionStorage cache first (5min TTL)
    const cacheKey = `similarity_${currentUserId}_${profileUserId}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        setSimilarity(data.similarity_score)
        return
      }
    }

    // Fetch from API
    fetch(`/api/users/similarity?user1=${currentUserId}&user2=${profileUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.similarity) {
          setSimilarity(data.similarity.similarity_score)
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: data.similarity,
            timestamp: Date.now()
          }))
        }
      })
  }, [currentUserId, profileUserId])

  if (!similarity || similarity < minScore / 100) return null

  const matchPercent = Math.round(similarity * 100)

  return (
    <Badge variant="secondary" className="text-sm">
      🎯 {matchPercent}% Match
    </Badge>
  )
}
```

**Features:**
- Client-side caching (sessionStorage, 5min TTL)
- Only shows if similarity >= minScore
- Compact badge format

**Note:** This is the SMALL badge. The XP Twins Hero Section should be a PROMINENT banner (see visual-hierarchy.md)

---

### 4. XPTwinsSidebarCard ✅ IMPLEMENTED

**File:** `components/profile/xp-twins-sidebar-card.tsx`

**Purpose:** Sidebar preview of 5 most similar users

**Props:**
```typescript
interface XPTwinsSidebarCardProps {
  profileUserId: string
  currentUserId: string
  isOwnProfile: boolean
}
```

**Implementation:**
```typescript
export function XPTwinsSidebarCard({
  profileUserId,
  currentUserId,
  isOwnProfile
}: XPTwinsSidebarCardProps) {
  const [similarUsers, setSimilarUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOwnProfile) {
      setLoading(false)
      return
    }

    fetch(`/api/users/${profileUserId}/similar?limit=5&minSimilarity=0.3`)
      .then(res => res.json())
      .then(data => {
        if (data.similar_users) {
          setSimilarUsers(data.similar_users)
        }
      })
      .finally(() => setLoading(false))
  }, [profileUserId, isOwnProfile])

  if (isOwnProfile || similarUsers.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          XP Twins
        </CardTitle>
        <CardDescription>Similar to this user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {similarUsers.map(user => (
          <div key={user.user_id} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">@{user.username}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(user.similarity_score * 100)}% Match
              </p>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/profile/${profileUserId}?tab=connections`}>
            View All Similar Users →
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Features:**
- Fetches 5 most similar users
- Shows avatar, username, similarity %
- "View All" CTA to Connections tab
- Only renders on other profiles

---

### 5. XPTwinsHeroSection ❌ MISSING

**File:** `components/profile/xp-twins-hero-section.tsx` (NOT IMPLEMENTED)

**Purpose:** PROMINENT banner showing "87% MATCH WITH YOU!" with detailed similarity breakdown

**Priority:** HIGH (Main gap identified in profil.md analysis)

**Expected UI:**
```
╔═══════════════════════════════════════════════════════╗
║  🎯 87% MATCH WITH YOU!                               ║
╚═══════════════════════════════════════════════════════╝

┌─── Shared XP DNA ─────────────────────────────────────┐
│  🛸 UFO (Both Top Category)                           │
│  💭 Dreams (Maria: 32%, You: 28%)                     │
│  ⚡ Synchronicity (Common Interest)                   │
└───────────────────────────────────────────────────────┘

┌─── Shared Experiences ────────────────────────────────┐
│  🌟 "Berlin UFO Sighting 2023" (3 users witnessed)    │
│  🔮 "Full Moon Dream Pattern" (Pattern Match)         │
│  📍 Both active in: Berlin, Brandenburg               │
└───────────────────────────────────────────────────────┘

┌─── More XP Twins ─────────────────────────────────────┐
│  👤 @cosmic_john     81% Match  │ 🔗 UFO·Entity·Time  │
│  👤 @dreamer_23      76% Match  │ 🔗 Dreams·Sync·NDE  │
│  👤 @berlin_witness  73% Match  │ 🔗 UFO·Para·Energy  │
│                                                        │
│  [View All Similar Users →]                            │
└───────────────────────────────────────────────────────┘
```

**Expected Props:**
```typescript
interface XPTwinsHeroSectionProps {
  currentUserId: string
  profileUserId: string
}
```

**Expected API Endpoint:** `/api/users/[id]/xp-twins` (see 04-api-routes.md)

**Expected Placement:** Between Profile Header and Stats Grid (see 02-visual-hierarchy.md)

---

### 6. EnhancedStatsGrid ✅ IMPLEMENTED

**File:** `components/profile/enhanced-stats-grid.tsx`

**Purpose:** 6-8 stat cards showing Level, XP, Streak, Experiences, Connections, Patterns, Countries, Percentile

**Props:**
```typescript
interface EnhancedStatsGridProps {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalExperiences: number
  totalContributions: number
  percentile: number
  geographicReach: number
  connectionsCount: number
}
```

**Grid Layout:**
- Mobile: 2 columns
- Tablet: 4 columns
- Desktop: 6 columns

**Features:**
- Icon + Number + Label format
- Hover effects
- Responsive grid
- Color-coded icons

---

### 7. CategoryRadarChart ✅ IMPLEMENTED

**File:** `components/profile/category-radar-chart.tsx`

**Purpose:** Interactive radar/spider chart + list view of category distribution

**Props:**
```typescript
interface CategoryRadarChartProps {
  categoryDistribution: Record<string, number>
}
```

**Implementation:**
```typescript
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

export function CategoryRadarChart({ categoryDistribution }: CategoryRadarChartProps) {
  const chartData = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .map(([category, percentage]) => ({
      category,
      value: percentage,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>XP DNA Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Categories"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* List View with Progress Bars */}
        <div className="mt-4 space-y-2">
          {chartData.map(({ category, value }) => (
            <div key={category} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">
                    {getCategoryEmoji(category)} {category}
                  </span>
                  <span className="text-sm font-semibold">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Features:**
- Recharts Radar Chart
- Responsive container
- Color-coded categories
- List view with progress bars
- Click category → Filter experiences (future enhancement)

---

### 8. ActivityHeatmap ✅ IMPLEMENTED

**File:** `components/profile/activity-heatmap.tsx`

**Purpose:** GitHub-style contribution calendar showing last 12 months

**Props:**
```typescript
interface ActivityHeatmapProps {
  userId: string
  title?: string
}
```

**Implementation:**
```typescript
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'

export function ActivityHeatmap({ userId, title = "Activity Heatmap" }: ActivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const cal = new CalHeatmap()
    cal.paint({
      itemSelector: containerRef.current,
      domain: { type: 'month' },
      subDomain: { type: 'day' },
      data: {
        source: `/api/users/${userId}/activity`,
        type: 'json',
        x: 'date',
        y: 'xp_earned',
      },
      date: { start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      range: 12,
      scale: {
        color: {
          type: 'threshold',
          range: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
          domain: [1, 3, 6, 10],
        },
      },
    })

    return () => cal.destroy()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} />

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map(color => (
              <div key={color} className="w-3 h-3" style={{ background: color }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Features:**
- Cal-Heatmap library
- Last 12 months view
- Tooltip with exact XP count
- Color scale (0 XP → 10+ XP)
- Click day → Experiences on that day (future enhancement)

---

### 9. PatternContributionsCard ✅ IMPLEMENTED

**File:** `components/profile/pattern-contributions-card.tsx`

**Purpose:** Shows user's pattern discoveries and community impact

**Props:**
```typescript
interface PatternContributionsCardProps {
  contributions: Array<{
    pattern_type: string
    pattern_title: string
    pattern_description: string
    contribution_count: number
    related_experience_ids: string[]
  }>
  totalPatterns: number
  title?: string
  maxVisible?: number
}
```

**Implementation:**
```typescript
export function PatternContributionsCard({
  contributions,
  totalPatterns,
  title = "Pattern Discoveries",
  maxVisible = 3
}: PatternContributionsCardProps) {
  const visibleContributions = contributions.slice(0, maxVisible)
  const hasMore = contributions.length > maxVisible

  if (contributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No pattern contributions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{totalPatterns} patterns discovered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleContributions.map((contrib, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="font-semibold text-sm">🧩 {contrib.pattern_title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {contrib.pattern_description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>↳ {contrib.contribution_count} users confirmed</span>
              <span>·</span>
              <span>{contrib.related_experience_ids.length} experiences</span>
            </div>
          </div>
        ))}

        {hasMore && (
          <Button variant="outline" size="sm" className="w-full">
            View All {totalPatterns} Patterns →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

**Features:**
- Empty state with icon
- Max visible limit (3 by default)
- "View All" CTA if more patterns exist
- Shows confirmation count + experience count

---

### 10. ConnectionsTab ✅ IMPLEMENTED

**File:** `components/profile/connections-tab.tsx`

**Purpose:** Main Connections tab with 4 sub-tabs (XP Twins, Location, Patterns, Mutual)

**Props:**
```typescript
interface ConnectionsTabProps {
  userId: string
  xpTwins: SimilarUser[]
  locationConnections: SimilarUser[]
  patternConnections: SimilarUser[]
  mutualConnections: SimilarUser[]
  onConnect: (userId: string) => Promise<void>
  onViewProfile: (userId: string) => void
}
```

**Sub-Tabs:**
1. **XP Twins:** Highest similarity users (>80%)
2. **Location:** Same city/country users
3. **Patterns:** Co-discoverers of patterns
4. **Mutual:** Mutual witnesses of same experiences

**Features:**
- Tab navigation between connection types
- Grid layout (2 cols mobile, 3 cols desktop)
- Connection cards with avatar, username, similarity %, shared categories
- Connect button + View Profile button
- Empty states for each sub-tab

---

### 11. ExperienceMap ⚠️ PARTIAL

**File:** `components/profile/experience-map.tsx`

**Purpose:** Interactive Leaflet map showing all user's experience locations

**Props:**
```typescript
interface ExperienceMapProps {
  userId: string
  experiences: Array<{
    id: string
    title: string
    location_city: string
    location_country: string
    latitude: number
    longitude: number
  }>
}
```

**Expected Features:**
- Leaflet map with heatmap layer
- Markers color-coded by activity density:
  - 🔴 High activity (5+ experiences)
  - 🟠 Medium activity (2-4 experiences)
  - 🟡 Single experience
- Heatmap toggle
- Filter by category
- Click marker → Experience preview
- Stats: X Countries, Y Cities, Z Locations

**Status:** Implemented but not yet integrated into Map tab

---

### 12. ProfileLayoutGrid ✅ IMPLEMENTED

**File:** `components/profile/profile-layout-grid.tsx`

**Purpose:** 2-column responsive grid (Main 2/3 + Sidebar 1/3)

**Props:**
```typescript
interface ProfileLayoutGridProps {
  mainContent: React.ReactNode
  sidebarContent: React.ReactNode
  className?: string
}
```

**Layout:**
- Mobile: Single column (Main → Sidebar)
- Desktop: 2 columns (Main 66% | Sidebar 33%)

---

### 13. MobileActionBar ✅ IMPLEMENTED

**File:** `components/profile/mobile-action-bar.tsx`

**Purpose:** Sticky bottom action bar on mobile for quick access

**Props:**
```typescript
interface MobileActionBarProps {
  isOwnProfile: boolean
}
```

**Features:**
- Fixed bottom position on mobile
- Edit Profile / Connect button
- Hidden on desktop (md:hidden)

---

## 🛠️ Utility Functions

### getCategoryColor()

**File:** `lib/utils/category-colors.ts`

**Purpose:** Map category names to consistent colors

```typescript
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'UFO': '#7c3aed', // purple
    'Dreams': '#3b82f6', // blue
    'Paranormal': '#ec4899', // pink
    'NDE': '#14b8a6', // teal
    'Synchronicity': '#f59e0b', // amber
    'Entity Contact': '#8b5cf6', // violet
    'Time Anomaly': '#06b6d4', // cyan
    'Energy': '#10b981', // emerald
    'Consciousness': '#6366f1', // indigo
    // ... more categories
  }
  return colorMap[category] || '#6b7280' // default gray
}
```

### getCategoryEmoji()

**File:** `lib/utils/category-emojis.ts`

**Purpose:** Map category names to emoji icons

```typescript
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'UFO': '🛸',
    'Dreams': '💭',
    'Paranormal': '👻',
    'NDE': '💫',
    'Synchronicity': '⚡',
    'Entity Contact': '👽',
    'Time Anomaly': '🕐',
    'Energy': '⚡',
    'Consciousness': '🧠',
    // ... more categories
  }
  return emojiMap[category] || '✨' // default sparkle
}
```

---

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu API Routes](./04-api-routes.md) | [➡️ Weiter zu Accessibility](./06-accessibility.md)
