'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { ExperienceListView } from '@/components/experience/experience-list-view'
import { SeasonalPattern } from '@/components/category/seasonal-pattern'
import { BentoGrid } from '@/components/ui/bento-grid'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Bell,
  BarChart3,
  TrendingUp,
  MapPin,
  Tag,
  Sparkles,
} from 'lucide-react'

interface CategoryViewClientProps {
  category: {
    slug: string
    name: string
    description: string
    icon: string
  }
  stats: {
    totalExperiences: number
    todayCount: number
    activeUsers: number
  }
  experiences: any[]
  topTags: { tag: string; count: number }[]
  hotspots: { location: string; count: number }[]
}

export function CategoryViewClient({
  category,
  stats,
  experiences,
  topTags,
  hotspots,
}: CategoryViewClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(
    (searchParams.get('view') as 'cards' | 'list') || 'cards'
  )
  const currentSort = searchParams.get('sort') || 'newest'

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`?${params.toString()}`)
  }

  const updateView = (view: 'cards' | 'list') => {
    setViewMode(view)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="text-6xl">{category.icon}</div>
        </div>
        <h1 className="mb-2 text-4xl font-bold">{category.name}</h1>
        <p className="text-lg text-muted-foreground mb-6">{category.description}</p>

        {/* KPI Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{stats.totalExperiences}</div>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{stats.todayCount}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="default">
            <Bell className="h-4 w-4 mr-2" />
            Follow Category
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Hotspots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotspots.map((hotspot, index) => (
                <Link
                  key={index}
                  href={`/feed?category=${category.slug}&location=${encodeURIComponent(hotspot.location)}`}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-sm flex items-center gap-2">
                    🔥 {hotspot.location}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {hotspot.count}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-500" />
                Top Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topTags.map((item) => (
                  <Link
                    key={item.tag}
                    href={`/feed?category=${category.slug}&tags=${encodeURIComponent(item.tag)}`}
                  >
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                      #{item.tag} ({item.count})
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Experiences</h2>
              <p className="text-sm text-muted-foreground">
                {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={currentSort === 'newest' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateSort('newest')}
                >
                  🆕 Newest
                </Button>
                <Button
                  variant={currentSort === 'hot' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateSort('hot')}
                >
                  🔥 Hot
                </Button>
                <Button
                  variant={currentSort === 'popular' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateSort('popular')}
                >
                  📊 Popular
                </Button>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateView('cards')}
                >
                  🎴 Cards
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateView('list')}
                >
                  📝 List
                </Button>
              </div>
            </div>
          </div>

          {/* Experiences */}
          {experiences.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share an experience in this category!
                </p>
                <Link href="/submit">
                  <Button>Share Experience</Button>
                </Link>
              </CardContent>
            </Card>
          ) : viewMode === 'list' ? (
            <ExperienceListView experiences={experiences} />
          ) : (
            <BentoGrid className="max-w-full">
              {experiences.map((experience: any, index: number) => (
                <EnhancedExperienceCard
                  key={experience.id}
                  experience={experience}
                  size={index === 0 ? 'large' : index % 7 === 0 ? 'large' : 'default'}
                  className={cn(
                    index === 0 && 'md:col-span-2',
                    index % 7 === 0 && 'md:col-span-2'
                  )}
                />
              ))}
            </BentoGrid>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Seasonal Pattern (Aha-Moment #8) */}
          <SeasonalPattern category={category.slug} />

          {/* AI Insight */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                65% of {category.name} experiences occur during solar activity peaks.
              </p>
            </CardContent>
          </Card>

          {/* Trending This Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>📈 +23% more reports than last week</p>
                <p>🔥 Peak activity: March 15</p>
                <p>🗺️ Most reports from Lake Constance region</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
