'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const PULL_THRESHOLD = 80
  const MAX_PULL = 120

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isRefreshing || window.scrollY > 0) return

    const touch = e.touches[0]
    const distance = touch.clientY - touchStart

    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.5, MAX_PULL))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStart, pullDistance, isRefreshing])

  const refreshProgress = Math.min((pullDistance / PULL_THRESHOLD) * 100, 100)
  const isReadyToRefresh = pullDistance >= PULL_THRESHOLD

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out',
          'pointer-events-none z-50'
        )}
        style={{
          top: pullDistance > 0 ? `${pullDistance - 40}px` : '-40px',
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="bg-background border rounded-full p-2 shadow-lg">
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <svg
              className={cn(
                'h-5 w-5 transition-all duration-200',
                isReadyToRefresh ? 'text-primary rotate-180' : 'text-muted-foreground'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn('transition-transform duration-200 ease-out')}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
