'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DollarSign, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CostBadgeProps {
  messageId?: string
  chatId?: string
  variant?: 'message' | 'session'
  className?: string
}

interface UsageStats {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  promptCost: number
  completionCost: number
  totalCost: number
  model: string
}

/**
 * CostBadge - Display token usage and cost for messages or sessions
 *
 * Usage:
 * - <CostBadge messageId="msg-123" variant="message" /> - Show cost for single message
 * - <CostBadge chatId="chat-456" variant="session" /> - Show total session cost
 */
export function CostBadge({ messageId, chatId, variant = 'message', className }: CostBadgeProps) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const params = new URLSearchParams()
        if (messageId) params.set('messageId', messageId)
        if (chatId) params.set('chatId', chatId)
        if (variant === 'session') params.set('aggregated', 'true')

        const response = await fetch(`/api/usage?${params}`)
        if (!response.ok) throw new Error('Failed to fetch usage')

        const data = await response.json()

        if (variant === 'session' && data.stats) {
          setStats(data.stats)
        } else if (data.usage && data.usage.length > 0) {
          setStats(data.usage[0])
        }
      } catch (error) {
        console.error('[CostBadge] Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }

    if (messageId || chatId) {
      fetchUsage()
    }
  }, [messageId, chatId, variant])

  if (loading || !stats) {
    return null
  }

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01'
    return `$${cost.toFixed(4)}`
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`
    }
    return tokens.toString()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1', className)}>
            <Badge
              variant="outline"
              className="gap-1 text-xs font-mono cursor-help"
            >
              <Zap className="h-3 w-3 text-yellow-500" />
              {formatTokens(stats.totalTokens)}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 text-xs font-mono cursor-help"
            >
              <DollarSign className="h-3 w-3 text-green-500" />
              {formatCost(stats.totalCost)}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <div className="font-semibold">
              {variant === 'message' ? 'Message Usage' : 'Session Total'}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-muted-foreground">
              <span>Prompt:</span>
              <span className="font-mono">{stats.promptTokens.toLocaleString()} tokens</span>

              <span>Completion:</span>
              <span className="font-mono">{stats.completionTokens.toLocaleString()} tokens</span>

              <span>Total:</span>
              <span className="font-mono font-semibold">{stats.totalTokens.toLocaleString()} tokens</span>

              <div className="col-span-2 border-t border-border my-1" />

              <span>Prompt cost:</span>
              <span className="font-mono">{formatCost(stats.promptCost)}</span>

              <span>Completion cost:</span>
              <span className="font-mono">{formatCost(stats.completionCost)}</span>

              <span>Total cost:</span>
              <span className="font-mono font-semibold">{formatCost(stats.totalCost)}</span>

              <div className="col-span-2 border-t border-border my-1" />

              <span className="col-span-2 text-center">
                Model: <span className="font-mono">{stats.model}</span>
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * SessionCostSummary - Compact summary for session header
 */
interface SessionCostSummaryProps {
  chatId: string
  className?: string
}

export function SessionCostSummary({ chatId, className }: SessionCostSummaryProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">Session cost:</span>
      <CostBadge chatId={chatId} variant="session" />
    </div>
  )
}
