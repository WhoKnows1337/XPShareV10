# Information Architecture

## 📐 Content Hierarchy Strategy

Based on user research (65% are "Seekers"), we design for **progressive disclosure** - showing what users need WHEN they need it.

---

## ⏱️ Time-Based Information Layers

### IMMEDIATE (0-3 seconds) - The Glance Layer

**User Question:** "What is this? Should I care?"

```
PRIORITY 1: Post Identity
├─ Category Badge (visual anchor)
├─ Title (scannable, compelling)
├─ Validation Badge (similar count)
└─ Trending/Wave indicators

PRIORITY 2: Author Trust
├─ Username
├─ Level indicator
└─ Location
```

**Design Goal:** F-pattern optimized scan. User can decide "relevant or not" in 3 seconds.

---

### PRIMARY (3-10 seconds) - The Scan Layer

**User Question:** "What happened? Is it interesting?"

```
PRIORITY 1: Story Content
├─ First 300 characters (above fold)
├─ Key visual elements (hero image)
└─ Read more indicator

PRIORITY 2: Quick Context
├─ Key attributes (3-4 max visible)
├─ Date occurred
├─ Media thumbnails
└─ Quick stats (views, comments, reactions)
```

**Design Goal:** Enough context to understand the experience without scrolling.

---

### SECONDARY (10-30 seconds) - The Explore Layer

**User Question:** "How does this fit into patterns? Who else experienced this?"

```
PRIORITY 1: Pattern Context
├─ Pattern Alert Card
│  ├─ Geographic wave indicator
│  ├─ Temporal spike visualization
│  └─ "Why this matters" explanation
└─ Similar count with quality score

PRIORITY 2: Discovery Tabs
├─ Similar Experiences (default)
├─ Pattern Analytics
├─ Impact & Contribution
└─ Community Discussion
```

**Design Goal:** User discovers they're "part of something bigger" without being overwhelmed.

---

### TERTIARY (30+ seconds) - The Deep Dive Layer

**User Question:** "Tell me everything. I want details."

```
AVAILABLE ON DEMAND:
├─ Full match explanations
├─ Geographic map with all locations
├─ Timeline visualization (all experiences)
├─ Statistical significance data
├─ Advanced filters and sorts
├─ Export functions
└─ Full comment threads
```

**Design Goal:** Power users and researchers get the depth they need without cluttering the main view.

---

## 🏗️ Information Structure

### Page Layout Architecture

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 0: Notifications (if just published)             │ ← Dismissable
├──────────────────────────────────────────────────────────┤
│  LAYER 1: Trust & Validation                            │ ← Always visible
│  ┌────────────────────────────────────────────────────┐ │
│  │ Validation Score Card                              │ │
│  │ "12 similar • 87% match quality"                   │ │
│  └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  LAYER 2: Post Header (Metadata)                        │ ← Always visible
│  [Category] [Title] [Author] [Stats]                    │
├──────────────────────────────────────────────────────────┤
│  LAYER 3: Pattern Context (Collapsible)                 │ ← Expandable
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🌊 Part of Geographic Wave [+ Details]            │ │
│  └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  LAYER 4: Story Content                                 │ ← Core content
│  ┌────────────────────────────────────────────────────┐ │
│  │ Story text with inline highlights                  │ │
│  │ Attributes card                                    │ │
│  │ Media gallery                                      │ │
│  └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  LAYER 5: Discovery Tabs (Tab Interface)                │ ← Progressive
│  [Similar][Patterns][Impact][Discuss]                   │   disclosure
│  ┌────────────────────────────────────────────────────┐ │
│  │ Tab Content (lazy loaded)                          │ │
│  └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  LAYER 6: Community (Comments)                           │ ← Engagement
│  ┌────────────────────────────────────────────────────┐ │
│  │ Comment thread                                     │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Content Priority Matrix

### What to Show Where

