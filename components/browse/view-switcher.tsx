'use client'

import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Map, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'cards' | 'list' | 'map' | 'timeline'

interface ViewSwitcherProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewSwitcher({ currentView, onViewChange, className }: ViewSwitcherProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Cards' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
    { mode: 'map', icon: <Map className="h-4 w-4" />, label: 'Map' },
    { mode: 'timeline', icon: <Clock className="h-4 w-4" />, label: 'Timeline' },
  ]

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {views.map((view) => (
        <Button
          key={view.mode}
          variant={currentView === view.mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(view.mode)}
          className={cn(
            'flex items-center gap-2 px-3',
            currentView === view.mode && 'shadow-sm'
          )}
          aria-label={`Switch to ${view.label} view`}
          aria-pressed={currentView === view.mode}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  )
}
