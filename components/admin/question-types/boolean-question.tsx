'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

interface BooleanQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function BooleanQuestion({
  question,
  value,
  onChange,
  isPreview,
}: BooleanQuestionProps) {
  const boolValue = value as boolean | undefined

  return (
    <div className="space-y-3">
      {/* Question Text */}
      <div className="flex items-start gap-2">
        <h3 className="text-lg font-medium">
          {question.question_text}
          {!question.is_optional && <span className="ml-1 text-red-500">*</span>}
        </h3>
      </div>

      {/* Help Text */}
      {question.help_text && (
        <p className="text-sm text-slate-600">{question.help_text}</p>
      )}

      {/* Yes/No Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant={boolValue === true ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => onChange?.(true)}
          disabled={isPreview}
        >
          <Check className="h-5 w-5" />
          <span>Yes</span>
        </Button>
        <Button
          type="button"
          variant={boolValue === false ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => onChange?.(false)}
          disabled={isPreview}
        >
          <X className="h-5 w-5" />
          <span>No</span>
        </Button>
      </div>
    </div>
  )
}
