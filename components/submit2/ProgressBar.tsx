'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number // 1, 2, or 3
  className?: string
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const steps = [
    { number: 1, label: 'Story', shortLabel: 'Story' },
    { number: 2, label: 'Details', shortLabel: 'Details' },
    { number: 3, label: 'Preview', shortLabel: 'Preview' },
  ]

  return (
    <div className={cn('w-full', className)}>
      {/* Visual Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: currentStep === step.number ? 1.1 : 1,
              }}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all',
                currentStep > step.number
                  ? 'bg-purple-600 text-white'
                  : currentStep === step.number
                  ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {currentStep > step.number ? '✓' : step.number}
            </motion.div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-12 md:w-20 h-1 mx-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <span
              className={cn(
                'transition-colors',
                currentStep === step.number && 'text-purple-600 font-semibold'
              )}
            >
              <span className="hidden md:inline">{step.label}</span>
              <span className="md:hidden">{step.shortLabel}</span>
            </span>

            {index < steps.length - 1 && (
              <span className="mx-3 md:mx-6 text-gray-300">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Text Description */}
      <div className="text-center mt-2 text-sm text-muted-foreground">
        {currentStep === 1 && 'Share your story'}
        {currentStep === 2 && 'Add details'}
        {currentStep === 3 && 'Review & publish'}
      </div>
    </div>
  )
}
