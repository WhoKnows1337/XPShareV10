# Component Specifications

## 📐 Component Architecture Overview

This document provides complete technical specifications for all components in the XPShare Post V2 design. Each component includes TypeScript interfaces, props, data requirements, and implementation checklists.

---

## 🏗️ Component Hierarchy

```
ExperienceDetailPage
├─ DiscoveryLoadingModal (conditional, during publish)
├─ JustPublishedBanner (conditional, dismissable)
├─ ValidationScoreCard (always visible)
├─ ExperienceHeader (always visible)
├─ PatternContextCard (conditional, expandable)
├─ StoryContent (always visible)
│  ├─ TextHighlighter
│  ├─ AttributesCard
│  └─ MediaGallery
├─ BentoTabs (always visible)
│  ├─ SimilarTab
│  │  ├─ MatchExplanation
│  │  └─ ExperienceCard
│  ├─ PatternsTab
│  │  ├─ GeographicHeatmap
│  │  ├─ TimelineChart
│  │  └─ CorrelationMatrix
│  ├─ ImpactTab (NEW)
│  │  ├─ ContributionScore
│  │  ├─ XPTwinsList
│  │  └─ SmartNextSteps
│  └─ DiscussTab
│     └─ CommentsSection
└─ RelatedSidebar (desktop only)
   ├─ TimelinePreview
   ├─ QuickStats
   └─ RelatedExperiences
```

---

## 🎯 Core Components

### 1. DiscoveryLoadingModal

**Purpose:** Show pattern discovery progress during publish API call

**File Location:** `components/experience-detail/DiscoveryLoadingModal.tsx`

#### TypeScript Interface

```typescript
interface DiscoveryLoadingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  steps: LoadingStep[];
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  duration?: number; // milliseconds
  icon?: React.ReactNode;
}

// Example usage
const defaultSteps: LoadingStep[] = [
  { id: 'analyzing', label: 'Analyzing your experience...', status: 'loading', icon: <Sparkles /> },
  { id: 'matching', label: 'Finding similar experiences...', status: 'pending', icon: <Search /> },
  { id: 'patterns', label: 'Detecting patterns...', status: 'pending', icon: <TrendingUp /> },
  { id: 'complete', label: 'Done!', status: 'pending', icon: <Check /> }
];
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | - | Controls modal visibility |
| `onClose` | function | No | undefined | Callback when modal closes (auto-closes on complete) |
| `steps` | LoadingStep[] | Yes | - | Array of loading steps to display |

#### Data Requirements

- No API data needed (client-side animation)
- Uses Framer Motion for step animations
- Auto-progresses through steps with delays

#### Implementation Checklist

- [ ] Create modal with backdrop (Radix Dialog)
- [ ] Implement step progression animation
- [ ] Add icons for each step
- [ ] Add progress bar (overall completion %)
- [ ] Auto-close on final step complete
- [ ] Add subtle sound effects (optional)
- [ ] Ensure accessibility (focus trap, ESC key)
- [ ] Mobile responsive (full-screen on mobile)
- [ ] Test with slow network (should not block if API fails)

---

### 2. JustPublishedBanner (FIXED VERSION)

**Purpose:** Show XP rewards, badges, and level-up notification after publishing

**File Location:** `components/experience-detail/JustPublishedBanner.tsx`

**CRITICAL FIX:** Currently has hardcoded values, must use real `publishResult` data

#### TypeScript Interface

```typescript
interface JustPublishedBannerProps {
  publishResult: PublishResult;
  onDismiss: () => void;
  isDismissed: boolean;
}

interface PublishResult {
  experienceId: string;
  xpEarned: number;
  badgesEarned: Badge[];
  leveledUp: boolean;
  oldLevel?: number;
  newLevel?: number;
  contributionScore?: number;
}

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon_url: string;
}
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `publishResult` | PublishResult | Yes | - | Real data from publish API response |
| `onDismiss` | function | Yes | - | Callback to hide banner |
| `isDismissed` | boolean | Yes | false | Controls visibility |

#### Data Requirements

**Source:** `publishResult` from submit flow store OR query params
- `useSubmitFlowStore.getState().publishResult` (if same session)
- OR parse from URL query params: `?xp=50&badges=[]&levelUp=true`
- OR fetch from `/api/experiences/[id]/publish-result` (if page refresh)

#### Implementation Checklist

