'use client'

import { Card } from '@/components/ui/card'
import { TimelineChart } from '@/components/discover/TimelineChart'
import { Loader2, AlertCircle } from 'lucide-react'
import { TimelineArgs, TimelineResult } from '@/types/discovery-tools'

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
  // State 1: Tool is running
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-blue-500 bg-blue-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div>
            <p className="font-medium text-blue-900">Analyzing temporal patterns</p>
            <p className="text-sm text-blue-700">
              Searching for: "{part.input.query}" · Granularity: {part.input.granularity || 'month'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // State 2: Tool completed successfully
  if (part.state === 'output-available' && part.output) {
    return (
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
