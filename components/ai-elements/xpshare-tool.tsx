'use client'

/**
 * XPShare-styled Tool Component
 * Extends AI Elements Tool with category-based gradients and XPShare theming
 */

import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { Tool, ToolHeader, ToolProps, ToolHeaderProps } from './tool'
import { getCategoryGradient, getCategoryBorderColor, getCategoryGlow } from '@/lib/utils/category-gradients'
import { useTheme } from 'next-themes'

export type XPShareToolProps = ToolProps & {
  category?: string
  showGradient?: boolean
}

export const XPShareTool = ({
  className,
  category,
  showGradient = true,
  ...props
}: XPShareToolProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const borderColor = category && showGradient
    ? getCategoryBorderColor(category, isDark)
    : undefined

  return (
    <Tool
      className={cn(
        'transition-all duration-300',
        // Add category border accent
        category && showGradient && 'border-l-4',
        // Add hover glow effect
        category && showGradient && 'hover:shadow-lg',
        className
      )}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
      {...props}
    />
  )
}

export type XPShareToolHeaderProps = ToolHeaderProps & {
  category?: string
  showGradient?: boolean
}

export const XPShareToolHeader = ({
  className,
  category,
  showGradient = true,
  ...props
}: XPShareToolHeaderProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gradient = category && showGradient
    ? getCategoryGradient(category, isDark)
    : undefined

  return (
    <ToolHeader
      className={cn(
        'transition-all duration-300',
        // Add gradient background for category
        category && showGradient && 'bg-gradient-to-r',
        className
      )}
      style={gradient ? { backgroundImage: gradient } : undefined}
      {...props}
    />
  )
}

// Re-export other Tool components for convenience
export { ToolContent, ToolInput, ToolOutput } from './tool'
