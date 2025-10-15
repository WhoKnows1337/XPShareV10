'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { QuestionTypeRenderer } from './question-types/question-type-renderer'
import { Card } from '@/components/ui/card'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface QuestionPreviewProps {
  question: DynamicQuestion
  isFullscreen?: boolean
  value?: unknown
  onChange?: (value: unknown) => void
}

export function QuestionPreview({
  question,
  isFullscreen = false,
  value: controlledValue,
  onChange: controlledOnChange
}: QuestionPreviewProps) {
  const [internalValue, setInternalValue] = useState<unknown>(null)

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined && controlledOnChange !== undefined
  const previewValue = isControlled ? controlledValue : internalValue
  const setPreviewValue = isControlled ? controlledOnChange : setInternalValue

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-8'
          : ''
      }`}
    >
      <Card
        className={`${
          isFullscreen ? 'max-w-3xl' : 'w-full'
        } overflow-hidden border-2 border-primary/20 bg-card shadow-lg`}
      >
        {/* Preview Header */}
        <div className="flex items-center gap-2 border-b bg-muted px-4 py-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Preview</h3>
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {question.question_type}
          </span>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <QuestionTypeRenderer
            question={question}
            value={previewValue}
            onChange={setPreviewValue}
            isPreview={false}
          />

          {/* Metadata */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Required:</span>
              <span className="font-medium text-foreground">
                {question.is_optional ? 'No' : 'Yes'}
              </span>
            </div>
            {question.tags.length > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Value Display */}
        {previewValue !== null && (
          <div className="border-t bg-muted/50 px-6 py-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">Current Value:</h4>
            <pre className="rounded-md bg-slate-800 p-3 text-sm text-green-400 dark:bg-slate-900">
              {JSON.stringify(previewValue, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
