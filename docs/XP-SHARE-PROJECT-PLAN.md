# XP-Share - Vollständiger Projekt-Plan

## 🎯 Projekt-Vision

**XP-Share** ist eine Plattform zum Sammeln, Verknüpfen und Analysieren außergewöhnlicher Erfahrungen (Experiences).

### Kernidee
Menschen teilen außergewöhnliche Erfahrungen (paranormale Ereignisse, UFO-Sichtungen, intensive Träume, psychedelische Erlebnisse) und die Plattform findet Muster, Verbindungen und Korrelationen - sowohl zwischen Menschen als auch mit externen Daten (Sonnenstürme, Erdbeben, Mondphasen).

**Philosophie:** "9 Milliarden Menschen in der Platonischen Höhle - jeder in seiner eigenen Realität, aber es gibt ein Pattern im Hintergrund, das alles verbindet."

---

## 🏗️ Architektur-Übersicht

### 2-Part System

```
┌─────────────────────────────────────────────────────┐
│         PART 1: INTELLIGENTE EXTRAKTION             │
│  User Input → Analyse → Strukturierte Daten         │
├─────────────────────────────────────────────────────┤
│ • Text-Analyse (NLP, Entities, Kategorien)          │
│ • Bild-Analyse (Computer Vision, Metadaten)         │
│ • Audio-Verarbeitung (Speech-to-Text)               │
│ • AI-Embeddings (Semantische Vektorisierung)        │
│ • Integration externe Daten (Solar, Erdbeben)       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│      PART 2: VERKNÜPFUNG, ANALYSE & DARSTELLUNG     │
│  Strukturierte Daten → Pattern → Visualisierung     │
├─────────────────────────────────────────────────────┤
│ • Pattern-Matching (ähnliche Erfahrungen)           │
│ • Graph-Analyse (Verbindungen zwischen Menschen)    │
│ • Zeitliche/Geografische Korrelationen              │
│ • Externe Daten-Korrelation (Sonnenstürme etc.)     │
│ • Interaktive Visualisierung (Maps, Graphs, Timeline)│
└─────────────────────────────────────────────────────┘
```

---

## 💻 Tech-Stack (Phase 1 MVP)

### Frontend (Web-First)

```typescript
{
  "framework": "Next.js 14+ (App Router, Server Components)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui + Aceternity UI",
  "animation": "Framer Motion",
  "state": "Zustand + TanStack Query",

  "visualisierung": {
    "maps": "Mapbox GL JS + Deck.gl",
    "charts": "Recharts + Visx",
    "graphs": "Sigma.js + React Flow",
    "3d": "React Three Fiber (optional)"
  },

  "ai": "Vercel AI SDK + LangChain",
  "forms": "React Hook Form + Zod",
  "media": {
    "upload": "React Dropzone",
    "audio": "Wavesurfer.js",
    "video": "Video.js",
    "vision": "MediaPipe (Browser-side CV)"
  }
}
```

### Backend (Hybrid-Architektur)

```typescript
{
  "primary": "Supabase (PostgreSQL + Auto-APIs)",
  "graph": "Neo4j Aura",
  "ai_apis": "OpenAI (Embeddings, GPT-4o-mini, Whisper)",
  "ml_services": "NICHT für MVP - Optional später (nur Custom Computer Vision)"
}
```

**💡 Wichtig:** Für MVP werden **KEINE** separaten Python ML-Services (spaCy, TensorFlow, etc.) benötigt!
Alle NLP/AI-Features (Kategorisierung, Tags, Sentiment, Embeddings) laufen über **OpenAI API**.

**Wann später ML-Service:**
- Phase 3: Custom Computer Vision (YOLO für Bildanalyse)
- Nur wenn >100k Analysen/Monat (Kosten-Optimierung)

### Datenbanken (2-Database Hybrid)

#### **Supabase PostgreSQL** - Single Source of Truth (90% der Daten)

```
VERWENDUNG:
✅ Erfahrungen (kompletter Text, Metadaten)
✅ User-Profile & Auth
✅ Medien-Referenzen (Fotos, Videos, Audio)
✅ Kommentare, Likes, Reactions
✅ Kategorien, Tags
✅ Externe Sensordaten (Solar, Erdbeben)
✅ SUCHE (Full-Text + AI-Semantic)
✅ Geo-Daten (PostGIS)

EXTENSIONS:
• PostGIS (Geo-Queries)
• pg_vector (AI-Embeddings & Semantic Search)
• pg_trgm (Fuzzy Search)

FEATURES:
• Supabase Auth (Email, OAuth, Magic Links)
• Supabase Storage (S3-like für Media)
• Supabase Realtime (WebSockets)
• Auto-generierte REST + GraphQL APIs
• Row Level Security (RLS)
```

#### **Neo4j Aura** - Pattern & Graph Engine (10% der Daten)

```
VERWENDUNG:
✅ Person → Person Beziehungen (träumten voneinander)
✅ Experience → Experience Verbindungen
   • SIMILAR_TO (AI-basierte Ähnlichkeit via pgvector)
   • SAME_TIME (zeitliche Nähe)
   • SAME_LOCATION (geografische Nähe)
✅ Experience → ExternalEvent Korrelationen
   • DURING (während Sonnensturm, Erdbeben)
✅ Pattern-Queries (Cluster-Erkennung)
✅ Graph-Visualisierungen (Netzwerk-Ansichten)

DATEN-FORMAT:
Nur Metadaten & Referenzen:
• IDs (Referenzen zu PostgreSQL)
• Timestamps
• Scores (Similarity, Confidence)
• Location-Namen

KEIN kompletter Content (der bleibt in PostgreSQL!)

SYNERGY MIT PGVECTOR:
• pgvector (PostgreSQL): Semantische Suche via Embeddings
• Neo4j: Graph-Beziehungen & Pattern-Matching
• Workflow: PostgreSQL findet ähnliche Experiences (Embedding-Similarity)
           → Neo4j speichert Relationships für Graph-Visualisierung
```

### Daten-Synchronisation

```typescript
// Application-Level Sync (MVP)

async function createExperience(data) {
  // 1. PostgreSQL: Hauptdaten speichern
  const exp = await supabase.from('experiences').insert({
    user_id: data.userId,
    title: data.title,
    content: data.content,
    category: data.category,
    location: data.location,
    occurred_at: data.occurredAt,
    embedding: data.embedding
  }).select().single()

  // 2. Neo4j: Metadaten + Beziehungen
  await neo4j.run(`
    MATCH (u:Person {id: $userId})
    CREATE (e:Experience {
      id: $expId,
      category: $category,
      occurred_at: datetime($occurred),
      location_name: $locationName
    })
    CREATE (u)-[:POSTED]->(e)

    // Zeitliche Korrelationen
    WITH e
    MATCH (other:Experience)
    WHERE other.category = e.category
      AND duration.between(other.occurred_at, e.occurred_at).hours < 24
    CREATE (e)-[:SAME_TIME]->(other)
  `, {...})

  // 3. Background-Job: AI-Similarities finden
  queue.add('find-similar', { expId: exp.id })

  return exp
}
```

### Hosting & Infrastructure

