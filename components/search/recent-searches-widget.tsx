'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, TrendingUp, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

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
  const [isAdmin, setIsAdmin] = useState(false)

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
      setLoading(false)
    }

    checkAdmin()
  }, [])

  // Load search stats only if admin
  useEffect(() => {
    if (!isAdmin) return

    loadSearchStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadSearchStats, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  const loadSearchStats = async () => {
    try {
      const response = await fetch('/api/admin/search-analytics?type=overview&days=1')
      if (!response.ok) {
        setLoading(false)
        return
      }

      const data = await response.json()
      setTotalToday(data.data?.total_searches || 0)

      // Load top searches
      const topResponse = await fetch('/api/admin/search-analytics?type=top-searches&days=1')
      if (topResponse.ok) {
        const topData = await topResponse.json()
        const searches = (topData.data || []).slice(0, 5).map((s: any) => ({
          query: s.query,
          count: s.count,
          timestamp: new Date().toISOString()
        }))
        setPopularSearches(searches)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load search stats:', error)
      setLoading(false)
    }
  }

  // Don't show widget if not admin
  if (!isAdmin && !loading) {
    return null
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