- [ ] Remove hardcoded values from `app/[locale]/experiences/[id]/page.tsx:754-758`
- [ ] Add query param parsing for publishResult data
- [ ] Add session storage fallback (in case of page refresh)
- [ ] Implement confetti animation on level-up
- [ ] Add badge showcase carousel (if multiple badges)
- [ ] Add XP counter animation (count-up effect)
- [ ] Implement auto-dismiss after 10 seconds
- [ ] Add "View Profile" CTA button
- [ ] Ensure banner is above all other content
- [ ] Mobile: Full-width, bottom sheet style

---

### 3. ValidationScoreCard (NEW)

**Purpose:** Primary trust signal - show similar count and match quality

**File Location:** `components/experience-detail/ValidationScoreCard.tsx`

#### TypeScript Interface

```typescript
interface ValidationScoreCardProps {
  experienceId: string;
  similarCount: number;
  matchQuality: number; // 0-100
  validationBadge?: ValidationBadge;
  isLoading?: boolean;
  simpleMode?: boolean; // NEW: Seeker-optimized minimal view
}

interface ValidationBadge {
  type: 'verified' | 'trending' | 'wave';
  label: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Simple Mode (simpleMode=true) for Seeker Persona (65%):
 * - Shows ONLY: "{similarCount} people had similar experiences"
 * - Hides: match quality score, percentage, badges
 * - Includes: "Learn more" button → expands to full view
 *
 * Goal: Instant validation in <3 seconds, no cognitive load
 */
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `experienceId` | string | Yes | - | Experience ID |
| `similarCount` | number | Yes | - | Count of similar experiences |
| `matchQuality` | number | Yes | - | Average match quality (0-100) |
| `validationBadge` | ValidationBadge | No | undefined | Special badge (trending/wave) |
| `isLoading` | boolean | No | false | Loading state |
| `simpleMode` | boolean | No | false | **NEW:** Seeker-optimized minimal view (hide scores/badges) |

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/validation`

```typescript
interface ValidationAPIResponse {
  similar_count: number;
  avg_match_quality: number;
  is_trending: boolean;
  is_in_wave: boolean;
  pattern_confidence: number;
}
```

**Data Source:**
- `similar_count` from `experience_matches` table
- `avg_match_quality` from `experience_matches` average
- `is_trending` calculated from recent view/engagement spikes
- `is_in_wave` from pattern detection algorithm

#### Implementation Checklist

- [ ] Create card component with gradient border
- [ ] Add similar count with prominent typography
- [ ] Add match quality progress bar/ring
- [ ] Implement validation badge logic
- [ ] Add tooltip explaining match quality
- [ ] Add click-to-Similar-tab behavior
- [ ] Skeleton loading state
- [ ] Mobile: Compact horizontal layout
- [ ] Animate count-up on mount
- [ ] Add subtle pulse animation on high match quality (>85%)

---

### 4. PatternContextCard (ENHANCED)

**Purpose:** Show if experience is part of geographic/temporal patterns

**File Location:** `components/experience-detail/PatternContextCard.tsx`

#### TypeScript Interface

```typescript
interface PatternContextCardProps {
  experienceId: string;
  patterns: PatternAlert[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface PatternAlert {
  id: string;
  type: 'geographic' | 'temporal' | 'attribute';
  title: string;
  description: string;
  severity: 'info' | 'significant' | 'major';
  metrics: PatternMetrics;
  visualization?: PatternVisualization;
}

interface PatternMetrics {
  count: number;
  timeframe: string;
  radius?: number; // km for geographic
  increase_percent?: number;
  confidence: number; // 0-100
}

interface PatternVisualization {
  type: 'mini-chart' | 'heatmap' | 'timeline';
  data: any[]; // Specific to visualization type
}
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `experienceId` | string | Yes | - | Experience ID |
| `patterns` | PatternAlert[] | Yes | - | Array of detected patterns |
| `isExpanded` | boolean | Yes | false | Expansion state |
| `onToggleExpand` | function | Yes | - | Toggle callback |

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/patterns`

```typescript
interface PatternsAPIResponse {
  geographic_patterns: GeographicPattern[];
  temporal_patterns: TemporalPattern[];
  attribute_correlations: AttributeCorrelation[];
}

interface GeographicPattern {
  center_lat: number;
  center_lng: number;
  radius_km: number;
  experience_count: number;
  baseline_count: number;
  increase_percent: number;
  timeframe_days: number;
}

interface TemporalPattern {
  start_date: string;
  end_date: string;
  experience_count: number;
  baseline_count: number;
  spike_date: string;
  confidence: number;
}
```

