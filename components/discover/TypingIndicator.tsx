'use client'

import { Card } from '@/components/ui/card'

/**
 * Typing Indicator Component
 * Animated 3-dot indicator for AI processing state
 * Better UX than static "Analyzing patterns..." text
 */
export function TypingIndicator() {
  return (
    <Card className="px-4 py-3 w-fit max-w-[90%]" role="status" aria-live="polite" aria-label="AI is thinking">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">AI is thinking</span>
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '1s' }}
          />
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '1s' }}
          />
        </div>
      </div>
    </Card>
  )
}
