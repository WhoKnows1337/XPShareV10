'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type DatePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_365_days' | 'custom'

interface DateRangeSliderProps {
  dateFrom: string
  dateTo: string
  onDateChange: (from: string, to: string, preset?: DatePreset) => void
  className?: string
}

const presets: Array<{ value: DatePreset; label: string }> = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'last_365_days', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
]

function getPresetDates(preset: DatePreset): { from: string; to: string } | null {
  if (preset === 'custom') return null
  
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  
  const daysMap = {
    last_7_days: 7,
    last_30_days: 30,
    last_90_days: 90,
    last_365_days: 365,
  }
  
  const days = daysMap[preset as keyof typeof daysMap]
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  
  return { from, to }
}

export function DateRangeSlider({ dateFrom, dateTo, onDateChange, className }: DateRangeSliderProps) {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('custom')
  const [showCustom, setShowCustom] = useState(true)

  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset)
    
    if (preset === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      const dates = getPresetDates(preset)
      if (dates) {
        onDateChange(dates.from, dates.to, preset)
      }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Label className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Date Range
      </Label>
      
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className="transition-all hover:scale-105"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3 overflow-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-xs">
                From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setSelectedPreset('custom')
                  onDateChange(e.target.value, dateTo, 'custom')
                }}
                max={dateTo || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-xs">
                To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setSelectedPreset('custom')
                  onDateChange(dateFrom, e.target.value, 'custom')
                }}
                min={dateFrom || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
