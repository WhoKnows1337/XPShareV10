'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Insertion } from '@/lib/stores/experienceSubmitStore'

interface EnrichedTextEditorProps {
  text: string
  insertions: Insertion[]
  onChange: (text: string) => void
  isEditable: boolean
}

export const EnrichedTextEditor = ({
  text,
  insertions,
  onChange,
  isEditable,
}: EnrichedTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  // Render text with highlights
  const renderHighlightedText = () => {
    if (insertions.length === 0) {
      return <div className="whitespace-pre-wrap">{text}</div>
    }

    // Sort insertions by start position
    const sortedInsertions = [...insertions].sort((a, b) => a.start - b.start)

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    sortedInsertions.forEach((insertion, idx) => {
      // Add text before insertion
      if (insertion.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>{text.substring(lastIndex, insertion.start)}</span>
        )
      }

      // Add highlighted insertion
      const typeColors = {
        detail: 'bg-yellow-100 border-yellow-300',
        fact: 'bg-blue-100 border-blue-300',
        emotion: 'bg-pink-100 border-pink-300',
        timeline: 'bg-green-100 border-green-300',
      }

      parts.push(
        <motion.span
          key={`insertion-${idx}`}
          initial={{ backgroundColor: '#fef3c7' }}
          animate={{
            backgroundColor: ['#fef3c7', '#fde68a', '#fef3c7'],
          }}
          transition={{
            duration: 2,
            repeat: 3,
            ease: 'easeInOut',
          }}
          className={`inline border-b-2 ${typeColors[insertion.type]} px-1 rounded`}
          title={`KI-Einfügung: ${insertion.type}`}
        >
          {text.substring(insertion.start, insertion.end)}
        </motion.span>
      )

      lastIndex = insertion.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-final">{text.substring(lastIndex)}</span>)
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>
  }

  const charCount = text.length
  const maxChars = 9999

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      {isEditable ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-lg leading-relaxed"
            rows={10}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-lg leading-relaxed text-gray-900">
          {renderHighlightedText()}
        </div>
      )}

      {/* Legend for highlights */}
      {insertions.length > 0 && !isEditable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-sm font-medium text-gray-700 mb-3">
            ✨ KI hat {insertions.length} {insertions.length === 1 ? 'Detail' : 'Details'} eingefügt:
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(insertions.map((i) => i.type))).map((type) => {
              const typeLabels = {
                detail: 'Details',
                fact: 'Fakten',
                emotion: 'Emotionen',
                timeline: 'Zeitangaben',
              }
              const typeColors = {
                detail: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                fact: 'bg-blue-100 text-blue-700 border-blue-300',
                emotion: 'bg-pink-100 text-pink-700 border-pink-300',
                timeline: 'bg-green-100 text-green-700 border-green-300',
              }

              return (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${typeColors[type]}`}
                >
                  {typeLabels[type]}
                </span>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Character count for editable */}
      {isEditable && (
        <div className="mt-2 text-sm text-gray-500">
          {charCount.toLocaleString()} / {maxChars.toLocaleString()} Zeichen
        </div>
      )}
    </div>
  )
}
