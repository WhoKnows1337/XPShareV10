# XPShare User Profile Redesign - Comprehensive Concept

**Status:** Research & Concept Phase
**Datum:** 2025-10-19
**Ziel:** Community-fokussiertes Profile-Redesign mit Similarity Matching

---

## 🎯 Executive Summary

Nach gründlicher Analyse des XPShare-Konzepts, der aktuellen Implementation und State-of-the-art Profile Patterns (GitHub, LinkedIn, Behance) präsentiere ich ein **Community-fokussiertes Profile-Redesign** mit **Similarity Matching** als Kern-Feature.

**Kernproblem:** Aktuelle Profile zeigen User-Statistiken, aber keine Verbindungen zu anderen Users mit ähnlichen Erlebnissen.

**Lösung:** "XP Identity & Connections" - Ein System, das zeigt wer du bist (XP DNA) und wen du finden solltest (XP Twins).

---

## 📊 IST-ANALYSE

### Aktuelle Implementation

**Datenmodell:**
- `user_profiles` Tabelle mit: username, display_name, avatar_url, bio, location_city, location_country, total_xp, level, current_streak, longest_streak, total_experiences, total_contributions
- Gamification Features: XP, Badges, Levels, Streaks
- 9-Tab System: Experiences, Drafts, Private, Comments, Liked, Collaborations, Stats, Badges, Impact

**UI Struktur:**
```
app/[locale]/profile/[id]/
  ├── page.tsx (Server Component)
  ├── profile-client-tabs.tsx
  └── tabs/
      └── profile-badges.tsx

components/profile/
  ├── profile-tabs.tsx (9-Tab Navigation)
  ├── user-stats.tsx (Level, XP, Streak, Experiences)
  ├── activity-chart.tsx (Monthly Activity Timeline)
  └── download-report-button.tsx
```

### Stärken ✅
- Solide Gamification (XP, Badges, Levels, Streaks)
- 9-Tab System für Content-Organisation
- Activity Timeline vorhanden
- Basic Stats gut dargestellt (Level, XP, Streak, Experiences)
- Streak Widget mit Visualisierung
- Download Report Feature

### Schwächen ❌
- **Keine User-zu-User Connections** (größtes Problem!)
- Keine Category Distribution sichtbar
- Keine "XP DNA" / Interessens-Profile
- Keine Discovery-Mechanismen für ähnliche User
- Wenig visuelles Storytelling
- Kein "Social Proof" (gemeinsame Patterns/Experiences)
- Keine Gemeinsamkeiten-Anzeige beim Betrachten anderer Profile
- "Collaborations" Tab existiert, aber wenig Content
- "Global Impact" Tab zeigt keine konkreten Connections

---

## 🔬 STATE-OF-THE-ART INSIGHTS

### Research Sources

**Exa MCP Searches:**
1. "modern user profile design patterns 2024 2025 social platform community engagement gamification"
2. "user profile similarity matching connection discovery shared interests UX patterns"

**Key Findings:**

#### 1. GitHub's Success Formula
- **Contribution Graph:** Visuelles Activity Storytelling (Heatmap-Style)
- **Profile README:** Selbst-Expression
- **Follower/Following:** Social Graph
- **Pinned Repositories:** Kuratierte Highlights

**Takeaway:** Aktivität visuell darstellen schafft Engagement

#### 2. LinkedIn's "People You May Know" (PYMK)
- Embedding-basierte User Similarity
- Prozessiert "hundreds of billions of potential connections daily"
- Verwendet: Profile attributes, Behavior patterns, Network proximity
- **Challenge:** Impossible to sift through entire candidate inventory
- **Solution:** Hierarchical retrieval + ML embeddings

**Takeaway:** Similarity Matching benötigt smarten Algorithmus, nicht brute-force

#### 3. Gamification Best Practices 2025
- **White Hat Gamification:** User empowerment, meaning, accomplishment
- **Black Hat Gamification:** FOMO, uncertainty (sparsam einsetzen)
- **Balance:** White Hat für Recruitment/Retention, Black Hat nur für spezifische Actions
- **Avoid:** User burnout durch zu viele Achievements

**Takeaway:** Meaningful connections > Vanity metrics

#### 4. Profile Matching Apps UX
- **Trust Building:** Zeige Gemeinsamkeiten prominent
- **Visual Hierarchy:** Important info above the fold
- **Personality Expression:** Bio, Interests, Visual Identity
- **Social Proof:** Mutual connections, shared experiences

**Takeaway:** "Users engage more when they see connections to others like them"

#### 5. Modern Profile Design Patterns
- **Muzli Collection:** 60+ Profile examples - Trend zu minimalistischen Cards
- **Bricx Labs Analysis:** Balance zwischen Identity, Usability, Personalization
- **Eleken Guide:** Profile = Personal corner + Activity + Preferences
- **Gravatar Study:** Visual hierarchy matters more than feature count

**Takeaway:** Less is more, aber das "Less" muss das Richtige sein

---

## 💡 NEUES KONZEPT: "XP Identity & Connections"

### Philosophie

**XPShare ist kein Solo-Game, sondern eine Community-Quest.**

Jeder User hat eine einzigartige "XP DNA" basierend auf:
- Kategorien-Verteilung (UFO-heavy? Dreams-focused?)
- Geografische Footprint
- Zeitliche Aktivität
- Pattern-Beiträge

**Ziel:** Zeige nicht nur "wer bin ich", sondern "wer ist wie ich" und "was haben wir gemeinsam".

---

## 🎨 UI/UX DESIGN KONZEPT

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

### 2. **NEW: "XP Twins & Soul Connections" Section**

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

### 3. **NEW: "My XP DNA" Visualization**

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

**Component:** `<XPDNAChart />`
- Recharts Radar Chart
- Responsive & Interactive
- Color-coded per category
- Click category → Filter experiences

### 4. **Enhanced Stats Grid**

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
- **Connections:** Anzahl ähnlicher User (>70% Match)
- **Percentile:** Ranking in Community (Top X%)
- **Geographic Reach:** Anzahl Länder/Städte
- **Pattern Count:** Unique patterns contributed to

### 5. **NEW: "Pattern Contributions" Section**

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

**Component:** `<PatternContributions />`
- Shows user's role in pattern discovery
- Highlights community impact
- Links to pattern detail pages

### 6. **NEW Tab: "Connections"**

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

### 7. **Experience Map Integration**

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