#### Implementation Checklist

- [ ] Create expandable card component
- [ ] Collapsed state: Pattern summary + expand icon
- [ ] Expanded state: Full metrics + mini visualization
- [ ] Add pattern severity indicator (color-coded)
- [ ] Implement mini-chart for temporal patterns
- [ ] Implement mini-map for geographic patterns
- [ ] Add "Why this matters" explanation text
- [ ] Add CTAs: "View Map" / "View Timeline" (links to Patterns tab)
- [ ] Animate expansion (Framer Motion collapse)
- [ ] Mobile: Bottom sheet style when expanded

---

### 5. ExperienceHeader

**Purpose:** Metadata header with category, title, author, stats

**File Location:** `components/experience-detail/ExperienceHeader.tsx`

#### TypeScript Interface

```typescript
interface ExperienceHeaderProps {
  experience: ExperienceMetadata;
  author: UserProfile;
  actions?: HeaderAction[];
}

interface ExperienceMetadata {
  id: string;
  title: string;
  category_id: string;
  category_name: string;
  category_color: string;
  created_at: string;
  view_count: number;
  comment_count: number;
  like_count?: number;
  is_trending: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  level: number;
  location?: string;
}

interface HeaderAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}
```

#### Data Requirements

- Part of main experience query
- No separate API call needed

#### Implementation Checklist

- [ ] Category badge with color
- [ ] Title (H1, max 2 lines with ellipsis)
- [ ] Author profile link with avatar
- [ ] Level indicator badge
- [ ] Location display
- [ ] Timestamp (relative)
- [ ] View/comment counts
- [ ] Action menu (share, report, edit)
- [ ] Trending indicator (if applicable)
- [ ] Mobile: Stack vertically, smaller typography
- [ ] Accessibility: Semantic HTML (header, h1, nav)

---

### 6. StoryContent

**Purpose:** Main experience narrative with highlights and media

**File Location:** `components/experience-detail/StoryContent.tsx`

#### TypeScript Interface

```typescript
interface StoryContentProps {
  experience: ExperienceContent;
  highlights?: TextHighlight[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface ExperienceContent {
  id: string;
  description: string;
  key_attributes: ExperienceAttribute[];
  media: MediaItem[];
  witnesses?: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  occurred_at?: string;
}

interface TextHighlight {
  start: number;
  end: number;
  type: 'keyword' | 'attribute' | 'location' | 'temporal';
  tooltip: string;
}

interface ExperienceAttribute {
  id: string;
  label: string;
  value: string;
  confidence?: number;
  is_key: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'audio' | 'sketch';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  blurhash?: string;
}
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `experience` | ExperienceContent | Yes | - | Experience data |
| `highlights` | TextHighlight[] | No | [] | Text highlights for matching terms |
| `isExpanded` | boolean | Yes | false | Read more expansion state |
| `onToggleExpand` | function | Yes | - | Toggle callback |

#### Data Requirements

- Part of main experience query
- Highlights generated from matching algorithm

#### Implementation Checklist

- [ ] Render description with "Read More" at 300 chars
- [ ] Implement TextHighlighter sub-component
- [ ] Highlight tooltips on hover
- [ ] Key attributes card (top 3-4 visible)
- [ ] Expandable attributes list
- [ ] Media gallery with lightbox
- [ ] Image lazy loading + blur placeholders
- [ ] Audio player component
- [ ] Sketch viewer with zoom
- [ ] Witnesses list (if present)
- [ ] Location display with mini-map link
- [ ] Occurred date display
- [ ] Mobile: Single column layout

---

### 7. BentoTabs System

**Purpose:** Tabbed interface for Similar, Patterns, Impact, Discuss

**File Location:** `components/experience-detail/BentoTabs.tsx`

#### TypeScript Interface

```typescript
interface BentoTabsProps {
  experienceId: string;
  defaultTab?: TabKey;
  counts: TabCounts;
}

type TabKey = 'similar' | 'patterns' | 'impact' | 'discuss';

interface TabCounts {
  similar: number;
  patterns: number;
  comments: number;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  count?: number;
  badge?: 'new' | 'hot';
}
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `experienceId` | string | Yes | - | Experience ID |
| `defaultTab` | TabKey | No | 'similar' | Default active tab |
| `counts` | TabCounts | Yes | - | Badge counts per tab |

#### Implementation Checklist

