'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, X, ArrowRight } from 'lucide-react'
import { QuestionType, QuestionOption } from '@/lib/types/admin-questions'

interface FollowUpQuestion {
  trigger_answer?: string | string[] // Specific answer(s) that trigger this follow-up
  trigger_condition?: 'equals' | 'contains' | 'any' // How to match the trigger
  question_text: string
  question_type: QuestionType
  options?: QuestionOption[]
  is_optional?: boolean
  help_text?: string
}

interface FollowUpBuilderProps {
  parentQuestionType: QuestionType
  parentOptions?: QuestionOption[]
  value: FollowUpQuestion | null
  onChange: (value: FollowUpQuestion | null) => void
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

export function FollowUpBuilder({
  parentQuestionType,
  parentOptions = [],
  value,
  onChange,
}: FollowUpBuilderProps) {
  const [enabled, setEnabled] = useState<boolean>(!!value)
  const [triggerCondition, setTriggerCondition] = useState<'equals' | 'contains' | 'any'>(
    value?.trigger_condition || 'equals'
  )
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    Array.isArray(value?.trigger_answer)
      ? value.trigger_answer
      : value?.trigger_answer
      ? [value.trigger_answer]
      : []
  )
  const [questionText, setQuestionText] = useState(value?.question_text || '')
  const [questionType, setQuestionType] = useState<QuestionType>(
    value?.question_type || 'text'
  )
  const [options, setOptions] = useState<QuestionOption[]>(value?.options || [])
  const [isOptional, setIsOptional] = useState(value?.is_optional ?? true)
  const [helpText, setHelpText] = useState(value?.help_text || '')
  const [newOptionLabel, setNewOptionLabel] = useState('')

  // Update parent when any field changes
  useEffect(() => {
    if (!enabled) {
      onChange(null)
    } else if (questionText.trim()) {
      onChange({
        trigger_answer: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        trigger_condition: triggerCondition,
        question_text: questionText,
        question_type: questionType,
        options: (questionType === 'chips' || questionType === 'chips-multi') ? options : undefined,
        is_optional: isOptional,
        help_text: helpText || undefined,
      })
    }
  }, [enabled, triggerCondition, selectedTriggers, questionText, questionType, options, isOptional, helpText])

  const handleToggleEnabled = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      // Reset all fields when disabling
      setSelectedTriggers([])
      setQuestionText('')
      setQuestionType('text')
      setOptions([])
      setIsOptional(true)
      setHelpText('')
    }
  }

  const handleToggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger))
    } else {
      setSelectedTriggers([...selectedTriggers, trigger])
    }
  }

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return

    const newOption: QuestionOption = {
      label: newOptionLabel.trim(),
      value: newOptionLabel.trim().toLowerCase().replace(/\s+/g, '_'),
    }

    setOptions([...options, newOption])
    setNewOptionLabel('')
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  // Check if parent question has options to trigger from
  const canHaveTriggers =
    parentQuestionType === 'chips' ||
    parentQuestionType === 'chips-multi' ||
    parentQuestionType === 'boolean'

  const availableTriggers =
    parentQuestionType === 'boolean'
      ? [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
      : parentOptions

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Follow-Up Question</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Ask a follow-up question based on the user's answer
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggleEnabled} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Trigger Conditions */}
          {canHaveTriggers && availableTriggers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Trigger Condition</Label>
              <Select
                value={triggerCondition}
                onValueChange={(val) => setTriggerCondition(val as any)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">When answer equals</SelectItem>
                  <SelectItem value="contains">When answer contains</SelectItem>
                  <SelectItem value="any">For any answer</SelectItem>
                </SelectContent>
              </Select>

              {triggerCondition !== 'any' && (
                <div className="space-y-2 mt-2">
                  <Label className="text-xs">Trigger on these answers:</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTriggers.map((opt) => {
                      const isSelected = selectedTriggers.includes(opt.value)
                      return (
                        <Badge
                          key={opt.value}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleToggleTrigger(opt.value)}
                        >
                          {opt.label}
                          {isSelected && <ArrowRight className="ml-1 h-3 w-3" />}
                        </Badge>
                      )
                    })}
                  </div>
                  {selectedTriggers.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Select at least one answer to trigger the follow-up
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!canHaveTriggers && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                💡 Follow-up will be shown after any answer (parent question type doesn't have predefined options)
              </p>
            </div>
          )}

          {/* Follow-up Question Text */}
          <div className="space-y-2">
            <Label htmlFor="followup_text" className="text-xs">
              Follow-Up Question <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="followup_text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What would you like to ask as a follow-up?"
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="followup_type" className="text-xs">
              Answer Type
            </Label>
            <Select
              value={questionType}
              onValueChange={(val) => setQuestionType(val as QuestionType)}
            >
              <SelectTrigger className="h-8">
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

          {/* Options Editor (for chips/chips-multi) */}
          {(questionType === 'chips' || questionType === 'chips-multi') && (
            <div className="space-y-2">
              <Label className="text-xs">Answer Options</Label>
              <div className="flex gap-2">
                <Input
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddOption()
                    }
                  }}
                  placeholder="Add option..."
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {options.map((opt, index) => (
                    <Badge key={index} variant="secondary">
                      {opt.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="space-y-2">
            <Label htmlFor="followup_help" className="text-xs">
              Help Text (optional)
            </Label>
            <Input
              id="followup_help"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Additional context..."
              className="h-8 text-sm"
            />
          </div>

          {/* Is Optional */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="followup_optional" className="text-xs">
                Optional
              </Label>
              <p className="text-xs text-muted-foreground">
                Users can skip this follow-up
              </p>
            </div>
            <Switch
              id="followup_optional"
              checked={isOptional}
              onCheckedChange={setIsOptional}
            />
          </div>

          {/* Preview */}
          {questionText && (
            <div className="rounded-lg bg-slate-50 border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview:</p>
              <p className="text-sm font-medium">{questionText}</p>
              {helpText && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {questionType === 'chips' || questionType === 'chips-multi' ? (
                  options.map((opt, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {opt.label}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {questionType}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
