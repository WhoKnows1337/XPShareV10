'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Experience {
  id: string
  title: string
  content?: string
  created_at: string
  location?: {
    name: string
    coordinates?: [number, number]
  }
  similarity: number
}

interface MapViewProps {
  experiences: Experience[]
}

// Get time-based color for marker
function getTimeColor(createdAt: string): string {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const daysSince = (now - created) / (1000 * 60 * 60 * 24)

  if (daysSince <= 7) return '#ef4444' // Red - last 7 days
  if (daysSince <= 30) return '#eab308' // Yellow - last month
  return '#94a3b8' // Gray - older
}

function getTimeLabel(createdAt: string): string {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const daysSince = (now - created) / (1000 * 60 * 60 * 24)

  if (daysSince <= 7) return 'Last 7 days'
  if (daysSince <= 30) return 'Last month'
  return 'Older'
}

export default function MapView({ experiences }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return // Initialize map only once

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error('Mapbox token not found')
      return
    }

    mapboxgl.accessToken = token

    // Filter experiences with valid coordinates
    const validExperiences = experiences.filter(
      (exp) => exp.location?.coordinates && exp.location.coordinates.length === 2
    )

    if (validExperiences.length === 0) {
      return
    }

    // Calculate center and bounds
    const coordinates = validExperiences.map((exp) => exp.location!.coordinates!)
    const bounds = new mapboxgl.LngLatBounds()
    coordinates.forEach((coord) => bounds.extend(coord as [number, number]))

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      bounds: bounds,
      fitBoundsOptions: { padding: 50 },
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Create GeoJSON source for clustering
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validExperiences.map((exp) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: exp.location!.coordinates!,
          },
          properties: {
            id: exp.id,
            title: exp.title || 'Experience',
            content: exp.content || '',
            location: exp.location!.name,
            similarity: exp.similarity,
            created_at: exp.created_at,
            color: getTimeColor(exp.created_at),
            timeLabel: getTimeLabel(exp.created_at),
          },
        })),
      }

      // Add clustered source
      map.current!.addSource('experiences', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Add cluster circles
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'experiences',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#a855f7', // Purple for small clusters
            10,
            '#ec4899', // Pink for medium clusters
            25,
            '#ef4444', // Red for large clusters
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 25, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Add cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'experiences',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Add unclustered points
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'experiences',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Click handler for clusters
      map.current!.on('click', 'clusters', (e) => {
        if (!map.current) return
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        if (!features[0] || !features[0].properties) return
        const clusterId = features[0].properties.cluster_id
        const source = map.current.getSource('experiences') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null) return
          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom,
          })
        })
      })

      // Click handler for individual points
      map.current!.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return
        const props = e.features[0].properties
        if (!props) return

        new mapboxgl.Popup()
          .setLngLat((e.features[0].geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`
            <div style="padding: 12px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${props.color};"></div>
                <span style="font-size: 11px; color: #94a3b8;">${props.timeLabel}</span>
              </div>
              <strong style="font-size: 14px;">${props.title}</strong><br/>
              <small style="color: #94a3b8;">${props.location}</small><br/>
              ${props.content ? `<p style="margin: 8px 0; font-size: 12px; color: #64748b;">${props.content.substring(0, 100)}...</p>` : ''}
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155;">
                <span style="color: #a855f7; font-weight: 600;">${Math.round(props.similarity * 100)}% match</span>
              </div>
            </div>
          `)
          .addTo(map.current!)
      })

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
      map.current!.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Cleanup
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [experiences])

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Last 7 days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Last month</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-400" />
          <span className="text-muted-foreground">Older</span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg overflow-hidden" />

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {experiences.filter(e => e.location?.coordinates).length} experiences on map
      </div>
    </div>
  )
}
