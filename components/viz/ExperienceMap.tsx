/**
 * XPShare AI - Experience Map Visualization
 *
 * Interactive map showing geographic distribution of experiences.
 * Uses Leaflet with marker clustering and category-based colors.
 */

'use client'

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExperienceMapProps {
  /** Experience data with geographic coordinates */
  data: Array<{
    id: string
    title: string
    category: string
    location_lat?: number
    location_lng?: number
    location_text?: string
    date_occurred?: string
    [key: string]: any
  }>

  /** Map height in pixels */
  height?: number

  /** Enable marker clustering */
  enableClustering?: boolean

  /** Color theme */
  theme?: 'light' | 'dark'

  /** Zoom level (1-18, default auto-calculated) */
  zoom?: number

  /** Center point [lat, lng] (default auto-calculated) */
  center?: [number, number]
}

// ============================================================================
// Category Colors (matching TimelineChart)
// ============================================================================

const CATEGORY_COLORS: Record<string, string> = {
  ufo: '#8b5cf6', // purple
  dreams: '#3b82f6', // blue
  nde: '#10b981', // green
  synchronicity: '#f59e0b', // amber
  psychic: '#ec4899', // pink
  ghost: '#6366f1', // indigo
  default: '#64748b', // slate
}

// ============================================================================
// Custom Marker Icons
// ============================================================================

/**
 * Create custom colored marker icon for category
 */
function createCategoryIcon(category: string): L.DivIcon {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.default

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

// ============================================================================
// Auto-Center Component
// ============================================================================

/**
 * Component to auto-fit map bounds to markers
 */
function AutoCenter({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [bounds, map])

  return null
}

// ============================================================================
// Experience Map Component
// ============================================================================

export function ExperienceMap({
  data,
  height = 500,
  enableClustering = true,
  theme = 'light',
  zoom,
  center,
}: ExperienceMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Filter data to only include items with valid coordinates
  const validData = useMemo(() => {
    return data.filter(
      (item) =>
        item.location_lat !== undefined &&
        item.location_lng !== undefined &&
        !isNaN(item.location_lat) &&
        !isNaN(item.location_lng) &&
        item.location_lat >= -90 &&
        item.location_lat <= 90 &&
        item.location_lng >= -180 &&
        item.location_lng <= 180
    )
  }, [data])

  // Calculate bounds and center
  const { bounds, calculatedCenter, calculatedZoom } = useMemo(() => {
    if (validData.length === 0) {
      return {
        bounds: null,
        calculatedCenter: [0, 0] as [number, number],
        calculatedZoom: 2,
      }
    }

    if (validData.length === 1) {
      return {
        bounds: null,
        calculatedCenter: [validData[0].location_lat!, validData[0].location_lng!] as [
          number,
          number
        ],
        calculatedZoom: 10,
      }
    }

    // Create bounds from all points
    const latLngs = validData.map((item) => [item.location_lat!, item.location_lng!] as [
      number,
      number
    ])
    const bounds = L.latLngBounds(latLngs)

    // Calculate center
    const calculatedCenter = bounds.getCenter()

    return {
      bounds,
      calculatedCenter: [calculatedCenter.lat, calculatedCenter.lng] as [number, number],
      calculatedZoom: 4,
    }
  }, [validData])

  const mapCenter = center || calculatedCenter
  const mapZoom = zoom || calculatedZoom

  // Tile layer based on theme
  const tileLayer =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

  // Render empty state
  if (validData.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No geographic data available</p>
          <p className="text-sm">Experiences need location coordinates to display on map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer attribution={attribution} url={tileLayer} />

        <AutoCenter bounds={bounds} />

        {enableClustering ? (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
            {validData.map((experience) => (
              <Marker
                key={experience.id}
                position={[experience.location_lat!, experience.location_lng!]}
                icon={createCategoryIcon(experience.category)}
              >
                <Popup maxWidth={300} minWidth={200}>
                  <div className="p-2">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">
                      {experience.title}
                    </h3>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[experience.category] || CATEGORY_COLORS.default,
                          }}
                        />
                        <span className="capitalize text-gray-700">{experience.category}</span>
                      </div>

                      {experience.location_text && (
                        <p className="text-gray-600">📍 {experience.location_text}</p>
                      )}

                      {experience.date_occurred && (
                        <p className="text-gray-600">
                          📅 {new Date(experience.date_occurred).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {experience.description && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                        {experience.description}
                      </p>
                    )}

                    <a
                      href={`/experiences/${experience.id}`}
                      className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          <>
            {validData.map((experience) => (
              <Marker
                key={experience.id}
                position={[experience.location_lat!, experience.location_lng!]}
                icon={createCategoryIcon(experience.category)}
              >
                <Popup maxWidth={300} minWidth={200}>
                  <div className="p-2">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">
                      {experience.title}
                    </h3>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[experience.category] || CATEGORY_COLORS.default,
                          }}
                        />
                        <span className="capitalize text-gray-700">{experience.category}</span>
                      </div>

                      {experience.location_text && (
                        <p className="text-gray-600">📍 {experience.location_text}</p>
                      )}

                      {experience.date_occurred && (
                        <p className="text-gray-600">
                          📅 {new Date(experience.date_occurred).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {experience.description && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                        {experience.description}
                      </p>
                    )}

                    <a
                      href={`/experiences/${experience.id}`}
                      className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>

      <div className="mt-2 text-sm text-gray-500">
        {validData.length} locations shown
        {validData.length < data.length &&
          ` (${data.length - validData.length} items without coordinates)`}
      </div>
    </div>
  )
}
