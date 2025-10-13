'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TextQuestionProps {
  value?: string
  onChange: (value: string) => void
  currentValue?: string
  placeholder?: string
}

export const TextQuestion = ({ value, onChange, currentValue, placeholder }: TextQuestionProps) => {
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
      {/* Existing Value Display */}
      {currentValue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="text-sm text-blue-700 mb-1">Unsere Vermutung:</div>
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
