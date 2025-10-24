/**
 * Model Selection Logic for XPShare Agent Network
 *
 * Implements adaptive model selection strategy:
 * - Simple queries → Claude 3.7 Sonnet Standard (3s, $0.008/query)
 * - Complex queries → Claude 3.7 Sonnet Extended (10s, $0.018/query)
 * - Premium features → OpenAI o3-mini High (15s, $0.028/query)
 *
 * Complexity Analysis:
 * - Low (< 0.5): Single-tool queries, simple searches
 * - Medium (0.5-0.8): Multi-tool orchestration, comparisons
 * - High (> 0.8): Deep analysis, correlations, predictions
 */

import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import type { LanguageModelV2 } from 'ai'

/**
 * Model Configuration
 */
export interface ModelConfig {
  model: LanguageModelV2
  thinkingMode?: 'standard' | 'extended'
  cost: number // Cost per 1k tokens (average)
  latency: number // Expected latency in seconds
  name: string
  description: string
}

/**
 * User Tier Configuration
 */
export type UserTier = 'free' | 'premium' | 'enterprise'

/**
 * Complexity Analysis Result
 */
export interface ComplexityAnalysis {
  score: number // 0-1
  level: 'low' | 'medium' | 'high'
  factors: {
    multiTool: boolean
    multiFilter: boolean
    statistical: boolean
    geographic: boolean
    temporal: boolean
    comparison: boolean
  }
  reason: string
}

/**
 * Analyze query complexity
 *
 * Factors considered:
 * - Multi-tool indicators (and, then, also, compare)
 * - Multi-filter queries (multiple in/within/from/to)
 * - Statistical analysis keywords
 * - Geographic + Temporal combination
 * - Comparison keywords
 */
export function analyzeComplexity(query: string): ComplexityAnalysis {
  const lowerQuery = query.toLowerCase()

  const factors = {
    multiTool: /\b(and|then|also|compare|both|visualize|analyze|show|create)\b.*\b(and|then|also|compare|both|visualize|analyze|show|create)\b/.test(
      lowerQuery
    ),
    multiFilter: (lowerQuery.match(/\b(in|within|from|to|between)\b/g) || []).length >= 2,
    statistical:
      /\b(correlation|pattern|trend|predict|forecast|analyze|statistics|insights)\b/.test(
        lowerQuery
      ),
    geographic: /\b(where|location|city|country|map|geographic|radius|near)\b/.test(lowerQuery),
    temporal: /\b(when|time|date|day|week|month|year|timeline|trend)\b/.test(lowerQuery),
    comparison: /\b(compare|versus|vs|difference|similarity|both)\b/.test(lowerQuery),
  }

  // Calculate complexity score
  let score = 0.2 // Base score

  if (factors.multiTool) score += 0.25
  if (factors.multiFilter) score += 0.15
  if (factors.statistical) score += 0.2
  if (factors.geographic && factors.temporal) score += 0.15
  if (factors.comparison) score += 0.15

  // Cap at 1.0
  score = Math.min(score, 1.0)

  // Determine level
  const level = score < 0.5 ? 'low' : score < 0.8 ? 'medium' : 'high'

  // Generate reason
  const reasons: string[] = []
  if (factors.multiTool) reasons.push('multi-tool orchestration')
  if (factors.multiFilter) reasons.push('multiple filters')
  if (factors.statistical) reasons.push('statistical analysis')
  if (factors.geographic && factors.temporal) reasons.push('geo-temporal analysis')
  if (factors.comparison) reasons.push('comparison required')

  const reason =
    reasons.length > 0
      ? `Complex query requiring: ${reasons.join(', ')}`
      : 'Simple query with single tool'

  return {
    score,
    level,
    factors,
    reason,
  }
}

/**
 * Available Models
 */
export const MODELS = {
  // Claude 3.7 Sonnet - Standard Mode
  CLAUDE_STANDARD: {
    model: anthropic('claude-3-7-sonnet-20250219'),
    thinkingMode: 'standard' as const,
    cost: 0.008, // ~$0.008 per query
    latency: 3, // ~3s
    name: 'Claude 3.7 Sonnet (Standard)',
    description: 'Fast reasoning for simple queries (3s latency)',
  },

  // Claude 3.7 Sonnet - Extended Thinking
  CLAUDE_EXTENDED: {
    model: anthropic('claude-3-7-sonnet-20250219'),
    thinkingMode: 'extended' as const,
    cost: 0.018, // ~$0.018 per query
    latency: 10, // ~10s
    name: 'Claude 3.7 Sonnet (Extended)',
    description: 'Deep reasoning for complex queries (10s latency)',
  },

  // OpenAI o3-mini - High Effort
  O3_MINI_HIGH: {
    model: openai('o3-mini', {
      reasoning: {
        effort: 'high',
      },
    }),
    cost: 0.028, // ~$0.028 per query
    latency: 15, // ~15s
    name: 'OpenAI o3-mini (High)',
    description: 'Premium reasoning for ultra-complex queries (15s latency)',
  },

  // Fallback: GPT-4o (existing default)
  GPT4O: {
    model: openai('gpt-4o'),
    cost: 0.006, // ~$0.006 per query
    latency: 2, // ~2s
    name: 'GPT-4o',
    description: 'Fast general-purpose model (fallback)',
  },
} as const

