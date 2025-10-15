'use client'

import { useState } from 'react'
import { QuestionCategory, DynamicQuestion } from '@/lib/types/admin-questions'
import { DraggableQuestionList } from '@/components/admin/draggable-question-list'
import { QuestionEditorDialog } from '@/components/admin/question-editor-dialog'
import { CategoryEditorDialog } from '@/components/admin/category-editor-dialog'
import { FullscreenPreviewDialog } from '@/components/admin/fullscreen-preview-dialog'
import { ApplyTemplateDialog } from '@/components/admin/apply-template-dialog'
import { AttributeQuestionMatrix } from '@/components/admin/AttributeQuestionMatrix'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Edit, Trash2, Maximize, FileInput, FilePlus2, Tag, TrendingUp, CheckCircle2, AlertCircle, Circle, Plus, Info, Database, HelpCircle, LayoutDashboard, Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface AttributeSchema {
  key: string
  display_name: string
  data_type: string
  allowed_values: string[] | null
  is_filterable: boolean
  is_searchable: boolean
  description?: string | null
}

interface CategoryDetailClientProps {
  category: QuestionCategory
  initialQuestions: DynamicQuestion[]
  attributes?: AttributeSchema[]
  attributeUsageCounts?: Record<string, number>
  completionPercentage?: number
  universalQuestions?: DynamicQuestion[]
  universalAttributes?: AttributeSchema[]
}

