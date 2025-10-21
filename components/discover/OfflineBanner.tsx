'use client'

/**
 * OfflineBanner Component
 *
 * Shows connection status and pending message queue count.
 */

import * as React from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OfflineBannerProps {
  isOnline: boolean
  queueCount?: number
  onSync?: () => void
  className?: string
}

export function OfflineBanner({ isOnline, queueCount = 0, onSync, className }: OfflineBannerProps) {
  const [isSyncing, setIsSyncing] = React.useState(false)

  const handleSync = async () => {
    if (!onSync || isSyncing) return

    setIsSyncing(true)
    try {
      await onSync()
    } finally {
      setIsSyncing(false)
    }
  }

  // Don't show banner if online and no queue
  if (isOnline && queueCount === 0) return null

  return (
    <div
      className={cn(
        'px-4 py-2 flex items-center justify-between border-b transition-colors',
        isOnline ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}

        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium',
            isOnline ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
          )}>
            {isOnline ? 'Back online' : 'You\'re offline'}
          </span>

          {queueCount > 0 && (
            <>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {queueCount} {queueCount === 1 ? 'message' : 'messages'} queued
              </span>
            </>
          )}
        </div>
      </div>

      {isOnline && queueCount > 0 && onSync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="gap-2"
          aria-label="Sync pending messages"
        >
          <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
          <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
        </Button>
      )}
    </div>
  )
}

/**
 * ConnectionIndicator - Minimal indicator for navbar
 */
interface ConnectionIndicatorProps {
  isOnline: boolean
  className?: string
}

export function ConnectionIndicator({ isOnline, className }: ConnectionIndicatorProps) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="status"
      aria-label={isOnline ? 'Online' : 'Offline'}
    >
      {isOnline ? (
        <Wifi className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-amber-500" />
      )}
    </div>
  )
}
