# Vision 2030 - Wichtige Erkenntnisse & Entscheidungen

**Stand:** 21. Oktober 2025
**Kontext:** Analyse & Planung für XPShare Skalierung auf 100k+ Experiences

---

## 🎯 **Executive Summary**

Basierend auf detaillierter Analyse von aktueller Architektur, Exa-Research und User-Szenarien:

- ✅ **Grundarchitektur ist solide** - keine Show-Stopper
- ✅ **Alle 2030-Features technisch JETZT umsetzbar**
- ⚠️ **3 kritische Erweiterungen nötig:** RAG, Dynamic Interview, Partitioning
- 💰 **Kosten optimierbar:** Claude Haiku statt GPT-4o = 90% Ersparnis

---

## 1️⃣ **Attribute vs. Tags - Hybrid-Ansatz**

### Problem
- Nur 4/111 XPs nutzen aktuell Attributes
- Komplexes System (extra Tabelle, 7 SQL Functions)
- Frage: Zu komplex? Anderer Ansatz?

### Analyse

**Attributes (aktuell):**
```sql
-- Eigene Tabelle mit Relationen
experience_attributes
├─ experience_id
├─ attribute_key (shape, color, speed)
├─ attribute_value (triangle, red, fast)
└─ confidence, source, evidence

Vorteile:
✅ Schema-Validierung
✅ Strukturierte Korrelations-Analyse
✅ Wissenschaftlich vergleichbar

Nachteile:
❌ Extra Tabelle + JOINs
❌ Komplexe Maintenance
❌ Kaum genutzt (4/111 XPs)
```

**Tags (Alternative):**
```sql
-- Einfach Array-Feld
experiences.tags = ["shape:triangle", "color:red", "duration:5min"]

Vorteile:
✅ Keine extra Tabelle
✅ Schneller (GIN Index)
✅ Sehr flexibel

Nachteile:
⚠️ Validierung in Code
⚠️ Korrelationen aufwändiger
```

### ✅ **ENTSCHEIDUNG: Hybrid-Ansatz für ALLE Kategorien**

**Regel:**
- **Attributes** = Messbar, standardisiert, wissenschaftlich vergleichbar
- **Tags** = Flexibel, persönlich, kontextuell

**Beispiele pro Kategorie:**

| Kategorie | Attributes (standardisiert) | Tags (flexibel) |
|-----------|----------------------------|-----------------|
| **UAP/UFO** | `shape`, `color`, `speed`, `size`, `sound` | `context:night`, `witness:multiple`, `reaction:fear` |
| **NDE** | `trigger`, `duration`, `vital_signs`, `obe_reported` | `emotion:peace`, `vision:tunnel`, `being:deceased_relative` |
| **Dream** | `lucidity_level (1-5)`, `sleep_stage`, `recall_clarity` | `symbol:water`, `symbol:flying`, `technique:WILD`, `recurring` |
| **Synchronicity** | `frequency_scale (1-5)`, `timespan_days` | `type:number`, `type:person`, `emotion:awe` |
| **Paranormal** | `sensory_type`, `duration`, `location_type` | `entity:shadow`, `emotion:fear`, `time:night` |

**Warum beide?**
- Attributes: "Zeige alle luziden Träume (Level 4-5)" → präzise Filter
- Tags: "Zeige Träume mit Wasser-Symbol" → flexibel, keine Schema-Änderung nötig

### Migration
```sql
-- ✅ Keine Neu-Implementierung nötig!
-- Beide Systeme parallel nutzen

-- Tags hinzufügen (zusätzlich zu Attributes)
ALTER TABLE experiences ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Migration: Attributes → Tags kopieren (optional)
UPDATE experiences e
SET tags = (
  SELECT array_agg(a.attribute_key || ':' || a.attribute_value)
  FROM experience_attributes a
  WHERE a.experience_id = e.id
);

-- experience_attributes Tabelle BEHALTEN für wissenschaftliche Daten
```

---

## 2️⃣ **AI Interview Assistant - Dynamisch vs. Statisch**

### Aktueller Stand (statisch, aber smart!)

✅ **Was JETZT schon funktioniert:**
```typescript
// confidenceChecker.ts:289
// AI extrahiert Attributes in Step 1
// Questions werden in Step 2 PRE-FILLED
if (dbQ.mapsToAttribute && extractedData.attributes[dbQ.mapsToAttribute]) {
  question.currentValue = attribute.value
  question.confidence = attribute.confidence
  // ✅ User bestätigt oder korrigiert nur!
}

// ✅ Fragen kommen aus DATENBANK → editierbar ohne Code-Änderung
const dbQuestions = await fetchQuestionsForCategory(categorySlug)
```

