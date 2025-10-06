import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface AIFollowUpQuestion {
  id: string
  generated_question_text: string
  question_type: string
  context_used?: any
}

export function useAIFollowUp() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<AIFollowUpQuestion[]>([])
  const { toast } = useToast()

  const checkAndGenerate = useCallback(
    async (params: {
      questionId: string
      answerValue: string | string[]
      experienceId?: string
      categoryName?: string
      previousAnswers?: Record<string, any>
    }) => {
      setIsGenerating(true)

      try {
        const res = await fetch('/api/ai/generate-followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })

        if (!res.ok) {
          throw new Error('Failed to generate follow-up')
        }

        const data = await res.json()

        if (data.shouldGenerate && data.questions?.length > 0) {
          setGeneratedQuestions(data.questions)
          return data.questions
        }

        return []
      } catch (error) {
        console.error('AI generation error:', error)
        // Silently fail - AI is optional enhancement
        return []
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  const answerFollowUp = useCallback(
    async (questionId: string, answerText: string, qualityRating?: number) => {
      try {
        const res = await fetch('/api/ai/answer-followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            answerText,
            qualityRating,
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to save answer')
        }

        // Remove answered question from list
        setGeneratedQuestions((prev) =>
          prev.filter((q) => q.id !== questionId)
        )

        if (qualityRating && qualityRating >= 4) {
          toast({
            title: 'Thank you!',
            description: 'Your feedback helps us improve AI questions',
          })
        }

        return true
      } catch (error) {
        console.error('Answer save error:', error)
        toast({
          title: 'Error',
          description: 'Failed to save answer',
          variant: 'destructive',
        })
        return false
      }
    },
    [toast]
  )

  const skipQuestion = useCallback((questionId: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }, [])

  const clearQuestions = useCallback(() => {
    setGeneratedQuestions([])
  }, [])

  return {
    isGenerating,
    generatedQuestions,
    checkAndGenerate,
    answerFollowUp,
    skipQuestion,
    clearQuestions,
  }
}