- [ ] Tab navigation with counts
- [ ] Active tab indicator (underline animation)
- [ ] Lazy load tab content (only render active)
- [ ] URL sync (query param `?tab=similar`)
- [ ] Keyboard navigation (arrow keys)
- [ ] Mobile: Horizontal scroll tabs
- [ ] Smooth tab switching animation
- [ ] Prefetch tab data on hover (desktop)

---

### 8. SimilarTab with MatchExplanations

**Purpose:** Show similar experiences with WHY they match

**File Location:** `components/experience-detail/SimilarTab.tsx`

#### TypeScript Interface

```typescript
interface SimilarTabProps {
  experienceId: string;
  filters: SimilarFilters;
  onFilterChange: (filters: SimilarFilters) => void;
}

interface SimilarFilters {
  category?: string;
  minMatchScore?: number;
  sortBy: 'match_score' | 'date' | 'engagement';
  timeframe?: 'all' | 'week' | 'month' | 'year';
}

interface SimilarExperience {
  id: string;
  title: string;
  category: string;
  match_score: number; // 0-100
  match_reasons: MatchReason[];
  author: UserProfile;
  created_at: string;
  preview: string;
}

interface MatchReason {
  type: 'category' | 'keywords' | 'attributes' | 'location' | 'temporal' | 'semantic';
  label: string;
  confidence: number; // 0-100
  details: string;
  highlighted_text?: string;
}
```

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/similar`

```typescript
interface SimilarAPIResponse {
  total_count: number;
  avg_match_score: number;
  experiences: SimilarExperience[];
  filters_available: {
    categories: string[];
    match_score_range: [number, number];
  };
}
```

#### Implementation Checklist

- [ ] Filter bar (category, match score, sort, timeframe)
- [ ] Similar experience cards with match score
- [ ] MatchExplanation component (collapsible per card)
- [ ] Match score visual (progress ring/bar)
- [ ] Highlight matched keywords in preview
- [ ] Pagination (infinite scroll or load more)
- [ ] Empty state (no matches found)
- [ ] Loading skeletons
- [ ] Click to open experience in new tab
- [ ] Mobile: Simplified cards, single column

#### MatchExplanation Sub-Component

```typescript
interface MatchExplanationProps {
  reasons: MatchReason[];
  overallScore: number;
  isExpanded: boolean;
  onToggle: () => void;
}
```

**Checklist:**
- [ ] Collapsed: "Why this matches" link
- [ ] Expanded: List of match reasons with icons
- [ ] Confidence indicators per reason
- [ ] Tooltip with details on hover
- [ ] Highlighted text preview (if available)
- [ ] Smooth expansion animation

---

### 9. PatternsTab

**Purpose:** Deep analytics - geographic, temporal, attribute correlations

**File Location:** `components/experience-detail/PatternsTab.tsx`

#### TypeScript Interface

```typescript
interface PatternsTabProps {
  experienceId: string;
  view: PatternView;
  onViewChange: (view: PatternView) => void;
}

type PatternView = 'overview' | 'geographic' | 'temporal' | 'attributes';

interface PatternData {
  geographic: GeographicAnalysis;
  temporal: TemporalAnalysis;
  attributes: AttributeAnalysis;
  statistical_summary: StatisticalSummary;
}

interface GeographicAnalysis {
  clusters: GeoCluster[];
  heatmap_data: HeatmapPoint[];
  center_point: { lat: number; lng: number };
  radius_km: number;
}

interface GeoCluster {
  center: { lat: number; lng: number };
  radius_km: number;
  experience_count: number;
  increase_vs_baseline: number;
  significance: number; // p-value
}

interface TemporalAnalysis {
  timeline: TimelinePoint[];
  spikes: TemporalSpike[];
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality_detected: boolean;
}

interface TimelinePoint {
  date: string;
  count: number;
  cumulative_count: number;
}

interface TemporalSpike {
  date: string;
  count: number;
  expected_count: number;
  significance: number;
}

interface AttributeAnalysis {
  correlations: AttributeCorrelation[];
  common_combinations: AttributeCombination[];
}

interface AttributeCorrelation {
  attribute1: string;
  attribute2: string;
  correlation_coefficient: number;
  co_occurrence_count: number;
  significance: number;
}

interface StatisticalSummary {
  total_similar: number;
  avg_match_score: number;
  date_range: { start: string; end: string };
  geographic_spread_km: number;
  confidence_level: number;
}
```

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/patterns/analytics`

```typescript
interface PatternsAnalyticsAPIResponse {
  geographic: GeographicAnalysis;
  temporal: TemporalAnalysis;
  attributes: AttributeAnalysis;
  statistical_summary: StatisticalSummary;
}
```