**Flow:**
1. User schreibt Text
2. AI analysiert → extrahiert Attributes
3. Questions mit AI-Suggestions pre-filled
4. User bestätigt/korrigiert

### Problem: Kategorien mit Unterfragen

**User Use Case (Träume):**
```
Traum → War luzide?
  ├─ JA  → Fragen zu: Kontrolle, Techniken, Klarheit
  └─ NEIN → Fragen zu: Symbole, Emotionen, Wiederkehrend

UAP → Welche Form?
  ├─ Dreieck → Fragen zu: Lichter, Größe, Bewegungsmuster
  └─ Kugel → Fragen zu: Pulsieren, Farbe, Teilung
```

### ✅ **ENTSCHEIDUNG: Hybrid-Ansatz**

**Behalte statisches System (editierbar in DB) + Dynamische AI-Layer**

**Option 1: Statisch mit Conditional Logic (DB-gesteuert)**
```typescript
// category_questions Tabelle
{
  id: "dream_lucid_control",
  question: "Konntest du den Traum kontrollieren?",
  category: "dream",
  display_condition: {
    attribute: "lucidity_level",
    operator: ">=",
    value: "4"
  }
}

// Fragen werden nur gezeigt wenn Bedingung erfüllt
```

**Option 2: Dynamisch mit AI Tool Calls (zusätzlich)**
```typescript
// AI entscheidet welche Fragen WIRKLICH wichtig sind
export async function streamInterviewAssistant(userText: string) {
  const result = await streamUI({
    model: anthropic('claude-3-haiku-20240307'), // 90% günstiger!
    messages: [
      {
        role: 'system',
        content: `Analysiere Text, stelle NUR 2-3 wichtigste fehlende Fragen.

        KATEGORIEN & KRITISCHE ATTRIBUTE:
        - UAP: shape, color, movement, duration, witnesses
        - Dream: lucidity_level, sleep_stage, symbols, emotions
        - NDE: trigger, duration, obe_reported, beings_encountered

        WICHTIG: Wenn Info BEREITS im Text → NICHT nochmal fragen!`
      },
      { role: 'user', content: userText }
    ],
    tools: {
      ask_clarifying_question: tool({
        description: 'Stelle Nachfrage wenn kritische Info fehlt',
        inputSchema: z.object({
          attribute: z.string(),
          question: z.string(),
          why_important: z.string(),
          options: z.array(z.string()).optional()
        }),
        generate: async function* (params) {
          return <QuestionCard {...params} />
        }
      })
    }
  })
}
```

**User Flow Optionen:**

**A) Live-Assistance (während dem Schreiben)**
```
Textfeld MIT AI Sidebar (optional aktivierbar)
User tippt → AI gibt Echtzeit-Tipps
"Welche Form hatte das Licht?"
User ergänzt → AI erkennt → Tip verschwindet
```

**B) Nach dem Schreiben (empfohlen)**
```
1. User schreibt komplett frei
2. AI analysiert → Extrahiert was da ist
3. AI fragt NUR wichtigste 2-3 fehlende Details
4. User beantwortet oder überspringt
```

**C) Hybrid mit Completeness-Score**
```
Nach Submit:
┌──────────────────────────────────┐
│ 🎯 Deine Erfahrung ist 70% komplett│
│                                   │
│ ✅ Datum, Zeit, Ort               │
│ ✅ Beschreibung                   │
│ ⚠️  2 wichtige Details fehlen     │
│                                   │
│ [Details hinzufügen] [Überspringen]│
└──────────────────────────────────┘
```

### Beispiel-Vergleich

**User schreibt:**
> "Gestern sah ich ein helles Licht am Himmel. Es bewegte sich sehr schnell von Ost nach West und war 10 Sekunden sichtbar."

**Statisch (alle Fragen):**
```
❌ Fragt 8 Fragen:
1. Wann? (schon da: "gestern")
2. Wo?
3. Welche Form?
4. Welche Farbe? (teilweise: "hell")
5. Wie schnell? (schon da: "sehr schnell")
6. Wie lange? (schon da: "10 Sekunden")
7. Bewegung? (schon da: "Ost→West")
8. Zeugen?
```

