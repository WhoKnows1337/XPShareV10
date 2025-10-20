'use client'

import { Card } from '@/components/ui/card'
import { ExperienceMapCard } from '@/components/discover/ExperienceMapCard'
import { Loader2, AlertCircle } from 'lucide-react'
import { GeographicArgs, GeographicResult } from '@/types/discovery-tools'

interface MapToolUIProps {
  part: {
    type: 'tool-analyze_geographic'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: GeographicArgs
    output?: GeographicResult
    error?: Error
  }
}

export function MapToolUI({ part }: MapToolUIProps) {
  if (part.state === 'input-available') {
    return (
      <Card className="p-6 border-l-4 border-green-500 bg-green-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          <div>
            <p className="font-medium text-green-900">Mapping global locations</p>
            <p className="text-sm text-green-700">
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
        <ExperienceMapCard
          markers={part.output.markers}
          title={`Map: ${part.input.query}`}
        />
        <p className="text-xs text-muted-foreground">
          Mapped {part.output.total} locations
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
            <p className="text-red-600 font-medium">Failed to load map</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
