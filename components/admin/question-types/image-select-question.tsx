'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { QuestionOption } from '@/lib/types/admin-questions'
import { Check } from 'lucide-react'
import Image from 'next/image'

interface ImageSelectQuestionProps {
  question: string
  options: QuestionOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  helpText?: string
  multiple?: boolean
}

export function ImageSelectQuestion({
  question,
  options,
  value,
  onChange,
  helpText,
  multiple = false,
}: ImageSelectQuestionProps) {
  const selectedValues = Array.isArray(value) ? value : [value]

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : []
      const newValue = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue]
      onChange(newValue)
    } else {
      onChange(optionValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-base">{question}</Label>
      {helpText && <p className="text-sm text-text-secondary">{helpText}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-observatory-accent shadow-md'
                  : 'border-glass-border hover:border-glass-border/60'
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

              <div className="p-2 bg-glass-bg">
                <p className="text-sm font-medium text-center">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-text-tertiary text-center mt-1">
                    {option.description}
                  </p>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-observatory-accent rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
