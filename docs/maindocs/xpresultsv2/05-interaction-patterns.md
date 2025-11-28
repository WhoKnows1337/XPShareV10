# Interaction Patterns

## 🎯 Overview

This document defines all interaction patterns, animations, loading strategies, and behavioral rules for the XPShare Post V2 design. These patterns ensure a consistent, delightful user experience across all components.

---

## ⚡ Core Principles

### 1. Immediate Feedback
Every user action receives instant visual feedback (within 16ms / 1 frame).

### 2. Progressive Enhancement
Core content loads first, enhancements follow.

### 3. Perceived Performance
Use optimistic updates, skeleton screens, and perceived progress to make the app feel fast.

### 4. Respect User Intent
Don't auto-play, don't auto-expand, don't interrupt user flow.

### 5. Graceful Degradation
Features should degrade gracefully if data is missing or APIs fail.

---

## 🔄 Loading Strategies

### Page Load Sequence

```
PHASE 1: Critical Content (0-100ms)
├─ Experience metadata (title, author, date)
├─ Story content (first 300 chars)
└─ Category badge

PHASE 2: Trust Signals (100-300ms)
├─ Validation Score Card
└─ Similar count

PHASE 3: Enhanced Context (300-800ms)
├─ Pattern Context Card
├─ Full story content
└─ Media thumbnails

PHASE 4: Interactive Elements (800ms+)
├─ Tab content (lazy loaded)
├─ Comments section
└─ Related sidebar
```

### Loading States by Component

#### DiscoveryLoadingModal
```
STATE 1: "Analyzing your experience..." (0-1s)
├─ Spinner + text
└─ Progress: 0%

STATE 2: "Finding similar experiences..." (1-2.5s)
├─ Animated search icon
├─ Progress: 33%
└─ Count incrementing animation (1... 5... 12...)

STATE 3: "Detecting patterns..." (2.5-3.5s)
├─ Animated wave/chart icon
├─ Progress: 66%
└─ Pattern type indicators appearing

STATE 4: "Done!" (3.5-4s)
├─ Success checkmark animation
├─ Progress: 100%
└─ Auto-dismiss after 500ms
```

**Implementation:**
```typescript
const loadingSteps = [
  { duration: 1000, progress: 0, label: "Analyzing...", icon: <Sparkles /> },
  { duration: 1500, progress: 33, label: "Finding similar...", icon: <Search /> },
  { duration: 1000, progress: 66, label: "Detecting patterns...", icon: <TrendingUp /> },
  { duration: 500, progress: 100, label: "Done!", icon: <Check /> }
];

// Auto-progress with useEffect + setTimeout
// Dismisses automatically when 100% complete
```

#### Skeleton Screens

**ValidationScoreCard Skeleton:**
```
┌─────────────────────────────────────────────┐
│ ░░░░░░░░░░      ░░░░░░░░        ░░░░░░░░   │
│                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░                     │
└─────────────────────────────────────────────┘
```

**ExperienceCard Skeleton (Similar Tab):**
```
┌─────────────────────────────────────────────┐
│ ░░░░░░ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░░░░░░░░░░░░░░░░░░░                       │
└─────────────────────────────────────────────┘
```

**Skeleton Implementation Rules:**
- Use `animate-pulse` class (Tailwind) for shimmer effect
- Match actual content layout dimensions
- Show 3-5 skeleton items for lists
- Never show skeleton > 3 seconds (show error state instead)

---

### Progressive Loading Strategy

#### Initial Load (SSR/RSC)
```typescript
// app/[locale]/experiences/[id]/page.tsx

export async function generateMetadata({ params }) {
  // Fetch minimal data for SEO
  const experience = await getExperienceMetadata(params.id);
  return { title: experience.title, description: experience.preview };
}

export default async function ExperienceDetailPage({ params, searchParams }) {
  // SSR: Load critical data
  const experience = await getExperience(params.id);
  const validation = await getValidation(params.id);

  // Client: Load rest via React Query
  return (
    <ExperienceDetailView
      experience={experience}
      validation={validation}
      justPublished={searchParams.justPublished === 'true'}
    />
  );
}
```

