'use client'

/**
 * Network Graph 3D - High-Performance 3D/2D Graph Visualization
 * Uses 3d-force-graph for better performance than raw Three.js
 * Adapted from XPShare33 ForceGraphGalaxy
 */

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'

// Types
interface ExperienceNode {
  id: string
  title: string
  description: string
  type: string
  intensity: number
  themes: string[]
  connectionCount: number
  color?: string
  x?: number
  y?: number
  z?: number
  fx?: number
  fy?: number
  fz?: number
}

interface ConnectionEdge {
  from?: string
  to?: string
  source?: string
  target?: string
  similarity: number
  color?: string
}

interface Cluster {
  id: string
  name: string
  position: [number, number, number]
  color: string
  size: number
}

interface NetworkGraph3DProps {
  experiences: ExperienceNode[]
  connections: ConnectionEdge[]
  clusters?: Cluster[]
  onNodeClick?: (node: ExperienceNode) => void
  onNodeHover?: (node: ExperienceNode | null) => void
}

// Experience colors by type
const experienceColors: Record<string, string> = {
  dream: '#9B59B6',
  nde: '#E74C3C',
  meditation: '#3498DB',
  psychedelic: '#F39C12',
  synchronicity: '#2ECC71',
  astral: '#8E44AD',
  lucid: '#16A085',
  vision: '#F1C40F',
  ufo: '#95A5A6',
  telepathy: '#E67E22',
  precognition: '#9C88FF',
  general: '#ECF0F1',
}

// Check if mobile
const isMobile = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  )
}

// Suppress Three.js deprecated API warnings from 3d-force-graph library
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function (...args) {
    // Filter out the specific Three.js warning that spams the console
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('onBeforeRender() has been removed')
    ) {
      return // Suppress this specific warning
    }
    originalWarn.apply(console, args)
  }
}

