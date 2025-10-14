'use client'

import { useState } from 'react'
import { QuestionCategory, DynamicQuestion } from '@/lib/types/admin-questions'
import { DraggableQuestionList } from '@/components/admin/draggable-question-list'
import { QuestionEditorDialog } from '@/components/admin/question-editor-dialog'
import { CategoryEditorDialog } from '@/components/admin/category-editor-dialog'
import { FullscreenPreviewDialog } from '@/components/admin/fullscreen-preview-dialog'
import { ApplyTemplateDialog } from '@/components/admin/apply-template-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Maximize, FileInput, FilePlus2, Tag, TrendingUp, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AttributeSchema {
  key: string
  display_name: string
  data_type: string
  allowed_values: string[] | null
  is_filterable: boolean
  is_searchable: boolean
}

interface CategoryDetailClientProps {
  category: QuestionCategory
  initialQuestions: DynamicQuestion[]
  attributes?: AttributeSchema[]
  attributeUsageCounts?: Record<string, number>
  completionPercentage?: number
}

export function CategoryDetailClient({
  category,
  initialQuestions,
  attributes = [],
  attributeUsageCounts = {},
  completionPercentage = 0,
}: CategoryDetailClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<DynamicQuestion | null>(null)
  const [showCategoryInfo, setShowCategoryInfo] = useState(false)
  const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false)
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
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
    console.log('handleEdit called with question:', question)
    console.log('Setting editingQuestion and isEditorOpen to true')
    setEditingQuestion(question)
    setIsEditorOpen(true)
    console.log('States set - isEditorOpen should now be true')
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
    console.log('handleAddQuestion called')
    setEditingQuestion(null)
    setIsEditorOpen(true)
    console.log('States set - isEditorOpen should now be true')
  }

  const toggleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)))
    }
  }

  const toggleSelectQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleBulkActivate = async () => {
    if (selectedQuestions.size === 0) return

    try {
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate',
          question_ids: Array.from(selectedQuestions),
        }),
      })

      if (!res.ok) throw new Error('Failed to activate questions')

      toast({
        title: 'Success',
        description: `${selectedQuestions.size} question(s) activated`,
      })

      setSelectedQuestions(new Set())
      router.refresh()
    } catch (error) {
      console.error('Bulk activate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to activate questions',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedQuestions.size === 0) return

    try {
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deactivate',
          question_ids: Array.from(selectedQuestions),
        }),
      })

      if (!res.ok) throw new Error('Failed to deactivate questions')

      toast({
        title: 'Success',
        description: `${selectedQuestions.size} question(s) deactivated`,
      })

      setSelectedQuestions(new Set())
      router.refresh()
    } catch (error) {
      console.error('Bulk deactivate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to deactivate questions',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.size} question(s)?`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          question_ids: Array.from(selectedQuestions),
        }),
      })

      if (!res.ok) throw new Error('Failed to delete questions')

      toast({
        title: 'Success',
        description: `${selectedQuestions.size} question(s) deleted`,
      })

      setSelectedQuestions(new Set())
      router.refresh()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete questions',
        variant: 'destructive',
      })
    }
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

  const handleSaveAsTemplate = async () => {
    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'No questions to save as template',
        variant: 'destructive',
      })
      return
    }

    const templateName = prompt(`Template name:`, `${category.name} Template`)
    if (!templateName) return

    const templateDescription = prompt('Template description (optional):')

    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          category_id: category.id,
          questions: questions.map(q => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            priority: q.priority,
            is_optional: q.is_optional,
            help_text: q.help_text,
            placeholder: q.placeholder,
            conditional_logic: q.conditional_logic,
            follow_up_question: q.follow_up_question,
            tags: q.tags,
          })),
          tags: [],
          is_public: false,
        }),
      })

      if (!res.ok) throw new Error('Failed to create template')

      toast({
        title: 'Success',
        description: 'Template created successfully',
      })
    } catch (error) {
      console.error('Save template error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create template',
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
        <CardContent>
          {category.description && (
            <p className="text-muted-foreground mb-4">{category.description}</p>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCategoryInfo(!showCategoryInfo)}
            className="mb-2"
          >
            {showCategoryInfo ? '▼' : '▶'} Kategorie-Info
          </Button>

          {showCategoryInfo && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">• Slug:</span>{' '}
                  <span className="font-medium">{category.slug}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">• Icon:</span>{' '}
                  <span className="font-medium">{category.icon}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">• Status:</span>{' '}
                  <Badge variant={category.is_active ? 'default' : 'secondary'} className="ml-2">
                    {category.is_active ? '✅ Aktiv' : '⏸️ Inaktiv'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">• Sort Order:</span>{' '}
                  <span className="font-medium">{category.sort_order}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">• Erstellt:</span>{' '}
                  <span className="font-medium">
                    {new Date(category.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">• Letzte Änderung:</span>{' '}
                  <span className="font-medium">
                    {new Date(category.updated_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Stats & Attributes Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {completionPercentage === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : completionPercentage >= 50 ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      completionPercentage === 100
                        ? 'bg-green-500'
                        : completionPercentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <Badge variant={questions.length > 0 ? 'default' : 'outline'}>
                    {questions.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attributes:</span>
                  <Badge variant={attributes.length > 0 ? 'default' : 'outline'}>
                    {attributes.length}
                  </Badge>
                </div>
              </div>
              {completionPercentage < 100 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {questions.length === 0 && '⚠️ No questions configured'}
                    {questions.length > 0 && attributes.length === 0 && '⚠️ No attributes configured'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Questions Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active:</span>
                <span className="font-medium text-green-600">
                  {questions.filter(q => q.is_active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inactive:</span>
                <span className="font-medium text-gray-500">
                  {questions.filter(q => !q.is_active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">With Attribute Mapping:</span>
                <span className="font-medium">
                  {questions.filter(q => q.maps_to_attribute).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attributes Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Attributes Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Attributes:</span>
                <span className="font-medium">{attributes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enum Types:</span>
                <span className="font-medium">
                  {attributes.filter(a => a.data_type === 'enum').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Text Types:</span>
                <span className="font-medium">
                  {attributes.filter(a => a.data_type === 'text').length}
                </span>
              </div>
              {attributes.length > 0 && (
                <div className="pt-2 border-t">
                  <Link href="/admin/attributes">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Tag className="w-3 h-3 mr-1" />
                      Manage Attributes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attributes List (if any) */}
      {attributes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configured Attributes ({attributes.length})</CardTitle>
              <Link href="/admin/attributes">
                <Button variant="outline" size="sm">
                  <Tag className="w-4 h-4 mr-2" />
                  Edit Attributes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {attributes.map((attr) => (
                <div
                  key={attr.key}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{attr.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{attr.key}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {attr.data_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {attr.is_filterable && <span>🔍 Filterable</span>}
                    {attr.is_searchable && <span>🔎 Searchable</span>}
                  </div>
                  {attr.allowed_values && attr.allowed_values.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {attr.allowed_values.length} allowed values
                    </div>
                  )}
                  {attributeUsageCounts[attr.key] && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Used in {attributeUsageCounts[attr.key]} experiences
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={() => setIsApplyTemplateOpen(true)} variant="outline">
          <FileInput className="mr-2 h-4 w-4" />
          Aus Template
        </Button>
        {questions.length > 0 && (
          <>
            <Button onClick={handleSaveAsTemplate} variant="outline">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Als Template
            </Button>
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
              <Maximize className="mr-2 h-4 w-4" />
              Fullscreen Preview
            </Button>
          </>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {questions.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.size === questions.length && questions.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    {selectedQuestions.size === questions.length ? 'Deselect All' : 'Select All'}
                    {selectedQuestions.size > 0 && ` (${selectedQuestions.size} selected)`}
                  </span>
                </label>
              </div>

              {selectedQuestions.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button onClick={handleBulkActivate} variant="outline" size="sm">
                    Activate Selected
                  </Button>
                  <Button onClick={handleBulkDeactivate} variant="outline" size="sm">
                    Deactivate Selected
                  </Button>
                  <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
        selectedQuestions={selectedQuestions}
        onToggleSelect={toggleSelectQuestion}
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

      {/* Apply Template Dialog */}
      <ApplyTemplateDialog
        open={isApplyTemplateOpen}
        onOpenChange={setIsApplyTemplateOpen}
        categoryId={category.id}
        onApplied={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
