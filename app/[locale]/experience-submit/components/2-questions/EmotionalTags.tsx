'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EMOTION_OPTIONS } from '@/lib/utils/confidenceChecker'

interface EmotionalTagsProps {
  value: string[]
  onChange: (value: string[]) => void
}

export const EmotionalTags = ({ value, onChange }: EmotionalTagsProps) => {
  const [selected, setSelected] = useState<string[]>(value || [])

  useEffect(() => {
    onChange(selected)
  }, [selected])

  const toggleEmotion = (emotionValue: string) => {
    if (selected.includes(emotionValue)) {
      setSelected(selected.filter((e) => e !== emotionValue))
    } else {
      setSelected([...selected, emotionValue])
    }
  }

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-600"
      >
        Wähle alle Gefühle aus, die du erlebt hast (mehrfach möglich):
      </motion.p>

      {/* Emotion Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EMOTION_OPTIONS.map((emotion, index) => {
          const isSelected = selected.includes(emotion.value)

          return (
            <motion.button
              key={emotion.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleEmotion(emotion.value)}
              className={`px-4 py-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <motion.span
                className="text-4xl"
                animate={{
                  scale: isSelected ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                {emotion.emoji}
              </motion.span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {emotion.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Count */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="text-sm text-green-700 mb-2">
            {selected.length} {selected.length === 1 ? 'Gefühl' : 'Gefühle'} ausgewählt:
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((emotionValue) => {
              const emotion = EMOTION_OPTIONS.find((e) => e.value === emotionValue)
              return (
                <motion.div
                  key={emotionValue}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-green-300 rounded-full"
                >
                  <span className="text-xl">{emotion?.emoji}</span>
                  <span className="text-sm font-medium text-green-900">
                    {emotion?.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Helper Text */}
      {selected.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 text-center"
        >
          Keine Auswahl getroffen
        </motion.p>
      )}
    </div>
  )
}
