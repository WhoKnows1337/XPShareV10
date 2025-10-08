'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { HelpCircle } from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'

interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'number'
  question: string
  options?: any[]
  required: boolean
  helpText?: string
  placeholder?: string
}

export default function QuestionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { content, category: storeCategory } = useSubmissionStore()
  const [category, setCategory] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      // Check if we have content in the store
      if (!content || !storeCategory) {
        const locale = pathname.split('/')[1]
        router.push(`/${locale}/submit`)
        return
      }

      try {
        const cat = storeCategory || 'other'
        setCategory(cat)

        // Fetch questions from API
        const response = await fetch(`/api/questions?category=${cat}`)
        const data = await response.json()

        if (response.ok && data.questions) {
          setQuestions(data.questions)
        } else {
          // Fallback to empty if no questions found
          setQuestions([])
        }
      } catch (e) {
        console.error('Failed to load questions:', e)
        setError('Failed to load questions. You can skip this step.')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [content, storeCategory, router, pathname])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleContinue = () => {
    // TODO: Save answers to store if needed
    // For now, just navigate to next step
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit/witnesses`)
  }

  const handleSkip = () => {
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit/witnesses`)
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
            placeholder={question.placeholder}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            placeholder={question.placeholder}
          />
        )

      case 'radio':
        // For radio questions, options might be an array of objects or strings
        const radioOptions = Array.isArray(question.options)
          ? question.options.map(opt => typeof opt === 'string' ? opt : opt.label || opt.value)
          : []

        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {radioOptions.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        // For checkbox questions, options might be an array of objects or strings
        const checkboxOptions = Array.isArray(question.options)
          ? question.options.map(opt => typeof opt === 'string' ? opt : opt.label || opt.value)
          : []

        return (
          <div className="space-y-2">
            {checkboxOptions.map((option: string) => (
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Fragen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Zusätzliche Fragen</h1>
        <p className="text-muted-foreground">
          Hilf uns, deine Erfahrung besser zu verstehen
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Keine Fragen verfügbar</p>
            <p className="text-muted-foreground mb-6">
              Für diese Kategorie sind aktuell keine zusätzlichen Fragen konfiguriert.
            </p>
            <Button onClick={handleSkip} size="lg">
              Weiter →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                Kategorie-spezifische Fragen
              </CardTitle>
              <CardDescription>
                Diese Fragen sind auf deine Erfahrungsart zugeschnitten. Du kannst alle überspringen, die nicht passen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.helpText && (
                    <p className="text-sm text-muted-foreground">{question.helpText}</p>
                  )}
                  {renderQuestion(question)}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
              Fragen überspringen
            </Button>
            <Button onClick={handleContinue} className="flex-1" size="lg">
              Weiter zu Zeugen →
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
