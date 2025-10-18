import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface SearchSuggestion {
  id: string
  type: 'query' | 'category' | 'location' | 'tag' | 'recent' | 'trending'
  text: string
  metadata?: {
    count?: number
    category?: string
    icon?: string
  }
}

// Simple typo corrections for common mistakes
const typoCorrections: Record<string, string> = {
  'ufo': 'UFO',
  'uap': 'UAP',
  'ayahuasca': 'Ayahuasca',
  'psycedelic': 'psychedelic',
  'psycadelic': 'psychedelic',
  'mediation': 'meditation',
  'lucid dreem': 'lucid dream',
  'dreem': 'dream',
}

// Frontend typo fixes - simple character substitutions
function quickTypoFix(query: string): string {
  const lower = query.toLowerCase()
  
  // Check exact matches first
  if (typoCorrections[lower]) {
    return typoCorrections[lower]
  }
  
  // Common keyboard neighbor mistakes
  const fixes = query
    .replace(/\bl\b/gi, 'I') // lowercase L to uppercase I
    .replace(/\b0\b/g, 'o') // zero to letter o
    
  return fixes
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Quick frontend typo fix
    const correctedQuery = quickTypoFix(query)

    const suggestions: SearchSuggestion[] = []

    // 1. Recent searches from user's search history
    const { data: recentSearches } = await supabase
      .from('recent_searches')
      .select('query_text')
      .eq('user_id', user.id)
      .ilike('query_text', `%${correctedQuery}%`)
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentSearches) {
      suggestions.push(
        ...recentSearches.map((s, idx) => ({
          id: `recent-${idx}`,
          type: 'recent' as const,
          text: s.query_text,
        }))
      )
    }

    // 2. Trending searches (most searched in last 7 days)
    const { data: trendingSearches } = await supabase
      .from('search_queries')
      .select('query_text')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .ilike('query_text', `%${correctedQuery}%`)
      .limit(100)

    if (trendingSearches && trendingSearches.length > 0) {
      // Count occurrences
      const queryCount = trendingSearches.reduce((acc, s) => {
        acc[s.query_text] = (acc[s.query_text] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get top 3 trending
      const trending = Object.entries(queryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .filter(([q]) => !recentSearches?.some(r => r.query_text === q)) // Avoid duplicates

      suggestions.push(
        ...trending.map(([text, count], idx) => ({
          id: `trending-${idx}`,
          type: 'trending' as const,
          text,
          metadata: { count },
        }))
      )
    }

    // 3. Category matches
    const categories = [
      { value: 'ufo', label: 'UFO Sighting', icon: '🛸' },
      { value: 'paranormal', label: 'Paranormal', icon: '👻' },
      { value: 'dreams', label: 'Dream Experience', icon: '💭' },
      { value: 'psychedelic', label: 'Psychedelic', icon: '🍄' },
      { value: 'spiritual', label: 'Spiritual', icon: '🙏' },
      { value: 'synchronicity', label: 'Synchronicity', icon: '✨' },
      { value: 'nde', label: 'Near-Death Experience', icon: '💫' },
      { value: 'other', label: 'Other Experience', icon: '🔮' },
    ]

    const matchingCategories = categories.filter(c =>
      c.label.toLowerCase().includes(correctedQuery.toLowerCase()) ||
      c.value.toLowerCase().includes(correctedQuery.toLowerCase())
    )

    if (matchingCategories.length > 0) {
      // Get counts for matching categories
      for (const cat of matchingCategories.slice(0, 3)) {
        const { count } = await supabase
          .from('experiences')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat.value)
          .eq('visibility', 'public')

        suggestions.push({
          id: `category-${cat.value}`,
          type: 'category',
          text: cat.label,
          metadata: {
            count: count || 0,
            category: cat.value,
            icon: cat.icon,
          },
        })
      }
    }

    // 4. Location suggestions
    const { data: locations } = await supabase
      .from('experiences')
      .select('location_text')
      .not('location_text', 'is', null)
      .ilike('location_text', `%${correctedQuery}%`)
      .eq('visibility', 'public')
      .limit(50)

    if (locations && locations.length > 0) {
      // Count unique locations
      const locationCount = locations.reduce((acc, l) => {
        if (l.location_text) {
          acc[l.location_text] = (acc[l.location_text] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const topLocations = Object.entries(locationCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      suggestions.push(
        ...topLocations.map(([text, count], idx) => ({
          id: `location-${idx}`,
          type: 'location' as const,
          text,
          metadata: { count },
        }))
      )
    }

    // 5. Tag suggestions from experiences
    const { data: experiencesWithTags } = await supabase
      .from('experiences')
      .select('tags')
      .not('tags', 'is', null)
      .eq('visibility', 'public')
      .limit(100)

    if (experiencesWithTags) {
      const allTags = experiencesWithTags
        .flatMap(e => e.tags || [])
        .filter(tag => tag.toLowerCase().includes(correctedQuery.toLowerCase()))

      const tagCount = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      suggestions.push(
        ...topTags.map(([text, count], idx) => ({
          id: `tag-${idx}`,
          type: 'tag' as const,
          text,
          metadata: { count },
        }))
      )
    }

    // 6. Fuzzy search for experience titles (backend pg_trgm)
    const { data: fuzzyMatches } = await supabase
      .from('experiences')
      .select('title, category')
      .textSearch('title', correctedQuery, { type: 'websearch', config: 'english' })
      .eq('visibility', 'public')
      .limit(5)

    if (fuzzyMatches && fuzzyMatches.length > 0) {
      suggestions.push(
        ...fuzzyMatches.slice(0, 3).map((exp, idx) => ({
          id: `query-${idx}`,
          type: 'query' as const,
          text: exp.title,
          metadata: {
            category: exp.category,
          },
        }))
      )
    }

    // Remove duplicates based on text
    const uniqueSuggestions = suggestions.reduce((acc, curr) => {
      if (!acc.some(s => s.text.toLowerCase() === curr.text.toLowerCase())) {
        acc.push(curr)
      }
      return acc
    }, [] as SearchSuggestion[])

    // Limit to 10 total suggestions
    const finalSuggestions = uniqueSuggestions.slice(0, 10)

    return NextResponse.json({
      suggestions: finalSuggestions,
      corrected: correctedQuery !== query ? correctedQuery : undefined,
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
