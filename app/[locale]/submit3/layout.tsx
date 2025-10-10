'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ROUTE_STEPS: Record<string, number> = {
  '/submit3/compose': 1,
  '/submit3/refine': 2,
  '/submit3/enrich': 3,
  '/submit3/attach': 4,
  '/submit3/enhance': 5,
  '/submit3/privacy': 6,
  '/submit3/success': 7,
}

const STEP_NAMES = [
  'Capture',
  'Refine',
  'Enrich',
  'Attach',
  'Enhance',
  'Privacy',
  'Publish',
]

export default function Submit3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Extract locale-agnostic path
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '/submit3'
  const currentStep = ROUTE_STEPS[pathWithoutLocale] ?? 0

  // Don't show progress on success page
  const showProgress = !pathWithoutLocale.includes('/success')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/10">
      <div className="container mx-auto px-4 py-6">
        {/* Progress Indicator */}
        {showProgress && currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto mb-8"
          >
            <div className="flex items-center justify-between gap-2">
              {STEP_NAMES.map((name, index) => {
                const stepNumber = index + 1
                const isActive = stepNumber === currentStep
                const isCompleted = stepNumber < currentStep
                const isPending = stepNumber > currentStep

                return (
                  <div key={name} className="flex flex-1 items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center relative">
                      <motion.div
                        className={`
                          relative z-10 flex items-center justify-center
                          w-10 h-10 rounded-full border-2 transition-all duration-300
                          ${isActive ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/50' : ''}
                          ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                          ${isPending ? 'border-gray-300 bg-white text-gray-400' : ''}
                        `}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{stepNumber}</span>
                        )}
                      </motion.div>

                      {/* Step Name (Desktop only) */}
                      <span className={`
                        hidden md:block mt-2 text-xs font-medium
                        ${isActive ? 'text-purple-600' : ''}
                        ${isCompleted ? 'text-green-600' : ''}
                        ${isPending ? 'text-gray-400' : ''}
                      `}>
                        {name}
                      </span>
                    </div>

                    {/* Connector Line */}
                    {index < STEP_NAMES.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2">
                        <div className={`
                          h-full transition-all duration-500
                          ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                        `} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Current Step Name (Mobile) */}
            <div className="md:hidden text-center mt-4">
              <p className="text-sm font-medium text-purple-600">
                Step {currentStep}: {STEP_NAMES[currentStep - 1]}
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content with Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathWithoutLocale}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
