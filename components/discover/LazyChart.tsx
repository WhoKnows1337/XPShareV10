'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

/**
 * Lazy Chart Wrapper
 * Uses Intersection Observer to only render charts when they're in viewport
 * Improves performance by avoiding rendering off-screen visualizations
 *
 * Usage:
 * <LazyChart fallback={<SkeletonLoader />}>
 *   <ExpensiveChartComponent />
 * </LazyChart>
 */

interface LazyChartProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
}

export function LazyChart({
  children,
  fallback = <div className="h-96 w-full bg-muted/20 animate-pulse rounded-lg" />,
  rootMargin = '100px',
  threshold = 0.1,
}: LazyChartProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)

        // Once rendered, keep it rendered (don't unmount)
        if (entry.isIntersecting && !hasBeenInView) {
          setHasBeenInView(true)
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    const currentContainer = containerRef.current
    if (currentContainer) {
      observer.observe(currentContainer)
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer)
      }
    }
  }, [rootMargin, threshold, hasBeenInView])

  return (
    <div ref={containerRef} className="min-h-[100px]">
      {hasBeenInView ? children : fallback}
    </div>
  )
}
