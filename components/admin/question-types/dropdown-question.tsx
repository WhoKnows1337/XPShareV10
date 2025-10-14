'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionOption } from '@/lib/types/admin-questions'

interface DropdownQuestionProps {
  question: string
  options: QuestionOption[]
  value: string
  onChange: (value: string) => void
  helpText?: string
  placeholder?: string
}

export function DropdownQuestion({
  question,
  options,
  value,
  onChange,
  helpText,
  placeholder,
}: DropdownQuestionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base">{question}</Label>
      {helpText && <p className="text-sm text-text-secondary">{helpText}</p>}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || "Auswählen..."} />
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
