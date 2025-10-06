'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'ufo', label: 'UFO' },
  { value: 'paranormal', label: 'Paranormal' },
  { value: 'synchronicity', label: 'Synchronicity' },
  { value: 'nde', label: 'NDE' },
  { value: 'psychic', label: 'Psychic' },
  { value: 'supernatural', label: 'Supernatural' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'time_anomaly', label: 'Time Anomaly' },
  { value: 'other', label: 'Other' },
]

interface Question {
  id: string
  question_text: string
  category: string
  is_active: boolean
  order_index: number
}

interface EditQuestionDialogProps {
  question: Question
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditQuestionDialog({ question, open, onOpenChange }: EditQuestionDialogProps) {
  const router = useRouter()
  const [questionText, setQuestionText] = useState(question.question_text)
  const [category, setCategory] = useState(question.category)
  const [orderIndex, setOrderIndex] = useState(question.order_index.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setQuestionText(question.question_text)
    setCategory(question.category)
    setOrderIndex(question.order_index.toString())
  }, [question])

  const handleSubmit = async () => {
    if (!questionText.trim() || !category) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: questionText.trim(),
          category,
          order_index: parseInt(orderIndex) || 0,
        }),
      })

      if (response.ok) {
        toast.success('Question updated successfully')
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Update question error:', error)
      toast.error('Failed to update question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Modify the question text, category, or order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-question">Question Text</Label>
            <Input
              id="edit-question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., What color were the lights?"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-order">Order Index</Label>
            <Input
              id="edit-order"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