**Dynamisch (AI entscheidet):**
```
✅ AI analysiert:
- Datum: ✅ "gestern"
- Bewegung: ✅ "schnell, Ost→West"
- Dauer: ✅ "10 Sekunden"
- Form: ❌ fehlt
- Farbe: ⚠️ "hell" (unklar)
- Ort: ❌ fehlt
- Zeugen: ❌ fehlt

✅ Fragt NUR:
1. "Wo warst du genau?" (Ort fehlt komplett)
2. "Welche Form hatte das Licht?" (kritisch für UAP)
3. "Warst du alleine?" (Zeugen wichtig)

→ 3 statt 8 Fragen = 62% weniger!
```

---

## 3️⃣ **RAG Integration - Echte Analyse statt nur Suche**

### Problem: AI kann Inhalte nicht lesen

**JETZT (kein echtes RAG):**
```typescript
// discover.tsx:108
search_and_show: {
  generate: async function* ({ query }) {
    const results = await hybridSearch({ query })

    // ❌ Return UI, nicht Daten
    return <Card>
      <ExperienceCard id="42" title="..." />
      <ExperienceCard id="89" title="..." />
    </Card>
  }
}

// AI sieht nur UI-Components, NICHT den Inhalt!
// AI kann NICHT analysieren, NICHT zitieren, NICHT Muster finden
```

### User-Szenarien OHNE RAG

**Szenario 1: Simple Search**
```
User: "Zeig mir UFO-Sichtungen mit roten Lichtern"
AI: "Ich habe 5 Ergebnisse gefunden. [zeigt Cards]"

❌ Problem:
- User muss selbst alle 5 XPs lesen
- Keine Analyse, keine Muster
- Keine Citations
```

**Szenario 2: Research-Frage**
```
User: "Gibt es einen Zusammenhang zwischen Vollmond und paranormalen Erfahrungen?"
AI: "Ich suche nach 'paranormal'... [zeigt 20 Cards]"

❌ Problem:
- User muss 20 XPs durchlesen
- Kein Mond-Parsing
- Keine statistische Analyse
```

### ✅ **ENTSCHEIDUNG: RAG implementieren!**

**Was echtes RAG bedeutet:**

```
RAG = Retrieval Augmented Generation
  1. Retrieve: Suche relevante Docs (✅ haben wir - hybridSearch)
  2. Augment: Füge Docs zum AI Context hinzu (❌ fehlt!)
  3. Generate: AI antwortet MIT Citations (❌ fehlt!)
```

**Implementierung:**

```typescript
// ✅ MIT RAG
tools: {
  searchKnowledgeBase: tool({
    description: 'Search experiences and return full content for analysis',
    inputSchema: z.object({
      query: z.string(),
      maxResults: z.number().default(10)
    }),

    // ✅ execute statt generate!
    execute: async ({ query, maxResults }) => {
      const embedding = await generateEmbedding(query)
      const results = await hybridSearch({ embedding, query, maxResults })

      // ✅ Return DATA to AI
      return {
        experiences: results.map(exp => ({
          id: exp.id,
          title: exp.title,
          fullText: exp.story_text,  // ← AI kann lesen!
          category: exp.category,
          date: exp.date_occurred,
          location: exp.location_text,
          tags: exp.tags,
          attributes: exp.attributes
        })),
        total: results.length,
        query: query
      }
    }
  })
}
```

### User-Szenarien MIT RAG

**Szenario 1: Pattern Analysis**
```
User: "Zeig mir UFO-Sichtungen mit roten Lichtern"

AI ruft searchKnowledgeBase("UFO red lights")
System gibt 5 XPs mit VOLLEM TEXT zurück

AI analysiert und antwortet:
"Ich habe 5 UFO-Berichte mit roten Lichtern analysiert:

🔴 **Licht-Eigenschaften:**
- Alle 5 beschreiben PULSIERENDE rote Lichter
- XP #42: '2-Sekunden-Rhythmus'
- XP #89: 'sehr hell, pulsierend'

📐 **Form & Formation:**
- 3 von 5 berichten dreieckige Struktur
- XP #42: Einzelnes Dreieck
- XP #89: Drei Lichter in Dreiecks-Formation

🔇 **Auffällige Gemeinsamkeit:**
- XP #42: 'völlig lautlos'
- XP #89: 'Kein Geräusch'
- XP #103: 'lautlos'
➡️ 100% der Berichte erwähnen fehlende Geräusche!

📅 **Zeitcluster:**
- Alle 5 innerhalb 3 Tagen (15.-17. März 2024)
- Alle in Berlin-Umgebung
➡️ Mögliche Flap-Welle?

🔬 **Hypothese:**
Rote pulsierende Lichter korrelieren stark mit:
1. Lautloser Bewegung (100%)
2. Dreieckigen Formationen (60%)
3. Zeitlichen/räumlichen Clustern

Quellen: XP #42, #89, #103, #156, #201"
```

