'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Experience {
  id: string
  title: string
  category: string
  tags?: string[]
  date_occurred?: string
  location_text?: string
}

interface GraphView3DProps {
  experiences: Experience[]
}

interface Node3D {
  id: string
  title: string
  category: string
  tags: string[]
  position: [number, number, number]
  velocity: [number, number, number]
  color: string
}

interface Link3D {
  source: string
  target: string
  strength: number
}

const categoryColors: Record<string, string> = {
  'ufo-uap': '#3b82f6',
  nde: '#a855f7',
  paranormal: '#6366f1',
  dreams: '#ec4899',
  psychedelic: '#f97316',
  'altered-states': '#10b981',
  synchronicity: '#eab308',
}

function ForceGraph({ nodes, links, onNodeClick }: {
  nodes: Node3D[]
  links: Link3D[]
  onNodeClick: (node: Node3D) => void
}) {
  const groupRef = useRef<THREE.Group>(null!)

  // Simple force-directed layout simulation
  useFrame(() => {
    if (!groupRef.current) return

    const DAMPING = 0.9
    const REPULSION = 50
    const ATTRACTION = 0.1
    const CENTER_FORCE = 0.01

    // Apply forces
    nodes.forEach((node, i) => {
      const force = [0, 0, 0] as [number, number, number]

      // Repulsion from other nodes
      nodes.forEach((other, j) => {
        if (i === j) return
        const dx = node.position[0] - other.position[0]
        const dy = node.position[1] - other.position[1]
        const dz = node.position[2] - other.position[2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01
        const repulsion = REPULSION / (dist * dist)
        force[0] += (dx / dist) * repulsion
        force[1] += (dy / dist) * repulsion
        force[2] += (dz / dist) * repulsion
      })

      // Attraction along links
      links.forEach((link) => {
        if (link.source === node.id) {
          const target = nodes.find((n) => n.id === link.target)
          if (target) {
            const dx = target.position[0] - node.position[0]
            const dy = target.position[1] - node.position[1]
            const dz = target.position[2] - node.position[2]
            force[0] += dx * ATTRACTION * link.strength
            force[1] += dy * ATTRACTION * link.strength
            force[2] += dz * ATTRACTION * link.strength
          }
        }
      })

      // Center force
      force[0] += -node.position[0] * CENTER_FORCE
      force[1] += -node.position[1] * CENTER_FORCE
      force[2] += -node.position[2] * CENTER_FORCE

      // Update velocity and position
      node.velocity[0] = (node.velocity[0] + force[0]) * DAMPING
      node.velocity[1] = (node.velocity[1] + force[1]) * DAMPING
      node.velocity[2] = (node.velocity[2] + force[2]) * DAMPING

      node.position[0] += node.velocity[0]
      node.position[1] += node.velocity[1]
      node.position[2] += node.velocity[2]
    })
  })

  return (
    <group ref={groupRef}>
      {/* Links */}
      {links.map((link, i) => {
        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)
        if (!sourceNode || !targetNode) return null

        return (
          <Line
            key={i}
            points={[sourceNode.position, targetNode.position]}
            color="#94a3b8"
            lineWidth={link.strength * 2}
            opacity={link.strength * 0.6}
          />
        )
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <group key={node.id} position={node.position}>
          <Sphere
            args={[0.5, 16, 16]}
            onClick={() => onNodeClick(node)}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default'
            }}
          >
            <meshStandardMaterial color={node.color} />
          </Sphere>
          <Text
            position={[0, 1, 0]}
            fontSize={0.3}
            color="#64748b"
            anchorX="center"
            anchorY="bottom"
          >
            {node.title.substring(0, 15)}
          </Text>
        </group>
      ))}
    </group>
  )
}

export function GraphView3D({ experiences }: GraphView3DProps) {
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)
  const [nodes, setNodes] = useState<Node3D[]>([])
  const [links, setLinks] = useState<Link3D[]>([])

  useEffect(() => {
    // Initialize nodes with random positions
    const initialNodes: Node3D[] = experiences.map((exp) => ({
      id: exp.id,
      title: exp.title || 'Ohne Titel',
      category: exp.category,
      tags: exp.tags || [],
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ],
      velocity: [0, 0, 0],
      color: categoryColors[exp.category] || '#64748b',
    }))

    // Create links based on shared categories and tags
    const initialLinks: Link3D[] = []
    for (let i = 0; i < initialNodes.length; i++) {
      for (let j = i + 1; j < initialNodes.length; j++) {
        const nodeA = initialNodes[i]
        const nodeB = initialNodes[j]

        let strength = 0

        // Same category = strong link
        if (nodeA.category === nodeB.category) {
          strength += 0.5
        }

        // Shared tags
        const sharedTags = nodeA.tags.filter((tag) => nodeB.tags.includes(tag))
        strength += sharedTags.length * 0.2

        if (strength > 0.3) {
          initialLinks.push({
            source: nodeA.id,
            target: nodeB.id,
            strength,
          })
        }
      }
    }

    setNodes(initialNodes)
    setLinks(initialLinks)
  }, [experiences])

  return (
    <div className="space-y-4">
      {/* 3D Canvas */}
      <div className="relative rounded-lg border bg-black overflow-hidden" style={{ height: '600px' }}>
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ForceGraph nodes={nodes} links={links} onNodeClick={setSelectedNode} />
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 text-xs text-white/70 bg-black/50 p-2 rounded">
          <p>💡 Click & Drag zum Rotieren</p>
          <p>Scroll zum Zoomen</p>
          <p>Click auf Node für Details</p>
        </div>
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
                      backgroundColor: selectedNode.color,
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