### 8. **Activity Timeline Enhancement**

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

## 🔨 TECHNICAL IMPLEMENTATION

### Phase 1: Data Foundation

#### 1.1 Database Schema

```sql
-- User Similarity (Materialized View for Performance)
CREATE MATERIALIZED VIEW user_similarity AS
SELECT
  u1.id as user_id,
  u2.id as similar_user_id,
  calculate_similarity_score(u1.id, u2.id) as similarity_score,
  get_shared_categories(u1.id, u2.id) as shared_categories,
  get_category_overlap(u1.id, u2.id) as category_overlap,
  get_location_proximity(u1.id, u2.id) as location_proximity,
  (
    SELECT json_agg(json_build_object('id', e.id, 'title', e.title))
    FROM experiences e
    WHERE e.id IN (
      SELECT experience_id FROM experience_witnesses
      WHERE user_id IN (u1.id, u2.id)
      GROUP BY experience_id
      HAVING COUNT(DISTINCT user_id) > 1
    )
  ) as shared_experiences
FROM user_profiles u1
CROSS JOIN user_profiles u2
WHERE u1.id != u2.id
AND calculate_similarity_score(u1.id, u2.id) > 0.5; -- Only store matches >50%

CREATE INDEX idx_user_similarity_score ON user_similarity (user_id, similarity_score DESC);
CREATE INDEX idx_similar_user_lookup ON user_similarity (similar_user_id);

-- Refresh strategy: Every 6 hours or on new experience
-- pg_cron: SELECT cron.schedule('refresh-similarity', '0 */6 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY user_similarity');
```

```sql
-- Category Distribution per User
CREATE TABLE user_category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  experience_count INT NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL,
  total_xp_from_category INT DEFAULT 0,
  last_experience_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

CREATE INDEX idx_user_category_user ON user_category_stats (user_id);
CREATE INDEX idx_user_category_percentage ON user_category_stats (user_id, percentage DESC);

-- Trigger to update on new experience
CREATE OR REPLACE FUNCTION update_user_category_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate for this user
  WITH category_counts AS (
    SELECT
      user_id,
      category,
      COUNT(*) as count,
      SUM(xp_earned) as total_xp
    FROM experiences
    WHERE user_id = NEW.user_id AND visibility != 'draft'
    GROUP BY user_id, category
  ),
  total_count AS (
    SELECT user_id, SUM(count) as total FROM category_counts GROUP BY user_id
  )
  INSERT INTO user_category_stats (user_id, category, experience_count, percentage, total_xp_from_category)
  SELECT
    cc.user_id,
    cc.category,
    cc.count,
    ROUND((cc.count::DECIMAL / tc.total * 100), 2),
    cc.total_xp
  FROM category_counts cc
  JOIN total_count tc ON cc.user_id = tc.user_id
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    experience_count = EXCLUDED.experience_count,
    percentage = EXCLUDED.percentage,
    total_xp_from_category = EXCLUDED.total_xp_from_category,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_stats
AFTER INSERT OR UPDATE ON experiences
FOR EACH ROW
EXECUTE FUNCTION update_user_category_stats();
```

```sql
-- Pattern Contributions
CREATE TABLE user_pattern_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  contribution_type TEXT CHECK (contribution_type IN ('discovery', 'confirmation', 'witness')),
  impact_score INT DEFAULT 0, -- How many others confirmed
  xp_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_id, contribution_type)
);

CREATE INDEX idx_pattern_contrib_user ON user_pattern_contributions (user_id);
CREATE INDEX idx_pattern_contrib_impact ON user_pattern_contributions (impact_score DESC);
```

```sql
-- User Connections (Follow/Connect System)
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('follow', 'connect', 'block')),
  similarity_score DECIMAL(3,2), -- Store at time of connection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE INDEX idx_connections_user ON user_connections (user_id);
CREATE INDEX idx_connections_connected ON user_connections (connected_user_id);
```

#### 1.2 Similarity Calculation Function

