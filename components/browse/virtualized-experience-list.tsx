'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useIntersection } from '@/hooks/use-intersection'
import { ExperienceCard } from '@/components/experience/experience-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface Experience {
  id: string
  title: string
  story_text: string
  category: string
  hero_image_url?: string
  location_text?: string
  date_occurred: string
  upvote_count: number
  comment_count: number
  view_count: number
  user_profiles: {
    username: string
    display_name?: string
    avatar_url?: string
  }
  tags?: string[]
}

interface VirtualizedExperienceListProps {
  queryKey: string[]
  fetchFn: (pageParam: number) => Promise<{
    experiences: Experience[]
    nextCursor: number | null
    total: number
  }>
  viewMode?: 'cards' | 'list'
}

export function VirtualizedExperienceList({
  queryKey,
  fetchFn,
  viewMode = 'cards'
}: VirtualizedExperienceListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersection(loadMoreRef as any, {
    threshold: 0.1,
    rootMargin: '200px' // Load more when 200px from bottom
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetchFn(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialPageParam: 0
  })

  // Auto-fetch next page when intersection observer triggers
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const experiences = data?.pages.flatMap(page => page.experiences) ?? []
  const total = data?.pages[0]?.total ?? 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <ExperienceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-2">Error loading experiences</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (experiences.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No experiences found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {experiences.length} of {total} experiences
        </p>
      </div>

      {/* Experience Grid/List */}
      <div
        className={
          viewMode === 'cards'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience as any}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-8">
          {isFetchingNextPage ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <ExperienceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Scroll for more...</p>
            </div>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasNextPage && experiences.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <p>You've reached the end! 🎉</p>
          <p className="mt-1">Total: {total} experiences</p>
        </div>
      )}
    </div>
  )
}

function ExperienceCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-xl" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
