'use client'

/**
 * Experience Map Component
 *
 * Interactive geographic map showing experience locations with clustering
 * Uses Leaflet for map rendering and MarkerCluster for grouping
 *
 * Features:
 * - Geographic clustering of experiences
 * - Interactive markers with popups
 * - Heatmap overlay option
 * - Category-based color coding
 * - Zoom to bounds on load
 * - Responsive layout
 */

import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { getCategoryColor, formatCategoryName } from '@/lib/constants/categories'

// Dynamic imports to avoid SSR issues with Leaflet
let L: any = null
let MarkerClusterGroup: any = null

interface ExperienceLocation {
  id: string
  title: string
  category: string
  latitude: number
  longitude: number
  date: string
}

interface ExperienceMapProps {
  /**
   * Array of experience locations
   */
  experiences: ExperienceLocation[]

  /**
   * Map height in pixels
   */
  height?: number

  /**
   * Card title
   */
  title?: string

  /**
   * Enable clustering
   */
  enableClustering?: boolean

  /**
   * Enable heatmap layer
   */
  enableHeatmap?: boolean

  /**
   * Show category filter
   */
  showCategoryFilter?: boolean

  /**
   * Additional className
   */
  className?: string
}

export function ExperienceMap({
  experiences,
  height = 400,
  title = 'Experience Map',
  enableClustering = true,
  enableHeatmap = false,
  showCategoryFilter = true,
  className = ''
}: ExperienceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = React.useState(enableHeatmap)

  // Get unique categories from experiences
  const categories = React.useMemo(() => {
    return Array.from(new Set(experiences.map(e => e.category)))
      .sort()
  }, [experiences])

  // Filter experiences by selected category
  const filteredExperiences = React.useMemo(() => {
    if (!selectedCategory) return experiences
    return experiences.filter(e => e.category === selectedCategory)
  }, [experiences, selectedCategory])

  useEffect(() => {
    // Dynamic import Leaflet (client-side only)
    if (typeof window === 'undefined') return

    const initMap = async () => {
      if (!L) {
        L = (await import('leaflet')).default

        // Fix Leaflet icon path issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      }

      if (enableClustering && !MarkerClusterGroup) {
        // @ts-ignore - leaflet.markercluster types not available
        const markerCluster = await import('leaflet.markercluster')
        // Note: CSS must be imported globally in app layout
        MarkerClusterGroup = markerCluster.default
      }

      if (!mapRef.current) return

      // Clear existing map if re-rendering
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Initialize map
      const map = L.map(mapRef.current).setView([0, 0], 2)

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      // Add markers using FILTERED experiences
      if (filteredExperiences.length > 0) {
        const markers = enableClustering && MarkerClusterGroup
          ? new MarkerClusterGroup({
              chunkedLoading: true,
              spiderfyOnMaxZoom: true,
              showCoverageOnHover: false,
              zoomToBoundsOnClick: true,
            })
          : L.layerGroup()

        filteredExperiences.forEach(exp => {
          const color = getCategoryColor(exp.category)

          // Custom icon with category color
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                width: 24px;
                height: 24px;
                background-color: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker([exp.latitude, exp.longitude], { icon })

          // Popup content
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 8px;">${exp.title}</h3>
              <p style="margin: 4px 0; font-size: 12px; color: #64748b;">
                <strong>Category:</strong> ${formatCategoryName(exp.category)}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #64748b;">
                <strong>Date:</strong> ${new Date(exp.date).toLocaleDateString()}
              </p>
              <a href="/experiences/${exp.id}" style="color: ${color}; font-size: 12px; text-decoration: underline;">
                View Details →
              </a>
            </div>
          `

          marker.bindPopup(popupContent)
          markers.addLayer(marker)
        })

        markers.addTo(map)
        markersRef.current = markers

        // Fit bounds to show all markers
        if (filteredExperiences.length > 0) {
          const bounds = L.latLngBounds(
            filteredExperiences.map(exp => [exp.latitude, exp.longitude])
          )
          map.fitBounds(bounds, { padding: [50, 50] })
        }

        // Add heatmap layer if enabled
        if (enableHeatmap && showHeatmap) {
          try {
            // @ts-ignore - leaflet.heat types not available
            const { default: HeatLayer } = await import('leaflet.heat')
            
            const heatData = filteredExperiences.map(exp => [
              exp.latitude,
              exp.longitude,
              0.5 // intensity
            ])

            // @ts-ignore
            const heatLayer = L.heatLayer(heatData, {
              radius: 25,
              blur: 15,
              maxZoom: 10,
              gradient: {
                0.0: 'blue',
                0.5: 'lime',
                1.0: 'red'
              }
            }).addTo(map)

            heatmapLayerRef.current = heatLayer
          } catch (err) {
            console.warn('Heatmap plugin not available:', err)
          }
        }
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [filteredExperiences, enableClustering, enableHeatmap, showHeatmap, selectedCategory])

  // Toggle heatmap visibility
  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {formatCategoryName(category)}
                    </option>
                  ))}
                </select>

                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    aria-label="Clear filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Heatmap Toggle */}
            {enableHeatmap && (
              <button
                onClick={toggleHeatmap}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  showHeatmap
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
                aria-label={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
              >
                {showHeatmap ? 'Hide' : 'Show'} Heatmap
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          style={{ height: `${height}px`, width: '100%' }}
          className="rounded-lg overflow-hidden border"
          role="img"
          aria-label="Interactive map showing geographic distribution of experiences"
        />

        {/* Summary */}
        {filteredExperiences.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <div className="text-2xl font-bold">{filteredExperiences.length}</div>
              <div className="text-xs text-muted-foreground">
                {selectedCategory ? 'Filtered Locations' : 'Locations'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Set(filteredExperiences.map(e => e.category)).size}
              </div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
          </div>
        )}

        {filteredExperiences.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {selectedCategory
                  ? `No experiences found for ${formatCategoryName(selectedCategory)}`
                  : 'No location data available'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
