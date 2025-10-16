'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Sliders, Loader2, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { addToSearchHistory } from '@/lib/utils/search-history'
import { PredictiveSearchInput } from './predictive-search-input'

interface HybridSearchProps {
  onResults: (results: any[], meta: any) => void
  initialQuery?: string
  initialLanguage?: 'de' | 'en' | 'fr' | 'es'
  initialCategory?: string
  initialVectorWeight?: number
  initialCrossLingual?: boolean
  onFilterChange?: (updates: {
    query?: string
    language?: string
    category?: string
    vectorWeight?: number
    crossLingual?: boolean
  }) => void
  onLoadingChange?: (isLoading: boolean) => void
}

export function HybridSearch({
  onResults,
  initialQuery = '',
  initialLanguage = 'de',
  initialCategory = '',
  initialVectorWeight = 0.6,
  initialCrossLingual = false,
  onFilterChange,
  onLoadingChange
}: HybridSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [vectorWeight, setVectorWeight] = useState(initialVectorWeight)
  const [language, setLanguage] = useState<'de' | 'en' | 'fr' | 'es'>(initialLanguage)
  const [category, setCategory] = useState<string>(initialCategory)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [crossLingual, setCrossLingual] = useState(initialCrossLingual)

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    onFilterChange?.({ query: newQuery })
  }, [onFilterChange])

  const handleLanguageChange = useCallback((newLanguage: 'de' | 'en' | 'fr' | 'es') => {
    setLanguage(newLanguage)
    onFilterChange?.({ language: newLanguage })
  }, [onFilterChange])

  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory)
    onFilterChange?.({ category: newCategory })
  }, [onFilterChange])

  const handleVectorWeightChange = useCallback((newWeight: number) => {
    setVectorWeight(newWeight)
    onFilterChange?.({ vectorWeight: newWeight })
  }, [onFilterChange])

  const handleCrossLingualChange = useCallback((newCrossLingual: boolean) => {
    setCrossLingual(newCrossLingual)
    onFilterChange?.({ crossLingual: newCrossLingual })
  }, [onFilterChange])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsLoading(true)
    onLoadingChange?.(true)
    setError(null)

    try {
      // If cross-lingual is enabled, translate and search in all languages
      if (crossLingual) {
        // Step 1: Translate the query
        const translateResponse = await fetch('/api/search/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query.trim(),
            sourceLanguage: 'auto',
            targetLanguages: ['de', 'en', 'fr', 'es'],
          }),
        })

        if (!translateResponse.ok) {
          throw new Error('Translation failed')
        }

        const translateData = await translateResponse.json()
        const translations = translateData.translations

        // Step 2: Search in all languages in parallel
        const searchPromises = Object.entries(translations).map(async ([lang, translatedQuery]) => {
          const response = await fetch('/api/search/hybrid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: translatedQuery as string,
              language: lang,
              vectorWeight,
              category: category || null,
              limit: 10, // Limit per language
            }),
          })

          if (!response.ok) return { results: [], language: lang }

          const data = await response.json()
          return { results: data.results || [], language: lang }
        })

        const allResults = await Promise.all(searchPromises)

        // Step 3: Merge and deduplicate results
        const seenIds = new Set<string>()
        const mergedResults: any[] = []

        for (const { results, language: resultLang } of allResults) {
          for (const result of results) {
            if (!seenIds.has(result.id)) {
              seenIds.add(result.id)
              mergedResults.push({
                ...result,
                matchedLanguage: resultLang, // Track which language matched
              })
            }
          }
        }

        // Sort by combined score
        mergedResults.sort((a, b) => (b.combined_score || 0) - (a.combined_score || 0))

        const finalResults = mergedResults.slice(0, 20)
        onResults(finalResults, {
          crossLingual: true,
          languages: Object.keys(translations),
          translations,
          vectorWeight,
        })

        // Save to search history
        try {
          addToSearchHistory(query.trim(), 'hybrid', {
            language,
            category: category || undefined,
            vectorWeight,
            crossLingual: true,
          }, finalResults.length)
        } catch (e) {
          console.error('Failed to save to history:', e)
        }
      } else {
        // Standard single-language search
        const response = await fetch('/api/search/hybrid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query.trim(),
            language,
            vectorWeight,
            category: category || null,
            limit: 20,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Search failed')
        }

        const data = await response.json()
        const results = data.results || []
        onResults(results, data.meta || {})

        // Save to search history
        try {
          addToSearchHistory(query.trim(), 'hybrid', {
            language,
            category: category || undefined,
            vectorWeight,
            crossLingual: false,
          }, results.length)
        } catch (e) {
          console.error('Failed to save to history:', e)
        }
      }
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Failed to search. Please try again.')
    } finally {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }

  const getSearchStrategyLabel = () => {
    if (vectorWeight < 0.3) return 'Focus on exact keywords'
    if (vectorWeight > 0.7) return 'Focus on meaning & context'
    return 'Balanced hybrid search'
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Input */}
        <div className="flex gap-2">
          <PredictiveSearchInput
            value={query}
            onQueryChange={handleQueryChange}
            onSearch={(q) => {
              setQuery(q)
              handleSearch()
            }}
            placeholder="Search experiences..."
            className="flex-1"
            showRecentSearches={true}
            showTrending={true}
          />

          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Sliders className="w-4 h-4" />
          </Button>
        </div>

        {/* Cross-Lingual Search Toggle - Prominent Position */}
        <Card className="border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Cross-Lingual Search
                  {crossLingual && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Active
                    </span>
                  )}
                </label>
                <p className="text-xs text-muted-foreground">
                  {crossLingual ? (
                    <span className="flex items-center gap-1">
                      Searching in 4 languages: <span className="font-semibold">🇩🇪 DE • 🇬🇧 EN • 🇫🇷 FR • 🇪🇸 ES</span>
                    </span>
                  ) : (
                    'Search in all languages simultaneously for better results'
                  )}
                </p>
              </div>
              <Switch
                checked={crossLingual}
                onCheckedChange={handleCrossLingualChange}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        {showAdvanced && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Language Selector - Only show if cross-lingual is disabled */}
              {!crossLingual && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select
                    value={language}
                    onValueChange={(val) => handleLanguageChange(val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="ufo">🛸 UFO</SelectItem>
                    <SelectItem value="paranormal">👻 Paranormal</SelectItem>
                    <SelectItem value="dreams">💭 Dreams</SelectItem>
                    <SelectItem value="synchronicity">✨ Synchronicity</SelectItem>
                    <SelectItem value="psychedelic">🍄 Psychedelic</SelectItem>
                    <SelectItem value="nde">🌟 Near-Death Experience</SelectItem>
                    <SelectItem value="meditation">🧘 Meditation</SelectItem>
                    <SelectItem value="astral-projection">🌌 Astral Projection</SelectItem>
                    <SelectItem value="time-anomaly">⏰ Time Anomaly</SelectItem>
                    <SelectItem value="entity">👽 Entity Encounter</SelectItem>
                    <SelectItem value="energy">⚡ Energy</SelectItem>
                    <SelectItem value="other">❓ Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vector Weight Slider */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search Strategy
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-16">Keyword</span>
                  <Slider
                    value={[vectorWeight * 100]}
                    onValueChange={([val]) => handleVectorWeightChange(val / 100)}
                    min={0}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    Semantic
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {getSearchStrategyLabel()} ({Math.round(vectorWeight * 100)}% semantic)
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-3 border border-destructive bg-destructive/10 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
