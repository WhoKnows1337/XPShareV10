'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { ChipsQuestion } from './chips-question'
import { ChipsMultiQuestion } from './chips-multi-question'
import { TextQuestion } from './text-question'
import { TextareaQuestion } from './textarea-question'
import { BooleanQuestion } from './boolean-question'
import { SliderQuestion } from './slider-question'
import { DateQuestion } from './date-question'
import { TimeQuestion } from './time-question'
import { DropdownQuestion } from './dropdown-question'
import { DropdownMultiQuestion } from './dropdown-multi-question'
import { ImageSelectQuestion } from './image-select-question'
import { ImageMultiQuestion } from './image-multi-question'
import { RatingQuestion } from './rating-question'
import { ColorQuestion } from './color-question'
import { RangeQuestion } from './range-question'
import { AiTextQuestion } from './ai-text-question'

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
    case 'textarea':
      return <TextareaQuestion {...commonProps} />
    case 'boolean':
      return <BooleanQuestion {...commonProps} />
    case 'slider':
      return <SliderQuestion {...commonProps} />
    case 'date':
      return <DateQuestion {...commonProps} />
    case 'time':
      return <TimeQuestion {...commonProps} />
    case 'dropdown':
      return <DropdownQuestion {...commonProps} />
    case 'dropdown-multi':
      return <DropdownMultiQuestion {...commonProps} />
    case 'image-select':
      return <ImageSelectQuestion {...commonProps} />
    case 'image-multi':
      return <ImageMultiQuestion {...commonProps} />
    case 'rating':
      return <RatingQuestion {...commonProps} />
    case 'color':
      return <ColorQuestion {...commonProps} />
    case 'range':
      return <RangeQuestion {...commonProps} />
    case 'ai-text':
      return <AiTextQuestion {...commonProps} />
    default:
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Unknown question type: {question.question_type}
        </div>
      )
  }
}
