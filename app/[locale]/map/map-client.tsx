'use client'

import { useState, useEffect } from 'react'
import { MapView } from '@/components/browse/map-view'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Map, Layers } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MapClientProps {
  profile: {
    username: string
    display_name: string
  } | null
}

export function MapClient({ profile }: MapClientProps) {
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')

  // Fetch experiences with location data
  const fetchExperiences = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('experiences')
        .select(`
          id,
          title,
          story_text,
          category,
          date_occurred,
          created_at,
          location_lat,
          location_lng,
          location_text,
          view_count,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching experiences:', error)
      } else {
        console.log('Fetched experiences for map:', data?.length, data)
        setExperiences(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch experiences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and refetch when category changes
  useEffect(() => {
    fetchExperiences()
  }, [category])

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
            <span>{experiences.length} locations</span>
          </div>
          {isLoading && (
            <Badge variant="secondary" className="animate-pulse">
              Loading...
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="font-medium text-sm">Category Filter:</span>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ufo">🛸 UFO Sighting</SelectItem>
                <SelectItem value="paranormal">👻 Paranormal</SelectItem>
                <SelectItem value="dreams">💭 Dreams</SelectItem>
                <SelectItem value="psychedelic">🌈 Psychedelic</SelectItem>
                <SelectItem value="spiritual">✨ Spiritual</SelectItem>
                <SelectItem value="synchronicity">🔄 Synchronicity</SelectItem>
                <SelectItem value="nde">💫 Near-Death Experience</SelectItem>
                <SelectItem value="other">❓ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Map with Time-Travel */}
      <MapView experiences={experiences} />

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
      {!isLoading && experiences.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Experiences Found</h3>
            <p className="text-sm text-slate-600 mb-4">
              No experiences with location data found for the selected filters.
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting the category filter or add some experiences with location data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
