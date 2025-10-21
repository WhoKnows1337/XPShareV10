/**
 * Keyboard Shortcuts Modal
 *
 * Displays all available keyboard shortcuts.
 * Platform-aware (shows Cmd on Mac, Ctrl on Windows/Linux).
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatShortcut, type KeyboardShortcut } from '@/lib/hooks/useKeyboardShortcuts'

export interface ShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: KeyboardShortcut[]
}

export function ShortcutsModal({ open, onOpenChange, shortcuts }: ShortcutsModalProps) {
  // Group shortcuts by category
  const categories = {
    'General': shortcuts.filter(s => ['k', 'n', '/'].includes(s.key)),
    'Message': shortcuts.filter(s => ['Enter'].includes(s.key)),
    'Navigation': shortcuts.filter(s => ['Escape'].includes(s.key)),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(categories).map(([category, categoryShortcuts]) => {
            if (categoryShortcuts.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {formatShortcut(shortcut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          Press <Badge variant="outline" className="mx-1">?</Badge> or{' '}
          <Badge variant="outline" className="mx-1">{formatShortcut({ key: '/', ctrl: true })}</Badge>{' '}
          to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  )
}
