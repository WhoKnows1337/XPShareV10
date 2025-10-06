'use client'

import { DynamicQuestion } from '@/lib/types/admin-questions'
import { QuestionTypeRenderer } from './question-types/question-type-renderer'
import { Card } from '@/components/ui/card'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface QuestionPreviewProps {
  question: DynamicQuestion
  isFullscreen?: boolean
}

export function QuestionPreview({ question, isFullscreen = false }: QuestionPreviewProps) {
  const [previewValue, setPreviewValue] = useState<unknown>(null)

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-8'
          : ''
      }`}
    >
      <Card
        className={`${
          isFullscreen ? 'max-w-3xl' : 'w-full'
        } overflow-hidden border-2 border-purple-200 bg-white shadow-lg`}
      >
        {/* Preview Header */}
        <div className="flex items-center gap-2 border-b bg-purple-50 px-4 py-3">
          <Eye className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Live Preview</h3>
          <span className="ml-auto rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
            {question.question_type}
          </span>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <QuestionTypeRenderer
            question={question}
            value={previewValue}
            onChange={setPreviewValue}
            isPreview={false}
          />

          {/* Metadata */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Required:</span>
              <span className="font-medium">
                {question.is_optional ? 'No' : 'Yes'}
              </span>
            </div>
            {question.tags.length > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-slate-600">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Value Display */}
        {previewValue !== null && (
          <div className="border-t bg-slate-50 px-6 py-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Current Value:</h4>
            <pre className="rounded-md bg-slate-800 p-3 text-sm text-green-400">
              {JSON.stringify(previewValue, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
