'use client'

import { useEffect, useRef } from 'react'
import Graph from 'graphology'
import { SigmaContainer, useLoadGraph, useSigma } from '@react-sigma/core'
import '@react-sigma/core/lib/style.css'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

interface GraphNode {
  id: string
  label: string
  size: number
  color: string
  x?: number
  y?: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  size: number
}

interface GraphVisualizationProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  experienceId: string
}

function GraphLoader({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const loadGraph = useLoadGraph()
  const sigma = useSigma()

  useEffect(() => {
    const graph = new Graph()

    // Add nodes
    nodes.forEach((node) => {
      graph.addNode(node.id, {
        label: node.label,
        size: node.size || 10,
        color: node.color || '#8b5cf6',
        x: node.x || Math.random() * 100,
        y: node.y || Math.random() * 100,
      })
    })

    // Add edges
    edges.forEach((edge) => {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        graph.addEdge(edge.source, edge.target, {
          size: edge.size || 2,
          color: '#64748b',
        })
      }
    })

    // Apply force-directed layout
    const settings = forceAtlas2.inferSettings(graph)
    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        ...settings,
        scalingRatio: 10,
        gravity: 0.5,
      },
    })

    loadGraph(graph)

    // Auto-zoom to fit
    sigma.getCamera().animatedReset()
  }, [nodes, edges, loadGraph, sigma])

  return null
}

export function GraphVisualization({ nodes, edges, experienceId }: GraphVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" />
            Pattern Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Network className="w-12 h-12 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No connections yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" />
            Pattern Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="aspect-square bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-lg border-2 border-dashed border-primary/20 overflow-hidden">
              <SigmaContainer
                style={{ height: '100%', width: '100%' }}
                settings={{
                  renderEdgeLabels: false,
                  defaultNodeColor: '#8b5cf6',
                  defaultEdgeColor: '#64748b',
                  labelRenderedSizeThreshold: 8,
                }}
              >
                <GraphLoader nodes={nodes} edges={edges} />
              </SigmaContainer>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {nodes.length} connected nodes · {edges.length} relationships
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Explore full graph
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Graph Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Pattern Connection Graph
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 rounded-lg overflow-hidden border">
            <SigmaContainer
              style={{ height: '100%', width: '100%' }}
              settings={{
                renderEdgeLabels: false,
                defaultNodeColor: '#8b5cf6',
                defaultEdgeColor: '#64748b',
                labelRenderedSizeThreshold: 6,
              }}
            >
              <GraphLoader nodes={nodes} edges={edges} />
            </SigmaContainer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
