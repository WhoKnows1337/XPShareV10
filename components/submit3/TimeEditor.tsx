'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar, Clock } from 'lucide-react'

interface TimeEditorProps {
  value?: string
  onChange: (value: string) => void
}

export function TimeEditor({ value, onChange }: TimeEditorProps) {
  const [dateValue, setDateValue] = useState(value || '')
  const [precision, setPrecision] = useState<'exact' | 'approximate'>('exact')

  const handleQuickSelect = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const formatted = date.toISOString().split('T')[0]
    setDateValue(formatted)
    onChange(formatted)
  }

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div>
        <Label className="text-sm mb-2 block">Quick select:</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(1)}
          >
            Yesterday
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(7)}
          >
            Last Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(30)}
          >
            Last Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(365)}
          >
            Last Year
          </Button>
        </div>
      </div>

      {/* Date Input */}
      <div>
        <Label htmlFor="date-input" className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4" />
          Date
        </Label>
        <Input
          id="date-input"
          type="date"
          value={dateValue}
          onChange={(e) => {
            setDateValue(e.target.value)
            onChange(e.target.value)
          }}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Precision */}
      <div>
        <Label className="mb-2 block">Precision:</Label>
        <RadioGroup value={precision} onValueChange={(v) => setPrecision(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="exact" id="exact" />
            <Label htmlFor="exact" className="cursor-pointer">
              Exact date
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approximate" id="approximate" />
            <Label htmlFor="approximate" className="cursor-pointer">
              Approximate (±few days)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Display */}
      {dateValue && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-900">
            {new Date(dateValue).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {precision === 'approximate' && (
            <p className="text-xs text-purple-600 mt-1">
              ± Approximately
            </p>
          )}
        </div>
      )}
    </div>
  )
}
