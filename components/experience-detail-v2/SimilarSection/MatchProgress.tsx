'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MatchProgressProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function MatchProgress({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className,
}: MatchProgressProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-400'
    if (score >= 60) return 'from-primary to-blue-400'
    if (score >= 40) return 'from-yellow-500 to-amber-400'
    return 'from-orange-500 to-red-400'
  }

  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Match</span>
          <span className="font-medium text-primary">{score}%</span>
        </div>
      )}
      <div className={cn('bg-space-light rounded-full overflow-hidden', heightClasses[size])}>
        <motion.div
          className={cn('h-full bg-gradient-to-r rounded-full', getColor(score))}
          initial={animated ? { width: 0 } : { width: `${score}%` }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/**
 * Circular progress indicator
 */
export function MatchProgressCircle({
  score,
  size = 48,
  strokeWidth = 4,
  className,
}: {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500'
    if (score >= 60) return 'stroke-primary'
    if (score >= 40) return 'stroke-yellow-500'
    return 'stroke-orange-500'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-space-light"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getColor(score)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Score Text */}
      <span className="absolute text-xs font-bold">{score}%</span>
    </div>
  )
}

export default MatchProgress