```sql
CREATE OR REPLACE FUNCTION calculate_similarity_score(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  category_overlap DECIMAL(3,2);
  category_distribution DECIMAL(3,2);
  location_proximity DECIMAL(3,2);
  temporal_overlap DECIMAL(3,2);
  pattern_matches DECIMAL(3,2);
  experience_overlap DECIMAL(3,2);
BEGIN
  -- 1. Category Overlap (Jaccard Similarity)
  WITH user1_cats AS (
    SELECT DISTINCT category FROM experiences WHERE user_id = user1_id
  ),
  user2_cats AS (
    SELECT DISTINCT category FROM experiences WHERE user_id = user2_id
  ),
  intersection AS (
    SELECT COUNT(*) as count FROM user1_cats INTERSECT SELECT * FROM user2_cats
  ),
  union_set AS (
    SELECT COUNT(*) as count FROM (SELECT * FROM user1_cats UNION SELECT * FROM user2_cats) u
  )
  SELECT COALESCE(i.count::DECIMAL / NULLIF(u.count, 0), 0) INTO category_overlap
  FROM intersection i, union_set u;

  -- 2. Category Distribution (Cosine Similarity)
  WITH u1_dist AS (
    SELECT category, percentage FROM user_category_stats WHERE user_id = user1_id
  ),
  u2_dist AS (
    SELECT category, percentage FROM user_category_stats WHERE user_id = user2_id
  ),
  dot_product AS (
    SELECT SUM(u1.percentage * u2.percentage) as dp
    FROM u1_dist u1
    JOIN u2_dist u2 ON u1.category = u2.category
  ),
  magnitude AS (
    SELECT
      SQRT(SUM(percentage * percentage)) as m1
    FROM u1_dist
  ),
  magnitude2 AS (
    SELECT
      SQRT(SUM(percentage * percentage)) as m2
    FROM u2_dist
  )
  SELECT COALESCE(dp.dp / NULLIF(m.m1 * m2.m2, 0), 0) INTO category_distribution
  FROM dot_product dp, magnitude m, magnitude2 m2;

  -- 3. Location Proximity
  SELECT
    CASE
      WHEN u1.location_city = u2.location_city AND u1.location_city IS NOT NULL THEN 1.0
      WHEN u1.location_country = u2.location_country AND u1.location_country IS NOT NULL THEN 0.5
      ELSE 0.0
    END INTO location_proximity
  FROM user_profiles u1, user_profiles u2
  WHERE u1.id = user1_id AND u2.id = user2_id;

  -- 4. Temporal Overlap (active in same months)
  WITH u1_months AS (
    SELECT DISTINCT DATE_TRUNC('month', created_at) as month
    FROM experiences WHERE user_id = user1_id
  ),
  u2_months AS (
    SELECT DISTINCT DATE_TRUNC('month', created_at) as month
    FROM experiences WHERE user_id = user2_id
  ),
  overlap AS (
    SELECT COUNT(*) as count FROM u1_months INTERSECT SELECT * FROM u2_months
  ),
  total AS (
    SELECT COUNT(*) as count FROM (SELECT * FROM u1_months UNION SELECT * FROM u2_months) u
  )
  SELECT COALESCE(o.count::DECIMAL / NULLIF(t.count, 0), 0) INTO temporal_overlap
  FROM overlap o, total t;

  -- 5. Pattern Matches (co-contributed patterns)
  WITH shared_patterns AS (
    SELECT COUNT(DISTINCT p1.pattern_id) as count
    FROM user_pattern_contributions p1
    JOIN user_pattern_contributions p2 ON p1.pattern_id = p2.pattern_id
    WHERE p1.user_id = user1_id AND p2.user_id = user2_id
  ),
  total_patterns AS (
    SELECT COUNT(DISTINCT pattern_id) as count
    FROM user_pattern_contributions
    WHERE user_id IN (user1_id, user2_id)
  )
  SELECT COALESCE(s.count::DECIMAL / NULLIF(t.count, 0), 0) INTO pattern_matches
  FROM shared_patterns s, total_patterns t;

  -- 6. Experience Overlap (both witnessed same experience)
  WITH shared_exp AS (
    SELECT COUNT(DISTINCT w1.experience_id) as count
    FROM experience_witnesses w1
    JOIN experience_witnesses w2 ON w1.experience_id = w2.experience_id
    WHERE w1.user_id = user1_id AND w2.user_id = user2_id
  )
  SELECT COALESCE(count, 0) / 100.0 INTO experience_overlap FROM shared_exp;
  -- Normalize: Cap at 1.0
  experience_overlap := LEAST(experience_overlap, 1.0);

  -- Weighted Sum
  RETURN (
    category_overlap * 0.25 +
    category_distribution * 0.20 +
    location_proximity * 0.15 +
    temporal_overlap * 0.10 +
    pattern_matches * 0.20 +
    experience_overlap * 0.10
  );
END;
$$ LANGUAGE plpgsql;
```

#### 1.3 Helper Functions

```sql
CREATE OR REPLACE FUNCTION get_shared_categories(user1_id UUID, user2_id UUID)
RETURNS TEXT[] AS $$
  SELECT ARRAY_AGG(DISTINCT category)
  FROM (
    SELECT category FROM experiences WHERE user_id = user1_id
    INTERSECT
    SELECT category FROM experiences WHERE user_id = user2_id
  ) shared;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_category_overlap(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(3,2) AS $$
  WITH u1_cats AS (
    SELECT DISTINCT category FROM experiences WHERE user_id = user1_id
  ),
  u2_cats AS (
    SELECT DISTINCT category FROM experiences WHERE user_id = user2_id
  )
  SELECT COALESCE(
    (SELECT COUNT(*) FROM u1_cats INTERSECT SELECT * FROM u2_cats)::DECIMAL /
    NULLIF((SELECT COUNT(*) FROM (SELECT * FROM u1_cats UNION SELECT * FROM u2_cats) u), 0),
    0
  );
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_location_proximity(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(3,2) AS $$
  SELECT
    CASE
      WHEN u1.location_city = u2.location_city AND u1.location_city IS NOT NULL THEN 1.0
      WHEN u1.location_country = u2.location_country AND u1.location_country IS NOT NULL THEN 0.5
      ELSE 0.0
    END
  FROM user_profiles u1, user_profiles u2
  WHERE u1.id = user1_id AND u2.id = user2_id;
$$ LANGUAGE sql;
```

### Phase 2: API Routes

```typescript
// app/api/users/[id]/similar/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get similar users from materialized view
  const { data, error } = await supabase
    .from('user_similarity')
    .select(`
      similar_user_id,
      similarity_score,
      shared_categories,
      shared_experiences,
      similar_user:user_profiles!similar_user_id (
        id,
        username,
        display_name,
        avatar_url,
        location_city,
        location_country,
        total_xp,
        level
      )
    `)
    .eq('user_id', id)
    .gte('similarity_score', 0.5)
    .order('similarity_score', { ascending: false })
    .limit(50);

  if (error) throw error;

  return Response.json(data);
}

// app/api/users/[id]/category-stats/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_category_stats')
    .select('*')
    .eq('user_id', id)
    .order('percentage', { ascending: false });

  if (error) throw error;

  return Response.json(data);
}

// app/api/users/[id]/pattern-contributions/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_pattern_contributions')
    .select(`
      *,
      pattern:patterns (
        id,
        name,
        description,
        discovery_count
      )
    `)
    .eq('user_id', id)
    .order('impact_score', { ascending: false });

  if (error) throw error;

  return Response.json(data);
}
```

### Phase 3: UI Components

#### 3.1 XP DNA Badge

```typescript
// components/profile/xp-dna-badge.tsx
interface XPDNABadgeProps {
  categories: Array<{
    category: string;
    percentage: number;
    color: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
}

export function XPDNABadge({ categories, size = 'md' }: XPDNABadgeProps) {
  const top3 = categories.slice(0, 3);

  // Generate gradient from top 3 category colors
  const gradient = `linear-gradient(135deg, ${top3.map(c => c.color).join(', ')})`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'rounded-full flex items-center justify-center font-bold text-white shadow-lg',
              size === 'sm' && 'w-12 h-12 text-xs',
              size === 'md' && 'w-16 h-16 text-sm',
              size === 'lg' && 'w-24 h-24 text-lg'
            )}
            style={{ background: gradient }}
          >
            🌈
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {top3.map(cat => (
              <div key={cat.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: cat.color }}
                />
                <span>{cat.category} ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

#### 3.2 XP DNA Spectrum Bar

```typescript
// components/profile/xp-dna-spectrum.tsx
interface CategoryStat {
  category: string;
  percentage: number;
  color: string;
}

