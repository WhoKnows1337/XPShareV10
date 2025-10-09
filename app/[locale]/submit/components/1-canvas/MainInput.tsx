'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { AutosaveIndicator, useAutosaveTracking } from '../shared/AutosaveIndicator'

const MAX_CHARS = 9999

export const MainInput = () => {
  const { rawText, charCount, isTypewriting, typewriterText, setText } = useSubmitStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { lastSaved, isSaving } = useAutosaveTracking()

  // Typewriter effect
  useEffect(() => {
    if (isTypewriting && typewriterText) {
      let i = 0
      const timer = setInterval(() => {
        if (i < typewriterText.length) {
          const currentText = typewriterText.slice(0, i + 1)
          setText(currentText)
          i++
        } else {
          clearInterval(timer)
          useSubmitStore.setState({ isTypewriting: false, typewriterText: '' })
        }
      }, 30) // 30ms per character

      return () => clearInterval(timer)
    }
  }, [isTypewriting, typewriterText, setText])

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [rawText])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= MAX_CHARS) {
      setText(newText)
    }
  }

  const isNearLimit = charCount > MAX_CHARS * 0.9

  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Breathing Placeholder */}
        {rawText.length === 0 && (
          <motion.div
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-6 left-6 pointer-events-none text-gray-400 text-lg"
          >
            Was hast du erlebt?
          </motion.div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={handleChange}
          className={`
            w-full min-h-[200px] p-6
            text-lg leading-relaxed
            bg-transparent
            border-2 rounded-2xl
            transition-all duration-300
            resize-none
            focus:outline-none
            ${rawText.length === 0
              ? 'border-gray-200 focus:border-blue-400'
              : 'border-blue-300 focus:border-blue-500'
            }
            ${isNearLimit ? 'border-orange-400' : ''}
          `}
          style={{
            overflow: 'hidden',
          }}
          placeholder=""
          aria-label="Experience text input"
        />

        {/* Character Counter & Autosave Indicator */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: charCount > 0 ? 1 : 0 }}
            className={`
              text-sm font-medium
              transition-colors duration-300
              ${charCount < MAX_CHARS * 0.7
                ? 'text-gray-400'
                : charCount < MAX_CHARS * 0.9
                ? 'text-orange-500'
                : 'text-red-500'
              }
            `}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
