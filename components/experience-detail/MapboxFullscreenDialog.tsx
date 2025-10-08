'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Maximize2, Navigation } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxFullscreenDialogProps {
  lat: number
  lng: number
  locationText?: string
  nearbyExperiences?: Array<{
    id: string
    title: string
    lat: number
    lng: number
  }>
}

export function MapboxFullscreenDialog({
  lat,
  lng,
  locationText,
  nearbyExperiences = [],
}: MapboxFullscreenDialogProps) {
  const [open, setOpen] = useState(false)
  const [hasToken, setHasToken] = useState(true)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    console.log('[Mapbox] useEffect triggered', { open, hasContainer: !!mapContainer.current, hasMap: !!map.current })
    if (!open || !mapContainer.current || map.current) return

    const initMap = async () => {
      try {
        console.log('[Mapbox] Starting map initialization...')
        // Fetch token from API
        const response = await fetch('/api/mapbox-token')
        const data = await response.json()
        console.log('[Mapbox] Token response:', { hasToken: !!data.token })

        if (!data.token) {
          console.error('[Mapbox] Token not configured')
          setHasToken(false)
          return
        }

        mapboxgl.accessToken = data.token
        setHasToken(true)

        console.log('[Mapbox] Creating map with container:', mapContainer.current)
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [lng, lat],
          zoom: 12,
        })
        console.log('[Mapbox] Map instance created:', map.current)

        // Add main marker
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
          .addTo(map.current)

        // Add nearby experience markers
        nearbyExperiences.forEach((exp) => {
          if (map.current) {
            new mapboxgl.Marker({ color: '#64748b', scale: 0.8 })
              .setLngLat([exp.lng, exp.lat])
              .setPopup(
                new mapboxgl.Popup().setHTML(
                  `<div class="p-2">
                    <p class="font-semibold text-sm">${exp.title}</p>
                    <a href="/experiences/${exp.id}" class="text-xs text-primary hover:underline">View →</a>
                  </div>`
                )
              )
              .addTo(map.current)
          }
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Add fullscreen control
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

        // Add geolocation control
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        )
      } catch (error) {
        console.error('Error initializing Mapbox:', error)
        setHasToken(false)
      }
    }

    initMap();

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [open, lat, lng, locationText, nearbyExperiences])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" />
          Open Full Map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-full h-[85vh] p-0 overflow-hidden">
        <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interactive Map
            </DialogTitle>
            {locationText && (
              <DialogDescription className="mt-1">
                {locationText}
              </DialogDescription>
            )}
            {nearbyExperiences.length > 0 && (
              <DialogDescription className="mt-2 text-xs">
                {nearbyExperiences.length} nearby {nearbyExperiences.length === 1 ? 'experience' : 'experiences'}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '85vh' }} />

        {!hasToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center p-8">
              <Navigation className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-semibold">Map Not Available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Mapbox token not configured
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
