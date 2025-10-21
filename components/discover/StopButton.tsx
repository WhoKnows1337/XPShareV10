/**
 * Stop Button Component
 *
 * Aborts active streaming requests. Shows only when streaming is active,
 * hides within 100ms after stream completes.
 */

'use client'

import { Button } from '@/components/ui/button'
import { StopCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface StopButtonProps {
  onStop: () => void
  isStreaming: boolean
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function StopButton({
  onStop,
  isStreaming,
  variant = 'destructive',
  size = 'default',
  showLabel = true,
}: StopButtonProps) {
  const [visible, setVisible] = useState(false)

  // Show immediately when streaming starts, hide with 100ms delay when stops
  useEffect(() => {
    if (isStreaming) {
      setVisible(true)
    } else {
      const timeoutId = setTimeout(() => {
        setVisible(false)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isStreaming])

  if (!visible) return null

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onStop}
      disabled={!isStreaming}
      className="transition-opacity duration-100"
      aria-label="Stop generating"
    >
      <StopCircle className="h-4 w-4" />
      {showLabel && <span className="ml-2">Stop</span>}
    </Button>
  )
}

/**
 * Compact version for floating action button
 */
export function FloatingStopButton({ onStop, isStreaming }: { onStop: () => void; isStreaming: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStreaming) {
      setVisible(true)
    } else {
      const timeoutId = setTimeout(() => {
        setVisible(false)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isStreaming])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <Button
        variant="destructive"
        size="lg"
        onClick={onStop}
        disabled={!isStreaming}
        className="rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Stop generating"
      >
        <StopCircle className="h-5 w-5 mr-2" />
        Stop Generating
      </Button>
    </div>
  )
}
