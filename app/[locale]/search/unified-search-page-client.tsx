'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { UnifiedSearchBar } from '@/components/search/unified-search-bar'
import { CollapsibleFilters } from '@/components/search/collapsible-filters'
import { FilterChips, type ActiveFilter } from '@/components/search/filter-chips'
import { AnimatedResultsCount } from '@/components/search/animated-results-count'
import { LoadingProgressBar } from '@/components/search/loading-progress-bar'
import { SearchHistoryDropdown } from '@/components/search/search-history-dropdown'
import { BulkActionBar } from '@/components/search/bulk-action-bar'
import { SelectableExperienceCard } from '@/components/search/selectable-experience-card'
import { AskAI } from '@/components/search/ask-ai'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BentoGrid } from '@/components/ui/bento-grid'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TableView } from '@/components/visualization/table-view'
import { ConstellationView } from '@/components/visualization/constellation-view'
import { GraphView3D } from '@/components/visualization/graph-view-3d'
import { HeatmapView } from '@/components/visualization/heatmap-view'
import { ZeroResultsSuggestions } from '@/components/search/zero-results-suggestions'
import { SearchResultsSkeleton } from '@/components/search/search-results-skeleton'
import { ResultsStatsBar } from '@/components/search/results-stats-bar'
import { RecentSearchesWidget } from '@/components/search/recent-searches-widget'
import { RelatedSearches } from '@/components/search/related-searches'
import { KeyboardShortcutsModal } from '@/components/search/keyboard-shortcuts-modal'
import { SavedSearchesManager } from '@/components/search/saved-searches-manager'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search as SearchIcon,
  TrendingUp,
  Sliders,
  LayoutGrid,
  Table as TableIcon,
  Network,
  Box,
  Map,
  CheckSquare,
  Square,
  Bookmark,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface UnifiedSearchPageClientProps {
  initialQuery?: string
}

