# XPChat v3 - AI-Guided Submission Flow

**Status:** Planning Phase
**Created:** 2025-10-26
**Updated:** 2025-10-26 (Simplified to 3 Phases)

> **Architecture Context:** Dieser Flow wird als Mastra Workflow implementiert (3 Phasen + Background Enrichment mit suspend/resume). Siehe [01A-ARCHITECTURE-DECISIONS.md § Workflow Strategy](./01A-ARCHITECTURE-DECISIONS.md#🔄-workflow-strategy) für die technische Implementierung.

---

## 🎯 The Vision

**Problem (Old):** Kaltes Formular mit 15 Feldern - unpersönlich, einschüchternd
**Solution (New):** Conversational AI Guide - freundlich, natürlich, intelligent

```
Alt:                          Neu (8 Phases):           Neu (3 Phases):
┌──────────────────┐         ┌──────────────────┐      ┌──────────────────┐
│ [Title*]         │         │ Phase 1-8        │      │ 1. Story         │
│ [Date*]          │    →    │ 40% Dropoff at   │  →   │ 2. Quick Context │
│ [Location*]      │         │ Phase 3! ❌      │      │ 3. Submit        │
│ [Description*]   │         │                  │      │                  │
│ [...10 more]     │         │                  │      │ + Background     │
└──────────────────┘         └──────────────────┘      └──────────────────┘

Drop-off: 60%                Drop-off: 40%             Drop-off: ~15% ✅
```

**Key Change:** Reduce from 8 phases to 3 phases + background enrichment

---

## ⚡ Simplified Flow (RECOMMENDED)

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: STORY (Conversational)                             │
│ ────────────────────────────────────────────────────────────│
│ AI: "Erzähl mir in eigenen Worten, was passiert ist..."    │
│ User: [Types/speaks their story naturally]                  │
│ AI: [Asks 1-2 clarifying questions INLINE]                  │
│                                                              │
│ Time: 2-3 min                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: QUICK CONTEXT (3-5 essential questions)            │
│ ────────────────────────────────────────────────────────────│
│ ✅ Date & Time (auto-extracted, just confirm)               │
│ ✅ Location (map picker or text)                            │
│ ✅ Category (auto-detected, just confirm)                   │
│ ✅ Witnesses? (yes/no)                                       │
│ ✅ Media? (photo/audio upload - optional)                   │
│                                                              │
│ Time: 1-2 min                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: REVIEW & SUBMIT                                    │
│ ────────────────────────────────────────────────────────────│
│ AI: "Hier ist deine Geschichte. Möchtest du noch etwas      │
│     hinzufügen oder ändern?"                                │
│                                                              │
│ [Story Preview]                                             │
│ [Edit] [Add More] [Submit]                                  │
│                                                              │
│ Time: 30 sec                                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    [✅ SUBMITTED]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKGROUND ENRICHMENT (User sees "Processing..." for 2-3s)  │
│ ────────────────────────────────────────────────────────────│
│ ⚙️ AI Analysis (GPT-4o-mini extracts structured attributes) │
│ ⚙️ Pattern Matching (find similar experiences)              │
│ ⚙️ Tag Generation (auto-generate discovery tags)            │
│ ⚙️ Quality Scoring (calculate quality_score)                │
│ ⚙️ Embedding Generation (for vector search)                 │
│                                                              │
│ Time: 2-3 sec (async, user doesn't wait)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                   [✅ ENRICHMENT COMPLETE]
                              ↓
              User sees: "Danke! 47 ähnliche Erlebnisse gefunden"
                   [View Similar] [Share] [Done]
```

### Why This Works

**Reduced Friction:**
- ✅ 3 phases instead of 8
- ✅ Total time: 4-6 min (not 15-20 min)
- ✅ User submits BEFORE heavy processing
- ✅ Dropoff reduced from 40% → 15%

**Better UX:**
- ✅ Natural conversation, not interrogation
- ✅ Only essential questions upfront
- ✅ Background processing = feels instant
- ✅ Immediate gratification (submit fast!)

**Same Quality:**
- ✅ AI still extracts all attributes (just in background)
- ✅ Pattern matching still happens (just async)
- ✅ Quality scoring still accurate
- ✅ User can always edit later

---

## 🗣️ Detailed Implementation

### Phase 1: Story Collection (2-3 min)

### Phase 1: Discovery Context (Optional)

**Trigger:** User kommt von `/discover` mit Context

```typescript
interface DiscoveryContext {
  query: string // Original search query
  category: string // UFO, Dreams, etc.
  location?: string // If mentioned
  relatedExperiences: string[] // IDs of similar experiences
  suggestedTags: string[] // AI-generated from query
}
```

**AI Greeting (with Context):**

```
AI: Hallo! Ich habe gesehen, dass du nach UFO-Sichtungen
    im Englischen Garten gesucht hast. 🛸

    12 andere Personen haben dort ähnliches erlebt.
    Möchtest du dein Erlebnis auch teilen?

    [Ja, erzählen] [Nein, nur lesen]
```

**AI Greeting (without Context / direct entry):**

```
AI: Willkommen! Ich helfe dir, dein außergewöhnliches
    Erlebnis festzuhalten.

    Was möchtest du teilen?

    [🛸 UFO]  [🌙 Traum]  [✨ NDE]  [👻 Paranormal]
```

---

### Phase 2: Story Collection

**Conversational, nicht Form-based**

#### Step 1: The Story

```
AI: Perfekt! Erzähl mir in deinen eigenen Worten,
    was passiert ist.

    Nimm dir Zeit, ich höre zu. 👂

    [Text Area - expandable]
    [Audio aufnehmen 🎤] [Foto hinzufügen 📷]
```

**User types:**
```
"Gestern Nacht gegen 23 Uhr war ich mit meinem Hund
im Englischen Garten spazieren. Plötzlich sah ich
ein extrem helles weißes Licht am Himmel. Es bewegte
sich sehr schnell in Zickzack-Bewegungen..."
```

**AI responds:**
```
AI: Wow, das klingt intensiv! 🤯

    Lass mich ein paar Details klären:

    📅 Wann genau war das?
    → [Gestern, 25.10.2024, ~23:00 Uhr] ✅ erkannt

    📍 Wo genau?
    → [Englischer Garten, München] ✅ erkannt

    👥 Warst du allein?
    → [Mit meinem Hund] - Gab es menschliche Zeugen?
```

#### Step 2: Clarifying Questions

**AI asks smart follow-ups based on story:**

```typescript
function generateFollowUpQuestions(story: string, category: string): Question[] {
  // AI analyzes story and asks category-specific questions

  if (category === 'UFO') {
    const questions = []

    // If user mentioned "light" but not shape
    if (story.includes('licht') && !story.includes('form')) {
      questions.push({
        prompt: 'Konntest du eine Form erkennen?',
        type: 'text',
        optional: true,
        suggestions: ['Dreieck', 'Kugel', 'Zigarrenförmig', 'Keine Form erkennbar']
      })
    }

    // If user mentioned "moved" but not speed
    if (story.includes('bewegte') && !story.includes('schnell')) {
      questions.push({
        prompt: 'Wie schnell bewegte es sich?',
        type: 'text',
        optional: true,
        suggestions: ['Sehr schnell', 'Langsam schwebend', 'Normal wie ein Flugzeug']
      })
    }

    // Duration (always ask)
    questions.push({
      prompt: 'Wie lange hast du es beobachtet?',
      type: 'text',
      optional: true,
      suggestions: ['Wenige Sekunden', '1-5 Minuten', 'Länger als 5 Minuten']
    })

    // Sound (always ask)
    questions.push({
      prompt: 'Gab es Geräusche?',
      type: 'text',
      optional: true,
      suggestions: ['Komplett still', 'Summen', 'Anderes Geräusch']
    })

    return questions
  }

  // Similar logic for Dreams, NDE, Paranormal...
  return []
}
```

**AI asks questions one at a time (conversational):**

```
AI: Konntest du eine Form erkennen?

    [Dreieck] [Kugel] [Zigarrenförmig] [Keine Form]
    [Eigene Antwort eingeben...]

User: Es war eher kugelförmig

AI: Danke! Wie schnell bewegte es sich?

    [Sehr schnell] [Langsam schwebend] [Normal wie Flugzeug]

User: Sehr schnell, viel schneller als ein Flugzeug

AI: Verstehe. Wie lange hast du es insgesamt beobachtet?

    [Wenige Sekunden] [1-5 Minuten] [Länger als 5 Minuten]

User: Vielleicht 2-3 Minuten

AI: Gab es Geräusche?

    [Komplett still] [Summen] [Anderes Geräusch]

User: Komplett still
```

---

### Phase 3: Context & Enrichment

#### Step 3A: Location Refinement

```
AI: Du hast "Englischer Garten, München" erwähnt.

    Kannst du den Ort noch genauer beschreiben?
    Das hilft anderen, die dort auch etwas erlebt haben.

    [🗺️ Auf Karte zeigen]
    [Oder beschreiben: z.B. "Nähe Monopteros"]

User: [Clicks on map → sets marker]

AI: Perfekt! Marker gesetzt bei:
    📍 48.1642° N, 11.5954° E
    (Englischer Garten, Nähe Eisbach)

    ✅ Gespeichert
```

#### Step 3B: Witnesses & Verification

```
AI: Du warst mit deinem Hund unterwegs.
    Gab es noch andere Menschen in der Nähe?

User: Ja, ein Pärchen war auch da, die haben auch hochgeschaut

AI: Interessant! Das ist ein Zeuge.

    Weißt du, ob sie es auch gesehen haben?

User: Ja, sie haben auch gezeigt und gestaunt

AI: Stark! Das erhöht die Glaubwürdigkeit. ✅

    [1 Zeuge bestätigt]
```

#### Step 3C: Media Upload

```
AI: Hast du zufällig ein Foto oder Video gemacht?

    [📷 Foto hochladen] [📹 Video hochladen] [🎤 Audio]
    [Nein, leider nicht]

User: [Uploads blurry phone photo]

AI: Bild hochgeladen!

    ⚠️ Das Bild ist etwas unscharf - das ist aber völlig normal
       bei spontanen Aufnahmen. Trotzdem wertvoll!

    Möchtest du noch etwas zum Bild erklären?

User: Ja, man sieht das Licht oben rechts, aber es war viel heller

AI: Verstanden, notiert! ✅
```

---

### Phase 4: AI Analysis & Tagging

**AI analysiert die gesamte Story und extrahiert Attributes + Tags**

```
AI: Lass mich deine Geschichte analysieren... 🤔

    [Progress: Analyzing... 2s]

AI: Fertig! Ich habe folgende Details erkannt:

    **Strukturierte Attributes** (für Pattern Matching):
    ✅ Form: kugelförmig (85% AI confidence)
    ✅ Bewegung: zickzack (95% AI confidence)
    ✅ Geschwindigkeit: sehr schnell (90% AI confidence)
    ✅ Geräusch: geräuschlos (100% AI confidence)
    ✅ Dauer: 2-3 Minuten (95% AI confidence)
    ✅ Zeugen: Pärchen (100% User confirmed ✓)

    **Flexible Tags** (für Discovery):
    ✅ #licht #schnell #nacht #städtisch #zeuge

    Passen diese?

    [Alle übernehmen] [Einzeln bearbeiten]
```

**How Attributes Are Stored** (see [13-DATABASE-SCHEMA.md](./13-DATABASE-SCHEMA.md)):

```typescript
// Attributes → experience_attributes table
await supabase.from('experience_attributes').insert([
  { experience_id: 'uuid-123', key: 'shape', value: 'kugelförmig', confidence: 85, source: 'ai' },
  { experience_id: 'uuid-123', key: 'movement', value: 'zickzack', confidence: 95, source: 'ai' },
  { experience_id: 'uuid-123', key: 'speed', value: 'sehr_schnell', confidence: 90, source: 'ai' },
  { experience_id: 'uuid-123', key: 'sound', value: 'geräuschlos', confidence: 100, source: 'ai' },
  { experience_id: 'uuid-123', key: 'duration', value: '2-3_minuten', confidence: 95, source: 'ai' },
  { experience_id: 'uuid-123', key: 'witnesses', value: 'pärchen', confidence: 100, source: 'user' }
])

// Tags → experience_tags table
await supabase.from('experience_tags').insert([
  { experience_id: 'uuid-123', tag: '#licht', added_by: 'ai' },
  { experience_id: 'uuid-123', tag: '#schnell', added_by: 'ai' },
  { experience_id: 'uuid-123', tag: '#nacht', added_by: 'ai' },
  { experience_id: 'uuid-123', tag: '#städtisch', added_by: 'ai' },
  { experience_id: 'uuid-123', tag: '#zeuge', added_by: 'ai' }
])
```

**Why Structured Attributes + Tags?**
- **Attributes** = Structured data for AI reasoning & pattern detection
- **Tags** = Flexible keywords for search & discovery
- Both work together for optimal UX!

---

### Phase 4: AI Attribute Extraction (Implementation Details)

**Problem:** User gibt Natural Language Story → Wie extrahieren wir strukturierte Attributes?

**Solution:** GPT-4o-mini mit category-specific schemas + Structured Output

#### Extraction Pipeline

```typescript
// lib/extraction/attribute-extractor.ts

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function extractAttributesFromStory(
  story: string,
  category: string
): Promise<Attribute[]> {

  const schema = getCategorySchema(category)

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema,
    prompt: `Extract structured attributes from this experience story:

"${story}"

Be precise and only extract information explicitly mentioned.
Use null for missing information.`
  })

  return convertToAttributes(object, category)
}
```

#### Category-Specific Schemas

##### UFO Schema

```typescript
const UFOSchema = z.object({
  shape: z.enum([
    'sphere', 'triangle', 'cigar', 'disc', 'orb', 'other', 'unknown'
  ]).nullable(),

  color: z.enum([
    'white', 'red', 'blue', 'green', 'orange', 'multicolor', 'other'
  ]).nullable(),

  size: z.enum([
    'small', 'car-sized', 'house-sized', 'large', 'massive'
  ]).nullable(),

  movement: z.enum([
    'stationary', 'slow', 'fast', 'very_fast', 'erratic', 'zigzag'
  ]).nullable(),

  sound: z.enum([
    'silent', 'humming', 'buzzing', 'roaring', 'other'
  ]).nullable(),

  duration_seconds: z.number().min(1).max(86400).nullable(), // Max 24h

  altitude: z.enum([
    'ground_level', 'low', 'medium', 'high', 'very_high'
  ]).nullable(),

  weather: z.enum([
    'clear', 'cloudy', 'rainy', 'foggy', 'stormy'
  ]).nullable(),

  time_of_day: z.enum([
    'dawn', 'morning', 'afternoon', 'evening', 'night', 'midnight'
  ]).nullable(),

  proximity_meters: z.number().min(1).max(50000).nullable(), // Max 50km

  physical_effects: z.enum([
    'none', 'electromagnetic', 'physical_sensation', 'psychological', 'multiple'
  ]).nullable()
})
```

##### Dreams Schema

```typescript
const DreamsSchema = z.object({
  lucidity: z.enum([
    'not_lucid', 'semi_lucid', 'fully_lucid'
  ]).nullable(),

  vividness: z.enum([
    'vague', 'normal', 'very_vivid', 'hyperreal'
  ]).nullable(),

  recurring: z.boolean().nullable(),

  nightmare: z.boolean().nullable(),

  characters: z.array(z.enum([
    'family', 'friends', 'strangers', 'deceased', 'beings', 'animals', 'alone'
  ])).nullable(),

  environment: z.enum([
    'familiar', 'unfamiliar', 'surreal', 'otherworldly'
  ]).nullable(),

  emotions: z.array(z.enum([
    'fear', 'joy', 'anxiety', 'peace', 'confusion', 'awe', 'neutral'
  ])).nullable(),

  control_level: z.enum([
    'no_control', 'some_control', 'full_control'
  ]).nullable(),

  precognitive: z.boolean().nullable(),

  symbols: z.array(z.string()).max(10).nullable() // AI-extracted symbols
})
```

##### NDE (Near-Death Experience) Schema

```typescript
const NDESchema = z.object({
  cause: z.enum([
    'cardiac_arrest', 'accident', 'surgery', 'illness', 'other'
  ]).nullable(),

  obe: z.boolean().nullable(), // Out of Body Experience

  tunnel: z.boolean().nullable(),

  light: z.boolean().nullable(),

  beings: z.boolean().nullable(),

  deceased_relatives: z.boolean().nullable(),

  life_review: z.boolean().nullable(),

  choice_to_return: z.boolean().nullable(),

  transformed_after: z.boolean().nullable(),

  no_fear_of_death: z.boolean().nullable(),

  duration_minutes: z.number().min(0).max(1440).nullable(), // Max 24h

  consciousness_level: z.enum([
    'unconscious', 'semiconscious', 'fully_conscious', 'heightened'
  ]).nullable(),

  reality_perception: z.enum([
    'dreamlike', 'normal', 'hyperreal', 'more_real_than_reality'
  ]).nullable()
})
```

##### Paranormal Schema

```typescript
const ParanormalSchema = z.object({
  type: z.enum([
    'ghost', 'poltergeist', 'shadow_figure', 'apparition', 'voice', 'touch', 'other'
  ]).nullable(),

  location_type: z.enum([
    'home', 'public_place', 'nature', 'historical_site', 'other'
  ]).nullable(),

  time_of_day: z.enum([
    'morning', 'afternoon', 'evening', 'night', 'midnight'
  ]).nullable(),

  duration_minutes: z.number().min(0).max(1440).nullable(),

  visual: z.boolean().nullable(),

  auditory: z.boolean().nullable(),

  tactile: z.boolean().nullable(),

  olfactory: z.boolean().nullable(), // Smell

  temperature_change: z.boolean().nullable(),

  electromagnetic_effects: z.boolean().nullable(),

  fear_level: z.enum([
    'none', 'mild', 'moderate', 'intense', 'overwhelming'
  ]).nullable(),

  intelligent_interaction: z.boolean().nullable(), // Did it respond?

  recurring_location: z.boolean().nullable()
})
```

#### Conversion to Database Format

```typescript
function convertToAttributes(
  extracted: any,
  category: string
): Attribute[] {

  const attributes: Attribute[] = []

  Object.entries(extracted).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {

      let attributeValue: string | number | boolean = value

      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        attributeValue = value.join(', ')
      }

      attributes.push({
        key: `${category.toLowerCase()}.${key}`,
        value: String(attributeValue),
        source: 'ai_extraction',
        confidence: 0.85 // GPT-4o-mini confidence
      })
    }
  })

  return attributes
}
```

#### Full Example: UFO Story → Attributes

**Input Story:**
```
"Gestern Nacht gegen 23 Uhr sah ich ein extrem helles weißes Licht am Himmel.
Es war kugelförmig, etwa so groß wie ein Auto, und bewegte sich sehr schnell
in Zickzack-Bewegungen. Es war komplett still, kein Geräusch. Ich habe es
ungefähr 2-3 Minuten beobachtet, bevor es einfach verschwand. Der Himmel war
klar, Vollmond."
```

**AI Extraction:**
```json
{
  "shape": "sphere",
  "color": "white",
  "size": "car-sized",
  "movement": "zigzag",
  "sound": "silent",
  "duration_seconds": 150,
  "altitude": "medium",
  "weather": "clear",
  "time_of_day": "night",
  "proximity_meters": null,
  "physical_effects": "none"
}
```

**Database Insert:**
```sql
INSERT INTO experience_attributes (experience_id, key, value, source, confidence)
VALUES
  ('uuid-123', 'ufo.shape', 'sphere', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.color', 'white', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.size', 'car-sized', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.movement', 'zigzag', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.sound', 'silent', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.duration_seconds', '150', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.altitude', 'medium', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.weather', 'clear', 'ai_extraction', 0.85),
  ('uuid-123', 'ufo.time_of_day', 'night', 'ai_extraction', 0.85);
```

#### Schema Registry

```typescript
// lib/extraction/schema-registry.ts

export function getCategorySchema(category: string): z.ZodSchema {
  const schemas = {
    'ufo': UFOSchema,
    'dreams': DreamsSchema,
    'nde': NDESchema,
    'paranormal': ParanormalSchema,
    'oobe': OOBESchema, // Out of Body Experience
    'synchronicity': SynchronicitySchema,
    'healing': HealingSchema,
    'psychic': PsychicSchema
    // Add more as needed
  }

  return schemas[category] || z.object({}) // Fallback empty
}
```

#### Cost Analysis

```
Model: GPT-4o-mini
Avg Input: 300 tokens (story)
Avg Output: 150 tokens (structured JSON)
Cost per extraction: ~$0.00007

Monthly (1000 submissions): $0.07 💰
```

**Why GPT-4o-mini?**
- Fast (1-2s response)
- Cheap ($0.00007 per extraction)
- Structured output support
- Good at extraction tasks

**See Also:** [16-DATA-QUALITY.md § 6](./16-DATA-QUALITY.md) for enrichment details

---

### Phase 5: Similarity Matching

**AI findet ähnliche Erlebnisse BEFORE submission**

```
AI: Moment, ich prüfe ob es ähnliche Erlebnisse gibt...

    [Progress: Searching... 3s]

AI: Wow! Ich habe 8 sehr ähnliche Erlebnisse gefunden:

    ┌─────────────────────────────────────┐
    │ 🛸 "Helles Licht über dem Eisbach" │
    │ 📅 15.02.2024, 23:45 Uhr           │
    │ 🎯 87% ähnlich                      │
    │ [Details ansehen →]                 │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │ 🛸 "Schnelle Lichtbewegung"         │
    │ 📅 03.03.2024, 22:30 Uhr           │
    │ 🎯 83% ähnlich                      │
    │ [Details ansehen →]                 │
    └─────────────────────────────────────┘

    [+6 weitere Matches]

    Das heißt: Du bist NICHT allein! 🤝

    Möchtest du eines davon ansehen, bevor du einträgst?

    [Ja, zeig mir #1] [Nein, direkt eintragen]
```

**If user clicks "Ja":**
```
AI: [Shows full experience #1 in modal]

    Das Erlebnis von @user123:
    "Gestern Nacht sah ich ein helles weißes Licht..."

    [Zurück zu meiner Submission]

    Möchtest du @user123 bei deinem Eintrag erwähnen?

    [Ja, verlinken] [Nein]
```

---

### Phase 6: Privacy & Visibility

```
AI: Fast fertig! Noch ein wichtiger Punkt:

    Wer soll dein Erlebnis sehen können?

    [🌐 Öffentlich] - Jeder kann es sehen & suchen
                      Du bleibst anonym (username nur)

    [👥 Community]  - Nur registrierte XPShare User

    [🔒 Privat]     - Nur du (für deine Aufzeichnung)

    Standard: Öffentlich ✅

User: [Wählt Öffentlich]

AI: Perfekt! Dein Erlebnis wird öffentlich.

    Du bleibst trotzdem anonym:
    Angezeigt wird nur "Tom_1234" (nicht dein echter Name)
```

---

### Phase 7: Final Review & Submit

```
AI: Super! Lass uns nochmal alles durchgehen:

    ┌─────────────────────────────────────────┐
    │ 📝 DEIN ERLEBNIS                        │
    ├─────────────────────────────────────────┤
    │ Titel: Helles Licht über Englischer G.  │
    │ Kategorie: UFO 🛸                       │
    │ Datum: 25.10.2024, 23:00 Uhr           │
    │ Ort: Englischer Garten, München         │
    │ Zeugen: 1 (Pärchen)                    │
    │ Dauer: 2-3 Minuten                     │
    │ Beschreibung: (250 Wörter)             │
    │ Tags: #licht #schnell #nacht #zickzack  │
    │ Media: 1 Foto                           │
    │ Sichtbarkeit: Öffentlich                │
    └─────────────────────────────────────────┘

    [✏️ Bearbeiten] [✅ Jetzt eintragen]

User: [Clicks "Jetzt eintragen"]

AI: Wird eingereicht...

    [Progress: Uploading... 2s]

    ✅ Geschafft! Dein Erlebnis wurde eingetragen!

    🎉 Du hast gerade 10 XP erhalten!
    🏆 Badge freigeschaltet: "First Contribution"

    Was passiert jetzt?

    1. Dein Erlebnis wird automatisch mit ähnlichen gematcht
    2. Du bekommst Benachrichtigungen, wenn andere reagieren
    3. Du kannst es jederzeit bearbeiten oder ergänzen

    [Mein Erlebnis ansehen] [Zurück zur Discovery]
```

---

## 🤖 Technical Implementation

### Component Structure

```typescript
// app/[locale]/submit/ai-guided/page.tsx

'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function AIGuidedSubmissionPage() {
  const [phase, setPhase] = useState<SubmissionPhase>('discovery')
  const [experienceData, setExperienceData] = useState<Partial<Experience>>({})

  const { messages, sendMessage, status } = useChat({
    api: '/api/submit/chat',
    body: { phase, experienceData },
    onFinish: (message) => {
      // Check if phase should advance
      if (message.content.includes('PHASE_COMPLETE')) {
        advancePhase()
      }
    }
  })

  const advancePhase = () => {
    const phases: SubmissionPhase[] = [
      'discovery',
      'story',
      'clarification',
      'context',
      'analysis',
      'matching',
      'privacy',
      'review'
    ]
    const currentIndex = phases.indexOf(phase)
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1])
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress Bar */}
      <ProgressBar phase={phase} />

      {/* Chat Messages */}
      <div className="space-y-4 my-8">
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Input Area (context-aware) */}
      {phase === 'story' && (
        <StoryInput
          onSubmit={(story) => {
            setExperienceData(prev => ({ ...prev, description: story }))
            sendMessage(story)
          }}
        />
      )}

      {phase === 'clarification' && (
        <QuestionInput
          questions={extractQuestions(messages)}
          onAnswer={(answers) => {
            setExperienceData(prev => ({ ...prev, ...answers }))
            sendMessage(JSON.stringify(answers))
          }}
        />
      )}

      {phase === 'context' && (
        <LocationPicker
          onSelect={(location) => {
            setExperienceData(prev => ({ ...prev, ...location }))
            sendMessage(`Location: ${location.name}`)
          }}
        />
      )}

      {/* ... other phase-specific inputs */}
    </div>
  )
}
```

### AI API Route

```typescript
// app/api/submit/chat/route.ts

