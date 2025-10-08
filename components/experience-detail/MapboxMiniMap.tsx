'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Maximize2 } from 'lucide-react'

interface MapboxMiniMapProps {
  lat: number
  lng: number
  locationText?: string
  nearbyCount?: number
}

export function MapboxMiniMap({ lat, lng, locationText, nearbyCount = 0 }: MapboxMiniMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Mapbox Static API URL
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+8b5cf6(${lng},${lat})/${lng},${lat},11,0/400x400@2x?access_token=${MAPBOX_TOKEN}`
  const fullMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+8b5cf6(${lng},${lat})/${lng},${lat},10,0/1200x800@2x?access_token=${MAPBOX_TOKEN}`

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
            <div
              className="aspect-square rounded-lg overflow-hidden bg-accent/50 relative group cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            >
              {MAPBOX_TOKEN ? (
                <>
                  <img
                    src={staticMapUrl}
                    alt="Map"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Map preview unavailable</p>
                    <p className="text-xs">Configure MAPBOX_TOKEN</p>
                  </div>
                </div>
              )}
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
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Map
              </Button>
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

      {/* Fullscreen Map Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {locationText || 'Location Map'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 rounded-lg overflow-hidden">
            {MAPBOX_TOKEN ? (
              <img
                src={fullMapUrl}
                alt="Full Map"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Map preview unavailable</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
