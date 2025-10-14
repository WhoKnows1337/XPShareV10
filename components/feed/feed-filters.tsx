'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Sparkles } from 'lucide-react'
import { AttributeFilter, type AttributeFilter as AttributeFilterType } from '@/components/search/attribute-filter'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'ufo', label: 'UFO Sighting' },
  { value: 'paranormal', label: 'Paranormal' },
  { value: 'dreams', label: 'Dream Experience' },
  { value: 'psychedelic', label: 'Psychedelic' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'synchronicity', label: 'Synchronicity' },
  { value: 'nde', label: 'Near-Death Experience' },
  { value: 'other', label: 'Other Experience' },
]

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' },
]

export function FeedFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilterType[]>([])
  const [matchMode, setMatchMode] = useState<'all' | 'any'>('all')
  const [showAttributeFilters, setShowAttributeFilters] = useState(false)

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'latest'

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/feed?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/feed?${params.toString()}`)
  }

  const handleAttributeFiltersApply = () => {
    // Encode attribute filters in URL
    const params = new URLSearchParams(searchParams.toString())
    if (attributeFilters.length > 0) {
      params.set('attributeFilters', JSON.stringify(attributeFilters))
      params.set('matchMode', matchMode)
    } else {
      params.delete('attributeFilters')
      params.delete('matchMode')
    }
    router.push(`/feed?${params.toString()}`)
  }

  const clearFilters = () => {
    setAttributeFilters([])
    router.push('/feed')
  }

  const hasFilters = currentCategory !== 'all' || currentSort !== 'latest' || attributeFilters.length > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter:</span>
        </div>

        <Select value={currentCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showAttributeFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAttributeFilters(!showAttributeFilters)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Attribute Filter
          {attributeFilters.length > 0 && ` (${attributeFilters.length})`}
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Attribute Filters Section */}
      {showAttributeFilters && (
        <div className="rounded-lg border bg-card p-4">
          <AttributeFilter
            filters={attributeFilters}
            onChange={setAttributeFilters}
            category={currentCategory !== 'all' ? currentCategory : undefined}
            matchMode={matchMode}
            onMatchModeChange={setMatchMode}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={handleAttributeFiltersApply} className="flex-1">
              Anwenden
            </Button>
            <Button variant="outline" onClick={() => setAttributeFilters([])}>
              Zurücksetzen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
