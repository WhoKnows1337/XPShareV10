'use client'

import { cn } from '@/lib/utils'

interface ConfidenceCircleProps {
  /**
   * Confidence score (0-100)
   */
  score: number
  /**
   * Size of the circle in pixels
   * @default 48
   */
  size?: number
  /**
   * Stroke width
   * @default 4
   */
  strokeWidth?: number
  /**
   * Custom className
   */
  className?: string
  /**
   * Show percentage text in center
   * @default true
   */
  showLabel?: boolean
}

/**
 * SVG-based Confidence Circle Component
 *
 * Features:
 * - Pure SVG (no library dependencies)
 * - Color-coded by confidence level
 * - Smooth animations via CSS
 * - Customizable size & stroke width
 *
 * Usage:
 * ```tsx
 * <ConfidenceCircle score={85} size={64} />
 * ```
 */
export function ConfidenceCircle({
  score,
  size = 48,
  strokeWidth = 4,
  className,
  showLabel = true,
}: ConfidenceCircleProps) {
  const normalizedScore = Math.min(100, Math.max(0, score))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalizedScore / 100) * circumference

  // Color based on confidence level
  const getColor = () => {
    if (normalizedScore >= 80) return 'text-green-500'
    if (normalizedScore >= 60) return 'text-yellow-500'
    if (normalizedScore >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getStrokeColor = () => {
    if (normalizedScore >= 80) return '#22c55e' // green-500
    if (normalizedScore >= 60) return '#eab308' // yellow-500
    if (normalizedScore >= 40) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="img"
      aria-label={`Confidence score: ${Math.round(normalizedScore)} percent`}
    >
      <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-xs font-bold',
            getColor()
          )}
          aria-hidden="true"
        >
          {Math.round(normalizedScore)}%
        </div>
      )}
    </div>
  )
}
