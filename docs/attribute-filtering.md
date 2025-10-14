# Attribute-Based Filtering System

## Overview

The Attribute-Based Filtering System allows users to search and filter experiences based on AI-extracted attributes. Attributes are automatically extracted during the submission flow and stored in a canonical form (lowercase English).

## Architecture

### Database Schema

```sql
-- experience_attributes table
CREATE TABLE experience_attributes (
  id UUID PRIMARY KEY,
  experience_id UUID REFERENCES experiences(id),
  attribute_key TEXT NOT NULL,
  attribute_value TEXT,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_experience_attributes_key_value ON experience_attributes(attribute_key, attribute_value);
CREATE INDEX idx_experience_attributes_experience_key ON experience_attributes(experience_id, attribute_key);
```

### SQL Functions

#### 1. `search_experiences_by_attributes`

Search experiences by multiple attribute key-value pairs.

**Parameters:**
- `p_attribute_filters` (jsonb): Array of `{key, value}` objects
- `p_match_mode` (text): `'all'` (AND logic) or `'any'` (OR logic)
- `p_category_slug` (text): Optional category filter
- `p_limit` (integer): Results per page
- `p_offset` (integer): Pagination offset

**Returns:**
- `experience_id`: UUID of the experience
- `title`: Experience title
- `category`: Category slug
- `created_at`: Creation timestamp
- `matched_attributes`: JSONB array of matched attributes
- `match_count`: Number of attributes matched
- `user_data`: JSONB object with user info

**Example:**
```sql
SELECT * FROM search_experiences_by_attributes(
  '[{"key": "object_shape", "value": "triangle"}, {"key": "object_color", "value": "orange"}]'::jsonb,
  'all',
  'ufo',
  20,
  0
);
```

#### 2. `get_attribute_values_for_key`

Get all unique values for a given attribute key with occurrence counts.

**Parameters:**
- `p_attribute_key` (text): The attribute key to query
- `p_category_slug` (text): Optional category filter
- `p_min_count` (integer): Minimum occurrence count (default: 1)

**Returns:**
- `attribute_value`: The value
- `experience_count`: Number of experiences with this value
- `categories`: JSONB array of categories where this value appears

**Example:**
```sql
SELECT * FROM get_attribute_values_for_key('object_shape', 'ufo', 1);
```

#### 3. `get_available_attribute_keys`

Get all available attribute keys with statistics.

**Parameters:**
- `p_category_slug` (text): Optional category filter

**Returns:**
- `attribute_key`: The key name
- `value_count`: Number of unique values for this key
- `experience_count`: Number of experiences with this key
- `sample_values`: Array of up to 5 sample values

**Example:**
```sql
SELECT * FROM get_available_attribute_keys('ufo');
```

#### 4. `count_experiences_by_attributes`

Count experiences matching attribute filters (for pagination).

**Parameters:**
- `p_attribute_filters` (jsonb): Array of `{key, value}` objects
- `p_match_mode` (text): `'all'` or `'any'`
- `p_category_slug` (text): Optional category filter

**Returns:** Integer count

## API Endpoints

### GET `/api/search/by-attributes`

Search experiences by attributes.

**Query Parameters:**
- `filters` (string): JSON-encoded array of `{key, value}` objects
- `matchMode` (string): `'all'` or `'any'` (default: `'all'`)
- `category` (string): Optional category filter
- `limit` (number): Results per page (default: 20)
- `offset` (number): Pagination offset (default: 0)

**Response:**
```json
{
  "experiences": [
    {
      "experience_id": "uuid",
      "title": "string",
      "category": "string",
      "created_at": "timestamp",
      "matched_attributes": [
        {
          "key": "object_shape",
          "value": "triangle",
          "confidence": 0.95
        }
      ],
      "match_count": 2,
      "user_data": {
        "username": "string",
        "display_name": "string",
        "avatar_url": "string"
      }
    }
  ],
  "total": 42,
  "hasMore": true,
  "filters": [],
  "matchMode": "all"
}
```

