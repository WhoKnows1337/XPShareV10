'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'

interface RatingQuestionProps {
  question: string
  value: string
  onChange: (value: string) => void
  helpText?: string
  maxRating?: number
}

export function RatingQuestion({
  question,
  value,
  onChange,
  helpText,
  maxRating = 5,
}: RatingQuestionProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const currentRating = parseInt(value) || 0

  return (
    <div className="space-y-2">
      <Label className="text-base">{question}</Label>
      {helpText && <p className="text-sm text-text-secondary">{helpText}</p>}

      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating.toString())}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            className="p-1 hover:scale-110 transition-transform"
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
        <p className="text-sm text-text-tertiary">
          {currentRating} von {maxRating} Sternen
        </p>
      )}
    </div>
  )
}
