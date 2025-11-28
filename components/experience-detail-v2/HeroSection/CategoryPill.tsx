'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { categoryPillVariants } from '../shared/animations'

interface CategoryPillProps {
  category: string
  location?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const categoryConfig: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  ufo: { icon: '🛸', label: 'UFO Sighting', color: 'from-blue-500/20 to-indigo-500/20' },
  paranormal: { icon: '👻', label: 'Paranormal', color: 'from-purple-500/20 to-violet-500/20' },
  dreams: { icon: '💭', label: 'Dream', color: 'from-indigo-500/20 to-blue-500/20' },
  psychedelic: { icon: '🌈', label: 'Psychedelic', color: 'from-pink-500/20 to-purple-500/20' },
  spiritual: { icon: '✨', label: 'Spiritual', color: 'from-amber-500/20 to-orange-500/20' },
  synchronicity: { icon: '🔄', label: 'Synchronicity', color: 'from-teal-500/20 to-cyan-500/20' },
  nde: { icon: '💫', label: 'Near-Death', color: 'from-slate-500/20 to-gray-500/20' },
  other: { icon: '❓', label: 'Experience', color: 'from-gray-500/20 to-slate-500/20' },
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
}

export function CategoryPill({
  category,
  location,
  className,
  size = 'md',
  animate = true,
}: CategoryPillProps) {
  const config = categoryConfig[category] || categoryConfig.other

  const content = (
    <>
      {/* Icon */}
      <span className="text-lg">{config.icon}</span>

      {/* Label */}
      <span className="font-medium text-foreground">{config.label}</span>

      {/* Location (if provided) */}
      {location && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground truncate max-w-[150px]">
            {location}
          </span>
        </>
      )}
    </>
  )

  const baseClasses = cn(
    'inline-flex items-center',
    'rounded-full',
    'bg-gradient-to-r',
    config.color,
    'backdrop-blur-xl',
    'border border-white/10',
    'shadow-lg shadow-black/20',
    sizeClasses[size],
    className
  )

  if (!animate) {
    return <div className={baseClasses}>{content}</div>
  }

  return (
    <motion.div
      variants={categoryPillVariants}
      initial="hidden"
      animate="visible"
      className={baseClasses}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.div>
  )
}

/**
 * Compact version for use in cards
 */
export function CategoryBadge({
  category,
  className,
}: {
  category: string
  className?: string
}) {
  const config = categoryConfig[category] || categoryConfig.other

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
        'bg-white/5 border border-white/10',
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export default CategoryPill
