/**
 * Token & Cost Tracking
 *
 * Tracks token usage and estimates costs for AI interactions.
 * Provides usage analytics and budget monitoring.
 */

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface CostEstimate {
  promptCost: number
  completionCost: number
  totalCost: number
  currency: string
}

export interface UsageRecord {
  id: string
  userId: string
  sessionId: string
  messageId: string
  model: string
  usage: TokenUsage
  cost: CostEstimate
  timestamp: number
}

/**
 * Model pricing (per 1M tokens) - GPT-4o-mini
 */
const MODEL_PRICING = {
  'gpt-4o-mini': {
    input: 0.15, // $0.15 per 1M input tokens
    output: 0.60, // $0.60 per 1M output tokens
  },
  'gpt-4o': {
    input: 2.50, // $2.50 per 1M input tokens
    output: 10.00, // $10.00 per 1M output tokens
  },
} as const

type ModelName = keyof typeof MODEL_PRICING

/**
 * Calculate cost from token usage
 */
export function calculateCost(
  usage: TokenUsage,
  model: ModelName = 'gpt-4o-mini'
): CostEstimate {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o-mini']

  const promptCost = (usage.promptTokens / 1_000_000) * pricing.input
  const completionCost = (usage.completionTokens / 1_000_000) * pricing.output
  const totalCost = promptCost + completionCost

  return {
    promptCost: Number(promptCost.toFixed(6)),
    completionCost: Number(completionCost.toFixed(6)),
    totalCost: Number(totalCost.toFixed(6)),
    currency: 'USD',
  }
}

/**
 * Estimate tokens from text (rough approximation)
 * ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Track usage for a message
 */
export async function trackUsage(
  userId: string,
  sessionId: string,
  messageId: string,
  usage: TokenUsage,
  model: ModelName = 'gpt-4o-mini'
): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const cost = calculateCost(usage, model)

    const { error } = await supabase.from('usage_tracking').insert({
      user_id: userId,
      session_id: sessionId,
      message_id: messageId,
      model,
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
      prompt_cost: cost.promptCost,
      completion_cost: cost.completionCost,
      total_cost: cost.totalCost,
    })

    if (error) {
      console.error('[Usage Tracking] Failed to track usage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Usage Tracking] Error:', error)
    return false
  }
}

/**
 * Get usage stats for user
 */
export async function getUserUsageStats(
  userId: string,
  timeframe: 'today' | 'week' | 'month' | 'all' = 'month'
): Promise<{
  totalTokens: number
  totalCost: number
  messageCount: number
  averageTokensPerMessage: number
  averageCostPerMessage: number
}> {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'all':
        startDate = null
        break
    }

    let query = supabase
      .from('usage_tracking')
      .select('total_tokens, total_cost')
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('[Usage Tracking] Failed to get stats:', error)
      return {
        totalTokens: 0,
        totalCost: 0,
        messageCount: 0,
        averageTokensPerMessage: 0,
        averageCostPerMessage: 0,
      }
    }

    const totalTokens = data?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0
    const totalCost = data?.reduce((sum, record) => sum + (record.total_cost || 0), 0) || 0
    const messageCount = data?.length || 0

    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(4)),
      messageCount,
      averageTokensPerMessage: messageCount > 0 ? Math.round(totalTokens / messageCount) : 0,
      averageCostPerMessage: messageCount > 0 ? Number((totalCost / messageCount).toFixed(6)) : 0,
    }
  } catch (error) {
    console.error('[Usage Tracking] Error getting stats:', error)
    return {
      totalTokens: 0,
      totalCost: 0,
      messageCount: 0,
      averageTokensPerMessage: 0,
      averageCostPerMessage: 0,
    }
  }
}

/**
 * Get session usage stats
 */
export async function getSessionUsageStats(sessionId: string): Promise<{
  totalTokens: number
  totalCost: number
  messageCount: number
}> {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('total_tokens, total_cost')
      .eq('session_id', sessionId)

    if (error) {
      console.error('[Usage Tracking] Failed to get session stats:', error)
      return { totalTokens: 0, totalCost: 0, messageCount: 0 }
    }

    const totalTokens = data?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0
    const totalCost = data?.reduce((sum, record) => sum + (record.total_cost || 0), 0) || 0

    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(4)),
      messageCount: data?.length || 0,
    }
  } catch (error) {
    console.error('[Usage Tracking] Error getting session stats:', error)
    return { totalTokens: 0, totalCost: 0, messageCount: 0 }
  }
}

/**
 * Format cost for display
 */
export function formatCost(cost: number, currency: string = 'USD'): string {
  if (cost < 0.001) {
    return `<$0.001 ${currency}`
  }
  return `$${cost.toFixed(3)} ${currency}`
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens}`
  }
  if (tokens < 1_000_000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return `${(tokens / 1_000_000).toFixed(2)}M`
}
