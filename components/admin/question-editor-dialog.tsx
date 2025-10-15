'use client'

import { useState, useEffect } from 'react'
import { DynamicQuestion, QuestionType, QuestionOption } from '@/lib/types/admin-questions'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, X, Monitor, Smartphone, Sparkles, Link2, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { QuestionPreview } from './question-preview'
import { OptionsEditor } from './options-editor'

interface AttributeSchema {
  key: string
  display_name: string
  display_name_de?: string
  data_type: string
  category_slug?: string
}

interface QuestionEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: DynamicQuestion | null
  categoryId: string | null  // null = Universal Question
  onSave: () => void
}

const questionTypes: QuestionType[] = [
  'chips',
  'chips-multi',
  'text',
  'textarea',
  'boolean',
  'slider',
  'date',
  'time',
  'dropdown',
  'dropdown-multi',
  'image-select',
  'image-multi',
  'rating',
  'color',
  'range',
  'ai-text',
]

export function QuestionEditorDialog({
  open,
  onOpenChange,
  question,
  categoryId,
  onSave,
}: QuestionEditorDialogProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  // Form state
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('text')
  const [options, setOptions] = useState<QuestionOption[]>([])
  const [priority, setPriority] = useState(1)
  const [helpText, setHelpText] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [isOptional, setIsOptional] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [mapsToAttribute, setMapsToAttribute] = useState<string>('')

  // Attribute schema
  const [availableAttributes, setAvailableAttributes] = useState<AttributeSchema[]>([])
  const [loadingAttributes, setLoadingAttributes] = useState(false)

  // Load available attributes
  useEffect(() => {
    async function loadAttributes() {
      setLoadingAttributes(true)
      try {
        const response = await fetch('/api/admin/attributes')
        if (response.ok) {
          const data = await response.json()
          setAvailableAttributes(data.attributes || [])
        }
      } catch (error) {
        console.error('Failed to load attributes:', error)
      } finally {
        setLoadingAttributes(false)
      }
    }
    loadAttributes()
  }, [])

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text)
      setQuestionType(question.question_type)
      setOptions(question.options || [])
      setPriority(question.priority || 1)
      setHelpText(question.help_text || '')
      setPlaceholder(question.placeholder || '')
      setIsOptional(question.is_optional)
      setIsActive(question.is_active)
      setMapsToAttribute((question as any).maps_to_attribute || '__none__')
    } else {
      // Reset for new question
      setQuestionText('')
      setQuestionType('text')
      setOptions([])
      setPriority(1)
      setHelpText('')
      setPlaceholder('')
      setIsOptional(true)
      setIsActive(true)
      setMapsToAttribute('__none__')
    }
  }, [question])

  // Create preview question object
  const previewQuestion: DynamicQuestion = {
    id: question?.id || 'preview',
    category_id: categoryId,
    question_text: questionText || 'Your question text here...',
    question_type: questionType,
    options,
    priority: question?.priority || 1,
    is_optional: isOptional,
    help_text: helpText || null,
    placeholder: placeholder || null,
    conditional_logic: {},
    follow_up_question: null,
    tags: [],
    is_active: isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
  }

  const handleSave = async () => {
    if (!questionText.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const body = {
        category_id: categoryId,
        question_text: questionText,
        question_type: questionType,
        options,
        priority,
        is_optional: isOptional,
        help_text: helpText || null,
        placeholder: placeholder || null,
        is_active: isActive,
        maps_to_attribute: mapsToAttribute && mapsToAttribute !== '__none__' ? mapsToAttribute : null,
      }

      const url = question
        ? `/api/admin/questions/${question.id}`
        : '/api/admin/questions'

      const method = question ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save question')
      }

      toast({
        title: 'Success',
        description: question
          ? 'Question updated successfully'
          : 'Question created successfully',
      })

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save question',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  console.log('QuestionEditorDialog render - open:', open, 'question:', question?.id)

  const isUniversal = categoryId === null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {question ? 'Edit Question' : 'Create New Question'}
            {isUniversal && (
              <Badge variant="default" className="ml-2">
                🌍 Universal
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Left: Editor */}
          <div className="space-y-4">
            {/* Universal Question Info */}
            {isUniversal && (
              <Alert className="border-blue-200 bg-blue-50">
                <Globe className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                  This is a <strong>Universal Question</strong> and will be shown for ALL categories.
                </AlertDescription>
              </Alert>
            )}
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question_text">
                Question Text <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="question_text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What would you like to ask?"
                rows={3}
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor="question_type">
                Question Type <span className="text-red-500">*</span>
              </Label>
              <Select value={questionType} onValueChange={(val) => setQuestionType(val as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Reorder questions using drag-and-drop in the category page
              </p>
            </div>

            {/* Options Editor (for chips/dropdowns/sliders/images/ratings) */}
            {(questionType === 'chips' ||
              questionType === 'chips-multi' ||
              questionType === 'slider' ||
              questionType === 'dropdown' ||
              questionType === 'dropdown-multi' ||
              questionType === 'image-select' ||
              questionType === 'image-multi' ||
              questionType === 'rating' ||
              questionType === 'color') && (
              <OptionsEditor
                questionType={questionType}
                options={options}
                onChange={setOptions}
              />
            )}

            {/* Help Text */}
            <div className="space-y-2">
              <Label htmlFor="help_text">Help Text</Label>
              <Textarea
                id="help_text"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Additional context or instructions"
                rows={2}
              />
            </div>

            {/* Placeholder */}
            {(questionType === 'text' || questionType === 'textarea' || questionType === 'ai-text') && (
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {/* Is Optional */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_optional">Optional Question</Label>
                <p className="text-sm text-muted-foreground">
                  Users can skip this question
                </p>
              </div>
              <Switch
                id="is_optional"
                checked={isOptional}
                onCheckedChange={setIsOptional}
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Show this question to users
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Attribute Mapping */}
            <div className="rounded-lg border border-blue-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-medium">Attribute Mapping</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Link this question to a structured attribute for pattern analysis
              </p>

              <div className="space-y-2">
                <Label htmlFor="maps_to_attribute">Maps to Attribute</Label>
                <Select
                  value={mapsToAttribute}
                  onValueChange={setMapsToAttribute}
                  disabled={loadingAttributes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {availableAttributes.map((attr) => (
                      <SelectItem key={attr.key} value={attr.key}>
                        {attr.display_name} ({attr.key})
                        {attr.category_slug && (
                          <span className="text-xs text-muted-foreground ml-2">
                            · {attr.category_slug}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Mapping Preview */}
              {mapsToAttribute && mapsToAttribute !== '__none__' &&
               (questionType === 'chips' || questionType === 'chips-multi' ||
                questionType === 'dropdown' || questionType === 'dropdown-multi' ||
                questionType === 'image-select' || questionType === 'image-multi') &&
               options.length > 0 && (
                <div className="rounded border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                  <h4 className="font-medium text-sm text-blue-900">Value Mapping Preview</h4>
                  <p className="text-xs text-blue-700">
                    Question options will be auto-mapped to lowercase canonical values
                  </p>
                  <div className="space-y-1 mt-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-gray-700">{opt.label}</span>
                        <span className="text-gray-400">→</span>
                        <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono text-xs">
                          {opt.value.toLowerCase().replace(/\s+/g, '_')}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mapsToAttribute && mapsToAttribute !== '__none__' && (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {questionType === 'ai-text'
                      ? 'AI will extract this attribute from user\'s free-text answer'
                      : 'Smart-Filtering: Question hidden if AI detects this attribute in text'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Question'}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-4">
            {/* Preview Header with Device Toggle */}
            <div className="flex items-center justify-between rounded-lg border bg-muted px-4 py-2">
              <h3 className="text-sm font-semibold text-foreground">
                🎨 Live Preview
              </h3>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  type="button"
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>

            {/* Preview Container with responsive width */}
            <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
              <div
                className={`transition-all ${
                  previewMode === 'mobile' ? 'max-w-md w-full' : 'w-full'
                }`}
              >
                <QuestionPreview question={previewQuestion} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