```
Frontend:   Vercel (Next.js optimiert)
Database:   Supabase (PostgreSQL + Storage + Auth)
Graph:      Neo4j Aura (Managed)
AI:         OpenAI API (Embeddings, GPT-4o-mini, Whisper)
CDN:        Vercel Edge Network
Monitoring: Sentry (Errors) + Plausible (Analytics)

ML-Services: ❌ NICHT für MVP (erst ab Phase 3)

Kosten (MVP): ~$120-160/Monat
├── Vercel: $20/Monat
├── Supabase: $25/Monat
├── Neo4j Aura: $65/Monat
├── OpenAI API: $10-20/Monat (Embeddings, GPT-4o-mini, Whisper)
├── Übersetzungen (lazy): $0.50-20/Monat (siehe MULTILINGUAL-STRATEGY.md)
└── Plausible: $9/Monat
```

---

## 🔍 Such-System (PostgreSQL + AI)

### Basis-Suche (PostgreSQL Full-Text)

```sql
-- Keyword-Suche
SELECT * FROM experiences
WHERE to_tsvector('english', content) @@ websearch_to_tsquery('ufo nachts see')
ORDER BY ts_rank(to_tsvector(content), websearch_to_tsquery('ufo nachts see')) DESC;
```

### AI-Semantische Suche (pg_vector)

```sql
-- Ähnliche Erfahrungen finden (versteht Bedeutung!)
SELECT *,
       1 - (embedding <=> $query_embedding) as similarity
FROM experiences
WHERE 1 - (embedding <=> $query_embedding) > 0.8
ORDER BY embedding <=> $query_embedding
LIMIT 20;
```

### Multi-Filter

```typescript
// Kombination: Text + Kategorie + Geo + Zeit
const results = await supabase
  .from('experiences')
  .select('*, profiles(username, avatar_url)')
  .textSearch('content', query)
  .in('category', ['ufo', 'paranormal'])
  .gte('occurred_at', '2024-01-01')
  .lte('occurred_at', '2024-12-31')
  // PostGIS: 50km Umkreis
  .rpc('within_radius', {
    lat: 47.6516,
    lng: 9.1829,
    radius_km: 50
  })
```

### Such-Features

```
✅ Textsuche (Keywords + Fuzzy)
✅ AI-Semantische Suche ("traumatisch" findet "erschreckend")
✅ Multi-Filter (Kategorie, Datum, Geo, Tags)
✅ Geo-Umkreissuche (PostGIS)
✅ Sortierung (Relevanz AI-Score, Datum, Nähe)
✅ "Ähnliche Erfahrungen" pro Item
✅ Pattern-Vorschläge ("12 ähnliche während Sonnensturm")

Phase 2 (optional):
🟡 Auto-Complete (später mit Elasticsearch)
🟡 Instant Search (während Tippen)
```

---

## 🎨 Kern-Features (MVP)

### 1. User-System

```
✅ Authentication (Supabase Auth)
   • Email/Password
   • OAuth (Google, GitHub)
   • Magic Links

✅ Profile
   • Username, Bio, Avatar
   • Privacy-Settings (öffentlich/privat/anonym)
   • Statistiken (Beiträge, Verbindungen)
```

### 2. Erfahrungen Posten

```
✅ Rich-Text-Editor (Titel + Content)
✅ Kategorisierung (UFO, Paranormal, Träume, etc.)
✅ Tags (Multi-Select + Auto-Suggest)
✅ Zeitpunkt (Wann ist es passiert?)
✅ Ort (Geo-Picker / Map-Click / Address-Search)
✅ Privatsphäre (öffentlich/privat/anonym)

✅ Media-Upload:
   • Fotos (Drag & Drop, EXIF-Metadaten)
   • Videos (mit Thumbnail-Generierung)
   • Audio-Recording (Browser + Speech-to-Text)
   • Zeichnungen/Skizzen
```

### 3. Suche & Discovery

```
✅ Suchfeld (Text + AI-Semantisch)
✅ Filter-Sidebar:
   • Kategorien (Multi-Select)
   • Datum-Range-Slider
   • Geo-Umkreis
   • Tags

✅ Sortierung:
   • Relevanz (AI-Score)
   • Datum (neueste/älteste)
   • Nähe (geografisch)
   • Beliebtheit (Likes/Kommentare)

✅ View-Modi:
   • Liste (Cards)
   • Karte (Mapbox)
   • Timeline
   • Graph-Netzwerk
```

### 4. Visualisierungen

#### Karten-View (Mapbox + Deck.gl)

```
✅ Erfahrungen als Marker auf Karte
✅ Cluster (bei Zoom-out)
✅ Heatmap (Dichte-Visualisierung)
✅ 3D-Extrusion (Höhe = Anzahl Berichte)
✅ Filter live auf Karte
✅ Click → Experience-Detail
✅ Arc-Lines zwischen verbundenen Erfahrungen
```

#### Timeline-View (Visx)

```
✅ Horizontale Zeitachse
✅ Erfahrungen als Punkte/Cards
✅ Externe Events als Overlay (Sonnenstürme etc.)
✅ Zoom & Pan
✅ Scroll-basierte Animation (Framer Motion)
```

#### Graph-Netzwerk (Sigma.js)

```
✅ Nodes: Personen & Erfahrungen
✅ Edges: Verbindungen (SIMILAR_TO, DREAMED_OF, etc.)
✅ Interaktiv (Zoom, Drag, Click)
✅ Filter nach Beziehungstyp
✅ Community-Detection (Cluster-Highlighting)
```

### 5. Pattern-Erkennung (AI + Neo4j)

```
✅ "Ähnliche Erfahrungen" (AI-Embeddings)
✅ Zeitliche Cluster (gleiche Nacht, Woche)
✅ Geografische Cluster (gleicher Ort)
✅ Externe Korrelationen:
   • Sonnenstürme (NOAA API)
   • Erdbeben (USGS API)
   • Mondphasen

✅ Pattern-Benachrichtigungen:
   "12 Personen berichteten ähnliches während Solar-Sturm!"
```

### 6. AI-Features (100% OpenAI API)

```
✅ Semantische Suche (pg_vector + OpenAI Embeddings)
✅ Auto-Kategorisierung (GPT-4o-mini)
   • Automatische Kategorie-Vorschläge beim Posten
✅ Smart-Tags (GPT-4o-mini)
   • AI extrahiert 5-10 relevante Keywords
✅ Sentiment/Emotion-Analyse (GPT-4o-mini)
   • Erkennt: fear, awe, joy, confusion, peace
✅ Speech-to-Text (Whisper API)
   • Audio-Recording → Text
✅ AI-Assistent (Vercel AI SDK + GPT-4o):
   • "Erkläre mir dieses Muster"
   • "Finde ähnliche Erfahrungen"
   • Chat über Erfahrungen

💡 Alles via API - KEIN eigener ML-Service nötig!
```

#### **AI-Integration Details (Workflow)**

