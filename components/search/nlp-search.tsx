'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { addToSearchHistory } from '@/lib/utils/search-history'
import { SearchAutocomplete } from './search-autocomplete'

interface NLPSearchProps {
  onResults: (results: any[], understood: any, meta: any) => void
  initialQuery?: string
  onQueryChange?: (query: string) => void
}

export function NLPSearch({ onResults, initialQuery = '', onQueryChange }: NLPSearchProps) {
  const [query, setQuery] = useState(initialQuery)

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    onQueryChange?.(newQuery)
  }
  const [understood, setUnderstood] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exampleQueries = [
    'UFO Sichtungen am Bodensee im Sommer mit mehreren Zeugen',
    'Nahtoderfahrungen mit Lichttunnel in den letzten 30 Tagen',
    'Orange Dreiecke die nachts gesichtet wurden',
    'Ayahuasca Erfahrungen mit intensiven Emotionen',
    'Luzide Träume über Zeitreisen',
  ]

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter at least 3 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/search/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data = await response.json()
      setUnderstood(data.understood)
      onResults(data.results || [], data.understood || {}, data.meta || {})

      // Save to search history
      try {
        addToSearchHistory(query.trim(), 'nlp', {
          ...data.understood,
        }, data.results?.length || 0)
      } catch (e) {
        console.error('Failed to save to history:', e)
      }
    } catch (err: any) {
      console.error('NLP search error:', err)
      setError(err.message || 'Failed to understand query. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Input */}
        <div className="flex gap-2">
          <SearchAutocomplete
            value={query}
            onChange={handleQueryChange}
            onSelect={(suggestion) => {
              setQuery(suggestion.text)
              handleSearch()
            }}
            placeholder="e.g., UFO Sichtungen am Bodensee im Sommer mit mehreren Zeugen"
            className="flex-1"
          />

          <Button type="submit" disabled={isLoading || query.trim().length < 3}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Search
          </Button>
        </div>
      </form>

      {/* Example Queries */}
      {!understood && !isLoading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleQueryChange(example)}
                className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* AI Understanding Display */}
      {understood && (
        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">AI understood:</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnderstood(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Categories */}
              {understood.categories?.map((cat: string) => (
                <Badge key={cat} variant="secondary">
                  Category: {cat}
                </Badge>
              ))}

              {/* Location */}
              {understood.location && (
                <Badge variant="outline">
                  📍 {understood.location.name}
                  {understood.location.radius && ` (${understood.location.radius}km)`}
                </Badge>
              )}

              {/* Date Range */}
              {understood.dateRange && (
                <Badge variant="outline">
                  📅 {understood.dateRange.from}
                  {understood.dateRange.to && ` - ${understood.dateRange.to}`}
                </Badge>
              )}

              {/* Time of Day */}
              {understood.timeOfDay && (
                <Badge variant="outline">
                  🕐 {understood.timeOfDay}
                </Badge>
              )}

              {/* Tags */}
              {understood.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}

              {/* Attributes */}
              {understood.attributes?.map((attr: any, i: number) => (
                <Badge key={i} variant="outline">
                  {attr.key}: {attr.operator || '='} {attr.value}
                </Badge>
              ))}

              {/* Keywords */}
              {understood.keywords?.map((keyword: string) => (
                <Badge key={keyword} className="bg-purple-100 dark:bg-purple-900">
                  🔍 {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 border border-destructive bg-destructive/10 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
