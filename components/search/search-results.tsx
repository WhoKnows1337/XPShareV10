'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BentoGrid } from '@/components/ui/bento-grid'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { Target, Clock, TrendingUp, MapPin, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResultsProps {
  query: string
  filters: any
  sortBy: string
  onSortChange: (sort: string) => void
}

async function searchExperiences(query: string, filters: any, sortBy: string, pageParam = 0) {
  // This would be your actual API call
  const params = new URLSearchParams({
    q: query,
    sort: sortBy,
    offset: pageParam.toString(),
    limit: '12',
    ...filters,
  })

  const response = await fetch(`/api/search?${params}`)
  if (!response.ok) throw new Error('Search failed')

  const data = await response.json()
  return {
    results: data.experiences || [],
    nextCursor: data.hasMore ? pageParam + 12 : undefined,
    total: data.total || 0,
  }
}

export function SearchResults({ query, filters, sortBy, onSortChange }: SearchResultsProps) {
  const { ref: loadMoreRef, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['search', query, filters, sortBy],
    queryFn: ({ pageParam = 0 }) => searchExperiences(query, filters, sortBy, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })

  const experiences = data?.pages.flatMap((page) => page.results) ?? []
  const totalResults = data?.pages[0]?.total ?? 0

  // Auto-fetch next page when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-12 w-12 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Searching...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Screen Reader Announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {totalResults > 0
          ? `${totalResults} result${totalResults !== 1 ? 's' : ''} found for ${query}`
          : `No results found for ${query}`}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {totalResults > 0 ? (
              <>
                <span className="font-semibold text-foreground">{totalResults}</span> result
                {totalResults !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-foreground">"{query}"</span>
              </>
            ) : (
              `No results for "${query}"`
            )}
          </p>
        </div>

        {/* Sort Selector */}
        {totalResults > 0 && (
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Relevance</span>
                </div>
              </SelectItem>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Newest</span>
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </SelectItem>
              <SelectItem value="nearby">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Nearby</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results Grid */}
      {experiences.length > 0 ? (
        <>
          <BentoGrid className="max-w-full">
            {experiences.map((experience: any, index: number) => (
              <EnhancedExperienceCard
                key={experience.id}
                experience={experience}
                size={
                  index === 0
                    ? 'large'
                    : index === 2
                      ? 'wide'
                      : index % 7 === 0
                        ? 'large'
                        : 'default'
                }
                className={cn(
                  index === 0 && 'md:col-span-2',
                  index === 2 && 'md:row-span-2',
                  index % 7 === 0 && 'md:col-span-2'
                )}
              />
            ))}
          </BentoGrid>

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading more...</p>
                </div>
              ) : (
                <Button variant="outline" onClick={() => fetchNextPage()}>
                  Load More Results
                </Button>
              )}
            </div>
          )}

          {/* End Message */}
          {!hasNextPage && experiences.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                You've reached the end of the results
              </p>
            </div>
          )}
        </>
      ) : (
        <EmptySearchResults query={query} onClearFilters={() => {}} />
      )}
    </div>
  )
}

function EmptySearchResults({
  query,
  onClearFilters,
}: {
  query: string
  onClearFilters: () => void
}) {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold mb-2">No results found</h3>

          <p className="text-sm text-muted-foreground mb-6">
            We couldn't find any experiences matching{' '}
            <span className="font-semibold">"{query}"</span>
          </p>

          <div className="space-y-2 text-sm text-left w-full bg-muted/50 p-4 rounded-lg mb-6">
            <p className="font-semibold">Try:</p>
            <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Using more general search terms</li>
              <li>Removing some filters</li>
            </ul>
          </div>

          <Button onClick={onClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
