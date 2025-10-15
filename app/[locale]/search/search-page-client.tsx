'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { HybridSearch } from '@/components/search/hybrid-search'
import { NLPSearch } from '@/components/search/nlp-search'
import { AskAI } from '@/components/search/ask-ai'
import { AdvancedSearchBuilder } from '@/components/search/advanced-search-builder'
import { AdvancedFiltersPanel, AdvancedFilters } from '@/components/search/advanced-filters-panel'
import { SearchHistoryDropdown } from '@/components/search/search-history-dropdown'
import { BulkActionBar } from '@/components/search/bulk-action-bar'
import { SelectableExperienceCard } from '@/components/search/selectable-experience-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BentoGrid } from '@/components/ui/bento-grid'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { TableView } from '@/components/visualization/table-view'
import { ConstellationView } from '@/components/visualization/constellation-view'
import { GraphView3D } from '@/components/visualization/graph-view-3d'
import { HeatmapView } from '@/components/visualization/heatmap-view'
import { ZeroResultsSuggestions } from '@/components/search/zero-results-suggestions'
import { Search as SearchIcon, Sparkles, Sliders, TrendingUp, Loader2, MessageSquare, LayoutGrid, Table as TableIcon, Network, Box, Map, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  deserializeFiltersFromURL,
  serializeFiltersToURL,
  SearchFilters as URLSearchFilters
} from '@/lib/utils/search-url-params'

interface SearchPageClientProps {
  initialQuery?: string
}