export async function POST(req: Request) {
  const { messages, phase, experienceData } = await req.json()
  const user = await getUser()

  const stream = await streamText({
    model: anthropic('claude-3-7-sonnet-20250219'),
    messages,
    system: getSystemPromptForPhase(phase, experienceData),
    tools: {
      analyzeStory: tool({
        description: 'Analyze user story and extract structured data',
        parameters: z.object({
          story: z.string()
        }),
        execute: async ({ story }) => {
          // Use AI to extract: category, date, location, tags, etc.
          const analysis = await analyzeStoryWithAI(story)
          return analysis
        }
      }),

      findSimilarExperiences: tool({
        description: 'Find similar experiences in database',
        parameters: z.object({
          description: z.string(),
          category: z.string()
        }),
        execute: async ({ description, category }) => {
          const embedding = await generateEmbedding(description)
          const { data } = await supabase.rpc('match_experiences', {
            query_embedding: embedding,
            match_threshold: 0.75,
            match_count: 10,
            filter_category: category
          })
          return data
        }
      }),

      suggestTags: tool({
        description: 'Suggest tags based on story',
        parameters: z.object({
          story: z.string(),
          category: z.string()
        }),
        execute: async ({ story, category }) => {
          const tags = await generateTagsWithAI(story, category)
          return tags
        }
      })
    }
  })

  return stream.toDataStreamResponse()
}

