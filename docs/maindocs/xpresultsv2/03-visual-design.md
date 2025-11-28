# Visual Design & Mockups

## 🎨 Design System

### Design Principles

#### 1. Clarity over Cleverness
- No fancy animations that distract from content
- Data visualization must be instantly readable
- Typography hierarchy crystal clear
- Every element serves a purpose

#### 2. Trust through Transparency
- Show HOW matches are calculated
- Expose confidence scores
- Make algorithms explainable
- No black box AI

#### 3. Progressive Disclosure
- Don't overwhelm with all data at once
- Layers: Glance → Read → Explore → Analyze
- User controls depth of information
- Smart defaults for each persona

#### 4. Data Storytelling
- Numbers need narrative context
- "12 similar" → "You're part of a wave"
- Context makes data meaningful
- Explain statistical significance

---

## 🎨 Color System

### Primary Colors

```
Observatory Gold (#D4A76A)
├─ Use: Trust signals, validation badges
├─ Meaning: Warmth, validation, premium quality
└─ Accessibility: AAA on dark backgrounds

Deep Purple (#6B46C1)
├─ Use: Mystery, spiritual elements, category badges
├─ Meaning: Depth, introspection, extraordinary
└─ Accessibility: AA on light backgrounds

Soft Blue (#4A90E2)
├─ Use: Scientific data, calm elements, links
├─ Meaning: Trust, clarity, knowledge
└─ Accessibility: AAA on white
```

### Semantic Colors

```
Success/Validation (#7FB069)
├─ Use: Match quality, validation messages, success states
├─ Meaning: "You're not alone", positive confirmation
└─ Variants: #9CC484 (light), #6A9B57 (dark)

Pattern Alert (#F59E42)
├─ Use: Wave indicators, trending, pattern highlights
├─ Meaning: "Something interesting here", attention
└─ Variants: #FFB366 (light), #E08A2E (dark)

High Match (#4ECDC4)
├─ Use: Match scores >85%, XP Twins, connections
├─ Meaning: Strong correlation, close match
└─ Variants: #6FE0D8 (light), #3DBAB2 (dark)

Warning (#FFB84D)
├─ Use: Low confidence, needs attention
├─ Meaning: Caution, review needed
└─ Variants: #FFC870 (light), #E6A43D (dark)
```

### Data Visualization Colors

```
Geographic Gradient:
#4A90E2 → #6B46C1 (blue to purple)
Use: Maps, location-based patterns

Temporal Gradient:
#F59E42 → #D4A76A (orange to gold)
Use: Timeline charts, time-based patterns

Correlation:
#4ECDC4 (solid turquoise)
Use: Attribute correlations, network graphs
```

### Neutral Colors

```
Background:
- Primary: #0A0A0B (near black)
- Secondary: #1A1A1C (dark gray)
- Tertiary: #2A2A2D (medium gray)

Text:
- Primary: #FFFFFF (pure white) - main content
- Secondary: #B0B0B0 (light gray) - metadata
- Tertiary: #808080 (medium gray) - captions

Borders:
- Subtle: #2A2A2D
- Default: #404045
- Emphasized: #606065
```

---

## 📐 Typography Scale

### Font Families

```
Headings: Inter, system-ui, sans-serif
├─ Weight: 700 (Bold) for H1-H2
├─ Weight: 600 (SemiBold) for H3
└─ Weight: 500 (Medium) for H4

Body: Inter, system-ui, sans-serif
├─ Weight: 400 (Regular) for body text
├─ Weight: 500 (Medium) for emphasis
└─ Weight: 600 (SemiBold) for strong emphasis

Monospace: 'Fira Code', 'Courier New', monospace
└─ Use: Data values, technical info, code
```

### Scale

