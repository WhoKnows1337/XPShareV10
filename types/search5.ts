/**
 * Search 5.0 - TypeScript Type Definitions
 *
 * Comprehensive type system for AI-powered pattern discovery
 * with multi-turn conversation, query refinement, and progressive disclosure.
 *
 * @see docs/masterdocs/search5.md for full specification
 */

import { Source } from './ai-answer'
import { ConversationTurnSchema } from '@/lib/validation/search5-schemas'
import { z } from 'zod'

// Re-export Source for convenience
export type { Source }

// ConversationTurn type from Zod schema
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>

// ============================================================================
// CORE RESPONSE TYPES
// ============================================================================

/**
 * LLM-generated follow-up question suggestion
 * @see docs/masterdocs/search5.md (Part 3.9 - Follow-up Questions)
 */
export interface FollowUpSuggestion {
  question: string                                            // The follow-up question
  category?: 'color' | 'temporal' | 'behavior' | 'location' | 'attribute' | 'cross-category'
  reason: string                                              // Why this is interesting
}

/**
 * Main response structure from Search 5.0 API
 * Uses OpenAI Structured Outputs (JSON Schema) for guaranteed format
 */
export interface Search5Response {
  /** Quality indicators shown first to user */
  metadata: {
    confidence: number          // 0-100 avg similarity score
    sourceCount: number         // Number of XPs analyzed
    patternsFound: number       // Number of patterns detected
    executionTime: number       // Response time in ms
    warnings: string[]          // e.g., "Older XPs not included in results"
    exactMatchCount?: number    // Number of sources with exact keyword/tag matches
    hasPartialMatchesOnly?: boolean  // True if no exact matches, only semantic similarity
  }

  /** Structured patterns (main content) */
  patterns: Pattern[]

  /** LLM-generated summary of the findings */
  summary?: string

  /** LLM-generated follow-up questions based on discovered patterns */
  followUpSuggestions?: FollowUpSuggestion[]

  /** Serendipity discovery (unexpected but relevant connections) */
  serendipity?: SerendipityConnection

  /** Sources for verification (experience IDs with metadata) */
  sources: Source[]
}

/**
 * Type alias for Search 5.0 metadata (quality indicators)
 */
export type Search5Metadata = Search5Response['metadata']

/**
 * Pattern detected in user experiences
 * Can be color, temporal, behavioral, location, or attribute patterns
 */
export interface Pattern {
  type: 'color' | 'temporal' | 'behavior' | 'location' | 'attribute'
  title: string               // e.g., "Farbmuster: Orange dominiert"
  finding: string             // One-sentence key insight with [#ID] citations
  data: PatternData           // Structured data for visualizations
  sourceIds: string[]         // Which experience IDs support this pattern
  citationIds?: number[]      // Inline citation IDs (e.g., [1, 3, 7])
  confidence: number          // Pattern strength 0-100
  visualizationType?: 'bar' | 'timeline' | 'map' | 'tag-cloud'  // Optional - default set client-side
}

/**
 * Structured data for pattern visualizations
 * Different fields are populated based on pattern type
 */
export interface PatternData {
  /** For color/attribute patterns - distribution chart */
  distribution?: Array<{
    label: string           // e.g., "Orange", "Blau"
    count: number           // Number of occurrences
    percentage?: number     // Percentage of total (optional - can be calculated from count)
  }>

  /** For temporal patterns - timeline chart */
  timeline?: Array<{
    month: string           // e.g., "2024-03"
    count: number           // Experiences in this period
    highlight?: boolean     // Peak detection flag
  }>

  /** For location patterns - geographic clustering */
  geoCluster?: {
    center: string          // e.g., "Bodensee"
    radius: number          // Cluster radius in km
    count: number           // Experiences in cluster
    heatmap?: Array<{
      lat: number
      lng: number
      weight: number
    }>
  }
}

/**
 * Serendipity connection - unexpected but relevant cross-category pattern
 * Example: User asks about UFOs, discovers Kugelblitz (ball lightning) patterns
 */
