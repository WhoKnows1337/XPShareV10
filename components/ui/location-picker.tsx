'use client'

import * as React from 'react'
import { MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Location {
  lat: number
  lng: number
  name: string
}

interface LocationPickerProps {
  value?: Location
  onChange: (location?: Location) => void
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [query, setQuery] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<Location[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Mock geocoding - in production, use a real geocoding service
      // like Mapbox Geocoding or Google Places API
      const mockResults: Location[] = [
        { lat: 47.6588, lng: 9.1763, name: 'Bodensee, Deutschland' },
        { lat: 48.1351, lng: 11.582, name: 'München, Deutschland' },
        { lat: 52.52, lng: 13.405, name: 'Berlin, Deutschland' },
        { lat: 47.3769, lng: 8.5417, name: 'Zürich, Schweiz' },
        { lat: 48.2082, lng: 16.3738, name: 'Wien, Österreich' },
      ].filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setSuggestions(mockResults)
    } catch (error) {
      console.error('Error searching location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (location: Location) => {
    onChange(location)
    setQuery('')
    setSuggestions([])
  }

  const handleClear = () => {
    onChange(undefined)
    setQuery('')
    setSuggestions([])
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Current Selection */}
      {value && (
        <Badge variant="secondary" className="gap-2">
          <MapPin className="h-3 w-3" />
          {value.name}
          <button
            onClick={handleClear}
            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="border rounded-lg divide-y max-h-48 overflow-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 text-sm"
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{location.name}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground">Searching...</p>
      )}
    </div>
  )
}
