'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TextareaQuestionProps {
  question: string
  value: string
  onChange: (value: string) => void
  helpText?: string
  placeholder?: string
}

export function TextareaQuestion({
  question,
  value,
  onChange,
  helpText,
  placeholder,
}: TextareaQuestionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base">{question}</Label>
      {helpText && <p className="text-sm text-text-secondary">{helpText}</p>}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Deine Antwort..."}
        rows={5}
        className="resize-y"
      />
    </div>
  )
}
