'use client'

import { Card } from '@/components/ui/card'
import { NetworkGraph } from '@/components/discover/NetworkGraph'
import { AlertCircle } from 'lucide-react'
import { NetworkArgs, NetworkResult } from '@/types/discovery-tools'
import { NetworkSkeletonLoader } from '@/components/discover/skeleton-loaders'
import { LazyChart } from '@/components/discover/LazyChart'

interface NetworkToolUIProps {
  part: {
    type: 'tool-analyze_network'
    state: 'input-available' | 'output-available' | 'output-error'
    toolCallId: string
    input: NetworkArgs
    output?: NetworkResult
    error?: Error
  }
}

export function NetworkToolUI({ part }: NetworkToolUIProps) {
  if (part.state === 'input-available') {
    return <NetworkSkeletonLoader />
  }

  if (part.state === 'output-available' && part.output) {
    return (
      <LazyChart fallback={<NetworkSkeletonLoader />}>
        <div className="space-y-2">
          <NetworkGraph
            nodes={part.output.nodes}
            edges={part.output.edges}
            title={`Network: ${part.input.query}`}
          />
          <p className="text-xs text-muted-foreground">
            Found {part.output.edges.length} connections between {part.output.total} experiences
          </p>
        </div>
      </LazyChart>
    )
  }

  if (part.state === 'output-error') {
    return (
      <Card className="p-4 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Failed to analyze network</p>
            <p className="text-sm text-red-700">{part.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