#### Client-Side Progressive Loading
```typescript
// Client component
function ExperienceDetailView({ experience, validation, justPublished }) {
  // Phase 1: Render with SSR data
  const [isReady, setIsReady] = useState(false);

  // Phase 2: Fetch enhanced data
  const { data: patterns } = useQuery(['patterns', experience.id], fetchPatterns);
  const { data: publishResult } = useQuery(
    ['publishResult', experience.id],
    fetchPublishResult,
    { enabled: justPublished && !publishResultFromStore }
  );

  // Phase 3: Mark ready when all critical data loaded
  useEffect(() => {
    if (validation && (justPublished ? publishResult : true)) {
      setIsReady(true);
    }
  }, [validation, publishResult, justPublished]);

  return (
    <>
      {justPublished && <DiscoveryLoadingModal isOpen={!isReady} />}
      {/* Rest of content */}
    </>
  );
}
```

#### Tab Lazy Loading
```typescript
// Only load tab content when tab is active
function BentoTabs({ experienceId, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Prefetch on hover (desktop only)
  const handleTabHover = (tab: TabKey) => {
    if (window.innerWidth > 768) {
      queryClient.prefetchQuery(['tab', tab, experienceId], () => fetchTabData(tab, experienceId));
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger onMouseEnter={() => handleTabHover('similar')}>
          Similar {counts.similar}
        </TabsTrigger>
        {/* ... */}
      </TabsList>

      <TabsContent value="similar">
        {activeTab === 'similar' && <SimilarTab experienceId={experienceId} />}
      </TabsContent>
      {/* Only render content for active tab */}
    </Tabs>
  );
}
```

---

## 🎨 Hover States & Microinteractions

### Card Hover Pattern

**Default State:**
```
border: 1px solid hsl(var(--border))
shadow: none
transform: none
```

**Hover State:**
```
border: 1px solid hsl(var(--primary) / 0.5)
shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
transform: translateY(-2px)
transition: all 200ms ease-out
```

**Active/Pressed State:**
```
transform: translateY(0)
shadow: 0 2px 6px rgba(0, 0, 0, 0.12)
transition: all 100ms ease-in
```

**Implementation:**
```typescript
const cardHoverClass = cn(
  "border border-border rounded-lg p-4",
  "transition-all duration-200 ease-out",
  "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5",
  "active:translate-y-0 active:shadow-sm"
);
```

### Button Hover Pattern

#### Primary Button
```typescript
const primaryButton = cn(
  "bg-primary text-primary-foreground",
  "hover:bg-primary/90",
  "active:scale-95",
  "transition-all duration-150"
);
```

#### Secondary Button
```typescript
const secondaryButton = cn(
  "bg-secondary text-secondary-foreground",
  "hover:bg-secondary/80",
  "active:scale-95",
  "transition-all duration-150"
);
```

#### Ghost Button
```typescript
const ghostButton = cn(
  "hover:bg-accent hover:text-accent-foreground",
  "active:scale-95",
  "transition-all duration-150"
);
```

### Icon Button Hover
```typescript
const iconButton = cn(
  "p-2 rounded-md",
  "hover:bg-accent",
  "active:scale-90",
  "transition-all duration-150"
);
```

### Link Hover
```typescript
const linkHover = cn(
  "text-primary underline-offset-4",
  "hover:underline",
  "transition-all duration-150"
);
```

### Tooltip on Hover
- Delay: 500ms before showing
- Fade in: 150ms
- Max width: 300px
- Position: Smart positioning (avoid viewport edges)
- Arrow: 8px pointing to target

```typescript
<Tooltip delayDuration={500}>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent className="max-w-[300px]">
    <p>Detailed explanation text</p>
  </TooltipContent>
</Tooltip>
```

---

## 📂 Expandable Sections

### Pattern Context Card Expansion

**Collapsed State (Default):**
```
┌─────────────────────────────────────────────┐
│ 🌊 PATTERN DETECTED              [+ Expand] │
│                                              │
│ You're part of a geographic wave            │
│ 8 experiences in Vienna area               │
└─────────────────────────────────────────────┘
```

**Expanded State:**
```
┌─────────────────────────────────────────────┐
│ 🌊 PATTERN DETECTED            [- Collapse] │
│                                              │
│ You're part of a geographic wave            │
│ 8 experiences in Vienna area               │
│                                              │
│ [Mini Chart Visualization]                  │
│ • 8 experiences in 50km radius             │
│ • +250% vs baseline                         │
│ • Peak: December 2024                       │
│                                              │
│ 💡 This suggests localized phenomenon       │
│ [View Map ➝] [View Timeline ➝]            │
└─────────────────────────────────────────────┘
```

