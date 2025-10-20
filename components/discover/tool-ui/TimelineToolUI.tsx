'use client'

import { Button } from '@/components/ui/button'
import { TimelineChart } from '@/components/discover/TimelineChart'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { TimelineArgs, TimelineResult } from '@/types/discovery-tools'
import { TimelineSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'
import { XPShareTool, XPShareToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/xpshare-tool'

interface TimelineToolUIProps {
  part: {
    type: 'tool-analyze_timeline'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: TimelineArgs
    output?: TimelineResult
    error?: Error
    errorText?: string
  }
  onRetry?: () => void
}

export function TimelineToolUI({ part, onRetry }: TimelineToolUIProps) {
  // Custom visualization output
  const renderOutput = () => {
    // State 1: Tool is running
    if (part.state === 'input-available') {
      return <TimelineSkeletonLoader />
    }

    // State 2: Tool completed successfully
    if (part.state === 'output-available' && part.output) {
      return (
        <LazyChart fallback={<TimelineSkeletonLoader />}>
          <div className="space-y-2">
            <TimelineChart
              data={part.output.data}
              granularity={part.output.granularity}
              title={`Timeline: ${part.input.query}`}
              interactive
            />
            <p className="text-xs text-muted-foreground">
              Found {part.output.total} experiences matching your query
            </p>
          </div>
        </LazyChart>
      )
    }

    // State 3: Tool failed
    if (part.state === 'output-error') {
      return (
        <div className="flex items-start justify-between gap-3 p-4 border-l-4 border-destructive bg-destructive/10 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-destructive font-medium">Failed to analyze timeline</p>
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
      category="Dreams"
      showGradient
    >
      <XPShareToolHeader
        title="Timeline Analysis"
        type={part.type}
        state={part.state}
        category="Dreams"
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