### GET `/api/attributes/keys`

Get all available attribute keys.

**Query Parameters:**
- `category` (string): Optional category filter

**Response:**
```json
{
  "keys": [
    {
      "attribute_key": "object_shape",
      "value_count": 12,
      "experience_count": 45,
      "sample_values": ["triangle", "circle", "oval", "disc", "sphere"]
    }
  ],
  "count": 15
}
```

### GET `/api/attributes/values`

Get all values for a specific attribute key.

**Query Parameters:**
- `key` (string): **Required** - The attribute key
- `category` (string): Optional category filter
- `minCount` (number): Minimum occurrence count (default: 1)

**Response:**
```json
{
  "key": "object_shape",
  "values": [
    {
      "attribute_value": "triangle",
      "experience_count": 23,
      "categories": ["ufo", "paranormal"]
    }
  ],
  "count": 12
}
```

## UI Components

### `AttributeFilter` Component

**Location:** `/components/search/attribute-filter.tsx`

**Props:**
```typescript
interface AttributeFilterProps {
  filters: AttributeFilter[];           // Current filters
  onChange: (filters: AttributeFilter[]) => void;
  category?: string;                    // Optional category context
  matchMode?: 'all' | 'any';           // AND/OR logic
  onMatchModeChange?: (mode: 'all' | 'any') => void;
}

interface AttributeFilter {
  key: string;    // e.g., "object_shape"
  value: string;  // e.g., "triangle"
}
```

**Features:**
- Fetches available attribute keys dynamically
- Loads values for selected key
- Shows occurrence counts
- Supports AND/OR matching modes
- Animated filter chips
- Loading states

**Usage:**
```tsx
import { AttributeFilter } from '@/components/search/attribute-filter';

function MyComponent() {
  const [filters, setFilters] = useState<AttributeFilter[]>([]);
  const [matchMode, setMatchMode] = useState<'all' | 'any'>('all');

  return (
    <AttributeFilter
      filters={filters}
      onChange={setFilters}
      category="ufo"
      matchMode={matchMode}
      onMatchModeChange={setMatchMode}
    />
  );
}
```

## Integration Example

### Feed Page Integration

The feed page filters component (`/components/feed/feed-filters.tsx`) integrates attribute filtering:

```tsx
// 1. State management
const [attributeFilters, setAttributeFilters] = useState<AttributeFilterType[]>([]);
const [matchMode, setMatchMode] = useState<'all' | 'any'>('all');

// 2. URL parameter encoding
const handleAttributeFiltersApply = () => {
  const params = new URLSearchParams(searchParams.toString());
  if (attributeFilters.length > 0) {
    params.set('attributeFilters', JSON.stringify(attributeFilters));
    params.set('matchMode', matchMode);
  }
  router.push(`/feed?${params.toString()}`);
};

// 3. UI rendering
<AttributeFilter
  filters={attributeFilters}
  onChange={setAttributeFilters}
  category={currentCategory}
  matchMode={matchMode}
  onMatchModeChange={setMatchMode}
/>
```

## Common Attribute Keys

### UFO Category
- `object_shape`: triangle, disc, sphere, oval, cigar, etc.
- `object_color`: orange, white, red, silver, metallic, etc.
- `object_behavior`: hovering, zigzag, rapid, silent, etc.
- `number_of_objects`: single, multiple, formation, etc.
- `duration`: seconds, minutes, hours
- `time_of_day`: night, dawn, dusk, day

### Paranormal Category
- `entity_type`: shadow, apparition, voice, presence, etc.
- `entity_behavior`: observing, communicating, threatening, etc.
- `location_type`: home, forest, cemetery, hospital, etc.
- `physical_effects`: cold_spot, emf_spike, object_movement, etc.