**Animation:**
- Duration: 300ms
- Easing: `ease-in-out`
- Height: Auto-animate with Framer Motion's `AnimatePresence`
- Content: Fade in details (delay 150ms after expansion starts)

```typescript
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
      >
        {/* Detailed content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Read More Expansion

**Collapsed (Default):**
```
Story text showing first 300 characters lorem ipsum dolor sit amet
consectetur adipiscing elit sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud
exercitation ullamco laboris...

[Read More ↓]
```

**Expanded:**
```
[Full story text with all paragraphs visible]

[Read Less ↑]
```

**Animation:**
- Duration: 250ms
- Easing: `ease-out`
- Scroll to top of expanded content after expansion completes

```typescript
const [isExpanded, setIsExpanded] = useState(false);
const contentRef = useRef<HTMLDivElement>(null);

const handleToggle = () => {
  setIsExpanded(prev => !prev);
  if (!isExpanded) {
    // Scroll to top of content after expansion
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
};
```

### Match Explanation Expansion

**Per similar experience card:**

**Collapsed:**
```
┌─────────────────────────────────────────────┐
│ Experience Title                 [Match 87%]│
│ by @username • 2 days ago                   │
│                                              │
│ Preview text showing first few lines...     │
│                                              │
│ [Why this matches ↓]                        │
└─────────────────────────────────────────────┘
```

**Expanded:**
```
┌─────────────────────────────────────────────┐
│ Experience Title                 [Match 87%]│
│ by @username • 2 days ago                   │
│                                              │
│ Preview text showing first few lines...     │
│                                              │
│ [Why this matches ↑]                        │
│                                              │
│ ✓ Same category (Dreams)            95%    │
│ ✓ Shared keywords: "blue light"     82%    │
│ ✓ Similar location (Vienna)         78%    │
│ ✓ Temporal proximity (same week)    65%    │
└─────────────────────────────────────────────┘
```

**Animation:**
- Duration: 200ms (faster than large sections)
- Easing: `ease-out`
- Stagger child items (50ms delay between each match reason)

---

## 🎯 Smart Defaults & Auto-Behavior

### Auto-Dismiss Behaviors

#### JustPublishedBanner
- Auto-dismiss after: **10 seconds**
- User can dismiss manually anytime
- Pause auto-dismiss on hover
- Store dismissed state in sessionStorage (don't show again this session)

```typescript
const [isDismissed, setIsDismissed] = useState(false);
const [isPaused, setIsPaused] = useState(false);

useEffect(() => {
  if (isDismissed || isPaused) return;

  const timer = setTimeout(() => {
    setIsDismissed(true);
    sessionStorage.setItem(`banner-dismissed-${experienceId}`, 'true');
  }, 10000);

  return () => clearTimeout(timer);
}, [isDismissed, isPaused, experienceId]);
```

#### Tooltips
- Auto-show after: **500ms hover**
- Auto-hide when: Mouse leaves target
- Exception: Keep visible if hovering tooltip itself (for copyable content)

### Auto-Scroll Behaviors

#### After Publish
```typescript
// After redirecting to experience page
if (searchParams.justPublished) {
  // Wait for DiscoveryLoadingModal to dismiss
  setTimeout(() => {
    // Scroll to ValidationScoreCard (trust signal)
    document.getElementById('validation-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 500);
}
```

#### After Comment Post
```typescript
// Scroll to newly posted comment
const handleCommentSubmit = async (comment: string) => {
  const newComment = await postComment(comment);

  // Wait for render
  setTimeout(() => {
    document.getElementById(`comment-${newComment.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 100);
};
```

### Default Tab Selection

**Rules:**
1. If `?tab=X` query param exists → Use that tab
2. Else if `justPublished=true` → Default to **Impact** tab (show contribution)
3. Else if `similarCount > 5` → Default to **Similar** tab
4. Else → Default to **Patterns** tab

```typescript
const getDefaultTab = (searchParams, validation) => {
  if (searchParams.tab) return searchParams.tab;
  if (searchParams.justPublished) return 'impact';
  if (validation.similar_count > 5) return 'similar';
  return 'patterns';
};
```

### Smart Filter Defaults

#### Similar Tab Filters
```typescript
const defaultFilters = {
  category: 'all', // Don't filter by default
  minMatchScore: 50, // Only show decent matches
  sortBy: 'match_score', // Best matches first
  timeframe: 'all' // Don't restrict time
};
```

#### Patterns Tab View
```typescript
const defaultView = validation.similar_count > 10
  ? 'geographic' // Show map if many matches
  : 'overview'; // Show summary if few matches
```

---

## 📱 Responsive Behavior Patterns

### Breakpoints
```typescript
const breakpoints = {
  mobile: 'max-w-[768px]',
  tablet: 'min-w-[769px] max-w-[1199px]',
  desktop: 'min-w-[1200px]'
};
```

### Mobile-Specific Behaviors

#### Bottom Sheet for Expandable Sections
On mobile, large expandable sections (PatternContextCard expanded state) should open as bottom sheet modal:

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
    <SheetContent side="bottom" className="h-[80vh]">
      {/* Pattern details */}
    </SheetContent>
  </Sheet>
) : (
  <Collapsible open={isExpanded}>
    {/* Inline expansion */}
  </Collapsible>
)}
```

#### Tab Horizontal Scroll
On mobile, tabs should scroll horizontally if they don't fit:

```typescript
<TabsList className="md:flex-wrap overflow-x-auto">
  {/* Tabs */}
</TabsList>
```

#### Sticky Header on Scroll
Experience header should stick to top on mobile:

```typescript
<header className="sticky top-0 z-10 bg-background/95 backdrop-blur md:static">
  {/* Header content */}
</header>
```

### Touch Gestures

#### Swipe to Navigate Similar Experiences
```typescript
const handlers = useSwipeable({
  onSwipedLeft: () => goToNextExperience(),
  onSwipedRight: () => goToPreviousExperience(),
  preventDefaultTouchmoveEvent: true,
  trackMouse: false // Only touch, not mouse
});

<div {...handlers}>
  {/* Experience content */}
</div>
```

#### Pull to Refresh (Optional)
```typescript
const handlePullToRefresh = () => {
  queryClient.invalidateQueries(['experience', experienceId]);
};

<PullToRefresh onRefresh={handlePullToRefresh}>
  {/* Content */}
</PullToRefresh>
```

### Desktop-Specific Enhancements

#### Sidebar Auto-Hide
On desktop, sidebar can auto-hide when scrolling down, auto-show when scrolling up:

```typescript
const [showSidebar, setShowSidebar] = useState(true);
const lastScrollY = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setShowSidebar(currentScrollY < lastScrollY.current || currentScrollY < 100);
    lastScrollY.current = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

#### Keyboard Shortcuts
Desktop should support keyboard navigation:

```typescript
useHotkeys('cmd+k,ctrl+k', () => openCommandPalette());
useHotkeys('1', () => setActiveTab('similar'));
useHotkeys('2', () => setActiveTab('patterns'));
useHotkeys('3', () => setActiveTab('impact'));
useHotkeys('4', () => setActiveTab('discuss'));
useHotkeys('/', () => focusSearchInput());
```

---

## ⚡ Animation Timing & Easing

### Animation Speed Scale

```typescript
const animationDuration = {
  instant: 0,        // Immediate feedback (hover states)
  fast: 150,         // Button clicks, small UI changes
  base: 250,         // Default animations (most cases)
  slow: 400,         // Large content transitions
  slower: 600        // Page transitions, complex animations
};
```

### Easing Functions

```typescript
const easing = {
  // Entering animations
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',       // Deceleration
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Overshoot

  // Exiting animations
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',        // Acceleration

  // Both entering and exiting
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',     // Smooth both ways

  // Special
  spring: { type: "spring", stiffness: 300, damping: 30 } // Framer Motion spring
};
```

### Component Animation Specs

| Component | Action | Duration | Easing | Notes |
|-----------|--------|----------|--------|-------|
| Button | Hover | 150ms | easeOut | Scale: 1 → 1.02 |
| Button | Click | 100ms | easeIn | Scale: 1 → 0.95 |
| Card | Hover | 200ms | easeOut | Translate Y: 0 → -2px |
| Modal | Open | 250ms | easeOut | Fade + scale 0.95 → 1 |
| Modal | Close | 200ms | easeIn | Fade + scale 1 → 0.95 |
| Collapse | Expand | 300ms | easeInOut | Height: 0 → auto |
| Collapse | Collapse | 250ms | easeInOut | Height: auto → 0 |
| Tab switch | Change | 200ms | easeOut | Fade + slide |
| Toast | Enter | 200ms | easeOutBack | Slide from bottom |
| Toast | Exit | 150ms | easeIn | Fade out |

### Stagger Animations

For lists of items (similar experiences, match reasons, etc.):

```typescript
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.05 // 50ms delay between children
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Loading Spinner Animation

```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
>
  <Loader2 />
</motion.div>
```

---

## ⌨️ Keyboard Navigation

### Focus Management

#### Tab Order Priority
1. Skip to content link (accessibility)
2. Main navigation
3. Experience header actions
4. Tab navigation
5. Active tab content (all interactive elements)
6. Comments section

#### Focus Visible Styles
```typescript
const focusStyles = cn(
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background"
);
```

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Next focusable element | Global |
| `Shift + Tab` | Previous focusable element | Global |
| `Enter` | Activate button/link | Interactive elements |
| `Space` | Toggle checkbox/switch | Form elements |
| `Escape` | Close modal/dismiss banner | Modals, overlays |
| `Arrow Up/Down` | Navigate comments | Comment list |
| `Arrow Left/Right` | Navigate tabs | Tab list (focus mode) |
| `1-4` | Switch tabs (Similar/Patterns/Impact/Discuss) | Desktop only |
| `C` | Focus comment input | Desktop only |
| `/` | Focus search (if present) | Desktop only |
| `?` | Show keyboard shortcuts help | Desktop only |

### Modal Focus Trap

When modal opens:
1. Save currently focused element
2. Move focus to modal's first focusable element
3. Trap focus within modal (Tab loops within modal)
4. Restore focus to saved element when modal closes

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="focus-trap">
    {/* Focus automatically moves here */}
    <DialogTitle>Modal Title</DialogTitle>
    {/* Content */}
    <Button onClick={() => setIsOpen(false)}>Close</Button>
    {/* Tab loops back to title */}
  </DialogContent>
</Dialog>
```

---

## ♿ Accessibility Patterns

### ARIA Labels

#### Icon-Only Buttons
```typescript
<button aria-label="Share experience">
  <Share className="w-4 h-4" />
</button>
```

#### Loading States
```typescript
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Loading experiences..." : `${count} experiences found`}
</div>
```

#### Tab Panels
```typescript
<Tabs>
  <TabsList role="tablist">
    <TabsTrigger role="tab" aria-controls="similar-panel">
      Similar
    </TabsTrigger>
  </TabsList>
  <TabsContent role="tabpanel" id="similar-panel">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### Screen Reader Announcements

#### Success Messages
```typescript
const announceSuccess = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only'; // Visually hidden
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
};

// Usage
announceSuccess("Experience published successfully!");
```

#### Loading Announcements
```typescript
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isLoading && "Loading similar experiences..."}
  {!isLoading && `${data.length} similar experiences found`}
</div>
```

### Reduced Motion

Respect `prefers-reduced-motion`:

```typescript
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: shouldReduceMotion ? 0 : 0.3
  }}
>
  {/* Content */}
</motion.div>
```

Or in CSS:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ❌ Error Handling Patterns

### Error UI States

#### Inline Error (Form Validation)
```typescript
<div className="space-y-2">
  <Input
    aria-invalid={!!error}
    aria-describedby={error ? "error-message" : undefined}
  />
  {error && (
    <p id="error-message" className="text-sm text-destructive" role="alert">
      {error.message}
    </p>
  )}
</div>
```

#### Card Error (API Failure)
```typescript
<Card>
  {isError ? (
    <div className="p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h3 className="mt-2 text-lg font-semibold">Failed to load</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message}
      </p>
      <Button onClick={refetch} variant="outline" className="mt-4">
        Try Again
      </Button>
    </div>
  ) : (
    /* Normal content */
  )}
</Card>
```

#### Toast Error (Global Actions)
```typescript
import { toast } from 'sonner';

const handleAction = async () => {
  try {
    await performAction();
    toast.success("Action completed successfully!");
  } catch (error) {
    toast.error("Action failed", {
      description: error.message,
      action: {
        label: "Retry",
        onClick: () => handleAction()
      }
    });
  }
};
```

### Error Recovery Strategies

#### Automatic Retry
```typescript
const { data, isError, error } = useQuery(
  ['experience', id],
  () => fetchExperience(id),
  {
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000)
  }
);
```

#### Fallback Data
```typescript
const { data } = useQuery(['validation', id], fetchValidation, {
  placeholderData: {
    similar_count: 0,
    match_quality: 0
  }
});
```

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-2 text-xl font-semibold">Something went wrong</h2>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 💾 State Management Patterns

### URL State Sync

```typescript
// Sync tab selection with URL
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get('tab') || 'similar';

const handleTabChange = (tab: string) => {
  setSearchParams({ tab });
};

// Sync filters with URL
const filters = {
  category: searchParams.get('category') || 'all',
  minMatchScore: Number(searchParams.get('minScore')) || 50,
  sortBy: searchParams.get('sort') || 'match_score'
};

const handleFilterChange = (newFilters: typeof filters) => {
  setSearchParams(newFilters);
};
```

### Optimistic Updates

```typescript
const queryClient = useQueryClient();

const likeMutation = useMutation(
  (commentId: string) => likeComment(commentId),
  {
    // Optimistic update
    onMutate: async (commentId) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries(['comments', experienceId]);

      // Snapshot current state
      const previousComments = queryClient.getQueryData(['comments', experienceId]);

      // Optimistically update
      queryClient.setQueryData(['comments', experienceId], (old: Comment[]) =>
        old.map(comment =>
          comment.id === commentId
            ? { ...comment, like_count: comment.like_count + 1, is_liked: true }
            : comment
        )
      );

      return { previousComments };
    },

    // Rollback on error
    onError: (err, commentId, context) => {
      queryClient.setQueryData(['comments', experienceId], context.previousComments);
      toast.error("Failed to like comment");
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', experienceId]);
    }
  }
);
```

### Session Storage

```typescript
// Store dismissal state
const storeBannerDismissal = (experienceId: string) => {
  sessionStorage.setItem(`banner-dismissed-${experienceId}`, 'true');
};

