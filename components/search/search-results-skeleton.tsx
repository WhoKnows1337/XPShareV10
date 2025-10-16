'use client'

import { cn } from '@/lib/utils'

interface SearchResultsSkeletonProps {
  count?: number
  viewMode?: 'grid' | 'table' | 'list'
  className?: string
}

/**
 * Skeleton loading screen for search results
 *
 * Features:
 * - Layout-matching skeletons for different view modes
 * - CSS shimmer animation (no library overhead)
 * - Progressive loading simulation
 * - Accessibility: aria-live for screen readers
 *
 * @param count - Number of skeleton items (default: 5)
 * @param viewMode - Layout mode: 'grid', 'table', or 'list' (default: 'grid')
 */
export function SearchResultsSkeleton({
  count = 5,
  viewMode = 'grid',
  className,
}: SearchResultsSkeletonProps) {
  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-live="polite"
      aria-label="Loading search results"
    >
      {/* Grid View Skeleton */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer rounded-lg p-4 space-y-3"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Category Badge */}
              <div className="skeleton-base h-5 w-24 rounded-full" />

              {/* Title */}
              <div className="skeleton-base h-6 w-full rounded" />
              <div className="skeleton-base h-6 w-3/4 rounded" />

              {/* Metadata */}
              <div className="flex gap-2 mt-3">
                <div className="skeleton-base h-4 w-16 rounded-full" />
                <div className="skeleton-base h-4 w-20 rounded-full" />
                <div className="skeleton-base h-4 w-24 rounded-full" />
              </div>

              {/* Text preview */}
              <div className="space-y-2 pt-2">
                <div className="skeleton-base h-3 w-full rounded" />
                <div className="skeleton-base h-3 w-full rounded" />
                <div className="skeleton-base h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View Skeleton */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer rounded-lg p-4 flex gap-4"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Left: Category Icon */}
              <div className="skeleton-base h-12 w-12 rounded-lg flex-shrink-0" />

              {/* Middle: Content */}
              <div className="flex-1 space-y-2">
                <div className="skeleton-base h-5 w-3/4 rounded" />
                <div className="skeleton-base h-4 w-full rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="skeleton-base h-3 w-16 rounded-full" />
                  <div className="skeleton-base h-3 w-20 rounded-full" />
                </div>
              </div>

              {/* Right: Score */}
              <div className="skeleton-base h-10 w-10 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Table View Skeleton */}
      {viewMode === 'table' && (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border/50">
            <div className="skeleton-base h-4 w-20 rounded col-span-3" />
            <div className="skeleton-base h-4 w-16 rounded col-span-2" />
            <div className="skeleton-base h-4 w-24 rounded col-span-3" />
            <div className="skeleton-base h-4 w-20 rounded col-span-2" />
            <div className="skeleton-base h-4 w-16 rounded col-span-2" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer grid grid-cols-12 gap-4 px-4 py-3 rounded-lg"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="skeleton-base h-5 w-full rounded col-span-3" />
              <div className="skeleton-base h-5 w-full rounded col-span-2" />
              <div className="skeleton-base h-5 w-full rounded col-span-3" />
              <div className="skeleton-base h-5 w-full rounded col-span-2" />
              <div className="skeleton-base h-5 w-12 rounded col-span-2" />
            </div>
          ))}
        </div>
      )}

      {/* Screen Reader Announcement */}
      <span className="sr-only">Loading search results, please wait...</span>
    </div>
  )
}

/**
 * Mini Skeleton for predictive search suggestions dropdown
 */
export function SearchSuggestionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2" role="status" aria-label="Loading suggestions">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer rounded-md p-2 flex items-center gap-2"
          style={{
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <div className="skeleton-base h-4 w-4 rounded-full flex-shrink-0" />
          <div className="skeleton-base h-4 flex-1 rounded" />
        </div>
      ))}
    </div>
  )
}
