# Category-Specific Attributes

**Purpose:** Understand how different experience categories have unique, structured attributes
**Impact:** Enables precise search queries beyond simple tags
**Database:** XPShare has **170+ attributes across 43 categories** in `attribute_schema` table

---

## 🔑 Key Insight

**Different experience categories have vastly different attributes!**

- UFO-UAP: `shape`, `light_color`, `movement_type`, `sound`
- Dreams: `lucidity`, `vividness`, `dream_type`
- NDE-OBE: `saw_tunnel`, `life_review`, `met_deceased`
- Psychedelics: `substance`, `dosage_level`, `entity_contact`

## 🎯 Why This Matters

### Pure Tag Search (Limited)
```
Query: "Lucid dreams with crystal-clear visuals"
Basic Parsing: { category: "dreams", tags: ["lucid", "crystal-clear"] }
Problem: Tags are unstructured, imprecise
```

### Attribute-Based Search (Precise)
```
Query: "Lucid dreams with crystal-clear visuals"
Smart Parsing: {
  category: "dreams",
  attributes: {
    include: {
      lucidity: ["fully_lucid"],
      clarity_level: ["crystal_clear"],
      visual_quality: ["HD-like"]
    }
  }
}
Result: Exact matches only ✅
```

## 📊 Top 4 Categories (With Real Attributes)

### 🛸 UFO-UAP (12 attributes)

```typescript
{
  category_slug: "ufo-uap",
  attributes: [
    "shape",              // triangle, circle, cigar, disc, sphere
    "size",               // car-sized, building-sized, basketball-sized
    "light_color",        // red, blue, white, orange, multicolor
    "light_pattern",      // pulsing, steady, strobing, rotating
    "movement_type",      // hovering, zigzag, linear, erratic
    "movement",           // fast, slow, stationary, accelerating
    "sound",              // humming, silent, whooshing, buzzing
    "surface",            // metallic, glowing, translucent, dark
    "altitude",           // treetop, low, high, very_high
    "sky_location",       // north, south, east, west, overhead
    "disappearance",      // instant, gradual, behind_object, faded
    "phenomenon_color"    // General color descriptor
  ]
}
```

**Example Query:** "Silent triangle UFOs with pulsing red lights"

```typescript
{
  filters: {
    category: "ufo-uap",
    attributes: {
      include: {
        shape: ["triangle"],
        light_color: ["red"],
        light_pattern: ["pulsing"],
        sound: ["silent"]
      }
    }
  }
}
```

### 💭 Dreams (12 attributes)

```typescript
{
  category_slug: "dreams",
  attributes: [
    "dream_type",             // lucid, prophetic, recurring, nightmare
    "lucidity",               // fully_lucid, semi_lucid, not_lucid
    "vividness",              // extremely_vivid, vivid, normal, vague
    "clarity_level",          // crystal_clear, clear, hazy, confusing
    "visual_quality",         // HD-like, normal, blurry, abstract
    "dream_color_experience", // full_color, muted_color, black_white
    "dream_emotion",          // joy, fear, neutral, mixed, intense
    "dream_symbol",           // water, flying, falling, teeth, animals
    "dream_frequency_color",  // always_color, mostly_color, rarely_color
    "dream_frequency_bw",     // always_bw, mostly_bw, rarely_bw
    "dream_recent_color",     // yes, no, unsure
    "dream_recent_bw"         // yes, no, unsure
  ]
}
```

**Example Query:** "Lucid dreams with HD-like crystal-clear visuals"

```typescript
{
  filters: {
    category: "dreams",
    attributes: {
      include: {
        lucidity: ["fully_lucid"],
        clarity_level: ["crystal_clear"],
        visual_quality: ["HD-like"]
      }
    }
  }
}
```

### ✨ NDE-OBE (5 attributes)

```typescript
{
  category_slug: "nde-obe",
  attributes: [
    "nde_type",        // clinical_death, cardiac_arrest, accident, spontaneous
    "saw_tunnel",      // yes, no
    "saw_light",       // yes, no
    "life_review",     // yes, no, partial
    "met_deceased"     // yes, no
  ]
}
```

**Example Query:** "NDEs with tunnel, light, AND life review"

```typescript
{
  filters: {
    category: "nde-obe",
    attributes: {
      include: {
        saw_tunnel: ["yes"],
        saw_light: ["yes"],
        life_review: ["yes", "partial"]
      }
    }
  }
}
```

### 🍄 Psychedelics (5 attributes)

```typescript
{
  category_slug: "psychedelics",
  attributes: [
    "substance",       // psilocybin, lsd, dmt, ayahuasca, mescaline
    "dosage_level",    // microdose, low, medium, high, heroic
    "setting",         // solo, guided, ceremony, nature, home
    "entity_contact",  // yes, no, unsure
    "breakthrough"     // yes, no, partial
  ]
}
```

**Example Query:** "DMT breakthroughs with entity contact"

```typescript
{
  filters: {
    category: "psychedelics",
    attributes: {
      include: {
        substance: ["dmt"],
        breakthrough: ["yes"],
        entity_contact: ["yes"]
      }
    }
  }
}
```

## 📋 Other Notable Categories

| Category | Attributes | Examples |
|----------|------------|----------|
| **Ghosts/Spirits** | 4 | ghost_type, ghost_appearance, interaction, recognized |
| **Precognition** | 4 | precog_method, came_true, specificity, time_until_event |
| **Kundalini Awakening** | 4 | awakening_trigger, energy_movement, physical_symptoms, challenging |
| **Cancer Remission** | 4 | cancer_type, stage_at_diagnosis, treatment_received, complete_remission |