/**
 * Select optimal model based on query complexity and user tier
 *
 * Decision Matrix:
 *
 * | Complexity | Free Users         | Premium Users      | Enterprise         |
 * |------------|--------------------|--------------------|------------------- |
 * | Low        | Claude Standard    | Claude Standard    | Claude Standard    |
 * | Medium     | Claude Standard    | Claude Extended    | Claude Extended    |
 * | High       | Claude Extended    | o3-mini High       | o3-mini High       |
 *
 * @param query - User query to analyze
 * @param userTier - User's subscription tier
 * @param forceModel - Override automatic selection (for testing)
 * @returns Selected model configuration
 */
export function selectModel(
  query: string,
  userTier: UserTier = 'free',
  forceModel?: keyof typeof MODELS
): {
  config: ModelConfig
  complexity: ComplexityAnalysis
} {
  // Force specific model if requested
  if (forceModel) {
    return {
      config: MODELS[forceModel],
      complexity: analyzeComplexity(query),
    }
  }

  // Analyze complexity
  const complexity = analyzeComplexity(query)

  // Select model based on tier and complexity
  let selectedModel: ModelConfig

  if (userTier === 'free') {
    // Free users: Standard for simple/medium, Extended for high
    selectedModel =
      complexity.level === 'high' ? MODELS.CLAUDE_EXTENDED : MODELS.CLAUDE_STANDARD
  } else if (userTier === 'premium') {
    // Premium users: Standard for simple, Extended for medium, o3-mini for high
    if (complexity.level === 'low') {
      selectedModel = MODELS.CLAUDE_STANDARD
    } else if (complexity.level === 'medium') {
      selectedModel = MODELS.CLAUDE_EXTENDED
    } else {
      selectedModel = MODELS.O3_MINI_HIGH
    }
  } else {
    // Enterprise: Same as premium (future: could add custom models)
    if (complexity.level === 'low') {
      selectedModel = MODELS.CLAUDE_STANDARD
    } else if (complexity.level === 'medium') {
      selectedModel = MODELS.CLAUDE_EXTENDED
    } else {
      selectedModel = MODELS.O3_MINI_HIGH
    }
  }

  return {
    config: selectedModel,
    complexity,
  }
}

/**
 * Get cost estimate for a query
 *
 * Estimates based on average token usage:
 * - Input: ~1000 tokens (conversation history + query)
 * - Output: ~500 tokens (response)
 * - Thinking tokens: ~5000 tokens (Extended mode)
 *
 * @param query - User query
 * @param userTier - User subscription tier
 * @returns Estimated cost in USD
 */
export function estimateQueryCost(query: string, userTier: UserTier = 'free'): {
  model: string
  cost: number
  latency: number
  complexity: ComplexityAnalysis
} {
  const { config, complexity } = selectModel(query, userTier)

  return {
    model: config.name,
    cost: config.cost,
    latency: config.latency,
    complexity,
  }
}

/**
 * Get monthly cost estimate based on usage
 *
 * @param queriesPerDay - Average queries per day
 * @param userTier - User subscription tier
 * @param complexityDistribution - Distribution of query complexity (default: 60% low, 30% medium, 10% high)
 * @returns Monthly cost estimate
 */
export function estimateMonthlyCost(
  queriesPerDay: number,
  userTier: UserTier = 'free',
  complexityDistribution = { low: 0.6, medium: 0.3, high: 0.1 }
): {
  totalCost: number
  breakdown: {
    low: { queries: number; cost: number }
    medium: { queries: number; cost: number }
    high: { queries: number; cost: number }
  }
} {
  const queriesPerMonth = queriesPerDay * 30

  const lowQueries = Math.floor(queriesPerMonth * complexityDistribution.low)
  const mediumQueries = Math.floor(queriesPerMonth * complexityDistribution.medium)
  const highQueries = Math.floor(queriesPerMonth * complexityDistribution.high)

  // Get costs based on user tier
  const getCostForLevel = (level: 'low' | 'medium' | 'high'): number => {
    if (userTier === 'free') {
      return level === 'high' ? MODELS.CLAUDE_EXTENDED.cost : MODELS.CLAUDE_STANDARD.cost
    } else if (userTier === 'premium') {
      if (level === 'low') return MODELS.CLAUDE_STANDARD.cost
      if (level === 'medium') return MODELS.CLAUDE_EXTENDED.cost
      return MODELS.O3_MINI_HIGH.cost
    } else {
      // enterprise
      if (level === 'low') return MODELS.CLAUDE_STANDARD.cost
      if (level === 'medium') return MODELS.CLAUDE_EXTENDED.cost
      return MODELS.O3_MINI_HIGH.cost
    }
  }

  const lowCost = lowQueries * getCostForLevel('low')
  const mediumCost = mediumQueries * getCostForLevel('medium')
  const highCost = highQueries * getCostForLevel('high')

  return {
    totalCost: lowCost + mediumCost + highCost,
    breakdown: {
      low: { queries: lowQueries, cost: lowCost },
      medium: { queries: mediumQueries, cost: mediumCost },
      high: { queries: highQueries, cost: highCost },
    },
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * // Simple query
 * const { config, complexity } = selectModel("Show me UFO sightings", "free")
 * // → Claude Standard (3s, $0.008)
 *
 * // Complex query
 * const { config, complexity } = selectModel(
 *   "Compare UFO trends in Berlin vs Paris and show correlation with moon phases",
 *   "premium"
 * )
 * // → o3-mini High (15s, $0.028)
 *
 * // Cost estimation
 * const estimate = estimateQueryCost("Analyze patterns", "premium")
 * // → { model: "Claude Extended", cost: 0.018, latency: 10 }
 *
 * // Monthly cost
 * const monthly = estimateMonthlyCost(100, "premium")
 * // → { totalCost: $130, breakdown: { low: $24, medium: $54, high: $84 } }
 * ```
 */