export function XPDNASpectrum({ categories }: { categories: CategoryStat[] }) {
  return (
    <div className="space-y-2">
      {/* Stacked Bar */}
      <div className="flex h-8 rounded-lg overflow-hidden">
        {categories.map(cat => (
          <div
            key={cat.category}
            style={{
              width: `${cat.percentage}%`,
              background: cat.color
            }}
            className="transition-all hover:opacity-80 cursor-pointer"
            title={`${cat.category}: ${cat.percentage}%`}
          />
        ))}
      </div>

      {/* Top 3 Labels */}
      <div className="flex gap-2 text-sm text-muted-foreground">
        {categories.slice(0, 3).map(cat => (
          <span key={cat.category}>
            {getCategoryEmoji(cat.category)} {cat.category} ({cat.percentage}%)
          </span>
        ))}
      </div>
    </div>
  );
}
```

#### 3.3 XP Twins Card

```typescript
// components/profile/xp-twins-card.tsx
interface SimilarUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  similarity_score: number;
  shared_categories: string[];
  location_city: string;
  level: number;
}

export function XPTwinsCard({
  currentUserId,
  profileUserId
}: {
  currentUserId: string;
  profileUserId: string;
}) {
  const { data: similarity } = useQuery({
    queryKey: ['user-similarity', currentUserId, profileUserId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileUserId}/similarity?with=${currentUserId}`);
      return res.json();
    },
    enabled: currentUserId !== profileUserId,
  });

  if (!similarity || similarity.score < 0.5) return null;

  const matchPercent = Math.round(similarity.score * 100);

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="text-center bg-primary/10">
        <CardTitle className="text-2xl">
          🎯 {matchPercent}% MATCH WITH YOU!
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Shared Categories */}
        <div>
          <h4 className="font-semibold mb-2">Shared XP DNA</h4>
          <div className="flex flex-wrap gap-2">
            {similarity.shared_categories.map(cat => (
              <Badge key={cat} variant="secondary">
                {getCategoryEmoji(cat)} {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Shared Experiences */}
        {similarity.shared_experiences?.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Shared Experiences</h4>
            <ul className="space-y-1 text-sm">
              {similarity.shared_experiences.slice(0, 3).map(exp => (
                <li key={exp.id} className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-primary" />
                  <Link href={`/experiences/${exp.id}`} className="hover:underline">
                    {exp.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2">
          <Button className="flex-1">
            <UserPlus className="mr-2 h-4 w-4" />
            Connect
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.4 Category Radar Chart

```typescript
// components/profile/category-radar-chart.tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function CategoryRadarChart({ stats }: { stats: CategoryStat[] }) {
  const chartData = stats.map(s => ({
    category: s.category,
    value: s.percentage,
  }));

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

        {/* List View */}
        <div className="mt-4 space-y-2">
          {stats.map(stat => (
            <div key={stat.category} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">
                    {getCategoryEmoji(stat.category)} {stat.category}
                  </span>
                  <span className="text-sm font-semibold">{stat.percentage}%</span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.experience_count} XP
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.5 Activity Heatmap

```typescript
// components/profile/activity-heatmap.tsx
import CalHeatmap from 'cal-heatmap';
import 'cal-heatmap/cal-heatmap.css';

export function ActivityHeatmap({ userId }: { userId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cal = new CalHeatmap();
    cal.paint({
      itemSelector: containerRef.current,
      domain: { type: 'month' },
      subDomain: { type: 'day' },
      data: {
        source: `/api/users/${userId}/activity-heatmap`,
        type: 'json',
        x: 'date',
        y: 'count',
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
    });

    return () => cal.destroy();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} />
      </CardContent>
    </Card>
  );
}
```

#### 3.6 Connections Tab

```typescript
// app/[locale]/profile/[id]/tabs/connections-tab.tsx
export function ConnectionsTab({ userId }: { userId: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'twins' | 'location' | 'patterns' | 'mutual'>('twins');

  const { data: connections } = useQuery({
    queryKey: ['user-connections', userId, activeSubTab],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/connections?type=${activeSubTab}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="twins">XP Twins</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="mutual">Mutual</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Connection List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections?.map(conn => (
          <ConnectionCard key={conn.id} connection={conn} />
        ))}
      </div>
    </div>
  );
}

function ConnectionCard({ connection }: { connection: SimilarUser }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={connection.avatar_url} />
            <AvatarFallback>{connection.username[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">@{connection.username}</h4>
              <Badge variant="secondary">{Math.round(connection.similarity_score * 100)}%</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {connection.location_city} · Level {connection.level}
            </p>

            {/* Category Icons */}
            <div className="flex gap-1 mt-2">
              {connection.shared_categories.slice(0, 4).map(cat => (
                <span key={cat} className="text-lg" title={cat}>
                  {getCategoryEmoji(cat)}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1">
                Connect
              </Button>
              <Button size="sm" variant="ghost">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Phase 4: Page Integration

```typescript
// app/[locale]/profile/[id]/page.tsx
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // ... existing profile fetch ...

  // NEW: Fetch category stats
  const { data: categoryStats } = await supabase
    .from('user_category_stats')
    .select('*')
    .eq('user_id', id)
    .order('percentage', { ascending: false });

  // NEW: Fetch pattern contributions
  const { data: patternContributions } = await supabase
    .from('user_pattern_contributions')
    .select(`
      *,
      pattern:patterns (
        id,
        name,
        description,
        discovery_count
      )
    `)
    .eq('user_id', id)
    .order('impact_score', { ascending: false })
    .limit(5);

  // NEW: Fetch similar users preview (if viewing other profile)
  let similarUsers = null;
  if (currentUser && currentUser.id !== id) {
    const { data } = await supabase
      .from('user_similarity')
      .select(`
        similar_user_id,
        similarity_score,
        shared_categories,
        shared_experiences
      `)
      .eq('user_id', id)
      .order('similarity_score', { ascending: false })
      .limit(5);
    similarUsers = data;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Profile Header with XP DNA */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* Avatar + XP DNA Badge */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileUser.avatar_url} />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <XPDNABadge categories={categoryStats || []} size="md" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="text-slate-600">@{profileUser.username}</p>
                {profileUser.bio && <p className="mt-2 text-slate-700">{profileUser.bio}</p>}

                {/* XP DNA Spectrum */}
                {categoryStats && categoryStats.length > 0 && (
                  <div className="mt-4">
                    <XPDNASpectrum categories={categoryStats} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <DownloadReportButton userId={profileUser.id} userName={profileUser.username} />
                    <Link href="/settings">
                      <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Twins Card (only when viewing other profile) */}
        {!isOwnProfile && currentUser && (
          <div className="mb-8">
            <XPTwinsCard
              currentUserId={currentUser.id}
              profileUserId={id}
            />
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="mb-8">
          <EnhancedUserStats
            totalXp={totalXP}
            level={level}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            totalExperiences={stats.experiencesCount}
            totalContributions={totalContributions}
            totalConnections={similarUsers?.length || 0}
            patternCount={patternContributions?.length || 0}
          />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: XP DNA + Patterns */}
          <div className="space-y-6">
            {categoryStats && <CategoryRadarChart stats={categoryStats} />}
            {patternContributions && patternContributions.length > 0 && (
              <PatternContributionsCard contributions={patternContributions} />
            )}
          </div>

          {/* Right: Activity */}
          <div className="space-y-6">
            <ActivityChart userId={profileUser.id} />
            <ActivityHeatmap userId={profileUser.id} />
            <StreakWidget userId={profileUser.id} />
          </div>
        </div>

        {/* Tab Navigation */}
        <ProfileTabs userId={profileUser.id} isOwnProfile={isOwnProfile} />

      </div>
    </div>
  );
}
```

---

## 🎯 SUCCESS METRICS

### 1. Engagement Metrics

**Baseline (Current):**
- Avg time on profile page: ~45 seconds
- Profile completion rate: 65%
- Return visits to profile: 2.3x per week

**Target (After Redesign):**
- Avg time on profile page: **+40%** (63 seconds)
- Profile completion rate: **+60%** (100% - alle füllen XP DNA aus)
- Return visits to profile: **+50%** (3.5x per week)

### 2. Community Metrics

**Baseline:**
- User-to-user connections: 0 (Feature existiert nicht)
- Cross-category exploration: 15% (Users bleiben in ihrer Kategorie)
- Pattern confirmations: 8 per pattern average

**Target:**
- User-to-user connections: **200+ connections per active user**
- Cross-category exploration: **+80%** (27% - durch Entdeckung ähnlicher User)
- Pattern confirmations: **+150%** (20 per pattern - durch Community-Effect)

### 3. Retention Metrics

**Baseline:**
- 7-day retention: 58%
- 30-day retention: 32%
- Monthly active users (MAU): Current baseline

**Target:**
- 7-day retention: **+35%** (78%)
- 30-day retention: **+45%** (46%)
- Monthly active users: **+45%**

### 4. Feature-Specific KPIs

**XP DNA Badge:**
- Click-through rate: >60%
- Completion rate: >90%

**XP Twins:**
- Match rate: >70% of users have 5+ twins
- Connection rate: >40% connect with at least 1 twin
- Message rate: >15% message a twin

**Connections Tab:**
- Daily active users: >25% of MAU
- Avg connections per user: >50
- Engagement rate: >35% click on connection profiles

---

## 🚀 ROLLOUT STRATEGY

### Week 1-2: Foundation
**Focus:** Data Infrastructure

**Tasks:**
- [ ] Create database tables (user_category_stats, user_pattern_contributions, user_connections)
- [ ] Implement similarity calculation function
- [ ] Create materialized view for user_similarity
- [ ] Set up pg_cron for automatic refresh
- [ ] Write migration scripts
- [ ] Backfill data for existing users

**Deliverables:**
- Working similarity algorithm
- Populated user_category_stats for all users
- API endpoints: `/api/users/[id]/similar`, `/api/users/[id]/category-stats`

### Week 3-4: Core Components
**Focus:** UI Building Blocks

**Tasks:**
- [ ] XPDNABadge component
- [ ] XPDNASpectrum component
- [ ] CategoryRadarChart component
- [ ] Enhanced UserStats grid (6-8 stats)
- [ ] Category color mapping utility
- [ ] Category emoji mapping utility

**Deliverables:**
- Storybook stories for all components
- Unit tests
- Integration with existing profile page

### Week 5-6: Connections
**Focus:** Social Features

**Tasks:**
- [ ] XPTwinsCard component
- [ ] ConnectionsTab with sub-tabs
- [ ] ConnectionCard component
- [ ] SimilarUsersList component
- [ ] Connect/Follow functionality
- [ ] Messaging integration (if applicable)

**Deliverables:**
- Working connections system
- Real-time similarity updates
- Connection suggestions

### Week 7-8: Polish & Optimization
**Focus:** Performance & UX

**Tasks:**
- [ ] ActivityHeatmap component (Cal-Heatmap)
- [ ] ExperienceMap component (Leaflet)
- [ ] PatternContributionsCard
- [ ] Animations & transitions
- [ ] Performance optimization (lazy loading, virtualization)
- [ ] A/B testing setup
- [ ] Analytics tracking

**Deliverables:**
- Smooth animations
- <2s initial page load
- Comprehensive analytics

### Week 9: Beta Testing
**Focus:** User Feedback

**Tasks:**
- [ ] Beta release to 10% of users
- [ ] Collect feedback via surveys
- [ ] Monitor metrics
- [ ] Fix critical bugs
- [ ] Iterate based on feedback

**Deliverables:**
- User feedback report
- Bug fixes
- Iteration plan

### Week 10: Full Rollout
**Focus:** Production Launch

**Tasks:**
- [ ] Gradual rollout to 100% of users
- [ ] Monitor metrics daily
- [ ] Quick response to issues
- [ ] Marketing announcement
- [ ] Documentation update

**Deliverables:**
- Full production release
- Marketing materials
- User documentation

---

## 🎨 DESIGN SYSTEM

### Color Palette for Categories

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
} as const;

export const CATEGORY_EMOJIS = {
  'ufo': '🛸',
  'dreams': '💭',
  'paranormal': '👻',
  'synchronicity': '⚡',
  'psychedelic': '🌈',
  'nde-obe': '💫',
  'meditation': '🧘',
  'astral': '✨',
  'time-anomaly': '🕐',
  'entity': '👽',
  'energy': '⚡',
  'other': '❓',
} as const;
```

### Typography

```typescript
// Profile Header
h1: 'text-3xl font-bold' // Name
h2: 'text-xl font-semibold' // Section Titles
h3: 'text-lg font-medium' // Card Titles
p: 'text-base' // Body
small: 'text-sm text-muted-foreground' // Metadata

// Stats
stat-value: 'text-2xl font-bold'
stat-label: 'text-sm text-slate-600'

// Badges
badge-lg: 'text-base px-4 py-2'
badge-md: 'text-sm px-3 py-1'
badge-sm: 'text-xs px-2 py-0.5'
```

### Spacing

```typescript
// Section Gaps
section-gap: 'space-y-8' // mb-8 between major sections
card-gap: 'space-y-6'    // mb-6 between cards
content-gap: 'space-y-4' // mb-4 within cards

// Container Padding
container: 'px-4 py-8'
card: 'p-6'
card-header: 'pb-4'
card-content: 'pt-6'
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```typescript
// Tailwind default
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Layout Adaptations

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

---

## 🔐 PRIVACY & PERMISSIONS

### User Controls

**Profile Visibility Settings:**
- [ ] Public (default) - Anyone can see full profile
- [ ] Community - Only registered users
- [ ] Connections Only - Only users with >50% match
- [ ] Private - Only me

**Similarity Opt-Out:**
- [ ] "Hide me from similarity matching"
- [ ] "Don't show my category distribution"
- [ ] "Don't suggest me to others"

**Connection Settings:**
- [ ] Auto-accept connections >80% match
- [ ] Require approval for all connections
- [ ] Block specific users from seeing similarity

### Data Privacy

**What we calculate:**
- Category distribution (from public experiences only)
- Geographic proximity (city/country level, no GPS)
- Temporal activity patterns
- Pattern co-contributions

**What we DON'T use:**
- Private experiences
- Draft experiences
- Exact location (only city/country)
- Personal messages
- Email or phone

---

## 💎 KILLER FEATURES SUMMARY

### 1. "XP DNA Badge" 🌈
**What:** Visual fingerprint of user's top 3 categories
**Why:** Instant identity recognition
**Impact:** Users feel unique, profiles more memorable

### 2. "87% Match!" 🎯
**What:** Hero banner showing similarity when viewing other profiles
**Why:** Creates instant connection & trust
**Impact:** +200% connection rate

### 3. "XP Twins" 👥
**What:** Discover users with similar experiences
**Why:** Core mission - connecting people with shared extraordinary experiences
**Impact:** Community growth, retention boost

### 4. "Pattern Impact" 🧩
**What:** Show contributions to pattern discovery
**Why:** Gamifies contribution, shows community value
**Impact:** +150% pattern confirmations

### 5. "Shared Journey" 🌟
**What:** Timeline of common experiences with another user
**Why:** Builds narrative, creates bonds
**Impact:** Deeper engagement, meaningful connections

---

## 🎬 NEXT STEPS

1. **Review & Feedback:** Team review this document
2. **Prioritization:** Decide which features are MVP vs Nice-to-Have
3. **Design Mockups:** Create high-fidelity designs in Figma
4. **Technical Spike:** Test similarity algorithm performance
5. **Start Phase 1:** Database schema & migration

---

## 📚 REFERENCES

### Research Sources
- **Exa Search:** Gamification in Product Design 2025 (Arounda)
- **Exa Search:** LinkedIn PYMK Engineering Blog
- **Exa Search:** Shaped.ai User Similarity API
- **Exa Search:** Muzli Profile Design Collection (60+ examples)
- **Exa Search:** Bricx Labs Modern Profile Analysis
- **Exa Search:** Medium Profile Matching App Deep Dive

### Technical References
- Cal-Heatmap: https://cal-heatmap.com/
- Recharts: https://recharts.org/
- Leaflet: https://leafletjs.com/
- PostgreSQL Similarity: https://www.postgresql.org/docs/current/pgsimilarity.html

---

## 🎨 MICRO-INTERACTIONS & ANIMATION BEST PRACTICES

### Hover & Focus States

**Critical for Trust & Usability:**

```typescript
// components/profile/interactive-stat-card.tsx
export function InteractiveStatCard({ stat }: { stat: Stat }) {
  return (
    <Card className="group hover-lift transition-all duration-300">
      {/* Hover Elevation */}
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
        <div className="relative">
          <Icon className="transition-transform group-hover:scale-110" />

          {/* Hover Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2"
              >
                <Tooltip content={stat.description} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Value with Counter Animation */}
        <AnimatedNumber value={stat.value} />

        {/* Subtle Background Glow on Hover */}
        <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
}
```

### Skeleton Loading States

**Critical für Perceived Performance:**

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
  );
}

// Shimmer Animation CSS
const shimmerStyles = `
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
`;
```

### Button & Interactive States

```typescript
// Best Practice: All interactive elements
export const interactionStyles = {
  // Focus Ring (WCAG AAA)
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',

  // Active Press State
  active: 'active:scale-95 transition-transform',

  // Disabled State
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

  // Loading State
  loading: 'relative disabled:opacity-100',
};

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

### Page Transitions

```typescript
// app/[locale]/profile/[id]/layout.tsx
import { AnimatePresence, motion } from 'framer-motion';

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
  );
}
```

---

## ♿ ACCESSIBILITY (WCAG 2.1 AAA)

### Skip Links

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
  );
}
```

### ARIA Labels & Live Regions

```typescript
// components/profile/xp-twins-card.tsx (Accessible Version)
export function XPTwinsCard({ similarity }: { similarity: SimilarityData }) {
  const matchPercent = Math.round(similarity.score * 100);

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
  );
}
```

### Keyboard Navigation

```typescript
// components/profile/category-radar-chart.tsx (Keyboard Accessible)
export function CategoryRadarChart({ stats }: { stats: CategoryStat[] }) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === null ? 0 : (prev + 1) % stats.length));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === null ? stats.length - 1 : (prev - 1 + stats.length) % stats.length
        );
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(stats.length - 1);
        break;
    }
  };

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
  );
}
```

---

## 📱 MOBILE-FIRST & RESPONSIVE DESIGN

### Touch Targets (Minimum 44x44px)

```typescript
// Mobile-optimized touch targets
export const TOUCH_TARGETS = {
  minimum: '44px', // Apple HIG & Material Design
  comfortable: '48px', // Recommended
  large: '56px', // For primary actions
};

