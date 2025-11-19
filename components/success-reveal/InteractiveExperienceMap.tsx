'use client'

import { motion } from 'framer-motion'
import { Map as MapIcon, MapPin, Layers } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface ExperienceLocation {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  date: string
}

interface InteractiveExperienceMapProps {
  category: string
  centerLat: number
  centerLng: number
  similarExperiences: ExperienceLocation[]
  radius?: number
}

export function InteractiveExperienceMap({
  category,
  centerLat,
  centerLng,
  similarExperiences,
  radius = 50,
}: InteractiveExperienceMapProps) {
  const theme = getCategoryTheme(category)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      console.warn('Mapbox token not found')
      return
    }

    mapboxgl.accessToken = mapboxToken

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [centerLng, centerLat],
      zoom: 9,
      pitch: 0,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Wait for map to load
    map.current.on('load', () => {
      setMapLoaded(true)

      // Add user's experience marker (larger, primary)
      new mapboxgl.Marker({
        color: '#3b82f6', // blue
        scale: 1.2,
      })
        .setLngLat([centerLng, centerLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            '<div class="p-2"><strong>Deine Erfahrung</strong><br/>Hier bist du</div>'
          )
        )
        .addTo(map.current!)

      // Add similar experiences markers
      similarExperiences.forEach((exp) => {
        new mapboxgl.Marker({
          color: '#8b5cf6', // purple
          scale: 0.8,
        })
          .setLngLat([exp.lng, exp.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2"><strong>${exp.title || 'Ähnliche Erfahrung'}</strong><br/>${new Date(exp.date).toLocaleDateString('de-DE')}</div>`
            )
          )
          .addTo(map.current!)
      })

      // Add radius circle
      if (radius > 0) {
        const radiusInMeters = radius * 1000
        const points = 64
        const coordinates = []

        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI
          const dx = radiusInMeters * Math.cos(angle)
          const dy = radiusInMeters * Math.sin(angle)

          // Convert meters to degrees (approximate)
          const deltaLat = dy / 111320
          const deltaLng = dx / (111320 * Math.cos((centerLat * Math.PI) / 180))

          coordinates.push([centerLng + deltaLng, centerLat + deltaLat])
        }
        coordinates.push(coordinates[0]) // Close the circle

        map.current!.addSource('radius', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates],
            },
          },
        })

        map.current!.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.1,
          },
        })

        map.current!.addLayer({
          id: 'radius-outline',
          type: 'line',
          source: 'radius',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.5,
          },
        })
      }

      // Fit bounds to show all markers
      if (similarExperiences.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([centerLng, centerLat])
        similarExperiences.forEach((exp) => bounds.extend([exp.lng, exp.lat]))
        map.current!.fitBounds(bounds, { padding: 50, maxZoom: 12 })
      }
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [centerLat, centerLng, similarExperiences, radius])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <MapIcon className={`h-6 w-6 ${theme.accentColor}`} />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Geografische Verteilung</h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
          <MapPin className={`h-4 w-4 ${theme.accentColor}`} />
          <span className="text-sm font-medium text-white">
            {similarExperiences.length} {similarExperiences.length === 1 ? 'Erfahrung' : 'Erfahrungen'}
          </span>
        </div>
      </div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl border ${theme.borderColor} bg-black/40 backdrop-blur-sm`}
      >
        <div ref={mapContainer} className="h-[400px] w-full" />

        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <Layers className={`mx-auto mb-2 h-8 w-8 animate-pulse ${theme.accentColor}`} />
              <p className="text-sm text-white/70">Karte wird geladen...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-white/20 bg-black/80 p-3 backdrop-blur-sm">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-white/90">Deine Erfahrung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-white/90">Ähnliche Erfahrungen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-3 bg-blue-500/50" />
              <span className="text-white/70">{radius}km Radius</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-white">
            {similarExperiences.length}
          </div>
          <div className="text-xs text-white/60">Ähnliche Erfahrungen</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-white">{radius} km</div>
          <div className="text-xs text-white/60">Radius</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-white">
            {similarExperiences.filter((exp) => {
              const daysDiff = Math.abs(
                (new Date().getTime() - new Date(exp.date).getTime()) / (1000 * 60 * 60 * 24)
              )
              return daysDiff <= 30
            }).length}
          </div>
          <div className="text-xs text-white/60">Letzte 30 Tage</div>
        </div>
      </div>
    </motion.div>
  )
}
