/**
 * XPShare AI System - Core Type Definitions
 *
 * Defines interfaces for AI SDK integration, agent communication,
 * visualization configuration, and tool parameter types.
 */

import { z } from 'zod'

// ============================================================================
// AI SDK Tool Interface
// ============================================================================

/**
 * Tool interface compatible with AI SDK
 * Used for all search, analytics, and relationship discovery tools
 */
export interface Tool<TParams = any, TResult = any> {
  /** Human-readable description of tool purpose and usage */
  description: string

  /** Zod schema defining and validating tool parameters */
  parameters: z.ZodSchema<TParams>

  /** Async function executing the tool logic */
  execute: (params: TParams) => Promise<TResult>
}

// ============================================================================
// Agent Communication
// ============================================================================

/**
 * Message structure for agent-to-agent and agent-to-user communication
 */
export interface AgentMessage {
  /** Message sender role */
  role: 'user' | 'assistant' | 'system'

  /** Message content (text, markdown, or structured data) */
  content: string

  /** Optional tool calls made during message generation */
  toolCalls?: ToolCall[]

  /** Optional timestamp */
  timestamp?: string
}

/**
 * Tool call metadata and results
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string

  /** Name of the tool being called */
  toolName: string

  /** Parameters passed to the tool */
  params: Record<string, any>

  /** Result returned from tool execution */
  result?: any

  /** Error if tool execution failed */
  error?: string
}

// ============================================================================
// Visualization Configuration
// ============================================================================

/**
 * Configuration for rendering visualizations
 * Used by Visualization Agent to generate interactive displays
 */
export interface VizConfig {
  /** Type of visualization to render */
  type: 'map' | 'timeline' | 'network' | 'heatmap' | 'dashboard'

  /** Data to be visualized */
  data: any

  /** Optional configuration for visualization behavior and appearance */
  options?: {
    /** Title displayed above visualization */
    title?: string

    /** Height in pixels or CSS units */
    height?: string | number

    /** Width in pixels or CSS units */
    width?: string | number

    /** Color scheme (light/dark) */
    theme?: 'light' | 'dark'

    /** Enable interactive features */
    interactive?: boolean

    /** Additional type-specific options */
    [key: string]: any
  }
}

// ============================================================================
// Tool Parameter Types
// ============================================================================

/**
 * Parameters for advanced_search tool
 * Multi-dimensional filtering combining semantic, geographic, and attribute search
 */
export interface AdvancedSearchParams {
  /** User's natural language query */
  query: string

  /** Filter by categories */
  categories?: string[]

  /** Geographic bounding box or radius search */
  location?: {
    type: 'radius' | 'bbox'
    lat?: number
    lng?: number
    radiusKm?: number
    bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  }

  /** Date range filter */
  dateRange?: {
    from: string // ISO date string
    to: string   // ISO date string
  }

  /** Attribute filters */
  attributes?: {
    key: string
    operator: 'equals' | 'contains' | 'exists'
    value?: string
  }[]

  /** Maximum number of results to return */
  maxResults?: number

  /** Minimum similarity score threshold (0-1) */
  minScore?: number
}

/**
 * Parameters for search_by_attributes tool
 * Precise attribute-based querying with logical operators
 */
export interface SearchByAttributesParams {
  /** Category to search within */
  category: string

  /** Attribute filters to apply */
  attributeFilters: {
    key: string
    operator: 'equals' | 'contains' | 'exists'
    value?: string
  }[]

  /** Logical operator combining filters */
  logic?: 'AND' | 'OR'

  /** Minimum AI confidence score */
  minConfidence?: number

  /** Maximum results to return */
  limit?: number
}

/**
 * Parameters for semantic_search tool
 * Vector similarity search using embeddings
 */
export interface SemanticSearchParams {
  /** Natural language query */
  query: string

  /** Optional category filter */
  categories?: string[]

  /** Minimum similarity threshold (0-1) */
  minSimilarity?: number

  /** Maximum results to return */
  maxResults?: number
}

