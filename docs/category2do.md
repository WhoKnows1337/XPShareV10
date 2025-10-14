# XPShare Attribute System - Verbleibende Aufgaben

**Stand:** 2025-10-14
**Basiert auf:** category.md v3.1

---

## ✅ BEREITS FERTIG

### Phase 1: Database & Seed
- ✅ **Attribute Schema Table** - 89 Attributes in DB über 31 Kategorien
- ✅ **Experience Attributes Table** - Mit RLS Policies
- ✅ **Pattern Discovery Functions** - 7 SQL Functions für Correlations, Geo-Clustering, etc.

### Phase 2: Backend APIs
- ✅ **POST /api/submit/analyze-complete** - Extrahiert Attributes via AI
- ✅ **POST /api/submit/publish** - Speichert Attributes in experience_attributes
- ✅ **GET /api/admin/attributes** - List all attributes
- ✅ **POST /api/admin/attributes** - Create attribute
- ✅ **PATCH /api/admin/attributes/[key]** - Update attribute
- ✅ **DELETE /api/admin/attributes/[key]** - Delete attribute
- ✅ **GET /api/patterns/for-experience/[id]** - Pattern Insights API

### Phase 3: Admin Interface
- ✅ **/admin/attributes Page** - Complete CRUD UI
  - Category & Type filters
  - Multilanguage fields (EN/DE/FR/ES)
  - Enum value management
  - ~500 lines React code

### Phase 4: User Flow
- ✅ **AIResultsSection Enhancement** - Zeigt AI-extrahierte Attributes
  - Confidence scores mit color coding
  - German translations
  - Edit inline möglich
- ✅ **Question Flow Pre-fills (Option A)**
  - "🤖 KI hat X Attribute erkannt" Banner
  - "✓ Alle bestätigen" Button (1-Click Confirmation)
  - Confidence display in allen Question Types
  - +5 XP Bonus per confirmed attribute
  - Enhanced Components:
    - MultiChoice mit AI-Vorschlag Badges
    - TextQuestion mit confidence
    - BooleanQuestion mit confidence
    - SliderQuestion mit confidence
- ✅ **Publish mit Attribute Storage**
  - Speichert in experience_attributes
  - Updates confidence to 1.0 bei User-Bestätigung
  - Sets source = 'user_confirmed'
  - +5 XP bonus per confirmed attribute

### Phase 6: Multilanguage
- ✅ **Translation Keys für Attributes**
  - ~150 German translations in messages/de.json
  - Keys: shape→Form, surface→Oberfläche
  - Values: triangle→Dreieck, metallic→Metallisch

---

## 🚧 IN ARBEIT / TEILWEISE FERTIG

### Phase 2: Backend APIs
- ⏳ **POST /api/submit/enrich-text** - Text Enrichment
  - Status: API Route existiert, muss getestet werden
  - Integriert Answers in Original Text

### Phase 3: Admin Interface
- ⏳ **Question Editor Enhanced** - Attribute Mapping UI
  - Status: Basic Question Editor existiert in /admin/questions
  - Fehlt: UI für `maps_to_attribute` Feld
  - Fehlt: Value Mapping Interface (Option "Triangle" → "triangle")
  - Route: `/admin/questions` und `/admin/categories/[slug]`

- ⏳ **Category Status Display**
  - Status: Teilweise in /admin vorhanden
  - Fehlt: Question Count, Attribute Count pro Category
  - Fehlt: Warning bei 0 Questions
  - Fehlt: "[Use Template]" Button

---

## ✅ SPRINT 1 KOMPLETT (2025-10-14)

### Abgeschlossene Aufgaben:
1. ✅ **GET /api/attributes/available** (app/api/attributes/available/route.ts)
   - Returns filterable attributes with value counts
   - Supports category filtering
   - Used by AttributeFilters component

2. ✅ **Question Merging Logic** (lib/utils/confidenceChecker.ts:288-296)
   - Verified: Already correctly implemented
   - Merges AI attributes into questions as pre-fills
   - Sets confidence, isAISuggestion, and XP bonus

3. ✅ **AttributeFilters Component** (components/filters/AttributeFilters.tsx)
   - Multi-select checkboxes with counts
   - URL state synchronization
   - Auto-expands first 3 attributes
   - Active filter badges with remove buttons
   - Translation support

