'use client'

import { useMemo } from 'react'
import { NetworkGraph3D } from './NetworkGraph3D'
import type { GraphNode, GraphEdge } from './NetworkGraph'

interface NetworkGraph3DWrapperProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  title?: string
}

// Convert 2D network data to 3D galaxy format
export function NetworkGraph3DWrapper({ nodes, edges, title }: NetworkGraph3DWrapperProps) {
  // Convert nodes to 3D experience nodes with positions
  const experienceNodes = useMemo(() => {
    return nodes.map((node, idx) => {
      // Distribute nodes in 3D space (sphere distribution)
      const radius = 20 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      return {
        id: node.id,
        position: [x, y, z] as [number, number, number],
        title: node.label || `Node ${idx + 1}`,
        description: `Category: ${node.category || 'unknown'}`,
        type: node.category || 'general',
        intensity: node.val || 5,
        themes: [node.category || 'general'],
        connectionCount: edges.filter(e => e.source === node.id || e.target === node.id).length,
        color: node.color || '#64748b',
      }
    })
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
    <div className="w-full h-[600px]">
      <NetworkGraph3D
        experiences={experienceNodes}
        connections={connections}
        clusters={[]}
      />
    </div>
  )
}