```typescript
// Beispiel: User postet Erfahrung mit AI-Analyse

async function createExperience(data: ExperienceInput) {
  const { title, content, occurred_at } = data

  // Parallel AI-Analyse (schnell: ~2 Sekunden)
  const [category, tags, embedding, emotion] = await Promise.all([
    // 1. Kategorisierung (GPT-4o-mini)
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Classify into: ufo, paranormal, dreams, psychedelic, spiritual, synchronicity, nde, other"
      }, {
        role: "user",
        content
      }]
    }).then(r => r.choices[0].message.content),

    // 2. Tag-Extraction (GPT-4o-mini)
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Extract 5-10 relevant keywords. Return JSON array."
      }, {
        role: "user",
        content
      }],
      response_format: { type: "json_object" }
    }).then(r => JSON.parse(r.choices[0].message.content).tags),

    // 3. Embedding für Semantische Suche
    openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content
    }).then(r => r.data[0].embedding),

    // 4. Emotion-Analyse (GPT-4o-mini)
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Primary emotion? Reply: fear, awe, joy, confusion, peace, excitement"
      }, {
        role: "user",
        content
      }]
    }).then(r => r.choices[0].message.content)
  ])

  // Speichern mit AI-Metadaten
  const experience = await supabase.from('experiences').insert({
    user_id: userId,
    title,
    content,
    occurred_at,
    category,      // AI-generiert ✅
    tags,          // AI-generiert ✅
    embedding,     // AI-generiert ✅
    emotion,       // AI-generiert ✅
    ai_processed: true
  }).select().single()

  return experience
}

// Kosten pro Erfahrung: ~$0.0002 (0.02 Cent!)
```

### 7. Social-Features

```
✅ Kommentare
✅ Reactions (Like, Support, Wow)
✅ Teilen (Link, Social Media)
✅ Folgen (anderen Usern)
✅ Benachrichtigungen (neue ähnliche Erfahrungen)
```

### 8. Externe Daten-Integration

```
✅ NOAA Space Weather API (Sonnenstürme)
✅ USGS Earthquake API (Erdbeben)
✅ Moon Phase API (Mondphasen)
✅ Automatischer Import (täglich)
✅ Visualisierung auf Timeline
✅ Korrelations-Analyse
```

---

## 📱 Mobile-Strategie

### Phase 1 (MVP - Monat 1-4)

```
✅ Next.js Web-App (Desktop + Mobile-Browser)
✅ PWA (Progressive Web App):
   • Installierbar auf Smartphones
   • Offline-fähig (Service Worker)
   • Push-Notifications
   • Kamera/Mikrofon-Zugriff
   • Geolocation
```

### Phase 2 (Monat 5-6)

```
Option A: Capacitor Wrapper (schnell)
├── Next.js läuft in WebView
├── Native APIs (Kamera, GPS, etc.)
├── 2 Wochen bis App Store
└── iOS + Android

Option B: React Native (langfristig besser)
├── 8-10 Wochen Entwicklung
├── Native Performance
├── 60% Code-Sharing mit Web
└── Next.js bleibt für Web
```

**Entscheidung:** Capacitor first, später optional React Native

### App Store Strategie

```
Positionierung: "Experience Pattern Analysis"
Fokus: Wissenschaftliche Datenanalyse, nicht "Paranormal Social Network"

Features betonen:
✅ Geospatial Visualisierung
✅ Korrelations-Analyse mit natürlichen Phänomenen
✅ Pattern-Recognition mit Machine Learning
✅ Community-driven Data Collection für Research

→ Erhöht Approval-Chance (besonders Apple)
```

---

## 🗂️ Datenbank-Schema (PostgreSQL)

### Core Tables

