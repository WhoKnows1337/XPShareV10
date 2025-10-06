'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface ChipsMultiQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function ChipsMultiQuestion({
  question,
  value,
  onChange,
  isPreview,
}: ChipsMultiQuestionProps) {
  const selectedValues = (value as string[]) || []

  const toggleValue = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]

    onChange?.(newValues)
  }

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

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selectedValues.includes(option.value)

          return (
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => toggleValue(option.value)}
              disabled={isPreview}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </Button>
          )
        })}
      </div>

      {/* Selected Count */}
      {selectedValues.length > 0 && (
        <p className="text-sm text-slate-500">
          {selectedValues.length} {selectedValues.length === 1 ? 'option' : 'options'} selected
        </p>
      )}
    </div>
  )
}