| Content Type | Always Visible | Expandable | Tab | On Demand |
|--------------|----------------|------------|-----|-----------|
| **Trust Signals** |
| Similar count | ✅ | - | - | - |
| Match quality | ✅ | - | - | - |
| Validation badge | ✅ | - | - | - |
| **Post Identity** |
| Title | ✅ | - | - | - |
| Category | ✅ | - | - | - |
| Author | ✅ | - | - | - |
| Date | ✅ | - | - | - |
| **Story Content** |
| Text (first 300 chars) | ✅ | - | - | - |
| Full text | - | ✅ | - | - |
| Key attributes (top 3) | ✅ | - | - | - |
| All attributes | - | ✅ | - | - |
| Media thumbnails | ✅ | - | - | - |
| Full media | - | ✅ | - | - |
| **Pattern Data** |
| Pattern alert | ✅ (if exists) | - | - | - |
| Wave indicator | ✅ (if exists) | - | - | - |
| Geographic data | - | ✅ | ✅ | - |
| Temporal analysis | - | - | ✅ | - |
| Correlations | - | - | ✅ | - |
| **Discovery** |
| Similar count | ✅ | - | - | - |
| Similar list (top 3) | - | - | ✅ | - |
| All similar | - | - | ✅ | - |
| Match reasons | - | - | ✅ | - |
| Filters & sort | - | - | ✅ | - |
| **Community** |
| Comment count | ✅ | - | - | - |
| Top comments (3) | ✅ | - | - | - |
| All comments | - | ✅ | - | - |
| **Engagement** |
| Views, likes | ✅ | - | - | - |
| Share button | ✅ | - | - | - |
| **Impact** |
| Contribution score | - | - | ✅ | - |
| XP Twins | - | - | ✅ | - |
| Smart Next Steps | - | - | ✅ | - |

---

## 🎯 Progressive Disclosure Strategy

### Level 1: AT-A-GLANCE (F-Pattern Scan)

**Goal:** User can answer "Should I read this?" in < 3 seconds

```
┌─────────────────────────────────────────────────────────┐
│ [✓ 12 similar]  [Dreams]  [🔥 Trending]  [2h ago]      │ ← Top left
│                                                         │
│ "Blaues pulsierendes Licht über Wien - Luzider Traum?" │ ← Title
│ ──────────────────────────────────────────────────────  │
│ by @sarah_dreamer  •  Vienna  •  ⭐ Level 5           │ ← Author
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Information Scent:** Category + Similar Count + Trending = High relevance signal

---

### Level 2: QUICK READ (Story + Context)

**Goal:** User understands what happened + basic context

```
┌─────────────────────────────────────────────────────────┐
│ Story (first 300 chars visible)                         │
│ "Letzte Nacht hatte ich einen außergewöhnlich luziden  │
│  Traum. Ich stand auf meinem Balkon und sah..."        │
│  [Read More ↓]                                          │
│                                                         │
│ [Key Attributes]  Lucidity: High • Control: Partial    │
│ [Media] 🖼️ 🎨 (2 photos, 1 sketch)                    │
└─────────────────────────────────────────────────────────┘
```

**Information Scent:** Enough to understand the experience without scrolling

---

### Level 3: PATTERN DISCOVERY (Expandable Insights)

**Goal:** User sees "I'm part of something bigger"

```
┌─────────────────────────────────────────────────────────┐
│ 🌊 PATTERN DETECTED                    [+ Expand]      │
│                                                         │
│ You're part of a geographic wave                       │
│ 8 experiences in Vienna area (last 3 months)          │
│ [See Why ↓]                                            │
└─────────────────────────────────────────────────────────┘

WHEN EXPANDED:
┌─────────────────────────────────────────────────────────┐
│ 🌊 PATTERN DETECTED                    [- Collapse]    │
│                                                         │
│ [Mini Chart Visualization]                             │
│ • 8 experiences in 50km radius                         │
│ • +250% vs baseline                                     │
│ • Peak: December 2024                                   │
│                                                         │
│ 💡 This suggests localized phenomenon                  │
│ [View Map ➝] [View Timeline ➝]                        │
└─────────────────────────────────────────────────────────┘
```

**Information Scent:** Summary visible, details on demand

---

### Level 4: DEEP ANALYSIS (Tab Interface)

**Goal:** Power users explore detailed data

```
┌─────────────────────────────────────────────────────────┐
│ [Similar 12][Patterns 3][Impact][Discuss 8]            │ ← Tabs
├─────────────────────────────────────────────────────────┤
│                                                         │
│ TAB CONTENT (lazy loaded)                              │
│ • Detailed analytics                                    │
│ • Filters & sorts                                       │
│ • Export options                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Information Scent:** Tab badges show content count (Similar 12, Patterns 3)

---

## 🔄 Information Flow

### User Journey Through Layers

