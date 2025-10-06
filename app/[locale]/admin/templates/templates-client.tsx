'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TemplateEditorDialog } from '@/components/admin/template-editor-dialog'
import { Plus, FileText, Trash2, Copy, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  return (
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
  )
}