4. ✅ **Pattern Insights Component** (components/experience-detail/PatternInsights.tsx)
   - Displays similar experiences with similarity scores
   - Shows pattern strength percentage
   - Fetches from /api/patterns/analyze
   - Loading/error/empty states
   - Framer Motion animations

---

## ✅ SPRINT 2 KOMPLETT (2025-10-14)

### Abgeschlossene Aufgaben:
1. ✅ **Question Editor Attribute Mapping UI** (components/admin/question-editor-dialog.tsx)
   - Dropdown to select `maps_to_attribute` field
   - Auto-loads available attributes from /api/admin/attributes
   - Value mapping preview for chips/chips-multi questions
   - Shows how options map to canonical lowercase values
   - Visual feedback: "AI will pre-fill this question" banner
   - Saves maps_to_attribute to database

2. ✅ **Category Status Dashboard** (app/[locale]/admin/page.tsx)
   - Shows question counts, attribute counts, and answer rates
   - Warning badges for categories with 0 questions
   - Orange background highlight for empty categories
   - "Add Questions" CTA button for empty categories
   - Icons for questions (MessageSquare) and attributes (Tag)
   - Fetches attribute counts from attribute_schema table

---

## ✅ SPRINT 3 KOMPLETT (2025-10-14)

### Abgeschlossene Aufgaben:
1. ✅ **Hybrid Similar Experiences API** (app/api/experiences/[id]/similar-hybrid/route.ts)
   - Combines tag/location matching (60%) with attribute matching (40%)
   - Haversine distance calculation for geographic proximity
   - Returns top matches with detailed scoring breakdown
   - Shows shared attributes and match reasons

2. ✅ **Backfill Attributes API** (app/api/admin/backfill-attributes/route.ts)
   - Admin endpoint to re-analyze existing experiences
   - Uses OpenAI GPT-4o-mini for attribute extraction
   - Fuzzy matching with Levenshtein distance for enum validation
   - Processes up to 10 experiences per batch
   - Skips experiences that already have attributes

3. ✅ **Attribute Suggestions Table** (via Supabase MCP)
   - Table created with RLS policies
   - Community can suggest new attribute values
   - Upvote/downvote system
   - Admin review workflow (pending/approved/rejected)
   - Helper functions: approve_attribute_suggestion, reject_attribute_suggestion

4. ✅ **Category Validation Trigger** (via Supabase MCP)
   - Function: check_category_has_questions()
   - Prevents activation of categories without questions
   - Trigger on question_categories UPDATE
   - Raises exception with clear error message

---

## ❌ NOCH ZU ERLEDIGEN

### Phase 1: Database & Seed (Minor Tasks)

#### 1.3 Seed Question Templates
**Task:** Erstelle npm Script `npm run db:seed:question-templates`
- Lädt Standard-Questions für jede Kategorie
- Mapping zu Attributes bereits vorbereitet
- Multilanguage (DE, EN, FR, ES)

**Beispiel für UFO/UAP:**
```json
[
  {
    "question_text": "Welche Form hatte das Objekt?",
    "question_text_en": "What shape was the object?",
    "question_type": "chips",
    "options": ["Triangle", "Disc", "Orb", "Cigar", "Cylinder"],
    "maps_to_attribute": "shape",
    "priority": 10,
    "is_optional": false
  },
  {
    "question_text": "Wie war die Oberfläche?",
    "question_text_en": "What was the surface like?",
    "question_type": "chips",
    "options": ["Metallic", "Glowing", "Matte", "Translucent"],
    "maps_to_attribute": "surface",
    "priority": 20,
    "is_optional": true
  }
]
```

---

### Phase 2: Backend APIs

#### 2.1 GET /api/attributes/available
**Purpose:** Frontend Filters (zeigt nur Attributes mit Experiences)
```typescript
GET /api/attributes/available?category=ufo-uap

Response:
{
  "shape": {
    "display_name": "Form",
    "display_name_de": "Form",
    "values": [
      { "value": "triangle", "count": 89, "label_de": "Dreieck" },
      { "value": "disc", "count": 67, "label_de": "Scheibe" },
      { "value": "orb", "count": 45, "label_de": "Kugel" }
    ]
  },
  "surface": {
    "display_name": "Surface",
    "display_name_de": "Oberfläche",
    "values": [
      { "value": "metallic", "count": 73, "label_de": "Metallisch" },
      { "value": "glowing", "count": 56, "label_de": "Leuchtend" }
    ]
  }
}
```
**Verwendet für:**
- Search Filter Dropdowns
- Experience Feed Filters
- Statistics Dashboards

