'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { History, Clock, Search, Trash2, ExternalLink } from 'lucide-react'
import {
  getRecentSearches,
  clearSearchHistory,
  SearchHistoryItem,
} from '@/lib/utils/search-history'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface SearchHistoryDropdownProps {
  onSearchSelect?: (item: SearchHistoryItem) => void
  limit?: number
}

export function SearchHistoryDropdown({ onSearchSelect, limit = 10 }: SearchHistoryDropdownProps) {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadHistory = () => {
    const searches = getRecentSearches(limit)
    setRecentSearches(searches)
  }

  useEffect(() => {
    loadHistory()
  }, [limit])

  // Reload history when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      clearSearchHistory()
      setRecentSearches([])
    }
  }

  const handleSearchClick = (item: SearchHistoryItem) => {
    setIsOpen(false)
    onSearchSelect?.(item)
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          History
          {recentSearches.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {recentSearches.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Recent Searches</span>
          {recentSearches.length > 0 && (
            <Link href="/search/history">
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                View All
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {recentSearches.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No search history yet</p>
            <p className="text-xs mt-1">Your recent searches will appear here</p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {recentSearches.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  onClick={() => handleSearchClick(item)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">{item.query}</span>
                    </div>
                    <Badge variant={getSearchTypeColor(item.searchType) as any} className="text-xs flex-shrink-0">
                      {getSearchTypeLabel(item.searchType)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                    {item.resultCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>{item.resultCount} result{item.resultCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>

                  {item.filters && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.filters.language && (
                        <Badge variant="outline" className="text-xs h-5">
                          {item.filters.language.toUpperCase()}
                        </Badge>
                      )}
                      {item.filters.category && (
                        <Badge variant="outline" className="text-xs h-5">
                          {item.filters.category}
                        </Badge>
                      )}
                      {item.filters.crossLingual && (
                        <Badge variant="outline" className="text-xs h-5">
                          Cross-lingual
                        </Badge>
                      )}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleClearHistory}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All History
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