```sql
-- USERS (Supabase Auth, automatisch)
auth.users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz
)

-- PROFILES
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE,
  bio text,
  avatar_url text,
  privacy_settings jsonb DEFAULT '{"profile": "public"}',
  created_at timestamptz DEFAULT now()
)

-- EXPERIENCES (Haupttabelle!)
experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,

  -- Content
  title text NOT NULL,
  content text NOT NULL,

  -- Kategorisierung
  category text NOT NULL, -- 'ufo', 'paranormal', 'dreams', etc.
  tags text[] DEFAULT '{}',

  -- Zeit & Ort
  occurred_at timestamptz NOT NULL,
  location geography(Point), -- PostGIS
  location_name text,

  -- Media
  media_urls text[] DEFAULT '{}',
  audio_url text,

  -- Privatsphäre
  visibility text DEFAULT 'public', -- 'public', 'private', 'anonymous'

  -- Metadaten
  view_count int DEFAULT 0,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  is_verified boolean DEFAULT false,

  -- Multilingual (siehe MULTILINGUAL-STRATEGY.md)
  original_language text NOT NULL DEFAULT 'de',
  translations jsonb DEFAULT '{}'::jsonb,

  -- Für Suche
  content_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
  ) STORED,

  -- AI-Embeddings (pg_vector!)
  embedding vector(1536),

  -- Follow-Up-Mechanism (siehe EXPERIENCE-SUBMISSION-FLOW.md)
  follow_up_sent boolean DEFAULT false,
  follow_up_sent_at timestamptz,
  update_count int DEFAULT 0,

  -- Location-Privacy (siehe EXPERIENCE-SUBMISSION-FLOW.md Screen 6)
  location_privacy text DEFAULT 'approximate', -- 'exact', 'approximate', 'country', 'hidden'

  -- Sketch/Drawing
  sketch_url text, -- SVG-File in Supabase Storage

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Indices
CREATE INDEX experiences_user_id_idx ON experiences(user_id);
CREATE INDEX experiences_category_idx ON experiences(category);
CREATE INDEX experiences_occurred_at_idx ON experiences(occurred_at);
CREATE INDEX experiences_tsv_idx ON experiences USING GIN(content_tsv);
CREATE INDEX experiences_embedding_idx ON experiences
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX experiences_location_idx ON experiences USING GIST(location);

-- MEDIA
media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  type text NOT NULL, -- 'photo', 'video', 'audio', 'drawing'
  storage_path text NOT NULL,
  thumbnail_url text,
  metadata jsonb, -- EXIF, GPS, duration, etc.
  created_at timestamptz DEFAULT now()
)

-- CATEGORIES
categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  parent_id uuid REFERENCES categories
)

-- TAGS
tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

-- EXTERNAL EVENTS (Sensordaten)
external_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'solar_storm', 'earthquake', 'moon_phase'
  timestamp timestamptz NOT NULL,
  location geography(Point),
  intensity float,
  metadata jsonb, -- event-spezifische Daten
  source text, -- 'NOAA', 'USGS', etc.
  created_at timestamptz DEFAULT now()
)

CREATE INDEX external_events_type_idx ON external_events(event_type);
CREATE INDEX external_events_timestamp_idx ON external_events(timestamp);

-- COMMENTS
comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  parent_id uuid REFERENCES comments, -- für Threading
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- REACTIONS
reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  type text NOT NULL, -- 'like', 'support', 'wow', 'insightful'
  created_at timestamptz DEFAULT now(),

  UNIQUE(experience_id, user_id, type)
)

-- FOLLOWS
follows (
  follower_id uuid REFERENCES auth.users,
  following_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),

  PRIMARY KEY(follower_id, following_id)
)

-- GAMIFICATION TABLES
-- Siehe: EXPERIENCE-SUBMISSION-FLOW.md - Gamification-Features

-- BADGE_DEFINITIONS (Badge-Typen)
badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, -- 'first_experience', 'week_warrior', etc.
  name text NOT NULL, -- "First Experience", "Week Warrior"
  description text,
  icon text, -- Emoji oder URL
  category text, -- 'basic', 'pattern', 'advanced'

  -- Badge-Anforderungen
  requirement_type text NOT NULL, -- 'experience_count', 'streak_days', 'witness_count', etc.
  requirement_value jsonb NOT NULL,
  -- Beispiele:
  -- {"count": 1} für First Experience
  -- {"days": 7} für Week Warrior
  -- {"patterns": 3} für Pattern Hunter

  -- Belohnung
  xp_reward int NOT NULL, -- XP die User erhält

  created_at timestamptz DEFAULT now()
)

CREATE INDEX badge_definitions_slug_idx ON badge_definitions(slug);

-- USER_BADGES (Erzielte Badges)
user_badges (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  badge_id uuid REFERENCES badge_definitions ON DELETE CASCADE,

  earned_at timestamptz DEFAULT now(),

  PRIMARY KEY(user_id, badge_id)
)

CREATE INDEX user_badges_user_idx ON user_badges(user_id);
CREATE INDEX user_badges_earned_idx ON user_badges(earned_at);

-- USER_GAMIFICATION (XP, Level, Streaks)
user_gamification (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,

  -- XP & Level
  xp_points int DEFAULT 0,
  level int DEFAULT 1,

  -- Streak-System
  current_streak_days int DEFAULT 0,
  longest_streak_days int DEFAULT 0,
  last_activity_date date,

  -- Streak-Freeze (Premium-Feature)
  streak_freeze_available boolean DEFAULT false,
  streak_freeze_used_at timestamptz,

  -- Stats
  total_experiences_posted int DEFAULT 0,
  total_patterns_discovered int DEFAULT 0,
  total_witnesses_invited int DEFAULT 0,
  total_reactions_received int DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

CREATE INDEX user_gamification_level_idx ON user_gamification(level);
CREATE INDEX user_gamification_xp_idx ON user_gamification(xp_points);
CREATE INDEX user_gamification_streak_idx ON user_gamification(current_streak_days);

-- USER_ACTIVITY_LOG (für Streak-Tracking)
user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,

  activity_type text NOT NULL, -- 'experience_posted', 'comment', 'reaction', 'login'
  activity_date date DEFAULT CURRENT_DATE,

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, activity_date, activity_type)
)

CREATE INDEX activity_log_user_date_idx ON user_activity_log(user_id, activity_date);
CREATE INDEX activity_log_date_idx ON user_activity_log(activity_date);

-- NOTIFICATIONS & PATTERN-ALERTS (Aha-Momente #3, #7)
-- Siehe: BROWSE-VIEWS.md + EXPERIENCE-DETAIL-PAGE.md

-- NOTIFICATIONS
notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,

  -- Notification Type
  type text NOT NULL, -- 'pattern_alert', 'badge_earned', 'witness_verified', 'influence_network', 'level_up'

  -- Content
  title text NOT NULL,
  body text NOT NULL,
  data jsonb, -- Type-specific data (experience_id, badge_slug, etc.)

  -- Status
  read_at timestamptz,
  clicked_at timestamptz,

  -- Metadata
  created_at timestamptz DEFAULT now()
)

CREATE INDEX notifications_user_idx ON notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX notifications_type_idx ON notifications(type);

-- PATTERN_ALERTS (User-spezifische Alert-Regeln)
pattern_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,

  -- Alert-Type
  alert_type text NOT NULL, -- 'location', 'category', 'similar', 'all'

  -- Filter-Regeln (JSONB für Flexibilität)
  filters jsonb NOT NULL,
  -- Beispiele:
  -- Location: {"radius_km": 50, "center": {"lat": 47.66, "lng": 9.17}}
  -- Category: {"categories": ["ufo", "paranormal"]}
  -- Similar: {"min_similarity": 0.75}

  -- Settings
  enabled boolean DEFAULT true,
  notification_channels jsonb DEFAULT '["push", "email"]', -- push, email, sms

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

CREATE INDEX pattern_alerts_user_idx ON pattern_alerts(user_id);
CREATE INDEX pattern_alerts_enabled_idx ON pattern_alerts(user_id) WHERE enabled = true;

-- WITNESS_VERIFICATIONS (Aha-Moment #2)
-- Siehe: EXPERIENCE-DETAIL-PAGE.md

witness_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  witness_user_id uuid REFERENCES auth.users ON DELETE CASCADE,

  -- Verification
  status text DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verification_comment text,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users, -- Author of experience

  created_at timestamptz DEFAULT now(),

  UNIQUE(experience_id, witness_user_id)
)

CREATE INDEX witness_verifications_exp_idx ON witness_verifications(experience_id);
CREATE INDEX witness_verifications_user_idx ON witness_verifications(witness_user_id);
CREATE INDEX witness_verifications_status_idx ON witness_verifications(status);

-- EXPERIENCE_VIEWS (für Impact-Tracking)
-- Benötigt für: Global-Impact-Dashboard (Aha-Moment #5)

experience_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,

  -- Viewer
  viewer_user_id uuid REFERENCES auth.users ON DELETE SET NULL, -- NULL für anonyme Views
  viewer_country_code text, -- ISO 2-letter code (z.B. "DE", "FR")
  viewer_ip_hash text, -- Hashed IP für duplicate detection

  -- Metadata
  viewed_at timestamptz DEFAULT now(),

  UNIQUE(experience_id, viewer_ip_hash, DATE(viewed_at)) -- Max 1 view pro IP pro Tag
)

CREATE INDEX experience_views_exp_idx ON experience_views(experience_id);
CREATE INDEX experience_views_country_idx ON experience_views(viewer_country_code);
CREATE INDEX experience_views_date_idx ON experience_views(viewed_at);

-- RESEARCH_CITATIONS (für Impact-Dashboard)
research_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  experience_id uuid REFERENCES experiences,

  -- Paper Info
  paper_title text NOT NULL,
  authors text[],
  publication_year int,
  doi text,
  url text,

  created_at timestamptz DEFAULT now()
)

CREATE INDEX research_citations_user_idx ON research_citations(user_id);
CREATE INDEX research_citations_exp_idx ON research_citations(experience_id);

-- EXPERIENCE_ANSWERS (Antworten auf dynamic_questions)
-- Siehe: ADMIN-PANEL-SPEC.md & EXPERIENCE-SUBMISSION-FLOW.md
experience_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  question_id uuid REFERENCES dynamic_questions(id),

  -- Flexible Antwort (JSONB für verschiedene Typen)
  answer jsonb NOT NULL,
  -- Beispiele:
  -- Chips (Single): {"value": "Schnell"}
  -- Chips (Multi): {"values": ["Schnell", "Zick-Zack"]}
  -- Text: {"value": "Es bewegte sich sehr langsam..."}
  -- Boolean: {"value": true}
  -- Slider: {"value": 7.5}
  -- Date: {"value": "2024-08-15"}

  created_at timestamptz DEFAULT now()
)

CREATE INDEX experience_answers_exp_idx ON experience_answers(experience_id);
CREATE INDEX experience_answers_question_idx ON experience_answers(question_id);

-- EXPERIENCE_CLUSTERS (Collaborative Experiences)
-- Siehe: EXPERIENCE-SUBMISSION-FLOW.md - Collaborative Feature
experience_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Master-Experience (die "Haupt-XP")
  master_experience_id uuid REFERENCES experiences ON DELETE CASCADE,

  -- Name des Clusters (optional, user-generated)
  cluster_name text,
  description text, -- z.B. "Bodensee UFO-Wave März 2024"

  -- Auto-generiert oder manuell
  is_auto_generated boolean DEFAULT false,

  -- Confidence-Score (bei Auto-Clustering)
  confidence_score float, -- 0.0 - 1.0

  -- Status
  status text DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'

  -- Metadaten
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users
)

CREATE INDEX clusters_master_idx ON experience_clusters(master_experience_id);
CREATE INDEX clusters_status_idx ON experience_clusters(status);

-- EXPERIENCE_CLUSTER_MEMBERS (Verknüpfungstabelle)
experience_cluster_members (
  cluster_id uuid REFERENCES experience_clusters ON DELETE CASCADE,
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,

  -- Rolle im Cluster
  role text NOT NULL, -- 'master', 'witness', 'related', 'follow_up'

  -- Wie wurde verknüpft?
  link_type text DEFAULT 'manual', -- 'manual', 'invite', 'auto_ai'

  -- Wenn eingeladen: Einladungsstatus
  invited_user_id uuid REFERENCES auth.users,
  invited_email text, -- Falls User noch nicht registriert
  invite_status text, -- 'pending', 'accepted', 'declined'
  invite_token text UNIQUE, -- Für Email-Link

  -- Timestamps
  linked_at timestamptz DEFAULT now(),
  linked_by uuid REFERENCES auth.users,

  PRIMARY KEY(cluster_id, experience_id)
)

CREATE INDEX cluster_members_exp_idx ON experience_cluster_members(experience_id);
CREATE INDEX cluster_members_invited_idx ON experience_cluster_members(invited_user_id)
  WHERE invite_status = 'pending';
CREATE INDEX cluster_members_token_idx ON experience_cluster_members(invite_token)
  WHERE invite_token IS NOT NULL;

-- EXPERIENCE_UPDATES (Follow-Up-Mechanism)
-- Siehe: EXPERIENCE-SUBMISSION-FLOW.md - Follow-Up-Mechanism
experience_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,

  -- Update-Content
  update_text text NOT NULL,
  occurred_at timestamptz, -- Wann ist das Update-Ereignis passiert?

  -- Metadaten
  created_at timestamptz DEFAULT now()
)

CREATE INDEX updates_exp_idx ON experience_updates(experience_id);
CREATE INDEX updates_user_idx ON experience_updates(user_id);

-- Index für Follow-Up Background-Job
CREATE INDEX experiences_follow_up_idx ON experiences(created_at, follow_up_sent)
  WHERE follow_up_sent = false;

-- ENVIRONMENTAL_DATA (Weather/Moon/Solar Auto-Fetch)
-- Siehe: EXPERIENCE-SUBMISSION-FLOW.md - Weather-Auto-Fetch
environmental_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences ON DELETE CASCADE,

  -- Weather (OpenWeatherMap Historical)
  weather jsonb, -- {temp, condition, clouds, wind_speed, pressure, humidity}

  -- Astronomical
  moon_phase float, -- 0.0 - 1.0
  moon_phase_name text, -- "Vollmond", "Neumond", etc.
  sun_position jsonb, -- {azimuth, altitude}

  -- Space Weather (NOAA)
  solar_activity jsonb, -- {kp_index, geomagnetic_storm_level, xray_flux}

  -- Seismic (optional, USGS)
  earthquake_nearby jsonb, -- {magnitude, distance_km, time_diff_hours}

  fetched_at timestamptz DEFAULT now()
)

CREATE INDEX env_data_exp_idx ON environmental_data(experience_id);

-- EXPERIENCE_LINKS (One-Tap-Similar-Entry)
-- Siehe: EXPERIENCE-SUBMISSION-FLOW.md - One-Tap-Similar-Entry
experience_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_a_id uuid REFERENCES experiences ON DELETE CASCADE,
  experience_b_id uuid REFERENCES experiences ON DELETE CASCADE,

  -- Beziehungstyp
  link_type text NOT NULL, -- 'witnessed_same', 'similar', 'follow_up'

  -- Wie wurde verknüpft?
  created_via text, -- 'one_tap_share', 'manual_link', 'auto_cluster'

  -- Bestätigung
  confirmed boolean DEFAULT false,

  -- Metadaten
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),

  -- Verhindere Duplikate (bidirektional)
  CHECK (experience_a_id < experience_b_id)
)

CREATE INDEX exp_links_a_idx ON experience_links(experience_a_id);
CREATE INDEX exp_links_b_idx ON experience_links(experience_b_id);
CREATE UNIQUE INDEX exp_links_unique_idx ON experience_links(
  LEAST(experience_a_id, experience_b_id),
  GREATEST(experience_a_id, experience_b_id)
);
```

