'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface ConditionalRule {
  type: 'field_empty' | 'field_equals' | 'answer_contains'
  field?: string
  value?: string
}

interface ConditionalLogicBuilderProps {
  value: any
  onChange: (value: any) => void
}

export function ConditionalLogicBuilder({ value, onChange }: ConditionalLogicBuilderProps) {
  const [rules, setRules] = useState<ConditionalRule[]>(
    value?.showIf ? [value.showIf] : []
  )

  const addRule = () => {
    const newRules = [...rules, { type: 'field_empty' }]
    setRules(newRules)
    updateValue(newRules)
  }

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    setRules(newRules)
    updateValue(newRules)
  }

  const updateRule = (index: number, field: keyof ConditionalRule, val: any) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: val }
    setRules(newRules)
    updateValue(newRules)
  }

  const updateValue = (newRules: ConditionalRule[]) => {
    if (newRules.length === 0) {
      onChange({})
    } else {
      onChange({
        showIf: newRules[0], // For now, support single rule
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Conditional Logic</CardTitle>
        <p className="text-xs text-muted-foreground">
          Show this question only when certain conditions are met
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Condition Type</Label>
              <Select
                value={rule.type}
                onValueChange={(val) =>
                  updateRule(index, 'type', val as ConditionalRule['type'])
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field_empty">Field is empty</SelectItem>
                  <SelectItem value="field_equals">Field equals</SelectItem>
                  <SelectItem value="answer_contains">Answer contains</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(rule.type === 'field_equals' || rule.type === 'answer_contains') && (
              <>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Field Name</Label>
                  <Input
                    value={rule.field || ''}
                    onChange={(e) => updateRule(index, 'field', e.target.value)}
                    placeholder="e.g. time_extracted"
                    className="h-8"
                  />
                </div>
                {rule.type === 'field_equals' && (
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={rule.value || ''}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                      placeholder="Expected value"
                      className="h-8"
                    />
                  </div>
                )}
              </>
            )}

            {rule.type === 'field_empty' && (
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Field Name</Label>
                <Input
                  value={rule.field || ''}
                  onChange={(e) => updateRule(index, 'field', e.target.value)}
                  placeholder="e.g. time_extracted"
                  className="h-8"
                />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRule(index)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {rules.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No conditions set - question will always be shown
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          className="w-full"
          disabled={rules.length >= 1} // Limit to 1 rule for now
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </CardContent>
    </Card>
  )
}
