'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Home, TrendingUp, PlusCircle, FolderOpen, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/feed', icon: Home },
  { name: 'Trending', href: '/feed?sort=popular', icon: TrendingUp },
  { name: 'Submit', href: '/submit', icon: PlusCircle },
]

const categories = [
  { slug: 'ufo', name: 'UFO Sichtungen', count: 234 },
  { slug: 'paranormal', name: 'Paranormal', count: 189 },
  { slug: 'dreams', name: 'Träume', count: 156 },
  { slug: 'psychedelic', name: 'Psychedelic', count: 123 },
  { slug: 'spiritual', name: 'Spiritual', count: 98 },
  { slug: 'synchronicity', name: 'Synchronicity', count: 87 },
  { slug: 'nde', name: 'Near-Death', count: 45 },
  { slug: 'other', name: 'Other', count: 67 },
]

export function FeedLeftSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedCategory = searchParams.get('category') || 'all'
  const [radius, setRadius] = useState<number[]>([
    parseInt(searchParams.get('radius') || '50')
  ])

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Categories Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* All Categories */}
          <Link
            href="/feed"
            className={cn(
              'flex items-center justify-between px-2 py-1.5 rounded-md transition-colors',
              selectedCategory === 'all' && 'bg-accent'
            )}
          >
            <div className="flex items-center gap-2">
              <Checkbox checked={selectedCategory === 'all'} />
              <Label className="text-sm font-medium cursor-pointer">
                All Categories
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </span>
          </Link>

          {/* Individual Categories - Filter only */}
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/feed?category=${category.slug}`}
              className={cn(
                'flex items-center justify-between px-2 py-1.5 rounded-md transition-colors hover:bg-accent',
                selectedCategory === category.slug && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox checked={selectedCategory === category.slug} />
                <Label className="text-sm cursor-pointer">{category.name}</Label>
              </div>
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Radius: {radius[0]}km</Label>
            <Slider
              value={radius}
              onValueChange={setRadius}
              onValueCommit={(value) => updateSearchParam('radius', value[0].toString())}
              max={500}
              step={10}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Location filter uses your profile location
          </p>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={searchParams.get('dateRange') || 'all'}
            onValueChange={(value) => updateSearchParam('dateRange', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clear All */}
      <Button variant="ghost" className="w-full" asChild>
        <Link href="/feed">Clear All Filters</Link>
      </Button>
    </div>
  )
}