export interface SerendipityConnection {
  targetCategory: string       // e.g., "Kugelblitz"
  similarity: number           // 0-1 semantic similarity score
  explanation: string          // Why this is unexpected but relevant
  experiences: Source[]        // Sample experiences from target category
  count: number                // Total matching experiences
}

// ============================================================================
// QUERY REFINEMENT TYPES (Part 3.11)
// ============================================================================

/**
 * Search suggestion types for autocomplete dropdown
 */
export interface SearchSuggestion {
  type: 'recent' | 'popular' | 'typo-correction' | 'template'
  text: string                 // Suggestion text
  icon?: React.ReactNode       // Optional icon component
  metadata?: string            // Additional info (e.g., "Beliebte Frage")
}

/**
 * Props for SmartSearchInput component
 */
export interface SmartSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (query: string) => void
  disabled?: boolean
  recentSearches?: string[]
  popularQueries?: string[]
}

/**
 * Query refinement options from refinement panel
 */
export interface QueryRefinements {
  confidenceThreshold?: number     // Min similarity score (0-100)
  dateRange?: {
    from: string                   // ISO date string
    to: string
  }
  categories?: string[]            // Filter by experience categories
  maxSources?: number              // Limit result count
}

/**
 * Props for QueryRefinementPanel component
 */
export interface QueryRefinementPanelProps {
  onRefine: (refinements: QueryRefinements) => void
  activeRefinements?: QueryRefinements
}

// ============================================================================
// PROGRESSIVE DISCLOSURE TYPES (Part 3.13)
// ============================================================================

/**
 * Sort options for pattern grid
 */
export type SortBy = 'confidence' | 'relevance' | 'recency' | 'type'

/**
 * Grouping options for pattern grid
 */
export type GroupBy = 'none' | 'category' | 'type' | 'confidence-tier'

/**
 * Props for ProgressivePatternGrid component
 */
export interface ProgressivePatternGridProps {
  patterns: Pattern[]
  sources: Source[]
  initialVisible?: number          // Number of patterns shown initially (default: 3)
  loadMoreIncrement?: number       // How many to load per click (default: 3)
}

/**
 * Props for QuickFilterChips component
 */
export interface QuickFilterChipsProps {
  patterns: Pattern[]
  activeFilters: Set<string>
  onFilterToggle: (filterType: string, value: string) => void
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for main AskAIStructured component
 */
export interface AskAIStructuredProps {
  initialQuestion?: string
  onQuestionChange?: (question: string) => void
  hideInput?: boolean
  autoSubmit?: boolean
  filters?: {
    category?: string
    tags?: string
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }
}

/**
 * Props for ResearchQualityCard component
 */
export interface ResearchQualityCardProps {
  metadata: {
    confidence: number
    sourceCount: number
    patternsFound: number
    executionTime: number
    warnings: string[]
  }
}

/**
 * Props for PatternCard component with citations
 */
export interface PatternCardProps {
  pattern: Pattern
  sources: Source[]
  showVisualization?: boolean
}

/**
 * Props for SerendipityCard component
 */
export interface SerendipityCardProps {
  serendipity: SerendipityConnection
  onExplore?: (category: string) => void
}

/**
 * Props for DistributionChart visualization
 */
export interface DistributionChartProps {
  data: Array<{
    label: string
    count: number
    percentage: number
  }>
  maxHeight?: number
}

/**
 * Props for TimelinePreview visualization
 */
export interface TimelinePreviewProps {
  data: Array<{
    month: string
    count: number
    highlight?: boolean
  }>
}

/**
 * Props for SourcesSection component
 */
export interface SourcesSectionProps {
  sources: Source[]
  query: string
  collapsible?: boolean
}

/**
 * Props for FollowUpQuestions component
 */
export interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  patterns?: Pattern[]
  conversationDepth?: number
}

// ============================================================================
// LOADING & ERROR STATE TYPES
// ============================================================================

/**
 * Props for pattern card skeleton loader
 */
export interface PatternCardSkeletonProps {
  count?: number
}

/**
 * Props for no patterns empty state
 */
