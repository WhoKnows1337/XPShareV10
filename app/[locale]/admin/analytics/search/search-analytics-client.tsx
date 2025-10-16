'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  TrendingUp,
  AlertCircle,
  Clock,
  Users,
  MousePointerClick,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SearchTrendsChart } from '@/components/admin/search-trends-chart'

interface SearchStat {
  query_text: string
  search_count: number
  avg_result_count: number
  click_through_rate: number
  last_searched: string
}

interface ZeroResultQuery {
  query_text: string
  attempt_count: number
  last_attempted: string
  search_type: string
}

export function SearchAnalyticsClient() {
  const [timeRange, setTimeRange] = useState('7')
  const [isLoading, setIsLoading] = useState(true)
  const [popularSearches, setPopularSearches] = useState<SearchStat[]>([])
  const [zeroResultQueries, setZeroResultQueries] = useState<ZeroResultQuery[]>([])
  const [totalSearches, setTotalSearches] = useState(0)
  const [avgExecutionTime, setAvgExecutionTime] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)
  const [avgCTR, setAvgCTR] = useState(0)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const daysAgo = parseInt(timeRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Fetch search analytics
      const { data: searches, error } = await supabase
        .from('search_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!searches || searches.length === 0) {
        setIsLoading(false)
        return
      }

      // Calculate metrics
      setTotalSearches(searches.length)

      // Unique users
      const uniqueUserIds = new Set(searches.map(s => s.user_id).filter(Boolean))
      setUniqueUsers(uniqueUserIds.size)

      // Average execution time
      const executionTimes = searches
        .filter(s => s.execution_time_ms !== null)
        .map(s => s.execution_time_ms!)
      if (executionTimes.length > 0) {
        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        setAvgExecutionTime(Math.round(avgTime))
      }

      // Popular searches (group by query)
      const queryStats = new Map<string, {
        count: number
        resultCounts: number[]
        clicks: number
        lastSearched: string
      }>()

      searches.forEach(search => {
        const query = search.query_text.trim().toLowerCase()
        if (!queryStats.has(query)) {
          queryStats.set(query, {
            count: 0,
            resultCounts: [],
            clicks: 0,
            lastSearched: search.created_at || new Date().toISOString()
          })
        }

        const stats = queryStats.get(query)!
        stats.count++
        stats.resultCounts.push(search.result_count || 0)
        if (search.clicked_result_id) stats.clicks++
        const searchCreatedAt = search.created_at || new Date().toISOString()
        if (searchCreatedAt > stats.lastSearched) {
          stats.lastSearched = searchCreatedAt
        }
      })

      // Convert to array and calculate derived metrics
      const popularStats: SearchStat[] = Array.from(queryStats.entries())
        .map(([query, stats]) => {
          const avgResults = stats.resultCounts.length > 0
            ? stats.resultCounts.reduce((a, b) => a + b, 0) / stats.resultCounts.length
            : 0
          const ctr = stats.count > 0 ? (stats.clicks / stats.count) * 100 : 0

          return {
            query_text: query,
            search_count: stats.count,
            avg_result_count: Math.round(avgResults),
            click_through_rate: Math.round(ctr),
            last_searched: stats.lastSearched
          }
        })
        .sort((a, b) => b.search_count - a.search_count)
        .slice(0, 20)

      setPopularSearches(popularStats)

      // Calculate overall CTR
      const totalClicks = searches.filter(s => s.clicked_result_id).length
      setAvgCTR(searches.length > 0 ? Math.round((totalClicks / searches.length) * 100) : 0)

      // Zero result queries
      const zeroResults: ZeroResultQuery[] = Array.from(queryStats.entries())
        .map(([query, stats]) => {
          const avgResults = stats.resultCounts.length > 0
            ? stats.resultCounts.reduce((a, b) => a + b, 0) / stats.resultCounts.length
            : 0

          return {
            query_text: query,
            attempt_count: stats.count,
            last_attempted: stats.lastSearched,
            search_type: 'mixed', // Would need to aggregate from searches
            avg_results: avgResults
          }
        })
        .filter(q => q.avg_results === 0)
        .sort((a, b) => b.attempt_count - a.attempt_count)
        .slice(0, 15)

      setZeroResultQueries(zeroResults as any)

    } catch (error) {
      console.error('Error fetching search analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search className="w-8 h-8" />
            Search Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights into search behavior and performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Searches */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                  <p className="text-3xl font-bold mt-2">{totalSearches.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Search className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unique Users */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                  <p className="text-3xl font-bold mt-2">{uniqueUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Execution Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold mt-2">{avgExecutionTime}ms</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg CTR */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
                  <p className="text-3xl font-bold mt-2">{avgCTR}%</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <MousePointerClick className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Volume Trends Chart */}
      <SearchTrendsChart days={parseInt(timeRange)} />

      {/* Popular Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Popular Searches
          </CardTitle>
          <CardDescription>
            Most frequently searched queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : popularSearches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No search data available for this time range</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Searches</TableHead>
                  <TableHead className="text-right">Avg Results</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead>Last Searched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popularSearches.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {stat.query_text}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{stat.search_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={stat.avg_result_count === 0 ? 'destructive' : 'outline'}>
                        {stat.avg_result_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={stat.click_through_rate > 10 ? 'default' : 'secondary'}>
                        {stat.click_through_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(stat.last_searched)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Zero Result Queries */}
      {zeroResultQueries.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Zero Result Queries
            </CardTitle>
            <CardDescription>
              Searches that returned no results - opportunities for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Attempts</TableHead>
                  <TableHead>Last Attempted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zeroResultQueries.map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {query.query_text}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{query.attempt_count}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(query.last_attempted)}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