```
HEADING 1 (Post Title)
- Size: 32px / 2rem
- Line Height: 1.2 (38.4px)
- Weight: 700
- Letter Spacing: -0.02em
- Use: Post title only

HEADING 2 (Section Headers)
- Size: 24px / 1.5rem
- Line Height: 1.3 (31.2px)
- Weight: 600
- Letter Spacing: -0.01em
- Use: Tab labels, major sections

HEADING 3 (Card Titles)
- Size: 18px / 1.125rem
- Line Height: 1.4 (25.2px)
- Weight: 500
- Letter Spacing: 0
- Use: Pattern card titles, similar experience titles

BODY (Story Text)
- Size: 16px / 1rem
- Line Height: 1.6 (25.6px)
- Weight: 400
- Letter Spacing: 0
- Use: Main content, descriptions

CAPTION (Metadata)
- Size: 14px / 0.875rem
- Line Height: 1.5 (21px)
- Weight: 400
- Letter Spacing: 0
- Use: Dates, locations, author info

LABEL (Tags, Badges)
- Size: 12px / 0.75rem
- Line Height: 1.4 (16.8px)
- Weight: 500
- Letter Spacing: 0.02em (tracking)
- Use: Category badges, tags, counts, small labels
```

---

## 📏 Spacing System (8px Base Grid)

```
XXS: 4px  (0.25rem) - Tight spacing, icon gaps
XS:  8px  (0.5rem)  - Minimum touch target padding
SM:  16px (1rem)    - Card padding, component spacing
MD:  24px (1.5rem)  - Section spacing
LG:  32px (2rem)    - Major section gaps
XL:  48px (3rem)    - Page section separators
XXL: 64px (4rem)    - Hero spacing, page margins
```

---

## 🖼️ COMPLETE MOCKUPS

### MOCKUP 1: POST HEADER (Above the Fold)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  ← Back to Feed                            [📤 Share] [⋮ More Actions]   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ VALIDATION SCORE CARD                      [?] What's this?         │ ║
║  │ ╭───────────────────────────────────────────────────────────────╮   │ ║
║  │ │  ✓ 87% Match Quality                                          │   │ ║
║  │ │  12 similar experiences found                                 │   │ ║
║  │ │  Based on: 5 shared attributes • Location • Timeframe         │   │ ║
║  │ │                                                                │   │ ║
║  │ │  ┌──────────────────────────────────────────────────────────┐ │   │ ║
║  │ │  │ Match Quality: ████████████████████░░░░ 87/100           │ │   │ ║
║  │ │  └──────────────────────────────────────────────────────────┘ │   │ ║
║  │ │                                                                │   │ ║
║  │ │  [See Pattern Details ↓]  [View Similar Experiences →]       │   │ ║
║  │ ╰───────────────────────────────────────────────────────────────╯   │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌──────────┐  ┌─────────┐  ┌──────────────┐                           ║
║  │ Dreams   │  │ 🔥 Wave  │  │ 📅 2 hours ago │                          ║
║  └──────────┘  └─────────┘  └──────────────┘                           ║
║                                                                           ║
║  Blaues pulsierendes Licht über Wien - Luzider Traum?                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         ║
║                                                                           ║
║  👤 Sarah_Dreamer  •  📍 Vienna, Austria  •  ⭐ Level 5  •  🏆 3 Badges  ║
║  💬 8 comments  •  ❤️ 24 reactions  •  👁️ 156 views                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Design Notes:**
- **Validation Card:** First thing user sees. Addresses #1 need: "Am I alone?"
- **Progress Bar:** Visual representation of match quality (not just number)
- **Explainer:** "Based on..." shows transparency
- **F-Pattern Optimized:** Category → Wave Badge → Title → Author (left-aligned scan)
- **Social Proof:** Comments, reactions, views prominently displayed
- **Badge System:** Trending/Wave badge creates FOMO + relevance signal

**Color Mapping:**
- Validation card background: rgba(127, 176, 105, 0.1) (soft green glow)
- Match quality bar: #7FB069 (success green)
- Wave badge: #F59E42 (pattern alert orange)
- Category badge: #6B46C1 (deep purple)

---

### MOCKUP 2: PATTERN INSIGHTS CARD (Expandable)

