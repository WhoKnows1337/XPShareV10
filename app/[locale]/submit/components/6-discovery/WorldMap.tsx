'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapData } from '@/lib/stores/submitStore'

interface WorldMapProps {
  mapData: MapData
}

export const WorldMap = ({ mapData }: WorldMapProps) => {
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

    // Filter valid dots
    const validDots = mapData.dots.filter(
      (dot) => dot.lat !== undefined && dot.lng !== undefined
    )

    if (validDots.length === 0) {
      return
    }

    // Calculate bounds
    const bounds = new mapboxgl.LngLatBounds()
    validDots.forEach((dot) => bounds.extend([dot.lng, dot.lat]))

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: bounds,
      fitBoundsOptions: { padding: 50, maxZoom: 10 },
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Create GeoJSON source for clustering
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validDots.map((dot, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [dot.lng, dot.lat],
          },
          properties: {
            id: `dot-${index}`,
            count: dot.count,
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
            '#8b5cf6', // Purple for small clusters
            10,
            '#6366f1', // Indigo for medium clusters
            25,
            '#3b82f6', // Blue for large clusters
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
          'circle-color': '#8b5cf6',
          'circle-radius': 10,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Add count labels for unclustered points
      map.current!.addLayer({
        id: 'unclustered-count',
        type: 'symbol',
        source: 'experiences',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': '{count}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Click handler for clusters
      map.current!.on('click', 'clusters', (e) => {
        if (!map.current) return
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        if (!features || !features[0]) return
        const clusterId = features[0].properties?.cluster_id
        if (!clusterId) return
        const source = map.current.getSource('experiences') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || !features[0] || zoom === null) return
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
            <div style="padding: 12px; min-width: 150px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${props.count}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                ${props.count === 1 ? 'Erfahrung' : 'Erfahrungen'} an diesem Ort
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
  }, [mapData])

  const totalExperiences = mapData.dots.reduce((sum, dot) => sum + dot.count, 0)
  const totalLocations = mapData.dots.length

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Map Container */}
      <div ref={mapContainer} className="h-96 w-full" />

      {/* Map Info */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">{totalLocations}</p>
            <p className="text-sm text-gray-600">Orte</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{totalExperiences}</p>
            <p className="text-sm text-gray-600">Erfahrungen</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {new Set(mapData.dots.map(d => Math.floor(d.lat / 10))).size}
            </p>
            <p className="text-sm text-gray-600">Regionen</p>
          </div>
        </div>
      </div>
    </div>
  )
}
