'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { GraphNode, GraphEdge } from './NetworkGraph'

// Dynamic import for 3D graph to avoid SSR issues
const NetworkGraph3D = dynamic(
  () => import('./NetworkGraph3D').then(mod => ({ default: mod.NetworkGraph3D })),
  { ssr: false, loading: () => <div className="w-full h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">Loading 3D graph...</div> }
)

// Dynamic import for 2D graph to avoid SSR issues
const NetworkGraph = dynamic(
  () => import('./NetworkGraph').then(mod => ({ default: mod.NetworkGraph })),
  { ssr: false, loading: () => <div className="w-full h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">Loading 2D graph...</div> }
)

interface NetworkGraph3DWrapperProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  title?: string
}

// Convert 2D network data to 3D force-directed graph format
export function NetworkGraph3DWrapper({ nodes, edges, title }: NetworkGraph3DWrapperProps) {
  const [is3D, setIs3D] = useState(true)

  // Convert nodes to experience nodes (3d-force-graph handles positioning automatically)
  const experienceNodes = useMemo(() => {
    return nodes.map((node, idx) => ({
      id: node.id,
      title: node.label || `Node ${idx + 1}`,
      description: `Category: ${node.category || 'unknown'}`,
      type: node.category || 'general',
      intensity: node.val || 5,
      themes: [node.category || 'general'],
      connectionCount: edges.filter(e => e.source === node.id || e.target === node.id).length,
      // Color is assigned by NetworkGraph3D based on type - don't override it
    }))
  }, [nodes, edges])

  // Convert edges to connections
  const connections = useMemo(() => {
    return edges.map(edge => ({
      from: edge.source.toString(),
      to: edge.target.toString(),
      similarity: edge.weight / 10, // Normalize to 0-1
    }))
  }, [edges])

  return (
    <div className="relative w-full h-[600px]">
      {/* Toggle Button */}
      <div className="absolute top-4 left-4 z-10 flex gap-1 bg-black/60 backdrop-blur rounded-lg p-1 shadow-lg">
        <button
          onClick={() => setIs3D(false)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            !is3D
              ? 'bg-white text-black shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => setIs3D(true)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            is3D
              ? 'bg-white text-black shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          3D
        </button>
      </div>

      {/* Graph Display */}
      {is3D ? (
        <NetworkGraph3D
          experiences={experienceNodes}
          connections={connections}
          clusters={[]}
        />
      ) : (
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          title={title}
        />
      )}
    </div>
  )
}
