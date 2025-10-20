'use client'

import { useRef, useEffect, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Layers } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

/**
 * Experience Map Card Component
 * Interactive map visualization with Mapbox GL
 * Features: Markers, clusters, popups, zoom controls
 * Used by streamUI for geographic pattern visualization
 */

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  category?: string
  date?: string
}

export interface MapCluster {
  center: { lat: number; lng: number }
  count: number
  radius: number
  markers: MapMarker[]
}

export interface ExperienceMapCardProps {
  markers: MapMarker[]
  clusters?: MapCluster[]
  title?: string
  onMarkerClick?: (marker: MapMarker) => void
  initialViewport?: {
    latitude: number
    longitude: number
    zoom: number
  }
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export function ExperienceMapCard({
  markers,
  clusters = [],
  title = 'Geographic Distribution',
  onMarkerClick,
  initialViewport,
}: ExperienceMapCardProps) {
  const mapRef = useRef<any>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [viewState, setViewState] = useState({
    latitude: initialViewport?.latitude || 51.5,
    longitude: initialViewport?.longitude || 0,
    zoom: initialViewport?.zoom || 4,
  })

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      const bounds: [number, number, number, number] = [
        Math.min(...markers.map((m) => m.lng)),
        Math.min(...markers.map((m) => m.lat)),
        Math.max(...markers.map((m) => m.lng)),
        Math.max(...markers.map((m) => m.lat)),
      ]

      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      })
    }
  }, [markers])

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
    onMarkerClick?.(marker)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{markers.length} locations</Badge>
            {clusters.length > 0 && (
              <Badge variant="outline">
                <Layers className="h-3 w-3 mr-1" />
                {clusters.length} clusters
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {/* Navigation Controls */}
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />

            {/* Individual Markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                latitude={marker.lat}
                longitude={marker.lng}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  handleMarkerClick(marker)
                }}
              >
                <div className="cursor-pointer transform hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-blue-500" fill="currentColor" />
                </div>
              </Marker>
            ))}

            {/* Cluster Markers (larger circles) */}
            {clusters.map((cluster, idx) => (
              <Marker
                key={`cluster-${idx}`}
                latitude={cluster.center.lat}
                longitude={cluster.center.lng}
              >
                <div
                  className="bg-blue-500 text-white rounded-full flex items-center justify-center font-bold cursor-pointer hover:bg-blue-600 transition-colors"
                  style={{
                    width: Math.min(40 + cluster.count * 5, 80),
                    height: Math.min(40 + cluster.count * 5, 80),
                  }}
                >
                  {cluster.count}
                </div>
              </Marker>
            ))}

            {/* Popup on marker click */}
            {selectedMarker && (
              <Popup
                latitude={selectedMarker.lat}
                longitude={selectedMarker.lng}
                onClose={() => setSelectedMarker(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{selectedMarker.title}</h3>
                  {selectedMarker.category && (
                    <Badge variant="outline" className="mt-1">
                      {selectedMarker.category}
                    </Badge>
                  )}
                  {selectedMarker.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedMarker.date}
                    </p>
                  )}
                </div>
              </Popup>
            )}
          </Map>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            💡 Click markers for details • Zoom and pan to explore
          </p>
          {onMarkerClick && (
            <Button variant="outline" size="sm">
              View All Locations
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
