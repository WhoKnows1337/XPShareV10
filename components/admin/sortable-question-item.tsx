'use client'

import { useState, useEffect } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  GripVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  MessageSquare,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react'

interface SortableQuestionItemProps {
  question: DynamicQuestion
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: (isActive: boolean) => void
  onDuplicate: () => void
}

const questionTypeIcons = {
  chips: MessageSquare,
  'chips-multi': CheckSquare,
  text: MessageSquare,
  boolean: ToggleLeft,
  slider: ToggleLeft,
  date: Calendar,
  time: Clock,
}

const questionTypeColors = {
  chips: 'bg-blue-100 text-blue-700',
  'chips-multi': 'bg-purple-100 text-purple-700',
  text: 'bg-green-100 text-green-700',
  boolean: 'bg-orange-100 text-orange-700',
  slider: 'bg-pink-100 text-pink-700',
  date: 'bg-teal-100 text-teal-700',
  time: 'bg-indigo-100 text-indigo-700',
}

export function SortableQuestionItem({
  question,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
  onDuplicate,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const TypeIcon = questionTypeIcons[question.question_type as keyof typeof questionTypeIcons] || MessageSquare
  const typeColor = questionTypeColors[question.question_type as keyof typeof questionTypeColors] || 'bg-gray-100 text-gray-700'

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-4 ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            className="mt-1 cursor-grab touch-none text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Question Text */}
            <div className="flex items-start gap-2">
              <p className="flex-1 font-medium">{question.question_text}</p>
              {!question.is_optional && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Help Text */}
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}

            {/* Analytics (30 Tage) */}
            {question.analytics && question.analytics.total_shown > 0 && (
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">📊 Analytics (30 Tage):</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground">Antwort-Rate:</span>{' '}
                    <span className="font-medium">{Math.round(question.analytics.answer_rate_percent)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ø Zeit:</span>{' '}
                    <span className="font-medium">{Math.round(question.analytics.avg_time)} Sekunden</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gezeigt:</span>{' '}
                    <span className="font-medium">{question.analytics.total_shown}x</span>
                  </div>
                </div>
                {question.analytics.answer_rate_percent < 70 && (
                  <p className="text-orange-600 font-medium">⚠️ Niedriger als Durchschnitt!</p>
                )}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Question Type */}
              <Badge className={typeColor}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {question.question_type}
              </Badge>

              {/* Priority */}
              <Badge variant="outline" className="text-xs">
                Priority: {question.priority}
              </Badge>

              {/* Tags */}
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}

              {/* Options Count */}
              {(question.question_type === 'chips' ||
                question.question_type === 'chips-multi') &&
                question.options.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {question.options.length} options
                  </Badge>
                )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={question.is_active}
                onCheckedChange={onToggleActive}
              />
              <span className="text-xs text-muted-foreground">
                {question.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Preview Button */}
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit Button */}
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>

            {/* Duplicate Button */}
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
