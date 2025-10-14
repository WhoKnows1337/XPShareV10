'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { generateQuestions, type Question } from '@/lib/utils/confidenceChecker'
import { ProgressBar } from '../shared/ProgressBar'
import { DateQuestion } from './DateQuestion'
import { LocationQuestion } from './LocationQuestion'
import { MultiChoice } from './MultiChoice'
import { EmotionalTags } from './EmotionalTags'
import { TextQuestion } from './TextQuestion'
import { BooleanQuestion } from './BooleanQuestion'
import { SliderQuestion } from './SliderQuestion'
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

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
  const { rawText, extractedData, answers, currentStep, answerQuestion, nextStep, prevStep } = useSubmitStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTextExpanded, setIsTextExpanded] = useState(false)
  const [showConfirmAllSuccess, setShowConfirmAllSuccess] = useState(false)

  useEffect(() => {
    // Generate questions on mount (async)
    async function loadQuestions() {
      const generatedQuestions = await generateQuestions(extractedData)
      setQuestions(generatedQuestions)
    }
    loadQuestions()
  }, [extractedData])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined

  // Count AI pre-filled questions
  const aiPrefilledQuestions = questions.filter(q => q.isAISuggestion && q.currentValue)
  const aiPrefilledCount = aiPrefilledQuestions.length

  // Confirm all AI pre-fills at once
  const handleConfirmAll = () => {
    aiPrefilledQuestions.forEach(q => {
      if (!answers[q.id]) {
        answerQuestion(q.id, q.currentValue)
      }
    })
    setShowConfirmAllSuccess(true)
    setTimeout(() => setShowConfirmAllSuccess(false), 3000)
  }

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
        {/* Overall Progress Bar */}
        <ProgressBar currentStep={currentStep} />

        {/* Collapsible Text Preview */}
        {rawText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.button
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="w-full bg-white rounded-xl border-2 border-gray-200 p-4 text-left hover:border-gray-300 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Dein Text:</p>
                  <motion.p
                    className="text-gray-900 text-sm"
                    initial={false}
                    animate={{
                      maxHeight: isTextExpanded ? '1000px' : '24px',
                    }}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: isTextExpanded ? 'unset' : 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {rawText}
                  </motion.p>
                </div>
                <motion.div
                  animate={{ rotate: isTextExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <ArrowRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Step Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Zusatzfragen
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Beantworte ein paar kurze Fragen, um deine Erfahrung zu vervollständigen und anderen zu helfen, ähnliche Erlebnisse zu finden.
          </p>
        </motion.div>

        {/* AI Pre-fill Banner */}
        {aiPrefilledCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    🤖 KI hat {aiPrefilledCount} {aiPrefilledCount === 1 ? 'Attribut' : 'Attribute'} erkannt
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bestätige die Vorschläge oder beantworte sie einzeln
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmAll}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors shadow-md"
              >
                ✓ Alle bestätigen
              </motion.button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {showConfirmAllSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-indigo-200"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Alle {aiPrefilledCount} Vorschläge wurden bestätigt! +{aiPrefilledCount * 5} XP
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Question Progress Bar */}
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

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  {!currentQuestion.required && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs text-gray-600"
                    >
                      Optional
                    </motion.span>
                  )}

                  {currentQuestion.isAISuggestion && currentQuestion.confidence !== undefined && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.22 }}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        currentQuestion.confidence >= 80
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : currentQuestion.confidence >= 60
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-orange-100 border-orange-300 text-orange-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      🤖 KI erkannt ({currentQuestion.confidence}%)
                    </motion.span>
                  )}

                  {currentQuestion.xpBonus && currentQuestion.xpBonus > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs text-amber-700 font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      +{currentQuestion.xpBonus} XP
                    </motion.span>
                  )}
                </div>

                {/* Help Text */}
                {currentQuestion.helpText && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-sm text-gray-500 mt-2 italic"
                  >
                    💡 {currentQuestion.helpText}
                  </motion.p>
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
                    confidence={currentQuestion.confidence}
                    isAISuggestion={currentQuestion.isAISuggestion}
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
                    placeholder={currentQuestion.placeholder}
                    confidence={currentQuestion.confidence}
                    isAISuggestion={currentQuestion.isAISuggestion}
                  />
                )}
                {currentQuestion.type === 'boolean' && (
                  <BooleanQuestion
                    value={currentAnswer}
                    onChange={handleAnswer}
                    currentValue={currentQuestion.currentValue as boolean}
                    confidence={currentQuestion.confidence}
                    isAISuggestion={currentQuestion.isAISuggestion}
                  />
                )}
                {currentQuestion.type === 'slider' && currentQuestion.sliderConfig && (
                  <SliderQuestion
                    value={currentAnswer}
                    onChange={handleAnswer}
                    sliderConfig={currentQuestion.sliderConfig}
                    currentValue={currentQuestion.currentValue as number}
                    confidence={currentQuestion.confidence}
                    isAISuggestion={currentQuestion.isAISuggestion}
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
