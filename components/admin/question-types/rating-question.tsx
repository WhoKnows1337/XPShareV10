'use client'

import { useState } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Star } from 'lucide-react'

interface RatingQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function RatingQuestion({ question, value, onChange, isPreview }: RatingQuestionProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const currentRating = typeof value === 'number' ? value : (value ? parseInt(value as string) : 0)
  const maxRating = 5

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

      {/* Star Rating */}
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange?.(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={isPreview}
            className="p-1 hover:scale-110 transition-transform disabled:cursor-not-allowed"
          >
            <Star
              className={`w-8 h-8 ${
                rating <= (hoveredRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {currentRating > 0 && (
        <p className="text-sm text-slate-500">
          {currentRating} von {maxRating} Sternen
        </p>
      )}
    </div>
  )
}