**STATE 1: Collapsed (Default)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🌊 PATTERN DETECTED                              [+ Expand Details]     │
│                                                                         │
│ You're part of a GEOGRAPHIC WAVE                                       │
│ 8 experiences in Vienna area • Last 3 months • +250% vs baseline       │
│                                                                         │
│ 💡 This concentration suggests a localized phenomenon                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**STATE 2: Expanded**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🌊 GEOGRAPHIC WAVE DETECTED                      [- Collapse]          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Vienna Area Activity (50km radius)                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │   Activity Over Time                                              │ │
│  │                                                                   │ │
│  │    ▂▃▅█▇▅▃▂▁  ← Your experience (Dec 15)                        │ │
│  │   ┌──┬──┬──┬──┬──┬──┬──┐                                        │ │
│  │   │  │  │  │██│  │  │  │  8 total experiences                  │ │
│  │ 4 │  │  │  │██│  │  │  │  in Vienna area                       │ │
│  │ 3 │  │  │██│██│  │  │  │                                        │ │
│  │ 2 │  │██│██│██│██│  │  │  Baseline: 1.2/month                  │ │
│  │ 1 │██│██│██│██│██│  │  │  Current: 4.0/month                   │ │
│  │ 0 └──┴──┴──┴──┴──┴──┴──┘                                        │ │
│  │   Sep Oct Nov Dec Jan Feb Mar                                    │ │
│  │                                                                   │ │
│  │   ⚡ Key Insights:                                                │ │
│  │   • Peak activity: December 2024 (5 experiences)                 │ │
│  │   • 250% increase vs 6-month baseline                            │ │
│  │   • Cluster radius: ~50km around Vienna center                   │ │
│  │   • Time span: September 2024 - Present                          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  💡 WHY THIS MATTERS:                                                  │
│  This concentration suggests a localized phenomenon rather than        │
│  random individual experiences. Similar geographic clusters have       │
│  been observed in other regions.                                       │
│                                                                         │
│  📊 Statistical Significance: p < 0.05 (95% confidence)                │
│                                                                         │
│  [🗺️ See Geographic Map →]  [📈 View Full Timeline →]                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **Inline Visualization:** Chart embedded directly, no modal needed
- **Spark Line:** Quick visual scan of trend
- **Bar Chart:** Shows distribution over time
- **"Your experience" marker:** Personal context in data
- **"Why This Matters" section:** Data storytelling, not just numbers
- **Statistical Confidence:** Transparency for researchers
- **Action CTAs:** Optional deep dives (map, timeline)

**Color Mapping:**
- Card border: #F59E42 (pattern alert)
- Chart bars: Gradient #4A90E2 → #6B46C1
- "Your experience" marker: #FFB84D (highlight)
- Background: rgba(245, 158, 66, 0.05) (subtle orange glow)

---

### MOCKUP 3: STORY CONTENT AREA

