# XPShare Profile - Visual Hierarchy & UI Specs

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Konzept](./01-konzept.md) | [➡️ Weiter zu Database](./03-database.md)

---

## 🏗️ VISUAL HIERARCHY (Top → Bottom)

### Above the Fold (Hero Section)
1. Avatar + XP DNA Badge + Name
2. Bio + Location + Member Since
3. XP DNA Spectrum Bar
4. Primary CTA (Connect/Follow or Edit)
5. **Similarity Banner** (nur bei anderen Profilen): "87% Match!"

### Stats Strip
6-8 Cards: Level, XP, Streak, Experiences, Connections, Patterns, Countries, Percentile

### XP Twins Section (nur bei anderen Profilen)
- Shared DNA
- Shared Experiences
- More Similar Users (3-5 preview)

### Core Content Sections (2-Column Grid)
**Left Column:**
- XP DNA Distribution (Radar Chart + List)
- Pattern Contributions

**Right Column:**
- Activity Timeline (Bar Chart)
- Activity Heatmap
- Streak Widget

### Tab Navigation
Experiences | Connections | Patterns | Stats | Badges | Impact | Map

---

## 🎨 UI COMPONENTS SPECS

### 1. Profile Header Revolution

**Aktuell:**
```
[Avatar] Name
        @username
        Bio
        📍 Location
        📅 Member since

[Edit Button]
```

**Neu:**
```
┌─────────────────────────────────────────────────────────┐
│  ╭────╮                                    ╭──────────╮ │
│  │ AV │  Maria Kowalski          🌈 [XP DNA Badge]   │ │
│  │ AT │  @maria_k                          Level 23  │ │
│  │ AR │  "Exploring the unexplained since 2023"      │ │
│  ╰────╯  📍 Berlin, Germany  📅 Mitglied seit Okt 23 │ │
│                                                         │
│  ╭─── XP DNA Spectrum ──────────────────────────────╮  │
│  │ ████████████▓▓▓▓▓░░░░░                          │  │
│  │ 🛸 UFO (45%) · 💭 Dreams (32%) · 👻 Paranormal  │  │
│  ╰──────────────────────────────────────────────────╯  │
│                                                         │
│  [🔗 Connect]  [📥 Follow]  [⚙️ Settings (own)]        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **XP DNA Badge:** Visueller "Fingerabdruck" der Top-3 Kategorien
  - Farb-Gradient basierend auf Category-Mix
  - Hover: Tooltip mit exakter Verteilung
  - Instant Recognition: "Ah, ein UFO/Dreams User!"

- **Spectrum Bar:** Horizontal stacked bar chart
  - Zeigt alle Kategorien proportional
  - Color-coded per Category
  - Interactive: Click für Detail-View

---

### 2. ⭐ XP Twins & Soul Connections Section

**Erscheint nur beim Betrachten ANDERER Profile!**

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

**Similarity Algorithm:**
```typescript
interface SimilarityFactors {
  categoryOverlap: number;      // 0-1: Jaccard similarity of categories
  categoryDistribution: number;  // 0-1: Cosine similarity of percentages
  locationProximity: number;     // 0-1: Same city=1, same country=0.5
  temporalOverlap: number;       // 0-1: Active in same time periods
  patternMatches: number;        // 0-1: Shared pattern contributions
  experienceOverlap: number;     // 0-1: Witnessed same experiences
}

