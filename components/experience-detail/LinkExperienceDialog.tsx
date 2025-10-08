'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { linkExperiences } from '@/app/actions/experience'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LinkExperienceDialogProps {
  experienceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkExperienceDialog({
  experienceId,
  open,
  onOpenChange,
}: LinkExperienceDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [targetExperienceId, setTargetExperienceId] = useState('')

  const handleLink = async () => {
    if (!targetExperienceId.trim()) {
      toast.error('Please enter an experience ID or URL')
      return
    }

    // Extract ID from URL if a full URL was pasted
    let experienceIdToLink = targetExperienceId.trim()
    const urlMatch = experienceIdToLink.match(/experiences\/([a-f0-9-]+)/)
    if (urlMatch) {
      experienceIdToLink = urlMatch[1]
    }

    startTransition(async () => {
      const result = await linkExperiences(experienceId, experienceIdToLink)

      if (result.success) {
        toast.success('Experience linked successfully!')
        setTargetExperienceId('')
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to link experience')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Similar Experience</DialogTitle>
          <DialogDescription>
            Connect this experience with another one that was witnessed or experienced together.
            Enter the experience ID or paste the full URL.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="experience-id">Experience ID or URL</Label>
            <Input
              id="experience-id"
              placeholder="e.g., abc-123-def or https://xpshare.com/experiences/abc-123-def"
              value={targetExperienceId}
              onChange={(e) => setTargetExperienceId(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={isPending}>
            {isPending ? 'Linking...' : 'Link Experience'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