export interface NoPatternsEmptyStateProps {
  query: string
  onRefine?: () => void
}

/**
 * Props for low confidence warning
 */
export interface LowConfidenceWarningProps {
  confidence: number
  sourceCount: number
  onRefine?: () => void
}

/**
 * Props for error state display
 */
export interface ErrorStateProps {
  error: Error
  onRetry?: () => void
  onReset?: () => void
}

// ============================================================================
// METRICS & ANALYTICS TYPES
// ============================================================================

/**
 * Follow-up question metrics
 */
export interface FollowUpMetrics {
  clickRate: number               // % of users who click follow-ups
  avgQuestionsShown: number       // Avg follow-ups per query
  conversationDepth: number       // Avg queries per session
}

/**
 * Autocomplete metrics (Part 3.11)
 */
export interface AutocompleteMetrics {
  suggestionClickRate: number     // Target: 45%+
  typoCorrectionsApplied: number  // Count of typo fixes
  refinementPanelUsage: number    // Target: 30%+
  avgTimeToFirstQuery: number     // Target: -40% improvement
}

/**
 * Multi-turn conversation metrics (Part 3.12)
 */
export interface MultiTurnMetrics {
  avgConversationDepth: number        // Target: 2.5+ queries/session
  contextReferenceRate: number        // Target: 40%+ use previous context
  conversationCoherence: number       // Target: 85%+ LLM coherence score
  historyEngagementRate: number       // Target: 25%+ click history sidebar
}

/**
 * Progressive disclosure metrics (Part 3.13)
 */
export interface ProgressiveDisclosureMetrics {
  avgPatternsViewedPerQuery: number   // Target: 4-5 vs. all at once
  loadMoreClickRate: number           // Target: 60%+
  filterUsageRate: number             // Target: 45%+ sort/group usage
  quickFilterClickRate: number        // Target: 35%+ quick filter chips
  cognitiveOverloadReduction: number  // Target: -45% (survey/heatmap)
}

/**
 * Cost control metrics (Part 3.11 - Cost Control)
 */
export interface CostControlMetrics {
  avgApiCallsPerSession: number       // Target: <3 (vs. 50+ without controls)
  avgApiCallsPerQuery: number         // Target: 1.0 (one query = one call)
  duplicateRequestsPrevented: number  // Tracked (AbortController)
  costPerQuery: number                // Target: ~$0.013 (vs. ~$0.26)
  monthlyCostPerActiveUser: number    // Target: ~$1.30 (vs. ~$26)
  autocompleteResponseTime: number    // Target: <50ms (local only)
  suggestionGenerationTime: number    // Target: <100ms (debounced)
  rateLimitHits: number               // Tracked (429 errors)
  tokenUsagePerQuery: number          // Target: ~500 (vs. ~10,000)
}

/**
 * Complete Search 5.0 metrics aggregation
 */
export interface Search5Metrics {
  // Query success metrics
  querySuccessRate: number            // % queries with results
  avgConfidenceScore: number          // Avg pattern confidence
  avgPatternsPerQuery: number         // Patterns discovered per query

  // Pattern discovery metrics
  patternDiscoveryRate: number        // % queries finding patterns
  serendipityRate: number             // % queries with unexpected connections
  avgSourcesPerPattern: number        // Evidence quality

  // User engagement metrics
  avgSessionDuration: number          // Time spent in Search 5.0
  patternExplorationRate: number      // % users clicking patterns
  sourceVerificationRate: number      // % users checking sources

  // All sub-metrics
  followUp: FollowUpMetrics
  autocomplete: AutocompleteMetrics
  multiTurn: MultiTurnMetrics
  progressiveDisclosure: ProgressiveDisclosureMetrics
  costControl: CostControlMetrics
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Recovery strategy for error handling
 */
export interface RecoveryStrategy {
  retryable: boolean
  suggestion: string
  action?: () => void
}

/**
 * Streaming state for real-time updates
 */
export type StreamingState =
  | 'idle'
  | 'generating_embedding'
  | 'searching'
  | 'detecting_patterns'
  | 'generating_answer'
  | 'complete'
  | 'error'
