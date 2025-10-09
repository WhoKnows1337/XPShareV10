'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  showBack?: boolean
  showNext?: boolean
  nextLabel?: string
  nextIcon?: React.ReactNode
  isNextDisabled?: boolean
  isNextLoading?: boolean
  nextVariant?: 'primary' | 'success'
}

export const NavigationButtons = ({
  onBack,
  onNext,
  showBack = true,
  showNext = true,
  nextLabel = 'Weiter',
  nextIcon,
  isNextDisabled = false,
  isNextLoading = false,
  nextVariant = 'primary',
}: NavigationButtonsProps) => {
  const nextColors = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    success: 'bg-gradient-to-r from-green-500 to-blue-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-center justify-between"
    >
      {showBack && onBack ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Zurück</span>
        </motion.button>
      ) : (
        <div />
      )}

      {showNext && onNext && (
        <motion.button
          whileHover={{ scale: isNextLoading || isNextDisabled ? 1 : 1.05 }}
          whileTap={{ scale: isNextLoading || isNextDisabled ? 1 : 0.95 }}
          onClick={onNext}
          disabled={isNextDisabled || isNextLoading}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white shadow-lg
            transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
            ${nextColors[nextVariant]}
          `}
        >
          {isNextLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Lädt...</span>
            </>
          ) : (
            <>
              {nextIcon || <ArrowRight className="w-5 h-5" />}
              <span>{nextLabel}</span>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  )
}
