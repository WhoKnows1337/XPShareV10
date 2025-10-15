'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import Link from 'next/link'

interface Experience {
  id: string
  title: string
  category: string
  tags?: string[]
  date_occurred?: string
  location_text?: string
}

interface ConstellationViewProps {
  experiences: Experience[]
}

interface Node extends d3.SimulationNodeDatum {
  id: string
  title: string
  category: string
  tags: string[]
  radius: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  strength: number
}

export function ConstellationView({ experiences }: ConstellationViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 })

  const categoryColors: Record<string, string> = {
    'ufo-uap': '#3b82f6',
    nde: '#a855f7',
    paranormal: '#6366f1',
    dreams: '#ec4899',
    psychedelic: '#f97316',
    'altered-states': '#10b981',
    synchronicity: '#eab308',
  }

  useEffect(() => {
    if (!svgRef.current || experiences.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const width = dimensions.width
    const height = dimensions.height

    // Create nodes
    const nodes: Node[] = experiences.map((exp) => ({
      id: exp.id,
      title: exp.title || 'Ohne Titel',
      category: exp.category,
      tags: exp.tags || [],
      radius: 8,
    }))

    // Create links based on shared categories and tags
    const links: Link[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i]
        const nodeB = nodes[j]

        let strength = 0

        // Same category = strong link
        if (nodeA.category === nodeB.category) {
          strength += 0.5
        }

        // Shared tags
        const sharedTags = nodeA.tags.filter((tag) => nodeB.tags.includes(tag))
        strength += sharedTags.length * 0.2

        if (strength > 0.3) {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            strength,
          })
        }
      }
    }

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Add zoom behavior
    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    zoomBehaviorRef.current = zoom
    svg.call(zoom as any)

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(80)
          .strength((d) => d.strength)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d: any) => (d as Node).radius + 5)
      )

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', (d) => d.strength * 0.6)
      .attr('stroke-width', (d) => d.strength * 2)

    // Draw nodes
    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => categoryColors[d.category] || '#64748b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelectedNode(d)
      })
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', d.radius * 1.5).attr('stroke-width', 3)

        // Highlight connected nodes
        const connectedNodeIds = new Set<string>()
        links.forEach((link) => {
          if ((link.source as Node).id === d.id) {
            connectedNodeIds.add((link.target as Node).id)
          }
          if ((link.target as Node).id === d.id) {
            connectedNodeIds.add((link.source as Node).id)
          }
        })

        node.attr('opacity', (n) => (connectedNodeIds.has(n.id) || n.id === d.id ? 1 : 0.3))
        link.attr('opacity', (l) =>
          (l.source as Node).id === d.id || (l.target as Node).id === d.id ? 1 : 0.1
        )
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('r', d.radius).attr('stroke-width', 2)
        node.attr('opacity', 1)
        link.attr('opacity', (d) => d.strength * 0.6)
      })

    // Add drag behavior
    const drag = d3
      .drag<SVGCircleElement, Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    node.call(drag as any)

    // Add labels
    const labels = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -12)
      .attr('font-size', 10)
      .attr('fill', '#64748b')
      .attr('pointer-events', 'none')
      .text((d) => d.title.substring(0, 20) + (d.title.length > 20 ? '...' : ''))

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as Node).x!)
        .attr('y1', (d) => (d.source as Node).y!)
        .attr('x2', (d) => (d.target as Node).x!)
        .attr('y2', (d) => (d.target as Node).y!)

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!)

      labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!)
    })

    return () => {
      simulation.stop()
    }
  }, [experiences, dimensions])

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call((zoomBehaviorRef.current as any).scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call((zoomBehaviorRef.current as any).scaleBy, 0.7)
  }

  const handleReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call((zoomBehaviorRef.current as any).transform, d3.zoomIdentity)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>💡 Hover über Nodes für Verbindungen</span>
          <span>•</span>
          <span>Drag zum Verschieben</span>
          <span>•</span>
          <span>Scroll zum Zoomen</span>
        </div>
      </div>

      {/* Constellation */}
      <div className="relative rounded-lg border bg-card overflow-hidden">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">{selectedNode.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: categoryColors[selectedNode.category],
                      color: 'white',
                    }}
                  >
                    {selectedNode.category}
                  </Badge>
                  {selectedNode.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Link href={`/experiences/${selectedNode.id}`}>
                <Button size="sm">Details ansehen</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-3">Kategorien</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
