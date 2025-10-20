'use client'

import { Button } from '@/components/ui/button'
import { NetworkGraph3DWrapper } from '@/components/discover/NetworkGraph3DWrapper'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { NetworkArgs, NetworkResult } from '@/types/discovery-tools'
import { NetworkSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'
import { XPShareTool, XPShareToolHeader, ToolContent, ToolInput } from '@/components/ai-elements/xpshare-tool'

interface NetworkToolUIProps {
  part: {
    type: 'tool-analyze_network'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: NetworkArgs
    output?: NetworkResult
    error?: Error
    errorText?: string
  }
  onRetry?: () => void
}

export function NetworkToolUI({ part, onRetry }: NetworkToolUIProps) {
  const renderOutput = () => {
    if (part.state === 'input-available') {
      return <NetworkSkeletonLoader />
    }

    if (part.state === 'output-available' && part.output) {
      return (
        <LazyChart fallback={<NetworkSkeletonLoader />}>
          <div className="space-y-2">
            <NetworkGraph3DWrapper
              nodes={part.output.nodes}
              edges={part.output.edges}
              title={`Network: ${part.input.query}`}
            />
            <p className="text-xs text-muted-foreground text-center">
              Found {part.output.edges.length} connections between {part.output.total} experiences
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
              <p className="text-destructive font-medium">Failed to analyze network</p>
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
      category="Synchronicity"
      showGradient
    >
      <XPShareToolHeader
        title="Network Analysis"
        type={part.type}
        state={part.state}
        category="Synchronicity"
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
