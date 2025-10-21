/**
 * XPShare AI - Network Graph Visualization
 *
 * Interactive 3D force-directed graph showing connections between experiences.
 * Uses react-force-graph-3d with category-based colors.
 */

'use client'

import { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-gray-500">Loading 3D graph...</p>
    </div>
  ),
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface NetworkNode {
  id: string
  name: string
  category: string
  val?: number
  color?: string
  [key: string]: any
}

export interface NetworkLink {
  source: string
  target: string
  value?: number
  label?: string
  [key: string]: any
}

export interface NetworkGraphProps {
  /** Graph nodes */
  nodes: NetworkNode[]

  /** Graph links/edges */
  links: NetworkLink[]

  /** Graph title */
  title?: string

  /** Height in pixels */
  height?: number

  /** Width in pixels */
  width?: number

  /** Enable node labels */
  showLabels?: boolean

  /** Color theme */
  theme?: 'light' | 'dark'

  /** Node size multiplier */
  nodeSize?: number

  /** Link width multiplier */
  linkWidth?: number
}

// ============================================================================
// Category Colors (matching TimelineChart & ExperienceMap)
// ============================================================================

const CATEGORY_COLORS: Record<string, string> = {
  ufo: '#8b5cf6', // purple
  dreams: '#3b82f6', // blue
  nde: '#10b981', // green
  synchronicity: '#f59e0b', // amber
  psychic: '#ec4899', // pink
  ghost: '#6366f1', // indigo
  default: '#64748b', // slate
}

// ============================================================================
// Network Graph Component
// ============================================================================

export function NetworkGraph({
  nodes,
  links,
  title = 'Network Graph',
  height = 600,
  width,
  showLabels = true,
  theme = 'light',
  nodeSize = 1,
  linkWidth = 1,
}: NetworkGraphProps) {
  const graphRef = useRef<any>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  // Transform data for react-force-graph-3d
  const graphData = useMemo(() => {
    // Add colors to nodes
    const coloredNodes = nodes.map((node) => ({
      ...node,
      color: CATEGORY_COLORS[node.category] || CATEGORY_COLORS.default,
      val: node.val || 1, // Node size
    }))

    // Ensure links reference existing nodes
    const nodeIds = new Set(nodes.map((n) => n.id))
    const validLinks = links.filter(
      (link) => nodeIds.has(String(link.source)) && nodeIds.has(String(link.target))
    )

    return {
      nodes: coloredNodes,
      links: validLinks,
    }
  }, [nodes, links])

  // Theme colors
  const backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const textColor = theme === 'dark' ? '#f3f4f6' : '#111827'

  // Handle node click
  const handleNodeClick = (node: any) => {
    setSelectedNode(node)

    // Focus camera on node
    if (graphRef.current) {
      const distance = 150
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)

      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1000
      )
    }
  }

  // Empty state
  if (graphData.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No network data available</p>
          <p className="text-sm">Graph requires nodes and connections to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
          {title}
        </h3>
      )}

      <div className="relative" style={{ height, width: width || '100%' }}>
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor }}>
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            height={height}
            width={width}
            backgroundColor={backgroundColor}
            // Node appearance
            nodeLabel={(node: any) => {
              return `
                <div style="
                  background: rgba(0,0,0,0.8);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 6px;
                  font-size: 14px;
                  max-width: 200px;
                ">
                  <strong>${node.name || node.id}</strong><br/>
                  <span style="color: ${node.color}">● ${node.category || 'Unknown'}</span>
                </div>
              `
            }}
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.val * nodeSize}
            nodeRelSize={6}
            nodeOpacity={0.9}
            // Link appearance
            linkLabel={(link: any) => link.label || `Connection (${link.value || 1})`}
            linkColor={() => (theme === 'dark' ? '#4b5563' : '#9ca3af')}
            linkWidth={(link: any) => (link.value || 1) * linkWidth}
            linkOpacity={0.5}
            linkDirectionalParticles={(link: any) => (link.value > 5 ? 2 : 0)}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            // Labels
            nodeThreeObjectExtend={showLabels}
            nodeThreeObject={showLabels ? undefined : (() => undefined) as any}
            // Interactions
            onNodeClick={handleNodeClick}
            onNodeHover={(node) => {
              document.body.style.cursor = node ? 'pointer' : 'default'
            }}
            // Physics
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTicks={1000}
          />
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <div
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h4 className="font-semibold text-base mb-2 pr-6" style={{ color: textColor }}>
              {selectedNode.name || selectedNode.id}
            </h4>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span style={{ color: textColor }}>{selectedNode.category}</span>
              </div>

              {selectedNode.title && (
                <p className="text-gray-600 dark:text-gray-400">{selectedNode.title}</p>
              )}

              {selectedNode.description && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {selectedNode.description}
                </p>
              )}

              {selectedNode.similarity_score !== undefined && (
                <p className="text-gray-600 dark:text-gray-400">
                  Similarity: {(selectedNode.similarity_score * 100).toFixed(1)}%
                </p>
              )}
            </div>

            {selectedNode.id && (
              <a
                href={`/experiences/${selectedNode.id}`}
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Details →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Graph Statistics */}
      <div className="mt-2 text-sm text-gray-500 flex gap-4">
        <span>{graphData.nodes.length} nodes</span>
        <span>{graphData.links.length} connections</span>
        {graphData.links.length > 0 && (
          <span>
            Avg connections:{' '}
            {(
              graphData.links.reduce((sum, link) => sum + (link.value || 1), 0) /
              graphData.nodes.length
            ).toFixed(1)}
          </span>
        )}
      </div>

      {/* Category Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Array.from(new Set(nodes.map((n) => n.category))).map((category) => (
          <div key={category} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
              }}
            />
            <span className="capitalize" style={{ color: textColor }}>
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
