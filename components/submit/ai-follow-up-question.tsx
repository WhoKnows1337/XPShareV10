'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIFollowUpQuestionProps {
  question: {
    id: string
    generated_question_text: string
    question_type: string
    context_used?: any
  }
  onAnswer: (questionId: string, answer: string, rating?: number) => void
  onSkip: () => void
}

export function AIFollowUpQuestion({
  question,
  onAnswer,
  onSkip,
}: AIFollowUpQuestionProps) {
  const [answer, setAnswer] = useState('')
  const [qualityRating, setQualityRating] = useState<number | null>(null)
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please provide an answer before continuing',
        variant: 'destructive',
      })
      return
    }

    onAnswer(question.id, answer, qualityRating || undefined)
  }

  const renderInput = () => {
    switch (question.question_type) {
      case 'text':
        return (
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full"
          />
        )
      default:
        return (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            rows={4}
            className="w-full"
          />
        )
    }
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">AI-Generated Follow-Up</CardTitle>
        </div>
        {question.context_used?.reasoning && (
          <p className="text-sm text-muted-foreground mt-2">
            💡 {question.context_used.reasoning}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium mb-3">{question.generated_question_text}</p>
          {renderInput()}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Was this question helpful?
            </span>
            <Button
              variant={qualityRating === 5 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQualityRating(5)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant={qualityRating === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQualityRating(1)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
            <Button onClick={handleSubmit}>
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
