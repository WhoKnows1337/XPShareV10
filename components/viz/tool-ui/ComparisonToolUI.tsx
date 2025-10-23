/**
 * XPShare AI - Category Comparison Tool UI
 *
 * Visual comparison of two categories with metrics and charts.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar } from 'lucide-react'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ComparisonToolUIProps {
  /** Tool result data */
  toolResult: any

  /** Title override */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract comparison data from AI SDK v5 tool result
 */
function extractComparisonData(toolResult: any) {
  // AI SDK v5: Extract output from tool part if available
  const actualResult = toolResult?.output || toolResult?.result || toolResult

  return {
    categoryA: actualResult?.categoryA || 'Category A',
    categoryB: actualResult?.categoryB || 'Category B',
    volumeComparison: actualResult?.volumeComparison || {},
    geoComparison: actualResult?.geoComparison || {},
    temporalComparison: actualResult?.temporalComparison || {},
    attributeComparison: actualResult?.attributeComparison || {},
    summary: actualResult?.summary || {},
    summaryText: actualResult?.summaryText || '',
  }
}

/**
 * Render trend icon based on difference
 */
function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-gray-400" />
}

// ============================================================================
// ComparisonToolUI Component
// ============================================================================

export function ComparisonToolUI({ toolResult, title, theme = 'light' }: ComparisonToolUIProps) {
  const data = extractComparisonData(toolResult)

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{title || `${data.categoryA} vs ${data.categoryB}`}</CardTitle>
          <CardDescription>{data.summaryText}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Volume Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Volume Comparison
              <TrendIcon value={data.volumeComparison?.difference || 0} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.categoryA}</span>
                <Badge variant="secondary">{data.volumeComparison?.categoryA?.count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.categoryB}</span>
                <Badge variant="secondary">{data.volumeComparison?.categoryB?.count || 0}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Difference</span>
                  <span className="text-sm font-semibold">
                    {Math.abs(data.volumeComparison?.difference || 0)}
                  </span>
                </div>
                {data.volumeComparison?.ratio !== undefined && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Ratio</span>
                    <span className="text-sm font-semibold">
                      {data.volumeComparison.ratio.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Category A Locations */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {data.categoryA}
                </p>
                {data.geoComparison?.categoryA?.topLocations?.slice(0, 3).map((loc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{loc.location}</span>
                    <Badge variant="outline" className="ml-2">
                      {loc.count}
                    </Badge>
                  </div>
                )) || <p className="text-xs text-gray-400">No locations</p>}
              </div>

              {/* Category B Locations */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {data.categoryB}
                </p>
                {data.geoComparison?.categoryB?.topLocations?.slice(0, 3).map((loc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{loc.location}</span>
                    <Badge variant="outline" className="ml-2">
                      {loc.count}
                    </Badge>
                  </div>
                )) || <p className="text-xs text-gray-400">No locations</p>}
              </div>

              {/* Overlap */}
              {data.geoComparison?.overlap?.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    Shared Locations: {data.geoComparison.overlap.length}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Temporal Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Temporal Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.categoryA} Peak</span>
                <Badge variant="secondary">
                  {data.temporalComparison?.categoryA?.peakMonth || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.categoryB} Peak</span>
                <Badge variant="secondary">
                  {data.temporalComparison?.categoryB?.peakMonth || 'N/A'}
                </Badge>
              </div>
              {data.temporalComparison?.correlation !== undefined && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Correlation</span>
                    <span className="text-sm font-semibold">
                      {(data.temporalComparison.correlation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attribute Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attribute Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.attributeComparison?.shared?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                    Shared Attributes ({data.attributeComparison.shared.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {data.attributeComparison.shared.slice(0, 5).map((attr: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.attributeComparison?.uniqueToA?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Unique to {data.categoryA} ({data.attributeComparison.uniqueToA.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {data.attributeComparison.uniqueToA.slice(0, 3).map((attr: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.attributeComparison?.uniqueToB?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                    Unique to {data.categoryB} ({data.attributeComparison.uniqueToB.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {data.attributeComparison.uniqueToB.slice(0, 3).map((attr: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      {data.summary && Object.keys(data.summary).length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {data.summary.volumeDifference !== undefined && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Volume Diff</p>
                  <p className="text-lg font-bold">{Math.abs(data.summary.volumeDifference)}</p>
                </div>
              )}
              {data.summary.geoOverlap !== undefined && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Geo Overlap</p>
                  <p className="text-lg font-bold">{data.summary.geoOverlap}</p>
                </div>
              )}
              {data.summary.temporalCorrelation !== undefined && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Time Correlation</p>
                  <p className="text-lg font-bold">
                    {(data.summary.temporalCorrelation * 100).toFixed(0)}%
                  </p>
                </div>
              )}
              {data.summary.sharedAttributes !== undefined && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Shared Attrs</p>
                  <p className="text-lg font-bold">{data.summary.sharedAttributes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
