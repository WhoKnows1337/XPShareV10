'use client'

/**
 * Search 5.0 - Conversation History Sidebar
 *
 * Displays conversation history with:
 * - Previous turns (queries + pattern summaries)
 * - Click to view previous results
 * - Clear history action
 * - Collapsible UI
 *
 * @see docs/masterdocs/search5.md (Part 4.2 - Multi-Turn Conversation)
 */

import React, { useState } from 'react'
import {
  MessageSquare,
  Trash2,
  ChevronRight,
  Clock,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react'
import { useConversation, useConversationStats } from './conversation-context'
import { ConversationTurn } from '@/types/search5'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

// ============================================================================
// TYPES
// ============================================================================

interface ConversationHistoryProps {
  /**
   * Callback when user selects a previous turn
   */
  onSelectTurn?: (turn: ConversationTurn) => void

  /**
   * Mobile mode (full screen sheet)
   */
  mobile?: boolean

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConversationHistory({
  onSelectTurn,
  mobile = false,
  className
}: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { history, clearHistory, hasHistory } = useConversation()
  const stats = useConversationStats()

  // Don't render if no history
  if (!hasHistory) {
    return null
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectTurn = (turn: ConversationTurn) => {
    onSelectTurn?.(turn)
    setIsOpen(false)
  }

  const handleClearHistory = () => {
    clearHistory()
    setIsOpen(false)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={mobile ? 'icon' : 'default'}
          className={cn('relative', className)}
        >
          <MessageSquare className={cn('h-4 w-4', !mobile && 'mr-2')} />
          {!mobile && <span>Verlauf</span>}

          {/* Turn count badge */}
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {stats.turnCount}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side={mobile ? 'bottom' : 'right'}
        className={cn(
          'flex flex-col',
          mobile ? 'h-[80vh]' : 'w-[400px]'
        )}
      >
        {/* Header */}
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Konversationsverlauf</SheetTitle>

            {/* Clear History Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Verlauf löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle {stats.turnCount} Turns
                    mit {stats.totalPatterns} Patterns werden gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive">
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <SheetDescription>
            {stats.turnCount} {stats.turnCount === 1 ? 'Turn' : 'Turns'} • {' '}
            {stats.totalPatterns} Patterns • {' '}
            {stats.totalSources} Quellen
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Konfidenz Ø
            </div>
            <div className="text-lg font-semibold">{stats.avgConfidence}%</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Pattern-Typen
            </div>
            <div className="text-lg font-semibold">{stats.patternTypes.length}</div>
          </div>
        </div>

        {/* Explored Categories */}
        {stats.exploredCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Erkundete Kategorien:</p>
            <div className="flex flex-wrap gap-2">
              {stats.exploredCategories.map(category => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Conversation Timeline */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {history.map((turn, index) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                index={index}
                totalTurns={history.length}
                onSelect={() => handleSelectTurn(turn)}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// TURN CARD COMPONENT
// ============================================================================

interface TurnCardProps {
  turn: ConversationTurn
  index: number
  totalTurns: number
  onSelect: () => void
}

function TurnCard({ turn, index, totalTurns, onSelect }: TurnCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isLatest = index === totalTurns - 1
  const patternCount = turn.response.patterns?.length || 0
  const sourceCount = turn.response.sources?.length || 0
  const confidence = turn.response.metadata.confidence

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(turn.timestamp), {
    addSuffix: true,
    locale: de
  })

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 transition-all cursor-pointer',
        'hover:border-primary/50 hover:shadow-md',
        isLatest && 'border-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      {/* Turn Number & Timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={isLatest ? 'default' : 'secondary'} className="text-xs">
            Turn {index + 1}
          </Badge>
          {isLatest && (
            <Badge variant="outline" className="text-xs">
              Aktuell
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </div>
      </div>

      {/* Query */}
      <div className="mb-3">
        <p className="text-sm font-medium line-clamp-2">
          {turn.query}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {patternCount} {patternCount === 1 ? 'Pattern' : 'Patterns'}
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {sourceCount} Quellen
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono">{confidence}%</span>
          Konfidenz
        </div>
      </div>

      {/* Patterns Preview */}
      {patternCount > 0 && (
        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
            Patterns anzeigen
          </button>

          {isExpanded && (
            <div className="space-y-1 pl-5">
              {turn.response.patterns?.slice(0, 3).map((pattern, i) => (
                <div key={i} className="text-xs">
                  <Badge variant="outline" className="text-xs mr-2">
                    {pattern.type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {pattern.title}
                  </span>
                </div>
              ))}
              {patternCount > 3 && (
                <p className="text-xs text-muted-foreground pl-1">
                  +{patternCount - 3} weitere
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Refinements */}
      {turn.refinements && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Mit Filtern: {' '}
            {turn.refinements.confidenceThreshold && `Konfidenz ${turn.refinements.confidenceThreshold}%`}
            {turn.refinements.categories && ` • ${turn.refinements.categories.length} Kategorien`}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPACT VERSION (for mobile/inline use)
// ============================================================================

export function ConversationHistoryCompact({ className }: { className?: string }) {
  const { history, hasHistory } = useConversation()
  const stats = useConversationStats()

  if (!hasHistory) {
    return null
  }

  return (
    <div className={cn('bg-muted/30 rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Konversation</h4>
        </div>
        <Badge variant="secondary">{stats.turnCount} Turns</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{stats.totalPatterns} Patterns</span>
        <span>•</span>
        <span>{stats.avgConfidence}% Ø Konfidenz</span>
      </div>

      {history.length > 0 && (
        <div className="mt-3 space-y-2">
          {history.slice(-2).map((turn, index) => (
            <div key={turn.id} className="text-xs text-muted-foreground">
              <span className="font-medium">Turn {history.length - 1 + index}:</span>{' '}
              {turn.query.substring(0, 60)}
              {turn.query.length > 60 && '...'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
