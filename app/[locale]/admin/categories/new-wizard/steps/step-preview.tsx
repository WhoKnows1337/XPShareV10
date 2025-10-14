'use client'

import { CategoryData, AttributeData, QuestionData } from '../wizard-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, HelpCircle, Eye } from 'lucide-react'

interface StepPreviewProps {
  category: CategoryData
  attributes: AttributeData[]
  questions: QuestionData[]
}

export function StepPreview({ category, attributes, questions }: StepPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview Your Category
        </h3>
        <p className="text-sm text-muted-foreground">
          Review everything before publishing. This is how your category will work.
        </p>
      </div>

      {/* Category Info Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="text-4xl">{category.icon}</div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{category.name_de}</CardTitle>
              {category.description_de && <p className="text-muted-foreground mt-1">{category.description_de}</p>}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="font-mono">
                  /{category.slug}
                </Badge>
                <Badge variant="secondary">{attributes.length} Attributes</Badge>
                <Badge variant="secondary">{questions.length} Questions</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attributes">
            <Database className="mr-2 h-4 w-4" />
            Attributes ({attributes.length})
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
        </TabsList>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-3">
          {attributes.map((attr, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{attr.display_name_de || attr.display_name}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {attr.key}
                      </Badge>
                      <Badge variant="secondary">{attr.data_type}</Badge>
                    </div>
                    {attr.description && <p className="text-sm text-muted-foreground">{attr.description}</p>}
                    {attr.allowed_values && attr.allowed_values.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {attr.allowed_values.map((val, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {val}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {attributes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No attributes defined</p>
            </div>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-3">
          {questions
            .sort((a, b) => a.priority - b.priority)
            .map((question, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{question.priority}</Badge>
                      <Badge variant="secondary">{question.question_type}</Badge>
                      {!question.is_optional && <Badge variant="destructive">Required</Badge>}
                      {question.maps_to_attribute && (
                        <Badge className="bg-blue-500 text-white">→ {question.maps_to_attribute}</Badge>
                      )}
                    </div>
                    <p className="font-semibold">{question.question_text}</p>
                    {question.help_text && <p className="text-sm text-muted-foreground">💡 {question.help_text}</p>}
                    {question.options && question.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {question.options.map((opt, i) => (
                          <Badge key={i} variant="outline">
                            {opt.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions defined</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>Users select this category and describe their experience</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>AI analyzes their text and extracts attributes automatically</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Questions are shown ONLY if AI didn't extract the linked attribute (Smart-Filtering)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>Data is structured and ready for pattern matching across similar experiences</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
