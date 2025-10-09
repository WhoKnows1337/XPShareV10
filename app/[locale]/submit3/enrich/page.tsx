'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { QuestionCard, type Question } from '@/components/submit3/QuestionCard'
import { AnimatePresence } from 'framer-motion'

// Mock questions based on category
const CATEGORY_QUESTIONS: Record<string, Question[]> = {
  'ufo-sighting': [
    {
      id: 'ufo-shape',
      type: 'radio',
      question: 'What shape was the object?',
      description: 'Select the option that best describes what you saw',
      options: ['Disc/Saucer', 'Triangle', 'Sphere/Orb', 'Cigar/Cylinder', 'Other'],
      required: false,
    },
    {
      id: 'ufo-size',
      type: 'slider',
      question: 'How large was the object (approximately)?',
      description: 'In meters, compared to familiar objects',
      min: 1,
      max: 100,
      required: false,
    },
    {
      id: 'ufo-behavior',
      type: 'checkbox',
      question: 'What behaviors did you observe?',
      description: 'Select all that apply',
      options: ['Hovering', 'Fast movement', 'Sudden direction change', 'Light emission', 'Sound'],
      required: false,
    },
  ],
  'entity-encounter': [
    {
      id: 'entity-appearance',
      type: 'textarea',
      question: 'Can you describe the entity\'s appearance?',
      description: 'Any details you remember',
      required: false,
    },
    {
      id: 'entity-communication',
      type: 'radio',
      question: 'Did you communicate with the entity?',
      options: ['Yes, verbally', 'Yes, telepathically', 'Attempted but no response', 'No'],
      required: false,
    },
  ],
  'paranormal-activity': [
    {
      id: 'paranormal-type',
      type: 'checkbox',
      question: 'What type of activity did you experience?',
      options: ['Visual apparition', 'Sounds/voices', 'Objects moving', 'Temperature change', 'Feeling of presence'],
      required: false,
    },
    {
      id: 'paranormal-duration',
      type: 'slider',
      question: 'How long did the activity last (minutes)?',
      min: 1,
      max: 120,
      required: false,
    },
  ],
  default: [
    {
      id: 'general-intensity',
      type: 'slider',
      question: 'How intense was this experience?',
      description: '1 = Mild, 10 = Extremely intense',
      min: 1,
      max: 10,
      required: false,
    },
    {
      id: 'general-impact',
      type: 'textarea',
      question: 'How has this experience impacted you?',
      description: 'Optional: Share how this affected your life',
      required: false,
    },
  ],
}

export default function Submit3EnrichPage() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    confirmedCategory,
    questionAnswers,
    setQuestionAnswer,
  } = useSubmit3Store()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const questions = CATEGORY_QUESTIONS[confirmedCategory || ''] || CATEGORY_QUESTIONS.default
  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (answer: any) => {
    setQuestionAnswer(currentQuestion.id, answer)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions answered, move to next phase
      const locale = getLocaleFromPathname(pathname)
      router.push(`/${locale}/submit3/attach`)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      const locale = getLocaleFromPathname(pathname)
      router.push(`/${locale}/submit3/attach`)
    }
  }

  const handleSkipAll = () => {
    const locale = getLocaleFromPathname(pathname)
    router.push(`/${locale}/submit3/attach`)
  }

  const handleBack = () => {
    const locale = getLocaleFromPathname(pathname)
    router.push(`/${locale}/submit3/refine`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back & Skip All */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkipAll}>
          Skip All Questions →
        </Button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tell Us More</h1>
        <p className="text-muted-foreground">
          These questions help us understand your experience better (all optional)
        </p>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          answer={questionAnswers[currentQuestion.id]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={currentQuestionIndex > 0 ? handlePrevious : undefined}
          onSkip={handleSkip}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === questions.length - 1}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      </AnimatePresence>
    </div>
  )
}
