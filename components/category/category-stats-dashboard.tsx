'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface CategoryStatsProps {
  categorySlug: string
}

interface Stats {
  totalExperiences: number
  todayCount: number
  trend: number
  activeUsers: number
  timeline: Array<{ date: string; count: number }>
  hotspots: Array<{ name: string; count: number; lat: number; lng: number }>
  topLocations: Array<{ name: string; count: number }>
  topTags: Array<{ name: string; count: number }>
  aiInsights?: string
}

export function CategoryStatsDashboard({ categorySlug }: CategoryStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['category-stats', categorySlug],
    queryFn: async () => {
      const supabase = createClient()

      // Get total experiences
      const { count: totalCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('category', categorySlug)
        .eq('visibility', 'public')

      // Get today's count
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('category', categorySlug)
        .eq('visibility', 'public')
        .gte('created_at', today.toISOString())

      // Get yesterday's count for trend
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const { count: yesterdayCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('category', categorySlug)
        .eq('visibility', 'public')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())

      const trend = yesterdayCount ? ((todayCount! - yesterdayCount) / yesterdayCount) * 100 : 0

      // Get active users (users who posted in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { data: activeUsersData } = await supabase
        .from('experiences')
        .select('user_id')
        .eq('category', categorySlug)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const activeUsers = new Set(activeUsersData?.map((e) => e.user_id)).size

      // Get timeline data (last 30 days)
      const { data: timelineData } = await supabase
        .from('experiences')
        .select('created_at')
        .eq('category', categorySlug)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      const timeline = generateTimeline(timelineData || [])

      // Get top locations
      const { data: locationData } = await supabase
        .from('experiences')
        .select('location_text')
        .eq('category', categorySlug)
        .not('location_text', 'is', null)

      const locationCounts = locationData?.reduce(
        (acc, exp) => {
          const loc = exp.location_text || 'Unknown'
          acc[loc] = (acc[loc] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const topLocations = Object.entries(locationCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      // Get top tags
      const { data: tagsData } = await supabase
        .from('experiences')
        .select('tags')
        .eq('category', categorySlug)

      const tagCounts = tagsData?.reduce(
        (acc, exp) => {
          exp.tags?.forEach((tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1
          })
          return acc
        },
        {} as Record<string, number>
      )

      const topTags = Object.entries(tagCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([name, count]) => ({ name, count }))

      // Generate AI insights
      let aiInsights: string | undefined
      if (trend > 50) {
        aiInsights = `🔥 ${categorySlug.toUpperCase()}-Erlebnisse sind um ${Math.round(trend)}% gestiegen! Besonders aktiv in ${topLocations[0]?.name}.`
      } else if (topTags.length > 0) {
        aiInsights = `Häufigste Tags: #${topTags.slice(0, 3).map((t) => t.name).join(', #')}. ${topLocations[0]?.name} ist der Hotspot mit ${topLocations[0]?.count} Berichten.`
      }

      const statsResult: Stats = {
        totalExperiences: totalCount || 0,
        todayCount: todayCount || 0,
        trend: Math.round(trend),
        activeUsers,
        timeline,
        hotspots: topLocations.slice(0, 5).map((loc, i) => ({
          ...loc,
          lat: 47 + i * 0.5,
          lng: 9 + i * 0.3,
        })),
        topLocations,
        topTags,
        aiInsights,
      }

      return statsResult
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalExperiences}</div>
            <p className="text-xs text-muted-foreground">Total Experiences</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground mb-2">Today</p>
            <Badge variant={stats.trend > 0 ? 'default' : 'secondary'} className="gap-1">
              {stats.trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(stats.trend)}%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="url(#gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topLocations.map((loc, i) => (
              <div key={loc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 justify-center">
                    {i + 1}
                  </Badge>
                  <span className="text-sm">{loc.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{loc.count} XP</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/search?category=${categorySlug}&tag=${tag.name}`}
              >
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                  #{tag.name}
                  <span className="ml-1 text-xs text-muted-foreground">({tag.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {stats.aiInsights && (
        <Alert>
          <Sparkles className="w-4 h-4" />
          <AlertTitle>AI-Insights</AlertTitle>
          <AlertDescription>{stats.aiInsights}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function generateTimeline(data: any[]) {
  const counts: Record<string, number> = {}

  data.forEach((exp) => {
    const date = new Date(exp.created_at).toISOString().split('T')[0]
    counts[date] = (counts[date] || 0) + 1
  })

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
      count,
    }))
}
