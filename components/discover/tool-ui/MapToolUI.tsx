'use client'

import { Button } from '@/components/ui/button'
import { ExperienceMapCard } from '@/components/discover/ExperienceMapCard'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { GeographicArgs, GeographicResult } from '@/types/discovery-tools'
import { MapSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'
import { XPShareTool, XPShareToolHeader, ToolContent, ToolInput } from '@/components/ai-elements/xpshare-tool'

interface MapToolUIProps {
  part: {
    type: 'tool-analyze_geographic'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: GeographicArgs
    output?: GeographicResult
    error?: Error
    errorText?: string
  }
  onRetry?: () => void
}

export function MapToolUI({ part, onRetry }: MapToolUIProps) {
  const renderOutput = () => {
    if (part.state === 'input-available') {
      return <MapSkeletonLoader />
    }

    if (part.state === 'output-available' && part.output) {
      return (
        <LazyChart fallback={<MapSkeletonLoader />}>
          <div className="space-y-2">
            <ExperienceMapCard
              markers={part.output.markers}
              title={`Map: ${part.input.query}`}
            />
            <p className="text-xs text-muted-foreground">
              Mapped {part.output.total} locations
            </p>
          </div>
        </LazyChart>
      )
    }

    if (part.state === 'output-error') {
      return (
        <div className="flex items-start justify-between gap-3 p-4 border-l-4 border-destructive bg-destructive/10 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-destructive font-medium">Failed to load map</p>
              <p className="text-sm text-destructive/80">
                {part.error?.message || part.errorText || 'Unknown error'}
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex-shrink-0"
              aria-label="Retry analysis"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <XPShareTool
      defaultOpen={true}
      category="UFO"
      showGradient
    >
      <XPShareToolHeader
        title="Geographic Analysis"
        type={part.type}
        state={part.state}
        category="UFO"
        showGradient
      />
      <ToolContent>
        <ToolInput input={part.input} />
        <div className="p-4">
          {renderOutput()}
        </div>
      </ToolContent>
    </XPShareTool>
  )
}
