'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ConfidenceBadgeProps {
  confidence: number
  isManuallyEdited: boolean
}

export const ConfidenceBadge = ({
  confidence,
  isManuallyEdited,
}: ConfidenceBadgeProps) => {
  if (isManuallyEdited) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium"
      >
        <Check className="w-3 h-3" />
        <span>Bearbeitet</span>
      </motion.div>
    )
  }

  const getBadgeVariants = () => {
    if (confidence < 50) {
      return {
        animate: {
          scale: [1, 1.05, 1],
          backgroundColor: ['#fecaca', '#fca5a5', '#fecaca'],
        },
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        },
      }
    } else if (confidence < 80) {
      return {
        animate: {
          backgroundColor: '#fde68a',
        },
      }
    } else {
      return {
        animate: {
          backgroundColor: '#86efac',
        },
      }
    }
  }

  const getTextColor = () => {
    if (confidence < 50) return 'text-red-900'
    if (confidence < 80) return 'text-orange-900'
    return 'text-green-900'
  }

  const variants = getBadgeVariants()

  return (
    <motion.div
      {...variants}
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTextColor()}`}
    >
      {confidence}%
    </motion.div>
  )
}
