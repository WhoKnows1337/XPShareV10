'use client'

import { Card } from '@/components/ui/card'
import { HeatmapChart } from '@/components/discover/HeatmapChart'
import { Loader2, AlertCircle } from 'lucide-react'
import { HeatmapArgs, HeatmapResult } from '@/types/discovery-tools'

interface HeatmapToolUIProps {
  part: {
    type: 'tool-analyze_heatmap'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: HeatmapArgs
    output?: HeatmapResult
    error?: Error
  }
}

export function HeatmapToolUI({ part }: HeatmapToolUIProps) {
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-orange-500 bg-orange-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          <div>
            <p className="font-medium text-orange-900">Analyzing category trends</p>
            <p className="text-sm text-orange-700">
              Searching for: "{part.input.query}"
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <div className="space-y-2">
        <HeatmapChart
          data={part.output.data}
          title={`Heatmap: ${part.input.query}`}
        />
        <p className="text-xs text-muted-foreground">
          Analyzed {part.output.total} experiences across categories and time periods
        </p>
      </div>
    )
  }

  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze heatmap</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
