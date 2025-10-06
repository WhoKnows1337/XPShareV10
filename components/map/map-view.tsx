'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ExternalLink, MapPin, Calendar } from 'lucide-react'

// You need to add your Mapbox token to .env.local
// NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

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

interface MapViewProps {
  markers: Marker[]
  showHeatmap?: boolean
}

const categoryColors: Record<string, string> = {
  ufo: '#3b82f6', // blue
  paranormal: '#8b5cf6', // purple
  dreams: '#06b6d4', // cyan
  psychedelic: '#ec4899', // pink
  spiritual: '#10b981', // green
  synchronicity: '#f59e0b', // amber
  nde: '#ef4444', // red
  other: '#6b7280', // gray
}

export function MapView({ markers, showHeatmap = false }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Check if token is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local')
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20], // World view
      zoom: 2,
      projection: 'globe' as any,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      if (!markerData.lat || !markerData.lng) return

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = categoryColors[markerData.category] || categoryColors.other
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.transition = 'all 0.2s'

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)'
        el.style.zIndex = '1000'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.zIndex = '1'
      })

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!)

      // Click handler
      el.addEventListener('click', () => {
        setSelectedMarker(markerData)
        // Fly to marker
        map.current?.flyTo({
          center: [markerData.lng, markerData.lat],
          zoom: 8,
          duration: 1500,
        })
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to markers if there are any
    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      markers.forEach((m) => {
        if (m.lat && m.lng) {
          bounds.extend([m.lng, m.lat])
        }
      })
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12, duration: 1000 })
    }
  }, [markers])

  // Add heatmap layer
  useEffect(() => {
    if (!map.current || !showHeatmap) return

    map.current.on('load', () => {
      if (!map.current) return

      // Check if source already exists
      if (!map.current.getSource('experiences-heat')) {
        // Add heatmap source
        map.current.addSource('experiences-heat', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: markers.map((m) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [m.lng, m.lat],
              },
              properties: {
                intensity: m.upvoteCount + m.viewCount,
              },
            })),
          },
        })

        // Add heatmap layer
        map.current.addLayer({
          id: 'experiences-heat',
          type: 'heatmap',
          source: 'experiences-heat',
          paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 1,
            'heatmap-radius': 30,
            'heatmap-opacity': 0.6,
          },
        })
      }
    })
  }, [showHeatmap, markers])

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Selected marker popup */}
      {selectedMarker && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-md shadow-lg z-10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  {selectedMarker.category}
                </Badge>
                <h3 className="font-semibold text-lg line-clamp-2">{selectedMarker.title}</h3>
                <p className="text-sm text-muted-foreground">by {selectedMarker.username}</p>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{selectedMarker.location}</span>
              </div>
              {selectedMarker.date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{selectedMarker.date}</span>
                  {selectedMarker.timeOfDay && <span>• {selectedMarker.timeOfDay}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span>👁️ {selectedMarker.viewCount}</span>
              <span>👍 {selectedMarker.upvoteCount}</span>
            </div>

            <Link href={`/experiences/${selectedMarker.id}`}>
              <div className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Details
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* No token warning */}
      {!mapboxgl.accessToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
              </p>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm"
              >
                Get a free token from Mapbox →
              </a>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