#### 2.2 POST /api/admin/attributes/backfill
**Purpose:** Backfill Attributes für alte Experiences
```typescript
POST /api/admin/attributes/backfill
{
  "limit": 100,               // Process max 100 at a time
  "category": "ufo-uap",      // Optional: specific category
  "dryRun": false             // Test mode
}

Response:
{
  "processed": 89,
  "success": 82,
  "failed": 7,
  "cost": "$0.027",
  "time": "45s",
  "errors": [...]
}
```
**Kosten:** ~$0.0003 pro Experience (5000 Experiences = $1.50)

#### 2.3 GET /api/questions Merging Logic
**Current Status:** Lädt Questions aus DB
**Missing:** Pre-fill Logic mit AI-Attributes

**Erforderliche Änderung in `lib/utils/confidenceChecker.ts`:**
```typescript
export async function generateQuestions(
  extractedData: SubmitStore['extractedData']
): Promise<Question[]> {
  // ... existing code ...

  // NEW: Merge AI attributes into questions
  dbQuestions.forEach((dbQ) => {
    if (dbQ.mapsToAttribute && extractedData.attributes[dbQ.mapsToAttribute]) {
      const attribute = extractedData.attributes[dbQ.mapsToAttribute]
      question.currentValue = attribute.value
      question.confidence = attribute.confidence
      question.isAISuggestion = !attribute.isManuallyEdited
      // Boost XP for confirming AI suggestions
      question.xpBonus = (question.xpBonus || 0) + 5
    }
  })
}
```

---

### Phase 3: Admin Interface

#### 3.1 Question Editor - Attribute Mapping UI
**Route:** `/admin/questions` und `/admin/categories/[slug]`

**Zu implementieren:**

1. **Attribute Mapping Dropdown**
```tsx
<Select
  value={question.maps_to_attribute}
  onValueChange={(key) => updateQuestion({ maps_to_attribute: key })}
>
  <SelectTrigger>
    <SelectValue placeholder="Maps to Attribute (optional)" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">None</SelectItem>
    {attributeSchema
      .filter(attr => attr.category_slug === currentCategory || !attr.category_slug)
      .map(attr => (
        <SelectItem key={attr.key} value={attr.key}>
          {attr.display_name} ({attr.key})
        </SelectItem>
      ))
    }
  </SelectContent>
</Select>
```

2. **Value Mapping Helper (Auto-lowercase)**
```tsx
{question.maps_to_attribute && question.type === 'chips' && (
  <div className="border rounded p-3 bg-blue-50 mt-3">
    <h4 className="font-medium mb-2">Value Mapping</h4>
    <p className="text-sm text-gray-600 mb-2">
      Question options will be auto-mapped to lowercase canonical values
    </p>
    {question.options.map((opt, i) => (
      <div key={i} className="flex items-center gap-2 text-sm">
        <span className="font-mono">{opt}</span>
        <span>→</span>
        <code className="bg-gray-100 px-2 py-0.5 rounded">
          {opt.toLowerCase().replace(/\s+/g, '_')}
        </code>
      </div>
    ))}
  </div>
)}
```

3. **Pre-fill Checkbox**
```tsx
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={question.aiAdaptive}
    onChange={(e) => updateQuestion({ aiAdaptive: e.target.checked })}
  />
  <span>Pre-fill from AI wenn verfügbar</span>
</label>
```

#### 3.2 Category Status Dashboard
**Route:** `/admin/categories`

**Zu zeigen pro Category:**
```tsx
<div className="space-y-2">
  <h3>{category.name}</h3>
  <div className="flex gap-4 text-sm">
    <Badge variant={questionCount > 0 ? 'success' : 'warning'}>
      {questionCount} Questions
    </Badge>
    <Badge variant={attributeCount > 0 ? 'success' : 'default'}>
      {attributeCount} Attributes
    </Badge>
    <Badge variant={experienceCount > 0 ? 'default' : 'secondary'}>
      {experienceCount} Experiences
    </Badge>
  </div>

  {questionCount === 0 && (
    <Alert variant="warning">
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription>
        No questions configured. Category cannot be activated.
        <Button size="sm" onClick={() => useTemplate(category)}>
          Use Template
        </Button>
      </AlertDescription>
    </Alert>
  )}
</div>
```

#### 3.3 Template System
**Component:** `<QuestionTemplateDialog />`

