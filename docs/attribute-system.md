# XPShare Attribute Extraction System

**Version:** 1.1
**Status:** Design Finalized - Implementation Ready
**Related:** docs/category.md (v3.1)
**Letzte Änderung:** 2025-10-13

---

## ✅ FINALIZED DESIGN DECISIONS

### Question Logic: Option A (Smart Pre-filled System)
✅ **GEWÄHLT:** Alle Questions zeigen mit AI Pre-fills
- User sieht was AI erkannt hat (Transparenz)
- "Alle bestätigen" Button für 1-Click
- XP Bonus für Bestätigungen
- Mehr Vertrauen durch Sichtbarkeit

❌ **ABGELEHNT:** Option B (Nur Low-Confidence Questions)
- User sieht nicht was AI erkannt hat
- Weniger transparent

### Attribute Display: ExtractionSidebar Integration
✅ **WO:** Rechte ExtractionSidebar (Step 2)
✅ **WANN:** Nach AI-Analyse, BEVOR Questions
🚧 **STATUS:** Noch nicht implementiert (Phase 4)

User kann Attributes direkt in Sidebar editieren, Änderungen werden als Pre-fills in Questions übernommen.

### Attribute Storage: Overwrite on Confirmation
✅ **GEWÄHLT:** UPDATE existing row when user confirms
- `confidence: 1.0, source: 'user_confirmed'`
- Keine Duplikate

❌ **ABGELEHNT:** Keep both AI and user versions

### Flow Timing: No AI in Step 1
✅ Step 1: Keine AI während User tippt (Kosten: $0)
✅ Step 2: AI-Analyse nach "Weiter" Klick (Kosten: ~$0.0005)
✅ Step 3: Questions mit Pre-fills (Kosten: $0, nur DB read)

---

## Problem Statement

**FRAGE:** Sollen UFO-Formen (triangle, orb, disc) eigene Sub-Sub-Kategorien sein?

**ANTWORT:** NEIN! Sie sind **Attribute**, keine Kategorien.

## Kategorien vs. Attribute

### Kategorien (2 Levels)
- **Zweck:** Grobe Klassifizierung des Erlebnis-TYPS
- **Beispiele:** UFO-Sichtung, Geist-Begegnung, NTE
- **Anzahl:** 8 Haupt × 6 Unter = 48 Kategorien (fixed)
- **User wählt:** 1 Hauptkategorie (obligatorisch)

### Attribute (Dynamic)
- **Zweck:** Detaillierte Beschreibung der EIGENSCHAFTEN
- **Beispiele:** triangle, metallic, red-lights, hovering
- **Anzahl:** Unbegrenzt (AI extrahiert automatisch)
- **System extrahiert:** Automatisch aus Text + User kann ergänzen

## Database Schema

