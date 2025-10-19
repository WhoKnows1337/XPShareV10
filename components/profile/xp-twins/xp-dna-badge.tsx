'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Category color mapping (from profil.md)
const CATEGORY_COLORS: Record<string, string> = {
  'ufo-uap': '#7C3AED', // Purple
  'nde-obe': '#2563EB', // Blue
  'dreams': '#0891B2', // Cyan
  'psychedelics': '#DB2777', // Pink
  'paranormal-anomalies': '#DC2626', // Red
  'synchronicity': '#EA580C', // Orange
  'ghosts-spirits': '#6366F1', // Indigo
  'altered-states': '#8B5CF6', // Violet
  'glitch-matrix': '#10B981', // Green
  'prophecy-premonition': '#F59E0B', // Amber
}

interface XPDNABadgeProps {
  topCategories: string[] // Top 3 categories
  categoryDistribution?: Record<string, number> // Full distribution for tooltip
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * XP DNA Badge Component
 * Visual representation of a user's "XP DNA" based on their top categories
 *
 * Features:
 * - Gradient badge from top 3 categories
 * - Horizontal spectrum bar showing all categories
 * - Tooltip with category breakdown
 */
export function XPDNABadge({
  topCategories,
  categoryDistribution,
  size = 'md',
  showLabel = true,
  className = ''
}: XPDNABadgeProps) {
  // Get colors for top 3 categories
  const colors = useMemo(() => {
    return topCategories.slice(0, 3).map(cat =>
      CATEGORY_COLORS[cat] || '#6B7280' // Gray fallback
    )
  }, [topCategories])

  // Create gradient string
  const gradient = useMemo(() => {
    if (colors.length === 0) return 'bg-gray-500'
    if (colors.length === 1) return `bg-[${colors[0]}]`

    // Multi-color gradient
    const stops = colors.map((color, i) =>
      `${color} ${(i / (colors.length - 1)) * 100}%`
    ).join(', ')

    return `linear-gradient(135deg, ${stops})`
  }, [colors])

  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  // Format category name for display
  const formatCategory = (cat: string) => {
    return cat.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Calculate total experiences
  const totalExperiences = categoryDistribution
    ? Object.values(categoryDistribution).reduce((a, b) => a + b, 0)
    : 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-2 ${className}`}>
            {/* Gradient Badge */}
            <div
              className={`
                ${sizeClasses[size]}
                rounded-full
                flex items-center justify-center
                font-bold text-white
                shadow-md
                transition-transform hover:scale-110
                cursor-help
              `}
              style={{ background: gradient }}
              aria-label="XP DNA Badge"
            >
              <span className="drop-shadow-md">DNA</span>
            </div>

            {/* Label */}
            {showLabel && topCategories.length > 0 && (
              <Badge variant="secondary" className="font-normal">
                {formatCategory(topCategories[0])}
                {topCategories.length > 1 && (
                  <span className="ml-1 text-muted-foreground">
                    +{topCategories.length - 1}
                  </span>
                )}
              </Badge>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">XP DNA Profile</p>

            {/* Top Categories */}
            <div className="space-y-1">
              {topCategories.map((cat, i) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || '#6B7280' }}
                  />
                  <span className="font-medium">{formatCategory(cat)}</span>
                  {categoryDistribution && (
                    <span className="text-muted-foreground ml-auto">
                      {categoryDistribution[cat]}
                      {totalExperiences > 0 && (
                        <span className="ml-1">
                          ({Math.round((categoryDistribution[cat] / totalExperiences) * 100)}%)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Spectrum Bar */}
            {categoryDistribution && totalExperiences > 0 && (
              <div className="pt-2">
                <div className="h-2 w-full rounded-full overflow-hidden flex">
                  {Object.entries(categoryDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const percentage = (count / totalExperiences) * 100
                      return (
                        <div
                          key={cat}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: CATEGORY_COLORS[cat] || '#6B7280'
                          }}
                          title={`${formatCategory(cat)}: ${count} (${Math.round(percentage)}%)`}
                        />
                      )
                    })}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {totalExperiences} total experiences
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
