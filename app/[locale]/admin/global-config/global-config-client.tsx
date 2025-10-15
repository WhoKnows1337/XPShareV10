'use client'

import { useState } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionEditorDialog } from '@/components/admin/question-editor-dialog'
import { DraggableQuestionList } from '@/components/admin/draggable-question-list'
import { ArrowLeft, Plus, Globe, Info, Tag, HelpCircle, Database } from 'lucide-react'
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
import { Trash2, Edit2 } from 'lucide-react'

interface AttributeSchema {
  key: string
  display_name: string
  display_name_de: string | null
  display_name_fr: string | null
  display_name_es: string | null
  category_slug: string | null
  data_type: string
  allowed_values: string[] | null
  description: string | null
  is_searchable: boolean
  is_filterable: boolean
  sort_order: number
}

interface GlobalConfigClientProps {
  initialQuestions: DynamicQuestion[]
  attributes: AttributeSchema[]
}

export function GlobalConfigClient({
  initialQuestions,
  attributes: initialAttributes,
}: GlobalConfigClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [attributes, setAttributes] = useState(initialAttributes)
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<DynamicQuestion | null>(null)
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<AttributeSchema | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Attribute form state
  const [attributeFormData, setAttributeFormData] = useState({
    key: '',
    display_name: '',
    display_name_de: '',
    display_name_fr: '',
    display_name_es: '',
    data_type: 'enum',
    allowed_values: [] as string[],
    description: '',
    is_searchable: true,
    is_filterable: true,
    sort_order: 999,
  })
  const [newAllowedValue, setNewAllowedValue] = useState('')

  const handleReorderQuestions = async (questionIds: string[]) => {
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

  const handleEditQuestion = (question: DynamicQuestion) => {
    setEditingQuestion(question)
    setIsQuestionEditorOpen(true)
  }

  const handleDeleteQuestion = async (questionId: string) => {
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

  const handleToggleActiveQuestion = async (questionId: string, isActive: boolean) => {
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
    setIsQuestionEditorOpen(true)
  }

  const handleSaveQuestion = async () => {
    setIsQuestionEditorOpen(false)
    setEditingQuestion(null)

    // Refresh questions list
    const res = await fetch('/api/admin/questions?category_id=universal')
    if (res.ok) {
      const { data } = await res.json()
      setQuestions(data)
    }

    router.refresh()
  }

  const handleCreateAttribute = () => {
    setEditingAttribute(null)
    setAttributeFormData({
      key: '',
      display_name: '',
      display_name_de: '',
      display_name_fr: '',
      display_name_es: '',
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
      display_name_de: attribute.display_name_de || '',
      display_name_fr: attribute.display_name_fr || '',
      display_name_es: attribute.display_name_es || '',
      data_type: attribute.data_type,
      allowed_values: attribute.allowed_values || [],
      description: attribute.description || '',
      is_searchable: attribute.is_searchable,
      is_filterable: attribute.is_filterable,
      sort_order: attribute.sort_order,
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
          category_slug: null, // Universal attributes
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

      // Refresh attributes
      const res = await fetch('/api/admin/attributes')
      if (res.ok) {
        const { attributes: allAttrs } = await res.json()
        const universalAttrs = allAttrs.filter((a: AttributeSchema) => !a.category_slug)
        setAttributes(universalAttrs)
      }
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
    if (!confirm(`Are you sure you want to delete attribute "${key}"? This affects ALL categories.`)) {
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

      setAttributes(attributes.filter((a) => a.key !== key))
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      {/* Title Card */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Global Configuration</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage universal questions and attributes that apply to ALL categories
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-muted">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>Universal Configuration</strong> applies to every experience submission, regardless of category.
          Universal questions are shown BEFORE category-specific questions. Universal attributes are always tracked.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Universal Questions</div>
              <div className="text-xs text-muted-foreground mt-1">
                {questions.filter(q => q.is_active).length} active
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{attributes.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Universal Attributes</div>
              <div className="text-xs text-muted-foreground mt-1">
                {attributes.filter(a => a.is_filterable).length} filterable
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="attributes">
            <Database className="mr-2 h-4 w-4" />
            Attributes ({attributes.length})
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddQuestion} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Universal Question
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
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
                  categoryId={null}
                  onReorder={handleReorderQuestions}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                  onToggleActive={handleToggleActiveQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateAttribute}>
              <Plus className="mr-2 h-4 w-4" />
              Add Universal Attribute
            </Button>
          </div>

          {attributes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No universal attributes yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create attributes that will be tracked for ALL experiences
                  </p>
                  <Button onClick={handleCreateAttribute}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Attribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Key</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Values</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attributes.map((attr) => (
                    <tr key={attr.key} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{attr.key}</td>
                      <td className="px-4 py-3 text-sm">{attr.display_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {attr.data_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {attr.allowed_values ? `${attr.allowed_values.length} values` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAttribute(attr)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttribute(attr.key)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={isQuestionEditorOpen}
        onOpenChange={setIsQuestionEditorOpen}
        question={editingQuestion}
        categoryId={null} // Universal questions
        onSave={handleSaveQuestion}
      />

      {/* Attribute Editor Dialog */}
      <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Edit Universal Attribute' : 'Create Universal Attribute'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Key */}
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

            {/* Display Names */}
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
              <div>
                <Label>Display Name (FR)</Label>
                <Input
                  value={attributeFormData.display_name_fr}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, display_name_fr: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Name (ES)</Label>
                <Input
                  value={attributeFormData.display_name_es}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, display_name_es: e.target.value })}
                />
              </div>
            </div>

            {/* Data Type */}
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

            {/* Allowed Values (for enum) */}
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

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={attributeFormData.description}
                onChange={(e) => setAttributeFormData({ ...attributeFormData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            {/* Options */}
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
