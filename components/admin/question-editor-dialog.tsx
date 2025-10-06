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
import { QuestionPreview } from './question-preview'
import { OptionsEditor } from './options-editor'
import { ConditionalLogicBuilder } from './conditional-logic-builder'
import { FollowUpBuilder } from './follow-up-builder'
import { Save, X, ChevronDown, ChevronUp, Monitor, Smartphone, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuestionEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: DynamicQuestion | null
  categoryId: string
  onSave: () => void
}

const questionTypes: QuestionType[] = [
  'chips',
  'chips-multi',
  'text',
  'boolean',
  'slider',
  'date',
  'time',
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
  const [helpText, setHelpText] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [isOptional, setIsOptional] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [conditionalLogic, setConditionalLogic] = useState<any>({})
  const [followUpQuestion, setFollowUpQuestion] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiAdaptive, setAIAdaptive] = useState(false)
  const [adaptiveConditions, setAdaptiveConditions] = useState<any>({})

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text)
      setQuestionType(question.question_type)
      setOptions(question.options || [])
      setHelpText(question.help_text || '')
      setPlaceholder(question.placeholder || '')
      setIsOptional(question.is_optional)
      setTags(question.tags || [])
      setIsActive(question.is_active)
      setConditionalLogic(question.conditional_logic || {})
      setFollowUpQuestion(question.follow_up_question || null)
      setAIAdaptive((question as any).ai_adaptive || false)
      setAdaptiveConditions((question as any).adaptive_conditions || {})
    } else {
      // Reset for new question
      setQuestionText('')
      setQuestionType('text')
      setOptions([])
      setHelpText('')
      setPlaceholder('')
      setIsOptional(true)
      setTags([])
      setTagInput('')
      setIsActive(true)
      setConditionalLogic({})
      setFollowUpQuestion(null)
      setShowAdvanced(false)
      setAIAdaptive(false)
      setAdaptiveConditions({})
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
    conditional_logic: conditionalLogic,
    follow_up_question: null,
    tags,
    is_active: isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
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
        is_optional: isOptional,
        help_text: helpText || null,
        placeholder: placeholder || null,
        tags,
        is_active: isActive,
        conditional_logic: conditionalLogic,
        follow_up_question: followUpQuestion,
        ai_adaptive: aiAdaptive,
        adaptive_conditions: adaptiveConditions,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Create New Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Left: Editor */}
          <div className="space-y-4">
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
            </div>

            {/* Options Editor (for chips/chips-multi/slider) */}
            {(questionType === 'chips' ||
              questionType === 'chips-multi' ||
              questionType === 'slider') && (
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
            {questionType === 'text' && (
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

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags..."
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Section */}
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between"
              >
                <span>Advanced Options</span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <ConditionalLogicBuilder
                    value={conditionalLogic}
                    onChange={setConditionalLogic}
                  />
                  <FollowUpBuilder
                    parentQuestionType={questionType}
                    parentOptions={options}
                    value={followUpQuestion}
                    onChange={setFollowUpQuestion}
                  />

                  {/* AI-Adaptive Configuration */}
                  <div className="rounded-lg border border-purple-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <Label className="text-base font-medium">AI-Adaptive Follow-Ups</Label>
                      </div>
                      <Switch checked={aiAdaptive} onCheckedChange={setAIAdaptive} />
                    </div>

                    {aiAdaptive && (
                      <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                          Configure when AI should generate intelligent follow-up questions
                        </p>

                        <div className="space-y-2">
                          <Label className="text-sm">Max Follow-Up Questions</Label>
                          <Input
                            type="number"
                            min={1}
                            max={3}
                            value={adaptiveConditions.max_questions || 1}
                            onChange={(e) =>
                              setAdaptiveConditions({
                                ...adaptiveConditions,
                                max_questions: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Min Answer Length (optional)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 50 characters"
                            value={adaptiveConditions.min_answer_length || ''}
                            onChange={(e) =>
                              setAdaptiveConditions({
                                ...adaptiveConditions,
                                min_answer_length: parseInt(e.target.value) || undefined,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Only generate if answer is longer than this
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
            <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-4 py-2">
              <h3 className="text-sm font-semibold text-slate-700">
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
            <div className="flex justify-center rounded-lg border bg-slate-100 p-4">
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
