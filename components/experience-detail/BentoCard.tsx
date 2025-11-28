'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface BentoCardProps {
  title: string
  subtitle?: string
  value?: string | number
  icon?: LucideIcon
  iconColor?: string
  gradient?: string
  children?: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  delay?: number
}

const sizeClasses = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-1 row-span-1 md:col-span-1',
  lg: 'col-span-1 row-span-1 md:col-span-2',
  xl: 'col-span-1 row-span-2 md:col-span-2 md:row-span-2',
}

export function BentoCard({
  title,
  subtitle,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  gradient,
  children,
  onClick,
  href,
  className,
  size = 'md',
  delay = 0,
}: BentoCardProps) {
  const Wrapper = onClick || href ? motion.button : motion.div

  const content = (
    <>
      {/* Background Gradient */}
      {gradient && (
        <div
          className={cn(
            'absolute inset-0 opacity-50 transition-opacity group-hover:opacity-70',
            gradient
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn('p-2 rounded-lg bg-white/10', iconColor)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground text-sm">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {value !== undefined && (
            <span className="text-2xl font-bold text-foreground">{value}</span>
          )}
        </div>

        {/* Children Content */}
        {children && <div className="flex-1">{children}</div>}
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
        initial={false}
      />
    </>
  )

  const baseClasses = cn(
    'group relative overflow-hidden rounded-2xl',
    'bg-card/50 backdrop-blur-xl border border-white/10',
    'p-4 md:p-5',
    'transition-all duration-300',
    onClick || href ? 'cursor-pointer hover:border-white/20 hover:shadow-lg' : '',
    sizeClasses[size],
    className
  )

  if (href) {
    return (
      <motion.a
        href={href}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={baseClasses}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <Wrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={baseClasses}
      onClick={onClick}
    >
      {content}
    </Wrapper>
  )
}

// Specialized stat card for quick metrics
interface StatBentoCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  onClick?: () => void
  delay?: number
}

export function StatBentoCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-400',
  trend,
  trendValue,
  onClick,
  delay = 0,
}: StatBentoCardProps) {
  return (
    <BentoCard
      title=""
      onClick={onClick}
      delay={delay}
      className="min-h-[100px]"
    >
      <div className="flex flex-col h-full justify-between">
        <div className={cn('p-2 rounded-lg bg-white/10 w-fit', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {trend && trendValue && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-green-400',
                  trend === 'down' && 'text-red-400',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