```
USER ARRIVES
    ↓
LAYER 1: Glance (0-3s)
├─ Sees validation badge → "Not alone!"
├─ Sees category → "Right topic"
└─ Sees title → "Interesting!"
    ↓ DECISION: Keep reading
    ↓
LAYER 2: Scan (3-10s)
├─ Reads story beginning
├─ Sees key attributes
└─ Notices media
    ↓ DECISION: Explore patterns
    ↓
LAYER 3: Pattern Discovery (10-30s)
├─ Expands pattern card
├─ Sees wave visualization
└─ Understands context
    ↓ DECISION: Deep dive OR engage
    ↓
LAYER 4A: Deep Dive (Researcher)
├─ Clicks Patterns tab
├─ Explores analytics
└─ Filters similar experiences
    OR
LAYER 4B: Engage (Seeker)
├─ Clicks Discuss tab
├─ Reads comments
└─ Connects with XP Twins
```

---

## 📱 Responsive Information Architecture

### Desktop (1200px+)

```
┌────────────────────────────────────────────────────────────┐
│ [Left Sidebar]  │  [Main Content]  │  [Right Sidebar]     │
│                 │                  │                       │
│ • Quick Nav     │  • Post Layers   │  • Timeline Preview  │
│ • Filters       │  • Tabs          │  • Related Posts     │
│ • Categories    │                  │  • Quick Actions     │
└────────────────────────────────────────────────────────────┘
```

**All layers visible simultaneously**

---

### Tablet (768-1199px)

```
┌───────────────────────────────────────────────────────┐
│ [Main Content Full Width]                            │
│                                                       │
│ • Post Layers (stacked vertically)                   │
│ • Tabs (horizontal scroll)                           │
│ • Related content (bottom)                           │
└───────────────────────────────────────────────────────┘
```

**Linear flow, progressive disclosure**

---

### Mobile (<768px)

```
┌────────────────────────┐
│ [Single Column]        │
│                        │
│ • Compact header       │
│ • Story (collapsed)    │
│ • Pattern card         │
│   (swipeable)          │
│ • Bottom nav tabs      │
│ • Comments (separate)  │
└────────────────────────┘
```

**Extreme progressive disclosure, swipe gestures**

---

## 🎨 Visual Hierarchy Principles

### Size Hierarchy
```
Largest:  Title (32px)
Large:    Section Headers (24px)
Medium:   Card Titles (18px)
Base:     Body Text (16px)
Small:    Metadata (14px)
Smallest: Labels (12px)
```

### Color Hierarchy
```
Highest Contrast:  Validation badge, Similar count
High Contrast:     Title, Key attributes
Medium Contrast:   Body text, Dates
Low Contrast:      Metadata, Captions
```

### Spacing Hierarchy
```
Largest Gap:  Between major sections (48-64px)
Large Gap:    Between cards (32px)
Medium Gap:   Within cards (24px)
Small Gap:    Between related items (16px)
Tight:        Icon + label (8px)
```

---

## 🧭 Navigation Architecture

### Primary Navigation
- **Back to Feed** (always visible top-left)
- **Share** (always visible top-right)
- **Actions Menu** (always visible top-right)

### Secondary Navigation
- **Tabs** (Similar, Patterns, Impact, Discuss)
- **Expandable sections** (Pattern cards, Full story)
- **Deep links** (To map view, timeline view)

### Tertiary Navigation
- **Filters** (within tabs)
- **Sorts** (within tabs)
- **Related posts** (sidebar)

---

## 📝 Content Guidelines

### Title
- Max 80 characters
- Should work as standalone headline
- No clickbait, but compelling

### Story
- First 300 characters visible above fold
- Should hook the reader
- Expandable "Read More" after 300 chars

### Attributes
- Top 3-4 visible by default
- Sorted by relevance/confidence
- Expandable to show all

### Pattern Explanations
- Always include "Why this matters"
- Use plain language, not jargon
- Link to deeper analysis

---

## ✅ Information Architecture Checklist

### For Each New Feature, Ask:
- [ ] What layer does this belong to? (Glance/Scan/Explore/Deep)
- [ ] Should it be always visible, expandable, or tab-based?
- [ ] Does it serve Seekers (65%), Researchers (25%), or Storytellers (10%)?
- [ ] Can it be progressive (summary → details)?
- [ ] Does it work on mobile?
- [ ] Is there a clear information scent?
- [ ] Does it reduce or increase cognitive load?

---

**See also:**
- [01-user-research.md](./01-user-research.md) - User needs that informed this IA
- [03-visual-design.md](./03-visual-design.md) - Visual implementation of this structure
- [05-interaction-patterns.md](./05-interaction-patterns.md) - How users navigate these layers