```sql
-- =====================================================
-- EXPERIENCE ATTRIBUTES TABLE
-- =====================================================
CREATE TABLE experience_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  attribute_key text NOT NULL,
  attribute_value text NOT NULL,
  confidence float,
  source text DEFAULT 'ai_extracted' CHECK (source IN ('ai_extracted', 'user_input', 'community_tag', 'question_answer')),
  verified_by_user boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_exp_attr_experience ON experience_attributes(experience_id);
CREATE INDEX idx_exp_attr_key_value ON experience_attributes(attribute_key, attribute_value);
CREATE INDEX idx_exp_attr_key ON experience_attributes(attribute_key);
CREATE INDEX idx_exp_attr_source ON experience_attributes(source);

-- Full-text search on attribute values
CREATE INDEX idx_exp_attr_value_fts ON experience_attributes USING gin(to_tsvector('english', attribute_value));

-- RLS Policies
ALTER TABLE experience_attributes ENABLE ROW LEVEL SECURITY;

-- Anyone can read attributes of public experiences
CREATE POLICY "Public read experience attributes"
  ON experience_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
      AND e.visibility = 'public'
    )
  );

-- Users can add attributes to their own experiences
CREATE POLICY "Users can add attributes to own experiences"
  ON experience_attributes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
      AND e.user_id = auth.uid()
    )
  );

-- =====================================================
-- ATTRIBUTE SUGGESTIONS (Community Tags)
-- =====================================================
CREATE TABLE attribute_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  attribute_key text NOT NULL,
  attribute_value text NOT NULL,
  suggested_by uuid REFERENCES auth.users(id),
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX idx_attr_suggest_exp ON attribute_suggestions(experience_id);
CREATE INDEX idx_attr_suggest_status ON attribute_suggestions(status);

-- =====================================================
-- ATTRIBUTE SCHEMA (Predefined Keys)
-- =====================================================
-- Optional: Define common attribute keys for consistency
CREATE TABLE attribute_schema (
  key text PRIMARY KEY,
  display_name text NOT NULL,
  category_slug text REFERENCES question_categories(slug),
  data_type text DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'boolean', 'date', 'enum')),
  allowed_values jsonb,  -- For enum types: ["triangle", "disc", "orb"]
  description text,
  is_searchable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Common attribute keys
INSERT INTO attribute_schema (key, display_name, category_slug, data_type, allowed_values) VALUES
  -- UFO attributes
  ('shape', 'Form/Shape', 'extraterrestrial-sky/ufo-uap', 'enum', '["triangle", "disc", "orb", "cigar", "cylinder", "rectangle", "sphere", "other"]'),
  ('surface', 'Oberfläche', 'extraterrestrial-sky/ufo-uap', 'enum', '["metallic", "glowing", "translucent", "matte", "reflective"]'),
  ('lights', 'Lichter', 'extraterrestrial-sky/ufo-uap', 'text', null),
  ('light_color', 'Lichtfarbe', 'extraterrestrial-sky/ufo-uap', 'enum', '["white", "red", "blue", "green", "orange", "yellow", "multicolor"]'),
  ('movement', 'Bewegung', 'extraterrestrial-sky/ufo-uap', 'enum', '["hovering", "fast", "erratic", "smooth", "zigzag", "ascending", "descending"]'),
  ('sound', 'Geräusch', 'extraterrestrial-sky/ufo-uap', 'enum', '["silent", "humming", "buzzing", "roaring", "whistling", "other"]'),
  ('size', 'Größe', 'extraterrestrial-sky/ufo-uap', 'enum', '["tiny", "small", "medium", "large", "huge"]'),

  -- Ghost/Entity attributes
  ('entity_type', 'Art des Wesens', 'entities-apparitions/ghosts', 'enum', '["human", "shadow", "animal", "child", "elderly", "unknown"]'),
  ('entity_appearance', 'Erscheinung', 'entities-apparitions/ghosts', 'enum', '["solid", "transparent", "shadow", "mist", "glowing"]'),
  ('entity_behavior', 'Verhalten', 'entities-apparitions/ghosts', 'enum', '["benign", "aggressive", "playful", "sad", "angry", "confused"]'),

  -- Consciousness attributes
  ('intensity', 'Intensität', null, 'enum', '["mild", "moderate", "strong", "overwhelming"]'),
  ('duration', 'Dauer', null, 'text', null),
  ('emotional_state', 'Emotionaler Zustand', null, 'enum', '["peaceful", "fearful", "joyful", "confused", "awe", "terror"]'),

  -- Time/Space attributes
  ('time_distortion', 'Zeitverzerrung', 'time-space-sync', 'enum', '["faster", "slower", "stopped", "backwards", "loop"]'),
  ('missing_time_duration', 'Fehlende Zeit (Dauer)', 'time-space-sync/missing-time', 'text', null),

  -- Health attributes
  ('body_part', 'Körperteil', 'health-healing', 'text', null),
  ('diagnosis', 'Diagnose', 'health-healing', 'text', null),
  ('healing_method', 'Heilungsmethode', 'health-healing', 'enum', '["spontaneous", "energy_healing", "prayer", "meditation", "unknown"]')
ON CONFLICT (key) DO NOTHING;
```

## AI Extraction Pipeline

### 1. Text Analysis

```typescript
// api/submit/extract-attributes
export async function extractAttributes(text: string, category_slug: string) {
  const prompt = `
  Analyze this experience report and extract structured attributes.
  Category: ${category_slug}

  Text: "${text}"

  Extract ONLY attributes that are explicitly mentioned or strongly implied.
  Format as JSON with confidence scores.

  Common attributes for ${category_slug}:
  ${getAttributeSchemaForCategory(category_slug)}

  Return JSON:
  {
    "attributes": {
      "attribute_key": {
        "value": "extracted_value",
        "confidence": 0.95,
        "evidence": "relevant text snippet"
      }
    }
  }
  `

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  return JSON.parse(response.content[0].text)
}
```

### 2. User Review Screen

```tsx
// components/submit/AttributeReview.tsx
export function AttributeReview({ extractedAttributes, onConfirm }) {
  return (
    <div className="space-y-4">
      <h2>🤖 Wir haben folgende Details erkannt:</h2>

      {Object.entries(extractedAttributes).map(([key, data]) => (
        <div key={key} className="flex items-center gap-2">
          <Badge>{getAttributeDisplayName(key)}</Badge>
          <Input
            value={data.value}
            onChange={(e) => updateAttribute(key, e.target.value)}
          />
          <Badge variant="outline">{(data.confidence * 100).toFixed(0)}%</Badge>
        </div>
      ))}

      <Button onClick={() => setShowAddCustom(true)}>
        + Weitere Details hinzufügen
      </Button>

      <Button onClick={onConfirm}>Bestätigen & Weiter</Button>
    </div>
  )
}
```

