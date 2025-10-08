# Integration Examples - New BROWSE-VIEWS Features

This document shows how to integrate the newly implemented features into your application.

## 1. Advanced Search Builder

### Usage in Search Page

```tsx
// app/[locale]/search/page.tsx
import { AdvancedSearch } from '@/components/search/advanced-search'

export default function SearchPage() {
  const handleSearch = async (filters: SearchFilters) => {
    // Perform search with filters
    const results = await searchExperiences(filters)
    // Update UI with results
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Search</h1>

      <AdvancedSearch
        onSearch={handleSearch}
        resultCount={234}
      />
    </div>
  )
}
```

## 2. Virtualized Experience List (Infinite Scroll)

### Usage in Feed Page

```tsx
// app/[locale]/feed/page.tsx
import { VirtualizedExperienceList } from '@/components/browse/virtualized-experience-list'
import { createClient } from '@/lib/supabase/client'

export default function FeedPage() {
  const fetchExperiences = async (pageParam: number) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .range(pageParam * 20, (pageParam + 1) * 20 - 1)
      .order('created_at', { ascending: false })

    const { count } = await supabase
      .from('experiences')
      .select('*', { count: 'only', head: true })

    return {
      experiences: data || [],
      nextCursor: data && data.length === 20 ? pageParam + 1 : null,
      total: count || 0
    }
  }

  return (
    <div className="container mx-auto py-8">
      <VirtualizedExperienceList
        queryKey={['experiences', 'feed']}
        fetchFn={fetchExperiences}
        viewMode="cards"
      />
    </div>
  )
}
```

## 3. Map View with Heatmap

### Usage in Map Page

```tsx
// app/[locale]/map/page.tsx
import { MapView } from '@/components/browse/map-view'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Experience Map</h1>

      <MapView experiences={experiences || []} />

      <div className="mt-4 text-sm text-muted-foreground">
        <p>• Click markers to view experience details</p>
        <p>• Click "Show Heatmap" to see hotspots</p>
        <p>• Click "Time Travel" to filter by date</p>
      </div>
    </div>
  )
}
```

## 4. Witness Verification Banner

### Usage in Experience Detail Page

```tsx
// app/[locale]/experiences/[id]/page.tsx
import { WitnessVerificationBanner } from '@/components/experience-detail/witness-verification-banner'

export default async function ExperiencePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch experience
  const { data: experience } = await supabase
    .from('experiences')
    .select('*, user_id')
    .eq('id', params.id)
    .single()

  // Fetch witnesses
  const { data: witnesses } = await supabase
    .from('experience_witnesses')
    .select(`
      *,
      user_profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('experience_id', params.id)

  const currentUser = await supabase.auth.getUser()
  const isAuthor = currentUser.data.user?.id === experience.user_id

  return (
    <div className="container mx-auto py-8">
      {/* Witness Verification Banner (shows if verified witnesses exist) */}
      <WitnessVerificationBanner
        experienceId={experience.id}
        witnesses={witnesses || []}
        isAuthor={isAuthor}
      />

      {/* Rest of experience content */}
      <div className="mt-8">
        {/* ... */}
      </div>
    </div>
  )
}
```

## 5. Cross-Category Insight

### Usage in Profile Page

```tsx
// app/[locale]/profile/[id]/page.tsx
import { CrossCategoryInsight } from '@/components/profile/cross-category-insight'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <CrossCategoryInsight userId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 6. Complete Integration Example

### Full-Featured Search Page

```tsx
// app/[locale]/search/advanced/page.tsx
'use client'

import { useState } from 'react'
import { AdvancedSearch } from '@/components/search/advanced-search'
import { VirtualizedExperienceList } from '@/components/browse/virtualized-experience-list'
import { createClient } from '@/lib/supabase/client'

export default function AdvancedSearchPage() {
  const [activeFilters, setActiveFilters] = useState(null)

  const fetchFilteredExperiences = async (pageParam: number) => {
    const supabase = createClient()
    let query = supabase
      .from('experiences')
      .select('*', { count: 'exact' })

    // Apply filters
    if (activeFilters) {
      if (activeFilters.keywords) {
        query = query.or(`title.ilike.%${activeFilters.keywords}%,story_text.ilike.%${activeFilters.keywords}%`)
      }
      if (activeFilters.categories.length > 0) {
        query = query.in('category', activeFilters.categories)
      }
      if (activeFilters.verification !== 'all') {
        query = query.eq('is_verified', activeFilters.verification === 'verified')
      }
      // Add more filters...
    }

    const { data, count } = await query
      .range(pageParam * 20, (pageParam + 1) * 20 - 1)
      .order('created_at', { ascending: false })

    return {
      experiences: data || [],
      nextCursor: data && data.length === 20 ? pageParam + 1 : null,
      total: count || 0
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Search</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Builder */}
        <div className="lg:col-span-1">
          <AdvancedSearch
            onSearch={(filters) => setActiveFilters(filters)}
            resultCount={0}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {activeFilters ? (
            <VirtualizedExperienceList
              queryKey={['search', activeFilters]}
              fetchFn={fetchFilteredExperiences}
              viewMode="cards"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Set filters and click "Search" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

## API Notes

### SearchFilters Type

```typescript
interface SearchFilters {
  keywords: string
  booleanOperator: 'AND' | 'OR' | 'NOT'
  categories: string[]
  location?: { lat: number; lng: number; name: string }
  radius: number
  dateFrom?: Date
  dateTo?: Date
  tags: string[]
  externalEvents: {
    solar: boolean
    moon: boolean
    earthquake: boolean
    geomagnetic: boolean
  }
  verification: 'all' | 'verified' | 'unverified'
  minSimilar: number
}
```

### Required Environment Variables

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Testing Checklist

- [ ] Advanced Search renders without errors
- [ ] Saved searches work in localStorage
- [ ] Infinite scroll loads more items automatically
- [ ] Heatmap toggles on/off on map
- [ ] Witness banner shows when witnesses exist
- [ ] Cross-category insights calculate correctly
- [ ] All components are mobile-responsive
