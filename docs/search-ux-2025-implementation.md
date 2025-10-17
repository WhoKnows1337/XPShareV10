# Search UX 2025 - Implementation Guide

## Features Implemented

### 1. **SearchAutocomplete Component** ✅
- **Location:** `components/search/search-autocomplete.tsx`
- **Features:**
  - 300ms debounced API calls
  - Keyboard navigation (↑↓ Enter Esc)
  - ARIA live regions for accessibility
  - Keyword highlighting
  - 6 suggestion types: Recent, Trending, Categories, Locations, Tags, Queries
  - Click-outside to close
  - Loading states with spinner

**Usage:**
```tsx
import { SearchAutocomplete } from '@/components/search/search-autocomplete'

<SearchAutocomplete
  value={query}
  onChange={setQuery}
  onSelect={(suggestion) => handleSearch(suggestion.text)}
  placeholder="Search experiences..."
/>
```

### 2. **Autocomplete API** ✅
- **Endpoint:** `/api/search/autocomplete`
- **Features:**
  - Quick frontend typo fixes
  - Recent searches from user history
  - Trending searches (last 7 days)
  - Category matches with counts
  - Location suggestions
  - Tag suggestions
  - Fuzzy matching for experience titles (pg_trgm)
  - Deduplication
  - Max 10 suggestions

**Request:**
```
GET /api/search/autocomplete?q=ufo
```

**Response:**
```json
{
  "suggestions": [
    {
      "id": "category-ufo",
      "type": "category",
      "text": "UFO Sighting",
      "metadata": { "count": 245, "category": "ufo", "icon": "🛸" }
    },
    {
      "id": "trending-0",
      "type": "trending",
      "text": "UFO Bodensee",
      "metadata": { "count": 15 }
    }
  ],
  "corrected": "UFO"
}
```

### 3. **Fuzzy Search Utilities** ✅
- **Location:** `lib/utils/fuzzy-search.ts`
- **Features:**
  - Levenshtein distance calculation
  - Similarity scoring (0-1)
  - "Did you mean?" suggestions
  - Common term variations dictionary
  - Multi-suggestion generation

**Usage:**
```ts
import { getDidYouMeanSuggestion, hasLikelyTypos } from '@/lib/utils/fuzzy-search'

const suggestion = getDidYouMeanSuggestion('psycedelic')
// Returns: "psychedelic"

const hasTypos = hasLikelyTypos('mediation')
// Returns: true
```

### 4. **Filter Counts API** ✅
- **Endpoint:** `/api/search/filter-counts`
- **Features:**
  - Category counts
  - Top 20 locations with counts
  - Top 30 tags with counts
  - Witness count ranges
  - Date ranges (7/30/90/365 days, 1+ years)
  - 5-minute caching
  - Query-aware (filters based on current search)

**Request:**
```
GET /api/search/filter-counts?q=ufo
```

**Response:**
```json
{
  "categories": {
    "ufo": 245,
    "paranormal": 189,
    "dreams": 156
  },
  "locations": [
    { "location": "Bodensee", "count": 45 },
    { "location": "California", "count": 38 }
  ],
  "tags": [
    { "tag": "night", "count": 234 },
    { "tag": "glowing", "count": 189 }
  ],
  "witnessRanges": {
    "noWitnesses": 456,
    "hasWitnesses": 234
  },
  "dateRanges": {
    "last7Days": 12,
    "last30Days": 45,
    "last90Days": 123,
    "last365Days": 345,
    "olderThan1Year": 165
  }
}
```

### 5. **Date Range Slider** ✅
- **Location:** `components/search/date-range-slider.tsx`
- **Features:**
  - Hybrid mode (Presets + Custom)
  - 4 presets: Last 7/30/90/365 days
  - Custom date range picker
  - Animated transitions
  - Backward compatible with saved searches

**Usage:**
```tsx
import { DateRangeSlider } from '@/components/search/date-range-slider'

<DateRangeSlider
  dateFrom={filters.dateFrom}
  dateTo={filters.dateTo}
  onDateChange={(from, to, preset) => {
    handleFiltersChange({ ...filters, dateFrom: from, dateTo: to })
  }}
/>
```

## Integration Steps

### Step 1: Replace Search Input with Autocomplete

**In `components/search/unified-search-bar.tsx`:**

```tsx
import { SearchAutocomplete } from './search-autocomplete'

// Replace <Input> with:
<SearchAutocomplete
  value={value}
  onChange={onChange}
  onSelect={(suggestion) => {
    onChange(suggestion.text)
    onSearch(suggestion.text)
  }}
  placeholder={placeholder}
  disabled={isLoading}
/>
```

### Step 2: Add Filter Counts to CollapsibleFilters

**In `components/search/collapsible-filters.tsx`:**

```tsx
import { useEffect, useState } from 'react'

const [filterCounts, setFilterCounts] = useState<FilterCounts | null>(null)

useEffect(() => {
  fetch('/api/search/filter-counts')
    .then(res => res.json())
    .then(setFilterCounts)
}, [])

// Update SelectItem to show counts:
<SelectItem value="ufo">
  🛸 UFO Sighting {filterCounts?.categories.ufo && `(${filterCounts.categories.ufo})`}
</SelectItem>
```

### Step 3: Replace Date Inputs with DateRangeSlider

**In `components/search/collapsible-filters.tsx`:**

```tsx
import { DateRangeSlider } from './date-range-slider'

// Replace the date input grid with:
<DateRangeSlider
  dateFrom={filters.dateFrom || ''}
  dateTo={filters.dateTo || ''}
  onDateChange={(from, to) => handleFilterChange('dateFrom', from) && handleFilterChange('dateTo', to)}
/>
```

## Performance Optimizations

### Caching Strategy
- **Autocomplete:** No caching (real-time)
- **Filter Counts:** 5min cache (`s-maxage=300`)
- **Debouncing:** 300ms for autocomplete

### Database
- Ensure `pg_trgm` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

- Create index for faster text search:
```sql
CREATE INDEX idx_experiences_title_trgm ON experiences USING gin (title gin_trgm_ops);
```

## Accessibility (WCAG 2.1 AA)

All components include:
- ✅ ARIA live regions for dynamic updates
- ✅ Keyboard navigation (Tab, Arrow keys, Enter, Esc)
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Color contrast compliance
- ✅ Semantic HTML

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Testing Checklist

- [ ] Autocomplete shows suggestions < 500ms
- [ ] Keyboard navigation works (↑↓ Enter Esc)
- [ ] Screen reader announces suggestion count
- [ ] Filter counts update on search
- [ ] Date presets calculate correctly
- [ ] Custom date range validates (from < to)
- [ ] Mobile responsive (all breakpoints)
- [ ] Dark mode compatible

## Future Enhancements (Phase 2)

- [ ] Voice search integration
- [ ] Multi-select filters
- [ ] Search scoping (My/Followed/All)
- [ ] Search-within-results
- [ ] Filter persistence (localStorage)
- [ ] A/B testing framework
- [ ] Analytics tracking

---

**Generated:** 2025-10-17  
**Version:** 1.0.0  
**Author:** Claude Code with Vibe Check MCP
EOF
