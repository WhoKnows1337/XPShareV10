'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface BooleanQuestionProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  currentValue?: boolean
}

export const BooleanQuestion = ({ value, onChange, currentValue }: BooleanQuestionProps) => {
  return (
    <div className="space-y-4">
      {/* Current AI Suggestion */}
      {currentValue !== undefined && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">AI-Vorschlag:</span>{' '}
          <span className="text-blue-600">{currentValue ? 'Ja' : 'Nein'}</span>
        </div>
      )}

      {/* Yes/No Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(true)}
          className={`p-6 rounded-xl border-2 transition-all ${
            value === true
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
          }`}
        >
          <Check className="w-8 h-8 mx-auto mb-2" />
          <span className="text-lg font-semibold">Ja</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(false)}
          className={`p-6 rounded-xl border-2 transition-all ${
            value === false
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
          }`}
        >
          <X className="w-8 h-8 mx-auto mb-2" />
          <span className="text-lg font-semibold">Nein</span>
        </motion.button>
      </div>
    </div>
  )
}
