'use client'

import { useState } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuestionEditorDialog } from '@/components/admin/question-editor-dialog'
import { DraggableQuestionList } from '@/components/admin/draggable-question-list'
import { ArrowLeft, Plus, Globe, Info, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AttributeSchema {
  key: string
  display_name: string
  data_type: string
  allowed_values: string[] | null
}

interface UniversalQuestionsClientProps {
  initialQuestions: DynamicQuestion[]
  attributes: AttributeSchema[]
}

export function UniversalQuestionsClient({
  initialQuestions,
  attributes,
}: UniversalQuestionsClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<DynamicQuestion | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleReorder = async (questionIds: string[]) => {
    try {
      const res = await fetch('/api/admin/questions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: null, // Universal questions
          question_ids: questionIds,
        }),
      })

      if (!res.ok) throw new Error('Failed to reorder questions')

      toast({
        title: 'Success',
        description: 'Questions reordered successfully',
      })

      router.refresh()
    } catch (error) {
      console.error('Reorder error:', error)
      toast({
        title: 'Error',
        description: 'Failed to reorder questions',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (question: DynamicQuestion) => {
    setEditingQuestion(question)
    setIsEditorOpen(true)
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this universal question? This affects ALL categories.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete question')

      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      })

      setQuestions(questions.filter((q) => q.id !== questionId))
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (questionId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!res.ok) throw new Error('Failed to update question')

      toast({
        title: 'Success',
        description: `Question ${isActive ? 'activated' : 'deactivated'}`,
      })

      setQuestions(
        questions.map((q) =>
          q.id === questionId ? { ...q, is_active: isActive } : q
        )
      )
      router.refresh()
    } catch (error) {
      console.error('Toggle active error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update question',
        variant: 'destructive',
      })
    }
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setIsEditorOpen(true)
  }

  const handleSaveQuestion = async () => {
    setIsEditorOpen(false)
    setEditingQuestion(null)

    // Refresh questions list
    const res = await fetch('/api/admin/questions?category_id=universal')
    if (res.ok) {
      const { data } = await res.json()
      setQuestions(data)
    }

    router.refresh()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Title Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Universal Questions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Questions that apply to ALL categories (event date, time, location, duration, etc.)
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {questions.length} Questions
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>Universal Questions</strong> are automatically shown for ALL categories during the submission flow.
          They are displayed BEFORE category-specific questions. Use them for core information needed from every experience
          (date, time, location, duration, witnesses, etc.).
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Questions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {questions.filter(q => q.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{attributes.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Universal Attributes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Universal Attributes List */}
      {attributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Universal Attributes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {attributes.map((attr) => (
                <div
                  key={attr.key}
                  className="border rounded-lg p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="font-medium text-sm">{attr.display_name}</div>
                  <code className="text-xs text-muted-foreground">{attr.key}</code>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {attr.data_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Question Button */}
      <div className="flex justify-end">
        <Button onClick={handleAddQuestion} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Universal Question
        </Button>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No universal questions yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create questions that will be asked for ALL experience categories
              </p>
              <Button onClick={handleAddQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Question
              </Button>
            </div>
          ) : (
            <DraggableQuestionList
              questions={questions}
              categoryId={null} // Universal questions have no category
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onAddQuestion={handleAddQuestion}
            />
          )}
        </CardContent>
      </Card>

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        question={editingQuestion}
        categoryId={null} // Universal questions
        onSave={handleSaveQuestion}
      />
    </div>
  )
}
