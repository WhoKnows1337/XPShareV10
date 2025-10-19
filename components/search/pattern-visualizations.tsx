'use client'

/**
 * Search 5.0 - Pattern Visualizations
 *
 * Standalone visualization components for pattern data:
 * - DistributionChart: Horizontal bar chart for categorical data
 * - TimelineChart: Line/area chart for temporal patterns
 * - GeoClusterMap: Geographic cluster visualization
 *
 * @see docs/masterdocs/search5.md (Part 2.2 - Pattern Visualization)
 */

import React from 'react'
import { PatternData } from '@/types/search5'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ============================================================================
// DISTRIBUTION CHART
// ============================================================================

interface DistributionChartProps {
  data: PatternData['distribution']
  maxItems?: number
  height?: number
  className?: string
}

export function DistributionChart({
  data,
  maxItems = 10,
  height = 300,
  className
}: DistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)} style={{ height }}>
        Keine Daten verfügbar
      </div>
    )
  }

  const displayData = data.slice(0, maxItems)
  const maxCount = Math.max(...displayData.map(d => d.count))

  return (
    <div className={cn('space-y-3', className)}>
      {displayData.map((item, i) => {
        const percentage = item.percentage || (item.count / maxCount * 100)

        return (
          <div key={i} className="space-y-1.5">
            {/* Label & Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[200px]">
                {item.label}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-muted-foreground">
                  {item.count}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-8 bg-muted rounded-lg overflow-hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-full rounded-lg transition-all duration-500',
                        'bg-gradient-to-r from-blue-500 to-purple-500',
                        'hover:from-blue-600 hover:to-purple-600',
                        'flex items-center justify-end px-3'
                      )}
                      style={{
                        width: `${Math.max(percentage, 5)}%` // Minimum 5% for visibility
                      }}
                    >
                      {percentage > 20 && (
                        <span className="text-xs font-medium text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">{item.label}</p>
                      <p>{item.count} Berichte ({percentage.toFixed(1)}%)</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )
      })}

      {/* Show More Indicator */}
      {data.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          +{data.length - maxItems} weitere Einträge
        </p>
      )}
    </div>
  )
}

// ============================================================================
// TIMELINE CHART
// ============================================================================

interface TimelineChartProps {
  data: PatternData['timeline']
  height?: number
  className?: string
}

export function TimelineChart({
  data,
  height = 200,
  className
}: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)} style={{ height }}>
        Keine Daten verfügbar
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))
  const minCount = Math.min(...data.map(d => d.count))
  const range = maxCount - minCount

  // Calculate bar heights as percentages
  const bars = data.map(item => ({
    ...item,
    heightPercent: range > 0
      ? ((item.count - minCount) / range) * 80 + 20 // Min 20%, max 100%
      : 50 // All equal
  }))

  return (
    <div className={cn('', className)}>
      {/* Chart Container */}
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {bars.map((item, i) => {
          const isHighlight = item.highlight
          const barHeight = item.heightPercent

          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex-1 flex flex-col items-center justify-end cursor-pointer group"
                  >
                    {/* Bar */}
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-300',
                        isHighlight
                          ? 'bg-gradient-to-t from-purple-600 to-purple-400 group-hover:from-purple-700 group-hover:to-purple-500'
                          : 'bg-gradient-to-t from-blue-500/60 to-blue-400/60 group-hover:from-blue-600 group-hover:to-blue-500',
                        isHighlight && 'ring-2 ring-purple-500 ring-offset-2'
                      )}
                      style={{
                        height: `${barHeight}%`,
                        minHeight: '10px'
                      }}
                    />

                    {/* Label (every 3rd month or highlighted) */}
                    {(i % 3 === 0 || isHighlight) && (
                      <span className={cn(
                        'text-xs mt-2 truncate max-w-full',
                        isHighlight ? 'font-semibold text-purple-600' : 'text-muted-foreground'
                      )}>
                        {formatMonth(item.month)}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">{item.month}</p>
                    <p>{item.count} {item.count === 1 ? 'Bericht' : 'Berichte'}</p>
                    {isHighlight && <p className="text-purple-400">Höhepunkt</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Y-Axis Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
        <span>Min: {minCount}</span>
        <span>Max: {maxCount}</span>
      </div>
    </div>
  )
}

// ============================================================================
// GEO CLUSTER MAP
// ============================================================================

interface GeoClusterMapProps {
  data: PatternData['geoCluster']
  className?: string
}

export function GeoClusterMap({
  data,
  className
}: GeoClusterMapProps) {
  if (!data) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        Keine geografischen Daten verfügbar
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cluster Info */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Zentrum
          </span>
          <span className="text-sm font-semibold">
            {data.center}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Radius
          </span>
          <span className="text-sm font-semibold">
            {data.radius} km
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Berichte im Cluster
          </span>
          <span className="text-sm font-semibold">
            {data.count}
          </span>
        </div>
      </div>

      {/* Heatmap Visualization (if available) */}
      {data.heatmap && data.heatmap.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            Heatmap Punkte
          </h5>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
            {data.heatmap.map((point, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
              >
                <span className="text-muted-foreground">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </span>
                <div
                  className={cn(
                    'h-2 w-12 rounded-full',
                    'bg-gradient-to-r from-yellow-500 to-red-500'
                  )}
                  style={{
                    opacity: point.weight
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for future map integration */}
      <div className="bg-muted/20 border-2 border-dashed rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Interactive Map Integration (Leaflet/Mapbox)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Cluster: {data.center} ({data.radius} km)
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// COMBINED VISUALIZATION COMPONENT
// ============================================================================

interface PatternVisualizationProps {
  data: PatternData
  type?: 'distribution' | 'timeline' | 'geo' | 'auto'
  height?: number
  className?: string
}

export function PatternVisualization({
  data,
  type = 'auto',
  height,
  className
}: PatternVisualizationProps) {
  // Auto-detect visualization type from available data
  const vizType = type === 'auto'
    ? (data.distribution && data.distribution.length > 0 ? 'distribution' :
       data.timeline && data.timeline.length > 0 ? 'timeline' :
       data.geoCluster ? 'geo' : null)
    : type

  if (!vizType) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        Keine Visualisierungsdaten verfügbar
      </div>
    )
  }

  switch (vizType) {
    case 'distribution':
      return <DistributionChart data={data.distribution} height={height} className={className} />
    case 'timeline':
      return <TimelineChart data={data.timeline} height={height} className={className} />
    case 'geo':
      return <GeoClusterMap data={data.geoCluster} className={className} />
    default:
      return null
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format month string (YYYY-MM) to readable format
 */
function formatMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    const monthName = monthNames[parseInt(month) - 1]
    return `${monthName} '${year.slice(2)}`
  } catch {
    return monthStr
  }
}
