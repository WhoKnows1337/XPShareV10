'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Lightbulb, Loader2, Tag } from 'lucide-react'

interface Suggestion {
  query: string
  reason: string
}

interface ZeroResultsSuggestionsProps {
  query: string
  language?: string
  category?: string | null
  onSuggestionClick: (suggestion: string) => void
}

export function ZeroResultsSuggestions({
  query,
  language = 'de',
  category = null,
  onSuggestionClick,
}: ZeroResultsSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [issue, setIssue] = useState<string>('')
  const [tips, setTips] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    async function fetchSuggestions() {
      if (!query.trim() || hasLoaded) return

      setIsLoading(true)

      try {
        const response = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            language,
            category,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setCategories(data.categories || [])
        setIssue(data.issue || 'No results found for this search')
        setTips(data.tips)
        setHasLoaded(true)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [query, language, category, hasLoaded])

  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
          <SearchIcon className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <h3 className="mb-2 text-lg font-semibold">No Results Found</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Analyzing your search...' : issue}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Getting AI suggestions...</span>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                <span>Try these searches instead:</span>
              </div>

              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => onSuggestionClick(suggestion.query)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.query}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {suggestion.reason}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && categories.length > 0 && (
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>Or explore these categories:</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // This would need to be passed as a prop to handle category changes
                      // For now, just trigger a search with the category name
                      onSuggestionClick(cat)
                    }}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && tips && (
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Tip:</strong> {tips}
            </div>
          )}

          {!isLoading && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
