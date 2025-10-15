'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryFacetsProps {
  query?: string
  selectedCategory?: string
  onCategorySelect: (category: string | null) => void
  currentFilters?: any
}

const CATEGORY_ICONS: Record<string, string> = {
  'ufo': '🛸',
  'paranormal': '👻',
  'dreams': '💭',
  'synchronicity': '✨',
  'psychedelic': '🍄',
  'nde': '🌟',
  'meditation': '🧘',
  'astral-projection': '🌌',
  'time-anomaly': '⏰',
  'entity': '👽',
  'energy': '⚡',
  'other': '❓'
}

const CATEGORY_NAMES: Record<string, string> = {
  'ufo': 'UFO',
  'paranormal': 'Paranormal',
  'dreams': 'Dreams',
  'synchronicity': 'Synchronicity',
  'psychedelic': 'Psychedelic',
  'nde': 'Near-Death',
  'meditation': 'Meditation',
  'astral-projection': 'Astral Projection',
  'time-anomaly': 'Time Anomaly',
  'entity': 'Entity',
  'energy': 'Energy',
  'other': 'Other'
}

export function CategoryFacets({
  query,
  selectedCategory,
  onCategorySelect,
  currentFilters = {}
}: CategoryFacetsProps) {
  const [facets, setFacets] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchFacets()
  }, [query, currentFilters])

  const fetchFacets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/search/facets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          currentFilters: {
            ...currentFilters,
            // Exclude category from filters to get all category counts
            category: undefined
          }
        })
      })

      if (!response.ok) throw new Error('Failed to fetch facets')

      const data = await response.json()
      setFacets(data)
    } catch (error) {
      console.error('Error fetching facets:', error)
      setFacets(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !facets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!facets || !facets.categories || Object.keys(facets.categories).length === 0) {
    return null
  }

  const sortedCategories = Object.entries(facets.categories)
    .sort((a, b) => (b[1] as number) - (a[1] as number))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Categories
          {facets.total && (
            <Badge variant="secondary" className="ml-auto">
              {facets.total} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {/* All Categories */}
          <Button
            variant={!selectedCategory ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategorySelect(null)}
            className="w-full justify-between h-auto py-2"
          >
            <span className="flex items-center gap-2">
              🌍 <span>All Categories</span>
            </span>
            <Badge variant="outline" className="ml-auto">
              {facets.total}
            </Badge>
          </Button>

          {/* Individual Categories */}
          {sortedCategories.map(([category, count]) => {
            const isSelected = selectedCategory === category
            const icon = CATEGORY_ICONS[category] || '📌'
            const name = CATEGORY_NAMES[category] || category

            return (
              <Button
                key={category}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategorySelect(category)}
                className={cn(
                  'w-full justify-between h-auto py-2',
                  isSelected && 'bg-primary text-primary-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{name}</span>
                </span>
                <Badge
                  variant={isSelected ? 'secondary' : 'outline'}
                  className="ml-auto"
                >
                  {count as number}
                </Badge>
              </Button>
            )
          })}
        </div>

        {isLoading && (
          <div className="mt-3 text-xs text-center text-muted-foreground">
            Updating counts...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