export function SearchPageClient({ initialQuery = '' }: SearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initialize state from URL params or defaults
  const [searchMode, setSearchMode] = useState<'hybrid' | 'nlp' | 'ask' | 'advanced'>(
    (searchParams.get('mode') as any) || 'hybrid'
  )
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'constellation' | 'graph3d' | 'heatmap'>(
    (searchParams.get('view') as any) || 'grid'
  )
  const [results, setResults] = useState<any[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [searchMeta, setSearchMeta] = useState<any>(null)
  const [understood, setUnderstood] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery || !!searchParams.get('q'))

  // Search filters state (for URL sync)
  const [searchFilters, setSearchFilters] = useState({
    query: searchParams.get('q') || initialQuery || '',
    language: searchParams.get('lang') || 'de',
    category: searchParams.get('cat') || '',
    vectorWeight: parseFloat(searchParams.get('vw') || '0.6'),
    crossLingual: searchParams.get('cross') === 'true',
  })

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    witnessCount: { min: 0, max: 50 },
    mediaTypes: {
      hasPhotos: false,
      hasAudio: false,
      hasSketches: false,
    },
    duration: { min: 0, max: 480 },
    credibilityScore: { min: 0, max: 10 },
  })

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Update URL when state changes
  const updateURL = (updates: Partial<typeof searchFilters & { mode?: string; view?: string }>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update mode
    if (updates.mode !== undefined) {
      params.set('mode', updates.mode)
    }
    
    // Update view
    if (updates.view !== undefined) {
      params.set('view', updates.view)
    }
    
    // Update search filters
    if (updates.query !== undefined && updates.query) {
      params.set('q', updates.query)
    } else if (updates.query === '') {
      params.delete('q')
    }
    
    if (updates.language !== undefined) {
      params.set('lang', updates.language)
    }
    
    if (updates.category !== undefined && updates.category) {
      params.set('cat', updates.category)
    } else if (updates.category === '') {
      params.delete('cat')
    }
    
    if (updates.vectorWeight !== undefined) {
      params.set('vw', updates.vectorWeight.toString())
    }
    
    if (updates.crossLingual !== undefined) {
      params.set('cross', updates.crossLingual.toString())
    }
    
    // Replace URL without triggering navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSearchModeChange = (mode: string) => {
    const validMode = mode as 'hybrid' | 'nlp' | 'ask' | 'advanced'
    setSearchMode(validMode)
    updateURL({ mode: validMode })
  }

  const handleViewModeChange = (view: 'grid' | 'table' | 'constellation' | 'graph3d' | 'heatmap') => {
    setViewMode(view)
    updateURL({ view })
  }

  const handleFilterUpdate = (updates: Partial<typeof searchFilters>) => {
    const newFilters = { ...searchFilters, ...updates }
    setSearchFilters(newFilters)
    updateURL(updates)
  }

  const handleHybridResults = (newResults: any[], meta: any) => {
    setResults(newResults)
    setSearchMeta(meta)
    setUnderstood(null)
    setHasSearched(true)
  }

  const handleNLPResults = (newResults: any[], understood: any, meta: any) => {
    setResults(newResults)
    setSearchMeta(meta)
    setUnderstood(understood)
    setHasSearched(true)
  }

  const handleAdvancedSearch = (filters: any) => {
    // For now, just show results (would integrate with existing advanced search logic)
    setHasSearched(true)
  }

  const handlePopularSearch = (term: string) => {
    setSearchFilters({ ...searchFilters, query: term })
    updateURL({ query: term })
    setSearchMode('hybrid')
    updateURL({ mode: 'hybrid' })
  }

  // Bulk selection handlers
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredResults.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredResults.map(r => r.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkCompare = () => {
    const selected = filteredResults.filter(r => selectedIds.has(r.id))
    console.log('Comparing experiences:', selected)
    // TODO: Implement comparison view
    alert(`Comparing ${selected.length} experiences`)
  }

  const handleBulkExportJSON = () => {
    const selected = filteredResults.filter(r => selectedIds.has(r.id))
    const json = JSON.stringify(selected, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `experiences-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkExportCSV = () => {
    const selected = filteredResults.filter(r => selectedIds.has(r.id))
    const headers = ['ID', 'Title', 'Category', 'Date', 'Location']
    const rows = selected.map(exp => [
      exp.id,
      exp.title,
      exp.category,
      exp.date_occurred || '',
      exp.location || '',
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `experiences-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkShare = () => {
    const selectedCount = selectedIds.size
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `${selectedCount} Experiences from XP-Share`,
        text: `Check out these ${selectedCount} experiences I found`,
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Search URL copied to clipboard!')
    }
  }

  // Apply advanced filters to search results
  const applyAdvancedFilters = (experiences: any[]): any[] => {
    return experiences.filter((exp) => {
      // Date Range Filter
      if (advancedFilters.dateRange?.from || advancedFilters.dateRange?.to) {
        const expDate = exp.date_occurred ? new Date(exp.date_occurred) : null
        if (!expDate) return false

        if (advancedFilters.dateRange.from && expDate < advancedFilters.dateRange.from) {
          return false
        }
        if (advancedFilters.dateRange.to && expDate > advancedFilters.dateRange.to) {
          return false
        }
      }

      // Witness Count Filter
      if (advancedFilters.witnessCount) {
        const witnessCount = exp.witness_count || 0
        if (witnessCount < advancedFilters.witnessCount.min || witnessCount > advancedFilters.witnessCount.max) {
          return false
        }
      }

      // Media Types Filter
      if (advancedFilters.mediaTypes.hasPhotos && !exp.has_photos) {
        return false
      }
      if (advancedFilters.mediaTypes.hasAudio && !exp.has_audio) {
        return false
      }
      if (advancedFilters.mediaTypes.hasSketches && !exp.has_sketches) {
        return false
      }

      // Duration Filter
      if (advancedFilters.duration) {
        const duration = exp.duration_minutes || 0
        if (duration < advancedFilters.duration.min || duration > advancedFilters.duration.max) {
          return false
        }
      }

      // Credibility Score Filter
      if (advancedFilters.credibilityScore) {
        const score = exp.credibility_score || 0
        if (score < advancedFilters.credibilityScore.min || score > advancedFilters.credibilityScore.max) {
          return false
        }
      }

      // Location Filter (geographic distance)
      if (advancedFilters.location && exp.latitude && exp.longitude) {
        const distance = calculateDistance(
          advancedFilters.location.lat,
          advancedFilters.location.lng,
          exp.latitude,
          exp.longitude
        )
        // Filter experiences within 50km radius
        if (distance > 50) {
          return false
        }
      }

      return true
    })
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Apply advanced filters whenever results or filters change
  useEffect(() => {
    const filtered = applyAdvancedFilters(results)
    setFilteredResults(filtered)
  }, [results, advancedFilters])

  // Hydrate state from URL on mount and browser back/forward
  useEffect(() => {
    const urlFilters = deserializeFiltersFromURL(searchParams)

    // Update state from URL if values differ
    if (urlFilters.searchMode && urlFilters.searchMode !== searchMode) {
      setSearchMode(urlFilters.searchMode)
    }
    if (urlFilters.viewMode && urlFilters.viewMode !== viewMode) {
      setViewMode(urlFilters.viewMode as any)
    }

    // Update advanced filters from URL
    if (urlFilters.dateRange) {
      setAdvancedFilters((prev) => ({ ...prev, dateRange: urlFilters.dateRange }))
    }
    if (urlFilters.witnessCount && urlFilters.witnessCount.min !== undefined && urlFilters.witnessCount.max !== undefined) {
      setAdvancedFilters((prev) => ({
        ...prev,
        witnessCount: {
          min: urlFilters.witnessCount!.min!,
          max: urlFilters.witnessCount!.max!
        }
      }))
    }
    if (urlFilters.location && urlFilters.location.lat !== undefined && urlFilters.location.lng !== undefined) {
      setAdvancedFilters((prev) => ({
        ...prev,
        location: urlFilters.location as { lat: number; lng: number; name: string }
      }))
    }
    if (urlFilters.duration && urlFilters.duration.min !== undefined && urlFilters.duration.max !== undefined) {
      setAdvancedFilters((prev) => ({
        ...prev,
        duration: {
          min: urlFilters.duration!.min!,
          max: urlFilters.duration!.max!
        }
      }))
    }
    if (urlFilters.credibilityScore && urlFilters.credibilityScore.min !== undefined && urlFilters.credibilityScore.max !== undefined) {
      setAdvancedFilters((prev) => ({
        ...prev,
        credibilityScore: {
          min: urlFilters.credibilityScore!.min!,
          max: urlFilters.credibilityScore!.max!
        }
      }))
    }
  }, [searchParams])

  // Browser back/forward support
  useEffect(() => {
    const handlePopState = () => {
      // State will be updated by the searchParams useEffect above
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <>
      <BulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onCompare={handleBulkCompare}
        onExportJSON={handleBulkExportJSON}
        onExportCSV={handleBulkExportCSV}
        onShare={handleBulkShare}
      />

      <ThreeColumnLayout
      leftSidebar={
        <div className="sticky top-4 space-y-4">
          {/* Popular Searches */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'UFO Bodensee',
                  'Lucid Dreams',
                  'Ayahuasca',
                  'Paranormal',
                  'Meditation',
                ].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePopularSearch(term)}
                    className="text-xs"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Stats */}
          {searchMeta && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Search Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Results:</span>
                    <span className="font-medium">{filteredResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{searchMeta.executionTime}ms</span>
                  </div>
                  {searchMeta.vectorWeight !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Semantic:</span>
                      <span className="font-medium">
                        {Math.round(searchMeta.vectorWeight * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Search Link */}
          {hasSearched && filteredResults.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Share Search</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const url = window.location.href
                    navigator.clipboard.writeText(url)
                  }}
                >
                  Copy Link
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this search with others
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          {/* Search Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Search Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {searchMode === 'hybrid' && (
                  <>
                    <li>• Adjust semantic weight for better results</li>
                    <li>• Use keywords for exact matches</li>
                    <li>• Try different languages</li>
                  </>
                )}
                {searchMode === 'nlp' && (
                  <>
                    <li>• Ask in natural language</li>
                    <li>• Mention specific details (location, time, etc.)</li>
                    <li>• AI will extract structured filters</li>
                  </>
                )}
                {searchMode === 'ask' && (
                  <>
                    <li>• Ask questions about patterns in experiences</li>
                    <li>• AI analyzes and cites specific sources</li>
                    <li>• Get insights across multiple reports</li>
                  </>
                )}
                {searchMode === 'advanced' && (
                  <>
                    <li>• Combine multiple filters</li>
                    <li>• Use location + radius</li>
                    <li>• Save frequent searches</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Explore More</h3>
              <div className="flex flex-col gap-2">
                <Link href="/feed">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse Feed
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Sliders className="w-4 h-4 mr-2" />
                    Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      }
      mainContent={
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold">Search Experiences</h1>
            <p className="text-muted-foreground">
              Find extraordinary experiences with AI-powered search
            </p>
          </div>

          {/* Search Modes Tabs with History */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">Search Mode</h2>
            <SearchHistoryDropdown
              onSearchSelect={(item) => {
                // Load search from history
                setSearchMode(item.searchType)
                setSearchFilters({
                  query: item.query,
                  language: item.filters?.language || 'de',
                  category: item.filters?.category || '',
                  vectorWeight: item.filters?.vectorWeight || 0.6,
                  crossLingual: item.filters?.crossLingual || false,
                })
                updateURL({
                  mode: item.searchType,
                  query: item.query,
                  ...(item.filters || {}),
                })
              }}
            />
          </div>

          <Tabs value={searchMode} onValueChange={handleSearchModeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hybrid">
                <SearchIcon className="w-4 h-4 mr-2" />
                Hybrid
              </TabsTrigger>
              <TabsTrigger value="nlp">
                <Sparkles className="w-4 h-4 mr-2" />
                Natural
              </TabsTrigger>
              <TabsTrigger value="ask">
                <MessageSquare className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Sliders className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Hybrid Search Tab */}
            <TabsContent value="hybrid" className="space-y-6">
              <HybridSearch 
                onResults={handleHybridResults} 
                initialQuery={searchFilters.query}
                initialLanguage={searchFilters.language as any}
                initialCategory={searchFilters.category}
                initialVectorWeight={searchFilters.vectorWeight}
                initialCrossLingual={searchFilters.crossLingual}
                onFilterChange={handleFilterUpdate}
              />
            </TabsContent>

            {/* NLP Search Tab */}
            <TabsContent value="nlp" className="space-y-6">
              <NLPSearch 
                onResults={handleNLPResults} 
                initialQuery={searchFilters.query}
                onQueryChange={(query) => handleFilterUpdate({ query })}
              />
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="ask" className="space-y-6">
              <AskAI 
                initialQuestion={searchFilters.query}
                onQuestionChange={(query) => handleFilterUpdate({ query })}
              />
            </TabsContent>

            {/* Advanced Search Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <AdvancedSearchBuilder onSearch={handleAdvancedSearch} resultCount={results.length} />
            </TabsContent>
          </Tabs>

          {/* Search Results or Empty State - Only for non-Q&A modes */}
          {searchMode !== 'ask' && (
            <>
              {!hasSearched ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                      <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mb-2 text-lg font-semibold">Start Your Search</h3>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Choose a search mode above and enter your query to find experiences
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {/* Results Header with View Switcher */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{filteredResults.length}</span> result
                      {filteredResults.length !== 1 ? 's' : ''} found
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Selection Mode Toggle */}
                      <Button
                        variant={selectionMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectionMode(!selectionMode)
                          if (selectionMode) {
                            setSelectedIds(new Set())
                          }
                        }}
                      >
                        {selectionMode ? (
                          <CheckSquare className="w-4 h-4 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 mr-2" />
                        )}
                        {selectionMode ? 'Exit Selection' : 'Select'}
                      </Button>

                      {/* Select All - Only show in selection mode */}
                      {selectionMode && (
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                          {selectedIds.size === filteredResults.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}

                      {/* Advanced Filters Panel */}
                      <AdvancedFiltersPanel
                        filters={advancedFilters}
                        onFiltersChange={(filters) => {
                          setAdvancedFilters(filters)
                          // Filters are automatically applied via useEffect
                        }}
                      />

                      {/* View Mode Switcher */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2">View:</span>
                        <div className="flex rounded-md border">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewModeChange('grid')}
                            className="rounded-r-none"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewModeChange('table')}
                            className="rounded-none border-x"
                          >
                            <TableIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'constellation' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewModeChange('constellation')}
                            className="rounded-none"
                          >
                            <Network className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'graph3d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewModeChange('graph3d')}
                            className="rounded-none border-x"
                          >
                            <Box className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewModeChange('heatmap')}
                            className="rounded-l-none"
                          >
                            <Map className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Display - Different Views */}
                  {viewMode === 'grid' && (
                    <BentoGrid className="max-w-full">
                      {filteredResults.map((experience: any, index: number) => (
                        <SelectableExperienceCard
                          key={experience.id}
                          experience={experience}
                          size={
                            index === 0
                              ? 'large'
                              : index === 2
                                ? 'wide'
                                : index % 7 === 0
                                  ? 'large'
                                  : 'default'
                          }
                          className={cn(
                            index === 0 && 'md:col-span-2',
                            index === 2 && 'md:row-span-2',
                            index % 7 === 0 && 'md:col-span-2'
                          )}
                          selectionMode={selectionMode}
                          isSelected={selectedIds.has(experience.id)}
                          onSelectionChange={handleSelectionChange}
                        />
                      ))}
                    </BentoGrid>
                  )}

                  {viewMode === 'table' && <TableView experiences={filteredResults} />}

                  {viewMode === 'constellation' && <ConstellationView experiences={filteredResults} />}

                  {viewMode === 'graph3d' && <GraphView3D experiences={filteredResults} />}

                  {viewMode === 'heatmap' && <HeatmapView experiences={filteredResults} />}
                </div>
              ) : (
                <ZeroResultsSuggestions
                  query={searchFilters.query}
                  language={searchFilters.language}
                  category={searchFilters.category || null}
                  onSuggestionClick={(suggestion) => {
                    handleFilterUpdate({ query: suggestion })
                    // Re-trigger search with new query
                    setSearchFilters({ ...searchFilters, query: suggestion })
                  }}
                />
              )}
            </>
          )}
        </div>
      }
    />
    </>
  )
}
