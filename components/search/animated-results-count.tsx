'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedResultsCountProps {
  count: number
  queryTime?: number // in milliseconds
  query?: string
  className?: string
}

/**
 * AnimatedResultsCount - Animated counter like Google search
 *
 * Features:
 * - CountUp animation from 0 to count
 * - Spring-based easing for smooth motion
 * - Color transition (gray → blue)
 * - Shows query execution time
 * - Only animates on count change
 */
export function AnimatedResultsCount({
  count,
  queryTime,
  query,
  className,
}: AnimatedResultsCountProps) {
  const [displayCount, setDisplayCount] = useState(0)

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  })

  // Transform spring value to rounded integer
  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayCount(Math.round(latest))
    })
    return () => unsubscribe()
  }, [spring])

  // Trigger animation when count changes
  useEffect(() => {
    spring.set(count)
  }, [count, spring])

  // Color transition based on progress
  const progress = displayCount / Math.max(count, 1)
  const colorClass =
    progress < 0.3
      ? 'text-muted-foreground'
      : progress < 0.7
      ? 'text-blue-600'
      : 'text-green-600'

  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className={cn('font-medium transition-colors duration-300', colorClass)}>
        {displayCount.toLocaleString('de-DE')}
      </span>
      <span className="text-muted-foreground">
        {count === 1 ? 'Erfahrung' : 'Erfahrungen'} gefunden
      </span>

      {queryTime !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({(queryTime / 1000).toFixed(2)}s)
        </span>
      )}

      {query && (
        <span className="text-xs text-muted-foreground">
          für &quot;{query}&quot;
        </span>
      )}
    </motion.div>
  )
}

/**
 * Minimal version without query time/text
 */
export function SimpleResultsCount({ count, className }: { count: number; className?: string }) {
  return (
    <AnimatedResultsCount
      count={count}
      className={className}
    />
  )
}
