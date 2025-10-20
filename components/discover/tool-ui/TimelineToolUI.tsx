'use client'

import { Card } from '@/components/ui/card'
import { TimelineChart } from '@/components/discover/TimelineChart'
import { AlertCircle } from 'lucide-react'
import { TimelineArgs, TimelineResult } from '@/types/discovery-tools'
import { TimelineSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'

interface TimelineToolUIProps {
  part: {
    type: 'tool-analyze_timeline'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: TimelineArgs
    output?: TimelineResult
    error?: Error
  }
}

export function TimelineToolUI({ part }: TimelineToolUIProps) {
  // State 1: Tool is running - Use Skeleton Loader
  if (part.state === 'input-available') {
    return <TimelineSkeletonLoader />
  }

  // State 2: Tool completed successfully
  if (part.state === 'output-available' && part.output) {
    return (
      <LazyChart fallback={<TimelineSkeletonLoader />}>
        <Card className="p-4">
          <TimelineChart
            data={part.output.data}
            granularity={part.output.granularity}
            title={`Timeline: ${part.input.query}`}
            interactive
          />
          <p className="text-xs text-muted-foreground mt-2">
            Found {part.output.total} experiences matching your query
          </p>
        </Card>
      </LazyChart>
    )
  }

  // State 3: Tool failed
  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze timeline</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