### Functions (PostgreSQL)

```sql
-- Vector-Similarity-Suche
CREATE OR REPLACE FUNCTION match_experiences(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    content,
    1 - (embedding <=> query_embedding) as similarity
  FROM experiences
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
    AND visibility = 'public'
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Geo-Umkreis-Suche
CREATE OR REPLACE FUNCTION experiences_within_radius(
  lat float,
  lng float,
  radius_km float DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  distance_km float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    ST_Distance(
      location,
      ST_SetSRID(ST_Point(lng, lat), 4326)::geography
    ) / 1000 as distance_km
  FROM experiences
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_Point(lng, lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
$$;
```

---

## 🕸️ Graph-Schema (Neo4j)

### Nodes

```cypher
// PERSON
(:Person {
  id: "uuid",           // → PostgreSQL users.id
  username: "string",
  created_at: datetime
})

// EXPERIENCE
(:Experience {
  id: "uuid",           // → PostgreSQL experiences.id
  category: "string",
  occurred_at: datetime,
  location_name: "string",
  cluster_id: "uuid"    // → PostgreSQL experience_clusters.id (optional)
})

// EXPERIENCE_CLUSTER
(:ExperienceCluster {
  id: "uuid",           // → PostgreSQL experience_clusters.id
  name: "string",       // "Bodensee UFO-Wave März 2024"
  confidence: float,    // 0.0 - 1.0
  status: "string"      // 'pending', 'confirmed', 'rejected'
})

// LOCATION
(:Location {
  name: "string",       // "Bodensee", "Nevada Desert"
  lat: float,
  lng: float
})

// EXTERNAL EVENT
(:ExternalEvent {
  id: "uuid",           // → PostgreSQL external_events.id
  type: "string",       // "solar_storm", "earthquake"
  timestamp: datetime,
  intensity: float
})

// CATEGORY
(:Category {
  name: "string",
  slug: "string"
})
```

### Relationships

