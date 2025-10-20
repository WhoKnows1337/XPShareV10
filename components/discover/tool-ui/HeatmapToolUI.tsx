'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeatmapChart } from '@/components/discover/HeatmapChart'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { HeatmapArgs, HeatmapResult } from '@/types/discovery-tools'
import { HeatmapSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'

interface HeatmapToolUIProps {
  part: {
    type: 'tool-analyze_heatmap'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: HeatmapArgs
    output?: HeatmapResult
    error?: Error
  }
  onRetry?: () => void
}

export function HeatmapToolUI({ part, onRetry }: HeatmapToolUIProps) {
  if (part.state === 'input-available') {
    return <HeatmapSkeletonLoader />
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <LazyChart fallback={<HeatmapSkeletonLoader />}>
        <div className="space-y-2">
          <HeatmapChart
            data={part.output.data}
            title={`Heatmap: ${part.input.query}`}
          />
          <p className="text-xs text-muted-foreground">
            Analyzed {part.output.total} experiences across categories and time periods
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
              <p className="text-red-600 font-medium">Failed to analyze heatmap</p>
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
