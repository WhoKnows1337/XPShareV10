'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'slider'
  question: string
  description?: string
  options?: string[]
  min?: number
  max?: number
  required?: boolean
}

interface QuestionCardProps {
  question: Question
  answer?: any
  onAnswer: (answer: any) => void
  onNext: () => void
  onPrevious?: () => void
  onSkip: () => void
  isFirst?: boolean
  isLast?: boolean
  currentIndex: number
  totalQuestions: number
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onPrevious,
  onSkip,
  isFirst = false,
  isLast = false,
  currentIndex,
  totalQuestions,
}: QuestionCardProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [localAnswer, setLocalAnswer] = useState(answer)

  const handleNext = () => {
    if (localAnswer !== undefined && localAnswer !== null && localAnswer !== '') {
      onAnswer(localAnswer)
      onNext()
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={localAnswer || ''}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Your answer..."
            className="text-lg"
            autoFocus
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={localAnswer || ''}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Your answer..."
            className="min-h-[120px] text-base"
            autoFocus
          />
        )

      case 'radio':
        return (
          <RadioGroup value={localAnswer} onValueChange={setLocalAnswer}>
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={(localAnswer || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = localAnswer || []
                    if (checked) {
                      setLocalAnswer([...current, option])
                    } else {
                      setLocalAnswer(current.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={option} className="cursor-pointer text-base">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'slider':
        return (
          <div className="space-y-4">
            <Slider
              value={[localAnswer || question.min || 0]}
              onValueChange={(value) => setLocalAnswer(value[0])}
              min={question.min || 0}
              max={question.max || 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.min || 0}</span>
              <span className="text-2xl font-bold text-purple-600">
                {localAnswer !== undefined ? localAnswer : question.min || 0}
              </span>
              <span>{question.max || 10}</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const hasAnswer = () => {
    if (localAnswer === undefined || localAnswer === null || localAnswer === '') return false
    if (Array.isArray(localAnswer)) return localAnswer.length > 0
    return true
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{question.question}</CardTitle>
              {question.description && (
                <CardDescription className="text-base">
                  {question.description}
                </CardDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="ml-4"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Help Text */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
              >
                <p className="text-sm text-purple-900">
                  💡 <strong>Why are we asking?</strong> This helps us better understand your
                  experience and find patterns with similar reports from others.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input */}
          <div className="py-4">
            {renderInput()}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirst && onPrevious && (
              <Button
                variant="outline"
                onClick={onPrevious}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>

            <Button
              onClick={handleNext}
              disabled={question.required && !hasAnswer()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLast ? 'Finish' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
