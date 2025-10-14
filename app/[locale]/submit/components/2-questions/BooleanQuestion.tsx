'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface BooleanQuestionProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  currentValue?: boolean
  confidence?: number
  isAISuggestion?: boolean
}

export const BooleanQuestion = ({ value, onChange, currentValue, confidence, isAISuggestion }: BooleanQuestionProps) => {
  return (
    <div className="space-y-4">
      {/* AI Suggestion Display */}
      {currentValue !== undefined && isAISuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-2 ${
            confidence && confidence >= 80
              ? 'bg-green-50 border-green-300'
              : confidence && confidence >= 60
              ? 'bg-blue-50 border-blue-300'
              : 'bg-orange-50 border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">🤖 KI-Vorschlag:</div>
            {confidence && (
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                confidence >= 80
                  ? 'bg-green-200 text-green-800'
                  : confidence >= 60
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-orange-200 text-orange-800'
              }`}>
                {confidence}% sicher
              </span>
            )}
          </div>
          <div className="text-lg font-medium text-gray-900">
            {currentValue ? 'Ja' : 'Nein'}
          </div>
        </motion.div>
      )}
      {/* Non-AI current value */}
      {currentValue !== undefined && !isAISuggestion && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Bisherige Angabe:</span>{' '}
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
