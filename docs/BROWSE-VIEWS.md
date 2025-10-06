# Browse-Views - Vollständige Spezifikation

## 🎯 Ziel

**Discovery-System für Experiences** - Wie User Inhalte entdecken, filtern und durchsuchen.

### Kern-Anforderungen:
- ✅ **Multiple-Views** (Cards, List, Map, Timeline)
- ✅ **Advanced-Search** (Filters, Cmd+K-Palette)
- ✅ **Performance** (Virtualization, Infinite-Scroll)
- ✅ **Responsive** (Desktop + Mobile adaptiert)
- ✅ **Accessibility** (Keyboard-Nav, Screen-Reader)
- ✅ **Pattern-Discovery** (Clustering-Visualizations)

---

## 📊 View-Übersicht

```
4 Haupt-Views:
├── 1. FEED-VIEW         (Homepage, Trending, Following)
├── 2. SEARCH-VIEW       (Instant-Search, Filters, Cmd+K)
├── 3. CATEGORY-VIEW     (Browse by Category)
└── 4. PROFILE-VIEW      (User's Experiences)

4 Visualisierungs-Modi (für alle Views):
├── 🎴 Cards-View        (Bento-Grid, Default)
├── 📝 List-View         (Compact-Table)
├── 🗺️ Map-View          (Geographic-Clustering)
└── ⏱️ Timeline-View     (Chronological)
```

---

## 🏠 VIEW 1: FEED (Homepage)

### **Desktop-Layout**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (Full-Width, Sticky)                                             │
│ 🧭 XP-Share    [🔍 Search (Cmd+K)]    [@username] 🔔 ⚙️                │
├───────────────┬─────────────────────────────────────────┬───────────────┤
│               │                                         │               │
│ LEFT-NAV      │   MAIN-FEED                            │  RIGHT-PANEL  │
│ (240px)       │   (Flexible, max 900px)                │  (340px)      │
│               │                                         │               │
│ 🏠 Home       │   ┌─ Feed-Controls ─────────────────┐  │  🔥 Trending  │
│ 🔥 Trending   │   │ [🎴 Cards] 📝 List 🗺️ Map ⏱️  │  │               │
│ ➕ Submit     │   │                                  │  │  ┌──────────┐│
│               │   │ Sort: [🆕 Newest] ▼             │  │  │ #1       ││
│ ━━━━━━━━━━━━  │   └──────────────────────────────────┘  │  │ UFO Wave ││
│               │                                         │  │ 234 XP   ││
│ 📂 Categories │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │ [View →] ││
│               │                                         │  └──────────┘│
│ ☑ UFO (234)   │   🎴 Bento-Grid Layout                  │               │
│ □ Paranormal  │                                         │  ┌──────────┐│
│ □ Träume      │   ┌──────────┐ ┌──────────┐           │  │ #2       ││
│ □ Psyched...  │   │  Card 1  │ │  Card 2  │           │  │ Solar-   ││
│ [+7 more ▼]   │   │          │ │          │           │  │ Storm    ││
│               │   │ [Image]  │ │ [Image]  │           │  │ 156 XP   ││
│ ━━━━━━━━━━━━  │   │          │ │          │           │  └──────────┘│
│               │   │ "UFO am  │ │ "Geist   │           │               │
│ 📍 Location   │   │  See"    │ │  im Haus"│           │  📊 Patterns  │
│ [Radius-Slid.]│   │          │ │          │           │               │
│ 50km          │   │ @user1   │ │ @user2   │           │  ┌──────────┐│
│               │   │ 👍 12 💬 5│ │ 👍 8  💬 3│           │  │ [Chart]  ││
│ ━━━━━━━━━━━━  │   └──────────┘ └──────────┘           │  │ Peak:    ││
│               │                                         │  │ 15. März ││
│ 🕐 Date-Range │   ┌───────────────────┐                │  └──────────┘│
│ [Last 30 Days]│   │     Card 3        │                │               │
│               │   │     [Image]       │  ← Variable    │  💡 AI-Insight│
│ ━━━━━━━━━━━━  │   │     "Traum..."    │    Size!      │  "15 XP mit  │
│               │   │     @user3        │                │   Solar-     │
│ [Clear All]   │   │     👍 23  💬 12   │                │   Korrelation│
│               │   └───────────────────┘                │   gefunden"  │
│               │                                         │               │
│               │   ┌──────────┐ ┌──────────┐           │  [Explore →] │
│               │   │  Card 4  │ │  Card 5  │           │               │
│               │   └──────────┘ └──────────┘           │               │
│               │                                         │               │
│               │   [Infinite-Scroll-Trigger]             │               │
│               │   [Loading-Spinner...]                  │               │
│               │                                         │               │
└───────────────┴─────────────────────────────────────────┴───────────────┘
```

### **Feed-Tabs**

#### **Tab 1: For You (Default)**
```typescript
// Personalisierter Feed (AI-gesteuert)
const forYouFeed = {
  algorithm: 'hybrid',
  factors: [
    'user_interests',      // Kategorien die User mag
    'similar_to_liked',    // Ähnlich zu gelikten XP
    'trending',            // Was gerade viral geht
    'location_proximity',  // Nearby-Experiences
    'temporal_relevance'   // Recent + relevant
  ],
  refresh: 'real-time'
}
```

#### **Tab 2: Following**
```typescript
// Experiences von gefolgten Usern
const followingFeed = {
  source: 'followed_users',
  sort: 'chronological',
  includeCollaborative: true // Auch wenn als Witness tagged
}
```

#### **Tab 3: Trending**
```typescript
// Viral-Experiences (24h-Window)
const trendingFeed = {
  algorithm: 'engagement-score',
  formula: '(likes * 2 + comments * 3 + shares * 5) / hours_since_published',
  timeWindow: '24h',
  minEngagement: 10
}
```

#### **Tab 4: Achievements** ← NEU! (Gamification-Feed)
```typescript
// Community-Achievement-Feed
const achievementsFeed = {
  items: [
    {
      type: 'badge_earned',
      user: '@username',
      badge: 'Pattern Hunter',
      timestamp: '2 Min ago',
      action: 'hat das "Pattern Hunter"-Badge freigeschaltet!'
    },
    {
      type: 'level_up',
      user: '@alexBodensee',
      oldLevel: 3,
      newLevel: 4,
      timestamp: '15 Min ago',
      action: 'ist jetzt Level 4 - Wave-Rider!'
    },
    {
      type: 'streak_milestone',
      user: '@nightWatcher',
      streak: 30,
      timestamp: '1h ago',
      action: 'hat 30-Tage-Streak erreicht 🔥'
    },
    {
      type: 'rare_badge',
      user: '@researcher99',
      badge: 'Early Adopter',
      rarity: '2%',
      timestamp: '2h ago',
      action: 'hat seltenes Badge freigeschaltet (nur 2% aller User)!'
    }
  ],
  purpose: 'Zeigt Community-Achievements → motiviert andere User'
}
```

**Achievement-Feed-Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Community-Achievements                           │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 💬 @username hat "Pattern Hunter" freigeschaltet││
│ │ ┌──────┐  Entdeckt 3 neue Patterns!            ││
│ │ │ 🎯   │  +30 XP                                ││
│ │ └──────┘  vor 2 Min                             ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ⬆️ @alexBodensee ist jetzt Level 4!             ││
│ │ "Wave-Rider" 🌊                                 ││
│ │ vor 15 Min                                      ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🔥 @nightWatcher: 30-Tage-Streak!               ││
│ │ "Jeden Tag aktiv seit 1 Monat!"                 ││
│ │ vor 1h                                          ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ [Mehr laden...]                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Feed Right-Panel: Neue Aha-Moment-Cards**

#### **Similar-User-Intro (Aha-Moment #6)**

```tsx
// components/feed/SimilarUserCard.tsx
export function SimilarUserCard() {
  const { data: similarUser } = useQuery({
    queryKey: ['similar-user'],
    queryFn: async () => {
      // Calculate user-similarity based on aggregated experience embeddings
      const { data } = await supabase.rpc('find_similar_users', {
        current_user_id: currentUser.id,
        limit: 1
      })
      return data[0]
    }
  })

  if (!similarUser) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">💡 AI-SUGGESTION</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={similarUser.avatar_url} />
          <div>
            <p className="font-semibold">@{similarUser.username}</p>
            <p className="text-xs text-muted-foreground">
              {similarUser.similarity_score}% ähnliche Erfahrungen!
            </p>
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <p>• Beide: {similarUser.common_categories.length} gleiche Kategorien</p>
          <p>• Beide: {similarUser.common_location} Region</p>
          <p>• Beide: {similarUser.common_timeframe}</p>
        </div>
        <Button className="w-full mt-3" size="sm">
          Connect with @{similarUser.username}
        </Button>
      </CardContent>
    </Card>
  )
}
```

**SQL für User-Similarity:**

```sql
CREATE OR REPLACE FUNCTION find_similar_users(
  current_user_id uuid,
  limit_count int DEFAULT 3
)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  similarity_score float,
  common_categories text[],
  common_location text,
  common_timeframe text
) AS $$
BEGIN
  RETURN QUERY
  WITH current_user_vector AS (
    -- Aggregate embeddings of current user's experiences
    SELECT AVG(embedding) as avg_embedding
    FROM experiences
    WHERE user_id = current_user_id
  ),
  other_users_vectors AS (
    SELECT
      e.user_id,
      AVG(e.embedding) as avg_embedding
    FROM experiences e
    WHERE e.user_id != current_user_id
    GROUP BY e.user_id
    HAVING COUNT(*) >= 3 -- Min 3 experiences
  )
  SELECT
    ou.user_id,
    p.username,
    p.avatar_url,
    (1 - (cuv.avg_embedding <=> ou.avg_embedding)) * 100 as similarity,
    -- Common categories, locations, etc...
  FROM other_users_vectors ou
  CROSS JOIN current_user_vector cuv
  JOIN profiles p ON p.id = ou.user_id
  ORDER BY similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Aha-Moment:** "Du und @AlexBodensee habt 87% ähnliche Erfahrungen!"

