'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, TrendingUp, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchStat {
  query: string
  count: number
  timestamp: string
}

export function RecentSearchesWidget() {
  const [recentSearches, setRecentSearches] = useState<SearchStat[]>([])
  const [popularSearches, setPopularSearches] = useState<SearchStat[]>([])
  const [totalToday, setTotalToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadSearchStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadSearchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSearchStats = async () => {
    try {
      const response = await fetch('/api/search/activity?days=7')

      if (!response.ok) {
        setError(true)
        setLoading(false)
        return
      }

      const result = await response.json()
      const data = result.data

      setTotalToday(data?.total_searches || 0)

      // Map top searches to SearchStat format
      const searches = (data?.top_searches || []).slice(0, 5).map((s: any) => ({
        query: s.query,
        count: s.count,
        timestamp: new Date().toISOString()
      }))
      setPopularSearches(searches)
      setError(false)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load search stats:', err)
      setError(true)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state if API failed
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Search Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Unable to load search activity
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Search Activity
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            Today: {totalToday}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Popular Searches Today */}
        {popularSearches.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Search className="w-3 h-3" />
              Top Searches (24h)
            </h4>
            <div className="space-y-1">
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-accent transition-colors"
                >
                  <span className="truncate flex-1">{search.query}</span>
                  <span className="text-xs text-muted-foreground ml-2 bg-primary/10 px-2 py-0.5 rounded-full">
                    {search.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {popularSearches.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No searches yet today</p>
          </div>
        )}

        {/* Live Indicator */}
        <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </span>
          <span>Updates every 30s</span>
        </div>
      </CardContent>
    </Card>
  )
}
