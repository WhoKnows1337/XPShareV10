'use client'

/**
 * Lazy-loaded Profile Components
 *
 * Performance-optimized wrapper for heavy profile components
 * Uses Next.js dynamic imports with loading states
 *
 * Features:
 * - Code splitting for large components
 * - Skeleton loaders
 * - Intersection Observer for progressive loading
 * - Error boundaries
 *
 * Usage:
 * Import from this file instead of direct component imports
 * for automatic lazy loading and performance optimization
 */

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// ============================================================================
// LOADING SKELETONS
// ============================================================================

function ActivityHeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function ExperienceMapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function PatternContributionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-3 rounded-lg border space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ConnectionsTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-2xl" />
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-lg border space-y-3">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function UserComparisonModalSkeleton() {
  return null // Modal doesn't show loading state
}

// ============================================================================
// LAZY-LOADED COMPONENTS
// ============================================================================

/**
 * ActivityHeatmap - GitHub-style contribution calendar
 * Heavy component due to Cal-Heatmap library
 */
export const LazyActivityHeatmap = dynamic(
  () => import('./activity-heatmap').then(mod => ({ default: mod.ActivityHeatmap })),
  {
    loading: () => <ActivityHeatmapSkeleton />,
    ssr: false, // Cal-Heatmap requires browser APIs
  }
)

/**
 * ExperienceMap - Interactive Leaflet map
 * Heavy component due to Leaflet + MarkerCluster
 */
export const LazyExperienceMap = dynamic(
  () => import('./experience-map').then(mod => ({ default: mod.ExperienceMap })),
  {
    loading: () => <ExperienceMapSkeleton />,
    ssr: false, // Leaflet requires browser APIs
  }
)

/**
 * PatternContributionsCard - Pattern discovery stats
 * Medium weight component
 */
export const LazyPatternContributionsCard = dynamic(
  () => import('./pattern-contributions-card').then(mod => ({ default: mod.PatternContributionsCard })),
  {
    loading: () => <PatternContributionsSkeleton />,
  }
)

/**
 * ConnectionsTab - 4 sub-tabs for connections
 * Heavy component due to multiple lists + animations
 */
export const LazyConnectionsTab = dynamic(
  () => import('./connections-tab').then(mod => ({ default: mod.ConnectionsTab })),
  {
    loading: () => <ConnectionsTabSkeleton />,
  }
)

/**
 * UserComparisonModal - Side-by-side XP Twin comparison
 * Medium weight component, loaded on demand
 */
export const LazyUserComparisonModal = dynamic(
  () => import('./user-comparison-modal').then(mod => ({ default: mod.UserComparisonModal })),
  {
    loading: () => <UserComparisonModalSkeleton />,
  }
)

/**
 * XPDNABadge - Conic gradient badge
 * Lightweight, but included for consistency
 */
export const LazyXPDNABadge = dynamic(
  () => import('./xp-dna-badge').then(mod => ({ default: mod.XPDNABadge })),
  {
    ssr: true, // Can be SSR'd
  }
)

/**
 * XPTwinsCard - Similarity card
 * Lightweight, but included for consistency
 */
export const LazyXPTwinsCard = dynamic(
  () => import('./xp-twins-card').then(mod => ({ default: mod.XPTwinsCard })),
  {
    ssr: true, // Can be SSR'd
  }
)

// ============================================================================
// PROGRESSIVE LOADING WRAPPER
// ============================================================================

/**
 * Progressive loading wrapper using Intersection Observer
 * Only loads component when it enters viewport
 *
 * Usage:
 * <ProgressiveLoader>
 *   <HeavyComponent />
 * </ProgressiveLoader>
 */

import { ReactNode, useEffect, useRef, useState } from 'react'

interface ProgressiveLoaderProps {
  children: ReactNode
  /**
   * Root margin for intersection observer
   * e.g., "200px" loads component 200px before viewport
   */
  rootMargin?: string
  /**
   * Skeleton to show while loading
   */
  skeleton?: ReactNode
}

export function ProgressiveLoader({
  children,
  rootMargin = '200px',
  skeleton
}: ProgressiveLoaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : skeleton || <div className="h-[400px]" />}
    </div>
  )
}
