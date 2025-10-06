'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'

interface DateQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function DateQuestion({ question, value, onChange, isPreview }: DateQuestionProps) {
  const dateValue = (value as string) || ''

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

      {/* Date Input */}
      <div className="relative">
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={isPreview}
          className="pr-10"
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}
