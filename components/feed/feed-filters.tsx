'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

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

  const clearFilters = () => {
    router.push('/feed')
  }

  const hasFilters = currentCategory !== 'all' || currentSort !== 'latest'

  return (
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

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
