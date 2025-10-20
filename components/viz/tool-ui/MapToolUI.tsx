/**
 * XPShare AI - Map Tool UI Wrapper
 *
 * Wrapper component for ExperienceMap with AI tool result integration.
 * Handles data transformation from tool results to map component props.
 */

'use client'

import { ExperienceMap, type ExperienceMapProps } from '../ExperienceMap'

// ============================================================================
// Type Definitions
// ============================================================================

export interface MapToolUIProps {
  /** Tool result data */
  toolResult: any

  /** Override map configuration */
  config?: Partial<ExperienceMapProps>

  /** Title override */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transform tool result to ExperienceMap data format
 */
function transformToolResult(toolResult: any): ExperienceMapProps['data'] {
  // Handle different result formats
  const data =
    toolResult?.results ||
    toolResult?.experiences ||
    toolResult?.data ||
    (Array.isArray(toolResult) ? toolResult : [])

  // Filter and transform to map data format
  return data
    .filter(
      (item: any) =>
        item.location_lat !== undefined &&
        item.location_lng !== undefined &&
        !isNaN(item.location_lat) &&
        !isNaN(item.location_lng)
    )
    .map((item: any) => ({
      id: item.id || item.experience_id || String(Math.random()),
      title: item.title || item.name || 'Untitled Experience',
      category: item.category || 'default',
      location_lat: item.location_lat || item.lat || item.latitude,
      location_lng: item.location_lng || item.lng || item.longitude,
      location_text: item.location_text || item.location || '',
      date_occurred: item.date_occurred || item.created_at || item.timestamp,
      description: item.description || item.summary || '',
      ...item,
    }))
}

/**
 * Extract metadata from tool result
 */
function extractMetadata(toolResult: any): {
  totalCount: number
  geoCount: number
  missingGeoCount: number
} {
  const data =
    toolResult?.results ||
    toolResult?.experiences ||
    toolResult?.data ||
    (Array.isArray(toolResult) ? toolResult : [])

  const totalCount = data.length
  const geoCount = data.filter(
    (item: any) =>
      item.location_lat !== undefined &&
      item.location_lng !== undefined &&
      !isNaN(item.location_lat) &&
      !isNaN(item.location_lng)
  ).length
  const missingGeoCount = totalCount - geoCount

  return { totalCount, geoCount, missingGeoCount }
}

// ============================================================================
// MapToolUI Component
// ============================================================================

export function MapToolUI({ toolResult, config = {}, title, theme = 'light' }: MapToolUIProps) {
  // Transform data
  const mapData = transformToolResult(toolResult)
  const metadata = extractMetadata(toolResult)

  // Generate title
  const mapTitle =
    title ||
    config.title ||
    (toolResult?.summary
      ? `${toolResult.summary} - Map View`
      : `Experience Map (${metadata.geoCount} locations)`)

  return (
    <div className="w-full space-y-4">
      {/* Metadata Banner */}
      {metadata.missingGeoCount > 0 && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ℹ️ Showing {metadata.geoCount} of {metadata.totalCount} experiences.{' '}
            {metadata.missingGeoCount} experiences missing location data.
          </p>
        </div>
      )}

      {/* Summary Text */}
      {toolResult?.summary && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">{toolResult.summary}</p>
        </div>
      )}

      {/* Map Component */}
      <ExperienceMap
        data={mapData}
        height={config.height || 600}
        enableClustering={config.enableClustering ?? true}
        theme={theme}
        zoom={config.zoom}
        center={config.center}
      />

      {/* Tool Result Metadata */}
      {toolResult?.reasoning && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            AI Reasoning
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{toolResult.reasoning}</p>
        </div>
      )}
    </div>
  )
}