export function NetworkGraph3D({
  experiences,
  connections,
  clusters: _clusters = [],
  onNodeClick,
  onNodeHover,
}: NetworkGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [is2D, setIs2D] = useState(isMobile())
  const [hoverNode, setHoverNode] = useState<any>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const selectedNodeIdRef = useRef<string | null>(null)
  const hoverNodeRef = useRef<any>(null)

  // Prepare graph data
  const graphData = useMemo(() => {
    // Add colors and values to nodes
    const nodesWithColors = experiences.map((exp) => ({
      ...exp,
      color: experienceColors[exp.type?.toLowerCase()] || experienceColors.general,
      val: Math.max(1, exp.intensity / 2 + exp.connectionCount / 10), // Node size
    }))

    // Convert connections to force-graph format
    const links = connections.map((conn) => ({
      source: conn.from || conn.source,
      target: conn.to || conn.target,
      value: conn.similarity,
      color: 'rgba(255, 255, 255, 0.2)',
    }))

    return {
      nodes: nodesWithColors,
      links: links,
    }
  }, [experiences, connections])

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return

    // Create graph instance
    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData) // Initial data
      .backgroundColor('rgba(0, 0, 0, 0)') // Transparent background
      .nodeLabel('title') // Simple tooltip
      .nodeColor('color')
      .nodeVal('val')
      .nodeOpacity(0.9)
      .nodeResolution(16) // Lower resolution for better performance
      .linkColor('color')
      .linkOpacity(0.3)
      .linkWidth((link: any) => link.value * 2)
      .linkDirectionalParticles((link: any) => {
        // Animated particles for stronger connections
        if (link.value > 0.9) return 2
        if (link.value > 0.8) return 2
        if (link.value > 0.7) return 1
        if (link.value > 0.6) return 1
        return 0
      })
      .linkDirectionalParticleSpeed((link: any) => link.value * 0.0015) // Slow particles
      .linkDirectionalParticleWidth((link: any) => link.value * 1.5) // Smaller particles
      .linkDirectionalParticleColor(() => '#9B59B6')
      .linkDirectionalParticleResolution(16) // High resolution for round particles
      .numDimensions(is2D ? 2 : 3)
      .showNavInfo(false)

    // Set initial camera position BEFORE other setups - farther out for better overview
    Graph.cameraPosition(
      { x: 0, y: 0, z: 600 }, // Camera position - doubled distance for wider view
      { x: 0, y: 0, z: 0 }, // Look at origin
      0 // No animation (instant)
    )

    // Performance optimizations first
    if (isMobile()) {
      // Mobile optimizations
      Graph.enablePointerInteraction(true) // Keep interaction on mobile too
      Graph.enableNodeDrag(false) // But disable dragging for performance
      Graph.nodeResolution(8) // Even lower resolution on mobile
      Graph.warmupTicks(50) // Less warmup on mobile
      Graph.cooldownTime(5000) // Faster cooldown on mobile
    } else {
      // Desktop settings
      Graph.enablePointerInteraction(true)
      Graph.enableNodeDrag(true)
      Graph.onNodeDragEnd((node: any) => {
        node.fx = node.x
        node.fy = node.y
        if (!is2D) node.fz = node.z
      })
      Graph.warmupTicks(100) // More warmup for better initial layout
      Graph.cooldownTime(15000) // Longer animation on desktop
    }

    // Force simulation settings to keep nodes closer together
    Graph.d3AlphaDecay(0.02)
    Graph.d3VelocityDecay(0.3)
    // Configure existing forces instead of creating new ones
    if (Graph.d3Force('charge')) {
      Graph.d3Force('charge').strength(-30) // Reduce repulsion
    }
    if (Graph.d3Force('link')) {
      Graph.d3Force('link').distance(30) // Shorter links
    }

    // Only render when needed
    Graph.onEngineStop(() => {
      console.log('Force simulation stopped - saving GPU')
    })

    // Track last click time for double-click detection
    let lastClickTime = 0
    let lastClickedNode: any = null
    const DOUBLE_CLICK_DELAY = 300 // milliseconds

    // Handle interactions
    Graph.onNodeClick((node: any, event: MouseEvent) => {
      // Don't handle right-clicks here
      if (event.button === 2) {
        return
      }

      const currentTime = Date.now()
      const isDoubleClick =
        lastClickedNode === node &&
        currentTime - lastClickTime < DOUBLE_CLICK_DELAY

      if (isDoubleClick) {
        // Double-click: fly camera to node
        const distance = 40 + Math.sqrt(node.connectionCount || 1) * 10
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z || 0)

        // Calculate camera position to view node from slight angle
        const angle = Date.now() * 0.0001
        const offsetX = Math.sin(angle) * 10
        const offsetY = 5

        Graph.cameraPosition(
          {
            x: node.x * distRatio + offsetX,
            y: node.y * distRatio + offsetY,
            z: (node.z || 0) * distRatio,
          },
          node,
          2000 // Smoother transition
        )
      } else {
        // Single click: just select the node (no camera movement)
        requestAnimationFrame(() => {
          if (onNodeClick) {
            onNodeClick(node as ExperienceNode)
          }
        })

        // Only update the selected node ID immediately (lightweight)
        selectedNodeIdRef.current = node.id
        setSelectedNodeId(node.id)
      }

      // Update click tracking
      lastClickTime = currentTime
      lastClickedNode = node
    })

    // Throttle hover updates to improve performance
    let hoverTimeout: NodeJS.Timeout | null = null

    Graph.onNodeHover((node: any, _prevNode: any) => {
      // Update ref immediately for visual feedback
      hoverNodeRef.current = node

      // Clear previous timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }

      // Throttle expensive operations
      hoverTimeout = setTimeout(() => {
        if (onNodeHover) {
          onNodeHover(node as ExperienceNode)
        }
        setHoverNode(node)
      }, 50) // 50ms throttle
    })

    // Custom node appearance with pulsing effects
    Graph.nodeThreeObject((node: any) => {
      const group = new THREE.Group()

      // Calculate node importance for effects
      const isImportant = node.connectionCount > 5 || node.intensity > 8
      const isSelected = selectedNodeIdRef.current === node.id

      // Main sphere - high resolution for perfect roundness
      const nodeRadius = Math.sqrt(node.val) * 2
      const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32) // Equal segments for perfect sphere
      const material = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: isImportant ? 0.3 : 0.2,
        shininess: 100,
        opacity: 1,
        transparent: true,
      })
      const sphere = new THREE.Mesh(geometry, material)

      // Store material reference for hover updates
      sphere.userData.defaultEmissiveIntensity = isImportant ? 0.3 : 0.2
      sphere.userData.nodeId = node.id

      group.add(sphere)

      // Add energy ring for very important nodes
      if (node.connectionCount > 10 || node.intensity > 9) {
        const ringGeometry = new THREE.TorusGeometry(
          nodeRadius * 2,
          nodeRadius * 0.15,
          16,
          48
        )
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: node.color,
          opacity: 0.15,
          transparent: true,
        })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.userData = {
          rotationSpeed: 0.02,
        }
        group.add(ring)
      }

      // Add black outline to all nodes for better distinction
      const outlineGeometry = new THREE.SphereGeometry(
        nodeRadius * 1.02,
        32,
        32
      )
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: '#000000',
        side: THREE.BackSide,
      })
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial)
      group.add(outline)

      return group
    })

    // Add ambient light
    const scene = Graph.scene()
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6))

    // Use transparent background to show website background
    const renderer = Graph.renderer()
    renderer.setClearColor(0x000000, 0) // Fully transparent

    // Store reference
    graphRef.current = Graph

    // Wait a frame to ensure the scene is fully initialized
    setTimeout(() => {
      // Customize controls for better navigation
      const controls = Graph.controls()
      if (controls) {
        controls.enabled = true
        controls.enableZoom = true
        controls.enableRotate = true
        controls.enablePan = true

        // Set distance constraints
        controls.minDistance = 0.1
        controls.maxDistance = 10000

        // Enable damping for smoother movement
        controls.enableDamping = true
        controls.dampingFactor = 0.05

        controls.screenSpacePanning = true
        controls.maxPolarAngle = Math.PI

        controls.update()
      }

      // Set camera position again to ensure it's correct
      Graph.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 0)
    }, 100)

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.width(containerRef.current.clientWidth)
        graphRef.current.height(containerRef.current.clientHeight)
        setIs2D(isMobile())
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (graphRef.current) {
        graphRef.current._destructor()
      }
    }
  }, []) // Only initialize once on mount

  // Update graph data without reinitializing
  useEffect(() => {
    if (!graphRef.current) return

    // Check if data actually changed (not just reference)
    const currentData = graphRef.current.graphData()
    const nodesChanged = currentData.nodes?.length !== graphData.nodes?.length
    const linksChanged = currentData.links?.length !== graphData.links?.length

    if (nodesChanged || linksChanged) {
      // Preserve camera position before update
      const cameraPosition = graphRef.current.cameraPosition()

      // Update the graph data
      graphRef.current.graphData(graphData)

      // Restore camera position after update
      if (cameraPosition) {
        graphRef.current.cameraPosition(cameraPosition, cameraPosition.lookAt)
      }
    }
  }, [graphData])

  // Update 2D/3D mode
  useEffect(() => {
    if (!graphRef.current) return

    graphRef.current.numDimensions(is2D ? 2 : 3)
  }, [is2D])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black">
      {/* Graph Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Performance Info */}
      <div className="absolute top-4 left-4 text-xs text-white/80 bg-black/60 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-2">Connection Network</h3>
        <div className="space-y-1">
          <div>{experiences.length} Experiences</div>
          <div>{connections.length} Connections</div>
          <div>{_clusters.length} Patterns</div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 text-white/80 bg-black/60 backdrop-blur p-3 rounded-lg text-xs shadow-lg">
        <div>🖱️ Left Click: Select</div>
        <div>🖱️ Right Drag: Rotate</div>
        <div>⚲ Scroll: Zoom</div>
        <div>🖱️ Middle Drag: Pan</div>
      </div>
    </div>
  )
}

export default NetworkGraph3D
