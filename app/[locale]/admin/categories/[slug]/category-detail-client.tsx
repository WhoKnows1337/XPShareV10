'use client'

import { useState } from 'react'
import { QuestionCategory, DynamicQuestion } from '@/lib/types/admin-questions'
import { DraggableQuestionList } from '@/components/admin/draggable-question-list'
import { QuestionEditorDialog } from '@/components/admin/question-editor-dialog'
import { CategoryEditorDialog } from '@/components/admin/category-editor-dialog'
import { FullscreenPreviewDialog } from '@/components/admin/fullscreen-preview-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Maximize } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface CategoryDetailClientProps {
  category: QuestionCategory
  initialQuestions: DynamicQuestion[]
}

export function CategoryDetailClient({
  category,
  initialQuestions,
}: CategoryDetailClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<DynamicQuestion | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleReorder = async (questionIds: string[]) => {
    try {
      const res = await fetch('/api/admin/questions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: category.id,
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
    if (!confirm('Are you sure you want to delete this question?')) return

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

    // Refresh questions list FIRST
    const res = await fetch(`/api/admin/questions?category_id=${category.id}`)
    if (res.ok) {
      const { data } = await res.json()
      setQuestions(data)
    }

    // Then trigger router refresh for SSR data
    router.refresh()
  }

  const handleDeleteCategory = async () => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"? This will also delete all associated questions.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete category')

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })

      router.push('/admin/questions')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Category Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{category.icon}</span>
              <div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{category.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={category.is_active ? 'default' : 'secondary'}>
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setIsCategoryEditorOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteCategory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        {category.description && (
          <CardContent>
            <p className="text-muted-foreground">{category.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Preview Button */}
      {questions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
            <Maximize className="mr-2 h-4 w-4" />
            Fullscreen Preview
          </Button>
        </div>
      )}

      {/* Questions List */}
      <DraggableQuestionList
        questions={questions}
        categoryId={category.id}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onAddQuestion={handleAddQuestion}
      />

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        question={editingQuestion}
        categoryId={category.id}
        onSave={handleSaveQuestion}
      />

      {/* Category Editor Dialog */}
      <CategoryEditorDialog
        open={isCategoryEditorOpen}
        onOpenChange={setIsCategoryEditorOpen}
        category={category}
      />

      {/* Fullscreen Preview Dialog */}
      <FullscreenPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        questions={questions.filter(q => q.is_active)}
        categoryName={category.name}
      />
    </div>
  )
}
