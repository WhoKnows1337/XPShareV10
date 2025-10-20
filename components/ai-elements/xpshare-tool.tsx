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
    <div className={cn(category && showGradient && 'relative overflow-hidden')}>
      {category && showGradient && gradient && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: gradient }}
          aria-hidden="true"
        />
      )}
      <ToolHeader
        className={cn(
          'transition-all duration-300 relative z-10',
          // Ensure text remains readable with strong contrast
          category && showGradient && 'text-foreground font-medium',
          className
        )}
        {...props}
      />
    </div>
  )
}

// Re-export other Tool components for convenience
export { ToolContent, ToolInput, ToolOutput } from './tool'
