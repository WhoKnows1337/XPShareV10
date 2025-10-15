'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Loader2, X, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationResult {
  place_name: string
  center: [number, number] // [lng, lat]
  place_type: string[]
  text: string
}

interface LocationPickerProps {
  value?: string
  coordinates?: { lat: number; lng: number }
  onSelect: (location: string, coordinates: { lat: number; lng: number }) => void
  className?: string
}

export function LocationPicker({ value, coordinates, onSelect, className }: LocationPickerProps) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search with debounce
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${accessToken}&limit=5&language=de&types=place,locality,address`
        )

        if (response.ok) {
          const data = await response.json()
          setResults(data.features || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Geocoding error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSelectResult = (result: LocationResult) => {
    setQuery(result.place_name)
    setShowResults(false)
    onSelect(result.place_name, {
      lat: result.center[1],
      lng: result.center[0],
    })
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von deinem Browser nicht unterstützt')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&language=de`
          )

          if (response.ok) {
            const data = await response.json()
            if (data.features && data.features.length > 0) {
              const location = data.features[0]
              setQuery(location.place_name)
              onSelect(location.place_name, {
                lat: latitude,
                lng: longitude,
              })
            }
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Standort konnte nicht ermittelt werden')
        setIsGettingLocation(false)
      }
    )
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    onSelect('', { lat: 0, lng: 0 })
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ort eingeben (z.B. Berlin, Deutschland)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="shrink-0"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 p-2 max-h-64 overflow-y-auto shadow-lg">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-start gap-2"
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{result.text}</p>
                <p className="text-xs text-muted-foreground truncate">{result.place_name}</p>
              </div>
            </button>
          ))}
        </Card>
      )}

      {/* Selected Coordinates Display */}
      {coordinates && coordinates.lat !== 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          📍 Koordinaten: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}
