# XPShare Profile - Accessibility & Performance

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Components](./05-components.md) | [➡️ Weiter zu Implementation Status](./07-implementation-status.md)

---

## ♿ WCAG 2.1 AAA Compliance

### Skip Links ⚠️ PARTIAL

**Purpose:** Allow keyboard users to skip directly to main content

**Implementation:**
```typescript
// components/profile/skip-links.tsx
export function SkipLinks() {
  return (
    <>
      <a
        href="#profile-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to Profile Content
      </a>
      <a
        href="#profile-tabs"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to Tabs
      </a>
    </>
  )
}
```

**Status:** Basic skip links exist, but need enhancement for XP Twins section

---

### ARIA Labels & Live Regions ⚠️ PARTIAL

**Critical for Screen Readers:**

```typescript
// components/profile/xp-twins-card.tsx (Accessible Version)
export function XPTwinsCard({ similarity }: { similarity: SimilarityData }) {
  const matchPercent = Math.round(similarity.score * 100)

  return (
    <Card
      role="region"
      aria-labelledby="xp-twins-title"
      aria-describedby="xp-twins-description"
    >
      <CardHeader>
        <CardTitle id="xp-twins-title">
          <span aria-label={`${matchPercent} percent match with you`}>
            🎯 {matchPercent}% MATCH WITH YOU!
          </span>
        </CardTitle>
        <CardDescription id="xp-twins-description">
          You share {similarity.shared_categories.length} common categories with this user
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Live Region for Dynamic Updates */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {connectionStatus === 'connecting' && 'Sending connection request'}
          {connectionStatus === 'connected' && 'Connection request sent successfully'}
        </div>

        {/* Accessible Button Group */}
        <div role="group" aria-label="Connection actions" className="flex gap-2">
          <Button
            onClick={handleConnect}
            aria-label={`Connect with ${similarity.user.username}`}
            aria-describedby="connect-description"
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Connect
          </Button>
          <span id="connect-description" className="sr-only">
            Send a connection request to start collaborating
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Key Principles:**
- All icons have `aria-hidden="true"`
- All buttons have descriptive `aria-label`
- Live regions announce dynamic content changes
- `role="region"` for major page sections

**Status:** Partially implemented - some components need ARIA enhancement

---

### Keyboard Navigation ⚠️ NEEDS ENHANCEMENT

**Requirement:** All interactive elements must be keyboard accessible

```typescript
// components/profile/category-radar-chart.tsx (Keyboard Accessible)
export function CategoryRadarChart({ stats }: { stats: CategoryStat[] }) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev === null ? 0 : (prev + 1) % stats.length))
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev === null ? stats.length - 1 : (prev - 1 + stats.length) % stats.length
        )
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(stats.length - 1)
        break
    }
  }

  return (
    <Card role="figure" aria-labelledby="chart-title">
      <CardHeader>
        <CardTitle id="chart-title">XP DNA Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Accessible Chart Alternative */}
        <table className="sr-only" role="table" aria-label="Category distribution data">
          <caption>Experience category distribution by percentage</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Percentage</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr key={stat.category}>
                <td>{stat.category}</td>
                <td>{stat.percentage}%</td>
                <td>{stat.experience_count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Visual Chart */}
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              {/* ... chart config ... */}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Keyboard-Navigable List */}
        <div
          role="list"
          className="mt-4 space-y-2"
          onKeyDown={(e) => handleKeyDown(e, focusedIndex ?? 0)}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.category}
              role="listitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              ref={(el) => focusedIndex === index && el?.focus()}
              className="flex items-center gap-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {/* ... stat content ... */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Keyboard Navigation Requirements:**
- ✅ Tab/Shift+Tab: Navigate between interactive elements
- ⚠️ Arrow Keys: Navigate within lists and charts
- ⚠️ Home/End: Jump to first/last item
- ✅ Enter/Space: Activate buttons
- ✅ Escape: Close modals/dialogs

**Status:** Basic tab navigation works, arrow key navigation needs implementation

---

### Focus States ✅ IMPLEMENTED

**All interactive elements must have visible focus indicators:**

```typescript
export const interactionStyles = {
  // Focus Ring (WCAG AAA)
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',

  // Active Press State
  active: 'active:scale-95 transition-transform',

  // Disabled State
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

  // Loading State
  loading: 'relative disabled:opacity-100',
}

// Example Usage
<Button
  className={cn(
    'transition-all duration-200',
    interactionStyles.focusRing,
    interactionStyles.active,
    interactionStyles.disabled
  )}
  disabled={isLoading}
>
  {isLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  )}
  <span className={cn(isLoading && 'opacity-0')}>
    Connect
  </span>
</Button>
```

**Status:** ✅ Implemented via shadcn/ui components

---

### Color Contrast ✅ IMPLEMENTED

**WCAG AAA Requirements:**
- Normal text: 7:1 contrast ratio
- Large text (18pt+): 4.5:1 contrast ratio

