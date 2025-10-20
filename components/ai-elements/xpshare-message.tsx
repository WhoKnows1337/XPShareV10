'use client'

/**
 * XPShare-styled Message Component
 * Extends AI Elements Message with category-based gradients and XPShare theming
 */

import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'
import { ComponentProps } from 'react'
import { MessageContent } from './message'
import { getMessageGradient, getCategoryBorderColor } from '@/lib/utils/category-gradients'
import { useTheme } from 'next-themes'

export type XPShareMessageProps = ComponentProps<'div'> & {
  from: UIMessage['role']
  category?: string
  showGradient?: boolean
}

export const XPShareMessage = ({
  className,
  from,
  category,
  showGradient = true,
  ...props
}: XPShareMessageProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Get gradient styling for messages
  const gradient = showGradient && from === 'user'
    ? getMessageGradient('user', category, isDark)
    : undefined

  const borderColor = category && from === 'user'
    ? getCategoryBorderColor(category, isDark)
    : undefined

  return (
    <div
      className={cn(
        'group flex w-full items-end justify-end gap-2 py-4',
        from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
        className
      )}
      {...props}
    />
  )
}

export type XPShareMessageContentProps = ComponentProps<'div'> & {
  variant?: 'default' | 'user' | 'assistant'
  category?: string
  showGradient?: boolean
}

export const XPShareMessageContent = ({
  children,
  className,
  variant = 'default',
  category,
  showGradient = true,
  ...props
}: XPShareMessageContentProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Get gradient for user messages with category
  const gradient = showGradient && variant === 'user' && category
    ? getMessageGradient('user', category, isDark)
    : undefined

  const borderColor = category && variant === 'user'
    ? getCategoryBorderColor(category, isDark)
    : undefined

  // Styles
  const gradientStyle = gradient ? { backgroundImage: gradient } : undefined
  const borderStyle = borderColor ? { borderLeftColor: borderColor } : undefined

  return (
    <MessageContent
      variant={variant}
      className={cn(
        // Add gradient styling for user messages
        variant === 'user' && gradient && 'bg-gradient-to-br',
        // Add category border accent
        category && variant === 'user' && 'border-l-4',
        className
      )}
      style={{
        ...gradientStyle,
        ...borderStyle,
      }}
      {...props}
    >
      {children}
    </MessageContent>
  )
}
