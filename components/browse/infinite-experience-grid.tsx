'use client'

import { useEffect, useRef } from 'react'
import { BentoGrid } from '@/components/ui/bento-grid'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useInfiniteExperiences } from '@/hooks/use-infinite-experiences'
import { Button } from '@/components/ui/button'

interface InfiniteExperienceGridProps {
  filters: {
    category?: string
    tab?: string
    sort?: string
    radius?: string
    dateRange?: string
  }
  userId?: string
  className?: string
}

export function InfiniteExperienceGrid({
  filters,
  userId,
  className,
}: InfiniteExperienceGridProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteExperiences(filters, userId)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for auto-load
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before reaching the bottom
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const experiences = data?.pages.flatMap((page) => page.experiences) ?? []

  if (isFetching && experiences.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <BentoGrid className={cn('max-w-full', className)}>
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
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading more experiences...</p>
            </div>
          ) : (
            <Button variant="outline" onClick={() => fetchNextPage()}>
              Load More
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && experiences.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          You've reached the end! 🎉
        </p>
      )}
    </>
  )
}
