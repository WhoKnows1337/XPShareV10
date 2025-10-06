'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, GripVertical } from 'lucide-react'
import { EditQuestionDialog } from './edit-question-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  question_text: string
  category: string
  is_active: boolean
  order_index: number
}

interface QuestionListProps {
  questions: Question[]
}

export function QuestionList({ questions }: QuestionListProps) {
  const router = useRouter()
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Question deleted')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Delete question error:', error)
      toast.error('Failed to delete question')
    }
  }

  const handleToggleActive = async (question: Question) => {
    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !question.is_active }),
      })

      if (response.ok) {
        toast.success(question.is_active ? 'Question disabled' : 'Question enabled')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Toggle active error:', error)
      toast.error('Failed to update question')
    }
  }

  return (
    <>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{question.question_text}</span>
                {!question.is_active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">Order: {question.order_index}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={question.is_active ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleToggleActive(question)}
              >
                {question.is_active ? 'Disable' : 'Enable'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingQuestion(question)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingQuestion && (
        <EditQuestionDialog
          question={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
        />
      )}
    </>
  )
}
