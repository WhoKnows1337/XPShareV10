/**
 * XPShare AI - Network Tool UI Wrapper
 *
 * Wrapper component for NetworkGraph with AI tool result integration.
 * Handles data transformation from tool results to network component props.
 */

'use client'

import { NetworkGraph, type NetworkGraphProps, type NetworkNode, type NetworkLink } from '../NetworkGraph'

// ============================================================================
// Type Definitions
// ============================================================================

export interface NetworkToolUIProps {
  /** Tool result data */
  toolResult: any

  /** Override network configuration */
  config?: Partial<NetworkGraphProps>

  /** Title override */
  title?: string

  /** Color theme */
  theme?: 'light' | 'dark'
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transform tool result to NetworkGraph data format
 */
function transformToolResult(toolResult: any): { nodes: NetworkNode[]; links: NetworkLink[] } {
  // Handle different result formats

  // Format 1: Already has nodes and edges/links
  if (toolResult?.nodes && (toolResult?.edges || toolResult?.links)) {
    const nodes: NetworkNode[] = toolResult.nodes.map((node: any) => ({
      id: node.id || node.experience_id || String(Math.random()),
      name: node.name || node.title || node.label || node.id,
      category: node.category || 'default',
      val: node.val || node.size || 1,
      ...node,
    }))

    const links: NetworkLink[] = (toolResult.edges || toolResult.links).map((link: any) => ({
      source: String(link.source || link.from),
      target: String(link.target || link.to),
      value: link.value || link.weight || link.similarity_score || 1,
      label: link.label || link.reason || '',
      ...link,
    }))

    return { nodes, links }
  }

  // Format 2: Results/experiences with connections array
  const data =
    toolResult?.results ||
    toolResult?.experiences ||
    toolResult?.data ||
    (Array.isArray(toolResult) ? toolResult : [])

  const nodes: NetworkNode[] = []
  const links: NetworkLink[] = []
  const nodeIds = new Set<string>()

  data.forEach((item: any) => {
    const nodeId = item.id || item.experience_id || String(Math.random())

    // Add node if not already added
    if (!nodeIds.has(nodeId)) {
      nodes.push({
        id: nodeId,
        name: item.title || item.name || nodeId,
        category: item.category || 'default',
        val: 1,
        title: item.title,
        description: item.description,
        similarity_score: item.similarity_score,
        ...item,
      })
      nodeIds.add(nodeId)
    }

    // Extract connections/edges
    if (item.connections && Array.isArray(item.connections)) {
      item.connections.forEach((conn: any) => {
        const targetId = conn.id || conn.target || conn.experience_id

        // Add target node if not exists
        if (targetId && !nodeIds.has(targetId)) {
          nodes.push({
            id: targetId,
            name: conn.title || conn.name || targetId,
            category: conn.category || 'default',
            val: 1,
            ...conn,
          })
          nodeIds.add(targetId)
        }

        // Add link
        if (targetId) {
          links.push({
            source: nodeId,
            target: targetId,
            value: conn.similarity_score || conn.score || conn.weight || 1,
            label: conn.reason || conn.label || '',
          })
        }
      })
    }

    // Extract edges array
    if (item.edges && Array.isArray(item.edges)) {
      item.edges.forEach((edge: any) => {
        const targetId = edge.target || edge.to

        if (targetId) {
          links.push({
            source: nodeId,
            target: targetId,
            value: edge.value || edge.weight || 1,
            label: edge.label || '',
          })
        }
      })
    }
  })

  return { nodes, links }
}

/**
 * Extract metadata from network data
 */
function extractMetadata(
  nodes: NetworkNode[],
  links: NetworkLink[]
): {
  nodeCount: number
  linkCount: number
  avgConnections: number
  categories: string[]
  isolatedNodes: number
} {
  const nodeCount = nodes.length
  const linkCount = links.length

  // Calculate average connections per node
  const connectionCounts = new Map<string, number>()
  links.forEach((link) => {
    connectionCounts.set(String(link.source), (connectionCounts.get(String(link.source)) || 0) + 1)
    connectionCounts.set(String(link.target), (connectionCounts.get(String(link.target)) || 0) + 1)
  })

  const avgConnections =
    nodeCount > 0 ? Array.from(connectionCounts.values()).reduce((sum, c) => sum + c, 0) / nodeCount : 0

  // Extract categories
  const categories = Array.from(new Set(nodes.map((n) => n.category)))

  // Count isolated nodes
  const connectedNodes = new Set<string>()
  links.forEach((link) => {
    connectedNodes.add(String(link.source))
    connectedNodes.add(String(link.target))
  })
  const isolatedNodes = nodeCount - connectedNodes.size

  return {
    nodeCount,
    linkCount,
    avgConnections: Math.round(avgConnections * 10) / 10,
    categories,
    isolatedNodes,
  }
}

// ============================================================================
// NetworkToolUI Component
// ============================================================================

export function NetworkToolUI({
  toolResult,
  config = {},
  title,
  theme = 'light',
}: NetworkToolUIProps) {
  // Transform data
  const { nodes, links } = transformToolResult(toolResult)
  const metadata = extractMetadata(nodes, links)

  // Generate title
  const networkTitle =
    title ||
    config.title ||
    (toolResult?.summary
      ? `${toolResult.summary} - Network`
      : `Connection Network (${metadata.nodeCount} nodes)`)

  return (
    <div className="w-full space-y-4">
      {/* Metadata Banner */}
      <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-sm text-purple-800 dark:text-purple-200">
          🕸️ Network: {metadata.nodeCount} nodes, {metadata.linkCount} connections | Avg{' '}
          {metadata.avgConnections} connections/node
          {metadata.isolatedNodes > 0 && ` | ${metadata.isolatedNodes} isolated nodes`}
        </p>
      </div>

      {/* Summary Text */}
      {toolResult?.summary && (
        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-900 dark:text-indigo-100">{toolResult.summary}</p>
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No network data available</p>
        </div>
      ) : (
        <NetworkGraph
          nodes={nodes}
          links={links}
          title={networkTitle}
          height={config.height || 600}
          width={config.width}
          showLabels={config.showLabels ?? true}
          theme={theme}
          nodeSize={config.nodeSize || 1}
          linkWidth={config.linkWidth || 1}
        />
      )}

      {/* Tool Result Metadata */}
      {toolResult?.reasoning && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            AI Reasoning
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{toolResult.reasoning}</p>
        </div>
      )}
    </div>
  )
}
