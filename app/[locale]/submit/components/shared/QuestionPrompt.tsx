'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Target, Award, X } from 'lucide-react'
import type { Question } from '@/lib/utils/confidenceChecker'

interface QuestionPromptProps {
  questions: Question[]
  onStart: () => void
  onSkip: () => void
}

export const QuestionPrompt = ({ questions, onStart, onSkip }: QuestionPromptProps) => {
  const requiredCount = questions.filter((q) => q.required).length
  const optionalCount = questions.filter((q) => !q.required).length
  const totalXP = questions.reduce((sum, q) => sum + (q.xpBonus || 0), 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSkip()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          {/* Close Button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/80 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header with Icon */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                🎯 Hilf der Community
              </h2>
              <p className="text-blue-100 text-lg">
                Beantworte ein paar Fragen für bessere Ergebnisse
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bessere Sichtbarkeit</h3>
                  <p className="text-sm text-gray-600">
                    Hilf anderen, ähnliche Erlebnisse zu finden
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pattern-Matching</h3>
                  <p className="text-sm text-gray-600">
                    Entdecke Verbindungen und Muster
                  </p>
                </div>
              </div>

              {totalXP > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">+{totalXP} XP Bonus</h3>
                    <p className="text-sm text-gray-600">
                      Sammle Erfahrungspunkte und schalte Badges frei
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50"
            >
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-900">{requiredCount}</div>
                  <div className="text-xs text-gray-600">Pflichtfragen</div>
                </div>
                <div className="w-px h-10 bg-gray-300" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-900">{optionalCount}</div>
                  <div className="text-xs text-gray-600">Optional</div>
                </div>
                <div className="w-px h-10 bg-gray-300" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-amber-600">{totalXP}</div>
                  <div className="text-xs text-gray-600">XP Gesamt</div>
                </div>
              </div>
            </motion.div>

            {/* Time Estimate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500"
            >
              ⏱️ Dauert ca. {Math.ceil(questions.length * 0.5)} Minuten
            </motion.div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50/50 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              🚀 Los geht's!
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSkip}
              className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Später
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