```
┌─────────────────────────────────────────────────────────────────────────┐
│ EXPERIENCE STORY                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Letzte Nacht hatte ich einen außergewöhnlich luziden Traum.           │
│  Ich stand auf meinem Balkon in Wien und sah am Himmel ein             │
│  ╔═══════════════════════════════════════════════════════╗             │
│  ║ 🔍 PATTERN HIGHLIGHT                                  ║             │
│  ║                                                       ║             │
│  ║ "blaues pulsierendes Licht"                          ║             │
│  ║                                                       ║             │
│  ║ Appears in 8/12 similar experiences (67%)            ║             │
│  ║ Strong correlation with high lucidity                ║             │
│  ║                                                       ║             │
│  ║ [See All Matches →]                                   ║             │
│  ╚═══════════════════════════════════════════════════════╝             │
│  blaues, pulsierendes Licht. Es war so intensiv und ungewöhnlich,     │
│  dass ich mir sofort bewusst wurde, dass ich träume...                 │
│                                                                         │
│  [Read Full Story ↓]                                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ KEY ATTRIBUTES                                         [?] Info   │ │
│  │                                                                   │ │
│  │ 💫 Lucidity Level: High                      (90% confidence)    │ │
│  │ 🎮 Control: Partial                          (85% confidence)    │ │
│  │ 🌈 Visual Elements: Vivid blue light         (95% confidence)    │ │
│  │ ⏰ Time: 3:00 AM (REM peak)                  (Manual entry)      │ │
│  │ 📍 Setting: Outdoor/Balcony                   (Manual entry)      │ │
│  │ 🌡️ Emotional Tone: Wonder                    (80% confidence)    │ │
│  │                                                                   │ │
│  │ ✓ 8 similar experiences share these attributes                   │ │
│  │                                                                   │ │
│  │ [See All Attributes (12 total) ↓]                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  📸 MEDIA (3 items)                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                               │
│  │         │  │         │  │         │                               │
│  │  Photo  │  │  Sketch │  │  Audio  │                               │
│  │   1     │  │  of     │  │  Note   │                               │
│  │         │  │  Light  │  │  2:34   │                               │
│  └─────────┘  └─────────┘  └─────────┘                               │
│  [View Gallery →]                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **Inline Text Highlights:** Hover/tap "blaues pulsierendes Licht" shows pattern popup
- **Progressive Disclosure:** First 300 chars → "Read More" → Full story
- **Attributes Card:** Confidence scores shown (transparency!)
- **Manual vs AI:** Clear distinction (AI extracted vs user entered)
- **Match Count:** "8 similar share these" = validation
- **Media Thumbnails:** Quick overview, gallery view optional

**Interaction:**
- Hover over highlighted text → Show pattern match tooltip
- Click attribute → Filter similar experiences by that attribute
- Click media thumbnail → Open lightbox gallery

**Color Mapping:**
- Text highlights: rgba(78, 205, 196, 0.2) background + #4ECDC4 underline
- High confidence (>85%): #7FB069 icon
- Medium confidence (70-85%): #FFB84D icon
- Low confidence (<70%): #FF6B6B icon

---

### MOCKUP 4: SIMILAR EXPERIENCES TAB

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Similar 12] [Patterns 3] [Impact] [Discuss 8]                         │
├─────────────────────────────────────────────────────────────────────────┤
│ SIMILAR EXPERIENCES                                                     │
│                                                                         │
│ 🎯 Filter: [All ✓] [Same City] [Same Country] [High Match >80%]       │
│ 📊 Sort by: [Best Match ▼] Newest | Nearest | Most Reactions          │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ ┌────┐                                                            │ │
│ │ │ 94%│  Blaue Lichterscheinung im Luciden Traum                  │ │
│ │ │    │  by @user123 • Vienna • 3 days ago                        │ │
│ │ └────┘  ──────────────────────────────────────────────────────   │ │
│ │                                                                   │ │
│ │  "Ich hatte auch ein blaues Licht gesehen, genau wie du..."      │ │
│ │                                                                   │ │
│ │  ✓ Why This Matches:                                             │ │
│ │  • 🏷️ Shares 5 key attributes (blue light, lucidity, control)   │ │
│ │  • 📍 Same city (Vienna)                                         │ │
│ │  • 📅 Similar timeframe (±2 months)                             │ │
│ │  • 🎯 Same category (Dreams/Lucid)                              │ │
│ │  • ⏰ Similar time (3 AM - REM peak)                            │ │
│ │                                                                   │ │
│ │  💬 3 comments  •  ❤️ 12 reactions                               │ │
│ │                                                                   │ │
│ │  [Read Full Experience →]  [✉ Connect with @user123]            │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ ┌────┐                                                            │ │
│ │ │ 89%│  Pulsierendes Licht während Astralprojektion             │ │
│ │ │    │  by @dreamer_456 • Graz • 1 week ago                      │ │
│ │ └────┘  ──────────────────────────────────────────────────────   │ │
│ │                                                                   │ │
│ │  "Bei meiner ersten Astralprojektion sah ich ähnliches..."       │ │
│ │                                                                   │ │
│ │  ✓ Why This Matches:                                             │ │
│ │  • 🏷️ Shares 4 key attributes (blue light, consciousness)       │ │
│ │  • 📍 Same country (Austria)                                     │ │
│ │  • 🎯 Related category (Astral/Dreams overlap)                  │ │
│ │                                                                   │ │
│ │  💬 5 comments  •  ❤️ 18 reactions                               │ │
│ │                                                                   │ │
│ │  [Read Full Experience →]  [✉ Connect with @dreamer_456]        │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Load 10 more similar experiences...]                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **Match Score Badge:** Large, prominent (94%, 89%)
- **Match Reasons EXPLICIT:** Bullet list shows WHY it matched
- **Emoji Icons:** Visual hierarchy (🏷️ attributes, 📍 location, etc.)
- **Social Proof:** Comments/reactions visible
- **CTAs:** Two actions - Read Full OR Connect directly
- **Filters:** Quick access at top (for Researchers)
- **Progressive Loading:** "Load more" at bottom

**Color Mapping:**
- Match score >90%: #4ECDC4 (high match turquoise)
- Match score 80-90%: #7FB069 (success green)
- Match score 70-80%: #FFB84D (medium yellow)
- Match reasons icons: Muted colors, not distracting

---

### MOCKUP 5: PATTERNS TAB (Analytics Deep Dive)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Similar 12] [Patterns 3] [Impact] [Discuss 8]                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PATTERN ANALYSIS                                                        │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 🗺️ GEOGRAPHIC PATTERN                                  [Expand ▼] │ │
│ │                                                                   │ │
│ │  ┌────────────────────────────────────────────────────────────┐  │ │
│ │  │ [Interactive Map with Heatmap]                             │  │ │
│ │  │                                                             │  │ │
│ │  │         ╭──●──╮  ← Vienna Cluster (8 experiences)         │  │ │
│ │  │         │  ●● │                                            │  │ │
│ │  │         │ ●●●●│                                            │  │ │
│ │  │         ╰─────╯                                            │  │ │
│ │  │                                                             │  │ │
│ │  │               ●● ← Graz (4 experiences)                   │  │ │
│ │  │                                                             │  │ │
│ │  └────────────────────────────────────────────────────────────┘  │ │
│ │                                                                   │ │
│ │  • Cluster center: Vienna (48.2°N, 16.4°E)                       │ │
│ │  • Radius: ~50km                                                  │ │
│ │  • Density: 6x baseline                                           │ │
│ │  • Secondary cluster: Graz (120km SE)                            │ │
│ │                                                                   │ │
│ │  💡 This geographic concentration suggests a regional pattern     │ │
│ │  rather than random distribution (p < 0.05).                     │ │
│ │                                                                   │ │
│ │  [View Full Map ➝]                                               │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ ⏰ TEMPORAL PATTERN                                    [Expand ▼] │ │
│ │                                                                   │ │
│ │  Daily Distribution (24-hour clock):                             │ │
│ │                                                                   │ │
│ │   8│  █                                                          │ │
│ │   7│  █                                                          │ │
│ │   6│  █                                                          │ │
│ │   5│  █ ▃                                                        │ │
│ │   4│  █ ▃     ▂                                                  │ │
│ │   3│  █ ▃ ▁ ▁ ▂   ▁                                             │ │
│ │   2│  █ ▃ ▁ ▁ ▂ ▁ ▁ ▁                                           │ │
│ │   1│▁ █ ▃ ▁ ▁ ▂ ▁ ▁ ▁ ▁ ▁ ▁                                     │ │
│ │   0└──┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─                                   │ │
│ │    0  4 8 12 16 20 24                                            │ │
│ │                                                                   │ │
│ │  • Peak activity: 2-4 AM (REM cycle)                             │ │
│ │  • 83% occur during nighttime hours (22:00-6:00)                │ │
│ │  • Secondary peak: 7-9 PM (pre-sleep)                           │ │
│ │                                                                   │ │
│ │  💡 This aligns with known sleep phase patterns and supports     │ │
│ │  the hypothesis of dream-related phenomena.                      │ │
│ │                                                                   │ │
│ │  [View Timeline ➝]                                               │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 🔗 ATTRIBUTE CORRELATIONS                             [Expand ▼] │ │
│ │                                                                   │ │
│ │  "Blue Light" correlates with:                                   │ │
│ │                                                                   │ │
│ │  High Lucidity    ████████████████████ 92% (11/12 experiences)  │ │
│ │  Outdoor Setting  ██████████████ 75% (9/12 experiences)         │ │
│ │  Partial Control  ████████ 58% (7/12 experiences)               │ │
│ │  Wonder Emotion   ██████ 50% (6/12 experiences)                 │ │
│ │                                                                   │ │
│ │  💡 Strong correlation between "blue light" and "high lucidity"  │ │
│ │  suggests a consistent pattern in lucid dream experiences.       │ │
│ │                                                                   │ │
│ │  Statistical significance: p < 0.01 (99% confidence)             │ │
│ │                                                                   │ │
│ │  [See Correlation Matrix ➝]                                      │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **3 Pattern Types:** Geographic | Temporal | Attribute Correlations
- **Inline Charts:** Each pattern has embedded visualization
- **Statistical Context:** p-values, confidence scores shown
- **"Why It Matters":** Every chart has explanation
- **Expandable:** Collapsed by default, can expand for details
- **Deep Link CTAs:** "View Full Map", "View Timeline" for drill-down

**Chart Types:**
- Geographic: Heatmap on map
- Temporal: Bar chart (24-hour distribution)
- Correlation: Horizontal bar chart with percentages

---

### MOCKUP 6: IMPACT TAB (Your Contribution)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Similar 12] [Patterns 3] [Impact] [Discuss 8]                         │
├─────────────────────────────────────────────────────────────────────────┤
│ YOUR IMPACT & CONTRIBUTION                                              │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 🎯 CONTRIBUTION SCORE: 87/100                     [?] How calculated│ │
│ │                                                                   │ │
│ │  ████████████████████████████████████████████████████░░░░░░░░░░  │ │
│ │                                                                   │ │
│ │  Your experience strengthens collective understanding:            │ │
│ │                                                                   │ │
│ │  ✓ Vienna Geographic Cluster (8 total experiences)               │ │
│ │    → Your report adds critical data point to regional pattern    │ │
│ │                                                                   │ │
│ │  ✓ Blue Light Phenomenon Research (23 total experiences)         │ │
│ │    → First to report "blue + Vienna" combination                 │ │
│ │                                                                   │ │
│ │  ✓ Lucid Dream Pattern Analysis (156 total experiences)          │ │
│ │    → Contributes to understanding lucidity triggers              │ │
│ │                                                                   │ │
│ │  📊 Network Reach: 12 direct matches                             │ │
│ │  🔬 Research Value: HIGH (unique attribute combination)          │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 🤝 XP TWINS (High Match Users)                                    │ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │ 👤 @sarah_dreams                               94% MATCH     │ │ │
│ │  │ Vienna • Level 6 • Dream Walker Badge                       │ │ │
│ │  │                                                              │ │ │
│ │  │ "I had the exact same blue light! We should compare notes." │ │ │
│ │  │                                                              │ │ │
│ │  │ Shared: blue light, high lucidity, Vienna, 3 AM, outdoor    │ │ │
│ │  │                                                              │ │ │
│ │  │ [✉ Send Message]  [View Their Experiences]                  │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │ 👤 @michael_lucid                              91% MATCH     │ │ │
│ │  │ Graz • Level 8 • Chronicler Badge                           │ │ │
│ │  │                                                              │ │ │
│ │  │ "Similar pattern, different city. Interesting geographic     │ │ │
│ │  │  correlation."                                               │ │ │
│ │  │                                                              │ │ │
│ │  │ Shared: blue light, lucidity, Austria, similar time         │ │ │
│ │  │                                                              │ │ │
│ │  │ [✉ Send Message]  [View Their Experiences]                  │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  [See All Potential Connections →]                               │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 💡 SMART NEXT STEPS                                               │ │
│ │                                                                   │ │
│ │  🏆 Badge Progress:                                               │ │
│ │  • "Dream Walker" 2/3 dreams with lucidity [+1 more needed]      │ │
│ │    Next milestone unlocks "Lucid Master" path                    │ │
│ │                                                                   │ │
│ │  • "Vienna Cluster" 1/5 Vienna experiences                       │ │
│ │    Contributing to regional research                             │ │
│ │                                                                   │ │
│ │  🔍 Recommended Actions:                                          │ │
│ │  1. Add witnesses to strengthen report (+10 XP each)             │ │
│ │  2. Upload sketch of blue light phenomenon (+15 XP)              │ │
│ │  3. Connect with @sarah_dreams (94% match, Vienna)               │ │
│ │  4. Set up notification for similar Vienna experiences           │ │
│ │  5. Submit follow-up if phenomenon repeats                       │ │
│ │                                                                   │ │
│ │  📈 Potential Impact:                                             │ │
│ │  Following these steps could increase your Contribution Score    │ │
│ │  to 95+ and unlock "Regional Contributor" badge.                 │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **Contribution Score:** Gamified + Meaningful (not just XP)
- **XP Twins Cards:** Personal faces, names, direct quotes
- **Match Percentage:** Prominent (94%, 91%)
- **Shared Attributes:** Listed explicitly
- **Direct CTAs:** "Send Message", "View Experiences"
- **Badge Progress:** Visual tracking (2/3, 1/5)
- **Smart Recommendations:** Personalized, actionable steps
- **Impact Preview:** "What happens if you do this?"

**Color Mapping:**
- Contribution score bar: Gradient #7FB069 → #4ECDC4
- XP Twin cards: Subtle background glow matching their level
- Badge progress: Gold #D4A76A for locked, Green #7FB069 for unlocked

---

## 📱 Responsive Variations

### Mobile Mockup (375px width)

```
┌─────────────────────────────┐
│ ← Experience                │
│                             │
│ ┌─────────────────────────┐ │
│ │ ✓ 87% Match             │ │
│ │ 12 similar found        │ │
│ │ [Details ▼]             │ │
│ └─────────────────────────┘ │
│                             │
│ Dreams • 🔥 Wave • 2h       │
│                             │
│ Blaues pulsierendes Licht   │
│ über Wien...                │
│ ─────────────────────────   │
│                             │
│ @sarah • Vienna • Lvl 5     │
│ 💬 8 • ❤️ 24 • 👁️ 156      │
│                             │
│ [Story content...]          │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🌊 Pattern              │ │
│ │ Geographic Wave         │ │
│ │ [+ Details]             │ │
│ └─────────────────────────┘ │
│                             │
│ [Bottom Tab Navigation]     │
│ Similar Patterns Impact 💬  │
│                             │
└─────────────────────────────┘
```

**Mobile-Specific Changes:**
- Extreme compression of header info
- Swipeable cards instead of grid
- Bottom tab navigation (thumb-friendly)
- Single column layout
- Expandable sections collapsed by default

---

## ✅ Design System Checklist

When creating new components, verify:

- [ ] Uses colors from approved palette
- [ ] Typography follows scale (32/24/18/16/14/12px)
- [ ] Spacing follows 8px grid system
- [ ] Meets WCAG AA contrast (4.5:1 text, 3:1 large text)
- [ ] Works on mobile/tablet/desktop
- [ ] Has hover/focus/active states
- [ ] Includes loading/error states
- [ ] Has proper keyboard navigation
- [ ] Screen reader friendly (ARIA labels)
- [ ] Animations respect prefers-reduced-motion

---

**See also:**
- [04-components-spec.md](./04-components-spec.md) - Technical implementation specs
- [05-interaction-patterns.md](./05-interaction-patterns.md) - Interaction details
- [mockups/](./mockups/) - Individual mockup files for reference
