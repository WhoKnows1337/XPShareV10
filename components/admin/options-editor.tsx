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
  const [sliderMin, setSliderMin] = useState('0')
  const [sliderMax, setSliderMax] = useState('100')
  const [sliderStep, setSliderStep] = useState('1')
  const [sliderUnit, setSliderUnit] = useState('%')

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

  const handleSetSliderConfig = () => {
    const min = parseInt(sliderMin, 10)
    const max = parseInt(sliderMax, 10)
    const step = parseInt(sliderStep, 10)

    if (isNaN(min) || isNaN(max) || isNaN(step) || min >= max || step <= 0) {
      return
    }

    // Store slider config as special format
    onChange([
      {
        value: '__slider_config__',
        label: JSON.stringify({ min, max, step, unit: sliderUnit })
      }
    ] as any)
  }

  if (questionType === 'slider') {
    // Parse current config if exists
    const currentConfig = options.find(o => o.value === '__slider_config__')
    let parsedConfig = null
    if (currentConfig) {
      try {
        parsedConfig = JSON.parse(currentConfig.label)
      } catch {
        parsedConfig = null
      }
    }

    return (
      <div className="space-y-4 rounded-lg border p-4">
        <Label>Slider Configuration</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slider_min">Minimum</Label>
            <Input
              id="slider_min"
              type="number"
              value={sliderMin}
              onChange={(e) => setSliderMin(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slider_max">Maximum</Label>
            <Input
              id="slider_max"
              type="number"
              value={sliderMax}
              onChange={(e) => setSliderMax(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slider_step">Step</Label>
            <Input
              id="slider_step"
              type="number"
              value={sliderStep}
              onChange={(e) => setSliderStep(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slider_unit">Unit</Label>
            <Input
              id="slider_unit"
              value={sliderUnit}
              onChange={(e) => setSliderUnit(e.target.value)}
              placeholder="% or km, etc."
            />
          </div>
        </div>
        <Button type="button" onClick={handleSetSliderConfig} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Save Slider Config
        </Button>
        {parsedConfig && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Current Config:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Range: {parsedConfig.min} - {parsedConfig.max}</li>
              <li>• Step: {parsedConfig.step}</li>
              <li>• Unit: {parsedConfig.unit || 'none'}</li>
            </ul>
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