function calculateSimilarity(user1: User, user2: User): number {
  const factors = analyzeSimilarity(user1, user2);

  return (
    factors.categoryOverlap * 0.25 +
    factors.categoryDistribution * 0.20 +
    factors.locationProximity * 0.15 +
    factors.temporalOverlap * 0.10 +
    factors.patternMatches * 0.20 +
    factors.experienceOverlap * 0.10
  );
}
```

**Component:** `<XPTwinsHeroSection />`
- Fetches from `/api/users/similarity?user1={currentUser}&user2={profileUser}`
- Only renders if similarity >= 30%
- Prominent placement between Header and Stats Grid
- Click "View All" → Connections Tab

---

### 3. XP DNA Distribution Visualization

```
┌─── XP DNA Distribution ───────────────────────────────┐
│                                                        │
│         [Interactive Radar/Spider Chart]               │
│                                                        │
│                    UFO (45%)                           │
│                   /    |    \                          │
│         Dreams (32%)   +   Paranormal (12%)            │
│                   \    |    /                          │
│                  NDE (8%) Sync (3%)                    │
│                                                        │
│  📊 Category Breakdown:                                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 🛸 UFO (45%) - 23 experiences   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 💭 Dreams (32%) - 16 exp        │
│  ▓▓▓▓▓░░░░░░░░░░░░░░░ 👻 Paranormal (12%) - 6 exp     │
│  ▓▓░░░░░░░░░░░░░░░░░░ 💫 NDE (8%) - 4 exp             │
│  ▓░░░░░░░░░░░░░░░░░░░ ⚡ Synchronicity (3%) - 2 exp   │
│                                                        │
│  [View All 12 Categories →]                            │
└────────────────────────────────────────────────────────┘
```

**Component:** `<CategoryRadarChart />`
- Recharts Radar Chart
- Responsive & Interactive
- Color-coded per category
- Click category → Filter experiences

---

### 4. Enhanced Stats Grid

**Aktuell:** 4 Cards (Level, XP, Streak, Experiences)

**Neu:** 6-8 Cards mit mehr Kontext

```
┌──────────────────────────────────────────────────────────┐
│  Grid: 2 cols mobile, 4 cols tablet, 6 cols desktop     │
├──────────────────────────────────────────────────────────┤
│  🏆 Level 23        ⚡ 2,340 XP       🔥 12d Streak     │
│  📝 51 Experiences  🌍 5 Countries    ⭐ 8 Patterns      │
│  👥 142 Connections 🎯 Top 5%         📍 23 Cities      │
└──────────────────────────────────────────────────────────┘
```

**Neue Stats:**
- **Connections:** Anzahl ähnlicher User (>30% Match)
- **Percentile:** Ranking in Community (Top X%)
- **Geographic Reach:** Anzahl Länder/Städte
- **Pattern Count:** Unique patterns contributed to

**Component:** `<EnhancedStatsGrid />`

---

### 5. Pattern Contributions Section

```
┌─── My Pattern Discoveries ────────────────────────────┐
│                                                        │
│  🧩 "Berlin UFO Wave 2023"                            │
│     ↳ 23 users confirmed this pattern                 │
│     ↳ Geographic cluster: Berlin & Brandenburg        │
│     ↳ Impact: 340 XP awarded to contributors          │
│                                                        │
│  🧩 "Full Moon Lucid Dreams"                          │
│     ↳ 8 users confirmed                                │
│     ↳ Temporal pattern: Full moon ±2 days             │
│     ↳ Impact: 120 XP awarded                           │
│                                                        │
│  🧩 "Nordic Lights UFO Correlation"                   │
│     ↳ 45 users confirmed                               │
│     ↳ Cross-pattern: Aurora + UFO sightings           │
│     ↳ Impact: 1,240 XP awarded                         │
│                                                        │
│  Total Community Impact: 12,340 connections made       │
│  [View All My Patterns →]                              │
└────────────────────────────────────────────────────────┘
```

**Component:** `<PatternContributionsCard />`
- Shows user's role in pattern discovery
- Highlights community impact
- Links to pattern detail pages

---

### 6. Connections Tab

**Ersetzt/Ergänzt:** "Collaborations" Tab

```
┌─── Connections Tab ───────────────────────────────────┐
│                                                        │
│  [XP Twins] [Location] [Patterns] [Mutual]            │
│  ▔▔▔▔▔▔▔▔                                             │
│                                                        │
│  🎯 XP Twins (87%+ Match)                             │
│  ┌────────────────────────────────────────┐           │
│  │ @maria_k        87% │ 🛸💭👻           │           │
│  │ Berlin          23 XP│ Level 23         │           │
│  │ [Connect] [Message]                     │           │
│  └────────────────────────────────────────┘           │
│                                                        │
│  │ @cosmic_john    81% │ 🛸⚡🕐           │           │
│  │ @dreamer_23     76% │ 💭⚡💫           │           │
│  │ ... (142 total)                         │           │
│                                                        │
│  [Load More]                                           │
└────────────────────────────────────────────────────────┘
```

**Sub-Tabs:**
1. **XP Twins:** Highest similarity users (>80%)
2. **Location:** Same city/country users
3. **Patterns:** Co-discoverers of patterns
4. **Mutual:** Mutual witnesses of same experiences

---

### 7. Experience Map Integration

```
┌─── Global XP Footprint ───────────────────────────────┐
│                                                        │
│  [Interactive Leaflet Map with Heatmap Layer]         │
│                                                        │
│  Markers:                                              │
│  • 🔴 High activity (5+ experiences)                  │
│  • 🟠 Medium activity (2-4 experiences)               │
│  • 🟡 Single experience                               │
│                                                        │
│  📍 5 Countries  │  🌍 23 Cities  │  🗺️ 51 Locations │
│                                                        │
│  [Toggle Heatmap] [Filter by Category]                │
└────────────────────────────────────────────────────────┘
```

**Component:** `<ExperienceMap />`
- Shows all user's experience locations
- Heatmap für density
- Click marker → Experience preview
- Filter by category

---

### 8. Activity Timeline Enhancement

**Aktuell:** Bar Chart mit monatlicher Aktivität

**Neu:** Zusätzlich GitHub-Style Heatmap

```
┌─── Activity Heatmap (Last 12 Months) ─────────────────┐
│                                                        │
│  Mon  ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ... (52 weeks)         │
│  Wed  ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢                         │
│  Fri  ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢                         │
│                                                        │
│  ▢ No activity  ▢ 1-2 XP  ▢ 3-5 XP  ▢ 6+ XP          │
│                                                        │
│  🔥 Current Streak: 12 days                           │
│  🏆 Longest Streak: 45 days                           │
└────────────────────────────────────────────────────────┘
```

**Component:** `<ActivityHeatmap />`
- Cal-Heatmap Library
- Tooltip with exact count
- Click day → Experiences on that day

---

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Konzept](./01-konzept.md) | [➡️ Weiter zu Database](./03-database.md)
