/**
 * Analytics Tracking
 *
 * Utility functions for tracking custom events in Vercel Analytics.
 */

import { track } from '@vercel/analytics'

/**
 * Track Discovery AI query
 */
export function trackDiscoveryQuery(eventData: {
  query: string
  toolsUsed?: string[]
  userId?: string
  duration?: number
}) {
  track('discovery_query', {
    query_length: eventData.query.length,
    tools_count: eventData.toolsUsed?.length || 0,
    tools: eventData.toolsUsed?.join(',') || '',
    has_user: !!eventData.userId,
    duration: eventData.duration || 0,
  })
}

/**
 * Track tool execution
 */
export function trackToolExecution(eventData: {
  toolName: string
  success: boolean
  duration: number
  userId?: string
}) {
  track('tool_execution', {
    tool: eventData.toolName,
    success: eventData.success,
    duration: eventData.duration,
    has_user: !!eventData.userId,
  })
}

/**
 * Track chat creation
 */
export function trackChatCreated(eventData: {
  userId?: string
}) {
  track('chat_created', {
    has_user: !!eventData.userId,
  })
}

/**
 * Track export action
 */
export function trackExport(eventData: {
  format: 'json' | 'csv'
  recordCount: number
  userId?: string
}) {
  track('export', {
    format: eventData.format,
    record_count: eventData.recordCount,
    has_user: !!eventData.userId,
  })
}

/**
 * Track error
 */
export function trackError(eventData: {
  error: string
  context: string
  userId?: string
}) {
  track('error', {
    error_type: eventData.error,
    context: eventData.context,
    has_user: !!eventData.userId,
  })
}

/**
 * Track slow query
 */
export function trackSlowQuery(eventData: {
  query: string
  duration: number
  userId?: string
}) {
  track('slow_query', {
    query_type: eventData.query,
    duration: eventData.duration,
    has_user: !!eventData.userId,
  })
}
