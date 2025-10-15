'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DropdownQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function DropdownQuestion({ question, value, onChange, isPreview }: DropdownQuestionProps) {
  const stringValue = (value as string) || ''
  const options = question.options || []

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

      {/* Dropdown Select */}
      <Select
        value={stringValue}
        onValueChange={(val) => onChange?.(val)}
        disabled={isPreview}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={question.placeholder || "Auswählen..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