const isBannerDismissed = (experienceId: string) => {
  return sessionStorage.getItem(`banner-dismissed-${experienceId}`) === 'true';
};

// Store publishResult for page refresh
const storePublishResult = (result: PublishResult) => {
  sessionStorage.setItem('lastPublishResult', JSON.stringify(result));
};

const getStoredPublishResult = () => {
  const stored = sessionStorage.getItem('lastPublishResult');
  return stored ? JSON.parse(stored) : null;
};
```

---

## 🎯 Performance Patterns

### Code Splitting

```typescript
// Lazy load heavy components
const GeographicHeatmap = lazy(() => import('./GeographicHeatmap'));
const TimelineChart = lazy(() => import('./TimelineChart'));

<Suspense fallback={<Skeleton />}>
  <GeographicHeatmap data={data} />
</Suspense>
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={media.url}
  alt={media.caption || "Experience media"}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={media.blurhash}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Debouncing

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    performSearch(value);
  },
  500 // 500ms delay
);

<Input onChange={(e) => debouncedSearch(e.target.value)} />
```

### Virtualization (Long Lists)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: experiences.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 150,
  overscan: 5
});

<div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
    {virtualizer.getVirtualItems().map(virtualRow => (
      <div
        key={virtualRow.index}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`
        }}
      >
        <ExperienceCard experience={experiences[virtualRow.index]} />
      </div>
    ))}
  </div>