```cypher
// User → Experience
(:Person)-[:POSTED {at: datetime}]->(:Experience)

// User → User (Träume, Verbindungen)
(:Person)-[:DREAMED_OF {when: datetime, details: string}]->(:Person)
(:Person)-[:MET_IN_DREAM {when: datetime}]->(:Person)
(:Person)-[:CONNECTED_TO {reason: string}]->(:Person)

// Experience → Experience
(:Experience)-[:SIMILAR_TO {
  score: float,        // 0.0 - 1.0 (AI Similarity)
  method: string       // "embedding", "manual", "ml"
}]->(:Experience)

(:Experience)-[:SAME_TIME {
  time_diff_hours: int
}]->(:Experience)

(:Experience)-[:SAME_LOCATION]->(:Experience)

// NEW: Collaborative Experiences (Clustering)
(:Experience)-[:WITNESSED_TOGETHER {
  role: string,        // "primary" oder "witness"
  confirmed: boolean,  // Hat Zeuge bestätigt?
  invited_at: datetime
}]->(:Experience)

(:Experience)-[:RELATED_TO {
  type: string,        // "same_event", "similar", "follow_up"
  confirmed: boolean
}]->(:Experience)

// Cluster → Experience
(:ExperienceCluster)-[:CONTAINS {
  role: string         // "master", "witness", "related"
}]->(:Experience)

// Experience → Location
(:Experience)-[:HAPPENED_AT]->(:Location)

// Experience → External Event
(:Experience)-[:DURING {
  time_diff_hours: int
}]->(:ExternalEvent)

// Location → Category (Hotspots)
(:Location)-[:HOTSPOT_FOR {
  count: int
}]->(:Category)
```

### Example Queries

```cypher
// Finde wer von wem träumte
MATCH (p1:Person)-[:DREAMED_OF]->(p2:Person)
RETURN p1.username, p2.username

// Finde Erfahrungen während Sonnensturm
MATCH (e:Experience)-[:DURING]->(storm:ExternalEvent)
WHERE storm.type = "solar_storm"
  AND storm.intensity > 5.0
  AND e.category = "ufo"
RETURN e, storm

// Finde zeitliche Cluster (3+ Personen, gleiche Nacht)
MATCH (p1:Person)-[:POSTED]->(e1:Experience)
     -[:SAME_TIME]->(e2:Experience)<-[:POSTED]-(p2:Person)
     -[:POSTED]->(e3:Experience)-[:SAME_TIME]->(e1)
WHERE e1.category = e2.category = e3.category
RETURN p1, p2, e1, e2, e3

// Netzwerk eines Users (3 Grad)
MATCH path = (start:Person {id: $userId})-[*1..3]-(connected)
RETURN path

// Hotspots finden
MATCH (loc:Location)<-[:HAPPENED_AT]-(e:Experience)
WHERE e.category = "ufo"
WITH loc, count(e) as exp_count
WHERE exp_count >= 5
RETURN loc.name, exp_count
ORDER BY exp_count DESC

// ============================================
// NEW: CLUSTERING QUERIES
// ============================================

// Finde alle Experiences in einem Cluster
MATCH (cluster:ExperienceCluster {id: $clusterId})
      -[:CONTAINS]->(exp:Experience)
      <-[:POSTED]-(user:Person)
RETURN exp, user, cluster
ORDER BY exp.occurred_at

// Finde wer gemeinsam Zeuge war
MATCH (exp1:Experience)-[:WITNESSED_TOGETHER]-(exp2:Experience)
WHERE exp1.id = $experienceId
RETURN exp1, exp2

// Finde alle verbundenen Experiences (bis 2 Ebenen tief)
MATCH path = (exp1:Experience {id: $experienceId})
             -[:WITNESSED_TOGETHER|RELATED_TO*1..2]-(exp2:Experience)
RETURN exp2, length(path) as distance
ORDER BY distance

// Erstelle Cluster aus ähnlichen Experiences
MATCH (exp1:Experience {id: $masterId})
MATCH (exp2:Experience {id: $witnessId})
CREATE (cluster:ExperienceCluster {
  id: randomUUID(),
  name: $clusterName,
  confidence: $confidence,
  status: 'pending',
  created_at: datetime()
})
CREATE (cluster)-[:CONTAINS {role: 'master'}]->(exp1)
CREATE (cluster)-[:CONTAINS {role: 'witness'}]->(exp2)
SET exp1.cluster_id = cluster.id,
    exp2.cluster_id = cluster.id
RETURN cluster

// Finde potenzielle Cluster-Kandidaten (ähnlich + zeitnah + geografisch)
MATCH (exp1:Experience)
WHERE exp1.occurred_at > datetime() - duration({days: 7})
  AND NOT exists(exp1.cluster_id)

MATCH (exp2:Experience)
WHERE exp2.id <> exp1.id
  AND exp2.category = exp1.category
  AND duration.between(exp1.occurred_at, exp2.occurred_at).hours < 48
  AND NOT exists(exp2.cluster_id)

// Check geografische Nähe (über Location)
MATCH (exp1)-[:HAPPENED_AT]->(loc1:Location)
MATCH (exp2)-[:HAPPENED_AT]->(loc2:Location)
WHERE point.distance(
  point({latitude: loc1.lat, longitude: loc1.lng}),
  point({latitude: loc2.lat, longitude: loc2.lng})
) < 50000 // 50km in Meter

// Prüfe AI-Similarity (aus PostgreSQL pgvector)
// Score wird von außen übergeben
WITH exp1, exp2, $similarity_score as similarity
WHERE similarity > 0.85

RETURN exp1.id as exp1_id, exp2.id as exp2_id, similarity
ORDER BY similarity DESC
LIMIT 10

// ============================================
// ONE-TAP-SIMILAR-ENTRY QUERIES
// ============================================

// Finde alle verknüpften Experiences (für Graph-Visualisierung)
MATCH path = (exp:Experience {id: $expId})
             -[:RELATED_TO|WITNESSED_TOGETHER*1..3]-(related:Experience)
RETURN path, related
ORDER BY length(path)

// Erstelle manuelle Verknüpfung (One-Tap)
MATCH (a:Experience {id: $expAId})
MATCH (b:Experience {id: $expBId})
CREATE (a)-[:RELATED_TO {
  type: $linkType,
  created_via: 'one_tap_share',
  confirmed: false,
  created_at: datetime()
}]->(b)
RETURN a, b

// Finde ähnliche Experiences eines Users (für "Meinen Eintrag verknüpfen")
MATCH (user:Person {id: $userId})-[:POSTED]->(exp:Experience)
WHERE exp.category = $category
  AND NOT exists((exp)-[:RELATED_TO]-(:Experience {id: $sourceExpId}))
RETURN exp
ORDER BY exp.occurred_at DESC
LIMIT 10
```

---

## 🎨 UI/UX Design-System

### Design-Prinzipien

```
• Modern & Minimalistisch
• Daten-fokussiert (Visualisierungen im Vordergrund)
• Dark-Mode-first (mit Light-Mode Option)
• Accessibility (WCAG 2.1 AA)
• Mobile-responsive
• Glassmorphism & Subtle Animations
```

### Component-Library

```
shadcn/ui (Basis):
• Button, Input, Card, Dialog, Dropdown
• Form, Table, Toast, Tooltip

Aceternity UI (Premium-Look):
• HeroParallax (Landing Page)
• BackgroundBeams (Hero Section)
• BentoGrid (Feature-Showcase)
• Spotlight-Effects
• Animated Gradients

Custom Components:
• ExperienceCard (mit Framer Motion)
• MapView (Mapbox + Custom Controls)
• TimelineView (Visx Custom)
• GraphView (Sigma.js Wrapper)
• FilterSidebar (Multi-Select)
• AIChat (Vercel AI SDK)
```