**Szenario 2: Research mit Statistik**
```
User: "Gibt es einen Zusammenhang zwischen Vollmond und paranormalen Erfahrungen?"

AI ruft searchKnowledgeBase("paranormal moon phase")
System gibt 30 paranormale XPs zurück

AI liest JEDEN Text und antwortet:
"Mondphasen-Analyse von 30 paranormalen Berichten:

🌕 **Vollmond erwähnt:** 8 Berichte (27%)
- XP #12: 'Es war Vollmond, als ich die Schattengestalt sah'
- XP #45: 'In der Vollmondnacht hörte ich Stimmen'
- XP #78: 'Bei Vollmond sind die Aktivitäten immer stärker'

🌑 **Neumond erwähnt:** 3 Berichte (10%)
- XP #67: 'Bei Neumond fühlte ich mich beobachtet'

📊 **Statistik:**
- 27% erwähnen Vollmond
- 10% erwähnen Neumond
- 63% erwähnen keine Mondphase

🔬 **Vorläufige Analyse:**
Vollmond wird 2.7x häufiger erwähnt als Neumond.
ABER: Könnte Reporting-Bias sein (Menschen achten
bei Vollmond mehr auf Paranormales).

➡️ Empfehlung: Mehr Daten sammeln mit expliziter
   Mondphasen-Abfrage im Submit-Flow

Quellen: XP #12, #45, #67, #78 (und 4 weitere)"
```

**Szenario 3: Emotion-Analyse**
```
User: "Welche Emotionen berichten Menschen bei NDE am häufigsten?"

AI liest 50 NDE-Berichte komplett:

"Emotion-Analyse von 50 Nahtoderfahrungen:

😌 **Frieden/Ruhe:** 42 Berichte (84%)
- XP #23: 'Ein unbeschreibliches Gefühl von Frieden'
- XP #67: 'Zum ersten Mal wirklich in Frieden'

❤️ **Bedingungslose Liebe:** 38 Berichte (76%)
- XP #34: 'Eine Liebe die alles überstieg'

😊 **Freude/Glückseligkeit:** 35 Berichte (70%)

😢 **Traurigkeit beim Zurückkommen:** 28 Berichte (56%)
- XP #89: 'Ich war traurig zurückzukommen'

📊 **Muster:**
Die Trias 'Frieden-Liebe-Freude' tritt in 89% gemeinsam auf.

⚠️ **Selten:**
- Angst: Nur 3 Berichte (6%)
- Verwirrung: 12 Berichte (24%)

Quellen: 50 NDE-Berichte analysiert"
```

### Was fehlt aktuell

```typescript
// JETZT (kein RAG):
return <ExperienceCard />  // AI sieht nur UI

// BRAUCHEN (echtes RAG):
return {
  experiences: [
    { id, title, fullText, metadata }  // ← AI kann lesen!
  ]
}
```

---

## 4️⃣ **Performance & Skalierung (100k XPs Szenario)**

### pg_partman - Automatische Partitionierung

**Was sind Partitions?**
```
Statt eine riesige Tabelle (100k rows):
experiences [100.000 rows] ❌
  - Scan: ALLE rows bei Datum-Filter

Mit Partitioning (automatisch aufgeteilt):
experiences_p2025_01 [8.300 rows]
experiences_p2025_02 [8.500 rows]
experiences_p2025_03 [8.200 rows]
...
experiences_p2025_12 [9.100 rows]

Query mit Datum-Filter:
SELECT * FROM experiences
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'
→ Scannt NUR experiences_p2025_01 (8.300 statt 100.000) ✅
→ 92% weniger Rows!
```

**Status:**
- ✅ pg_partman verfügbar auf Supabase
- ✅ Kostenlos (PostgreSQL Extension)
- ⚠️ TimescaleDB DEPRECATED (wird 2026 entfernt)

**Setup:**
```sql
-- 1️⃣ Extension aktivieren
CREATE EXTENSION pg_partman;

-- 2️⃣ Partitionierte Tabelle
CREATE TABLE experiences_partitioned (
  id UUID,
  created_at TIMESTAMPTZ,
  ...
) PARTITION BY RANGE (created_at);

-- 3️⃣ Automatische monatliche Partitions
SELECT partman.create_parent(
  p_parent_table => 'public.experiences_partitioned',
  p_control => 'created_at',
  p_type => 'native',
  p_interval => 'monthly',
  p_premake => 4  -- 4 Monate voraus
);

-- 4️⃣ Retention Policy
UPDATE partman.part_config
SET retention = '12 months'  -- Alte Partitions auto-droppen
WHERE parent_table = 'public.experiences_partitioned';

-- ✅ pg_partman Background Worker erstellt automatisch neue Partitions!
```

