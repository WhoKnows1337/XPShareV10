'use client'

/**
 * Search 5.0 - Loading Skeletons
 *
 * Skeleton loading states for all Search 5.0 components to
 * provide visual feedback during API calls and improve perceived performance.
 *
 * @see docs/masterdocs/search5.md (Part 3.4 - Loading States)
 */

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ============================================================================
// PATTERN CARD SKELETON
// ============================================================================

export function PatternCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 space-y-3">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Finding */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Progress */}
        <Skeleton className="h-1.5 w-full" />
      </CardHeader>
    </Card>
  )
}

// ============================================================================
// PATTERN GRID SKELETON
// ============================================================================

export function PatternGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[180px]" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <PatternCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// QUALITY CARD SKELETON
// ============================================================================

export function QualityCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-muted">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-2 w-full mt-3" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-px bg-muted/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-background p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================================
// SOURCE CARD SKELETON
// ============================================================================

export function SourceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg p-4', className)}>
      <div className="flex items-start gap-4">
        {/* Badges */}
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-12" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Metadata */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Icon */}
        <Skeleton className="h-4 w-4 flex-shrink-0" />
      </div>
    </div>
  )
}

// ============================================================================
// SOURCES SECTION SKELETON
// ============================================================================

export function SourcesSectionSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[160px]" />
          <Skeleton className="h-9 w-[160px]" />
        </div>
      </div>

      {/* Sources */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <SourceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// SERENDIPITY CARD SKELETON
// ============================================================================

export function SerendipityCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-32 bg-white/20" />
            <Skeleton className="h-6 w-48 bg-white/20" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 bg-white/20" />
              <Skeleton className="h-5 w-16 bg-white/20" />
            </div>
          </div>
          <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Content */}
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

// ============================================================================
// FOLLOW-UP QUESTIONS SKELETON
// ============================================================================

export function FollowUpQuestionsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SEARCH INPUT SKELETON
// ============================================================================

export function SearchInputSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-64" />
      </div>
    </div>
  )
}

// ============================================================================
// COMPLETE PAGE SKELETON
// ============================================================================

export function Search5LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8 animate-in fade-in duration-500', className)}>
      {/* Search Input */}
      <SearchInputSkeleton />

      {/* Quality Card */}
      <QualityCardSkeleton />

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Serendipity Banner */}
      <Skeleton className="h-24 w-full rounded-lg" />

      {/* Pattern Grid */}
      <PatternGridSkeleton count={4} />

      {/* Sources */}
      <SourcesSectionSkeleton count={3} />

      {/* Follow-up */}
      <FollowUpQuestionsSkeleton count={3} />
    </div>
  )
}

// ============================================================================
// INLINE LOADING INDICATOR
// ============================================================================

export function InlineLoadingIndicator({ message = 'Analysiere...', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-8', className)}>
      <div className="flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 bg-primary rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground animate-pulse">
        {message}
      </span>
    </div>
  )
}

// ============================================================================
// SHIMMER ANIMATION
// ============================================================================

/**
 * Wrapper to add shimmer effect to any content
 */
export function ShimmerWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
