'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DropdownMultiQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function DropdownMultiQuestion({ question, value, onChange, isPreview }: DropdownMultiQuestionProps) {
  const arrayValue = (value as string[]) || []
  const options = question.options || []

  const handleAdd = (newValue: string) => {
    if (!arrayValue.includes(newValue)) {
      onChange?.([...arrayValue, newValue])
    }
  }

  const handleRemove = (valueToRemove: string) => {
    onChange?.(arrayValue.filter((v) => v !== valueToRemove))
  }

  const availableOptions = options.filter(opt => !arrayValue.includes(opt.value))

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

      {/* Selected Values */}
      {arrayValue.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {arrayValue.map((val) => {
            const option = options.find(opt => opt.value === val)
            return (
              <Badge key={val} variant="secondary" className="flex items-center gap-1">
                {option?.icon && <span>{option.icon}</span>}
                <span>{option?.label || val}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemove(val)}
                  disabled={isPreview}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Dropdown for adding more */}
      {availableOptions.length > 0 && (
        <Select onValueChange={handleAdd} disabled={isPreview}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={question.placeholder || "Weitere auswählen..."} />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
