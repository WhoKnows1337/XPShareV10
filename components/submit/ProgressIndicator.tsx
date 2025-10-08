'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps?: number
  labels?: string[]
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps = 7,
  labels,
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="absolute -top-1 left-0 right-0 flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <motion.div
                key={index}
                className={cn(
                  'h-4 w-4 rounded-full border-2 transition-colors flex items-center justify-center',
                  {
                    'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500':
                      isCompleted,
                    'bg-primary border-primary scale-125': isCurrent,
                    'bg-background border-muted': isUpcoming,
                  }
                )}
                initial={{ scale: 0 }}
                animate={{ scale: isCurrent ? 1.25 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Labels */}
      {labels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn('text-center max-w-[80px] truncate', {
                'text-primary font-semibold': index + 1 === currentStep,
              })}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Step Counter */}
      <div className="text-center">
        <span className="text-sm font-semibold">
          Schritt {currentStep}/{totalSteps}
        </span>
        <span className="text-xs text-muted-foreground ml-2">({percentage}%)</span>
      </div>
    </div>
  )
}

// Simple Dot Progress (für Mobile/kompakt)
export function DotProgress({
  currentStep,
  totalSteps = 7,
  className,
}: Omit<ProgressIndicatorProps, 'labels'>) {
  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber <= currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <motion.div
            key={index}
            className={cn('rounded-full transition-all', {
              'h-2 w-8 bg-gradient-to-r from-purple-500 to-pink-500': isCurrent,
              'h-2 w-2 bg-purple-500/50': isCompleted && !isCurrent,
              'h-2 w-2 bg-muted': !isCompleted,
            })}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          />
        )
      })}
    </div>
  )
}
