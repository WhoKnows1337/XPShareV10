'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Maximize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMiniMapProps {
  lat: number
  lng: number
  locationText?: string
  nearbyCount?: number
}

export function MapboxMiniMap({ lat, lng, locationText, nearbyCount = 0 }: MapboxMiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const dialogMapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const dialogMap = useRef<mapboxgl.Map | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Initialize mini map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initMap = async () => {
      try {
        const response = await fetch('/api/mapbox-token')
        const data = await response.json()

        if (!data.token) {
          console.error('Mapbox token not configured')
          return
        }

        mapboxgl.accessToken = data.token

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [lng, lat],
          zoom: 11,
          interactive: true,
        })

        // Add navigation controls only (no fullscreen)
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Add marker
        new mapboxgl.Marker({ color: '#8b5cf6' })
          .setLngLat([lng, lat])
          .addTo(map.current)
      } catch (error) {
        console.error('Error initializing Mapbox:', error)
      }
    }

    initMap()

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [lat, lng])

  // Initialize dialog map when dialog opens
  useEffect(() => {
    if (!isDialogOpen) {
      // Clean up when dialog closes
      if (dialogMap.current) {
        dialogMap.current.remove()
        dialogMap.current = null
      }
      return
    }

    // Wait for dialog to be fully rendered
    const timer = setTimeout(async () => {
      if (!dialogMapContainer.current || dialogMap.current) return

      try {
        const response = await fetch('/api/mapbox-token')
        const data = await response.json()

        if (!data.token) {
          console.error('Mapbox token not configured')
          return
        }

        mapboxgl.accessToken = data.token

        console.log('[Dialog Map] Creating map...')
        dialogMap.current = new mapboxgl.Map({
          container: dialogMapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [lng, lat],
          zoom: 12,
          interactive: true,
        })

        console.log('[Dialog Map] Adding controls...')
        dialogMap.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
        dialogMap.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

        console.log('[Dialog Map] Adding marker...')
        new mapboxgl.Marker({ color: '#8b5cf6' })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div class="p-2">
                <p class="font-semibold text-sm">Experience Location</p>
                ${locationText ? `<p class="text-xs text-gray-600">${locationText}</p>` : ''}
              </div>`
            )
          )
          .addTo(dialogMap.current)

        console.log('[Dialog Map] Map initialized successfully')
      } catch (error) {
        console.error('[Dialog Map] Error initializing:', error)
      }
    }, 100) // Wait 100ms for dialog to render

    return () => {
      clearTimeout(timer)
    }
  }, [isDialogOpen, lat, lng, locationText])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <div
                ref={mapContainer}
                className="aspect-square rounded-lg overflow-hidden bg-accent/50"
                style={{ minHeight: '300px' }}
              />
              {/* Custom fullscreen button overlay */}
              <button
                onClick={() => setIsDialogOpen(true)}
                className="absolute top-2 left-2 bg-white hover:bg-gray-100 text-gray-700 w-8 h-8 flex items-center justify-center rounded shadow-md border border-gray-300 z-10"
                title="View in fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {locationText && (
              <p className="text-sm text-muted-foreground">{locationText}</p>
            )}

            {nearbyCount > 0 && (
              <p className="text-xs text-muted-foreground">
                📍 {nearbyCount} nearby experiences
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Google Maps
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-full h-[85vh] p-0 overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {locationText || 'Interactive Map'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div ref={dialogMapContainer} className="w-full h-full" />
        </DialogContent>
      </Dialog>
    </>
  )
}