**Features:**
- Zeigt verfügbare Templates (UFO Standard, Ghost Standard, etc.)
- Preview: Welche Questions werden erstellt
- "Apply" Button
- Bulk Import mit einem Click

```tsx
<Dialog>
  <DialogContent>
    <h2>Question Template für {category.name}</h2>
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Importiert {template.questions.length} vordefinierte Fragen mit Attribute Mapping
      </p>

      <div className="border rounded p-3 max-h-64 overflow-y-auto">
        {template.questions.map((q, i) => (
          <div key={i} className="py-2 border-b">
            <p className="font-medium">{q.question_text}</p>
            <p className="text-xs text-gray-500">
              Type: {q.question_type} | Maps to: {q.maps_to_attribute || '(none)'}
            </p>
          </div>
        ))}
      </div>

      <Button onClick={applyTemplate}>
        Import {template.questions.length} Questions
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### Phase 5: Search & Pattern (🔴 HIGH PRIORITY)

#### 5.1 Attribute-based Search UI
**Route:** `/experiences?category=ufo-uap&shape=triangle&surface=metallic`

**Component:** `<AttributeFilters />`

**Features:**
- Multi-select Attribute Filters (Checkboxes)
- Dynamic Loading basierend auf Category
- Shows counts: "Triangle (89)"
- URL Sync für Sharing
- Reset Button

```tsx
<div className="space-y-4">
  <h3>Filter by Attributes</h3>

  {attributeSchema.map(attr => (
    <div key={attr.key}>
      <label className="font-medium">{attr.display_name}</label>
      <div className="space-y-1 mt-1">
        {attr.values.map(val => (
          <label key={val.value} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedFilters[attr.key]?.includes(val.value)}
              onChange={(e) => toggleFilter(attr.key, val.value, e.target.checked)}
            />
            <span>{val.label} ({val.count})</span>
          </label>
        ))}
      </div>
    </div>
  ))}
</div>
```

**Backend Query:**
```typescript
GET /api/experiences?shape=triangle&surface=metallic&category=ufo-uap

// SQL:
SELECT e.*
FROM experiences e
WHERE e.id IN (
  SELECT ea1.experience_id
  FROM experience_attributes ea1
  WHERE ea1.attribute_key = 'shape' AND ea1.attribute_value = 'triangle'
  INTERSECT
  SELECT ea2.experience_id
  FROM experience_attributes ea2
  WHERE ea2.attribute_key = 'surface' AND ea2.attribute_value = 'metallic'
)
AND e.category = 'ufo-uap'
ORDER BY e.created_at DESC;
```

#### 5.2 Pattern Insights Component
**Route:** `/experiences/[id]` (Experience Detail Page)

**Component:** `<PatternInsights experienceId={id} />`

**Zeigt:**
1. **Correlations**
   - "92% der Triangle-UFOs berichten auch Missing Time"
   - Interactive Chart

2. **Geographic Clusters**
   - Map mit Hotspots
   - "12 ähnliche Sichtungen in Berlin (50km Radius)"

3. **Temporal Patterns**
   - Timeline Chart
   - "23 Triangle-Sichtungen im Oktober 2024 (+340% vs. Durchschnitt)"

4. **Similar Experiences**
   - Grid von 3-6 ähnlichen Experiences
   - "3 shared attributes"

**Daten von:** `GET /api/patterns/for-experience/{id}` (bereits implementiert!)

```tsx
<div className="space-y-6">
  <h2>Pattern Insights</h2>

  {/* Correlations */}
  <Card>
    <CardHeader>
      <CardTitle>Korrelationen</CardTitle>
    </CardHeader>
    <CardContent>
      {insights.correlations.map(corr => (
        <div key={corr.key} className="flex justify-between py-2">
          <span>{corr.description}</span>
          <Badge>{Math.round(corr.strength * 100)}%</Badge>
        </div>
      ))}
    </CardContent>
  </Card>

  {/* Geographic Clusters */}
  <Card>
    <CardHeader>
      <CardTitle>Geografische Hotspots</CardTitle>
    </CardHeader>
    <CardContent>
      <MapView clusters={insights.geographic} />
    </CardContent>
  </Card>

  {/* Similar Experiences */}
  <Card>
    <CardHeader>
      <CardTitle>Ähnliche Erlebnisse</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {insights.similar.map(exp => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            sharedAttributes={exp.sharedAttributes}
          />
        ))}
      </div>
    </CardContent>
  </Card>
