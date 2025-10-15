'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Input } from '@/components/ui/input'

interface RangeQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function RangeQuestion({ question, value, onChange, isPreview }: RangeQuestionProps) {
  const rangeValue = (value as { min?: number; max?: number }) || {}
  const minValue = rangeValue.min || 0
  const maxValue = rangeValue.max || 100

  const handleMinChange = (newMin: number) => {
    onChange?.({ ...rangeValue, min: newMin })
  }

  const handleMaxChange = (newMax: number) => {
    onChange?.({ ...rangeValue, max: newMax })
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

      {/* Range Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Minimum</label>
          <Input
            type="number"
            value={minValue}
            onChange={(e) => handleMinChange(parseInt(e.target.value) || 0)}
            disabled={isPreview}
            placeholder="Min"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Maximum</label>
          <Input
            type="number"
            value={maxValue}
            onChange={(e) => handleMaxChange(parseInt(e.target.value) || 0)}
            disabled={isPreview}
            placeholder="Max"
          />
        </div>
      </div>

      {/* Range Display */}
      {(minValue || maxValue) && (
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700">
            Range: <span className="font-semibold">{minValue}</span> bis{' '}
            <span className="font-semibold">{maxValue}</span>
          </p>
        </div>
      )}
    </div>
  )
}
