'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getHistoryGroupedByDate,
  clearSearchHistory,
  removeFromSearchHistory,
  searchInHistory,
  exportSearchHistory,
  SearchHistoryItem,
} from '@/lib/utils/search-history'
import { Search, Trash2, Download, FileJson, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function SearchHistoryPage() {
  const [groupedHistory, setGroupedHistory] = useState<Record<string, SearchHistoryItem[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredHistory, setFilteredHistory] = useState<SearchHistoryItem[] | null>(null)
  const router = useRouter()

  const loadHistory = () => {
    const grouped = getHistoryGroupedByDate()
    setGroupedHistory(grouped)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchInHistory(searchQuery)
      setFilteredHistory(results)
    } else {
      setFilteredHistory(null)
    }
  }, [searchQuery])

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      clearSearchHistory()
      setGroupedHistory({})
      setFilteredHistory(null)
    }
  }

  const handleDeleteItem = (id: string) => {
    removeFromSearchHistory(id)
    loadHistory()
    if (searchQuery.trim()) {
      const results = searchInHistory(searchQuery)
      setFilteredHistory(results)
    }
  }

  const handleExport = () => {
    const json = exportSearchHistory()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-history-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSearchClick = (item: SearchHistoryItem) => {
    // Build search URL based on search type and filters
    const params = new URLSearchParams({
      mode: item.searchType,
      q: item.query,
    })

    if (item.filters) {
      if (item.filters.language) params.set('lang', item.filters.language)
      if (item.filters.category) params.set('cat', item.filters.category)
      if (item.filters.vectorWeight !== undefined) params.set('vw', item.filters.vectorWeight.toString())
      if (item.filters.crossLingual) params.set('cross', 'true')
    }

    router.push(`/search?${params.toString()}`)
  }

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'hybrid':
        return 'Hybrid'
      case 'nlp':
        return 'Natural'
      case 'ask':
        return 'Q&A'
      case 'advanced':
        return 'Advanced'
      default:
        return type
    }
  }

  const getSearchTypeColor = (type: string) => {
    switch (type) {
      case 'hybrid':
        return 'default'
      case 'nlp':
        return 'secondary'
      case 'ask':
        return 'outline'
      case 'advanced':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const renderHistoryItem = (item: SearchHistoryItem) => (
    <Card key={item.id} className="hover:bg-accent/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-lg">{item.query}</h3>
              <Badge variant={getSearchTypeColor(item.searchType) as any}>
                {getSearchTypeLabel(item.searchType)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(item.timestamp), 'MMM dd, yyyy - HH:mm')}</span>
              {item.resultCount !== undefined && (
                <>
                  <span>•</span>
                  <span>{item.resultCount} result{item.resultCount !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            {item.filters && (
              <div className="flex flex-wrap gap-1">
                {item.filters.language && (
                  <Badge variant="outline" className="text-xs">
                    Language: {item.filters.language.toUpperCase()}
                  </Badge>
                )}
                {item.filters.category && (
                  <Badge variant="outline" className="text-xs">
                    Category: {item.filters.category}
                  </Badge>
                )}
                {item.filters.vectorWeight !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Semantic: {Math.round(item.filters.vectorWeight * 100)}%
                  </Badge>
                )}
                {item.filters.crossLingual && (
                  <Badge variant="outline" className="text-xs">
                    Cross-lingual
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick(item)}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Again
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteItem(item.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const totalCount = filteredHistory
    ? filteredHistory.length
    : Object.values(groupedHistory).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search History</h1>
        <p className="text-muted-foreground">
          Browse and manage your past searches
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={totalCount === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={totalCount === 0}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Display */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Search History</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your search history will appear here as you search
            </p>
            <Button onClick={() => router.push('/search')}>
              <Search className="w-4 h-4 mr-2" />
              Start Searching
            </Button>
          </CardContent>
        </Card>
      ) : filteredHistory ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Found {filteredHistory.length} matching search{filteredHistory.length !== 1 ? 'es' : ''}
          </p>
          {filteredHistory.map(renderHistoryItem)}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedHistory.today && groupedHistory.today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Today</h2>
              <div className="space-y-3">
                {groupedHistory.today.map(renderHistoryItem)}
              </div>
            </div>
          )}

          {groupedHistory.yesterday && groupedHistory.yesterday.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Yesterday</h2>
              <div className="space-y-3">
                {groupedHistory.yesterday.map(renderHistoryItem)}
              </div>
            </div>
          )}

          {groupedHistory.thisWeek && groupedHistory.thisWeek.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">This Week</h2>
              <div className="space-y-3">
                {groupedHistory.thisWeek.map(renderHistoryItem)}
              </div>
            </div>
          )}

          {groupedHistory.thisMonth && groupedHistory.thisMonth.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">This Month</h2>
              <div className="space-y-3">
                {groupedHistory.thisMonth.map(renderHistoryItem)}
              </div>
            </div>
          )}

          {groupedHistory.older && groupedHistory.older.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Older</h2>
              <div className="space-y-3">
                {groupedHistory.older.map(renderHistoryItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