#### Implementation Checklist

- [ ] View selector (overview / geographic / temporal / attributes)
- [ ] Overview view: Summary cards with key insights
- [ ] Geographic view: Interactive map with clusters
- [ ] Heatmap layer on map
- [ ] Cluster detail cards
- [ ] Temporal view: Timeline chart with zoom
- [ ] Spike annotations on timeline
- [ ] Seasonality indicator
- [ ] Attributes view: Correlation matrix
- [ ] Common combinations list
- [ ] Statistical significance indicators
- [ ] Export to CSV button
- [ ] Methodology explanation (collapsible)
- [ ] Mobile: Simplified charts, single view at a time
- [ ] Loading states per view
- [ ] Error boundaries

---

### 10. ImpactTab (NEW)

**Purpose:** Show user contribution and smart next steps

**NOTE:** XP Twins feature has been REMOVED from scope for privacy/complexity reasons

**File Location:** `components/experience-detail/ImpactTab.tsx`

#### TypeScript Interface

```typescript
interface ImpactTabProps {
  experienceId: string;
  userId: string;
}

interface ImpactData {
  contribution_score: ContributionScore;
  xp_twins: XPTwin[];
  smart_next_steps: NextStep[];
}

interface ContributionScore {
  overall_score: number; // 0-100
  breakdown: {
    novelty: number; // How unique/new is this?
    pattern_contribution: number; // Helped identify patterns?
    community_value: number; // Engagement received
  };
  level: 'minor' | 'moderate' | 'significant' | 'major';
  explanation: string;
}

interface XPTwin {
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  match_score: number; // 0-100
  shared_experiences_count: number;
  shared_categories: string[];
  connection_strength: 'low' | 'medium' | 'high';
  last_active?: string;
}

interface NextStep {
  id: string;
  type: 'explore' | 'connect' | 'contribute' | 'research';
  title: string;
  description: string;
  cta_label: string;
  cta_action: string; // URL or action identifier
  priority: number;
  icon: string;
}
```

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/impact`

```typescript
interface ImpactAPIResponse {
  contribution_score: ContributionScore;
  xp_twins: XPTwin[];
  smart_next_steps: NextStep[];
}
```

**Calculation Logic:**
- `novelty`: Based on how different from existing experiences
- `pattern_contribution`: Did this experience strengthen a pattern?
- `community_value`: Views, comments, likes received

#### Implementation Checklist

- [ ] Contribution Score Card with breakdown
- [ ] Visual score indicator (circular progress)
- [ ] Score level badge (minor/moderate/significant/major)
- [ ] Explanation text with details
- [ ] Smart Next Steps section
- [ ] Priority-sorted next step cards
- [ ] Clear CTAs per step
- [ ] CTA buttons with actions
- [ ] Icons for each next step type
- [ ] Empty state (no steps generated → encourage action)
- [ ] Mobile: Vertical stack layout

---

### 11. DiscussTab

**Purpose:** Comments section with threading

**File Location:** `components/experience-detail/DiscussTab.tsx`

#### TypeScript Interface

```typescript
interface DiscussTabProps {
  experienceId: string;
  currentUserId?: string;
  sortBy: CommentSort;
  onSortChange: (sort: CommentSort) => void;
}

type CommentSort = 'newest' | 'oldest' | 'top';