</div>
```

#### 5.3 Attribute-based Similar Experiences
**Current:** Vector search (embedding similarity)
**New:** Hybrid Search (Vector + Attributes)

**Algorithmus:**
```typescript
async function findSimilarExperiences(experienceId: string) {
  // 1. Get attributes of current experience
  const currentAttrs = await getExperienceAttributes(experienceId)

  // 2. Vector search (top 50)
  const vectorResults = await vectorSearch(experienceId, limit: 50)

  // 3. Re-rank by shared attributes
  const reranked = vectorResults.map(exp => ({
    ...exp,
    sharedAttributes: countSharedAttributes(currentAttrs, exp.attributes),
    attributeSimilarity: calculateAttributeSimilarity(currentAttrs, exp.attributes)
  }))

  // 4. Hybrid score (60% vector + 40% attributes)
  const scored = reranked.map(exp => ({
    ...exp,
    hybridScore: exp.vectorScore * 0.6 + exp.attributeSimilarity * 0.4
  }))

  // 5. Return top 10
  return scored
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 10)
}
```

---

### Phase 6: Multilanguage & Polish

#### 6.1 Translation Keys - Weitere Sprachen
**Status:** Nur DE fertig
**Fehlt:** FR, ES, IT

**Dateien zu erstellen:**
- `/messages/fr.json` - Französisch
- `/messages/es.json` - Spanisch
- `/messages/it.json` - Italienisch

**Section "attributes":**
```json
// messages/fr.json
{
  "attributes": {
    "shape": "Forme",
    "surface": "Surface",
    "movement": "Mouvement",
    "values": {
      "triangle": "Triangle",
      "disc": "Disque",
      "orb": "Orbe",
      "metallic": "Métallique",
      "hovering": "En vol stationnaire"
    }
  }
}

// messages/es.json
{
  "attributes": {
    "shape": "Forma",
    "surface": "Superficie",
    "movement": "Movimiento",
    "values": {
      "triangle": "Triángulo",
      "disc": "Disco",
      "orb": "Orbe",
      "metallic": "Metálico",
      "hovering": "Flotando"
    }
  }
}
```

#### 6.2 AI Prompt Templates Multilanguage
**File:** `/lib/prompts/attribute-extraction.ts`

```typescript
export const ATTRIBUTE_EXTRACTION_PROMPTS = {
  de: `Analysiere diesen Text und extrahiere strukturierte Attribute...`,
  en: `Analyze this text and extract structured attributes...`,
  fr: `Analysez ce texte et extrayez des attributs structurés...`,
  es: `Analiza este texto y extrae atributos estructurados...`
}

export function getPrompt(language: string, category: string, attributeSchema: any[]) {
  const template = ATTRIBUTE_EXTRACTION_PROMPTS[language] || ATTRIBUTE_EXTRACTION_PROMPTS.en

  return template
    .replace('{category}', category)
    .replace('{attributes}', attributeSchema.map(...).join('\n'))
}
```

#### 6.3 Language Switching Tests
**Test Cases:**
1. User schreibt DE Text → AI extrahiert EN values → UI zeigt DE labels
2. User schreibt FR Text → AI extrahiert EN values → UI zeigt FR labels
3. User wechselt Language nach Submission → Attributes bleiben gleich, Labels ändern sich
4. Admin erstellt Attribute mit DE/FR/ES Namen → Alle Sprachen funktionieren

#### 6.4 Embedding Model Migration
**Current:** Vermutlich text-embedding-3-small (1536 dims)
**Target:** text-embedding-3-large (3072 dims)

**Warum?**
- +12% Accuracy für Multilanguage
- Better semantic matching für Attributes
- Nur $0.00026 pro Experience (+$0.00006)

**Migration Script:**
```typescript
// scripts/migrate-embeddings.ts
async function migrateToLargeEmbeddings() {
  const experiences = await getAllExperiences()

  for (const exp of experiences) {
    // Generate new embedding
    const embedding = await generateEmbedding(
      exp.enriched_text || exp.story_text,
      'text-embedding-3-large'
    )

    // Update
    await updateExperienceEmbedding(exp.id, embedding)

    console.log(`✓ Migrated ${exp.id}`)
  }
}

