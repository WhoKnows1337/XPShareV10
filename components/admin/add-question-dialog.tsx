'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react'
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

export function AddQuestionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [category, setCategory] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!questionText.trim() || !category) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: questionText.trim(),
          category,
          order_index: parseInt(orderIndex) || 0,
          is_active: true,
        }),
      })

      if (response.ok) {
        toast.success('Question added successfully')
        setOpen(false)
        setQuestionText('')
        setCategory('')
        setOrderIndex('0')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add question')
      }
    } catch (error) {
      console.error('Add question error:', error)
      toast.error('Failed to add question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for a specific category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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
            <Label htmlFor="question">Question Text</Label>
            <Input
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., What color were the lights?"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order Index</Label>
            <Input
              id="order"
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
