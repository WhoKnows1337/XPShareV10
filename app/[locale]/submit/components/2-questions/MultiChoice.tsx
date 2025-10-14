'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface MultiChoiceProps {
  value?: string
  onChange: (value: string) => void
  options: string[]
  currentValue?: string
  confidence?: number
  isAISuggestion?: boolean
}

export const MultiChoice = ({ value, onChange, options, currentValue, confidence, isAISuggestion }: MultiChoiceProps) => {
  const [selected, setSelected] = useState<string>('')
  const [otherValue, setOtherValue] = useState('')
  const [showOther, setShowOther] = useState(false)

  useEffect(() => {
    if (currentValue && !options.includes(currentValue)) {
      setShowOther(true)
      setOtherValue(currentValue)
      setSelected('Andere')
    } else if (currentValue) {
      setSelected(currentValue)
    }
  }, [currentValue, options])

  const handleSelect = (option: string) => {
    setSelected(option)
    if (option === 'Andere' || option === 'Other') {
      setShowOther(true)
      onChange(otherValue || '')
    } else {
      setShowOther(false)
      onChange(option)
    }
  }

  const handleOtherChange = (val: string) => {
    setOtherValue(val)
    onChange(val)
  }

  return (
    <div className="space-y-6">
      {/* AI Suggestion Display */}
      {currentValue && isAISuggestion && (
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
          <div className="text-lg font-medium text-gray-900">{currentValue}</div>
        </motion.div>
      )}
      {/* Non-AI current value display */}
      {currentValue && !isAISuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="text-sm text-blue-700 mb-1">Bisherige Angabe:</div>
          <div className="text-lg font-medium text-blue-900">{currentValue}</div>
        </motion.div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selected === option
          const isOther = option === 'Andere' || option === 'Other'

          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option)}
              className={`w-full px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <span
                className={`font-medium ${
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {option}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Other Input */}
      {showOther && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-gray-700">
            Bitte beschreibe genauer:
          </label>
          <input
            type="text"
            value={otherValue}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder="Deine Antwort..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
        </motion.div>
      )}

      {/* Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="text-sm text-green-700 mb-1">Deine Antwort:</div>
          <div className="text-lg font-medium text-green-900">{value}</div>
        </motion.div>
      )}
    </div>
  )
}
