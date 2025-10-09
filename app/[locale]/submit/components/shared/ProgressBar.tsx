'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
  showStepText?: boolean
  showCompletionMessage?: boolean
}

export const ProgressBar = ({
  currentStep,
  totalSteps = 6,
  showStepText = true,
  showCompletionMessage = false,
}: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100
  const isLastStep = currentStep === totalSteps

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {showStepText && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Schritt {currentStep} von {totalSteps}
          </span>
          {showCompletionMessage && isLastStep && (
            <span className="text-sm text-green-600 font-medium">Letzter Schritt! 🎉</span>
          )}
        </div>
      )}

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