**Total:** 170+ attributes across 43 categories

## 🚨 Impact on Implementation

### Query Parser MUST Be Category-Aware

**❌ BAD (Generic):**
```typescript
// Query: "Lucid dreams"
const intent = {
  category: "dreams",
  tags: ["lucid"]  // ❌ Missed structured attribute!
}
```

**✅ GOOD (Category-Aware):**
```typescript
// Query: "Lucid dreams"
const intent = {
  category: "dreams",
  attributes: {
    include: {
      lucidity: ["fully_lucid", "semi_lucid"]  // ✅ Precise!
    }
  }
}
```

### Search Tool MUST Support Attributes

Update Tool 1 (search_experiences) schema:

```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const searchExperiencesTool = tool({
  description: 'Search for experiences with attribute-based precision filtering',
  parameters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),

    // 🆕 ATTRIBUTE FILTERS
    attributes: z.object({
      include: z.record(z.string(), z.array(z.string())).optional(),
      exclude: z.record(z.string(), z.array(z.string())).optional(),
      ranges: z.record(z.string(), z.object({
        min: z.number().optional(),
        max: z.number().optional()
      })).optional()
    }).optional(),

    similarTo: z.string().optional(),
    maxResults: z.number().default(15)
  }),

  execute: async (params) => {
    const results = await hybridSearchWithAttributes({
      query: params.naturalQuery || '',
      filters: {
        category: params.category,
        tags: params.tags,
        location: params.location,
        attributes: params.attributes  // ✅ Attribute filters applied
      },
      maxResults: params.maxResults
    })

    return {
      experiences: results,
      count: results.length,
      attributeFiltersApplied: !!params.attributes
    }
  }
})
```

## 🎨 UI Patterns

### Attribute Facets in Search UI

```typescript
// Show category-specific facets dynamically
{category === 'ufo-uap' && (
  <>
    <FilterGroup title="Shape">
      <Checkbox value="triangle">Triangle</Checkbox>
      <Checkbox value="sphere">Sphere</Checkbox>
      <Checkbox value="cigar">Cigar</Checkbox>
    </FilterGroup>

    <FilterGroup title="Light Color">
      <Checkbox value="red">Red</Checkbox>
      <Checkbox value="blue">Blue</Checkbox>
      <Checkbox value="white">White</Checkbox>
    </FilterGroup>
  </>
)}

{category === 'dreams' && (
  <>
    <FilterGroup title="Lucidity">
      <Checkbox value="fully_lucid">Fully Lucid</Checkbox>
      <Checkbox value="semi_lucid">Semi-Lucid</Checkbox>
    </FilterGroup>

    <FilterGroup title="Visual Quality">
      <Checkbox value="HD-like">HD-like</Checkbox>
      <Checkbox value="crystal_clear">Crystal Clear</Checkbox>
    </FilterGroup>
  </>
)}
```

## 📚 Database Schema

```sql
-- Table: attribute_schema
-- Stores available attributes per category

CREATE TABLE attribute_schema (
  id UUID PRIMARY KEY,
  category_slug TEXT NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_type TEXT,  -- text, enum, boolean, number
  possible_values JSONB, -- For enums: ["value1", "value2"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: experience_attributes
-- Stores actual attribute values for experiences

CREATE TABLE experience_attributes (
  id UUID PRIMARY KEY,
  experience_id UUID REFERENCES experiences(id),
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast attribute lookups
CREATE INDEX idx_exp_attr_lookup ON experience_attributes(experience_id, attribute_name);
```

## 🔍 Query Examples

### Complex Multi-Attribute Query

**User:** "Show me silent triangle UFOs with red pulsing lights but NOT metallic surface"

**Parsed:**
```typescript
{
  category: "ufo-uap",
  attributes: {
    include: {
      shape: ["triangle"],
      sound: ["silent"],
      light_color: ["red"],
      light_pattern: ["pulsing"]
    },
    exclude: {
      surface: ["metallic"]
    }
  }
}
```

**SQL:**
```sql
SELECT e.*
FROM experiences e
WHERE e.category_slug = 'ufo-uap'
  AND EXISTS (
    SELECT 1 FROM experience_attributes a
    WHERE a.experience_id = e.id
      AND a.attribute_name = 'shape' AND a.attribute_value = 'triangle'
  )
  AND EXISTS (
    SELECT 1 FROM experience_attributes a
    WHERE a.experience_id = e.id
      AND a.attribute_name = 'sound' AND a.attribute_value = 'silent'
  )
  AND NOT EXISTS (
    SELECT 1 FROM experience_attributes a
    WHERE a.experience_id = e.id
      AND a.attribute_name = 'surface' AND a.attribute_value = 'metallic'
  )
```

---

## 🚀 Implementation Checklist

- [ ] Query Parser understands category-specific attributes
- [ ] Search Tool supports `attributes` parameter
- [ ] Database has attribute_schema and experience_attributes tables
- [ ] UI dynamically shows relevant facets per category
- [ ] Pattern Tool can detect attribute-based patterns
- [ ] Visualization Tool can group by attributes

**Related:**
- [tools/tool-1-search.md](./tools/tool-1-search.md) - Attribute filtering in search
- [tools/tool-2-patterns.md](./tools/tool-2-patterns.md) - Attribute-based pattern detection
