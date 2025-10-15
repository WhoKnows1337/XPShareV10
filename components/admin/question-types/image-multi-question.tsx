'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Check } from 'lucide-react'
import Image from 'next/image'

interface ImageMultiQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function ImageMultiQuestion({ question, value, onChange, isPreview }: ImageMultiQuestionProps) {
  const options = question.options || []
  const selectedValues = (value as string[]) || []

  const handleToggle = (optionValue: string) => {
    const newValue = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]
    onChange?.(newValue)
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

      {/* Image Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              disabled={isPreview}
              className={`relative rounded-lg border-2 overflow-hidden transition-all disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-primary shadow-md'
                  : 'border-border hover:border-primary/60'
              }`}
            >
              {option.image_url && (
                <div className="relative aspect-square">
                  <Image
                    src={option.image_url}
                    alt={option.label}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-2 bg-card">
                <p className="text-sm font-medium text-center">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {option.description}
                  </p>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selection Count */}
      {selectedValues.length > 0 && (
        <p className="text-sm text-slate-500">
          {selectedValues.length} {selectedValues.length === 1 ? 'Option' : 'Optionen'} ausgewählt
        </p>
      )}
    </div>
  )
}
