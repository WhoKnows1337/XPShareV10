'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

/**
 * Network Graph Component
 * Interactive connection graph with react-force-graph-2d
 * Features: Force-directed layout, node/edge interactions, zoom controls
 * Used by streamUI for connection visualization
 */

// Dynamic import to avoid SSR issues with canvas/WebGL
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
      <p className="text-sm text-muted-foreground">Loading graph...</p>
    </div>
  ),
})

export interface GraphNode {
  id: string
  label: string
  category?: string
  val?: number // Node size
  color?: string
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
  sharedTags?: string[]
}

export interface NetworkGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  title?: string
  layout?: 'force' | 'hierarchical' | 'radial'
  onNodeClick?: (node: GraphNode) => void
  onEdgeClick?: (edge: GraphEdge) => void
}

export function NetworkGraph({
  nodes,
  edges,
  title = 'Connection Network',
  layout = 'force',
  onNodeClick,
  onEdgeClick,
}: NetworkGraphProps) {
  const graphRef = useRef<any>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightEdges, setHighlightEdges] = useState(new Set())

  // Add default colors if not provided
  const enrichedNodes = nodes.map((node) => ({
    ...node,
    color: node.color || getCategoryColor(node.category),
    val: node.val || 1,
  }))

  // Prepare graph data
  const graphData = {
    nodes: enrichedNodes,
    links: edges.map((edge) => ({
      ...edge,
      value: edge.weight,
    })),
  }

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)

    // Highlight connected nodes and edges
    const connectedNodes = new Set([node.id])
    const connectedEdges = new Set()

    edges.forEach((edge) => {
      if (edge.source === node.id || edge.target === node.id) {
        connectedEdges.add(edge)
        connectedNodes.add(edge.source === node.id ? edge.target : edge.source)
      }
    })

    setHighlightNodes(connectedNodes)
    setHighlightEdges(connectedEdges)

    onNodeClick?.(node)
  }

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 500)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 500)
    }
  }

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }

  // Auto-fit view on mount and when nodes change
  useEffect(() => {
    if (graphRef.current && nodes.length > 0) {
      // Wait for initial layout to settle
      const timer = setTimeout(() => {
        graphRef.current?.zoomToFit(400)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [nodes.length])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{nodes.length} nodes</Badge>
            <Badge variant="outline">{edges.length} connections</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Graph Canvas */}
          <div className="h-[500px] w-full rounded-lg border overflow-hidden bg-background">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="label"
              nodeAutoColorBy="category"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.label
                const fontSize = 12 / globalScale
                const isHighlighted = highlightNodes.has(node.id)

                // Draw node circle
                ctx.beginPath()
                ctx.arc(node.x, node.y, (node.val || 1) * 5, 0, 2 * Math.PI)
                ctx.fillStyle = isHighlighted ? '#3b82f6' : node.color
                ctx.fill()

                if (isHighlighted) {
                  ctx.strokeStyle = '#1e40af'
                  ctx.lineWidth = 2
                  ctx.stroke()
                }

                // Draw label
                if (globalScale > 1.5 || isHighlighted) {
                  ctx.font = `${fontSize}px Sans-Serif`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  ctx.fillStyle = 'currentColor'
                  ctx.fillText(label, node.x, node.y + 8)
                }
              }}
              linkWidth={(link: any) =>
                highlightEdges.has(link) ? 3 : link.value || 1
              }
              linkColor={(link: any) =>
                highlightEdges.has(link) ? '#3b82f6' : '#94a3b8'
              }
              onNodeClick={handleNodeClick}
              onLinkClick={(link: any) => onEdgeClick?.(link)}
              onBackgroundClick={() => {
                setSelectedNode(null)
                setHighlightNodes(new Set())
                setHighlightEdges(new Set())
              }}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              className="shadow-md"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              className="shadow-md"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleFitView}
              className="shadow-md"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 bg-background border rounded-lg shadow-lg p-3 max-w-xs">
              <h4 className="font-semibold text-sm">{selectedNode.label}</h4>
              {selectedNode.category && (
                <Badge variant="outline" className="mt-1">
                  {selectedNode.category}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {highlightEdges.size} connections
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          💡 Click nodes to highlight connections • Drag to rearrange • Scroll to zoom
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Get color by category
 */
function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    ufo: '#3b82f6',
    dream: '#8b5cf6',
    nde: '#ec4899',
    obe: '#10b981',
    paranormal: '#f59e0b',
    synchronicity: '#06b6d4',
  }

  return category && colors[category] ? colors[category] : '#64748b'
}