**Category Colors:**
```typescript
export const CATEGORY_COLORS = {
  'ufo': 'hsl(240, 100%, 65%)',           // Blue
  'dreams': 'hsl(280, 85%, 70%)',         // Purple
  'paranormal': 'hsl(160, 80%, 50%)',     // Teal
  'synchronicity': 'hsl(45, 100%, 60%)',  // Gold
  'psychedelic': 'hsl(320, 90%, 65%)',    // Magenta
  'nde-obe': 'hsl(200, 80%, 60%)',        // Light Blue
  'meditation': 'hsl(140, 70%, 55%)',     // Green
  'astral': 'hsl(260, 85%, 65%)',         // Indigo
  'time-anomaly': 'hsl(30, 100%, 60%)',   // Orange
  'entity': 'hsl(340, 90%, 60%)',         // Red-Pink
  'energy': 'hsl(60, 100%, 60%)',         // Yellow
  'other': 'hsl(0, 0%, 60%)',             // Gray
} as const
```

**Status:** ✅ All colors meet WCAG AA (AAA needs verification)

---

## 📱 Mobile-First & Responsive Design

### Touch Targets (Minimum 44x44px) ✅ IMPLEMENTED

**Apple HIG & Material Design Standard:**

```typescript
export const TOUCH_TARGETS = {
  minimum: '44px', // Apple HIG & Material Design
  comfortable: '48px', // Recommended
  large: '56px', // For primary actions
}

// Example Implementation
<Button
  className="min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-[40px]"
  size="icon"
>
  <Heart className="h-5 w-5" />
</Button>
```

**Status:** ✅ All buttons meet minimum touch target size

---

### Thumb Zone Optimization ✅ IMPLEMENTED

**File:** `components/profile/mobile-action-bar.tsx`

```typescript
export function MobileActionBar({ isOwnProfile }: { isOwnProfile: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden z-40">
      {/* Actions in Thumb-Friendly Bottom Area */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {isOwnProfile ? (
          <>
            <Button size="lg" className="min-h-[48px]">
              <Settings className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
            <Button size="lg" variant="outline" className="min-h-[48px]">
              <Download className="mr-2 h-5 w-5" />
              Download Report
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" className="min-h-[48px]">
              <UserPlus className="mr-2 h-5 w-5" />
              Connect
            </Button>
            <Button size="lg" variant="outline" className="min-h-[48px]">
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

**Status:** ✅ Implemented

---

### Responsive Breakpoints ✅ IMPLEMENTED

**Tailwind Configuration:**

```typescript
// tailwind.config.ts - XPShare Breakpoints
module.exports = {
  theme: {
    screens: {
      'xs': '375px',  // Small phones
      'sm': '640px',  // Large phones
      'md': '768px',  // Tablets
      'lg': '1024px', // Desktop
      'xl': '1280px', // Large desktop
      '2xl': '1536px', // Extra large
    },
  },
}

// Usage Example
<div className="
  grid grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2            // Phone landscape: 2 columns
  md:grid-cols-3            // Tablet: 3 columns
  lg:grid-cols-4            // Desktop: 4 columns
  gap-3 sm:gap-4 lg:gap-6   // Progressive spacing
">
  {/* Stats Cards */}
</div>
```

**Layout Adaptations:**

**Mobile (< 768px):**
- 1-column layout for all sections
- Stacked avatar + info
- Horizontal scroll for tabs
- Simplified stats (4 most important)
- Collapsed XP DNA (show badge only, expand on tap)

**Tablet (768px - 1024px):**
- 2-column grid for stats
- Side-by-side avatar + info
- Full tab navigation
- 6 stats visible
- Full XP DNA spectrum

**Desktop (> 1024px):**
- 2-column layout for content sections
- 3-column grid for connections
- 8 stats in grid
- Expanded visualizations

**Status:** ✅ Fully responsive via Tailwind

---

## ⚡ Performance Optimization

### Image Optimization ⚠️ PARTIAL

**Next.js Image with Blur Placeholder:**

```typescript
// components/profile/optimized-avatar.tsx
import Image from 'next/image'
import { getPlaiceholder } from 'plaiceholder'

interface OptimizedAvatarProps {
  src: string
  alt: string
  size?: number
  priority?: boolean
}

export async function OptimizedAvatar({
  src,
  alt,
  size = 128,
  priority = false
}: OptimizedAvatarProps) {
  // Generate blur placeholder
  const { base64 } = await getPlaiceholder(src)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        placeholder="blur"
        blurDataURL={base64}
        priority={priority}
        sizes={`${size}px`}
        quality={85}
      />
    </div>
  )
}
```

**Status:** Avatar uses Next.js Image, but blur placeholder not yet implemented

---

### Code Splitting & Lazy Loading ⚠️ NEEDS ENHANCEMENT

**Dynamic Imports for Heavy Components:**

```typescript
// app/[locale]/profile/[id]/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const CategoryRadarChart = dynamic(() =>
  import('@/components/profile/category-radar-chart').then(mod => mod.CategoryRadarChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Client-side only
  }
)

const ActivityHeatmap = dynamic(() =>
  import('@/components/profile/activity-heatmap').then(mod => mod.ActivityHeatmap),
  {
    loading: () => <HeatmapSkeleton />,
    ssr: false,
  }
)