/**
 * Parameters for rank_users tool
 * User ranking based on contribution metrics
 */
export interface RankUsersParams {
  /** Optional category filter */
  category?: string

  /** Ranking criteria */
  rankBy: 'experience_count' | 'diversity' | 'recent_activity'

  /** Number of top users to return */
  topN?: number
}

/**
 * Parameters for analyze_category tool
 * Deep-dive analysis of a specific category
 */
export interface AnalyzeCategoryParams {
  /** Category slug to analyze */
  category: string

  /** Date range for analysis */
  dateRange?: {
    from: string
    to: string
  }

  /** Include geographic distribution */
  includeGeo?: boolean

  /** Include temporal patterns */
  includeTemporal?: boolean
}

/**
 * Parameters for temporal_analysis tool
 * Time-based pattern discovery and aggregation
 */
export interface TemporalAnalysisParams {
  /** Time granularity for aggregation */
  granularity: 'hour' | 'day' | 'week' | 'month' | 'year'

  /** Optional category filter */
  category?: string

  /** Optional location filter */
  location?: string

  /** Date range to analyze */
  dateRange?: {
    from: string
    to: string
  }
}

/**
 * Parameters for find_connections tool
 * Multi-dimensional relationship discovery
 */
export interface FindConnectionsParams {
  /** Experience ID to find connections for */
  experienceId: string

  /** Enable semantic similarity (vector) */
  useSemantic?: boolean

  /** Enable geographic similarity */
  useGeographic?: boolean

  /** Enable temporal similarity */
  useTemporal?: boolean

  /** Enable attribute similarity */
  useAttributes?: boolean

  /** Maximum results to return */
  maxResults?: number

  /** Minimum combined similarity score */
  minScore?: number
}

// ============================================================================
// Tool Result Types
// ============================================================================

/**
 * Standard result structure for search tools
 */
export interface SearchResult {
  /** Matching experiences */
  results: Experience[]

  /** Total count of matches */
  count: number

  /** Execution metadata */
  metadata: {
    executionTime: number
    scoreRange?: [number, number]
    filters?: Record<string, any>
  }
}

/**
 * Result structure for user ranking
 */
export interface UserRankingResult {
  /** Ranked users */
  users: {
    id: string
    name: string
    experienceCount: number
    categoriesContributed: number
    score: number
  }[]

  /** Total users analyzed */
  totalUsers: number
}

/**
 * Result structure for category analysis
 */
export interface CategoryAnalysisResult {
  /** Category metadata */
  category: string

  /** Total experiences in category */
  totalExperiences: number

  /** Top attributes found */
  topAttributes: {
    key: string
    valueCount: Record<string, number>
  }[]

  /** Geographic distribution (if requested) */
  geoDistribution?: {
    location: string
    count: number
  }[]

  /** Temporal patterns (if requested) */
  temporalPattern?: {
    period: string
    count: number
  }[]
}

/**
 * Result structure for temporal analysis
 */
export interface TemporalAnalysisResult {
  /** Time periods with counts */
  periods: {
    period: string
    count: number
    categories?: Record<string, number>
    locations?: Record<string, number>
  }[]

  /** Analysis summary */
  summary: {
    totalPeriods: number
    peakPeriod: string
    peakCount: number
  }
}

/**
 * Result structure for connection finding
 */
export interface ConnectionsResult {
  /** Related experiences with similarity scores */
  connections: {
    experience: Experience
    similarityScore: number
    semanticScore?: number
    geoScore?: number
    temporalScore?: number
    attributeScore?: number
  }[]

  /** Analysis metadata */
  metadata: {
    sourceExperienceId: string
    dimensionsUsed: string[]
    executionTime: number
  }
}

/**
 * Experience data structure
 */
export interface Experience {
  id: string
  title: string
  storyText: string
  category: string
  locationText?: string
  locationLat?: number
  locationLng?: number
  dateOccurred?: string
  userId: string
  attributes?: Record<string, any>
  embedding?: number[]
  createdAt: string
  updatedAt: string
}
