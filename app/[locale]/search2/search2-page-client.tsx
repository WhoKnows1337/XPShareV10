'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { AdaptiveSearchLayout } from '@/components/search/adaptive-search-layout'
import { UnifiedSearchBar } from '@/components/search/unified-search-bar'
import { CompactSearchHeader } from '@/components/search/compact-search-header'
import { PersistentFiltersSidebar } from '@/components/search/persistent-filters-sidebar'
import { CollapsibleFilters } from '@/components/search/collapsible-filters'
import { FilterChips, type ActiveFilter } from '@/components/search/filter-chips'
import { AnimatedResultsCount } from '@/components/search/animated-results-count'
import { LoadingProgressBar } from '@/components/search/loading-progress-bar'
import { SearchHistoryDropdown } from '@/components/search/search-history-dropdown'
import { BulkActionBar } from '@/components/search/bulk-action-bar'
import { SelectableExperienceCard } from '@/components/search/selectable-experience-card'
import { AskAI } from '@/components/search/ask-ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Globe,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { loadFilters, saveFilters, clearSavedFilters, mergeFilters } from '@/lib/utils/filter-persistence'
import { useTranslations } from 'next-intl'

interface UnifiedSearchPageClientProps {
  initialQuery?: string
}

export function Search2PageClient({ initialQuery = '' }: UnifiedSearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const t = useTranslations('search')

  // Core search state
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '')
  const [askMode, setAskMode] = useState(searchParams.get('mode') === 'ask')
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'constellation' | 'graph3d' | 'heatmap'>(
    (searchParams.get('view') as any) || 'grid'
  )
  const [searchScope, setSearchScope] = useState<'all' | 'my' | 'following'>(
    (searchParams.get('scope') as any) || 'all'
  )

  // Results state
  const [results, setResults] = useState<any[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery || !!searchParams.get('q'))

  // Filters state - Initially load from URL params only
  const [filters, setFilters] = useState({
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    location: searchParams.get('location') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    witnessesOnly: searchParams.get('witnessesOnly') === 'true',
  })

  // Search-within-results state
  const [withinResultsQuery, setWithinResultsQuery] = useState('')

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

  // Load saved filters on mount and merge with URL params
  useEffect(() => {
    const savedFilters = loadFilters()
    const urlFilters = {
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      location: searchParams.get('location') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      witnessesOnly: searchParams.get('witnessesOnly') === 'true',
    }

    // Merge URL params (priority) with saved filters
    const merged = mergeFilters(urlFilters, savedFilters)

    // Only update if there are saved filters to merge
    const hasUrlFilters = Object.values(urlFilters).some(v =>
      v === true || (Array.isArray(v) ? v.length > 0 : (v && v !== ''))
    )
    const hasSavedFilters = Object.values(savedFilters).some(v =>
      v === true || (Array.isArray(v) ? v.length > 0 : (v && v !== ''))
    )

    if (!hasUrlFilters && hasSavedFilters) {
      setFilters({
        categories: merged.categories || [],
        tags: merged.tags || [],
        location: merged.location || '',
        dateFrom: merged.dateFrom || '',
        dateTo: merged.dateTo || '',
        witnessesOnly: merged.witnessesOnly || false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Save filters to localStorage whenever they change
  useEffect(() => {
    // Only save if at least one filter is active
    const hasActiveFilters = Object.values(filters).some(v =>
      v === true || (Array.isArray(v) ? v.length > 0 : (v && v !== ''))
    )
    if (hasActiveFilters) {
      saveFilters(filters)
    }
  }, [filters])

  // Calculate applied filters count
  const appliedFiltersCount =
    (filters.categories && filters.categories.length > 0 ? 1 : 0) +
    (filters.tags && filters.tags.length > 0 ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.witnessesOnly ? 1 : 0)

  // Build active filters array for FilterChips
  const activeFilters: ActiveFilter[] = []
  if (filters.categories && filters.categories.length > 0) {
    activeFilters.push({
      key: 'categories',
      type: 'category',
      label: t('activeFilters.categories'),
      value: filters.categories.join(', '),
    })
  }
  if (filters.location) {
    activeFilters.push({
      key: 'location',
      type: 'location',
      label: t('activeFilters.location'),
      value: filters.location,
    })
  }
  if (filters.tags && filters.tags.length > 0) {
    activeFilters.push({
      key: 'tags',
      type: 'tags',
      label: t('activeFilters.tags'),
      value: filters.tags.join(', '),
    })
  }
  if (filters.dateFrom || filters.dateTo) {
    const dateValue = filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} - ${filters.dateTo}`
      : filters.dateFrom || filters.dateTo
    activeFilters.push({
      key: 'dateRange',
      type: 'dateRange',
      label: t('activeFilters.date'),
      value: dateValue,
    })
  }
  if (filters.witnessesOnly) {
    activeFilters.push({
      key: 'witnesses',
      type: 'witnesses',
      label: t('activeFilters.witnesses'),
      value: t('activeFilters.hasWitnesses'),
    })
  }

  // Update URL when state changes
  const updateURL = useCallback(
    (updates: {
      q?: string
      mode?: string
      view?: string
      scope?: string
      categories?: string[]
      tags?: string[]
      location?: string
      dateFrom?: string
      dateTo?: string
      witnessesOnly?: boolean
    }) => {
      const currentParams = new URLSearchParams(window.location.search)

      if (updates.q !== undefined) {
        if (updates.q) currentParams.set('q', updates.q)
        else currentParams.delete('q')
      }

      if (updates.mode !== undefined) {
        if (updates.mode) currentParams.set('mode', updates.mode)
        else currentParams.delete('mode')
      }

      if (updates.view !== undefined) {
        currentParams.set('view', updates.view)
      }

      if (updates.scope !== undefined) {
        if (updates.scope && updates.scope !== 'all') currentParams.set('scope', updates.scope)
        else currentParams.delete('scope')
      }

      if (updates.categories !== undefined) {
        if (updates.categories && updates.categories.length > 0) {
          currentParams.set('categories', updates.categories.join(','))
        } else {
          currentParams.delete('categories')
        }
      }

      if (updates.tags !== undefined) {
        if (updates.tags && updates.tags.length > 0) {
          currentParams.set('tags', updates.tags.join(','))
        } else {
          currentParams.delete('tags')
        }
      }

      if (updates.location !== undefined) {
        if (updates.location) currentParams.set('location', updates.location)
        else currentParams.delete('location')
      }

      if (updates.dateFrom !== undefined) {
        if (updates.dateFrom) currentParams.set('dateFrom', updates.dateFrom)
        else currentParams.delete('dateFrom')
      }

      if (updates.dateTo !== undefined) {
        if (updates.dateTo) currentParams.set('dateTo', updates.dateTo)
        else currentParams.delete('dateTo')
      }

      if (updates.witnessesOnly !== undefined) {
        if (updates.witnessesOnly) currentParams.set('witnessesOnly', 'true')
        else currentParams.delete('witnessesOnly')
      }

      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false })
    },
    [router, pathname]
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
      // Clear within-results filter when performing new search
      setWithinResultsQuery('')

      try {
        // Build query params
        const params = new URLSearchParams({
          q: searchQuery,
        })

        if (filters.categories && filters.categories.length > 0) {
          params.set('categories', filters.categories.join(','))
        }
        if (filters.tags && filters.tags.length > 0) {
          params.set('tags', filters.tags.join(','))
        }
        if (filters.location) params.set('location', filters.location)
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.set('dateTo', filters.dateTo)
        if (filters.witnessesOnly) params.set('witnessesOnly', 'true')
        if (searchScope && searchScope !== 'all') params.set('scope', searchScope)

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
    [filters, searchScope]
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

    if (key === 'categories') newFilters.categories = []
    else if (key === 'location') newFilters.location = ''
    else if (key === 'tags') newFilters.tags = []
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
      categories: [],
      tags: [],
      location: '',
      dateFrom: '',
      dateTo: '',
      witnessesOnly: false,
    }
    clearSavedFilters() // Also clear saved filters from localStorage
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

  // Filter results based on within-results query (client-side)
  const filteredResults = useMemo(() => {
    if (!withinResultsQuery.trim()) {
      return results
    }

    const searchTerm = withinResultsQuery.toLowerCase()

    return results.filter((exp) => {
      return (
        exp.title?.toLowerCase().includes(searchTerm) ||
        exp.story_text?.toLowerCase().includes(searchTerm) ||
        exp.category?.toLowerCase().includes(searchTerm) ||
        exp.location_text?.toLowerCase().includes(searchTerm) ||
        exp.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      )
    })
  }, [results, withinResultsQuery])

  // Sort filtered results based on selected option
  const sortedResults = useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) return filteredResults

    const sorted = [...filteredResults]

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
  }, [filteredResults, sortBy])

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
        title: t('selection.share', { count: selectedIds.size }),
        text: t('selection.shareText', { count: selectedIds.size }),
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert(t('selection.urlCopied'))
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
            <SheetTitle>{t('sidebar.savedSearches')}</SheetTitle>
            <SheetDescription>
              {t('sidebar.savedSearchesDescription')}
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

      {/* ADAPTIVE LAYOUT - Empty vs Results State */}
      <AdaptiveSearchLayout
        mode={hasSearched && results.length > 0 ? 'results' : 'empty'}
        searchHeader={
          hasSearched && results.length > 0 ? (
            // RESULTS STATE: Compact Header
            <CompactSearchHeader
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              askMode={askMode}
              onAskModeToggle={handleAskModeToggle}
              searchScope={searchScope}
              onScopeChange={(scope) => {
                setSearchScope(scope)
                updateURL({ scope })
                if (query.trim() && !askMode) {
                  performSearch(query)
                }
              }}
            />
          ) : (
            // EMPTY STATE: Large Hero Search
            <div className="text-center space-y-6">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-2 text-4xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground">{t('intelligentSearch')}</h2>
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
              <UnifiedSearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
                askMode={askMode}
                onAskModeToggle={handleAskModeToggle}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2"
              >
                <Button
                  variant={searchScope === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSearchScope('all')
                    updateURL({ scope: 'all' })
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {t('scope.all')}
                </Button>
                <Button
                  variant={searchScope === 'my' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSearchScope('my')
                    updateURL({ scope: 'my' })
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('scope.my')}
                </Button>
                <Button
                  variant={searchScope === 'following' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSearchScope('following')
                    updateURL({ scope: 'following' })
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t('scope.following')}
                </Button>
              </motion.div>
            </div>
          )
        }
        filtersSidebar={
          hasSearched && results.length > 0 && !askMode ? (
            <PersistentFiltersSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              appliedFiltersCount={appliedFiltersCount}
            />
          ) : null
        }
        relatedSidebar={
          hasSearched && results.length > 0 ? (
            <div className="space-y-4">
              {/* Related Searches */}
              {query.trim().length > 0 && (
                <RelatedSearches
                  currentQuery={query}
                  onSearchSelect={(selectedQuery) => {
                    setQuery(selectedQuery)
                    setAskMode(false)
                    updateURL({ q: selectedQuery, mode: undefined })
                    performSearch(selectedQuery)
                  }}
                  language="en"
                  category={filters.categories && filters.categories.length > 0 ? filters.categories[0] : null}
                />
              )}

              {/* Quick Stats */}
              {metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Results</span>
                      <span className="font-medium">{results.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{metadata.executionTime}ms</span>
                    </div>
                    {metadata.intent?.vectorWeight !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vector</span>
                        <span className="font-medium">{Math.round(metadata.intent.vectorWeight * 100)}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Saved Searches Quick Access */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 text-sm">{t('sidebar.savedSearches')}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setShowSavedSearches(true)}
                  >
                    <Bookmark className="w-3 h-3 mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null
        }
        mainContent={
          !hasSearched || results.length === 0 ? (
            // EMPTY STATE CONTENT
            <div className="space-y-8 mt-8">
              {/* Popular Searches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('sidebar.popularSearches')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['UFO Bodensee', 'Lucid Dreams', 'Ayahuasca', 'Paranormal', 'Meditation', 'NDE'].map((term) => (
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
                        className="transition-all hover:scale-105 hover:shadow-md hover:border-primary/50"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🔍 Search Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Use quotes for exact matches</p>
                    <p>• Try natural questions</p>
                    <p>• Filter by category</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">💬 Ask Mode</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Get AI-powered answers</p>
                    <p>• Ask complex questions</p>
                    <p>• Get summaries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">⚡ Quick Access</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Press "/" to focus search</p>
                    <p>• "?" for shortcuts</p>
                    <p>• Save frequent searches</p>
                  </CardContent>
                </Card>
              </div>

              {/* Explore Links */}
              <div className="grid md:grid-cols-2 gap-3">
                <Link href="/feed">
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="pt-6 flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{t('sidebar.browseFeed')}</h4>
                        <p className="text-xs text-muted-foreground">Discover latest experiences</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/categories">
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="pt-6 flex items-center gap-3">
                      <Sliders className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{t('sidebar.categories')}</h4>
                        <p className="text-xs text-muted-foreground">Browse by category</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          ) : (
            // RESULTS STATE CONTENT
            <div className="space-y-4">
              {/* Filter Chips - Show active filters as removable badges */}
              {activeFilters.length > 0 && (
                <FilterChips
                  filters={activeFilters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAllFilters}
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
                  <AskAI
                    initialQuestion={query}
                    onQuestionChange={setQuery}
                    hideInput={true}
                    filters={{
                      category: filters.categories && filters.categories.length > 0 ? filters.categories[0] : undefined,
                      tags: filters.tags && filters.tags.length > 0 ? filters.tags.join(',') : undefined,
                      location: filters.location,
                      dateFrom: filters.dateFrom,
                      dateTo: filters.dateTo,
                      witnessesOnly: filters.witnessesOnly,
                    }}
                  />
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
                          <h3 className="mb-2 text-lg font-semibold">{t('startSearch')}</h3>
                          <p className="mb-6 text-sm text-muted-foreground">
                            {t('startSearchDescription')}
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
                      count={withinResultsQuery ? filteredResults.length : results.length}
                      queryTime={metadata?.executionTime}
                      query={query}
                      className="mb-4"
                    />

                    {/* Search-within-Results Input (only appears when there are results) */}
                    <AnimatePresence>
                      {results.length > 5 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <Card className="bg-muted/30 border-dashed">
                            <CardContent className="py-3">
                              <div className="flex items-center gap-3">
                                <SearchIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Input
                                  type="text"
                                  value={withinResultsQuery}
                                  onChange={(e) => setWithinResultsQuery(e.target.value)}
                                  placeholder={t('filterWithin')}
                                  className="flex-1 h-9 bg-background"
                                />
                                {withinResultsQuery && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setWithinResultsQuery('')}
                                    className="flex-shrink-0"
                                  >
                                    {t('clear')}
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {withinResultsQuery
                                  ? t('showingResults', { filtered: filteredResults.length, total: results.length })
                                  : t('narrowDown')}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Results Header with Sort and View Switcher */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Sort Dropdown - Left Side */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('sort.label')}</span>
                        <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">{t('sort.relevance')}</SelectItem>
                            <SelectItem value="date_desc">{t('sort.dateDesc')}</SelectItem>
                            <SelectItem value="date_asc">{t('sort.dateAsc')}</SelectItem>
                            <SelectItem value="similarity">{t('sort.similarity')}</SelectItem>
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
                          {selectionMode ? t('selection.exitSelection') : t('selection.select')}
                        </Button>

                        {/* Select All */}
                        {selectionMode && (
                          <Button variant="outline" size="sm" onClick={handleSelectAll}>
                            {selectedIds.size === results.length ? t('selection.deselectAll') : t('selection.selectAll')}
                          </Button>
                        )}

                        {/* View Mode Switcher */}
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2">{t('viewMode.label')}</span>
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
                                  <p>{t('viewMode.grid')}</p>
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
                                  <p>{t('viewMode.table')}</p>
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
                                  <p>{t('viewMode.constellation')}</p>
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
                                  <p>{t('viewMode.graph3d')}</p>
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
                                  <p>{t('viewMode.heatmap')}</p>
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
                          {t('loadMore', { remaining: sortedResults.length - displayedCount })}
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
                          {t('allLoaded', { count: sortedResults.length })}
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
                      category={filters.categories && filters.categories.length > 0 ? filters.categories[0] : null}
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
        )}
      />
    </>
  )
}
