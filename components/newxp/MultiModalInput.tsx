'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Mic, Upload, Type } from 'lucide-react'
import { VoiceRecorder } from './VoiceRecorder'
import { PhotoUploader } from './PhotoUploader'

export const MultiModalInput = () => {
  const { inputMode, setInputMode } = useNewXPStore()

  const tabs = [
    { mode: 'text' as const, icon: Type, label: 'Schreiben' },
    { mode: 'voice' as const, icon: Mic, label: 'Sprechen' },
    { mode: 'photo' as const, icon: Upload, label: 'Hochladen' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Tab Selector */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = inputMode === tab.mode

          return (
            <button
              key={tab.mode}
              onClick={() => setInputMode(tab.mode)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all relative ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {inputMode === 'text' && <TextInput key="text" />}
          {inputMode === 'voice' && <VoiceRecorder key="voice" />}
          {inputMode === 'photo' && <PhotoUploader key="photo" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ========================================
// TEXT INPUT
// ========================================

const TextInput = () => {
  const { rawText, charCount, isTypewriting, typewriterText, setText } = useNewXPStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          useNewXPStore.setState({ isTypewriting: false, typewriterText: '' })
        }
      }, 30)

      return () => clearInterval(timer)
    }
  }, [isTypewriting, typewriterText, setText])

  // Auto-grow
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [rawText])

  // Auto-focus
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const MAX_CHARS = 9999
  const isNearLimit = charCount > MAX_CHARS * 0.9

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
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
          className="absolute top-3 left-0 pointer-events-none text-gray-400 text-lg"
        >
          Erzähl uns, was du erlebt hast...
        </motion.div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={rawText}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setText(e.target.value)
          }
        }}
        className={`
          w-full min-h-[200px] p-0 text-lg leading-relaxed
          bg-transparent border-0 resize-none
          focus:outline-none focus:ring-0
          ${isNearLimit ? 'text-orange-600' : 'text-gray-900'}
        `}
        style={{ overflow: 'hidden' }}
        placeholder=""
      />

      {/* Character Counter */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500" suppressHydrationWarning>
          {charCount > 0 && (
            <>
              {charCount.toLocaleString('de-DE')} Zeichen
              {' · '}
              {Math.ceil(charCount / 5)} Wörter
            </>
          )}
        </div>

        <div
          className={`text-sm font-medium ${
            charCount < MAX_CHARS * 0.7
              ? 'text-gray-400'
              : charCount < MAX_CHARS * 0.9
              ? 'text-orange-500'
              : 'text-red-500'
          }`}
          suppressHydrationWarning
        >
          {charCount} / {MAX_CHARS.toLocaleString('de-DE')}
        </div>
      </div>
    </motion.div>
  )
}