**Wann nutzen:**
- ✅ Ab 100.000+ XPs
- ✅ Zeit-basierte Queries häufig
- ❌ NOCH NICHT bei 111 XPs

### Anomaly Detection - PostgreSQL statt Nixtla

**Nixtla TimeGPT:**
- Kosten: ~$39-99/Monat
- Use Case: ML-Forecasting, Anomaly Detection
- ❌ **NICHT nötig** für Start

**PostgreSQL kann das kostenlos:**

```sql
-- Native Anomaly Detection mit Window Functions
CREATE MATERIALIZED VIEW daily_anomalies AS
WITH daily_stats AS (
  SELECT
    date_trunc('day', created_at) AS day,
    category,
    COUNT(*) AS count
  FROM experiences
  GROUP BY day, category
)
SELECT
  day,
  category,
  count AS actual_count,

  -- Durchschnitt letzte 30 Tage
  AVG(count) OVER (
    PARTITION BY category
    ORDER BY day
    ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
  ) AS avg_30d,

  -- Standardabweichung
  STDDEV(count) OVER (
    PARTITION BY category
    ORDER BY day
    ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
  ) AS stddev_30d,

  -- Z-Score für Anomalie-Erkennung
  (count - AVG(count) OVER w) / NULLIF(STDDEV(count) OVER w, 0) AS z_score
FROM daily_stats
WINDOW w AS (
  PARTITION BY category
  ORDER BY day
  ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
);

-- Anomalien finden (> 2 Standardabweichungen = statistisch signifikant)
SELECT * FROM daily_anomalies
WHERE z_score > 2.0
ORDER BY z_score DESC;

-- Ergebnis:
-- day        | category | actual | avg_30d | z_score | Anomalie?
-- 2025-10-21 | uap      | 45     | 12.3    | 6.3     | 🚨 JA!
-- 2025-10-20 | dream    | 8      | 9.1     | -0.5    | Nein
```

**Wann Nixtla nutzen:**
- ✅ ML-Forecasting: "Nächste Woche +30% UFO-Sichtungen"
- ✅ Bei > 1M XPs (PostgreSQL zu langsam)
- ❌ Für simple Anomaly Detection: PostgreSQL reicht

### Kosten-Optimierung

**Discovery Agent:**
```typescript
// JETZT: GPT-4o
model: gpt4o
// Kosten: $2.50/1M input tokens

// ✅ OPTIMIERT: Claude Haiku
model: anthropic('claude-3-haiku-20240307')
// Kosten: $0.25/1M input tokens
// = 90% ERSPARNIS!

// Bei 1000 aktiven Usern/Tag, 100k XPs:
// GPT-4o:  $43,800/Jahr
// Haiku:   $4,380/Jahr
// Ersparnis: $39,420/Jahr 💰
```

---

## 5️⃣ **Datenmodell - Was wird gespeichert**

### Struktur nach Submit

```sql
-- experiences Tabelle
{
  id: "uuid-123",
  user_id: "user-456",

  -- ✅ ORIGINAL vom User (unverändert)
  story_text: "Gestern sah ich ein helles Licht am Himmel.
               Es war dreieckig und bewegte sich sehr schnell
               von Ost nach West. Nach 10 Sekunden war es weg.",

  -- ✅ AI-ENHANCED (nach Enrichment mit Fragen)
  story_text_enriched: "Am 20. Oktober 2025, gegen 23:30 Uhr, beobachtete
                        ich ein helles, dreieckiges Objekt am Himmel über
                        Berlin-Mitte. Das Objekt bewegte sich lautlos mit
                        hoher Geschwindigkeit von Ost nach West. Die
                        Sichtung dauerte etwa 10 Sekunden. Form: Dreieck.
                        Farbe: Weißes Licht. Keine Zeugen.",

  -- Metadaten
  title: "Dreieckiges Licht über Berlin",
  category: "uap",
  date_occurred: "2025-10-20T23:30:00Z",
  location_text: "Berlin-Mitte, Deutschland",
  location_lat: 52.5200,
  location_lng: 13.4050,

  -- ✅ Tags (flexibel, Array)
  tags: [
    "shape:triangle",
    "color:white",
    "movement:fast",
    "silent",
    "solo"
  ],

  -- ✅ Embedding für Semantic Search
  embedding: [0.123, -0.456, 0.789, ...],  // 1536 Dimensionen

  created_at: "2025-10-21T10:00:00Z",
  visibility: "public"
}

-- experience_attributes Tabelle (parallel zu Tags)
[
  {
    experience_id: "uuid-123",
    attribute_key: "shape",
    attribute_value: "triangle",
    confidence: 0.95,
    source: "ai_extraction"
  },
  {
    experience_id: "uuid-123",
    attribute_key: "color",
    attribute_value: "white",
    confidence: 0.90,
    source: "user_confirmed"
  },
  {
    experience_id: "uuid-123",
    attribute_key: "speed",
    attribute_value: "fast",
    confidence: 0.85,
    source: "ai_extraction"
  }
]
```

