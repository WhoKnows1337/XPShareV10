'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Input } from '@/components/ui/input'

interface ColorQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function ColorQuestion({ question, value, onChange, isPreview }: ColorQuestionProps) {
  const colorValue = (value as string) || '#000000'

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

      {/* Color Picker */}
      <div className="flex items-center gap-4">
        <Input
          type="color"
          value={colorValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={isPreview}
          className="w-20 h-12 cursor-pointer"
        />
        <Input
          type="text"
          value={colorValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={isPreview}
          placeholder="#000000"
          className="flex-1 font-mono"
        />
      </div>

      {/* Color Preview */}
      <div
        className="w-full h-16 rounded-lg border-2"
        style={{ backgroundColor: colorValue }}
      />
    </div>
  )
}