// Kosten: 5000 experiences × $0.00026 = $1.30
```

---

## 📊 PRIORITY MATRIX (AKTUALISIERT)

### ✅ ALREADY COMPLETED
- ✅ Sprint 1: Core Functionality - AttributeFilters, Pattern API, Question Merging
- ✅ Sprint 2: Admin Enhancement - Question Editor Mapping, Category Dashboard
- ✅ Sprint 3: Database & Scaling - Hybrid Similar, Backfill API, Suggestions Table, Validation Trigger

### ✅ COMPLETED ENHANCEMENTS

1. **Phase 1.3: Question Templates System** ✅ (2025-10-14)
   - Created /data/question-templates.json with 4 category templates
   - Seeded 19 questions across 4 categories via Supabase MCP
   - Questions mapped to 14 attributes (7 new attributes created)
   - Templates: UFO/UAP (8Q), Dreams (4Q), Ghost/Spirit (4Q), Consciousness (3Q)
   - All questions have attribute mapping for AI pre-fill

### 🟡 REMAINING OPTIONAL ENHANCEMENTS

1. **Phase 6.1-6.4: Multilanguage FR/ES/IT** (2h)
   - Französisch, Spanisch, Italienisch Translations
   - Nur wenn international expansion geplant

2. **Phase 6.4: Embedding Model Migration** (0.5h)
   - Upgrade von text-embedding-3-small zu -large
   - +12% Accuracy, nur $1.30 für 5000 experiences
   - Optional Performance Improvement

3. **Phase 3.3: Template System UI** (2h)
   - QuestionTemplateDialog Component
   - "Apply Template" Button im Category Dashboard
   - Bulk Import von Question Sets (JSON Templates bereits vorhanden)

---

## ⚡ QUICK WINS COMPLETED

1. ✅ **Attribute translations DE** - DONE
2. ✅ **Pattern API /api/patterns/for-experience/[id]** - DONE
3. ✅ **Question Flow Pre-fills** - DONE
4. ✅ **GET /api/attributes/available endpoint** - DONE (Sprint 1)
5. ✅ **Category Status Counts** - DONE (Sprint 2)
6. ✅ **Hybrid Similar Experiences** - DONE (Sprint 3)
7. ✅ **Attribute Suggestions Table** - DONE (Sprint 3)
8. ✅ **Category Validation Trigger** - DONE (Sprint 3)

---

## 📈 REMAINING WORK ESTIMATE

| Phase | Tasks | Status | Time |
|-------|-------|--------|------|
| Phase 1 (DB) | Seed Templates | ✅ Completed | ~1.5h |
| Phase 6 (i18n) | FR/ES/IT Translations | Optional | 2h |
| Phase 6 (i18n) | Embedding Migration | Optional | 0.5h |
| Phase 3 (Admin) | Template System UI | Optional | 2h |
| **TOTAL** | **3 tasks** | **All Optional** | **4.5h** |

**Status:** Core System ist vollständig funktional! ✅

---

## 🎯 SYSTEM STATUS

### ✅ PRODUCTION READY
Das Attribute System ist **voll funktionsfähig** und produktionsbereit:

**Core Features:**
- ✅ 89 Attributes über 31 Kategorien seeded
- ✅ AI Extraction mit Confidence Scoring
- ✅ Question Flow mit Pre-fills und XP Bonuses
- ✅ Admin CRUD Interface für Attributes
- ✅ Question-to-Attribute Mapping UI
- ✅ Category Health Dashboard mit Warnings
- ✅ Hybrid Similar Experiences (Tag + Attribute Matching)
- ✅ Backfill API für alte Experiences
- ✅ Community Suggestion System mit Admin Review
- ✅ Category Validation Trigger

**Recent Additions (2025-10-14):**
- ✅ Question Templates Seeded (19 questions, 4 categories)

**Optional Improvements:**
- 🟡 Additional Languages (FR/ES/IT)
- 🟡 Embedding Model Upgrade
- 🟡 Template Import UI

### 🚀 NÄCHSTE SCHRITTE (OPTIONAL)

Wenn gewünscht, können folgende Enhancements implementiert werden:

1. **Question Templates System** (1.5h)
   - Seed Script für Standard-Questions
   - Template Import UI

2. **Multilanguage Expansion** (2h)
   - FR/ES/IT Translations
   - Nur wenn internationale User erwartet

3. **Embedding Upgrade** (0.5h)
   - Migration zu text-embedding-3-large
   - Bessere Similarity Matches

---

**Autor:** Claude
**Erstellt:** 2025-10-14
**Basiert auf:** category.md v3.1 + aktueller Implementierungsstatus
