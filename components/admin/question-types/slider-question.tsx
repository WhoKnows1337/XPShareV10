'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

interface SliderQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function SliderQuestion({ question, value, onChange, isPreview }: SliderQuestionProps) {
  // Get min/max from options or use defaults
  const minValue = question.options.find((opt) => opt.value === 'min')?.label || '0'
  const maxValue = question.options.find((opt) => opt.value === 'max')?.label || '10'
  const min = parseInt(minValue, 10)
  const max = parseInt(maxValue, 10)

  const [sliderValue, setSliderValue] = useState<number>(
    typeof value === 'number' ? value : Math.floor((min + max) / 2)
  )

  const handleChange = (newValues: number[]) => {
    const newValue = newValues[0]
    setSliderValue(newValue)
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

      {/* Slider */}
      <div className="space-y-4 pt-2">
        <Slider
          value={[sliderValue]}
          onValueChange={handleChange}
          min={min}
          max={max}
          step={1}
          disabled={isPreview}
          className="w-full"
        />

        {/* Value Display */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{min}</span>
          <span className="rounded-md bg-purple-100 px-3 py-1 font-medium text-purple-700">
            {sliderValue}
          </span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )
}
