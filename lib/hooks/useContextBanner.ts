import { useState, useCallback } from 'react'

export interface ActiveFilter {
  id: string
  type: 'category' | 'location' | 'dateRange' | 'custom'
  label: string
  value: any
}

export interface ActiveTool {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  startedAt: number
}

export interface ContextBannerState {
  filters: ActiveFilter[]
  tools: ActiveTool[]
  sessionTopic?: string
}

/**
 * useContextBanner - Manage active context state for ContextBanner
 *
 * Tracks active filters, running tools, and session context
 */
export function useContextBanner() {
  const [state, setState] = useState<ContextBannerState>({
    filters: [],
    tools: [],
  })

  // Add filter
  const addFilter = useCallback((filter: ActiveFilter) => {
    setState((prev) => ({
      ...prev,
      filters: [...prev.filters, filter],
    }))
  }, [])

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setState((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.id !== filterId),
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: [],
    }))
  }, [])

  // Add tool (when tool execution starts)
  const addTool = useCallback((toolName: string) => {
    const toolId = `${toolName}-${Date.now()}`
    setState((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          id: toolId,
          name: toolName,
          status: 'running',
          startedAt: Date.now(),
        },
      ],
    }))
    return toolId
  }, [])

  // Update tool status
  const updateToolStatus = useCallback(
    (toolId: string, status: 'completed' | 'failed') => {
      setState((prev) => ({
        ...prev,
        tools: prev.tools.map((t) =>
          t.id === toolId ? { ...t, status } : t
        ),
      }))

      // Auto-remove completed/failed tools after 5 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          tools: prev.tools.filter((t) => t.id !== toolId),
        }))
      }, 5000)
    },
    []
  )

  // Remove tool
  const removeTool = useCallback((toolId: string) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.id !== toolId),
    }))
  }, [])

  // Clear all tools
  const clearTools = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tools: [],
    }))
  }, [])

  // Set session topic
  const setSessionTopic = useCallback((topic?: string) => {
    setState((prev) => ({
      ...prev,
      sessionTopic: topic,
    }))
  }, [])

  // Clear all context (new conversation)
  const clearAll = useCallback(() => {
    setState({
      filters: [],
      tools: [],
    })
  }, [])

  return {
    state,
    addFilter,
    removeFilter,
    clearFilters,
    addTool,
    updateToolStatus,
    removeTool,
    clearTools,
    setSessionTopic,
    clearAll,
  }
}
