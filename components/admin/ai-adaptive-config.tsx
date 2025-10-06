'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, X } from 'lucide-react'

interface AdaptiveConditions {
  trigger_on?: string[]
  trigger_keywords?: string[]
  min_answer_length?: number
  max_questions?: number
}

interface AIAdaptiveConfigProps {
  questionId: string
  aiAdaptive: boolean
  adaptiveConditions: AdaptiveConditions
  onSave: (aiAdaptive: boolean, conditions: AdaptiveConditions) => void
}

export function AIAdaptiveConfig({
  questionId,
  aiAdaptive: initialAIAdaptive,
  adaptiveConditions: initialConditions,
  onSave,
}: AIAdaptiveConfigProps) {
  const [aiAdaptive, setAIAdaptive] = useState(initialAIAdaptive)
  const [conditions, setConditions] = useState<AdaptiveConditions>(initialConditions || {})
  const [newTrigger, setNewTrigger] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  const addTrigger = () => {
    if (!newTrigger.trim()) return
    setConditions({
      ...conditions,
      trigger_on: [...(conditions.trigger_on || []), newTrigger.trim()],
    })
    setNewTrigger('')
  }

  const removeTrigger = (trigger: string) => {
    setConditions({
      ...conditions,
      trigger_on: conditions.trigger_on?.filter((t) => t !== trigger),
    })
  }

  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setConditions({
      ...conditions,
      trigger_keywords: [...(conditions.trigger_keywords || []), newKeyword.trim()],
    })
    setNewKeyword('')
  }

  const removeKeyword = (keyword: string) => {
    setConditions({
      ...conditions,
      trigger_keywords: conditions.trigger_keywords?.filter((k) => k !== keyword),
    })
  }

  const handleSave = () => {
    onSave(aiAdaptive, conditions)
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>AI-Adaptive Follow-Ups</CardTitle>
          </div>
          <Switch checked={aiAdaptive} onCheckedChange={setAIAdaptive} />
        </div>
        <CardDescription>
          Automatically generate intelligent follow-up questions based on user answers
        </CardDescription>
      </CardHeader>

      {aiAdaptive && (
        <CardContent className="space-y-6">
          {/* Trigger Answers */}
          <div className="space-y-2">
            <Label>Trigger on Specific Answers</Label>
            <p className="text-sm text-muted-foreground">
              AI will generate follow-ups when the user's answer contains these values
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'Yes', 'Multiple times', etc."
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
              />
              <Button onClick={addTrigger} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {conditions.trigger_on?.map((trigger) => (
                <Badge key={trigger} variant="secondary">
                  {trigger}
                  <button
                    onClick={() => removeTrigger(trigger)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Trigger Keywords */}
          <div className="space-y-2">
            <Label>Trigger on Keywords (Text Answers)</Label>
            <p className="text-sm text-muted-foreground">
              Generate follow-ups when text contains these keywords
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'afraid', 'confused', 'multiple', etc."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {conditions.trigger_keywords?.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Min Answer Length */}
          <div className="space-y-2">
            <Label>Minimum Answer Length (characters)</Label>
            <p className="text-sm text-muted-foreground">
              Only generate follow-ups if text answer is longer than this
            </p>
            <Input
              type="number"
              value={conditions.min_answer_length || ''}
              onChange={(e) =>
                setConditions({
                  ...conditions,
                  min_answer_length: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 50"
            />
          </div>

          {/* Max Questions */}
          <div className="space-y-2">
            <Label>Maximum Follow-Up Questions</Label>
            <p className="text-sm text-muted-foreground">
              How many AI questions to generate (1-3 recommended)
            </p>
            <Input
              type="number"
              min={1}
              max={5}
              value={conditions.max_questions || 1}
              onChange={(e) =>
                setConditions({
                  ...conditions,
                  max_questions: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)),
                })
              }
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save AI Configuration
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