### Color-Palette (Dark-Mode)

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;

  --primary: #8b5cf6;      /* Purple */
  --primary-fg: #fafafa;

  --secondary: #3b82f6;    /* Blue */
  --accent: #06b6d4;       /* Cyan */

  --muted: #27272a;
  --muted-fg: #a1a1aa;

  --border: #27272a;
  --ring: #8b5cf6;

  /* Category Colors */
  --cat-ufo: #8b5cf6;
  --cat-paranormal: #ec4899;
  --cat-dreams: #3b82f6;
  --cat-psychedelic: #f59e0b;
}
```

---

## 📋 Entwicklungs-Roadmap

### Phase 1: MVP (Monat 1-4, 16 Wochen)

#### **Week 1-2: Setup & Foundation**
```
✅ Next.js Projekt initialisieren (Turborepo Monorepo)
✅ Supabase Projekt erstellen
✅ Neo4j Aura Instance erstellen
✅ Datenbank-Schemas anlegen (PostgreSQL + Neo4j)
✅ Authentication Setup (Supabase Auth)
✅ Design-System (Tailwind + shadcn/ui)
✅ Landing-Page (Aceternity UI Hero)
```

#### **Week 3-4: User-System**
```
✅ Login/Register UI
✅ Profile-Pages (View + Edit)
✅ Avatar-Upload (Supabase Storage)
✅ Settings-Page
✅ Privacy-Settings
```

#### **Week 5-6: Erfahrungen Posten**
```
✅ Create-Experience-Form
   • Rich-Text-Editor
   • Kategorie-Auswahl
   • Tag-Input (Auto-Suggest)
   • Datum-Picker
   • Geo-Location-Picker (Map)
✅ Media-Upload
   • Foto-Upload (Drag & Drop)
   • EXIF-Metadaten-Extraktion
   • Video-Upload (mit Thumbnail)
   • Audio-Recording (Browser)
✅ Speech-to-Text (Whisper API Integration)
✅ Preview & Submit
```

#### **Week 7-8: Suche & Browse**
```
✅ Suchfeld mit PostgreSQL Full-Text
✅ Filter-Sidebar
   • Kategorien (Multi-Select)
   • Datum-Range
   • Geo-Umkreis
   • Tags
✅ Ergebnis-Liste (Cards)
✅ Sortierung (Relevanz, Datum, Nähe)
✅ Pagination / Infinite-Scroll
✅ Experience-Detail-Page
```

#### **Week 9-10: Visualisierungen**
```
✅ Mapbox-Integration
   • Marker für Erfahrungen
   • Cluster
   • Click → Detail
   • Filter live auf Karte
✅ Timeline-View (Basis)
   • Horizontale Zeitachse
   • Erfahrungen als Punkte
✅ Responsive (Mobile + Desktop)
```

#### **Week 11-12: AI & Pattern-Engine**
```
✅ OpenAI Embeddings Integration
   • Generate beim Experience-Create
   • Speichern in pg_vector
✅ "Ähnliche Erfahrungen" Feature
   • Vector-Suche
   • Display auf Detail-Page
✅ Neo4j Pattern-Queries
   • SIMILAR_TO Relationships
   • SAME_TIME Detection
✅ Pattern-Vorschläge anzeigen
```

#### **Week 13-14: Externe Daten & Social**
```
✅ NOAA Solar-API Integration
✅ USGS Earthquake-API Integration
✅ External-Events Import (Background-Job)
✅ Timeline mit External-Events-Overlay
✅ Kommentare-System
✅ Reactions (Like, Support)
✅ Benachrichtigungen (Basis)
```

#### **Week 15-16: Polish & Launch**
```
✅ Performance-Optimierung
   • Image-Optimization (Next.js)
   • Lazy-Loading
   • Caching-Strategien
✅ Framer-Motion-Animationen
   • Page-Transitions
   • Card-Hover-Effects
   • Loading-States
✅ PWA-Setup (Service Worker, Manifest)
✅ SEO (Metadata, Sitemap)
✅ Testing (E2E mit Playwright)
✅ Beta-Launch 🚀
```

---

### Phase 2: Enhancement (Monat 5-6)

```
✅ Graph-Netzwerk-Visualisierung (Sigma.js)
✅ Advanced-Timeline (Zoom, Pan, Animation)
✅ Deck.gl für 3D-Map-Visualisierungen
✅ AI-Assistent (Vercel AI SDK Chat)
✅ Auto-Kategorisierung (AI)
✅ Smart-Tags (AI-Extraktion)
✅ Multilingual: Dynamic Questions Übersetzung
   • Admin-UI für Fragen-Übersetzungen
   • Manuell: DE/EN/FR/ES
   • Siehe: MULTILINGUAL-STRATEGY.md Phase 2
✅ Mobile-App (Capacitor Wrapper)
   • iOS Build
   • Android Build
   • App Store Submission
✅ More External Data Sources
   • Moon-Phase-API
   • Weather-Data (OpenWeatherMap Historical)
   • Astronomical Events
✅ Notifications-System (Push)
✅ Email-Digest (weekly patterns)
✅ Sketch-Tool AI-Shape-Matching (OpenAI Vision)
```

---

### Phase 3: Scale & Advanced (Monat 7+)

```
✅ Custom ML-Services (nur wenn nötig!)
   • Python Service (Railway/Modal)
   • Computer-Vision für Bilder (YOLO)
   • Auto-Tagging aus Bildern
   • Custom-Embeddings-Model (Fine-tuned)
   • Cluster-Algorithmen (HDBSCAN)
   • Anomalie-Detektion

   💡 Nur wenn:
      - >100k Analysen/Monat (Kosten-Optimierung)
      - Custom-Vision für Domain-spezifische Objekte
      - Offline-Requirements

✅ Researcher-Dashboard
   • Aggregierte Statistiken
   • Export-Funktionen (CSV, JSON)
   • API-Access für Forscher
✅ Community-Features
   • Groups/Communities
   • Events (User-Treffen)
   • Collaborative Pattern-Analysis
✅ React-Native-Migration (optional)
   • Wenn Mobile dominant wird
   • Native Performance
✅ Optional: Elasticsearch
   • Wenn Daten > 100k Erfahrungen
   • Auto-Complete
   • Instant-Search
```

---

## 💰 Budget & Kosten

### MVP-Phase (Monat 1-4)

```
Infrastructure:
├── Vercel (Frontend)          $20/Monat
├── Supabase                   $25/Monat
│   ├── PostgreSQL (8GB)
│   ├── Storage (100GB)
│   ├── Auth
│   └── Realtime
├── Neo4j Aura (Small)         $65/Monat
├── OpenAI API                 $10-20/Monat
│   ├── Embeddings (~$5-10)
│   │   • text-embedding-3-small: $0.02/1M tokens
│   │   • ~1000 Erfahrungen = ~$0.01
│   ├── GPT-4o-mini (~$5-10)
│   │   • Auto-Kategorisierung, Tags
│   │   • $0.15/1M input tokens
│   └── Whisper (~$2-5)
│       • Speech-to-Text: $0.006/min
├── Übersetzungen (lazy)       $0.50-20/Monat
│   • Nur on-demand, gecached
│   • Siehe: MULTILINGUAL-STRATEGY.md
└── ML-Services                $0 (❌ NICHT nötig für MVP!)