</div>
```

---

## ✅ Interaction Patterns Checklist

### Global Patterns
- [ ] All hover states defined and consistent
- [ ] All loading states have skeletons or spinners
- [ ] All error states have recovery options
- [ ] All animations respect reduced motion preference
- [ ] Keyboard navigation works throughout
- [ ] Focus states are visible and consistent
- [ ] ARIA labels on all icon-only buttons
- [ ] Screen reader announcements for dynamic changes

### Component-Specific
- [ ] Expandable sections animate smoothly
- [ ] Tabs lazy load content
- [ ] Modals trap focus
- [ ] Forms show inline validation errors
- [ ] Cards have consistent hover/active states
- [ ] Buttons provide instant feedback
- [ ] Tooltips delay appropriately
- [ ] Lists use virtualization if > 50 items

### Mobile-Specific
- [ ] Touch targets minimum 44x44px
- [ ] Swipe gestures work intuitively
- [ ] Bottom sheets for large expandables
- [ ] Horizontal scroll for tabs if needed
- [ ] Sticky headers on scroll
- [ ] Full-screen modals for complex content

### Performance
- [ ] Images lazy load + blur placeholders
- [ ] Heavy components code split
- [ ] Search inputs debounced
- [ ] Infinite scroll or pagination for long lists
- [ ] API calls use React Query caching
- [ ] Optimistic updates for likes/follows

---

**See also:**
- [04-components-spec.md](./04-components-spec.md) - Component technical specs
- [06-implementation-roadmap.md](./06-implementation-roadmap.md) - Implementation order
