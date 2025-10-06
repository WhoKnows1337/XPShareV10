'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Calendar, Play, Pause, RotateCcw } from 'lucide-react'
import { format, subMonths, subYears } from 'date-fns'

interface TimeTravelSliderProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void
  isLoading?: boolean
}

export function TimeTravelSlider({ onDateRangeChange, isLoading }: TimeTravelSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('all')
  const [customMonths, setCustomMonths] = useState(12)

  // Preset time ranges
  const timeRanges = [
    { value: 'all', label: 'All Time', startDate: null, endDate: null },
    { value: '1m', label: 'Last Month', startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
    { value: '3m', label: 'Last 3 Months', startDate: format(subMonths(new Date(), 3), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
    { value: '6m', label: 'Last 6 Months', startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
    { value: '1y', label: 'Last Year', startDate: format(subYears(new Date(), 1), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
    { value: '5y', label: 'Last 5 Years', startDate: format(subYears(new Date(), 5), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
  ]

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    const range = timeRanges.find((r) => r.value === value)
    if (range) {
      onDateRangeChange(range.startDate, range.endDate)
    }
  }

  const handleCustomSliderChange = (value: number[]) => {
    const months = value[0]
    setCustomMonths(months)
    const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd')
    const endDate = format(new Date(), 'yyyy-MM-dd')
    onDateRangeChange(startDate, endDate)
  }

  // Animation mode - progressively move through time
  useEffect(() => {
    if (!isPlaying) return

    let currentMonths = 1
    const interval = setInterval(() => {
      if (currentMonths >= 60) {
        setIsPlaying(false)
        return
      }
      currentMonths += 1
      setCustomMonths(currentMonths)
      const startDate = format(subMonths(new Date(), currentMonths), 'yyyy-MM-dd')
      const endDate = format(new Date(), 'yyyy-MM-dd')
      onDateRangeChange(startDate, endDate)
    }, 1000) // 1 second per step

    return () => clearInterval(interval)
  }, [isPlaying, onDateRangeChange])

  const handleReset = () => {
    setIsPlaying(false)
    setTimeRange('all')
    setCustomMonths(12)
    onDateRangeChange(null, null)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Time Travel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset ranges */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Ranges</Label>
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                size="sm"
                variant={timeRange === range.value ? 'default' : 'outline'}
                onClick={() => handleTimeRangeChange(range.value)}
                disabled={isLoading}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custom Range (Months Back)</Label>
            <span className="text-sm text-muted-foreground">{customMonths} months</span>
          </div>
          <Slider
            value={[customMonths]}
            onValueChange={handleCustomSliderChange}
            min={1}
            max={60}
            step={1}
            disabled={isLoading || isPlaying}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{format(subMonths(new Date(), customMonths), 'MMM yyyy')}</span>
            <span>→</span>
            <span>{format(new Date(), 'MMM yyyy')}</span>
          </div>
        </div>

        {/* Animation controls */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant={isPlaying ? 'destructive' : 'secondary'}
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isLoading}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Animation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play Animation
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {isPlaying && (
          <p className="text-xs text-center text-muted-foreground animate-pulse">
            Traveling through time...
          </p>
        )}
      </CardContent>
    </Card>
  )
}