### 3. Storage

```typescript
// After user confirms
async function saveAttributes(experienceId: string, attributes: Record<string, any>) {
  const supabase = createClient()

  const records = Object.entries(attributes).map(([key, data]) => ({
    experience_id: experienceId,
    attribute_key: key,
    attribute_value: data.value,
    confidence: data.confidence,
    source: 'ai_extracted',
    verified_by_user: true
  }))

  await supabase.from('experience_attributes').insert(records)
}
```

## Dynamic Questions Integration

Questions können **direkt Attribute füllen**:

```sql
-- dynamic_questions table
ALTER TABLE dynamic_questions
ADD COLUMN maps_to_attribute text REFERENCES attribute_schema(key);

-- Example question:
{
  category_id: 'ufo-uap',
  question_text: 'Welche Form hatte das Objekt?',
  question_type: 'chips',
  options: ['Triangle', 'Disc', 'Orb', 'Cigar', 'Other'],
  maps_to_attribute: 'shape'  // ← Maps to attribute!
}
```

When user answers:
```typescript
// Instead of saving to experience_answers:
await supabase.from('experience_attributes').insert({
  experience_id: experienceId,
  attribute_key: question.maps_to_attribute,  // 'shape'
  attribute_value: userAnswer.toLowerCase(),  // 'triangle'
  source: 'question_answer',
  verified_by_user: true
})
```

## Search & Filter UI

```tsx
// components/feed/AttributeFilters.tsx
export function AttributeFilters({ category }) {
  const { data: availableAttributes } = useFetch(
    `/api/attributes/available?category=${category}`
  )

  return (
    <div className="space-y-4">
      <h3>Filtern nach Details:</h3>

      {availableAttributes.map(({ key, values, counts }) => (
        <div key={key}>
          <Label>{getAttributeDisplayName(key)}</Label>
          <div className="flex flex-wrap gap-2">
            {values.map(value => (
              <Checkbox
                key={value}
                label={`${value} (${counts[value]})`}
                onChange={() => toggleFilter(key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## API Endpoints

```typescript
// GET /api/attributes/available
// Returns all attribute keys/values for a category with counts
{
  "shape": {
    "values": ["triangle", "disc", "orb"],
    "counts": { "triangle": 89, "disc": 67, "orb": 45 }
  },
  "surface": {
    "values": ["metallic", "glowing"],
    "counts": { "metallic": 134, "glowing": 87 }
  }
}

// GET /api/experiences?category=ufo-uap&shape=triangle&surface=metallic
// Search with attribute filters

// POST /api/attributes/suggest
// Community suggests new attribute for an experience
{
  "experience_id": "uuid",
  "attribute_key": "sound",
  "attribute_value": "humming"
}
```

## Pattern Analysis

```sql
-- Find correlations
SELECT
  a1.attribute_value as shape,
  COUNT(DISTINCT CASE WHEN ec.category_slug LIKE '%missing-time%' THEN a1.experience_id END) as with_missing_time,
  COUNT(DISTINCT a1.experience_id) as total
FROM experience_attributes a1
JOIN experience_categories ec ON a1.experience_id = ec.experience_id
WHERE a1.attribute_key = 'shape'
GROUP BY a1.attribute_value;

-- Result:
-- triangle: 85/89 have missing time (95%)
-- disc: 23/67 have missing time (34%)
-- orb: 5/45 have missing time (11%)
```

## Benefits Summary

✅ **Infinite Skalierbarkeit** - Neue Attribute ohne Schema-Änderung
✅ **AI-Powered** - Automatische Extraktion aus Freitext
✅ **Flexible Search** - Multi-dimensional filtering
✅ **Pattern Discovery** - ML-ready für Korrelationsanalyse
✅ **Community-Driven** - User können Tags vorschlagen
✅ **No Category Explosion** - 48 Kategorien statt 480+
✅ **Better UX** - User muss nicht 50+ Sub-Kategorien navigieren
✅ **Integration** - Dynamic Questions können Attribute füllen

## Migration from Current System

1. Keep existing 2-level categories
2. Add experience_attributes table
3. AI extracts attributes for new submissions
4. Backfill: Run AI extraction on existing experiences
5. Update search/filter UI to use attributes

## Next Steps

1. ✅ Document attribute system (this file)
2. ⏳ Create migration for experience_attributes table
3. ⏳ Implement AI extraction in /api/submit/analyze
4. ⏳ Build AttributeReview component
5. ⏳ Update dynamic_questions with maps_to_attribute
6. ⏳ Implement attribute-based search
7. ⏳ Build community tag suggestion system

---

**Conclusion:** Attributes > Sub-Sub-Categories for scalability, flexibility, and pattern analysis.
