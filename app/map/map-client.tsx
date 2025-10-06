'use client'

import { useState, useEffect } from 'react'
import { MapView } from '@/components/map/map-view'
import { TimeTravelSlider } from '@/components/map/time-travel-slider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Map, Layers, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Marker {
  id: string
  title: string
  category: string
  lat: number
  lng: number
  location: string
  date: string
  timeOfDay?: string
  viewCount: number
  upvoteCount: number
  username: string
}

interface MapClientProps {
  profile: {
    username: string
    display_name: string
  } | null
}

export function MapClient({ profile }: MapClientProps) {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })

  // Fetch markers based on filters
  const fetchMarkers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/patterns/time-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          category: category === 'all' ? null : category,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMarkers(data.markers || [])
      }
    } catch (error) {
      console.error('Failed to fetch markers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and refetch when filters change
  useEffect(() => {
    fetchMarkers()
  }, [dateRange, category])

  const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
    setDateRange({ start: startDate, end: endDate })
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Experience Map
            </h1>
            <p className="text-muted-foreground">
              Explore extraordinary experiences across space and time
            </p>
          </div>
          <Link href="/feed">
            <Button variant="outline">
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Map className="h-4 w-4" />
            <span>{markers.length} locations</span>
          </div>
          {isLoading && (
            <Badge variant="secondary" className="animate-pulse">
              Loading...
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Category filter */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4" />
                <span className="font-medium text-sm">Category Filter</span>
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ufo">UFO Sighting</SelectItem>
                  <SelectItem value="paranormal">Paranormal</SelectItem>
                  <SelectItem value="dreams">Dreams</SelectItem>
                  <SelectItem value="psychedelic">Psychedelic</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="synchronicity">Synchronicity</SelectItem>
                  <SelectItem value="nde">Near-Death Experience</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Heatmap toggle */}
              <div className="pt-3 border-t">
                <Button
                  size="sm"
                  variant={showHeatmap ? 'default' : 'outline'}
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {showHeatmap ? 'Hide' : 'Show'} Heatmap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time travel slider */}
        <div className="lg:col-span-3">
          <TimeTravelSlider
            onDateRangeChange={handleDateRangeChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="h-[600px] lg:h-[700px]">
          <MapView markers={markers} showHeatmap={showHeatmap} />
        </div>
      </Card>

      {/* Legend */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Category Legend</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { category: 'ufo', label: 'UFO Sighting', color: '#3b82f6' },
              { category: 'paranormal', label: 'Paranormal', color: '#8b5cf6' },
              { category: 'dreams', label: 'Dreams', color: '#06b6d4' },
              { category: 'psychedelic', label: 'Psychedelic', color: '#ec4899' },
              { category: 'spiritual', label: 'Spiritual', color: '#10b981' },
              { category: 'synchronicity', label: 'Synchronicity', color: '#f59e0b' },
              { category: 'nde', label: 'Near-Death', color: '#ef4444' },
              { category: 'other', label: 'Other', color: '#6b7280' },
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!isLoading && markers.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Experiences Found</h3>
            <p className="text-sm text-slate-600 mb-4">
              No experiences with location data found for the selected filters.
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting the time range or category filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