### Wie andere User die Experience sehen

**Feed View (Liste):**
```tsx
<ExperienceCard>
  <Badge>UAP Sighting</Badge>
  <Title>Dreieckiges Licht über Berlin</Title>
  <Meta>
    📅 20. Okt 2025, 23:30
    📍 Berlin-Mitte
    👤 User123
  </Meta>
  <Preview>
    {/* Zeigt story_text (Original) */}
    Gestern sah ich ein helles Licht am Himmel.
    Es war dreieckig und bewegte sich sehr schnell...
  </Preview>
  <Tags>
    <Tag>shape:triangle</Tag>
    <Tag>silent</Tag>
    <Tag>movement:fast</Tag>
  </Tags>
</ExperienceCard>
```

**Detail View (einzelne Experience):**
```tsx
<ExperienceDetail>
  <Header>
    <Title>Dreieckiges Licht über Berlin</Title>
    <Meta>
      📅 20. Oktober 2025, 23:30 Uhr
      📍 Berlin-Mitte, Deutschland
      👤 User123 • vor 2 Stunden
    </Meta>
  </Header>

  <Story>
    {/* ORIGINAL Text vom User - authentisch */}
    Gestern sah ich ein helles Licht am Himmel.
    Es war dreieckig und bewegte sich sehr schnell
    von Ost nach West. Nach 10 Sekunden war es weg.
  </Story>

  <StructuredData>
    <h3>Details</h3>
    {/* Aus Attributes + Tags */}
    <Attribute icon="🔺">Form: Dreieck</Attribute>
    <Attribute icon="💡">Farbe: Weißes Licht</Attribute>
    <Attribute icon="🚀">Bewegung: Schnell</Attribute>
    <Attribute icon="🔇">Geräusch: Lautlos</Attribute>
    <Attribute icon="⏱️">Dauer: ~10 Sekunden</Attribute>
  </StructuredData>

  <Map location={{lat: 52.52, lng: 13.40}} />

  <SimilarExperiences>
    {/* AI findet ähnliche via Vector Similarity */}
    <Card>Ähnlich: Dreieck über Hamburg (vor 3 Tagen)</Card>
    <Card>Ähnlich: Lautloses Objekt über Wien (vor 1 Woche)</Card>
  </SimilarExperiences>
</ExperienceDetail>
```

### Vergleich: Mit/Ohne Dynamic Interview

**OHNE Dynamic Interview:**
```
User schreibt: "Ich sah ein Licht am Himmel."

Gespeichert:
  story_text: "Ich sah ein Licht am Himmel."
  title: "Licht am Himmel"
  category: "uap" (geraten)
  date_occurred: null ❌
  location: null ❌
  attributes: {} ❌
  tags: []

→ Andere User lesen: "Ich sah ein Licht am Himmel."
→ Keine Details, kaum nutzbar für Wissenschaft
→ Nicht filterbar, nicht analysierbar
```

**MIT Dynamic Interview:**
```
User schreibt: "Ich sah ein Licht am Himmel."

AI fragt nach:
  1. "Wann war das?" → "Gestern um 23 Uhr"
  2. "Wo warst du?" → "Berlin"
  3. "Welche Form?" → "Dreieck"
  4. "Warst du alleine?" → "Ja"

Gespeichert:
  story_text: "Ich sah ein Licht am Himmel."
  story_text_enriched: "Am 20. Oktober 2025 um 23:00 Uhr sah ich
                        ein dreieckiges Licht am Himmel über Berlin.
                        Ich war alleine."
  title: "Dreieckiges Licht über Berlin"
  date_occurred: "2025-10-20T23:00:00Z" ✅
  location: "Berlin" ✅
  attributes: { shape: "triangle" } ✅
  tags: ["shape:triangle", "solo"] ✅

→ Andere User lesen: Vollständiger Bericht!
→ Filterbar, analysierbar, wissenschaftlich nutzbar
→ Findet ähnliche Experiences via Vector Search
```

