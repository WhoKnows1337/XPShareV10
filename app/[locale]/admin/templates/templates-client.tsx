'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TemplateEditorDialog } from '@/components/admin/template-editor-dialog'
import { Plus, FileText, Trash2, Copy, Upload, Download, TrendingUp, Search, CheckSquare, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
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
  DialogDescription,
} from '@/components/ui/dialog'

interface QuestionTemplate {
  id: string
  name: string
  description: string | null
  category_id: string | null
  questions: any[]
  created_at: string
  created_by: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface TemplatesClientProps {
  templates: QuestionTemplate[]
  categories: Category[]
}

export function TemplatesClient({ templates: initialTemplates, categories }: TemplatesClientProps) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<QuestionTemplate | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  const handleAdd = () => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }

  const handleEdit = (template: QuestionTemplate) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete template')

      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      })

      setTemplates(templates.filter((t) => t.id !== templateId))
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicate = async (template: QuestionTemplate) => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          category_id: template.category_id,
          questions: template.questions,
        }),
      })

      if (!res.ok) throw new Error('Failed to duplicate template')

      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      })

      router.refresh()
    } catch (error) {
      console.error('Duplicate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      })
    }
  }

  const handleApply = async (templateId: string, categoryId: string) => {
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId }),
      })

      if (!res.ok) throw new Error('Failed to apply template')

      const { data } = await res.json()

      toast({
        title: 'Success',
        description: `Applied template and created ${data.length} questions`,
      })

      router.refresh()
    } catch (error) {
      console.error('Apply error:', error)
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    setIsEditorOpen(false)
    setEditingTemplate(null)
    router.refresh()

    // Refresh templates list
    const res = await fetch('/api/admin/templates')
    if (res.ok) {
      const { data } = await res.json()
      setTemplates(data)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)

      // Validate JSON structure
      if (!jsonData.name || !jsonData.questions || !Array.isArray(jsonData.questions)) {
        throw new Error('Invalid template format. Expected: { name, description, questions: [...] }')
      }

      const res = await fetch('/api/admin/templates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to import template')
      }

      toast({
        title: 'Success',
        description: `Template "${jsonData.name}" imported successfully`,
      })

      router.refresh()

      // Refresh templates list
      const refreshRes = await fetch('/api/admin/templates')
      if (refreshRes.ok) {
        const { data } = await refreshRes.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import template',
        variant: 'destructive',
      })
    }

    // Reset file input
    event.target.value = ''
  }

  // Bulk Operations Handlers
  const handleToggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
  }

  const handleSelectAllCategories = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(categories.map(c => c.id)))
    }
  }

  const handleBulkOperation = async (operation: string) => {
    if (selectedCategories.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one category',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          category_ids: Array.from(selectedCategories),
        }),
      })

      if (!res.ok) throw new Error('Bulk operation failed')

      const { count } = await res.json()

      toast({
        title: 'Success',
        description: `Operation "${operation}" applied to ${count} question(s) across ${selectedCategories.size} categor${selectedCategories.size === 1 ? 'y' : 'ies'}`,
      })

      router.refresh()
    } catch (error) {
      console.error('Bulk operation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to perform bulk operation',
        variant: 'destructive',
      })
    }
  }

  const handleExportCategories = async () => {
    if (selectedCategories.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one category',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/admin/categories/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_ids: Array.from(selectedCategories),
        }),
      })

      if (!res.ok) throw new Error('Export failed')

      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `categories-export-${new Date().toISOString()}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: `Exported ${selectedCategories.size} categor${selectedCategories.size === 1 ? 'y' : 'ies'}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export categories',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Question Templates</h2>
          <p className="text-muted-foreground">
            Save and reuse question sets across categories
          </p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
              </span>
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            categories={categories}
            onEdit={() => handleEdit(template)}
            onDelete={() => handleDelete(template.id)}
            onApply={handleApply}
            onDuplicate={() => handleDuplicate(template)}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Create your first question template to get started
            </p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Separator */}
      <div className="border-t my-8"></div>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Perform operations on multiple categories at once
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Select Categories:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllCategories}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                {selectedCategories.size === categories.length
                  ? 'Deselect All'
                  : `Select All (${categories.length})`}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.has(category.id)}
                    onCheckedChange={() => handleToggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </label>
                </div>
              ))}
            </div>

            {selectedCategories.size > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedCategories.size} categor{selectedCategories.size === 1 ? 'y' : 'ies'} selected
              </div>
            )}
          </div>

          {/* Actions for Selected Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Actions for Selected Categories:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('activate-all')}
                disabled={selectedCategories.size === 0}
              >
                Activate All Questions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('deactivate-all')}
                disabled={selectedCategories.size === 0}
              >
                Deactivate All Questions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('renumber-priorities')}
                disabled={selectedCategories.size === 0}
              >
                Renumber Priorities (1, 2, 3...)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCategories}
                disabled={selectedCategories.size === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
            </div>
          </div>

          {/* Question Operations */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">Question Operations:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('find-duplicates')}
                disabled={selectedCategories.size === 0}
              >
                <Search className="mr-2 h-4 w-4" />
                Find & Clean Duplicates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('find-unused')}
                disabled={selectedCategories.size === 0}
              >
                <Search className="mr-2 h-4 w-4" />
                Find Unused Questions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedCategories.size > 0) {
                    const categoryParam = Array.from(selectedCategories).join(',')
                    window.location.href = `/admin/analytics?categories=${categoryParam}`
                  }
                }}
                disabled={selectedCategories.size === 0}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={editingTemplate}
        categories={categories}
        onSave={handleSave}
      />
    </div>
  )
}

function TemplateCard({
  template,
  categories,
  onEdit,
  onDelete,
  onApply,
  onDuplicate,
}: {
  template: QuestionTemplate
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onApply: (templateId: string, categoryId: string) => void
  onDuplicate?: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {template.questions.length} questions
            </Badge>
            <p className="text-xs text-muted-foreground">
              {new Date(template.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Preview Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-3 w-3" />
            Preview Questions
          </Button>

          {/* Apply to Category */}
          <div className="space-y-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="w-full"
              disabled={!selectedCategory}
              onClick={() => onApply(template.id, selectedCategory)}
            >
              <Copy className="mr-2 h-3 w-3" />
              Apply to Category
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              Edit
            </Button>
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{template.name}</DialogTitle>
            <DialogDescription>
              {template.description || 'Preview all questions in this template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {template.questions.map((question, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">
                      {index + 1}. {question.question_text}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {question.question_type}
                    </Badge>
                  </div>
                  {question.help_text && (
                    <p className="text-xs text-muted-foreground">{question.help_text}</p>
                  )}
                  {question.options && question.options.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Options:</p>
                      <div className="flex flex-wrap gap-1">
                        {question.options.map((opt: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {typeof opt === 'string' ? opt : opt.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {question.is_optional && <Badge variant="outline" className="text-xs">Optional</Badge>}
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex gap-1">
                        {question.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
