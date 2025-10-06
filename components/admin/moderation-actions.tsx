'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ModerationActionsProps {
  reportId: string
  experienceId: string
}

export function ModerationActions({ reportId, experienceId }: ModerationActionsProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (action: 'approve' | 'dismiss' | 'delete') => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          experienceId,
          action,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        toast.success(
          action === 'delete'
            ? 'Experience deleted'
            : action === 'dismiss'
            ? 'Report dismissed'
            : 'Report resolved'
        )
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to process action')
      }
    } catch (error) {
      console.error('Moderation action error:', error)
      toast.error('Failed to process action')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add admin notes (optional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[60px]"
        maxLength={500}
      />

      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAction('delete')}
          disabled={isProcessing}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Experience
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('dismiss')}
          disabled={isProcessing}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Dismiss Report
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction('approve')}
          disabled={isProcessing}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Keep & Resolve
        </Button>
      </div>
    </div>
  )
}