---

## 6️⃣ **Vision 2030 Features - Aktueller Status**

### Was JETZT schon geht

| Feature | Status | Technologie | Aufwand |
|---------|--------|-------------|---------|
| **Real-Time Global Map** | ⚠️ Statisch | Supabase Realtime | 1-2 Tage |
| **Live Anomaly Dashboard** | ❌ Fehlt | PostgreSQL Window Functions | 3-5 Tage |
| **AI Interview Assistant** | ⚠️ Teilweise | Tool Calls + Claude Haiku | 1 Woche |
| **LLM Research Assistant** | ⚠️ Basis da | RAG Integration | 1 Woche |
| **Precog Network** | ❌ Fehlt | SQL Temporal Joins | 1 Woche |
| **Multi-Modal Input** | ❌ Zukunft | Wearables, VR Recording | 2030 |

### Real-Time Global Map

**JETZT:**
```typescript
// Statische Map mit Search-Results
show_map: {
  generate: async ({ query }) => {
    const results = await hybridSearch({ query })
    return <DynamicExperienceMapCard markers={results} />
  }
}
```

**MIT Realtime:**
```typescript
// components/RealTimeGlobalMap.tsx
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealTimeGlobalMap() {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('new-experiences')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'experiences'
      }, (payload) => {
        // ✅ Live Marker hinzufügen!
        addMarkerToMap(payload.new)
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  return <InteractiveMap />
}
```

### Live Anomaly Dashboard

**PostgreSQL Lösung (kostenlos):**
```sql
-- Materialized View mit Auto-Refresh
CREATE MATERIALIZED VIEW anomaly_dashboard AS
SELECT
  category,
  date_trunc('day', created_at) AS day,
  COUNT(*) AS count,
  AVG(COUNT(*)) OVER w AS baseline,
  STDDEV(COUNT(*)) OVER w AS stddev,
  (COUNT(*) - AVG(COUNT(*)) OVER w) / NULLIF(STDDEV(COUNT(*)) OVER w, 0) AS z_score
FROM experiences
GROUP BY category, day
WINDOW w AS (PARTITION BY category ORDER BY day ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING)
ORDER BY z_score DESC;

-- Auto-Refresh jede Stunde
SELECT cron.schedule(
  'refresh-anomalies',
  '0 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY anomaly_dashboard$$
);
```

### Precog Network (Synchronicity Detection)

**SQL Functions für Real-time:**
```sql
CREATE OR REPLACE FUNCTION detect_synchronicities(
  p_time_window INTERVAL DEFAULT '5 minutes',
  p_location_radius_km NUMERIC DEFAULT 50
)
RETURNS TABLE(exp1_id UUID, exp2_id UUID, sync_score NUMERIC)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e1.id AS exp1_id,
    e2.id AS exp2_id,
    -- Weighted Score: Semantic + Temporal + Spatial
    (1 - (e1.embedding <=> e2.embedding)) * 0.6 +  -- Semantic
    (1 - EXTRACT(EPOCH FROM (e2.created_at - e1.created_at)) / 300) * 0.2 +  -- Temporal
    (1 - earth_distance(...) / (p_location_radius_km * 1000)) * 0.2 AS sync_score  -- Spatial
  FROM experiences e1
  JOIN experiences e2 ON e1.id < e2.id
  WHERE
    -- Temporal Window
    e2.created_at >= e1.created_at
    AND e2.created_at < e1.created_at + p_time_window
    -- Spatial Proximity
    AND earth_distance(
      ll_to_earth(e1.location_lat, e1.location_lng),
      ll_to_earth(e2.location_lat, e2.location_lng)
    ) < p_location_radius_km * 1000
    -- High Semantic Similarity
    AND (1 - (e1.embedding <=> e2.embedding)) > 0.7
  ORDER BY sync_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Real-time Trigger
CREATE OR REPLACE FUNCTION notify_synchronicity()
RETURNS TRIGGER AS $$
DECLARE
  v_matches RECORD;
BEGIN
  FOR v_matches IN
    SELECT * FROM detect_synchronicities('5 minutes', 50)
    WHERE exp2_id = NEW.id
  LOOP
    PERFORM pg_notify(
      'synchronicity_alert',
      json_build_object(
        'exp1', v_matches.exp1_id,
        'exp2', v_matches.exp2_id,
        'score', v_matches.sync_score
      )::text
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_experience_check_sync
AFTER INSERT ON experiences
FOR EACH ROW
EXECUTE FUNCTION notify_synchronicity();
```

