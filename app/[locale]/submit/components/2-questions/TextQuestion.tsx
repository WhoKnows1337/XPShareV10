'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TextQuestionProps {
  value?: string
  onChange: (value: string) => void
  currentValue?: string
  placeholder?: string
  confidence?: number
  isAISuggestion?: boolean
}

export const TextQuestion = ({ value, onChange, currentValue, placeholder, confidence, isAISuggestion }: TextQuestionProps) => {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (currentValue) {
      setText(currentValue)
    }
  }, [currentValue])

  useEffect(() => {
    onChange(text)
  }, [text])

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  const charCount = text.length

  return (
    <div className="space-y-4">
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
      {/* Non-AI current value */}
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

      {/* Text Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Deine Antwort..."}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />

        {/* Character Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute bottom-3 right-3 text-sm ${
            charCount > 0 ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          {charCount} Zeichen
        </motion.div>
      </div>

      {/* Preview */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="text-sm text-green-700 mb-1">Deine Antwort:</div>
          <div className="text-lg font-medium text-green-900">{text}</div>
        </motion.div>
      )}
    </div>
  )
}
