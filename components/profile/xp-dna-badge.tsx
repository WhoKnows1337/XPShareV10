'use client'

/**
 * XP DNA Badge Component
 *
 * Circular badge showing user's dominant categories as a conic gradient
 * Visual identity based on top 3 categories
 *
 * Features:
 * - Conic gradient from category colors
 * - Hover animation (scale + glow)
 * - Responsive sizing
 * - Tooltip with category breakdown
 */

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { getCategoryColor, formatCategoryName } from '@/lib/constants/categories'

interface CategoryStat {
  category: string
  percentage: number
  count: number
}

interface XPDNABadgeProps {
  /**
   * Category distribution stats (new format)
   */
  categoryStats?: CategoryStat[]

  /**
   * Top categories (legacy format - alternative to categoryStats)
   */
  topCategories?: string[]

  /**
   * Full category distribution (legacy format - used with topCategories)
   */
  categoryDistribution?: Record<string, number>

  /**
   * Badge size in pixels (or sm/md/lg preset)
   */
  size?: number | 'sm' | 'md' | 'lg'

  /**
   * Show tooltip on hover
   */
  showTooltip?: boolean

  /**
   * Show label next to badge
   */
  showLabel?: boolean

  /**
   * Additional className
   */
  className?: string
}

export function XPDNABadge({
  categoryStats,
  topCategories: legacyTopCategories,
  categoryDistribution,
  size = 128,
  showTooltip = true,
  showLabel = false,
  className = ''
}: XPDNABadgeProps) {
  // Convert legacy format to new format if needed
  const normalizedStats: CategoryStat[] = React.useMemo(() => {
    if (categoryStats && categoryStats.length > 0) {
      return categoryStats
    }

    if (legacyTopCategories && categoryDistribution) {
      const total = Object.values(categoryDistribution).reduce((sum, count) => sum + count, 0)
      return Object.entries(categoryDistribution)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.percentage - a.percentage)
    }

    return []
  }, [categoryStats, legacyTopCategories, categoryDistribution])

  // Get top 3 categories for gradient
  const topCategories = normalizedStats.slice(0, 3)

  // Handle size presets
  const sizeInPx = typeof size === 'string'
    ? { sm: 48, md: 96, lg: 128 }[size]
    : size

  if (topCategories.length === 0) {
    return (
      <div
        className={`rounded-full bg-muted flex items-center justify-center ${className}`}
        style={{ width: sizeInPx, height: sizeInPx }}
      >
        <span className="text-xs text-muted-foreground">No XP</span>
      </div>
    )
  }

  // Build conic gradient
  let gradientStops: string[] = []
  let currentPercentage = 0

  topCategories.forEach((cat, index) => {
    const color = getCategoryColor(cat.category)
    const nextPercentage = currentPercentage + cat.percentage

    gradientStops.push(`${color} ${currentPercentage}% ${nextPercentage}%`)
    currentPercentage = nextPercentage
  })

  // Fill remaining with first color
  if (currentPercentage < 100) {
    const firstColor = getCategoryColor(topCategories[0].category)
    gradientStops.push(`${firstColor} ${currentPercentage}% 100%`)
  }

  const conicGradient = `conic-gradient(${gradientStops.join(', ')})`

  const badgeElement = (
    <motion.div
      className={`rounded-full relative overflow-hidden ${showLabel ? '' : className}`}
      style={{ width: sizeInPx, height: sizeInPx }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: conicGradient,
        }}
      />

      {/* Inner Circle (creates ring effect) */}
      <div
        className="absolute inset-[20%] rounded-full bg-background flex items-center justify-center shadow-lg"
      >
        <div className="text-center">
          <div className="text-lg font-bold">XP</div>
          <div className="text-xs text-muted-foreground">DNA</div>
        </div>
      </div>

      {/* Hover Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: conicGradient,
          opacity: 0,
        }}
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )

  // Wrap with label if needed
  const badge = showLabel ? (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {badgeElement}
      {topCategories.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            {formatCategoryName(topCategories[0].category)}
          </span>
          {topCategories.length > 1 && (
            <span className="text-xs text-muted-foreground">
              +{topCategories.length - 1} more {topCategories.length === 2 ? 'category' : 'categories'}
            </span>
          )}
        </div>
      )}
    </div>
  ) : badgeElement

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="right" className="p-4 max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">XP DNA Breakdown</p>
            {topCategories.map((cat, index) => (
              <div key={cat.category} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat.category) }}
                  />
                  <span className="capitalize">
                    {formatCategoryName(cat.category)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{cat.count}</span>
                  <span className="font-medium">{cat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            {normalizedStats.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{normalizedStats.length - 3} more {normalizedStats.length - 3 === 1 ? 'category' : 'categories'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
