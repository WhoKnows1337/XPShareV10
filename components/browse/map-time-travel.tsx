'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Experience {
  id: string
  title: string
  date_occurred?: string
  created_at: string
  category: string
  location_lat?: number
  location_lng?: number
}

interface Props {
  experiences: Experience[]
  onTimeRangeChange: (start: Date, end: Date) => void
  className?: string
}

export function MapTimeTravel({ experiences, onTimeRangeChange, className }: Props) {
  // Find date range from experiences
  const dateRange = useMemo(() => {
    if (!experiences || experiences.length === 0) {
      const now = Date.now()
      return { min: now - 30 * 24 * 60 * 60 * 1000, max: now }
    }
    const dates = experiences.map(e => new Date(e.date_occurred || e.created_at).getTime())
    return {
      min: Math.min(...dates),
      max: Math.max(...dates)
    }
  }, [experiences])

  const [currentTime, setCurrentTime] = useState(dateRange.min)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // milliseconds per day

  // Playback animation
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (24 * 60 * 60 * 1000) // +1 day
        if (next > dateRange.max) {
          setIsPlaying(false)
          return dateRange.max
        }
        return next
      })
    }, playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, dateRange.max])

  // Filter experiences by current time window
  useEffect(() => {
    const windowStart = new Date(currentTime - 7 * 24 * 60 * 60 * 1000) // -7 days
    const windowEnd = new Date(currentTime)
    onTimeRangeChange(windowStart, windowEnd)
  }, [currentTime, onTimeRangeChange])

  // Count experiences up to current time
  const experienceCount = useMemo(() => {
    return experiences.filter(e => {
      const expDate = new Date(e.date_occurred || e.created_at).getTime()
      return expDate <= currentTime
    }).length
  }, [experiences, currentTime])

  // Detect wave peaks
  const wavePeak = useMemo(() => {
    const currentDay = format(new Date(currentTime), 'yyyy-MM-dd')
    const dayExperiences = experiences.filter(e => {
      const expDay = format(new Date(e.date_occurred || e.created_at), 'yyyy-MM-dd')
      return expDay === currentDay
    })

    if (dayExperiences.length >= 2) {
      return {
        count: dayExperiences.length,
        date: currentDay
      }
    }
    return null
  }, [experiences, currentTime])

  const handleReset = () => {
    setCurrentTime(dateRange.min)
    setIsPlaying(false)
  }

  const totalDays = Math.ceil((dateRange.max - dateRange.min) / (24 * 60 * 60 * 1000))
  const progress = ((currentTime - dateRange.min) / (dateRange.max - dateRange.min)) * 100

  return (
    <div className={cn(
      "absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[600px] bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg",
      className
    )}>
      {/* Current Date Display */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold">
          {format(new Date(currentTime), 'dd. MMMM yyyy', { locale: de })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {experienceCount} von {experiences.length} Erlebnissen
        </p>
        <div className="mt-1 text-xs text-muted-foreground">
          {totalDays} Tage Zeitraum
        </div>
      </div>

      {/* Time Slider */}
      <div className="mb-2">
        <Slider
          value={[currentTime]}
          onValueChange={([value]) => setCurrentTime(value)}
          min={dateRange.min}
          max={dateRange.max}
          step={24 * 60 * 60 * 1000} // 1 day steps
          className="mb-2"
        />
        {/* Progress Bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Date Range Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>{format(dateRange.min, 'dd.MM.yyyy')}</span>
        <span>{format(dateRange.max, 'dd.MM.yyyy')}</span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <div className="flex-1" />

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <Button
            variant={playbackSpeed === 2000 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(2000)}
            className="px-2"
          >
            0.5x
          </Button>
          <Button
            variant={playbackSpeed === 1000 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(1000)}
            className="px-2"
          >
            1x
          </Button>
          <Button
            variant={playbackSpeed === 500 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPlaybackSpeed(500)}
            className="px-2"
          >
            2x
          </Button>
        </div>
      </div>

      {/* Wave Detection Alert */}
      {wavePeak && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                🔥 WAVE-PEAK! {wavePeak.count} Erlebnisse am {format(new Date(wavePeak.date), 'dd. MMMM', { locale: de })}!
              </p>
              <p className="text-xs text-muted-foreground">
                Ungewöhnlich hohe Aktivität erkannt
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
