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
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'

interface ReportDialogProps {
  experienceId: string
  currentUserId?: string
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'false', label: 'False or fabricated story' },
  { value: 'privacy', label: 'Privacy violation' },
  { value: 'other', label: 'Other' },
]

export function ReportDialog({ experienceId, currentUserId }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!currentUserId) {
      toast.error('You must be logged in to report content')
      return
    }

    if (!reason) {
      toast.error('Please select a reason')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          reason,
          details: details.trim(),
        }),
      })

      if (response.ok) {
        toast.success('Report submitted. Thank you for helping keep our community safe.')
        setOpen(false)
        setReason('')
        setDetails('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Failed to submit report:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Flag className="h-4 w-4" />
          <span>Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this experience</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value} className="font-normal cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !reason}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