Services:
├── Domain (.com)              $15/Jahr
├── Sentry (Error Tracking)    $0 (Free Tier)
├── Plausible Analytics        $9/Monat
└── Posthog (User-Flow)        $0 (Free Tier bis 1M events)

TOTAL MVP: ~$120-160/Monat (~$500-640 für 4 Monate)

💰 Ersparnis vs. Custom ML-Service: ~$50/Monat (Railway/Modal gespart!)
```

### Skalierung (10k Users)

```
Infrastructure:
├── Vercel Pro                 $20/Monat
├── Supabase Pro               $50/Monat (mehr Storage/Bandwidth)
├── Neo4j Aura Medium          $200/Monat
├── OpenAI API                 $100-150/Monat
│   • Mehr Embeddings, Kategorisierungen
│   • GPT-4o für AI-Assistent
└── CDN (Cloudflare)           $0 (Free)

ML-Services (optional):        $0-30/Monat
└── Nur wenn Custom Computer Vision nötig

TOTAL: ~$370-420/Monat

💡 Immer noch OHNE teure ML-Infrastruktur!
```

### Entwicklungskosten (wenn extern)

```
Freelancer/Agentur (Schätzung):
├── MVP (4 Monate):            $40k - $80k
├── Phase 2 (2 Monate):        $20k - $40k
└── TOTAL:                     $60k - $120k

Solo-Developer (Vollzeit):
├── MVP: 4 Monate
└── Realistisch: 6 Monate (mit Learning-Curve)
```

---

## 🎯 Success-Metriken

### MVP-Launch-Ziele (Monat 4)

```
✅ 100 Beta-User
✅ 500 Erfahrungen gepostet
✅ 1000 Suchanfragen
✅ 50 DAU (Daily Active Users)
✅ <2s Ladezeit (Homepage)
✅ <500ms Suchzeit
```

### Phase 2 (Monat 6)

```
✅ 1k User
✅ 5k Erfahrungen
✅ 100 DAU
✅ 1k App-Downloads (iOS + Android)
✅ 10+ gefundene Pattern-Korrelationen
```

### Long-Term (Jahr 1)

```
✅ 10k User
✅ 50k Erfahrungen
✅ 1k DAU
✅ Wissenschaftliche Publikation (Daten-basiert)
✅ API für Forscher (100+ Sign-ups)
```

---

## 🔐 Sicherheit & Datenschutz

### Privacy-First-Ansatz

```
✅ Anonyme Postings (optional)
✅ Geo-Fuzzing (exakte Location optional)
✅ Content-Moderation (AI + Manual)
✅ GDPR-Compliant (DSGVO)
   • Right to be forgotten
   • Data Export
   • Consent Management
✅ Row-Level-Security (Supabase RLS)
✅ Media-Scanning (Safe Search API)
✅ Rate-Limiting (Spam-Schutz)
```

### Security-Best-Practices

```
✅ HTTPS everywhere
✅ Environment-Variables (nie in Code)
✅ API-Keys rotieren
✅ Input-Validation (Zod)
✅ SQL-Injection-Schutz (Prepared Statements)
✅ XSS-Schutz (Content-Security-Policy)
✅ CORS richtig konfiguriert
✅ Regular Security-Audits
```

---

## 📚 Dokumentation

### Developer-Docs

```
/docs
├── /setup              (Installation, Env-Setup)
├── /architecture       (System-Design)
├── /database          (Schema, Queries)
├── /api               (Endpoint-Docs)
├── /components        (Storybook)
└── /deployment        (CI/CD, Hosting)
```

### User-Docs

```
✅ FAQ
✅ How-to-Guides (Erfahrung posten, Suche nutzen)
✅ Privacy-Policy
✅ Terms-of-Service
✅ Community-Guidelines
```

---

## 🚀 Next Steps (Start Development)

### Woche 1 - Kickoff

```bash
# 1. Projekt initialisieren
npx create-next-app@latest xp-share --typescript --tailwind --app
cd xp-share

# 2. Dependencies installieren
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add neo4j-driver
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand @tanstack/react-query
pnpm add framer-motion
pnpm add mapbox-gl @deck.gl/core @deck.gl/layers
pnpm add recharts
pnpm add ai openai
pnpm add shadcn-ui

# 3. Supabase Projekt erstellen
# → https://app.supabase.com

# 4. Neo4j Aura erstellen
# → https://console.neo4j.io

# 5. Environment-Variables
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEO4J_URI=...
# NEO4J_USER=...
# NEO4J_PASSWORD=...
# OPENAI_API_KEY=...
```

### Erste Tasks

```
1. Landing-Page (Aceternity UI Hero)
2. Supabase Auth Setup (Login/Register)
3. Database-Schema anlegen (SQL-Migration)
4. Neo4j Initial Schema
5. Erste API-Routes (Next.js Route Handlers)
```

---

## 📞 Support & Community

### Für Fragen

```
GitHub Issues: https://github.com/[username]/xp-share/issues
Discord: [Community-Server erstellen]
Email: support@xp-share.com
```

### Open-Source

```
Lizenz: MIT (oder andere)
Contributions: Welcome!
Code-of-Conduct: Contributor Covenant
```

---

## ✅ Zusammenfassung

**XP-Share** ist eine moderne, AI-powered Plattform für außergewöhnliche Erfahrungen mit:

### Tech-Stack
✅ **Hybrid-Architektur** (PostgreSQL + Neo4j)
✅ **100% API-basierte AI** (OpenAI - KEIN eigener ML-Service!)
✅ **AI-Semantic-Search** (pg_vector + Embeddings)
✅ **Pattern-Erkennung** (Neo4j Graph + OpenAI)
✅ **Externe-Daten-Korrelation** (Solar, Erdbeben, Mond)
✅ **Moderne Visualisierungen** (Mapbox, D3, Sigma.js, Framer Motion)
✅ **Mobile-ready** (PWA → Capacitor → optional React Native)
✅ **Skalierbar** (Managed Services, kein Ops-Overhead)

### Kosten & Timeline
✅ **Budget-friendly** (~$120-140/Monat MVP)
   - Supabase: $25 | Neo4j: $65 | Vercel: $20 | OpenAI: $10-20
   - **KEIN** teurer Python ML-Service nötig!

✅ **Schnelle Entwicklung**
   - MVP: 4 Monate (16 Wochen)
   - Beta-Launch: Monat 4
   - Feature-Complete: Monat 6
   - App Stores: Monat 5-6

### Unique Selling Points
🔥 **AI-First** - Auto-Kategorisierung, Smart-Tags, Semantische Suche
🔥 **Pattern-Engine** - Findet verborgene Korrelationen
🔥 **Wissenschaftlich** - Externe Daten-Integration (NASA, USGS)
🔥 **Modern** - State-of-the-art UX (Framer Motion, Aceternity UI)

**Timeline:** 4 Monate MVP → 6 Monate Feature-Complete → Launch 🚀

---

*Letzte Aktualisierung: 2025-01-05 (Updated: Simplified ML-Stack)*
