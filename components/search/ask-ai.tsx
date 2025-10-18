'use client'

/**
 * AskAI Component - Wrapper around AskAIStream
 *
 * This component maintains backward compatibility while using
 * the new AI SDK streaming implementation under the hood.
 *
 * For new code, consider using AskAIStream directly.
 */

import { AskAIStream } from './ask-ai-stream'

interface AskAIProps {
  initialQuestion?: string
  onQuestionChange?: (question: string) => void
  hideInput?: boolean // Hide the input field (when used with external search bar)
  autoSubmit?: boolean // Auto-submit when initialQuestion changes (only for hideInput mode)
  filters?: {
    category?: string
    tags?: string
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }
}

/**
 * Backward-compatible wrapper around AskAIStream
 * Simply delegates to the new streaming implementation
 */
export function AskAI({ initialQuestion = '', onQuestionChange, hideInput = false, autoSubmit = true, filters }: AskAIProps) {
  return (
    <AskAIStream
      initialQuestion={initialQuestion}
      onQuestionChange={onQuestionChange}
      hideInput={hideInput}
      autoSubmit={autoSubmit}
      filters={filters}
    />
  )
}
