'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ConfidenceIndicatorProps {
  confidence: number // 0.0 - 1.0
  showPercentage?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'bar' | 'circle' | 'badge'
}

export function ConfidenceIndicator({
  confidence,
  showPercentage = true,
  showIcon = false,
  size = 'md',
  variant = 'bar',
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100)

  // Color based on confidence level
  const getColor = () => {
    if (confidence >= 0.8) return {
      bg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-500',
      gradient: 'from-green-500 to-emerald-500',
    }
    if (confidence >= 0.5) return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      border: 'border-yellow-500',
      gradient: 'from-yellow-500 to-orange-500',
    }
    return {
      bg: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-500',
      gradient: 'from-red-500 to-pink-500',
    }
  }

  const color = getColor()

  // Icon based on confidence
  const getIcon = () => {
    if (confidence >= 0.7) return <TrendingUp className="h-4 w-4" />
    if (confidence >= 0.4) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  // Size classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  // Bar Variant
  if (variant === 'bar') {
    return (
      <div className="w-full space-y-1">
        <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
          <motion.div
            className={`h-full bg-gradient-to-r ${color.gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {showPercentage && (
          <div className="flex items-center justify-between text-xs">
            <span className={color.text}>Confidence</span>
            <span className={`font-semibold ${color.text}`}>{percentage}%</span>
          </div>
        )}
      </div>
    )
  }

  // Circle Variant
  if (variant === 'circle') {
    const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 24
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (confidence * circumference)

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={radius * 2.5}
          height={radius * 2.5}
        >
          {/* Background circle */}
          <circle
            cx={radius * 1.25}
            cy={radius * 1.25}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius * 1.25}
            cy={radius * 1.25}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className={color.text}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {showPercentage && (
          <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color.text}`}>
            {percentage}%
          </div>
        )}
      </div>
    )
  }

  // Badge Variant
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 ${color.border} bg-white`}>
        {showIcon && <span className={color.text}>{getIcon()}</span>}
        <span className={`text-xs font-semibold ${color.text}`}>
          {percentage}%
        </span>
        {showPercentage && (
          <span className="text-xs text-gray-500">confident</span>
        )}
      </div>
    )
  }

  return null
}

// Multi-Confidence Comparison
interface ConfidenceComparisonProps {
  items: Array<{
    label: string
    confidence: number
  }>
}

export function ConfidenceComparison({ items }: ConfidenceComparisonProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground">
              {Math.round(item.confidence * 100)}%
            </span>
          </div>
          <ConfidenceIndicator
            confidence={item.confidence}
            showPercentage={false}
            size="sm"
            variant="bar"
          />
        </div>
      ))}
    </div>
  )
}