---

#### **Pattern-Prediction (Aha-Moment #7)**

```tsx
// components/feed/PatternPrediction.tsx
export function PatternPrediction({ category }: { category: string }) {
  const { data: prediction } = useQuery({
    queryKey: ['pattern-prediction', category],
    queryFn: () => supabase.rpc('predict_next_wave', { p_category: category })
  })

  if (!prediction || prediction.probability < 0.5) return null

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔮 PATTERN-PREDICTION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          Basierend auf historischen Daten:
        </p>
        <div className="p-3 bg-background rounded-lg mb-3">
          <p className="font-semibold">
            {prediction.event_type}: {prediction.date_range}
          </p>
          <p className="text-sm text-muted-foreground">
            Wahrscheinlichkeit: {(prediction.probability * 100).toFixed(0)}%
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          Notification aktivieren
        </Button>
      </CardContent>
    </Card>
  )
}
```

**SQL für Prediction:**

```sql
CREATE OR REPLACE FUNCTION predict_next_wave(p_category text)
RETURNS TABLE (
  event_type text,
  date_range text,
  probability float
) AS $$
BEGIN
  -- Simple time-series analysis: Find recurring patterns
  RETURN QUERY
  WITH monthly_counts AS (
    SELECT
      date_trunc('month', occurred_at) as month,
      COUNT(*) as count
    FROM experiences
    WHERE category = p_category
      AND occurred_at > now() - interval '2 years'
    GROUP BY month
    ORDER BY month
  ),
  seasonal_pattern AS (
    SELECT
      EXTRACT(month FROM month) as month_num,
      AVG(count) as avg_count,
      STDDEV(count) as stddev_count
    FROM monthly_counts
    GROUP BY month_num
  )
  SELECT
    'Solar-Maximum' as event_type,
    '24.-28. März 2025' as date_range,
    CASE
      WHEN avg_count > 10 THEN 0.78
      ELSE 0.45
    END as probability
  FROM seasonal_pattern
  WHERE month_num = EXTRACT(month FROM now() + interval '1 month')
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

**Aha-Moment:** "Solar-Maximum 24.-28. März → 78% Wahrscheinlichkeit für Sichtungen!"

---

#### **Seasonal-Pattern (Aha-Moment #8)**

Wird angezeigt in **Category-View** (z.B. `/categories/ufo`):

```tsx
// components/category/SeasonalPattern.tsx
export function SeasonalPattern({ category }: { category: string }) {
  const { data } = useQuery({
    queryKey: ['seasonal-pattern', category],
    queryFn: () => supabase.rpc('get_seasonal_pattern', { p_category: category })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Seasonal Pattern</CardTitle>
        <CardDescription>
          {category} haben jeden {data?.peak_month} einen Peak!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.monthly_data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2 text-sm">
          {data?.yearly_comparison.map(year => (
            <div key={year.year} className="flex justify-between">
              <span>{year.year}:</span>
              <span className="font-semibold">{year.count} Reports</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Du bist Teil des {data?.current_year_position} Trends!
        </p>
      </CardContent>
    </Card>
  )
}
```

**SQL:**

```sql
CREATE OR REPLACE FUNCTION get_seasonal_pattern(p_category text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'peak_month', (
      SELECT to_char(date_trunc('month', occurred_at), 'Month')
      FROM experiences
      WHERE category = p_category
      GROUP BY date_trunc('month', occurred_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'monthly_data', (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT
          to_char(date_trunc('month', occurred_at), 'Mon') as month,
          COUNT(*) as count
        FROM experiences
        WHERE category = p_category
          AND occurred_at > now() - interval '1 year'
        GROUP BY date_trunc('month', occurred_at)
        ORDER BY date_trunc('month', occurred_at)
      ) t
    ),
    'yearly_comparison', (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT
          EXTRACT(year FROM occurred_at) as year,
          COUNT(*) as count
        FROM experiences
        WHERE category = p_category
          AND occurred_at > now() - interval '3 years'
        GROUP BY EXTRACT(year FROM occurred_at)
        ORDER BY year DESC
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**Aha-Moment:** "UFOs haben jeden März einen Peak! 2024: 23 Reports ← Du bist Teil davon!"

---

### **Bento-Grid-Layout (Aceternity UI)**

```tsx
// Verwendung von Aceternity UI BentoGrid
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'

<BentoGrid className="max-w-4xl mx-auto">
  {experiences.map((exp, i) => (
    <BentoGridItem
      key={exp.id}
      title={exp.title}
      description={exp.content.slice(0, 100)}
      header={<ExperienceCardHeader experience={exp} />}
      icon={getCategoryIcon(exp.category)}
      className={cn(
        // Variable-Sizing basierend auf Index
        i === 0 && "md:col-span-2",
        i === 2 && "md:row-span-2",
        i % 7 === 0 && "md:col-span-2"
      )}
    />
  ))}
</BentoGrid>
```

### **Experience-Card-Component**

```tsx
// components/browse/ExperienceCard.tsx
export function ExperienceCard({ experience, size = 'default' }) {
  const isLarge = size === 'large'

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' }}
      className="group relative bg-card rounded-xl border overflow-hidden"
    >
      {/* Hero-Image */}
      {experience.heroImage && (
        <Link href={`/experiences/${experience.id}`} className="block">
          <div className={cn(
            "relative overflow-hidden",
            isLarge ? "aspect-video" : "aspect-square"
          )}>
            <Image
              src={experience.heroImage}
              alt=""
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "300px"}
            />

            {/* Category-Badge (Overlay) */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 backdrop-blur-md bg-background/80"
            >
              {experience.category.icon} {experience.category.name}
            </Badge>

            {/* Verified-Badge */}
            {experience.isVerified && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 backdrop-blur-md bg-background/80"
              >
                <CheckCircle className="w-3 h-3 mr-1 text-primary" />
                Verified
              </Badge>
            )}
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/experiences/${experience.id}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
            {experience.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {experience.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {experience.tags.slice(0, 3).map((tag) => (
            <Link key={tag} href={`/browse?tag=${tag}`}>
              <Badge variant="secondary" className="text-xs cursor-pointer">
                #{tag}
              </Badge>
            </Link>
          ))}
          {experience.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{experience.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Meta-Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{experience.locationName}</span>
          </div>
          <span>·</span>
          <time dateTime={experience.occurredAt}>
            {formatRelativeDate(experience.occurredAt)}
          </time>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          {/* Author */}
          <Link
            href={`/@${experience.user.username}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <Avatar src={experience.user.avatar} size="xs" />
            <span className="text-sm font-medium">
              @{experience.user.username}
            </span>
          </Link>

          {/* Engagement */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{experience.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{experience.commentCount}</span>
            </div>

            {/* Pattern-Indicator */}
            {experience.similarCount > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {experience.similarCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {experience.similarCount} similar experiences found
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Hover-Overlay (Quick-Actions) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 transition-opacity"
      >
        <Button size="sm" variant="secondary">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        <Button size="sm" variant="secondary">
          <Heart className="w-4 h-4 mr-2" />
          Like
        </Button>
        <Button size="sm" variant="secondary">
          <Share2 className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.article>
  )
}
```

### **Mobile-Feed-Layout**

```
┌───────────────────────────────┐
│ 🧭 XP-Share        🔍 🔔 [@]  │
├───────────────────────────────┤
│ [For You] Following  Trending │  ← Tab-Swipe
├───────────────────────────────┤
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 1                    │ │
│ │ [Image]                   │ │
│ │ "UFO-Sichtung..."         │ │
│ │ @user1 · Bodensee         │ │
│ │ 👍 12  💬 5  🎯 8          │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 2                    │ │
│ │ [Image]                   │ │
│ │ "Paranormales..."         │ │
│ └───────────────────────────┘ │
│                               │
│ [Scroll...]                   │
│                               │
├───────────────────────────────┤
│ [+ Submit XP] ← Floating-Btn  │
└───────────────────────────────┘
```

---

## 🔍 VIEW 2: SEARCH-VIEW

### **Command-Palette (Cmd+K)**

```
┌─────────────────────────────────────────────────────────┐
│ [Cmd+K aktiviert]                                       │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔍 Search experiences...                        │   │  ← Instant-Search
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ▼ Kategorien                                            │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🛸 UFO-Sichtungen                               │   │
│ │ 👻 Paranormal                                    │   │
│ │ 💭 Träume                                        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ▼ Vorschläge (AI-powered)                              │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔥 Bodensee + Solar-Sturm                       │   │  ← Trending-Combo
│ │ 🔥 Nähe + Diese Woche                           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ▼ Letzte Suchen                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ UFO Bodensee März                               │   │
│ │ Paranormal Deutschland                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│ ⌨️ Enter: Select  ↑↓: Navigate  Esc: Close             │
└─────────────────────────────────────────────────────────┘
```

### **Instant-Search-Results**

```
User tippt: "ufo bodensee" →

┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 "ufo bodensee"                                    [Clear] [Filters ▼]│
├───────────────┬─────────────────────────────────────────┬───────────────┤
│               │                                         │               │
│ FILTER-PANEL  │   RESULTS (234)                        │  QUICK-FILTER │
│               │                                         │               │
│ 📂 Category   │   Sort: [🎯 Relevance] ▼               │  ☑ With-Image │
│ ☑ UFO (198)   │                                         │  ☑ Verified   │
│ □ Paranormal  │   ┌──────────────────────────────────┐  │  □ Collabo... │
│   (24)        │   │ 🛸 UFO-Sichtung am Bodensee      │  │               │
│ □ Andere (12) │   │ @user1 · 📍 Bodensee · 15.03.24  │  │  ━━━━━━━━━━━ │
│               │   │                                  │  │               │
│ ━━━━━━━━━━━━  │   │ "Ich sah nachts ein leuchtendes │  │  📍 Location  │
│               │   │  Objekt über dem See..."         │  │  [Map-View]  │
│ 📍 Location   │   │                                  │  │               │
│ [Bodensee]    │   │ 👍 45  💬 12  🎯 23 Similar      │  │  ┌─────────┐ │
│ [Radius: 50km]│   └──────────────────────────────────┘  │  │ [Mini-  │ │
│               │                                         │  │  Map]   │ │
│ ━━━━━━━━━━━━  │   ┌──────────────────────────────────┐  │  │         │ │
│               │   │ 🛸 UFO über Konstanz             │  │  │ • 234   │ │
│ 🕐 Date       │   │ @user2 · 📍 Bodensee · 14.03.24  │  │  └─────────┘ │
│ [15.01 - Now] │   │ "Drei Lichter..."                │  │               │
│               │   │ 👍 23  💬 8  🎯 18               │  │  ━━━━━━━━━━━ │
│ ━━━━━━━━━━━━  │   └──────────────────────────────────┘  │               │
│               │                                         │  🔥 Trending  │
│ 🏷️ Tags       │   ┌──────────────────────────────────┐  │  #bodensee   │
│ ☑ #nachts     │   │ 🛸 UFO-Begegnung Friedrichshafen│  │  #ufo        │
│ ☑ #leuchtend  │   │ @user3 · 📍 Bodensee · 12.03.24  │  │  #märz2024   │
│ □ #schnell    │   │ "Dreiecksform..."                │  │               │
│               │   │ 👍 67  💬 34  🎯 45              │  │               │
│ ━━━━━━━━━━━━  │   └──────────────────────────────────┘  │               │
│               │                                         │               │
│ ⚡ Events      │   [Load More...]                        │               │
│ ☑ Solar-Storm │                                         │               │
│ □ Vollmond    │                                         │               │
│               │                                         │               │
└───────────────┴─────────────────────────────────────────┴───────────────┘
```

### **Advanced-Search-Builder**

```tsx
// components/browse/AdvancedSearch.tsx
export function AdvancedSearch() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text-Search */}
        <div>
          <Label>Keywords</Label>
          <Input placeholder="Search in title, content, tags..." />
        </div>

        {/* Boolean-Operators */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">AND</Button>
          <Button variant="outline" size="sm">OR</Button>
          <Button variant="outline" size="sm">NOT</Button>
        </div>

        {/* Category-Multi-Select */}
        <div>
          <Label>Categories</Label>
          <MultiSelect
            options={categories}
            value={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        {/* Location-Radius */}
        <div>
          <Label>Location (Radius: {radius}km)</Label>
          <LocationPicker
            value={location}
            onChange={setLocation}
          />
          <Slider
            value={[radius]}
            onValueChange={([val]) => setRadius(val)}
            min={10}
            max={500}
            step={10}
            className="mt-2"
          />
        </div>

        {/* Date-Range */}
        <div>
          <Label>Date Range</Label>
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onSelect={(range) => {
              setDateFrom(range?.from)
              setDateTo(range?.to)
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={popularTags}
          />
        </div>

        {/* External-Events */}
        <div>
          <Label>External Events</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="solar" />
              <Label htmlFor="solar">Solar Storms</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="moon" />
              <Label htmlFor="moon">Full/New Moon</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="earthquake" />
              <Label htmlFor="earthquake">Earthquakes</Label>
            </div>
          </div>
        </div>

        {/* Verification-Status */}
        <div>
          <Label>Verification</Label>
          <RadioGroup value={verification} onValueChange={setVerification}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="verified" />
              <Label htmlFor="verified">Verified Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unverified" id="unverified" />
              <Label htmlFor="unverified">Unverified Only</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Similarity-Threshold */}
        <div>
          <Label>Min. Similar Experiences</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[minSimilar]}
              onValueChange={([val]) => setMinSimilar(val)}
              min={0}
              max={50}
            />
            <span className="text-sm text-muted-foreground">{minSimilar}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={executeSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search ({resultCount})
          </Button>
          <Button variant="outline" onClick={saveSearch}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {/* Saved-Searches */}
        {savedSearches.length > 0 && (
          <>
            <Separator />
            <div>
              <Label>Saved Searches</Label>
              <div className="space-y-2 mt-2">
                {savedSearches.map((saved) => (
                  <div key={saved.id} className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSearch(saved)}
                      className="flex-1 justify-start"
                    >
                      {saved.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSearch(saved.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

### **Search-Results-Component**

```tsx
// components/browse/SearchResults.tsx
export function SearchResults({ query, filters }) {
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['search', query, filters],
    queryFn: ({ pageParam = 0 }) => searchExperiences(query, filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const experiences = data?.pages.flatMap(page => page.results) ?? []

  return (
    <div>
      {/* Results-Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {experiences.length} results for "{query}"
        </p>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">
              <Target className="w-4 h-4 mr-2" />
              Relevance
            </SelectItem>
            <SelectItem value="newest">
              <Clock className="w-4 h-4 mr-2" />
              Newest
            </SelectItem>
            <SelectItem value="popular">
              <TrendingUp className="w-4 h-4 mr-2" />
              Most Popular
            </SelectItem>
            <SelectItem value="nearby">
              <MapPin className="w-4 h-4 mr-2" />
              Nearby
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results-Grid */}
      {experiences.length > 0 ? (
        <>
          <BentoGrid>
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </BentoGrid>

          {/* Infinite-Scroll-Trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isFetching ? (
                <Spinner />
              ) : (
                <Button variant="outline" onClick={() => fetchNextPage()}>
                  Load More
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`Try adjusting your search for "${query}"`}
          action={
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      )}
    </div>
  )
}
```

---

## 📂 VIEW 3: CATEGORY-VIEW

### **Category-Landing-Page**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Browse                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│               🛸 UFO-Sichtungen                                         │
│               Unidentifizierte Flugobjekte und außergewöhnliche         │
│               Himmelserscheinungen                                      │
│                                                                         │
│               ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│               │ 2.3k XP  │ │ 234 Today│ │ 1.2k User│                   │
│               └──────────┘ └──────────┘ └──────────┘                   │
│                                                                         │
│               [🔔 Follow Category]  [📊 Analytics]                      │
│                                                                         │
├───────────────┬─────────────────────────────────────────┬───────────────┤
│               │                                         │               │
│ SUB-CATEGS.   │   EXPERIENCES                           │  STATS-PANEL  │
│               │                                         │               │
│ ☑ Alle (2.3k) │   Sort: [🆕 Newest] 🔥 Hot  📍 Nearby  │  📊 Timeline  │
│ □ Sichtung    │                                         │               │
│   (1.8k)      │   [View: 🎴 Cards] 📝 List 🗺️ Map      │  ┌──────────┐│
│ □ Begegnung   │                                         │  │ [Chart]  ││
│   (400)       │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │ Peak:    ││
│ □ Entführung  │                                         │  │ 15. März ││
│   (120)       │   [Bento-Grid mit UFO-Experiences]      │  └──────────┘│
│               │                                         │               │
│ ━━━━━━━━━━━━  │   ┌──────────┐ ┌──────────┐           │  ━━━━━━━━━━━━ │
│               │   │  XP 1    │ │  XP 2    │           │               │
│ 📍 Hotspots   │   └──────────┘ └──────────┘           │  🗺️ Hotspots  │
│               │                                         │               │
│ 🔥 Bodensee   │   ┌───────────────────┐                │  ┌──────────┐│
│   (234 XP)    │   │     XP 3          │                │  │ [Map]    ││
│ 🔥 Berlin     │   └───────────────────┘                │  │          ││
│   (189 XP)    │                                         │  │ • 234    ││
│ 🔥 Schweiz    │   [Scroll...]                           │  │ • 189    ││
│   (156 XP)    │                                         │  │ • 156    ││
│               │                                         │  └──────────┘│
│ ━━━━━━━━━━━━  │                                         │               │
│               │                                         │  ━━━━━━━━━━━━ │
│ 🏷️ Top-Tags   │                                         │               │
│ #nachts       │                                         │  💡 AI-Insight│
│ #leuchtend    │                                         │  "65% während│
│ #schnell      │                                         │   Solar-     │
│ #lautlos      │                                         │   Aktivität" │
│               │                                         │               │
└───────────────┴─────────────────────────────────────────┴───────────────┘
```

### **Category-Stats-Dashboard**

```tsx
// components/browse/CategoryStats.tsx
export function CategoryStats({ category }) {
  const { data: stats } = useQuery({
    queryKey: ['category-stats', category.slug],
    queryFn: () => getCategoryStats(category.slug)
  })

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalExperiences}</div>
            <p className="text-xs text-muted-foreground">Total Experiences</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">Today</p>
            <Badge variant={stats.trend > 0 ? 'default' : 'secondary'} className="mt-1">
              {stats.trend > 0 ? '↗' : '↘'} {Math.abs(stats.trend)}%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline-Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="url(#gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hotspots-Map */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden">
            <MapboxHeatmap
              data={stats.hotspots}
              center={stats.centroid}
              zoom={6}
            />
          </div>
          <div className="mt-4 space-y-2">
            {stats.topLocations.map((loc, i) => (
              <div key={loc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 justify-center">
                    {i + 1}
                  </Badge>
                  <span className="text-sm">{loc.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{loc.count} XP</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top-Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag) => (
              <Link key={tag.name} href={`/browse?category=${category.slug}&tag=${tag.name}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                  #{tag.name}
                  <span className="ml-1 text-xs text-muted-foreground">({tag.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Insights */}
      {stats.aiInsights && (
        <Alert>
          <Sparkles className="w-4 h-4" />
          <AlertTitle>AI-Insights</AlertTitle>
          <AlertDescription>{stats.aiInsights}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

---

## 👤 VIEW 4: PROFILE-VIEW

### **User-Profile-Layout**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PROFILE-HEADER (Full-Width)                                            │
│                                                                         │
│ ┌────────┐  @username                                   [Edit Profile] │
│ │        │  München, Deutschland                        [••• More]     │
│ │ Avatar │  Mitglied seit März 2024                                    │
│ │        │                                                             │
│ └────────┘  "Ich interessiere mich für UFO-Phänomene..."               │
│                                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │ 23 XP    │ │ 456 Likes│ │ 89 Follwr│ │ 12 Fllwng│                   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘                   │
│                                                                         │
│ [🔔 Follow]  [💬 Message]  [🔗 Share]                                  │
│                                                                         │
├───────────────┬─────────────────────────────────────────┬───────────────┤
│               │                                         │               │
│ LEFT-TABS     │   CONTENT (Tab-basiert)                │  RIGHT-STATS  │
│               │                                         │               │
│ [📖 XP (23)] │   ┌─ Filter/Sort ────────────────────┐  │  📊 Activity  │
│  Drafts (2)   │   │ Sort: [🆕 Newest] ▼             │  │               │
│  Private (5)  │   │ View: [🎴 Cards] 📝 List        │  │  ┌──────────┐│
│               │   └─────────────────────────────────┘  │  │ [Chart]  ││
│ [💬 Comments] │                                         │  │ Most     ││
│               │   [Bento-Grid mit User's XP]            │  │ Active:  ││
│ [❤️ Liked]    │                                         │  │ März     ││
│               │   ┌──────────┐ ┌──────────┐           │  └──────────┘│
│ [👥 Collabs]  │   │  XP 1    │ │  XP 2    │           │               │
│               │   └──────────┘ └──────────┘           │  ━━━━━━━━━━━━ │
│ [📊 Stats]    │                                         │               │
│               │   ┌───────────────────┐                │  🏆 Badges    │
│               │   │     XP 3          │                │               │
│               │   └───────────────────┘                │  ┌──────────┐│
│               │                                         │  │ ✓        ││
│               │   [Scroll...]                           │  │ Verified ││
│               │                                         │  └──────────┘│
│               │                                         │  ┌──────────┐│
│               │                                         │  │ 👥       ││
│               │                                         │  │ Collabo- ││
│               │                                         │  │ rator    ││
│               │                                         │  └──────────┘│
│               │                                         │               │
└───────────────┴─────────────────────────────────────────┴───────────────┘
```

### **Profile-Tabs**

#### **Tab 1: Experiences (Default)**
- User's öffentliche Experiences
- Sortierung: Newest, Popular, Most-Similar
- Filter: Category, Date-Range
- View-Switcher: Cards/List/Map/Timeline

#### **Tab 2: Drafts** (nur eigenes Profil)
- Gespeicherte Entwürfe
- Auto-Saved-Entries
- Quick-Continue-Buttons

#### **Tab 3: Private** (nur eigenes Profil)
- Private-Experiences (nur User sichtbar)
- Conversion zu Public möglich

#### **Tab 4: Comments**
- Alle Kommentare des Users
- Grouped-by-Experience
- Jump-to-Original

#### **Tab 5: Liked**
- Gelikte Experiences
- Sortiert nach Like-Datum
- Remove-Like-Option

#### **Tab 6: Collaborations**
- Experiences wo User Witness/Contributor ist
- Linked-Experiences
- Cluster-Memberships

#### **Tab 7: Stats**
- Personal-Analytics-Dashboard
- Engagement-Metrics
- Pattern-Insights
- Download-Report (PDF/CSV)

#### **Tab 8: Badges** ← NEU!
- Erzielte Badges (mit Unlock-Animation beim ersten Besuch)
- Locked Badges (mit Progress-Bar "2/5 Witnesses eingeladen")
- Badge-Grid sortiert nach:
  - **Neueste** (letzte freischalten)
  - **Kategorie** (Basic, Pattern, Advanced)
  - **Seltenheit** (% aller User die Badge haben)
- Badge-Details auf Hover:
  - Badge-Icon + Name
  - Beschreibung
  - Requirement (was muss erreicht werden)
  - XP-Reward
  - Freischalt-Datum
  - Seltenheit (z.B. "Haben nur 2% der User!")

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Badges (8/10 freigeschaltet)                     │
│                                                     │
│ [Filter: Alle ▼] [Sort: Neueste ▼]                │
│                                                     │
│ ✨ FREIGESCHALTET (8)                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ ✨   │ │ ✓    │ │ 🔥   │ │ 🤝   │               │
│ │First │ │Verify│ │Week  │ │Social│               │
│ │+10XP │ │+15XP │ │+25XP │ │+20XP │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                     │
│ 🔒 GESPERRT (2)                                    │
│ ┌──────┐ ┌──────┐                                 │
│ │ 🎯   │ │ 🌊   │                                 │
│ │Pattern│ │Wave  │                                 │
│ │1/3   │ │0/1   │     ← Progress-Indicator        │
│ └──────┘ └──────┘                                 │
│                                                     │
│ Total XP von Badges: 70 XP                         │
└─────────────────────────────────────────────────────┘
```

#### **Tab 9: Global Impact** ← NEU! (Aha-Moment #5)

**Feature**: Zeigt dem User welchen IMPACT seine Beiträge haben

```
┌─────────────────────────────────────────────────────┐
│ 🌍 YOUR GLOBAL IMPACT                               │
│                                                     │
│ Deine 5 Experiences haben:                         │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🎯 3 neue Patterns aufgedeckt                   ││
│ │ 🌍 Patterns in 3 Ländern validiert              ││
│ │ 🤝 127 Menschen geholfen                        ││
│ │ 🔬 2x in Research zitiert                       ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ 🗺️ WORLD-MAP (Dein Reach):                         │
│ ┌─────────────────────────────────────────────────┐│
│ │ [react-simple-maps World-Map]                   ││
│ │                                                 ││
│ │ 🇩🇪 Deutschland: 45 Views                       ││
│ │ 🇫🇷 Frankreich: 23 Views (1 Pattern validiert) ││
│ │ 🇨🇭 Schweiz: 18 Views (1 Pattern validiert)    ││
│ │ 🇦🇹 Österreich: 12 Views                        ││
│ │ 🇺🇸 USA: 8 Views                                ││
│ │                                                 ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ 📊 PATTERN-CONTRIBUTION:                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ ✨ Du hast geholfen diese Patterns zu finden:   ││
│ │                                                 ││
│ │ • "Bodensee-UFO-Wave März 2024" (23 XPs)       ││
│ │   → Deine XP war die ERSTE! 🌊                  ││
│ │                                                 ││
│ │ • "Solar-Storm-Correlation" (156 XPs)          ││
│ │   → 65% Korrelation bestätigt                  ││
│ │                                                 ││
│ │ • "München-Triangle-Sightings" (8 XPs)         ││
│ │   → Geographic-Pattern entdeckt                 ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ 💡 SCIENTIFIC VALUE:                                │
│ • Deine Daten sind besonders wertvoll wegen:       │
│   ✓ Präzise Zeitangaben (±5 Min)                   │
│   ✓ GPS-Koordinaten aus EXIF                        │
│   ✓ Detaillierte Antworten (8+ Fragen)             │
│                                                     │
│ → [Download Researcher-Report (PDF)]               │
└─────────────────────────────────────────────────────┘
```

**SQL für Impact-Calculation:**

```sql
-- Calculate User Impact Metrics
CREATE OR REPLACE FUNCTION calculate_user_impact(p_user_id uuid)
RETURNS TABLE (
  patterns_discovered int,
  countries_reached int,
  people_helped int,
  research_citations int,
  viewer_countries jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH user_experiences AS (
    SELECT id, view_count, location
    FROM experiences
    WHERE user_id = p_user_id
  ),
  pattern_contributions AS (
    SELECT COUNT(DISTINCT ecm.cluster_id) as pattern_count
    FROM experience_cluster_members ecm
    JOIN user_experiences ue ON ecm.experience_id = ue.id
    WHERE ecm.role = 'master' -- User was first in cluster
  ),
  country_reach AS (
    SELECT jsonb_object_agg(
      country_code,
      view_count
    ) as countries
    FROM (
      SELECT
        viewer_country_code as country_code,
        COUNT(*) as view_count
      FROM experience_views ev
      JOIN user_experiences ue ON ev.experience_id = ue.id
      GROUP BY viewer_country_code
    ) sub
  )
  SELECT
    (SELECT pattern_count FROM pattern_contributions),
    (SELECT COUNT(DISTINCT jsonb_object_keys(countries)) FROM country_reach),
    (SELECT SUM(view_count) FROM user_experiences),
    (SELECT COUNT(*) FROM research_citations WHERE user_id = p_user_id),
    (SELECT countries FROM country_reach);
END;
$$ LANGUAGE plpgsql;
```

**React-Component:**

```typescript
// components/profile/GlobalImpactDashboard.tsx
export function GlobalImpactDashboard({ userId }: { userId: string }) {
  const { data: impact } = useQuery({
    queryKey: ['user-impact', userId],
    queryFn: () => supabase.rpc('calculate_user_impact', { p_user_id: userId })
  })

  return (
    <div className="space-y-6">
      {/* Impact Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon="🎯" value={impact.patterns_discovered} label="Patterns aufgedeckt" />
        <MetricCard icon="🌍" value={impact.countries_reached} label="Länder erreicht" />
        <MetricCard icon="🤝" value={impact.people_helped} label="Menschen geholfen" />
        <MetricCard icon="🔬" value={impact.research_citations} label="Research-Zitate" />
      </div>

      {/* World Map */}
      <ComposableMap>
        <Geographies geography="/world-map.json">
          {({ geographies }) =>
            geographies.map(geo => {
              const countryData = impact.viewer_countries[geo.properties.ISO_A2]
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={countryData ? getHeatColor(countryData) : '#EEE'}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Pattern Contributions */}
      <PatternContributionsList userId={userId} />
    </div>
  )
}
```

**Aha-Moment:** "MEINE BEITRÄGE HABEN WIRKLICH IMPACT! 127 Menschen in 3 Ländern!"

---

## 🎴 VISUALIZATION-MODES

### **1. Cards-View (Default)**
```tsx
// Bento-Grid (bereits dokumentiert)
<BentoGrid>
  {experiences.map((exp) => (
    <ExperienceCard key={exp.id} experience={exp} />
  ))}
</BentoGrid>
```

### **2. List-View (Compact)**
```tsx
// components/browse/ListView.tsx
export function ListView({ experiences }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Author</TableHead>
          <TableHead className="text-right">Engagement</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {experiences.map((exp, i) => (
          <TableRow key={exp.id} className="cursor-pointer hover:bg-accent">
            <TableCell className="font-medium">{i + 1}</TableCell>
            <TableCell>
              <Link href={`/experiences/${exp.id}`} className="hover:underline">
                {exp.title}
              </Link>
              {exp.isVerified && (
                <CheckCircle className="inline w-3 h-3 ml-1 text-primary" />
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{exp.category.icon} {exp.category.name}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {exp.locationName}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(exp.occurredAt)}
            </TableCell>
            <TableCell>
              <Link href={`/@${exp.user.username}`} className="hover:underline">
                @{exp.user.username}
              </Link>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {exp.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {exp.commentCount}
                </span>
                {exp.similarCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    🎯 {exp.similarCount}
                  </Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### **3. Map-View (Geographic)**
```tsx
// components/browse/MapView.tsx
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'
import Supercluster from 'supercluster'

export function MapView({ experiences }) {
  const [viewport, setViewport] = useState({
    latitude: 51.1657,
    longitude: 10.4515,
    zoom: 6
  })
  const [selectedExperience, setSelectedExperience] = useState(null)

  // Clustering
  const cluster = useMemo(() => {
    const supercluster = new Supercluster({
      radius: 60,
      maxZoom: 16
    })

    supercluster.load(
      experiences.map(exp => ({
        type: 'Feature',
        properties: { experience: exp },
        geometry: {
          type: 'Point',
          coordinates: [exp.location.lng, exp.location.lat]
        }
      }))
    )

    return supercluster
  }, [experiences])

  const clusters = useMemo(() => {
    const bounds = mapRef.current?.getBounds()?.toArray().flat()
    if (!bounds) return []

    return cluster.getClusters(bounds, Math.floor(viewport.zoom))
  }, [cluster, viewport])

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden">
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates
          const { cluster: isCluster, point_count } = cluster.properties

          if (isCluster) {
            // Cluster-Marker
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={lng}
                latitude={lat}
                onClick={() => {
                  const zoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    20
                  )
                  setViewport({ ...viewport, longitude: lng, latitude: lat, zoom })
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    width: `${30 + (point_count / experiences.length) * 40}px`,
                    height: `${30 + (point_count / experiences.length) * 40}px`
                  }}
                >
                  {point_count}
                </div>
              </Marker>
            )
          }

          // Individual-Marker
          const exp = cluster.properties.experience

          return (
            <Marker
              key={`exp-${exp.id}`}
              longitude={lng}
              latitude={lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedExperience(exp)
              }}
            >
              <div className="relative cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-lg hover:scale-125 transition-transform">
                  {exp.category.icon}
                </div>
                {exp.isVerified && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-background rounded-full" />
                )}
              </div>
            </Marker>
          )
        })}

        {selectedExperience && (
          <Popup
            longitude={selectedExperience.location.lng}
            latitude={selectedExperience.location.lat}
            onClose={() => setSelectedExperience(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[250px]">
              {selectedExperience.heroImage && (
                <img
                  src={selectedExperience.heroImage}
                  alt=""
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <Link
                href={`/experiences/${selectedExperience.id}`}
                className="font-semibold hover:underline block mb-1"
              >
                {selectedExperience.title}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {selectedExperience.content}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span>@{selectedExperience.user.username}</span>
                <span>{formatRelativeDate(selectedExperience.occurredAt)}</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Heatmap-Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Hide' : 'Show'} Heatmap
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-10">
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2">Legend</p>
          <div className="space-y-1 text-xs">
            {categories.map((cat) => (
              <div key={cat.slug} className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### **Time-Travel-Playback (Aha-Moment #1)**

**Feature**: Animierte Zeitreise durch Experiences über Map

```tsx
// components/browse/MapTimeTravel.tsx
'use client'

import { useState, useEffect } from 'motion'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface Props {
  experiences: Experience[]
  onTimeRangeChange: (start: Date, end: Date) => void
}

export function MapTimeTravel({ experiences, onTimeRangeChange }: Props) {
  // Find date range
  const dateRange = useMemo(() => {
    const dates = experiences.map(e => new Date(e.occurredAt))
    return {
      min: Math.min(...dates.map(d => d.getTime())),
      max: Math.max(...dates.map(d => d.getTime()))
    }
  }, [experiences])

  const [currentTime, setCurrentTime] = useState(dateRange.min)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // 1 day per second

  // Playback animation
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (24 * 60 * 60 * 1000) // +1 day
        if (next > dateRange.max) {
          setIsPlaying(false)
          return dateRange.max
        }
        return next
      })
    }, playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, dateRange.max])

  // Filter experiences by current time
  useEffect(() => {
    const windowStart = new Date(currentTime - 24 * 60 * 60 * 1000) // -1 day
    const windowEnd = new Date(currentTime)
    onTimeRangeChange(windowStart, windowEnd)
  }, [currentTime])

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[600px] bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
      {/* Current Date Display */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold">
          {format(new Date(currentTime), 'dd. MMMM yyyy', { locale: de })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {experiences.filter(e => new Date(e.occurredAt) <= new Date(currentTime)).length} Sichtungen
        </p>
      </div>

      {/* Time Slider */}
      <Slider
        value={[currentTime]}
        onValueChange={([value]) => setCurrentTime(value)}
        min={dateRange.min}
        max={dateRange.max}
        step={24 * 60 * 60 * 1000} // 1 day steps
        className="mb-4"
      />

      {/* Date Range Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>{format(dateRange.min, 'dd.MM.yyyy')}</span>
        <span>{format(dateRange.max, 'dd.MM.yyyy')}</span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentTime(dateRange.min)
            setIsPlaying(false)
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <div className="flex-1" />

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs">Speed:</span>
          <Button
            variant={playbackSpeed === 2000 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(2000)}
          >
            0.5x
          </Button>
          <Button
            variant={playbackSpeed === 1000 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(1000)}
          >
            1x
          </Button>
          <Button
            variant={playbackSpeed === 500 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(500)}
          >
            2x
          </Button>
        </div>
      </div>

      {/* Wave Detection Alert */}
      {detectWavePeak(experiences, currentTime) && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary rounded-lg">
          <p className="text-sm font-semibold">
            🔥 WAVE-PEAK! 12 Sichtungen am {format(currentTime, 'dd. März')}!
          </p>
        </div>
      )}
    </div>
  )
}

function detectWavePeak(experiences: Experience[], currentTime: number) {
  const currentDay = format(currentTime, 'yyyy-MM-dd')
  const dayCount = experiences.filter(
    e => format(new Date(e.occurredAt), 'yyyy-MM-dd') === currentDay
  ).length

  return dayCount >= 10 // Peak if 10+ on same day
}
```

**Aha-Moment:** "ICH SEHE WIE SICH DAS PATTERN AUSBREITET! Tag 1: 1 Sighting, Tag 3 (Solar-Sturm): 12 Sightings!"

---

### **4. Timeline-View (Chronological)**
```tsx
// components/browse/TimelineView.tsx
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'

export function TimelineView({ experiences }) {
  // Group by date
  const groupedByDate = useMemo(() => {
    return experiences.reduce((acc, exp) => {
      const date = format(new Date(exp.occurredAt), 'yyyy-MM-dd')
      if (!acc[date]) acc[date] = []
      acc[date].push(exp)
      return acc
    }, {})
  }, [experiences])

  return (
    <VerticalTimeline lineColor="hsl(var(--border))">
      {Object.entries(groupedByDate).map(([date, exps]) => (
        <React.Fragment key={date}>
          {/* Date-Separator */}
          <VerticalTimelineElement
            date={format(new Date(date), 'dd. MMMM yyyy', { locale: de })}
            iconStyle={{
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
            icon={<Calendar />}
          />

          {/* Experiences for this date */}
          {exps.map((exp) => (
            <VerticalTimelineElement
              key={exp.id}
              date={format(new Date(exp.occurredAt), 'HH:mm')}
              iconStyle={{
                background: `hsl(var(--${exp.category.color}))`,
                color: 'white'
              }}
              icon={<span className="text-lg">{exp.category.icon}</span>}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'none'
              }}
              contentArrowStyle={{ borderRight: '7px solid hsl(var(--border))' }}
            >
              <Link href={`/experiences/${exp.id}`}>
                <h3 className="font-semibold mb-2 hover:text-primary">
                  {exp.title}
                </h3>
              </Link>

              {exp.heroImage && (
                <img
                  src={exp.heroImage}
                  alt=""
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}

              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {exp.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={exp.user.avatar} size="xs" />
                  <span className="text-sm">@{exp.user.username}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {exp.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {exp.commentCount}
                  </span>
                </div>
              </div>

              {exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {exp.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </VerticalTimelineElement>
          ))}
        </React.Fragment>
      ))}
    </VerticalTimeline>
  )
}
```

---

## 📱 Mobile-Adaptions

### **Mobile-Feed**
```
┌───────────────────────────────┐
│ 🧭 XP-Share        🔍 🔔 [@]  │
├───────────────────────────────┤
│ ┌──────────────────────────┐  │
│ │ [For You] Following  Hot │  │  ← Swipe-Tabs
│ └──────────────────────────┘  │
├───────────────────────────────┤
│ [🎴 Cards] 📝 🗺️ ⏱️  [Sort ▼]│  ← View + Sort
├───────────────────────────────┤
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 1 (Full-Width)       │ │
│ │ [Image]                   │ │
│ │ "UFO-Sichtung..."         │ │
│ │ @user1 · Bodensee         │ │
│ │ 👍 12  💬 5  🎯 8          │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 2                    │ │
│ └───────────────────────────┘ │
│                               │
│ [Pull-to-Refresh]             │
│ [Infinite-Scroll...]          │
│                               │
├───────────────────────────────┤
│ [+ Submit] ← Floating-Action  │
└───────────────────────────────┘
```

### **Mobile-Search**
```
┌───────────────────────────────┐
│ [🔍 Search...]        [✕]     │
├───────────────────────────────┤
│ Recent:                       │
│ UFO Bodensee                  │
│ Paranormal Deutschland        │
│                               │
│ Trending:                     │
│ 🔥 Bodensee + Solar-Sturm     │
│ 🔥 März 2024 UFO-Wave         │
│                               │
│ Categories:                   │
│ 🛸 UFO-Sichtungen             │
│ 👻 Paranormal                 │
│ 💭 Träume                     │
└───────────────────────────────┘

// Nach Eingabe:
┌───────────────────────────────┐
│ [🔍 ufo bodensee]    [Filtr.]│
├───────────────────────────────┤
│ 234 Ergebnisse                │
│                               │
│ ┌───────────────────────────┐ │
│ │ Result 1                  │ │
│ │ "UFO am Bodensee..."      │ │
│ │ @user1 · 15.03.2024       │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Result 2                  │ │
│ └───────────────────────────┘ │
│                               │
│ [Load More...]                │
└───────────────────────────────┘

// Filter-Sheet (Bottom):
┌───────────────────────────────┐
│ ═══ Filters          [✕]      │
├───────────────────────────────┤
│ Category                      │
│ ☑ UFO  □ Paranormal  □ Träume │
│                               │
│ Location (50km)               │
│ [──●────────] Radius          │
│                               │
│ Date Range                    │
│ [Last 30 Days ▼]              │
│                               │
│ [Reset] [Apply (234 Results)] │
└───────────────────────────────┘
```

---

## ⚡ Performance-Optimierungen

### **1. Virtualization (Long-Lists)**
```tsx
// Virtueller Scroll für 1000+ Experiences
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedFeed({ experiences }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: experiences.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,
    overscan: 3
  })

  return (
    <div ref={parentRef} className="h-screen overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
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
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <ExperienceCard experience={experiences[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **2. Infinite-Query (Pagination)**
```tsx
// TanStack-Query Infinite-Scroll
export function InfiniteFeed({ filters }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching
  } = useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: ({ pageParam = 0 }) => getExperiences(filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000 // 5 Min Cache
  })

  const experiences = data?.pages.flatMap(page => page.results) ?? []

  // Intersection-Observer für Auto-Load
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage()
      }
    })

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  return (
    <>
      <BentoGrid>
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </BentoGrid>

      {hasNextPage && (
        <div ref={loadMoreRef} className="py-8 text-center">
          {isFetching && <Spinner />}
        </div>
      )}
    </>
  )
}
```

### **3. Prefetching**
```tsx
// Prefetch beim Hover über Cards
export function ExperienceCard({ experience }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const prefetchExperience = () => {
    queryClient.prefetchQuery({
      queryKey: ['experience', experience.id],
      queryFn: () => getExperience(experience.id)
    })

    router.prefetch(`/experiences/${experience.id}`)
  }

  return (
    <div onMouseEnter={prefetchExperience}>
      {/* Card-Content */}
    </div>
  )
}
```

### **4. Image-Optimization**
```tsx
// Next/Image mit Placeholder
<Image
  src={experience.heroImage}
  alt={experience.title}
  fill
  className="object-cover"
  placeholder="blur"
  blurDataURL={experience.blurDataURL}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading={index < 6 ? 'eager' : 'lazy'} // First 6: Eager, Rest: Lazy
/>
```

---

## ♿ Accessibility

### **Keyboard-Navigation**
```tsx
// Command-Palette (Cmd+K)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(true)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

// Arrow-Navigation in Results
const handleResultKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = resultRefs.current[index + 1]
    next?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = resultRefs.current[index - 1]
    prev?.focus()
  } else if (e.key === 'Enter') {
    router.push(`/experiences/${experiences[index].id}`)
  }
}
```

### **Screen-Reader**
```tsx
// Announce-Search-Results
<div role="status" aria-live="polite" className="sr-only">
  {resultCount} results found for "{searchQuery}"
</div>

// Experience-Card
<article
  role="article"
  aria-labelledby={`exp-title-${exp.id}`}
  aria-describedby={`exp-meta-${exp.id}`}
>
  <h3 id={`exp-title-${exp.id}`}>{exp.title}</h3>
  <div id={`exp-meta-${exp.id}`} className="sr-only">
    {exp.category.name} experience by {exp.user.username},
    {exp.likeCount} likes, {exp.commentCount} comments
  </div>
</article>
```

---

## ✅ Implementation-Checklist

### **Phase 1: Feed-View**
- [ ] Feed-Page (`app/browse/page.tsx`)
- [ ] Bento-Grid-Layout
- [ ] Experience-Card-Component
- [ ] Feed-Tabs (For-You, Following, Trending)
- [ ] Filter-Sidebar
- [ ] View-Switcher (Cards/List/Map/Timeline)
- [ ] Infinite-Scroll

### **Phase 2: Search-View**
- [ ] Command-Palette (Cmd+K)
- [ ] Instant-Search
- [ ] Advanced-Search-Builder
- [ ] Search-Results-Page
- [ ] Saved-Searches
- [ ] Search-Suggestions (AI)

### **Phase 3: Category-View**
- [ ] Category-Landing-Page
- [ ] Category-Stats-Dashboard
- [ ] Hotspots-Map
- [ ] Sub-Category-Navigation
- [ ] Follow-Category-Feature

### **Phase 4: Profile-View**
- [ ] Profile-Page
- [ ] Profile-Tabs (XP, Comments, Liked, etc.)
- [ ] User-Stats-Dashboard
- [ ] Follow/Unfollow-System
- [ ] Edit-Profile-Modal

### **Phase 5: Visualization-Modes**
- [ ] List-View (Table)
- [ ] Map-View (Clustering)
- [ ] Timeline-View (Chronological)
- [ ] Heatmap-Overlay

### **Phase 6: Performance**
- [ ] Virtualization (Long-Lists)
- [ ] Infinite-Query (Pagination)
- [ ] Prefetching (Hover)
- [ ] Image-Optimization
- [ ] Caching-Strategy

### **Phase 7: Mobile**
- [ ] Mobile-Feed-Layout
- [ ] Swipe-Tabs
- [ ] Bottom-Sheet-Filters
- [ ] Touch-Optimized-Cards
- [ ] Pull-to-Refresh

### **Phase 8: Accessibility**
- [ ] Keyboard-Navigation
- [ ] Screen-Reader-Support
- [ ] ARIA-Labels
- [ ] Focus-Management
- [ ] Color-Contrast-Check

---

*Stand: 2025-01-05 (BROWSE-VIEWS v1.0)*
