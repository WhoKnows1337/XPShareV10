'use client'

import { useState, useEffect } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableQuestionItem } from './sortable-question-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface DraggableQuestionListProps {
  questions: DynamicQuestion[]
  categoryId: string
  onReorder: (questionIds: string[]) => Promise<void>
  onEdit: (question: DynamicQuestion) => void
  onDelete: (questionId: string) => void
  onToggleActive: (questionId: string, isActive: boolean) => void
  onAddQuestion: () => void
}

export function DraggableQuestionList({
  questions: initialQuestions,
  categoryId,
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
  onAddQuestion,
}: DraggableQuestionListProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fix hydration mismatch for @dnd-kit
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update questions when prop changes
  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)

      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      setQuestions(newQuestions)

      // Call API to update order
      await onReorder(newQuestions.map((q) => q.id))
    }
  }

  const handleSelectToggle = (questionId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)))
    }
  }

  const handleBulkOperation = async (operation: string, updates?: any) => {
    try {
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          question_ids: Array.from(selectedIds),
          updates,
        }),
      })

      if (!res.ok) throw new Error('Bulk operation failed')

      const { count } = await res.json()

      toast({
        title: 'Success',
        description: `${operation} applied to ${count} question(s)`,
      })

      setSelectedIds(new Set())
      setShowTagInput(false)
      setNewTag('')
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

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} question(s)?`)) {
      return
    }
    await handleBulkOperation('delete')
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tag',
        variant: 'destructive',
      })
      return
    }
    await handleBulkOperation('add-tags', { tags: [newTag.trim()] })
  }

  const handleDuplicate = async (questionId: string) => {
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/duplicate`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to duplicate question')

      const { data } = await res.json()

      toast({
        title: 'Success',
        description: 'Question duplicated successfully',
      })

      router.refresh()
    } catch (error) {
      console.error('Duplicate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate question',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            Questions ({questions.length})
          </h3>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedIds.size === questions.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          <Button onClick={onAddQuestion} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
            <span className="text-sm font-medium">Bulk Actions:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('activate')}
            >
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('deactivate')}
            >
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagInput(!showTagInput)}
            >
              Add Tag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('set-optional')}
            >
              Set Optional
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('set-required')}
            >
              Set Required
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const selectedQuestions = questions.filter(q => selectedIds.has(q.id))
                const blob = new Blob([JSON.stringify(selectedQuestions, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `questions-${new Date().toISOString()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (confirm('This will renumber all question priorities from 1, 2, 3... Continue?')) {
                  const reorderedIds = questions.map(q => q.id)
                  await onReorder(reorderedIds)
                }
              }}
            >
              Renumber Priorities
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </div>
          {showTagInput && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
              <Input
                placeholder="Enter tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag()
                  }
                }}
                className="max-w-xs"
              />
              <Button size="sm" onClick={handleAddTag}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagInput(false)
                  setNewTag('')
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No questions yet. Click "Add Question" to create one.
          </p>
        </div>
      ) : !isMounted ? (
        <div className="space-y-2">
          {questions.map((question) => (
            <div key={question.id} className="rounded-lg border p-4 animate-pulse">
              <div className="h-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {questions.map((question) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  isSelected={selectedIds.has(question.id)}
                  onSelect={() => handleSelectToggle(question.id)}
                  onEdit={() => onEdit(question)}
                  onDelete={() => onDelete(question.id)}
                  onToggleActive={(isActive) => onToggleActive(question.id, isActive)}
                  onDuplicate={() => handleDuplicate(question.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
