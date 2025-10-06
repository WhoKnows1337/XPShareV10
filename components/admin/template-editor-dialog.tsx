'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { QuestionType } from '@/lib/types/admin-questions'

interface QuestionTemplate {
  id?: string
  name: string
  description: string | null
  category_id: string | null
  questions: TemplateQuestion[]
}

interface TemplateQuestion {
  question_text: string
  question_type: QuestionType
  options?: any[]
  is_optional?: boolean
  help_text?: string | null
  placeholder?: string | null
  tags?: string[]
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: QuestionTemplate | null
  categories: Category[]
  onSave: () => void
}

const QUESTION_TYPES: QuestionType[] = [
  'text',
  'chips',
  'chips-multi',
  'boolean',
  'slider',
  'date',
  'time',
]

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  categories,
  onSave,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>('none')
  const [questions, setQuestions] = useState<TemplateQuestion[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
      setCategoryId(template.category_id || 'none')
      setQuestions(template.questions || [])
    } else {
      setName('')
      setDescription('')
      setCategoryId('none')
      setQuestions([])
    }
  }, [template])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_optional: true,
        tags: [],
      },
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setQuestions(
      questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    )
  }

  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive',
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one question is required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const url = template
        ? `/api/admin/templates/${template.id}`
        : '/api/admin/templates'
      const method = template ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category_id: categoryId === 'none' ? null : categoryId,
          questions,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save template')
      }

      toast({
        title: 'Success',
        description: `Template ${template ? 'updated' : 'created'} successfully`,
      })

      onSave()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name *</Label>
            <Input
              id="template_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard UFO Sighting Questions"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template_description">Description</Label>
            <Textarea
              id="template_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              rows={2}
            />
          </div>

          {/* Category (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="category">Default Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Questions ({questions.length})</Label>
              <Button type="button" size="sm" onClick={handleAddQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    {/* Question Text */}
                    <Input
                      value={question.question_text}
                      onChange={(e) =>
                        handleUpdateQuestion(index, 'question_text', e.target.value)
                      }
                      placeholder="Question text"
                    />

                    {/* Question Type */}
                    <Select
                      value={question.question_type}
                      onValueChange={(value) =>
                        handleUpdateQuestion(index, 'question_type', value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Help Text */}
                    <Input
                      value={question.help_text || ''}
                      onChange={(e) =>
                        handleUpdateQuestion(index, 'help_text', e.target.value)
                      }
                      placeholder="Help text (optional)"
                      className="text-sm"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No questions yet. Click "Add Question" to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate} disabled={isSaving}>
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
