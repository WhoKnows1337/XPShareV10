/**
 * Context Banner Component
 *
 * Shows active filters, tools in use, and session context.
 * Helps users understand what the AI is doing.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Filter,
  Search,
  TrendingUp,
  Network,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'

export interface ActiveFilter {
  key: string
  label: string
  value: string
  removable?: boolean
}

export interface ActiveTool {
  name: string
  displayName: string
  status: 'running' | 'completed' | 'failed'
  duration?: number
}

export interface ContextBannerProps {
  activeFilters?: ActiveFilter[]
  activeTools?: ActiveTool[]
  sessionContext?: {
    topic?: string
    queriesCount?: number
  }
  onRemoveFilter?: (key: string) => void
  onClearFilters?: () => void
}

export function ContextBanner({
  activeFilters = [],
  activeTools = [],
  sessionContext,
  onRemoveFilter,
  onClearFilters,
}: ContextBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = activeFilters.length > 0
  const hasActiveTools = activeTools.length > 0
  const hasContext = !!sessionContext?.topic

  // Don't show banner if nothing is active
  if (!hasActiveFilters && !hasActiveTools && !hasContext) {
    return null
  }

  // Get tool icon
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('search') || toolName.includes('Search')) {
      return <Search className="h-3 w-3" />
    }
    if (toolName.includes('analytics') || toolName.includes('analyze')) {
      return <TrendingUp className="h-3 w-3" />
    }
    if (toolName.includes('connection') || toolName.includes('pattern')) {
      return <Network className="h-3 w-3" />
    }
    return <Sparkles className="h-3 w-3" />
  }

  // Get tool status color
  const getToolStatusColor = (status: ActiveTool['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/30'
    }
  }

  return (
    <div className="border-b bg-muted/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Context & Filters */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Session Context */}
            {sessionContext?.topic && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{sessionContext.topic}</span>
                {sessionContext.queriesCount && sessionContext.queriesCount > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {sessionContext.queriesCount} queries
                  </Badge>
                )}
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="h-3 w-3 text-muted-foreground" />
                {activeFilters.slice(0, isExpanded ? undefined : 3).map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <span className="text-muted-foreground">{filter.label}:</span>
                    <span>{filter.value}</span>
                    {filter.removable !== false && onRemoveFilter && (
                      <button
                        onClick={() => onRemoveFilter(filter.key)}
                        className="ml-1 hover:text-destructive"
                        aria-label={`Remove ${filter.label} filter`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {!isExpanded && activeFilters.length > 3 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    +{activeFilters.length - 3} more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Tools & Actions */}
          <div className="flex items-center gap-2">
            {/* Active Tools */}
            {hasActiveTools && (
              <div className="flex items-center gap-1.5">
                {activeTools.map((tool, index) => (
                  <Badge
                    key={`${tool.name}-${index}`}
                    variant="outline"
                    className={`text-xs flex items-center gap-1 ${getToolStatusColor(tool.status)}`}
                  >
                    {getToolIcon(tool.name)}
                    <span>{tool.displayName}</span>
                    {tool.duration && tool.status === 'completed' && (
                      <span className="text-muted-foreground">
                        {tool.duration < 1000 ? `${tool.duration}ms` : `${(tool.duration / 1000).toFixed(1)}s`}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )}

            {/* Expand/Collapse */}
            {activeFilters.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && activeFilters.length > 3 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeFilters.slice(3).map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <span className="text-muted-foreground">{filter.label}:</span>
                <span>{filter.value}</span>
                {filter.removable !== false && onRemoveFilter && (
                  <button
                    onClick={() => onRemoveFilter(filter.key)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for mobile
 */
export function CompactContextBanner({
  activeFilters = [],
  activeToolsCount = 0,
}: {
  activeFilters?: ActiveFilter[]
  activeToolsCount?: number
}) {
  if (activeFilters.length === 0 && activeToolsCount === 0) return null

  return (
    <div className="border-b bg-muted/30 px-3 py-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {activeFilters.length > 0 && (
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
          </span>
        )}
        {activeToolsCount > 0 && (
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {activeToolsCount} tool{activeToolsCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
