'use client'

/**
 * BranchButton - Create branch from a specific message
 */

import * as React from 'react'
import { GitBranch } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BranchButtonProps {
  messageId: string
  onBranchCreate: (messageId: string, branchName: string) => Promise<void>
  className?: string
}

export function BranchButton({ messageId, onBranchCreate, className }: BranchButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [branchName, setBranchName] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleCreate = async () => {
    if (!branchName.trim()) return

    setIsLoading(true)
    try {
      await onBranchCreate(messageId, branchName.trim())
      setBranchName('')
      setIsOpen(false)
    } catch (error) {
      console.error('[BranchButton] Create failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Create branch from this message"
        >
          <GitBranch className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Branch</DialogTitle>
          <DialogDescription>
            Start a new conversation branch from this message. You can explore different directions
            without affecting the main conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Branch Name</Label>
            <Input
              id="branch-name"
              placeholder="e.g., alternative-approach"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setIsOpen(false)
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!branchName.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
