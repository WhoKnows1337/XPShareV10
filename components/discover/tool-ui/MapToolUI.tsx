'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExperienceMapCard } from '@/components/discover/ExperienceMapCard'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { GeographicArgs, GeographicResult } from '@/types/discovery-tools'
import { MapSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'

interface MapToolUIProps {
  part: {
    type: 'tool-analyze_geographic'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: GeographicArgs
    output?: GeographicResult
    error?: Error
  }
  onRetry?: () => void
}

export function MapToolUI({ part, onRetry }: MapToolUIProps) {
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
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-red-600 font-medium">Failed to load map</p>
              <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
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
      </Card>
    )
  }

  return null
}
