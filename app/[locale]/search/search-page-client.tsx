'use client'

import { useState } from 'react'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { AdvancedSearchBuilder } from '@/components/search/advanced-search-builder'
import { SearchResults } from '@/components/search/search-results'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'

interface SearchFilters {
  keywords: string
  categories: string[]
  location?: { lat: number; lng: number; name: string }
  radius: number
  dateFrom?: Date
  dateTo?: Date
  tags: string[]
  externalEvents: {
    solarStorms: boolean
    fullMoon: boolean
    earthquakes: boolean
  }
  verification: 'all' | 'verified' | 'unverified'
  minSimilar: number
}

interface SearchPageClientProps {
  initialQuery?: string
}

export function SearchPageClient({ initialQuery = '' }: SearchPageClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters | null>(null)
  const [sortBy, setSortBy] = useState('relevance')
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setSearchQuery(newFilters.keywords)
    setHasSearched(true)
  }

  return (
    <ThreeColumnLayout
      leftSidebar={
        <div className="sticky top-4">
          <AdvancedSearchBuilder onSearch={handleSearch} resultCount={0} />
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          {/* Quick Search Suggestions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'UFO Bodensee',
                  'Dream Lucid',
                  'Spiritual Awakening',
                  'Solar Storm',
                  'Paranormal',
                  'Meditation',
                ].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term)
                      handleSearch({
                        keywords: term,
                        categories: [],
                        radius: 50,
                        tags: [],
                        externalEvents: {
                          solarStorms: false,
                          fullMoon: false,
                          earthquakes: false,
                        },
                        verification: 'all',
                        minSimilar: 0,
                      })
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Search Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use AND, OR, NOT for boolean searches</li>
                <li>• Combine multiple filters for precise results</li>
                <li>• Save frequent searches for quick access</li>
                <li>• Try location + radius for nearby experiences</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      }
      mainContent={
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold">Advanced Search</h1>
            <p className="text-muted-foreground">
              Find extraordinary experiences with powerful filters
            </p>
          </div>

          {/* Search Results or Empty State */}
          {!hasSearched ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">Start Your Search</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Use the advanced search builder on the left to find experiences that match
                    your criteria. Combine categories, locations, tags, and more!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link href="/feed">
                      <Button variant="outline">Browse All Experiences</Button>
                    </Link>
                    <Link href="/categories">
                      <Button variant="outline">Explore Categories</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SearchResults
              query={searchQuery}
              filters={filters}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          )}
        </div>
      }
    />
  )
}
