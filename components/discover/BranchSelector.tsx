'use client'

/**
 * BranchSelector Component
 *
 * Visual branch tree for conversation branching with creation and switching.
 */

import * as React from 'react'
import { GitBranch, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Branch {
  id: string
  chatId: string
  parentMessageId?: string
  branchName: string
  createdAt: Date
  messageCount?: number
  isActive?: boolean
}

interface BranchSelectorProps {
  branches: Branch[]
  currentBranchId?: string
  onBranchSwitch: (branchId: string) => void
  onBranchCreate: (branchName: string, parentMessageId?: string) => Promise<void>
  className?: string
}

export function BranchSelector({
  branches,
  currentBranchId,
  onBranchSwitch,
  onBranchCreate,
  className,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newBranchName, setNewBranchName] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const currentBranch = branches.find((b) => b.id === currentBranchId)
  const otherBranches = branches.filter((b) => b.id !== currentBranchId)

  const handleCreate = async () => {
    if (!newBranchName.trim()) return

    setIsLoading(true)
    try {
      await onBranchCreate(newBranchName.trim())
      setNewBranchName('')
      setIsCreating(false)
    } catch (error) {
      console.error('[BranchSelector] Create failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitch = (branchId: string) => {
    onBranchSwitch(branchId)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
          aria-label="Branch selector"
        >
          <GitBranch className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentBranch?.branchName || 'Main'}
          </span>
          <span className="text-muted-foreground">
            ({branches.length})
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Branches</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
              aria-label="Create new branch"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Branch Form */}
          {isCreating && (
            <div className="border-b p-4 space-y-3 bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="branch-name">New Branch Name</Label>
                <Input
                  id="branch-name"
                  placeholder="feature-branch"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setIsCreating(false)
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newBranchName.trim() || isLoading}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Branch List */}
          <ScrollArea className="max-h-[300px]">
            <div className="p-2">
              {/* Current Branch */}
              {currentBranch && (
                <button
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={() => handleSwitch(currentBranch.id)}
                  aria-label={`Current branch: ${currentBranch.branchName}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium truncate">
                      {currentBranch.branchName}
                    </span>
                  </div>
                  {currentBranch.messageCount !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {currentBranch.messageCount} msgs
                    </span>
                  )}
                </button>
              )}

              {/* Other Branches */}
              {otherBranches.length > 0 && (
                <div className="mt-1 space-y-1">
                  {otherBranches.map((branch) => (
                    <button
                      key={branch.id}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => handleSwitch(branch.id)}
                      aria-label={`Switch to branch: ${branch.branchName}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{branch.branchName}</span>
                      </div>
                      {branch.messageCount !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {branch.messageCount} msgs
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {branches.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No branches yet</p>
                  <p className="text-xs mt-1">Create a branch to explore different conversation paths</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * BranchIndicator - Shows branch count on messages
 */
interface BranchIndicatorProps {
  branchCount: number
  onClick: () => void
  className?: string
}

export function BranchIndicator({ branchCount, onClick, className }: BranchIndicatorProps) {
  if (branchCount === 0) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md',
        'bg-muted hover:bg-muted/80 transition-colors',
        'text-xs text-muted-foreground',
        className
      )}
      aria-label={`${branchCount} branch${branchCount === 1 ? '' : 'es'}`}
    >
      <GitBranch className="h-3 w-3" />
      <span>{branchCount}</span>
    </button>
  )
}
