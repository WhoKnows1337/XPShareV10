'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { HelpCircle } from 'lucide-react'

interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'number'
  question: string
  options?: string[]
  required: boolean
}

// Simplified questions for now - will be fetched from API later
const questionsByCategory: Record<string, Question[]> = {
  ufo: [
    { id: 'shape', type: 'radio', question: 'What shape was the object?', options: ['Circular', 'Triangular', 'Cylindrical', 'Other'], required: true },
    { id: 'lights', type: 'checkbox', question: 'Did it have lights?', options: ['Yes', 'No'], required: false },
    { id: 'duration', type: 'number', question: 'How long did the sighting last? (in minutes)', required: true },
    { id: 'additional', type: 'textarea', question: 'Any additional details about the object?', required: false },
  ],
  paranormal: [
    { id: 'type', type: 'radio', question: 'What type of paranormal activity?', options: ['Apparition', 'Poltergeist', 'EVP/Sounds', 'Other'], required: true },
    { id: 'witnesses', type: 'radio', question: 'Were there other witnesses?', options: ['Yes', 'No'], required: false },
    { id: 'additional', type: 'textarea', question: 'Describe what happened in detail', required: false },
  ],
  dreams: [
    { id: 'lucid', type: 'radio', question: 'Was this a lucid dream?', options: ['Yes', 'No', 'Partially'], required: false },
    { id: 'recurring', type: 'radio', question: 'Is this a recurring dream?', options: ['Yes', 'No'], required: false },
    { id: 'symbols', type: 'textarea', question: 'What symbols or themes stood out?', required: false },
  ],
  psychedelic: [
    { id: 'substance', type: 'text', question: 'What substance did you use? (optional)', required: false },
    { id: 'dosage', type: 'text', question: 'Approximate dosage?', required: false },
    { id: 'insights', type: 'textarea', question: 'What insights or realizations did you have?', required: false },
  ],
  spiritual: [
    { id: 'type', type: 'radio', question: 'Type of spiritual experience?', options: ['Meditation', 'Prayer', 'Spontaneous', 'Other'], required: false },
    { id: 'impact', type: 'textarea', question: 'How has this impacted your life?', required: false },
  ],
  synchronicity: [
    { id: 'frequency', type: 'radio', question: 'How often do you experience synchronicities?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], required: false },
    { id: 'meaning', type: 'textarea', question: 'What meaning did this synchronicity have for you?', required: false },
  ],
  nde: [
    { id: 'cause', type: 'text', question: 'What caused the near-death experience?', required: false },
    { id: 'tunnel', type: 'radio', question: 'Did you see a tunnel or light?', options: ['Yes', 'No'], required: false },
    { id: 'beings', type: 'radio', question: 'Did you encounter any beings?', options: ['Yes', 'No'], required: false },
  ],
  other: [
    { id: 'details', type: 'textarea', question: 'Please provide any additional details', required: false },
  ],
}

export default function QuestionsPage() {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    // Get data from localStorage
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
      return
    }

    try {
      const parsed = JSON.parse(draft)
      const cat = parsed.category || 'other'
      setCategory(cat)
      setQuestions(questionsByCategory[cat] || questionsByCategory.other)
    } catch (e) {
      console.error('Failed to parse draft:', e)
      router.push('/submit')
    }
  }, [router])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleContinue = () => {
    // Save answers to localStorage
    const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')
    localStorage.setItem(
      'experience_draft',
      JSON.stringify({
        ...draft,
        questions: answers,
      })
    )
    router.push('/submit/witnesses')
  }

  const handleSkip = () => {
    router.push('/submit/witnesses')
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={question.type}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
          />
        )

      case 'radio':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={answers[question.id]?.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = answers[question.id] || []
                    if (checked) {
                      handleAnswerChange(question.id, [...current, option])
                    } else {
                      handleAnswerChange(question.id, current.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Additional Questions</h1>
        <p className="text-muted-foreground">
          Help us understand your experience better by answering a few questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            Category-Specific Questions
          </CardTitle>
          <CardDescription>
            These questions are tailored to your experience type. You can skip any that don't apply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-base">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderQuestion(question)}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          Skip Questions
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Continue to Witnesses →
        </Button>
      </div>
    </div>
  )
}