interface Comment {
  id: string;
  experience_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  like_count: number;
  reply_count: number;
  is_author: boolean; // Is this the experience author?
  author: UserProfile;
  replies?: Comment[];
}
```

#### Data Requirements

**API Endpoint:** `/api/experiences/[id]/comments`

```typescript
interface CommentsAPIResponse {
  total_count: number;
  comments: Comment[];
  has_more: boolean;
  cursor?: string;
}
```

#### Implementation Checklist

- [ ] Comment sort selector (newest/oldest/top)
- [ ] Comment list with threading (max 2 levels)
- [ ] Comment card component
- [ ] Like button per comment
- [ ] Reply button per comment
- [ ] Edit/delete for own comments
- [ ] Report button for others' comments
- [ ] Comment composer (rich text?)
- [ ] Markdown support in comments
- [ ] @mentions support (optional)
- [ ] Pagination (load more)
- [ ] Optimistic updates on post comment
- [ ] Author badge (if comment by experience author)
- [ ] Mobile: Simplified threading (collapse replies)

---

## 🔧 Supporting Components

### TextHighlighter

**Purpose:** Highlight matching keywords/phrases in experience text

```typescript
interface TextHighlighterProps {
  text: string;
  highlights: TextHighlight[];
  onHighlightClick?: (highlight: TextHighlight) => void;
}
```

### MediaGallery

**Purpose:** Display images/audio/sketches with lightbox

```typescript
interface MediaGalleryProps {
  media: MediaItem[];
  layout: 'grid' | 'carousel';
  maxItems?: number;
}
```

### GeographicHeatmap

**Purpose:** Interactive map with experience clusters

```typescript
interface GeographicHeatmapProps {
  center: { lat: number; lng: number };
  clusters: GeoCluster[];
  currentExperience: { lat: number; lng: number };
  onClusterClick?: (cluster: GeoCluster) => void;
}
```

### TimelineChart

**Purpose:** Temporal visualization of experiences

```typescript
interface TimelineChartProps {
  data: TimelinePoint[];
  spikes?: TemporalSpike[];
  dateRange: { start: string; end: string };
  currentExperience: { date: string };
}
```

### CorrelationMatrix

**Purpose:** Heatmap of attribute correlations

```typescript
interface CorrelationMatrixProps {
  correlations: AttributeCorrelation[];
  maxAttributes?: number;
}
```

---

## 🔄 Data Flow Architecture

### Page Load Sequence

```
1. Initial Page Load
   ├─ Fetch experience metadata (SSR or RSC)
   ├─ Fetch validation data (parallel)
   ├─ Fetch patterns summary (parallel)
   └─ Check for justPublished query param
      └─ If true: Get publishResult from store/query params

2. Tab Interactions
   ├─ Similar Tab: Fetch on mount + filter changes
   ├─ Patterns Tab: Fetch on mount + view changes
   ├─ Impact Tab: Fetch on mount
   └─ Discuss Tab: Fetch on mount + sort changes

3. Expandable Sections
   ├─ PatternContextCard: Fetch detailed metrics on expand
   └─ MatchExplanation: Already loaded, just expand UI
```

### API Endpoints Required

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/experiences/[id]` | GET | Main experience data | Critical |
| `/api/experiences/[id]/validation` | GET | Similar count, match quality | Critical |
| `/api/experiences/[id]/patterns` | GET | Pattern alerts | High |
| `/api/experiences/[id]/similar` | GET | Similar experiences + matches | High |
| `/api/experiences/[id]/patterns/analytics` | GET | Deep pattern analytics | Medium |
| `/api/experiences/[id]/impact` | GET | Contribution score, Smart Next Steps | Medium |
| `/api/experiences/[id]/comments` | GET | Comments list | High |
| `/api/experiences/[id]/publish-result` | GET | Publish result (if not in store) | High |

---

## ✅ Global Implementation Checklist

### Critical Path (Week 1)

- [ ] Fix JustPublishedBanner hardcoded values
- [ ] Create DiscoveryLoadingModal
- [ ] Create ValidationScoreCard
- [ ] Enhance PatternContextCard
- [ ] Add query param handling for publishResult

### Core Features (Week 2)

- [ ] Create ImpactTab component
- [ ] Add MatchExplanation to SimilarTab
- [ ] Implement TextHighlighter
- [ ] Add inline highlights in StoryContent

### Advanced Features (Week 3-4)

- [ ] Implement GeographicHeatmap
- [ ] Implement TimelineChart
- [ ] Implement CorrelationMatrix
- [ ] Add Smart Next Steps generator
- [ ] **XP Twins feature REMOVED (privacy/complexity)**

### Polish (Week 4+)

- [ ] Add animations (Framer Motion)
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Add loading skeletons everywhere
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Error boundaries for each section
- [ ] Implement all empty states
- [ ] Add analytics tracking
- [ ] User testing and iteration

---

## 🎯 Component Testing Checklist

### Per Component

- [ ] Unit tests (Jest + React Testing Library)
- [ ] Storybook stories (all states)
- [ ] Accessibility tests (jest-axe)
- [ ] Visual regression tests (Chromatic)
- [ ] Mobile viewport testing
- [ ] Loading state testing
- [ ] Error state testing
- [ ] Empty state testing

---

**See also:**
- [03-visual-design.md](./03-visual-design.md) - Visual mockups for these components
- [05-interaction-patterns.md](./05-interaction-patterns.md) - Detailed interaction specs
- [06-implementation-roadmap.md](./06-implementation-roadmap.md) - Step-by-step implementation guide
