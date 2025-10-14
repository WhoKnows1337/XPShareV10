'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link2, AlertTriangle, Plus, ChevronRight } from 'lucide-react'
import { DynamicQuestion } from '@/lib/types/admin-questions'

interface Attribute {
  key: string
  display_name: string
  display_name_de?: string
  data_type: string
  is_filterable: boolean
  is_searchable: boolean
}

interface AttributeQuestionMatrixProps {
  attributes: Attribute[]
  questions: DynamicQuestion[]
  onCreateQuestion?: (attributeKey: string) => void
  onScrollToQuestion?: (questionId: string) => void
}

export function AttributeQuestionMatrix({
  attributes,
  questions,
  onCreateQuestion,
  onScrollToQuestion,
}: AttributeQuestionMatrixProps) {
  // Build mapping of attributes to questions
  const attributeMap = new Map<string, DynamicQuestion[]>()
  const unmappedAttributes: Attribute[] = []

  // Initialize map with all attributes
  attributes.forEach((attr) => {
    attributeMap.set(attr.key, [])
  })

  // Map questions to attributes
  questions.forEach((question) => {
    if (question.maps_to_attribute && attributeMap.has(question.maps_to_attribute)) {
      attributeMap.get(question.maps_to_attribute)!.push(question)
    }
  })

  // Find unmapped attributes
  attributes.forEach((attr) => {
    if (attributeMap.get(attr.key)?.length === 0) {
      unmappedAttributes.push(attr)
    }
  })

  const mappedAttributes = attributes.filter(
    (attr) => (attributeMap.get(attr.key)?.length ?? 0) > 0
  )

  const mappedCount = mappedAttributes.length
  const unmappedCount = unmappedAttributes.length
  const totalAttributes = attributes.length
  const coveragePercent = totalAttributes > 0 ? Math.round((mappedCount / totalAttributes) * 100) : 0

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Attribute Mappings Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {mappedCount}/{totalAttributes} mapped
          </Badge>
          <Badge
            variant={coveragePercent >= 80 ? 'default' : coveragePercent >= 50 ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {coveragePercent}% coverage
          </Badge>
        </div>
      </div>

      {/* Mapped Attributes */}
      {mappedAttributes.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground">Mapped Attributes</h4>
          {mappedAttributes.map((attr) => {
            const mappedQuestions = attributeMap.get(attr.key) || []
            return (
              <div
                key={attr.key}
                className="border rounded-lg p-3 space-y-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">
                    {attr.key}
                  </Badge>
                  <span className="text-sm font-medium">
                    {attr.display_name_de || attr.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({attr.data_type})
                  </span>
                  {attr.is_filterable && (
                    <Badge variant="outline" className="text-xs">
                      filterable
                    </Badge>
                  )}
                </div>

                {/* Mapped Questions */}
                <div className="ml-4 space-y-1">
                  {mappedQuestions.map((question, idx) => (
                    <button
                      key={question.id}
                      onClick={() => onScrollToQuestion?.(question.id)}
                      className="flex items-center gap-2 text-sm text-left w-full hover:bg-muted/50 rounded px-2 py-1 transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">Q{idx + 1}:</span>
                      <span className="flex-1 line-clamp-1">{question.question_text}</span>
                      {question.is_active ? (
                        <Badge variant="outline" className="text-xs bg-green-50">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          Inactive
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Unmapped Attributes Warning */}
      {unmappedAttributes.length > 0 && (
        <div className="border border-orange-200 rounded-lg bg-orange-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="text-sm font-semibold text-orange-900">
              Unmapped Attributes ({unmappedCount})
            </h4>
          </div>
          <p className="text-sm text-orange-700">
            These attributes have no questions mapped to them. Users cannot provide data for these attributes.
          </p>

          <div className="space-y-2">
            {unmappedAttributes.map((attr) => (
              <div
                key={attr.key}
                className="flex items-center justify-between bg-white rounded border border-orange-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {attr.key}
                  </Badge>
                  <span className="text-sm">
                    {attr.display_name_de || attr.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({attr.data_type})
                  </span>
                </div>
                {onCreateQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateQuestion(attr.key)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Question
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {attributes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No attributes configured for this category yet.</p>
          <p className="text-xs mt-1">
            Add attributes in the Attribute Schema page to enable structured data collection.
          </p>
        </div>
      )}

      {/* All Mapped Success State */}
      {attributes.length > 0 && unmappedAttributes.length === 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            ✓
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">
              All attributes mapped!
            </p>
            <p className="text-xs text-green-700">
              Every attribute has at least one question collecting data.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
