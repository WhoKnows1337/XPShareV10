'use client'

import { useState, useMemo, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'
import Supercluster from 'supercluster'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapViewProps {
  experiences: any[]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' // Default Mapbox token

export function MapView({ experiences }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const [viewport, setViewport] = useState({
    latitude: 51.1657,
    longitude: 10.4515,
    zoom: 6
  })
  const [selectedExperience, setSelectedExperience] = useState<any>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Filter experiences with valid coordinates
  const validExperiences = experiences.filter(exp =>
    exp.location_lat && exp.location_lng
  )

  // Create supercluster instance
  const cluster = useMemo(() => {
    const supercluster = new Supercluster({
      radius: 60,
      maxZoom: 16
    })

    const points = validExperiences.map(exp => ({
      type: 'Feature',
      properties: { experience: exp },
      geometry: {
        type: 'Point',
        coordinates: [exp.location_lng, exp.location_lat]
      }
    }))

    supercluster.load(points as any)
    return supercluster
  }, [validExperiences])

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    if (!mapRef.current) return []

    const bounds = mapRef.current.getMap().getBounds()
    if (!bounds) return []

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ]

    return cluster.getClusters(bbox as [number, number, number, number], Math.floor(viewport.zoom))
  }, [cluster, viewport.zoom, viewport.latitude, viewport.longitude])

  const handleClusterClick = (clusterId: number, lng: number, lat: number) => {
    const zoom = Math.min(
      cluster.getClusterExpansionZoom(clusterId),
      20
    )
    setViewport({ ...viewport, longitude: lng, latitude: lat, zoom })
  }

  if (validExperiences.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No experiences with location data available
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {clusters.map((cluster: any) => {
          const [lng, lat] = cluster.geometry.coordinates
          const { cluster: isCluster, point_count } = cluster.properties

          if (isCluster) {
            // Cluster Marker
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={lng}
                latitude={lat}
                onClick={() => handleClusterClick(cluster.id, lng, lat)}
              >
                <div
                  className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    width: `${30 + (point_count / validExperiences.length) * 40}px`,
                    height: `${30 + (point_count / validExperiences.length) * 40}px`
                  }}
                >
                  {point_count}
                </div>
              </Marker>
            )
          }

          // Individual Marker
          const exp = cluster.properties.experience

          return (
            <Marker
              key={`exp-${exp.id}`}
              longitude={lng}
              latitude={lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedExperience(exp)
              }}
            >
              <div className="relative cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-lg hover:scale-125 transition-transform">
                  {getCategoryIcon(exp.category)}
                </div>
                {exp.is_verified && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-background rounded-full" />
                )}
              </div>
            </Marker>
          )
        })}

        {selectedExperience && (
          <Popup
            longitude={selectedExperience.location_lng}
            latitude={selectedExperience.location_lat}
            onClose={() => setSelectedExperience(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <div className="p-2 min-w-[250px]">
              {selectedExperience.hero_image_url && (
                <img
                  src={selectedExperience.hero_image_url}
                  alt=""
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <Link
                href={`/experiences/${selectedExperience.id}`}
                className="font-semibold hover:underline block mb-1 text-primary"
              >
                {selectedExperience.title}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {selectedExperience.content}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span>@{selectedExperience.user_profiles?.username}</span>
                <span>
                  {formatDistanceToNow(new Date(selectedExperience.occurred_at || selectedExperience.created_at), {
                    addSuffix: true,
                    locale: de
                  })}
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Heatmap Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Hide' : 'Show'} Heatmap
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-10 max-w-xs">
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2">Legend</p>
          <div className="space-y-1 text-xs">
            {categories.map((cat) => (
              <div key={cat.slug} className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="absolute top-4 right-16 z-10">
        <CardContent className="p-3">
          <p className="text-sm font-semibold">
            {validExperiences.length} Experiences
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function for category icons
function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'ufo': '🛸',
    'paranormal': '👻',
    'dreams': '💭',
    'psychedelic': '🌈',
    'spiritual': '✨',
    'synchronicity': '🔄',
    'nde': '💫',
    'other': '❓'
  }
  return icons[category] || '📍'
}

const categories = [
  { slug: 'ufo', name: 'UFO', icon: '🛸' },
  { slug: 'paranormal', name: 'Paranormal', icon: '👻' },
  { slug: 'dreams', name: 'Dreams', icon: '💭' },
  { slug: 'psychedelic', name: 'Psychedelic', icon: '🌈' },
  { slug: 'spiritual', name: 'Spiritual', icon: '✨' },
  { slug: 'synchronicity', name: 'Synchronicity', icon: '🔄' },
  { slug: 'nde', name: 'Near-Death', icon: '💫' },
  { slug: 'other', name: 'Other', icon: '❓' },
]