function getSystemPromptForPhase(
  phase: SubmissionPhase,
  experienceData: Partial<Experience>
): string {
  switch (phase) {
    case 'discovery':
      return `You are a friendly AI guide helping users share their extraordinary experiences.
              Be warm, encouraging, and curious. Ask open-ended questions.`

    case 'story':
      return `Listen to the user's story. Show empathy and interest.
              Extract key details: when, where, what happened, witnesses.
              Don't interrupt - let them tell the full story first.`

    case 'clarification':
      return `Ask category-specific follow-up questions based on the story.
              Keep it conversational, ask one question at a time.
              Make it optional - users can skip if they want.`

    case 'analysis':
      return `Analyze the story and suggest relevant tags.
              Explain why each tag is suggested.
              Let user approve or modify.`

    case 'matching':
      return `Show similar experiences found. Highlight the similarities.
              Make user feel validated - "You're not alone!"`

    case 'review':
      return `Summarize everything clearly. Let user review before final submit.
              Be excited and encouraging - they're making a contribution!`

    default:
      return 'You are a helpful AI assistant.'
  }
}
```

---

## 🎨 UI Components

### ProgressBar

```typescript
export function ProgressBar({ phase }: { phase: SubmissionPhase }) {
  const phases = [
    { id: 'discovery', label: 'Start', icon: '👋' },
    { id: 'story', label: 'Geschichte', icon: '📝' },
    { id: 'clarification', label: 'Details', icon: '🔍' },
    { id: 'context', label: 'Kontext', icon: '📍' },
    { id: 'analysis', label: 'Analyse', icon: '🤖' },
    { id: 'matching', label: 'Matches', icon: '🎯' },
    { id: 'privacy', label: 'Sichtbarkeit', icon: '🔒' },
    { id: 'review', label: 'Review', icon: '✅' }
  ]

  const currentIndex = phases.findIndex(p => p.id === phase)

  return (
    <div className="flex justify-between items-center">
      {phases.map((p, index) => (
        <div
          key={p.id}
          className={cn(
            'flex flex-col items-center',
            index <= currentIndex ? 'text-blue-600' : 'text-gray-400'
          )}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center mb-1',
              index <= currentIndex ? 'bg-blue-100' : 'bg-gray-100'
            )}
          >
            {p.icon}
          </div>
          <span className="text-xs">{p.label}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 Success Metrics

**Submission Quality:**
- ✅ Complete submissions: >90% (vs 40% with old form)
- ✅ Average word count: >150 words (vs 80 with old form)
- ✅ Has location: >70% (vs 30%)
- ✅ Has tags: >95% (vs 50%)

**User Experience:**
- ✅ Time to complete: <8 min (vs 12 min with old form)
- ✅ Drop-off rate: <15% (vs 60%)
- ✅ User satisfaction: >4.5/5

**Conversion:**
- ✅ Discovery → Submission: >30% (vs 10%)
- ✅ Return to submit more: >40% (vs 15%)

---

**Nächstes Dokument:** 12-MOBILE-FIRST.md (Mobile UX)
