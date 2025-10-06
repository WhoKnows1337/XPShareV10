'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { ChipsQuestion } from './chips-question'
import { ChipsMultiQuestion } from './chips-multi-question'
import { TextQuestion } from './text-question'
import { BooleanQuestion } from './boolean-question'
import { SliderQuestion } from './slider-question'
import { DateQuestion } from './date-question'
import { TimeQuestion } from './time-question'

interface QuestionTypeRendererProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function QuestionTypeRenderer({
  question,
  value,
  onChange,
  isPreview = false,
}: QuestionTypeRendererProps) {
  const commonProps = {
    question,
    value,
    onChange,
    isPreview,
  }

  switch (question.question_type) {
    case 'chips':
      return <ChipsQuestion {...commonProps} />
    case 'chips-multi':
      return <ChipsMultiQuestion {...commonProps} />
    case 'text':
      return <TextQuestion {...commonProps} />
    case 'boolean':
      return <BooleanQuestion {...commonProps} />
    case 'slider':
      return <SliderQuestion {...commonProps} />
    case 'date':
      return <DateQuestion {...commonProps} />
    case 'time':
      return <TimeQuestion {...commonProps} />
    default:
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Unknown question type: {question.question_type}
        </div>
      )
  }
}
