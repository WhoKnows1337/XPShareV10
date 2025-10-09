'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperienceSubmitStore } from '@/lib/stores/experienceSubmitStore'
import { generateQuestions, type Question } from '@/lib/utils/confidenceChecker'
import { DateQuestion } from './DateQuestion'
import { LocationQuestion } from './LocationQuestion'
import { MultiChoice } from './MultiChoice'
import { EmotionalTags } from './EmotionalTags'
import { TextQuestion } from './TextQuestion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
}

const questionVariants = {
  enter: { opacity: 0, x: 50, scale: 0.95 },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

export const QuestionFlow = () => {
  const { extractedData, answers, answerQuestion, nextStep, prevStep } = useExperienceSubmitStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    // Generate questions on mount
    const generatedQuestions = generateQuestions(extractedData)
    setQuestions(generatedQuestions)
  }, [extractedData])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined

  const handleNext = () => {
    if (isLastQuestion) {
      // All questions answered, go to next step
      nextStep()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleBack = () => {
    if (isFirstQuestion) {
      prevStep()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleAnswer = (answer: any) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answer)
    }
  }

  const isAnswered = () => {
    if (!currentQuestion) return false
    if (!currentQuestion.required) return true // Optional questions can be skipped
    return currentAnswer !== undefined && currentAnswer !== '' && currentAnswer !== null
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Fragen werden generiert...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-3xl mx-auto"
      >
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Frage {currentQuestionIndex + 1} von {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% abgeschlossen
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              {/* Question Header */}
              <div className="mb-6">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {currentQuestion.question}
                </motion.h2>
                {!currentQuestion.required && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-500"
                  >
                    Optional – du kannst diese Frage überspringen
                  </motion.p>
                )}
                {currentQuestion.confidence !== undefined && currentQuestion.confidence < 80 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-300 rounded-full text-sm text-orange-700"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Unsicher: {currentQuestion.confidence}% Konfidenz
                  </motion.div>
                )}
              </div>

              {/* Question Component */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentQuestion.type === 'date' && (
                  <DateQuestion
                    value={currentAnswer}
                    onChange={handleAnswer}
                    currentValue={currentQuestion.currentValue as string}
                  />
                )}
                {currentQuestion.type === 'location' && (
                  <LocationQuestion
                    value={currentAnswer}
                    onChange={handleAnswer}
                    currentValue={currentQuestion.currentValue as string}
                  />
                )}
                {currentQuestion.type === 'multiChoice' && (
                  <MultiChoice
                    value={currentAnswer}
                    onChange={handleAnswer}
                    options={currentQuestion.options || []}
                    currentValue={currentQuestion.currentValue as string}
                  />
                )}
                {currentQuestion.type === 'emotionalTags' && (
                  <EmotionalTags
                    value={currentAnswer || []}
                    onChange={handleAnswer}
                  />
                )}
                {currentQuestion.type === 'text' && (
                  <TextQuestion
                    value={currentAnswer}
                    onChange={handleAnswer}
                    currentValue={currentQuestion.currentValue as string}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: isAnswered() ? 1.05 : 1 }}
            whileTap={{ scale: isAnswered() ? 0.95 : 1 }}
            onClick={handleNext}
            disabled={currentQuestion?.required && !isAnswered()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
              isAnswered()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? (
              <>
                <span>Abschließen</span>
                <CheckCircle2 className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>{currentQuestion?.required && !isAnswered() ? 'Bitte beantworten' : 'Weiter'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Skip Button for Optional Questions */}
        {currentQuestion && !currentQuestion.required && !isAnswered() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-4"
          >
            <button
              onClick={handleNext}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Frage überspringen
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