const XPTwinsCard = dynamic(() =>
  import('@/components/profile/xp-twins-card').then(mod => mod.XPTwinsCard),
  {
    loading: () => <TwinsSkeleton />,
  }
)

export default function ProfilePage() {
  return (
    <div>
      {/* Critical content renders immediately */}
      <ProfileHeader />
      <UserStats />

      {/* Heavy charts lazy loaded */}
      <Suspense fallback={<ChartSkeleton />}>
        <CategoryRadarChart stats={stats} />
      </Suspense>

      <Suspense fallback={<HeatmapSkeleton />}>
        <ActivityHeatmap userId={userId} />
      </Suspense>

      {/* XP Twins only loads when scrolled into view */}
      <LazyLoadOnVisible>
        <XPTwinsCard userId={userId} />
      </LazyLoadOnVisible>
    </div>
  )
}
```

**Intersection Observer for Viewport-Based Loading:**

```typescript
function LazyLoadOnVisible({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{isVisible ? children : <div className="h-64" />}</div>
}
```

**Status:** Not yet implemented - all components load immediately

---

### Data Fetching Optimization ✅ IMPLEMENTED

**Parallel Data Fetching:**

```typescript
// app/[locale]/profile/[username]/page.tsx
export async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch all data in parallel
  const [profileResult, categoryStats, similarUsers] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('username', username).single(),
    supabase.from('user_category_stats').select('*').eq('user_id', id),
    supabase.from('user_similarity_cache').select('*').eq('user_id', id).limit(10),
  ])

  return <ProfileClientTabs {...data} />
}
```

**Status:** ✅ Parallel fetching implemented

---

### Skeleton Loading States ✅ IMPLEMENTED

**Profile Skeleton:**

```typescript
// components/profile/profile-skeleton.tsx
export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="h-32 w-32 rounded-full bg-muted loading-shimmer" />

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
              <div className="h-4 w-32 bg-muted rounded loading-shimmer" />
              <div className="h-12 w-full bg-muted rounded loading-shimmer" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-muted loading-shimmer mx-auto" />
                <div className="h-6 w-16 bg-muted rounded loading-shimmer mx-auto" />
                <div className="h-3 w-20 bg-muted rounded loading-shimmer mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

**Shimmer Animation CSS:**

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Status:** ✅ Basic skeleton implemented in loading.tsx

---

### Virtualized Lists ❌ NOT IMPLEMENTED

**For Large Connection Lists (200+ users):**

```typescript
// components/profile/virtualized-connections-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedConnectionsList({ connections }: { connections: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: connections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height per item
    overscan: 5, // Render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ConnectionCard connection={connections[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Status:** ❌ Not implemented - will be needed when users have 200+ connections

---

## 🎨 Micro-Interactions & Animations

### Hover States ✅ IMPLEMENTED

**Card Hover Lift:**

```typescript
<Card className="group hover-lift transition-all duration-300">
  <style jsx>{`
    .hover-lift {
      transition: transform var(--duration-quick) var(--ease-elegant),
                  box-shadow var(--duration-quick) var(--ease-elegant);
    }
    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-moderate);
    }
  `}</style>

  <CardContent className="relative">
    {/* Icon with Scale on Hover */}
    <Icon className="transition-transform group-hover:scale-110" />

    {/* Subtle Background Glow on Hover */}
    <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </CardContent>
</Card>
```

**Status:** ✅ Implemented via Tailwind utilities

---

### Page Transitions ❌ NOT IMPLEMENTED

**Framer Motion for Smooth Transitions:**

```typescript
// app/[locale]/profile/[id]/layout.tsx
import { AnimatePresence, motion } from 'framer-motion'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Status:** ❌ Not implemented

---

## 🔐 Privacy & Permissions

### User Controls ❌ NOT IMPLEMENTED

**Profile Visibility Settings (Future Feature):**
- [ ] Public (default) - Anyone can see full profile
- [ ] Community - Only registered users
- [ ] Connections Only - Only users with >50% match
- [ ] Private - Only me

**Similarity Opt-Out (Future Feature):**
- [ ] "Hide me from similarity matching"
- [ ] "Don't show my category distribution"
- [ ] "Don't suggest me to others"

**Connection Settings (Future Feature):**
- [ ] Auto-accept connections >80% match
- [ ] Require approval for all connections
- [ ] Block specific users from seeing similarity

**Status:** ❌ Not implemented - all profiles currently public

---

### Data Privacy ✅ IMPLEMENTED

**What we calculate:**
- Category distribution (from public experiences only)
- Geographic proximity (city/country level, no GPS)
- Temporal activity patterns
- Pattern co-contributions

**What we DON'T use:**
- Private experiences (excluded via RLS)
- Draft experiences (excluded via status filter)
- Exact location (only city/country)
- Personal messages
- Email or phone

**Status:** ✅ Implemented via Supabase RLS policies

---

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Components](./05-components.md) | [➡️ Weiter zu Implementation Status](./07-implementation-status.md)