export function UnifiedSearchPageClient({ initialQuery = '' }: UnifiedSearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Core search state
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '')
  const [askMode, setAskMode] = useState(searchParams.get('mode') === 'ask')
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'constellation' | 'graph3d' | 'heatmap'>(
    (searchParams.get('view') as any) || 'grid'
  )

  // Results state
  const [results, setResults] = useState<any[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery || !!searchParams.get('q'))

  // Filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') || '',
    location: searchParams.get('location') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    witnessesOnly: searchParams.get('witnessesOnly') === 'true',
  })

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Keyboard shortcuts modal state
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Saved searches sheet state
  const [showSavedSearches, setShowSavedSearches] = useState(false)

  // Sort option state
  const [sortBy, setSortBy] = useState<'relevance' | 'date_desc' | 'date_asc' | 'similarity'>('relevance')

  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12) // Initial: show 12 results
  const itemsPerPage = 12

  // Calculate applied filters count
  const appliedFiltersCount =
    (filters.category ? 1 : 0) +
    (filters.tags ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.witnessesOnly ? 1 : 0)

  // Build active filters array for FilterChips
  const activeFilters: ActiveFilter[] = []
  if (filters.category) {
    activeFilters.push({
      key: 'category',
      type: 'category',
      label: 'Category',
      value: filters.category,
    })
  }
  if (filters.location) {
    activeFilters.push({
      key: 'location',
      type: 'location',
      label: 'Location',
      value: filters.location,
    })
  }
  if (filters.tags) {
    activeFilters.push({
      key: 'tags',
      type: 'tags',
      label: 'Tags',
      value: filters.tags,
    })
  }
  if (filters.dateFrom || filters.dateTo) {
    const dateValue = filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} - ${filters.dateTo}`
      : filters.dateFrom || filters.dateTo
    activeFilters.push({
      key: 'dateRange',
      type: 'dateRange',
      label: 'Date',
      value: dateValue,
    })
  }
  if (filters.witnessesOnly) {
    activeFilters.push({
      key: 'witnesses',
      type: 'witnesses',
      label: 'Witnesses',
      value: 'Has witnesses',
    })
  }

  // Update URL when state changes
  const updateURL = useCallback(
    (updates: {
      q?: string
      mode?: string
      view?: string
      category?: string
      tags?: string
      location?: string
      dateFrom?: string
      dateTo?: string
      witnessesOnly?: boolean
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        if (updates.q) params.set('q', updates.q)
        else params.delete('q')
      }

      if (updates.mode !== undefined) {
        if (updates.mode) params.set('mode', updates.mode)
        else params.delete('mode')
      }

      if (updates.view !== undefined) {
        params.set('view', updates.view)
      }

      if (updates.category !== undefined) {
        if (updates.category) params.set('category', updates.category)
        else params.delete('category')
      }

      if (updates.tags !== undefined) {
        if (updates.tags) params.set('tags', updates.tags)
        else params.delete('tags')
      }

      if (updates.location !== undefined) {
        if (updates.location) params.set('location', updates.location)
        else params.delete('location')
      }

      if (updates.dateFrom !== undefined) {
        if (updates.dateFrom) params.set('dateFrom', updates.dateFrom)
        else params.delete('dateFrom')
      }

      if (updates.dateTo !== undefined) {
        if (updates.dateTo) params.set('dateTo', updates.dateTo)
        else params.delete('dateTo')
      }

      if (updates.witnessesOnly !== undefined) {
        if (updates.witnessesOnly) params.set('witnessesOnly', 'true')
        else params.delete('witnessesOnly')
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Execute unified search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        // Build query params
        const params = new URLSearchParams({
          q: searchQuery,
        })

        if (filters.category) params.set('category', filters.category)
        if (filters.tags) params.set('tags', filters.tags)
        if (filters.location) params.set('location', filters.location)
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.set('dateTo', filters.dateTo)
        if (filters.witnessesOnly) params.set('witnessesOnly', 'true')

        // Call unified search API
        const response = await fetch(`/api/search/unified?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()

        setResults(data.results || [])
        setMetadata(data.metadata || null)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
        setMetadata(null)
      } finally {
        setIsLoading(false)
      }
    },
    [filters]
  )

  // Handle search button click
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    updateURL({ q: searchQuery })
    if (!askMode) {
      performSearch(searchQuery)
    }
  }

  // Handle ask mode toggle
  const handleAskModeToggle = () => {
    const newAskMode = !askMode
    setAskMode(newAskMode)
    updateURL({ mode: newAskMode ? 'ask' : undefined })
  }

  // Handle view mode change
  const handleViewModeChange = (view: typeof viewMode) => {
    setViewMode(view)
    updateURL({ view })
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    updateURL(newFilters)

    // Re-run search if we have a query
    if (query.trim() && !askMode) {
      performSearch(query)
    }
  }

  // Handle removing individual filter
  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters }

    if (key === 'category') newFilters.category = ''
    else if (key === 'location') newFilters.location = ''
    else if (key === 'tags') newFilters.tags = ''
    else if (key === 'dateRange') {
      newFilters.dateFrom = ''
      newFilters.dateTo = ''
    }
    else if (key === 'witnesses') newFilters.witnessesOnly = false

    handleFiltersChange(newFilters)
  }

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    const clearedFilters = {
      category: '',
      tags: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      witnessesOnly: false,
    }
    handleFiltersChange(clearedFilters)
  }

  // Handle executing saved search
  const handleExecuteSavedSearch = (savedSearch: any) => {
    setQuery(savedSearch.query)
    setAskMode(savedSearch.search_type === 'ask')
    updateURL({ q: savedSearch.query, mode: savedSearch.search_type === 'ask' ? 'ask' : undefined })

    // Close the saved searches sheet
    setShowSavedSearches(false)

    // Execute the search
    if (savedSearch.search_type !== 'ask') {
      performSearch(savedSearch.query)
    }
  }

  // Sort results based on selected option
  const sortedResults = useMemo(() => {
    if (!results || results.length === 0) return results

    const sorted = [...results]

    switch (sortBy) {
      case 'date_desc':
        return sorted.sort((a, b) => {
          const dateA = a.date_occurred ? new Date(a.date_occurred).getTime() : 0
          const dateB = b.date_occurred ? new Date(b.date_occurred).getTime() : 0
          return dateB - dateA // Newest first
        })
      case 'date_asc':
        return sorted.sort((a, b) => {
          const dateA = a.date_occurred ? new Date(a.date_occurred).getTime() : 0
          const dateB = b.date_occurred ? new Date(b.date_occurred).getTime() : 0
          return dateA - dateB // Oldest first
        })
      case 'similarity':
        return sorted.sort((a, b) => {
          const simA = a.similarity_score || a.rank_rrf || 0
          const simB = b.similarity_score || b.rank_rrf || 0
          return simB - simA // Higher similarity first
        })
      case 'relevance':
      default:
        return sorted // Keep original order (already sorted by relevance from API)
    }
  }, [results, sortBy])

  // Paginate sorted results (frontend pagination)
  const displayedResults = useMemo(() => {
    return sortedResults.slice(0, displayedCount)
  }, [sortedResults, displayedCount])

  // Check if there are more results to load
  const hasMore = sortedResults.length > displayedCount

  // Load more handler
  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + itemsPerPage, sortedResults.length))
  }

  // Bulk selection handlers
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (selected) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(results.map((r) => r.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkCompare = () => {
    const selected = results.filter((r) => selectedIds.has(r.id))
    console.log('Comparing experiences:', selected)
    alert(`Comparing ${selected.length} experiences`)
  }

  const handleBulkExportJSON = () => {
    const selected = results.filter((r) => selectedIds.has(r.id))
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
    const selected = results.filter((r) => selectedIds.has(r.id))
    const headers = ['ID', 'Title', 'Category', 'Date', 'Location']
    const rows = selected.map((exp) => [
      exp.id,
      exp.title,
      exp.category,
      exp.date_occurred || '',
      exp.location || '',
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `experiences-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `${selectedIds.size} Experiences from XP-Share`,
        text: `Check out these ${selectedIds.size} experiences I found`,
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Search URL copied to clipboard!')
    }
  }

  // Reset pagination when results change
  useEffect(() => {
    setDisplayedCount(12)
  }, [results])

  // Auto-search on mount if query in URL
  useEffect(() => {
    if (initialQuery || searchParams.get('q')) {
      const urlQuery = searchParams.get('q') || initialQuery
      if (urlQuery && !askMode) {
        performSearch(urlQuery)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "?" - Show keyboard shortcuts modal
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setShowShortcutsModal((prev) => !prev)
      }

      // "/" or Ctrl/Cmd + K - Focus search
      if (
        (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'k')
      ) {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }

      // Escape - Clear selection or search
      if (e.key === 'Escape') {
        if (selectionMode) {
          handleClearSelection()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectionMode])

  return (
    <>
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showShortcutsModal}
        onOpenChange={setShowShortcutsModal}
      />

      {/* Saved Searches Sheet */}
      <Sheet open={showSavedSearches} onOpenChange={setShowSavedSearches}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Saved Searches</SheetTitle>
            <SheetDescription>
              Manage your saved searches and set up alerts for new matches
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SavedSearchesManager onExecuteSearch={handleExecuteSavedSearch} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading} />

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
                  {['UFO Bodensee', 'Lucid Dreams', 'Ayahuasca', 'Paranormal', 'Meditation'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(term)
                        setAskMode(false)
                        updateURL({ q: term, mode: undefined })
                        performSearch(term)
                      }}
                      className="text-xs transition-all hover:scale-105 hover:shadow-md hover:border-primary/50"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Stats */}
            {metadata && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Search Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Results:</span>
                      <span className="font-medium">{results.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{metadata.executionTime}ms</span>
                    </div>
                    {metadata.intent?.vectorWeight !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Semantic:</span>
                        <span className="font-medium">{Math.round(metadata.intent.vectorWeight * 100)}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Search Link */}
            {hasSearched && results.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Share Search</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full transition-all hover:scale-105 hover:shadow-md"
                    onClick={() => {
                      const url = window.location.href
                      navigator.clipboard.writeText(url)
                    }}
                  >
                    Copy Link
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Share this search with others</p>
                </CardContent>
              </Card>
            )}
          </div>
        }
        rightPanel={
          <div className="space-y-4">
            {/* Live Search Activity */}
            <RecentSearchesWidget />

            {/* Related Searches - Show after successful search */}
            {hasSearched && query.trim().length > 0 && (
              <RelatedSearches
                currentQuery={query}
                onSearchSelect={(selectedQuery) => {
                  setQuery(selectedQuery)
                  setAskMode(false)
                  updateURL({ q: selectedQuery, mode: undefined })
                  performSearch(selectedQuery)
                }}
                language="en"
                category={filters.category || null}
              />
            )}

            {/* Saved Searches Quick Access */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Saved Searches</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Save searches and get alerts for new matches
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-start transition-all hover:scale-105 hover:shadow-md hover:border-primary/50"
                  onClick={() => setShowSavedSearches(true)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Manage Saved Searches
                </Button>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Search Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {askMode ? (
                    <>
                      <li>• Ask questions about patterns in experiences</li>
                      <li>• AI analyzes and cites specific sources</li>
                      <li>• Get insights across multiple reports</li>
                    </>
                  ) : (
                    <>
                      <li>• Type naturally or use keywords</li>
                      <li>• System automatically detects intent</li>
                      <li>• Toggle Ask mode for Q&A</li>
                      <li>• Use filters to refine results</li>
                      <li>• Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-muted border border-border rounded">?</kbd> for shortcuts</li>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start transition-all hover:scale-105 hover:shadow-md"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Browse Feed
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start transition-all hover:scale-105 hover:shadow-md"
                    >
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
                AI-powered search with automatic intent detection
              </p>
            </div>

            {/* Search History Dropdown */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Intelligent Search</h2>
              <SearchHistoryDropdown
                onSearchSelect={(item) => {
                  setQuery(item.query)
                  setAskMode(item.searchType === 'ask')
                  updateURL({ q: item.query, mode: item.searchType === 'ask' ? 'ask' : undefined })
                  if (item.searchType !== 'ask') {
                    performSearch(item.query)
                  }
                }}
              />
            </div>

            {/* Unified Search Bar */}
            <UnifiedSearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              askMode={askMode}
              onAskModeToggle={handleAskModeToggle}
            />

            {/* Collapsible Filters - Available in both Search and Ask modes */}
            <CollapsibleFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              appliedFiltersCount={appliedFiltersCount}
            />

            {/* Filter Chips - Show active filters as removable badges */}
            {activeFilters.length > 0 && (
              <FilterChips
                filters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
                className="mt-4"
              />
            )}

            {/* Ask Mode Content */}
            {askMode ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="ask-mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AskAI initialQuestion={query} onQuestionChange={setQuery} hideInput={true} filters={filters} />
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Search Mode Content */
              <AnimatePresence mode="wait">
                {!hasSearched ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="py-16">
                        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                          <h3 className="mb-2 text-lg font-semibold">Start Your Search</h3>
                          <p className="mb-6 text-sm text-muted-foreground">
                            Enter a query above or try a popular search
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchResultsSkeleton
                      count={6}
                      viewMode={viewMode === 'table' ? 'table' : 'grid'}
                    />
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div
                    key="results"
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Results Stats Bar */}
                    {metadata && (
                      <ResultsStatsBar
                        resultCount={results.length}
                        executionTime={metadata.executionTime}
                        avgSimilarity={metadata.avgSimilarity}
                        searchType="hybrid"
                      />
                    )}

                    {/* Animated Results Count */}
                    <AnimatedResultsCount
                      count={results.length}
                      queryTime={metadata?.executionTime}
                      query={query}
                      className="mb-4"
                    />

                    {/* Results Header with Sort and View Switcher */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Sort Dropdown - Left Side */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Sort:</span>
                        <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="date_desc">Newest First</SelectItem>
                            <SelectItem value="date_asc">Oldest First</SelectItem>
                            <SelectItem value="similarity">Similarity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selection and View Controls - Right Side */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Selection Mode Toggle */}
                        <Button
                          variant={selectionMode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectionMode(!selectionMode)
                            if (selectionMode) setSelectedIds(new Set())
                          }}
                        >
                          {selectionMode ? (
                            <CheckSquare className="w-4 h-4 mr-2" />
                          ) : (
                            <Square className="w-4 h-4 mr-2" />
                          )}
                          {selectionMode ? 'Exit Selection' : 'Select'}
                        </Button>

                        {/* Select All */}
                        {selectionMode && (
                          <Button variant="outline" size="sm" onClick={handleSelectAll}>
                            {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
                          </Button>
                        )}

                        {/* View Mode Switcher */}
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2">View:</span>
                            <div className="flex rounded-md border">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewModeChange('grid')}
                                    className="rounded-r-none"
                                  >
                                    <LayoutGrid className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Grid View</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewModeChange('table')}
                                    className="rounded-none border-x"
                                  >
                                    <TableIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Table View</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={viewMode === 'constellation' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewModeChange('constellation')}
                                    className="rounded-none"
                                  >
                                    <Network className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Constellation View</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={viewMode === 'graph3d' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewModeChange('graph3d')}
                                    className="rounded-none border-x"
                                  >
                                    <Box className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>3D Graph View</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewModeChange('heatmap')}
                                    className="rounded-l-none"
                                  >
                                    <Map className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Heatmap View</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Results Display - Different Views */}
                    {viewMode === 'grid' && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="show"
                      >
                        <BentoGrid className="max-w-full">
                          {displayedResults.map((experience: any, index: number) => (
                            <motion.div
                              key={experience.id}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                              }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                index === 0 && 'md:col-span-2',
                                index === 2 && 'md:row-span-2',
                                index % 7 === 0 && 'md:col-span-2'
                              )}
                            >
                              <SelectableExperienceCard
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
                                selectionMode={selectionMode}
                                isSelected={selectedIds.has(experience.id)}
                                onSelectionChange={handleSelectionChange}
                              />
                            </motion.div>
                          ))}
                        </BentoGrid>
                      </motion.div>
                    )}

                    {viewMode === 'table' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableView experiences={displayedResults} />
                      </motion.div>
                    )}

                    {viewMode === 'constellation' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ConstellationView experiences={displayedResults} />
                      </motion.div>
                    )}

                    {viewMode === 'graph3d' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <GraphView3D experiences={displayedResults} />
                      </motion.div>
                    )}

                    {viewMode === 'heatmap' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <HeatmapView experiences={displayedResults} />
                      </motion.div>
                    )}

                    {/* Load More Button */}
                    {hasMore && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="flex justify-center mt-8"
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleLoadMore}
                          className="group transition-all hover:scale-105 hover:shadow-md hover:border-primary/50"
                        >
                          <ChevronDown className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                          Load More ({sortedResults.length - displayedCount} remaining)
                        </Button>
                      </motion.div>
                    )}

                    {/* All Results Loaded Message */}
                    {!hasMore && sortedResults.length > itemsPerPage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center mt-8"
                      >
                        <p className="text-sm text-muted-foreground">
                          All {sortedResults.length} results loaded
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="zero-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ZeroResultsSuggestions
                      query={query}
                      language="en"
                      category={filters.category || null}
                      onSuggestionClick={(suggestion) => {
                        setQuery(suggestion)
                        updateURL({ q: suggestion })
                        performSearch(suggestion)
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        }
      />
    </>
  )
}
