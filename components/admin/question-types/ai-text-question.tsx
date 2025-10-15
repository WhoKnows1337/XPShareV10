'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface AiTextQuestionProps {
  question: DynamicQuestion
  value?: unknown
  onChange?: (value: unknown) => void
  isPreview?: boolean
}

export function AiTextQuestion({ question, value, onChange, isPreview }: AiTextQuestionProps) {
  const textValue = (value as string) || ''

  return (
    <div className="space-y-3">
      {/* Question Text */}
      <div className="flex items-start gap-2">
        <h3 className="text-lg font-medium">
          {question.question_text}
          {!question.is_optional && <span className="ml-1 text-red-500">*</span>}
        </h3>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI
        </Badge>
      </div>

      {/* Help Text */}
      {question.help_text && (
        <p className="text-sm text-slate-600">{question.help_text}</p>
      )}

      {/* AI-Enhanced Textarea */}
      <div className="relative">
        <Textarea
          value={textValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={question.placeholder || 'Beschreibe deine Erfahrung... (KI wird diese Antwort analysieren)'}
          rows={6}
          disabled={isPreview}
          className="resize-y border-primary/50 focus:border-primary"
        />
        <div className="absolute bottom-2 right-2 text-xs text-slate-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>AI-analyzed</span>
        </div>
      </div>

      {/* Character Count */}
      {textValue.length > 0 && (
        <p className="text-sm text-slate-500">{textValue.length} characters</p>
      )}

      {/* AI Notice */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-slate-600">
          💡 Diese Antwort wird von KI analysiert, um automatisch Attribute zu extrahieren und Muster zu erkennen.
        </p>
      </div>
    </div>
  )
}
