'use client'

import { useState } from 'react'
import { QuestionData, AttributeData } from '../wizard-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Edit2, Check, X, Link2, MoveUp, MoveDown } from 'lucide-react'

interface StepQuestionsProps {
  questions: QuestionData[]
  attributes: AttributeData[]
  onUpdate: (questions: QuestionData[]) => void
}

const QUESTION_TYPES = [
  'chips',
  'chips-multi',
  'text',
  'textarea',
  'boolean',
  'dropdown',
  'dropdown-multi',
  'slider',
  'rating',
  'date',
  'time',
]

export function StepQuestions({ questions, attributes, onUpdate }: StepQuestionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<QuestionData | null>(null)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...questions[index] })
  }

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return

    const updated = [...questions]
    updated[editingIndex] = editForm
    onUpdate(updated)
    setEditingIndex(null)
    setEditForm(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditForm(null)
  }

  const handleDelete = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    // Re-prioritize
    updated.forEach((q, i) => {
      q.priority = i + 1
    })
    onUpdate(updated)
  }

  const handleAdd = () => {
    const newQuestion: QuestionData = {
      question_text: '',
      question_type: 'text',
      priority: questions.length + 1,
      is_optional: true,
      options: [],
    }
    onUpdate([...questions, newQuestion])
    setEditingIndex(questions.length)
    setEditForm(newQuestion)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...questions]
    ;[updated[index], updated[index - 1]] = [updated[index - 1], updated[index]]
    // Update priorities
    updated.forEach((q, i) => {
      q.priority = i + 1
    })
    onUpdate(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return
    const updated = [...questions]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    // Update priorities
    updated.forEach((q, i) => {
      q.priority = i + 1
    })
    onUpdate(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Generated Questions ({questions.length})</h3>
        <p className="text-sm text-muted-foreground">
          Review and customize the questions users will answer. Questions can be linked to attributes for
          smart-filtering (only shown if AI didn't extract the info).
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <Card key={index} className="relative">
            {editingIndex === index && editForm ? (
              // Edit Mode
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Question Text (German)</Label>
                  <Textarea
                    value={editForm.question_text}
                    onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                    placeholder="What would you like to ask?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={editForm.question_type}
                      onValueChange={(val) => setEditForm({ ...editForm, question_type: val })}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label>Maps to Attribute</Label>
                    <Select
                      value={editForm.maps_to_attribute || '__none__'}
                      onValueChange={(val) =>
                        setEditForm({ ...editForm, maps_to_attribute: val === '__none__' ? undefined : val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {attributes.map((attr) => (
                          <SelectItem key={attr.key} value={attr.key}>
                            {attr.display_name} ({attr.key})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Options Editor (for chips/dropdown) */}
                {(editForm.question_type === 'chips' ||
                  editForm.question_type === 'chips-multi' ||
                  editForm.question_type === 'dropdown' ||
                  editForm.question_type === 'dropdown-multi') && (
                  <div className="space-y-2">
                    <Label>Options (one per line: label=value)</Label>
                    <Textarea
                      value={editForm.options?.map((opt) => `${opt.label}=${opt.value}`).join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter((l) => l.trim())
                        const options = lines.map((line) => {
                          const [label, value] = line.split('=')
                          return { label: label?.trim() || '', value: value?.trim() || label?.trim() || '' }
                        })
                        setEditForm({ ...editForm, options })
                      }}
                      rows={4}
                      placeholder="Ja=yes&#10;Nein=no&#10;Vielleicht=maybe"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Help Text</Label>
                    <Input
                      value={editForm.help_text || ''}
                      onChange={(e) => setEditForm({ ...editForm, help_text: e.target.value })}
                      placeholder="Additional context..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={editForm.placeholder || ''}
                      onChange={(e) => setEditForm({ ...editForm, placeholder: e.target.value })}
                      placeholder="Type your answer..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label>Optional Question (can be skipped)</Label>
                  <Switch
                    checked={editForm.is_optional}
                    onCheckedChange={(val) => setEditForm({ ...editForm, is_optional: val })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} size="sm">
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              // View Mode
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{question.priority}
                      </Badge>
                      <Badge variant="secondary">{question.question_type}</Badge>
                      {!question.is_optional && <Badge variant="destructive">Required</Badge>}
                      {question.maps_to_attribute && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {question.maps_to_attribute}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{question.question_text}</CardTitle>
                    {question.options && question.options.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Options:</span>
                        {question.options.map((opt, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {opt.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === questions.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            )}
          </Card>
        ))}
      </div>

      {/* Add New Button */}
      <Button onClick={handleAdd} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Custom Question
      </Button>

      {questions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No questions generated. Go back and provide an AI prompt.</p>
        </div>
      )}
    </div>
  )
}
