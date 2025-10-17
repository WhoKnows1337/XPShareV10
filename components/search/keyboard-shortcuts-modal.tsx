'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Command, Search, X, ArrowUp, ArrowDown, CornerDownLeft, Info } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Shortcut {
  keys: string[]
  description: string
  icon?: React.ReactNode
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'Search',
    items: [
      {
        keys: ['/'],
        description: 'Focus search input',
        icon: <Search className="h-4 w-4" />,
      },
      {
        keys: ['⌘', 'K'],
        description: 'Quick search (Mac)',
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'K'],
        description: 'Quick search (Windows/Linux)',
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ['Esc'],
        description: 'Clear search / Close dropdown',
        icon: <X className="h-4 w-4" />,
      },
    ],
  },
  {
    category: 'Navigation',
    items: [
      {
        keys: ['↑'],
        description: 'Navigate up in suggestions',
        icon: <ArrowUp className="h-4 w-4" />,
      },
      {
        keys: ['↓'],
        description: 'Navigate down in suggestions',
        icon: <ArrowDown className="h-4 w-4" />,
      },
      {
        keys: ['Enter'],
        description: 'Submit search / Select suggestion',
        icon: <CornerDownLeft className="h-4 w-4" />,
      },
    ],
  },
  {
    category: 'General',
    items: [
      {
        keys: ['?'],
        description: 'Show keyboard shortcuts',
        icon: <Info className="h-4 w-4" />,
      },
    ],
  },
]

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and search faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <div className="text-muted-foreground">{shortcut.icon}</div>
                      )}
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2.5 py-1.5 text-xs font-semibold bg-muted border border-border rounded-md shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">?</kbd> anytime to toggle this help menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