### Dreams Category
- `dream_type`: lucid, nightmare, recurring, prophetic, etc.
- `clarity_level`: vivid, hazy, crystal_clear, etc.
- `emotional_tone`: fearful, peaceful, anxious, joyful, etc.
- `symbols`: flying, falling, water, animals, etc.

### Psychedelic Category
- `substance`: lsd, psilocybin, dmt, ayahuasca, etc.
- `visual_pattern`: geometric, fractal, mandala, entities, etc.
- `insight_type`: personal, spiritual, cosmic, healing, etc.
- `setting`: nature, ceremony, home, festival, etc.

## Performance Considerations

### Indexes
- Compound index on `(attribute_key, attribute_value)` for fast value lookups
- Compound index on `(experience_id, attribute_key)` for experience queries

### Caching Strategies
- Cache available attribute keys for 5 minutes (low change rate)
- Cache attribute values for each key for 5 minutes
- Cache search results for 1 minute (personalized, so shorter TTL)

### Query Optimization
- Use `HAVING COUNT(DISTINCT ea.attribute_key) = filter_count` for AND logic
- Pre-filter by category before attribute matching
- Limit results to 20-50 per page for good UX

## Future Enhancements

### Planned Features
1. **Fuzzy Matching**: Allow partial matches for attribute values
2. **Range Queries**: Support numeric ranges (e.g., duration 5-10 minutes)
3. **Synonym Mapping**: Map similar values (e.g., "circular" → "circle")
4. **Attribute Suggestions**: AI-powered attribute suggestions based on text
5. **Visual Attribute Browser**: Interactive graph visualization of attribute relationships
6. **Saved Filter Presets**: Allow users to save common filter combinations

### Performance Improvements
1. **Materialized Views**: Pre-compute common attribute aggregations
2. **Full-Text Search Integration**: Combine with PostgreSQL FTS for hybrid search
3. **Redis Caching**: Cache frequently accessed attribute data
4. **Query Plan Optimization**: Analyze and optimize slow queries

## Testing

### Manual Testing Checklist
- [ ] Filter by single attribute
- [ ] Filter by multiple attributes (AND mode)
- [ ] Filter by multiple attributes (OR mode)
- [ ] Filter with category selection
- [ ] Pagination with attribute filters
- [ ] Empty state (no attributes available)
- [ ] Empty results (no matches)
- [ ] Loading states
- [ ] Error handling

### Sample Test Queries

```sql
-- Test 1: Find UFOs that are triangular and orange
SELECT * FROM search_experiences_by_attributes(
  '[{"key": "object_shape", "value": "triangle"}, {"key": "object_color", "value": "orange"}]'::jsonb,
  'all',
  'ufo',
  20,
  0
);

-- Test 2: Find experiences with EITHER hovering OR zigzag behavior
SELECT * FROM search_experiences_by_attributes(
  '[{"key": "object_behavior", "value": "hovering"}, {"key": "object_behavior", "value": "zigzag"}]'::jsonb,
  'any',
  NULL,
  20,
  0
);

-- Test 3: Get all available values for object_shape
SELECT * FROM get_attribute_values_for_key('object_shape', 'ufo', 2);
```

## Troubleshooting

### No attributes showing up
- Check if experiences have been submitted with attribute extraction enabled
- Verify `experience_attributes` table has data: `SELECT COUNT(*) FROM experience_attributes;`
- Check AI enrichment is working in the submit flow

### Slow queries
- Check query execution plan: `EXPLAIN ANALYZE SELECT ...`
- Verify indexes exist: `\di` in psql
- Consider reducing `p_limit` or adding pagination

### Incorrect results
- Verify attribute values are in canonical form (lowercase, English)
- Check for typos in attribute keys
- Ensure match mode (`all` vs `any`) is correct

## Related Documentation
- [Attribute System Overview](./attribute-system.md)
- [Category Configuration](./category.md)
- [AI Enrichment Flow](./ai-enrichment.md)
