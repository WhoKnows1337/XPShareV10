'use client'

import { Button } from '@/components/ui/button'
import { HeatmapChart } from '@/components/discover/HeatmapChart'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { HeatmapArgs, HeatmapResult } from '@/types/discovery-tools'
import { HeatmapSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'
import { XPShareTool, XPShareToolHeader, ToolContent, ToolInput } from '@/components/ai-elements/xpshare-tool'

interface HeatmapToolUIProps {
  part: {
    type: 'tool-analyze_heatmap'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: HeatmapArgs
    output?: HeatmapResult
    error?: Error
    errorText?: string
  }
  onRetry?: () => void
}

export function HeatmapToolUI({ part, onRetry }: HeatmapToolUIProps) {
  const renderOutput = () => {
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
        <div className="flex items-start justify-between gap-3 p-4 border-l-4 border-destructive bg-destructive/10 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-destructive font-medium">Failed to analyze heatmap</p>
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
      defaultOpen={part.state === 'output-available'}
      category="Consciousness"
      showGradient
    >
      <XPShareToolHeader
        title="Heatmap Analysis"
        type={part.type}
        state={part.state}
        category="Consciousness"
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
