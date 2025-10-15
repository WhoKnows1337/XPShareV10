'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Textarea } from '@/components/ui/textarea'

interface TextareaQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function TextareaQuestion({ question, value, onChange, isPreview }: TextareaQuestionProps) {
  const textValue = (value as string) || ''

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

      {/* Textarea Input */}
      <Textarea
        value={textValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={question.placeholder || "Deine Antwort..."}
        rows={5}
        disabled={isPreview}
        className="resize-y"
      />

      {/* Character Count */}
      {textValue.length > 0 && (
        <p className="text-sm text-slate-500">{textValue.length} characters</p>
      )}
    </div>
  )
}
