'use client'

import { motion } from 'framer-motion'
import { Users, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validationPillVariants, validationPulse } from '../shared/animations'

interface ValidationPillProps {
  similarCount: number
  /** Pass an element ID to scroll to on click (works from Server Components) */
  scrollToId?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'prominent'
}

export function ValidationPill({
  similarCount,
  scrollToId,
  onClick,
  className,
  variant = 'default',
}: ValidationPillProps) {
  if (similarCount === 0) return null

  const handleClick = () => {
    if (scrollToId) {
      document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth' })
    }
    onClick?.()
  }

  const isClickable = scrollToId || onClick

  const content = (
    <>
      <span className="text-lg">💫</span>
      <span className="font-medium">
        {similarCount} {similarCount === 1 ? 'Mensch teilt' : 'Menschen teilen'}{' '}
        Ähnliches
      </span>
      {isClickable && <span className="text-muted-foreground ml-1">→</span>}
    </>
  )

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleClick}
        variants={validationPillVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs',
          'rounded-full bg-primary/10 text-primary',
          'hover:bg-primary/20 transition-colors',
          className
        )}
      >
        <Users className="h-3 w-3" />
        <span>{similarCount}</span>
      </motion.button>
    )
  }

  if (variant === 'prominent') {
    return (
      <motion.div
        variants={validationPillVariants}
        initial="hidden"
        animate="visible"
        className={cn('relative', className)}
      >
        <motion.button
          onClick={handleClick}
          variants={validationPulse}
          animate="pulse"
          className={cn(
            'flex items-center gap-3 px-6 py-4 w-full',
            'rounded-2xl',
            'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20',
            'border border-primary/30',
            'hover:border-primary/50 transition-all',
            'group'
          )}
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-foreground">{similarCount}</p>
            <p className="text-sm text-muted-foreground">
              Menschen weltweit hatten ähnliche Erfahrungen
            </p>
          </div>
          {isClickable && (
            <span className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">
              Entdecken →
            </span>
          )}
        </motion.button>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 blur-xl opacity-50" />
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.button
      onClick={handleClick}
      variants={validationPillVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'rounded-full',
        'bg-primary/10 hover:bg-primary/20',
        'border border-primary/20 hover:border-primary/30',
        'transition-all duration-200',
        'text-sm',
        className
      )}
    >
      {content}
    </motion.button>
  )
}

/**
 * Inline validation text (no button)
 */
export function ValidationText({
  similarCount,
  className,
}: {
  similarCount: number
  className?: string
}) {
  if (similarCount === 0) return null

  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('text-sm text-muted-foreground', className)}
    >
      <span className="text-primary font-medium">{similarCount}</span>{' '}
      {similarCount === 1 ? 'Person hat' : 'Personen haben'} ähnliche
      Erfahrungen geteilt
    </motion.p>
  )
}

export default ValidationPill
