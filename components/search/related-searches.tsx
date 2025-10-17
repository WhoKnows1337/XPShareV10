'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, TrendingUp, Search } from 'lucide-react'

interface RelatedSearchesProps {
  currentQuery: string
  onSearchSelect: (query: string) => void
  language?: string
  category?: string | null
}

interface Suggestion {
  query: string
  reason: string
}

export function RelatedSearches({
  currentQuery,
  onSearchSelect,
  language = 'de',
  category = null
}: RelatedSearchesProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentQuery.trim().length > 2) {
      fetchRelatedSearches()
    }
    fetchPopularSearches()
  }, [currentQuery, language, category])

  const fetchRelatedSearches = async () => {
    setIsLoading(true)
    try {
      // Use the suggestions API to get related searches
      const res = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          language,
          category
        })
      })

      if (!res.ok) throw new Error('Failed to fetch suggestions')

      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error fetching related searches:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPopularSearches = async () => {
    try {
      // Fetch popular searches from analytics (last 30 days)
      const res = await fetch('/api/search/facets', {
        method: 'GET'
      })

      if (!res.ok) throw new Error('Failed to fetch popular searches')

      const data = await res.json()

      // Extract popular search terms (would need to be added to facets API)
      // For now, use hardcoded popular searches
      const popular = [
        'UFO Bodensee',
        'Lucid Dreams',
        'Ayahuasca',
        'Paranormal',
        'Meditation',
        'Near Death Experience',
        'Time Slip',
        'Astral Projection'
      ]

      setPopularSearches(popular)
    } catch (error) {
      console.error('Error fetching popular searches:', error)
    }
  }

  if (isLoading && suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Related Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* AI-Generated Related Searches */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              You might also want to search for
              <Badge variant="secondary" className="ml-auto text-xs">
                AI
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSearchSelect(suggestion.query)}
                className="w-full justify-between h-auto py-3 px-4"
              >
                <div className="flex flex-col items-start gap-1 min-w-0 flex-1 overflow-hidden">
                  <span className="font-medium text-left truncate w-full">{suggestion.query}</span>
                  <span className="text-xs text-muted-foreground text-left line-clamp-2 w-full">
                    {suggestion.reason}
                  </span>
                </div>
                <Search className="w-4 h-4 ml-2 flex-shrink-0 opacity-50" />
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.slice(0, 8).map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSearchSelect(search)}
                  className="text-xs h-auto py-1.5 px-3"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
