'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, Popup, Layer, Source } from 'react-map-gl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Experience {
  id: string
  title: string
  category: string
  date_occurred?: string
  location_text?: string
  location_lat?: number
  location_lng?: number
}

interface HeatmapViewProps {
  experiences: Experience[]
}

const categoryColors: Record<string, string> = {
  'ufo-uap': '#3b82f6',
  nde: '#a855f7',
  paranormal: '#6366f1',
  dreams: '#ec4899',
  psychedelic: '#f97316',
  'altered-states': '#10b981',
  synchronicity: '#eab308',
}

export function HeatmapView({ experiences }: HeatmapViewProps) {
  const mapRef = useRef<any>(null)
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [viewState, setViewState] = useState({
    longitude: 10.4515, // Center of Germany
    latitude: 51.1657,
    zoom: 5,
  })

  // Filter experiences with valid coordinates
  const experiencesWithLocation = experiences.filter(
    (exp) => exp.location_lat && exp.location_lng
  )

  // Prepare heatmap data (GeoJSON)
  const heatmapData = {
    type: 'FeatureCollection',
    features: experiencesWithLocation.map((exp) => ({
      type: 'Feature',
      properties: {
        intensity: 1,
      },
      geometry: {
        type: 'Point',
        coordinates: [exp.location_lng!, exp.location_lat!],
      },
    })),
  }

  const heatmapLayer = {
    id: 'heatmap',
    type: 'heatmap' as const,
    source: 'experiences',
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 6, 1],
      // Increase the heatmap color weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      // Color ramp for heatmap
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)',
      ],
      // Adjust the heatmap radius by zoom level
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      // Transition from heatmap to circle layer by zoom level
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0],
    },
  }

  const pointsLayer = {
    id: 'points',
    type: 'circle' as const,
    source: 'experiences',
    minzoom: 7,
    paint: {
      // Size circle radius by zoom level
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 5, 16, 20],
      // Color circle by category
      'circle-color': '#11b4da',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
      // Transition from heatmap to circle layer by zoom level
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1],
    },
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-lg border overflow-hidden" style={{ height: '600px' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        >
          {/* Heatmap Layer */}
          <Source id="experiences" type="geojson" data={heatmapData as any}>
            <Layer {...(heatmapLayer as any)} />
            <Layer {...(pointsLayer as any)} />
          </Source>

          {/* Individual Markers for low zoom */}
          {experiencesWithLocation.map((exp) => (
            <Marker
              key={exp.id}
              longitude={exp.location_lng!}
              latitude={exp.location_lat!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedExperience(exp)
              }}
            >
              <div className="cursor-pointer">
                <MapPin
                  size={24}
                  color={categoryColors[exp.category] || '#64748b'}
                  fill={categoryColors[exp.category] || '#64748b'}
                  className="drop-shadow-lg"
                />
              </div>
            </Marker>
          ))}

          {/* Popup for selected experience */}
          {selectedExperience && (
            <Popup
              longitude={selectedExperience.location_lng!}
              latitude={selectedExperience.location_lat!}
              anchor="top"
              onClose={() => setSelectedExperience(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{selectedExperience.title}</h3>
                <Badge
                  style={{
                    backgroundColor: categoryColors[selectedExperience.category],
                    color: 'white',
                  }}
                  className="text-xs mb-2"
                >
                  {selectedExperience.category}
                </Badge>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedExperience.location_text}
                </p>
                <Link href={`/experiences/${selectedExperience.id}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Details ansehen
                  </Button>
                </Link>
              </div>
            </Popup>
          )}
        </Map>

        {/* Map Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-white bg-black/70 p-2 rounded">
          <p>💡 Zoom In für einzelne Marker</p>
          <p>Zoom Out für Heatmap-Ansicht</p>
          <p>Click auf Marker für Details</p>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg">
          <div className="text-sm space-y-1">
            <div className="font-semibold">Erfahrungen auf Karte</div>
            <div className="text-2xl font-bold text-primary">
              {experiencesWithLocation.length}
            </div>
            <div className="text-xs text-muted-foreground">
              von {experiences.length} insgesamt
            </div>
          </div>
        </div>
      </div>

      {/* Category Legend */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-3">Kategorien</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <MapPin size={16} color={color} fill={color} />
                <span className="text-xs text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {experiencesWithLocation.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <MapPin className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p className="text-sm">Keine Erfahrungen mit Standortdaten gefunden</p>
              <p className="text-xs mt-1">
                Erfahrungen benötigen GPS-Koordinaten für die Kartenansicht
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