---

## 🎯 **Priorisierung & Nächste Schritte**

### Quick Wins (1-3 Tage)

**1. Real-Time Map mit Supabase Realtime**
- ✅ Infrastruktur vorhanden
- Code: 1 Component + Supabase Channel
- Impact: High (WOW-Faktor)

**2. Attribute → Tag Migration vorbereiten**
- Tags-Spalte hinzufügen
- Migration-Script schreiben
- BEIDE Systeme parallel testen

### High Impact (1 Woche)

**3. RAG Integration in /discover**
- Tool umbauen: `generate` → `execute`
- Full-Text zurückgeben statt UI
- Citations implementieren
- Impact: Game-Changer für Research

**4. AI Interview Assistant mit Streaming**
- Claude Haiku statt GPT-4o (90% Ersparnis)
- Dynamic Questions mit Tool Calls
- Completeness-Score UI
- Impact: Bessere Datenqualität

### Performance (2 Wochen)

**5. pg_partman Setup**
- Nur relevant ab 100k+ XPs
- Jetzt vorbereiten, später aktivieren
- Migration-Plan schreiben

**6. Native Anomaly Detection**
- Materialized View erstellen
- Dashboard-UI bauen
- Auto-Refresh einrichten

---

## 📊 **Offene Fragen / Entscheidungen**

### ❓ **Attribute-Keys pro Kategorie definieren**

Welche Attributes sind wirklich kritisch?

**UAP:**
- ✅ Definiert: shape, color, size, speed, sound
- ❓ Noch: light_pattern, formation_type, electromagnetic_effects?

**NDE:**
- ✅ Definiert: trigger, duration, vital_signs, obe_reported
- ❓ Noch: tunnel_vision, being_type, life_review?

**Dream:**
- ✅ Definiert: lucidity_level, sleep_stage, recall_clarity
- ❓ Noch: control_level, time_perception, sensory_vividness?

**Synchronicity:**
- ✅ Definiert: frequency_scale, timespan
- ❓ Noch: pattern_type, causality_sense, emotional_impact_scale?

**→ TODO: Mit Community/Experten abstimmen**

### ❓ **Wann zu partitionierter Tabelle migrieren?**

Optionen:
1. **Sofort vorbereiten** (experiences_partitioned parallel anlegen)
2. **Bei 10k XPs** aktivieren
3. **Bei 100k XPs** aktivieren (empfohlen)

**→ TODO: Entscheiden basierend auf Wachstumsrate**

### ❓ **Feature-Priorisierung**

Welches Feature zuerst implementieren?

**A) RAG Integration**
- Impact: Sehr hoch (Research-Capabilities)
- Aufwand: Mittel (1 Woche)
- Dependencies: Keine

**B) Dynamic Interview Assistant**
- Impact: Hoch (Datenqualität)
- Aufwand: Mittel (1 Woche)
- Dependencies: Keine

**C) Real-Time Map**
- Impact: Mittel (WOW-Faktor)
- Aufwand: Niedrig (1-2 Tage)
- Dependencies: Keine

**D) Precog Network**
- Impact: Hoch (Unique Feature)
- Aufwand: Hoch (1-2 Wochen)
- Dependencies: RAG für Notification-UI

**→ TODO: User/Stakeholder entscheidet**

---

## 💡 **Key Learnings**

1. **Grundarchitektur ist solide** - keine fundamentalen Änderungen nötig
2. **Hybrid-Ansätze sind King** - Attributes + Tags, Statisch + Dynamisch
3. **PostgreSQL ist mächtiger als gedacht** - Anomaly Detection, Partitioning, Realtime
4. **RAG ist kritisch** - Unterschied zwischen "Suche" und "Research"
5. **Claude Haiku > GPT-4o** - 90% Kostenersparnis bei gleichwertiger Qualität
6. **Skalierung ist machbar** - pg_partman, Materialized Views, optimierte Indexes

---

## 📚 **Weiterführende Dokumente**

- `/docs/masterdocs/tuning.md` - Performance-Optimierungen im Detail
- `/docs/masterdocs/vision-2030.md` - Vollständige 2030 Vision
- `/supabase/migrations/20251014_pattern_discovery_functions.sql` - Pattern Discovery SQL
- `/lib/search/hybrid.ts` - Hybrid Search Implementation
- `/app/actions/discover.tsx` - Discovery Agent (braucht RAG)

---

**Ende des Dokuments**
*Letzte Aktualisierung: 21. Oktober 2025*
