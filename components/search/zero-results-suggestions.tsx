'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Lightbulb, Loader2, Tag, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

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
          {/* Visual Illustration with Sparkles */}
          <div className="relative">
            <SearchIcon className="h-16 w-16 text-muted-foreground/30" />
            <Sparkles className="h-7 w-7 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
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

              <motion.div
                className="space-y-2"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1, // 100ms delay between suggestions
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 transition-all hover:scale-[1.02] hover:shadow-md hover:border-primary/50"
                      onClick={() => onSuggestionClick(suggestion.query)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.query}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.reason}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {!isLoading && categories.length > 0 && (
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>Or explore these categories:</span>
              </div>

              <motion.div
                className="flex flex-wrap gap-2 justify-center"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05, // 50ms delay between categories
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {categories.map((cat) => (
                  <motion.div
                    key={cat}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: { opacity: 1, scale: 1 },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="transition-all hover:scale-110 hover:shadow-md"
                      onClick={() => {
                        // This would need to be passed as a prop to handle category changes
                        // For now, just trigger a search with the category name
                        onSuggestionClick(cat)
                      }}
                    >
                      {cat}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
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