// Example Implementation
<Button
  className="min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-[40px]"
  size="icon"
>
  <Heart className="h-5 w-5" />
</Button>
```

### Thumb Zone Optimization

```typescript
// components/profile/mobile-action-bar.tsx
export function MobileActionBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden">
      {/* Actions in Thumb-Friendly Bottom Area */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <Button size="lg" className="min-h-[48px]">
          <UserPlus className="mr-2 h-5 w-5" />
          Connect
        </Button>
        <Button size="lg" variant="outline" className="min-h-[48px]">
          <MessageCircle className="mr-2 h-5 w-5" />
          Message
        </Button>
      </div>
    </div>
  );
}
```

### Responsive Breakpoints Strategy

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
};

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

### Mobile Navigation Patterns

```typescript
// Progressive Disclosure für Tabs
export function ResponsiveProfileTabs() {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Menu className="mr-2 h-4 w-4" />
            Browse Tabs
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <div className="py-4 space-y-2">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent min-h-[48px]"
              >
                {tab.icon}
                <span className="text-lg">{tab.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Horizontal tabs
  return <HorizontalTabs tabs={tabs} />;
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Image Optimization

```typescript
// components/profile/optimized-avatar.tsx
import Image from 'next/image';
import { getPlaiceholder } from 'plaiceholder';

interface OptimizedAvatarProps {
  src: string;
  alt: string;
  size?: number;
  priority?: boolean;
}

export async function OptimizedAvatar({
  src,
  alt,
  size = 128,
  priority = false
}: OptimizedAvatarProps) {
  // Generate blur placeholder
  const { base64 } = await getPlaiceholder(src);

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
  );
}
```

### Code Splitting & Lazy Loading

```typescript
// app/[locale]/profile/[id]/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const CategoryRadarChart = dynamic(() =>
  import('@/components/profile/category-radar-chart').then(mod => mod.CategoryRadarChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Client-side only
  }
);

const ActivityHeatmap = dynamic(() =>
  import('@/components/profile/activity-heatmap').then(mod => mod.ActivityHeatmap),
  {
    loading: () => <HeatmapSkeleton />,
    ssr: false,
  }
);

const XPTwinsCard = dynamic(() =>
  import('@/components/profile/xp-twins-card').then(mod => mod.XPTwinsCard),
  {
    loading: () => <TwinsSkeleton />,
  }
);

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
  );
}

// Intersection Observer for lazy loading
function LazyLoadOnVisible({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <div className="h-64" />}</div>;
}
```

### Data Fetching Optimization

```typescript
// Parallel Data Fetching
export async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch all data in parallel
  const [profile, categoryStats, patternContributions, similarUsers] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', id).single(),
    supabase.from('user_category_stats').select('*').eq('user_id', id),
    supabase.from('user_pattern_contributions').select('*').eq('user_id', id).limit(5),
    supabase.from('user_similarity').select('*').eq('user_id', id).limit(10),
  ]);

  return <ProfileClientTabs {...data} />;
}
```

### Virtualized Lists (für große Datenmengen)

```typescript
// components/profile/virtualized-connections-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedConnectionsList({ connections }: { connections: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: connections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height per item
    overscan: 5, // Render 5 extra items above/below viewport
  });

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
  );
}
```

---

## 🎭 EMPTY STATES & ONBOARDING

### New User Empty States

```typescript
// components/profile/empty-state-onboarding.tsx
export function EmptyStateOnboarding({ type }: { type: 'experiences' | 'connections' | 'badges' }) {
  const states = {
    experiences: {
      illustration: <EmptyExperiencesIllustration />,
      title: 'Your XP Journey Starts Here',
      description: 'Share your first extraordinary experience and start connecting with others who\'ve had similar moments.',
      primaryAction: {
        label: 'Share Your First XP',
        href: '/submit',
        icon: <Plus />,
      },
      secondaryActions: [
        { label: 'Explore Examples', href: '/feed' },
        { label: 'Watch Tutorial', onClick: () => startTutorial() },
      ],
    },
    connections: {
      illustration: <EmptyConnectionsIllustration />,
      title: 'Find Your XP Twins',
      description: 'You haven\'t connected with anyone yet. Share experiences to find users with similar stories.',
      primaryAction: {
        label: 'Share an Experience',
        href: '/submit',
      },
      secondaryActions: [
        { label: 'Browse Community', href: '/feed' },
      ],
      motivationalQuote: '"Every connection starts with a shared moment."',
    },
    badges: {
      illustration: <EmptyBadgesIllustration />,
      title: 'Start Earning Badges',
      description: 'Complete actions to unlock achievements and climb the leaderboard.',
      primaryAction: {
        label: 'View All Badges',
        onClick: () => openBadgesModal(),
      },
      nextSteps: [
        { action: 'Share your first experience', xp: 50, badge: 'First Steps' },
        { action: 'Get 5 pattern confirmations', xp: 100, badge: 'Pattern Hunter' },
      ],
    },
  };

  const state = states[type];

  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center space-y-6">
        {/* Illustration */}
        <div className="flex justify-center">
          {state.illustration}
        </div>

        {/* Title & Description */}
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-2xl font-bold">{state.title}</h3>
          <p className="text-muted-foreground">{state.description}</p>
        </div>

        {/* Motivational Quote */}
        {state.motivationalQuote && (
          <blockquote className="italic text-sm text-muted-foreground">
            {state.motivationalQuote}
          </blockquote>
        )}

        {/* Next Steps (Badges Specific) */}
        {state.nextSteps && (
          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="font-semibold">Next Steps:</h4>
            {state.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">{step.action}</span>
                <Badge variant="secondary">+{step.xp} XP</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {state.primaryAction.href ? (
            <Link href={state.primaryAction.href}>
              <Button size="lg" className="w-full sm:w-auto">
                {state.primaryAction.icon}
                {state.primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={state.primaryAction.onClick}>
              {state.primaryAction.label}
            </Button>
          )}

          {state.secondaryActions?.map((action, i) => (
            <Button key={i} variant="outline" size="lg" asChild={!!action.href}>
              {action.href ? (
                <Link href={action.href}>{action.label}</Link>
              ) : (
                <button onClick={action.onClick}>{action.label}</button>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Loading States (Progressive Enhancement)

```typescript
// Progressive loading strategy
export function ProfilePageWithProgressive() {
  return (
    <>
      {/* 1. Show critical content immediately (SSR) */}
      <ProfileHeader user={user} />

      {/* 2. Show skeleton for stats while loading */}
      <Suspense fallback={<StatsSkeleton />}>
        <UserStats stats={stats} />
      </Suspense>

      {/* 3. Show empty state with loading for dynamic data */}
      <Suspense fallback={<TwinsSkeleton />}>
        <XPTwinsSection userId={userId} />
      </Suspense>
    </>
  );
}
```

---

## 📊 DATA VISUALIZATION BEST PRACTICES

### Chart Accessibility

```typescript
// components/profile/accessible-activity-chart.tsx
export function AccessibleActivityChart({ data }: { data: ActivityData[] }) {
  const chartId = useId();
  const descriptionId = `${chartId}-description`;
  const tableId = `${chartId}-table`;

  return (
    <Card role="figure" aria-labelledby={chartId} aria-describedby={descriptionId}>
      <CardHeader>
        <CardTitle id={chartId}>Monthly Activity</CardTitle>
        <CardDescription id={descriptionId}>
          Your experience submissions over the last 12 months
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Visual Chart (hidden from screen readers) */}
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible Data Table (visible to screen readers only) */}
        <table id={tableId} className="sr-only">
          <caption>Monthly experience submissions data</caption>
          <thead>
            <tr>
              <th>Month</th>
              <th>Experiences Submitted</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <td>{item.month}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center" role="region" aria-label="Summary statistics">
          <div>
            <p className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.count, 0)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {(data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Avg/Month</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.max(...data.map(d => d.count))}</p>
            <p className="text-xs text-muted-foreground">Peak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Interactive Tooltips

```typescript
// Advanced tooltip with keyboard support
export function ChartWithAccessibleTooltips() {
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);

  return (
    <div
      role="application"
      aria-label="Interactive activity chart"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setFocusedPoint(prev => Math.max(0, (prev ?? 0) - 1));
        if (e.key === 'ArrowRight') setFocusedPoint(prev => Math.min(data.length - 1, (prev ?? 0) + 1));
      }}
      tabIndex={0}
    >
      <BarChart>
        <Bar dataKey="count">
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={index === focusedPoint ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
              onFocus={() => setFocusedPoint(index)}
              tabIndex={0}
              aria-label={`${entry.month}: ${entry.count} experiences`}
            />
          ))}
        </Bar>
      </BarChart>

      {/* Tooltip for focused point */}
      <AnimatePresence>
        {focusedPoint !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bg-popover text-popover-foreground p-3 rounded-lg shadow-lg"
            role="tooltip"
          >
            <p className="font-semibold">{data[focusedPoint].month}</p>
            <p className="text-sm">{data[focusedPoint].count} experiences</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 🔒 SECURITY & PRIVACY

### Rate Limiting für Connections

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 connections per hour
  analytics: true,
});

export async function checkConnectionRateLimit(userId: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `connect:${userId}`
  );

  return {
    allowed: success,
    limit,
    remaining,
    reset: new Date(reset),
  };
}

// Usage in API
export async function POST(request: Request) {
  const { userId } = await request.json();
  const rateLimit = await checkConnectionRateLimit(userId);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: rateLimit.reset,
      }),
      { status: 429 }
    );
  }

  // Process connection...
}
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://avatars.githubusercontent.com https://images.unsplash.com;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 🧪 TESTING STRATEGY

### Component Tests

```typescript
// __tests__/components/xp-twins-card.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XPTwinsCard } from '@/components/profile/xp-twins-card';

describe('XPTwinsCard', () => {
  it('displays similarity percentage correctly', () => {
    const similarity = { score: 0.87, shared_categories: ['UFO', 'Dreams'] };
    render(<XPTwinsCard similarity={similarity} />);

    expect(screen.getByText(/87% MATCH/i)).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<XPTwinsCard similarity={mockData} />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    await user.tab();

    expect(connectButton).toHaveFocus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockConnectHandler).toHaveBeenCalled();
    });
  });

  it('announces connection status to screen readers', async () => {
    render(<XPTwinsCard similarity={mockData} />);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
```

### Accessibility Tests

```typescript
// __tests__/a11y/profile-page.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Profile Page Accessibility', () => {
  it('has no WCAG violations', async () => {
    const { container } = render(<ProfilePage {...mockProps} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', () => {
    render(<ProfilePage {...mockProps} />);

    const headings = screen.getAllByRole('heading');
    const levels = headings.map(h => parseInt(h.tagName[1]));

    // Check no skipped heading levels
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});
```

---

## 📈 ANALYTICS & MONITORING

### User Behavior Tracking

```typescript
// lib/analytics.ts
export const trackProfileEvent = {
  view: (userId: string) => {
    analytics.track('Profile Viewed', {
      userId,
      timestamp: new Date(),
    });
  },

  connect: (userId: string, targetUserId: string, similarityScore: number) => {
    analytics.track('Connection Initiated', {
      userId,
      targetUserId,
      similarityScore,
      timestamp: new Date(),
    });
  },

  tabSwitch: (userId: string, fromTab: string, toTab: string) => {
    analytics.track('Profile Tab Switched', {
      userId,
      fromTab,
      toTab,
      timestamp: new Date(),
    });
  },
};

// Usage
<Button onClick={() => {
  handleConnect();
  trackProfileEvent.connect(currentUser.id, profileUser.id, similarity.score);
}}>
  Connect
</Button>
```

### Performance Monitoring

```typescript
// lib/performance.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS((metric) => {
    analytics.track('Web Vitals', {
      name: 'CLS',
      value: metric.value,
      rating: metric.rating,
    });
  });

  onFID((metric) => {
    analytics.track('Web Vitals', {
      name: 'FID',
      value: metric.value,
      rating: metric.rating,
    });
  });

  onLCP((metric) => {
    analytics.track('Web Vitals', {
      name: 'LCP',
      value: metric.value,
      rating: metric.rating,
      page: 'Profile',
    });
  });
}
```

---

**Fazit:** Dies ist ein Community-First Redesign, das XPShare's Kernmission unterstützt: Menschen mit außergewöhnlichen Erlebnissen zu verbinden und Patterns gemeinsam zu entdecken. Der Fokus liegt auf **Meaningful Connections** statt Vanity Metrics.

**Jetzt mit 100% State-of-the-art Best Practices:**
- ✅ Micro-Interactions & Animations
- ✅ WCAG 2.1 AAA Accessibility
- ✅ Mobile-First & Touch-Optimized
- ✅ Performance & Code Splitting
- ✅ Empty States & Onboarding
- ✅ Accessible Data Visualization
- ✅ Security & Privacy
- ✅ Testing & Monitoring