export function CategoryDetailClient({
  category,
  initialQuestions,
  attributes = [],
  attributeUsageCounts = {},
  completionPercentage = 0,
  universalQuestions = [],
  universalAttributes = [],
}: CategoryDetailClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<DynamicQuestion | null>(null)
  const [showCategoryInfo, setShowCategoryInfo] = useState(false)
  const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<AttributeSchema | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Attribute form state
  const [attributeFormData, setAttributeFormData] = useState({
    key: '',
    display_name: '',
    display_name_de: '',
    data_type: 'enum',
    allowed_values: [] as string[],
    description: '',
    is_searchable: true,
    is_filterable: true,
    sort_order: 999,
  })
  const [newAllowedValue, setNewAllowedValue] = useState('')

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchema, setGeneratedSchema] = useState<{ attributes: any[], questions: any[] } | null>(null)

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

    const res = await fetch(`/api/admin/questions?category_id=${category.id}`)
    if (res.ok) {
      const { data } = await res.json()
      setQuestions(data)
    }

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

      router.push('/admin/categories')
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

  const handleCreateAttribute = () => {
    setEditingAttribute(null)
    setAttributeFormData({
      key: '',
      display_name: '',
      display_name_de: '',
      data_type: 'enum',
      allowed_values: [],
      description: '',
      is_searchable: true,
      is_filterable: true,
      sort_order: 999,
    })
    setIsAttributeDialogOpen(true)
  }

  const handleEditAttribute = (attribute: AttributeSchema) => {
    setEditingAttribute(attribute)
    setAttributeFormData({
      key: attribute.key,
      display_name: attribute.display_name,
      display_name_de: '',
      data_type: attribute.data_type,
      allowed_values: attribute.allowed_values || [],
      description: attribute.description || '',
      is_searchable: attribute.is_searchable,
      is_filterable: attribute.is_filterable,
      sort_order: 999,
    })
    setIsAttributeDialogOpen(true)
  }

  const handleSaveAttribute = async () => {
    try {
      const url = editingAttribute
        ? `/api/admin/attributes/${editingAttribute.key}`
        : '/api/admin/attributes'

      const method = editingAttribute ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...attributeFormData,
          category_slug: category.slug,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save attribute')
      }

      toast({
        title: 'Success',
        description: editingAttribute ? 'Attribute updated' : 'Attribute created',
      })

      setIsAttributeDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error saving attribute:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save attribute',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAttribute = async (key: string) => {
    if (!confirm(`Are you sure you want to delete attribute "${key}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/attributes/${key}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete attribute')
      }

      toast({
        title: 'Success',
        description: 'Attribute deleted',
      })

      router.refresh()
    } catch (error: any) {
      console.error('Error deleting attribute:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attribute',
        variant: 'destructive',
      })
    }
  }

  const addAllowedValue = () => {
    if (newAllowedValue.trim()) {
      setAttributeFormData({
        ...attributeFormData,
        allowed_values: [...attributeFormData.allowed_values, newAllowedValue.trim()],
      })
      setNewAllowedValue('')
    }
  }

  const removeAllowedValue = (index: number) => {
    setAttributeFormData({
      ...attributeFormData,
      allowed_values: attributeFormData.allowed_values.filter((_, i) => i !== index),
    })
  }

  const handleGenerateSchema = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a description',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/admin/ai-generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          category_slug: category.slug,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate schema')
      }

      const data = await response.json()
      setGeneratedSchema(data.schema)

      toast({
        title: 'Schema Generated!',
        description: `Created ${data.schema.attributes?.length || 0} attributes and ${data.schema.questions?.length || 0} questions`,
      })
    } catch (error) {
      console.error('Schema generation error:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate schema',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddGeneratedItems = async () => {
    if (!generatedSchema) return

    try {
      // Add attributes
      for (const attr of generatedSchema.attributes) {
        await fetch('/api/admin/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_slug: category.slug,
            ...attr,
          }),
        })
      }

      // Add questions
      for (const question of generatedSchema.questions) {
        await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: category.id,
            ...question,
            is_active: true,
          }),
        })
      }

      toast({
        title: 'Success',
        description: 'Generated items added to category',
      })

      setGeneratedSchema(null)
      setAiPrompt('')
      router.refresh()
    } catch (error) {
      console.error('Error adding generated items:', error)
      toast({
        title: 'Error',
        description: 'Failed to add generated items',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      {/* Category Header Card */}
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
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteCategory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="attributes">
            <Database className="mr-2 h-4 w-4" />
            Attributes ({attributes.length})
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {category.description && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          )}

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
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Questions Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category-Specific:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Universal:</span>
                    <span className="font-medium">{universalQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-medium text-green-600">
                      {questions.filter(q => q.is_active).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With Mapping:</span>
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
                  Attributes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category-Specific:</span>
                    <span className="font-medium">{attributes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Universal:</span>
                    <span className="font-medium">{universalAttributes.length}</span>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
                <Maximize className="mr-2 h-4 w-4" />
                Preview Flow
              </Button>
              <Button onClick={() => setIsApplyTemplateOpen(true)} variant="outline">
                <FileInput className="mr-2 h-4 w-4" />
                Apply Template
              </Button>
              <Link href="/admin/global-config">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Global Configuration
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {/* Universal Questions Section */}
          {universalQuestions.length > 0 && (
            <Card className="border-blue-200 bg-muted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Universal Questions ({universalQuestions.length})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      These questions apply to ALL categories and are shown first
                    </p>
                  </div>
                  <Link href="/admin/global-config">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {universalQuestions.map((q, idx) => (
                    <div key={q.id} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{idx + 1}</Badge>
                        <span className="text-sm">{q.question_text}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">{q.question_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category-Specific Questions Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Category-Specific Questions ({questions.length})</CardTitle>
                <Button onClick={handleAddQuestion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add questions specific to this category
                  </p>
                  <Button onClick={handleAddQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Question
                  </Button>
                </div>
              ) : (
                <DraggableQuestionList
                  questions={questions}
                  categoryId={category.id}
                  onReorder={handleReorder}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onAddQuestion={handleAddQuestion}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4">
          {/* Universal Attributes Section */}
          {universalAttributes.length > 0 && (
            <Card className="border-purple-200 bg-muted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-purple-600" />
                      Universal Attributes ({universalAttributes.length})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      These attributes are tracked for ALL experiences
                    </p>
                  </div>
                  <Link href="/admin/global-config">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {universalAttributes.map((attr) => (
                    <div
                      key={attr.key}
                      className="border rounded-lg p-3 bg-card"
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
                      {attr.allowed_values && attr.allowed_values.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {attr.allowed_values.length} values
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category-Specific Attributes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Category-Specific Attributes ({attributes.length})</CardTitle>
                <Button onClick={handleCreateAttribute}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Attribute
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attributes.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No attributes yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add attributes specific to this category
                  </p>
                  <Button onClick={handleCreateAttribute}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Attribute
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
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
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAttribute(attr)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttribute(attr.key)}
                            className="flex-1"
                          >
                            <Trash2 className="w-3 h-3 mr-1 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Attribute-Question Matrix */}
                  {(attributes.length > 0 || questions.length > 0) && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-3">Attribute-Question Mapping</h3>
                      <AttributeQuestionMatrix
                        attributes={attributes}
                        questions={questions}
                        onCreateQuestion={() => handleAddQuestion()}
                        onScrollToQuestion={(qId) => {}}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Alert className="border-purple-200 bg-muted">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm">
              <strong>AI Assistant</strong> can generate additional questions and attributes for this category.
              Describe what information you want to track, and the AI will suggest relevant schema elements.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Generate with AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>What information do you want to track for {category.name}?</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the specific details you want to collect... (e.g., 'Track the intensity, duration, and emotional impact')"
                  rows={4}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleGenerateSchema}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Schema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Results */}
          {generatedSchema && (
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Schema</CardTitle>
                  <Button onClick={handleAddGeneratedItems}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add All to Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedSchema.attributes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Attributes ({generatedSchema.attributes.length})</h3>
                    <div className="space-y-2">
                      {generatedSchema.attributes.map((attr: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {attr.key}
                            </Badge>
                            <span className="font-medium">{attr.display_name}</span>
                            <Badge variant="secondary" className="ml-auto">{attr.data_type}</Badge>
                          </div>
                          {attr.description && (
                            <p className="text-sm text-muted-foreground mt-1">{attr.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedSchema.questions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Questions ({generatedSchema.questions.length})</h3>
                    <div className="space-y-2">
                      {generatedSchema.questions.map((q: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">#{q.priority}</Badge>
                            <Badge variant="secondary">{q.question_type}</Badge>
                            {q.maps_to_attribute && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                → {q.maps_to_attribute}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{q.question_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <QuestionEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        question={editingQuestion}
        categoryId={category.id}
        onSave={handleSaveQuestion}
      />

      <CategoryEditorDialog
        open={isCategoryEditorOpen}
        onOpenChange={setIsCategoryEditorOpen}
        category={category}
      />

      <FullscreenPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        questions={[...universalQuestions, ...questions].filter(q => q.is_active)}
        categoryName={category.name}
      />

      <ApplyTemplateDialog
        open={isApplyTemplateOpen}
        onOpenChange={setIsApplyTemplateOpen}
        categoryId={category.id}
        onApplied={() => {
          router.refresh()
        }}
      />

      {/* Attribute Editor Dialog */}
      <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Key (technical) *</Label>
              <Input
                value={attributeFormData.key}
                onChange={(e) => setAttributeFormData({ ...attributeFormData, key: e.target.value })}
                placeholder="my_attribute"
                disabled={!!editingAttribute}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase with underscores only
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name (EN) *</Label>
                <Input
                  value={attributeFormData.display_name}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, display_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Name (DE)</Label>
                <Input
                  value={attributeFormData.display_name_de}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, display_name_de: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Data Type *</Label>
              <Select
                value={attributeFormData.data_type}
                onValueChange={(value) => setAttributeFormData({ ...attributeFormData, data_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enum">Enum (predefined values)</SelectItem>
                  <SelectItem value="text">Text (free text)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {attributeFormData.data_type === 'enum' && (
              <div>
                <Label>Allowed Values *</Label>
                <div className="space-y-2">
                  {attributeFormData.allowed_values.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={value} disabled className="flex-1 font-mono" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllowedValue(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newAllowedValue}
                      onChange={(e) => setNewAllowedValue(e.target.value)}
                      placeholder="Add value..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedValue())}
                    />
                    <Button onClick={addAllowedValue}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Description</Label>
              <Textarea
                value={attributeFormData.description}
                onChange={(e) => setAttributeFormData({ ...attributeFormData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attributeFormData.is_searchable}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, is_searchable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Searchable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attributeFormData.is_filterable}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, is_filterable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Filterable</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAttributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttribute}>
              {editingAttribute ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
