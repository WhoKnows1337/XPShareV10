/**
 * XPShare AI - Universal Tool Renderer
 *
 * Dynamically renders UI for all AI tool results.
 * Supports all 16 tools from Search, Analytics, Relationships, and Insights categories.
 */

'use client'

import { TimelineToolUI, MapToolUI, NetworkToolUI, HeatmapToolUI, ComparisonToolUI } from '@/components/viz/tool-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { TrendChart } from '@/components/discover/TrendChart'
import { FollowUpSuggestions } from '@/components/discover/FollowUpSuggestions'
import { ExportButton } from '@/components/discover/ExportButton'
import { InsightCard } from '@/components/discover/InsightCard'
import { ErrorDisplay } from '@/components/discover/ErrorDisplay'
import { createStructuredError } from '@/lib/errors/error-types'

// ============================================================================
// Props
// ============================================================================

export interface ToolRendererProps {
  part: any // AI SDK tool part
  onRetry?: () => void
  onSuggestionClick?: (query: string) => void
}

// ============================================================================
// Tool Rendering Helpers
// ============================================================================

/**
 * Render search results as list
 */
function renderSearchResults(data: any, title?: string) {
  const results = data?.results || data?.data || []
  const count = data?.count || results.length

  if (count === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Search Results'}</CardTitle>
          <CardDescription>No results found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title || 'Search Results'}</CardTitle>
            <CardDescription>Found {count} experiences</CardDescription>
          </div>
          <ExportButton data={results} filename="search-results" size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.slice(0, 10).map((item: any, i: number) => (
            <div
              key={item.id || i}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-sm">{item.title || item.name || `Item ${i + 1}`}</h4>
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {item.location_text && <span>📍 {item.location_text}</span>}
                {item.date_occurred && <span>📅 {item.date_occurred.substring(0, 10)}</span>}
              </div>
            </div>
          ))}
          {count > 10 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Showing 10 of {count} results
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Render analytics results as metrics
 */
function renderAnalyticsResults(data: any, title?: string) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title || 'Analytics Results'}</CardTitle>
          <ExportButton data={data} filename="analytics-results" size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}

/**
 * Render error state with structured ErrorDisplay
 */
function renderError(error: any, onRetry?: () => void) {
  // Convert error to StructuredError format
  const structuredError = createStructuredError(error)

  return (
    <ErrorDisplay
      error={structuredError}
      onRetry={onRetry}
      showTechnicalDetails={false}
    />
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ToolRenderer({ part, onRetry, onSuggestionClick }: ToolRendererProps) {
  const toolName = part.type.replace('tool-', '')

  // AI SDK v5: Check part.state and use part.output when available
  let result = part.result // Fallback for older format

  if (part.state === 'output-available' && part.output) {
    result = part.output
  } else if (part.state === 'output-error') {
    return renderError(part.errorText || 'Tool execution failed', onRetry)
  } else if (part.state === 'input-streaming' || part.state === 'input-available') {
    // Tool is still executing or waiting for output
    return (
      <Card>
        <CardHeader>
          <CardTitle>{toolName}</CardTitle>
          <CardDescription>Executing tool...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isError = part.isError || result?.error || result?.success === false

  // Handle errors
  if (isError) {
    return renderError(result?.error || result, onRetry)
  }

  // Visualization Tools (from Phase 4)
  if (toolName === 'analyze_timeline' || part.type === 'tool-analyze_timeline') {
    return <TimelineToolUI toolResult={part} />
  }
  if (toolName === 'analyze_geographic' || part.type === 'tool-analyze_geographic') {
    return <MapToolUI toolResult={part} />
  }
  if (toolName === 'analyze_network' || part.type === 'tool-analyze_network') {
    return <NetworkToolUI toolResult={part} />
  }
  if (toolName === 'analyze_heatmap' || part.type === 'tool-analyze_heatmap') {
    return <HeatmapToolUI toolResult={part} />
  }

  // Search Tools
  if (
    toolName === 'advancedSearch' ||
    toolName === 'semanticSearch' ||
    toolName === 'fullTextSearch' ||
    toolName === 'searchByAttributes'
  ) {
    return renderSearchResults(result, 'Search Results')
  }
  if (toolName === 'geoSearch') {
    return <MapToolUI toolResult={result} title="Geographic Search Results" />
  }

  // Analytics Tools
  if (
    toolName === 'rankUsers' ||
    toolName === 'analyzeCategory' ||
    toolName === 'compareCategory' ||
    toolName === 'temporalAnalysis' ||
    toolName === 'attributeCorrelation'
  ) {
    // Check if temporal analysis has timeline data (AI SDK v5: pass entire part object)
    if (toolName === 'temporalAnalysis') {
      return <TimelineToolUI toolResult={part} title="Temporal Analysis" />
    }
    // Comparison tool gets its own visualization
    if (toolName === 'compareCategory') {
      return <ComparisonToolUI toolResult={part} />
    }
    return renderAnalyticsResults(result, toolName.replace(/([A-Z])/g, ' $1').trim())
  }

  // Relationship Tools
  if (toolName === 'findConnections') {
    return <NetworkToolUI toolResult={result} title="Connection Network" />
  }
  if (toolName === 'detectPatterns') {
    return renderAnalyticsResults(result, 'Detected Patterns')
  }

  // Insights Tools (Phase 5)
  if (toolName === 'generateInsights') {
    const insights = result?.insights || []
    return (
      <div className="space-y-3">
        {insights.map((insight: any, i: number) => (
          <InsightCard
            key={insight.id || i}
            type={insight.type}
            pattern={insight.title}
            confidence={insight.confidence}
            dataPoints={insight.evidence || []}
            details={insight.description}
          />
        ))}
      </div>
    )
  }

  if (toolName === 'predictTrends') {
    const trendAnalysis = result?.trend
    if (trendAnalysis) {
      return <TrendChart trendAnalysis={trendAnalysis} />
    }
    return renderAnalyticsResults(result, 'Trend Predictions')
  }

  if (toolName === 'suggestFollowups') {
    const suggestions = result?.suggestions || []
    return (
      <FollowUpSuggestions
        suggestions={suggestions}
        onSuggestionClick={(suggestion) => onSuggestionClick?.(suggestion.query)}
        variant="grid"
      />
    )
  }

  if (toolName === 'exportResults') {
    const exportData = result?.export
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Complete</CardTitle>
          <CardDescription>
            {exportData?.recordCount} records exported as {exportData?.format?.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            File size: {(exportData?.size / 1024).toFixed(2)} KB
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([exportData?.content], {
                type: exportData?.format === 'csv' ? 'text/csv' : 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = exportData?.filename
              link.click()
              URL.revokeObjectURL(url)
            }}
          >
            Download {exportData?.filename}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Fallback: render raw JSON
  return renderAnalyticsResults(result, toolName)
}
