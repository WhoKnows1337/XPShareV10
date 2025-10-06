'use client'

import { useState } from 'react'
import { QuestionOption, QuestionType } from '@/lib/types/admin-questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface OptionsEditorProps {
  questionType: QuestionType
  options: QuestionOption[]
  onChange: (options: QuestionOption[]) => void
}

export function OptionsEditor({
  questionType,
  options,
  onChange,
}: OptionsEditorProps) {
  const [optionValue, setOptionValue] = useState('')
  const [optionLabel, setOptionLabel] = useState('')
  const [optionIcon, setOptionIcon] = useState('')

  // For slider type
  const [minValue, setMinValue] = useState('0')
  const [maxValue, setMaxValue] = useState('10')

  const handleAddOption = () => {
    if (!optionValue.trim() || !optionLabel.trim()) return

    const newOption: QuestionOption = {
      value: optionValue.trim(),
      label: optionLabel.trim(),
      icon: optionIcon.trim() || undefined,
    }

    onChange([...options, newOption])
    setOptionValue('')
    setOptionLabel('')
    setOptionIcon('')
  }

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  const handleSetSliderRange = () => {
    const min = parseInt(minValue, 10)
    const max = parseInt(maxValue, 10)

    if (isNaN(min) || isNaN(max) || min >= max) return

    onChange([
      { value: 'min', label: minValue },
      { value: 'max', label: maxValue },
    ])
  }

  if (questionType === 'slider') {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <Label>Slider Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_value">Minimum</Label>
            <Input
              id="min_value"
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_value">Maximum</Label>
            <Input
              id="max_value"
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>
        <Button type="button" onClick={handleSetSliderRange} className="w-full">
          Set Range
        </Button>
        {options.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Current range: {options.find((o) => o.value === 'min')?.label} -{' '}
            {options.find((o) => o.value === 'max')?.label}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label>Options</Label>

      {/* Add Option Form */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={optionValue}
            onChange={(e) => setOptionValue(e.target.value)}
            placeholder="Value (e.g., yes)"
          />
          <Input
            value={optionLabel}
            onChange={(e) => setOptionLabel(e.target.value)}
            placeholder="Label (e.g., Yes)"
          />
          <Input
            value={optionIcon}
            onChange={(e) => setOptionIcon(e.target.value)}
            placeholder="Icon (e.g., ✅)"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddOption}
          disabled={!optionValue.trim() || !optionLabel.trim()}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {/* Options List */}
      {options.length > 0 ? (
        <div className="space-y-2">
          {options.map((option, index) => (
            <Card key={index} className="flex items-center gap-2 p-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              {option.icon && <span className="text-xl">{option.icon}</span>}
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No options yet. Add some options above.
        </div>
      )}
    </div>
  )
}
