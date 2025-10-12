'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { X, Sparkles } from 'lucide-react'

export const ConversationalPrompts = () => {
  const { activeQuestions, answerQuestion, skipQuestion } = useNewXPStore()

  const currentQuestion = activeQuestions[0]

  if (!currentQuestion) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <p className="text-sm font-medium text-purple-700">KI-Assistent</p>
          </div>
          <button
            onClick={() => skipQuestion(currentQuestion.id)}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {currentQuestion.question}
        </h3>

        {/* Context */}
        {currentQuestion.context && (
          <p className="text-sm text-gray-600 mb-4">{currentQuestion.context}</p>
        )}

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => answerQuestion(currentQuestion.id, option)}
                  className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'chips' && currentQuestion.options && (
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => answerQuestion(currentQuestion.id, option)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full font-medium text-sm text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Deine Antwort..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    answerQuestion(currentQuestion.id, e.currentTarget.value)
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Skip Button */}
        {currentQuestion.canSkip && (
          <button
            onClick={() => skipQuestion(currentQuestion.id)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Überspringen →
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
