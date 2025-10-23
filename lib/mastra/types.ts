/**
 * XPShare Mastra - TypeScript Types
 *
 * Shared types for Mastra AI implementation
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * RuntimeContext type for XPShare
 * Used to inject request-scoped dependencies into tools and agents
 */
export interface XPShareContext {
  /** Request-scoped Supabase client with RLS */
  supabase: SupabaseClient

  /** Authenticated user ID */
  userId: string

  /** User locale for i18n */
  locale: string

  /** Optional: User tier for conditional features */
  userTier?: 'free' | 'pro' | 'enterprise'

  /** Optional: Request metadata */
  requestId?: string
}

/**
 * Tool execution context
 * Extends base context with tool-specific metadata
 */
export interface ToolExecutionContext extends XPShareContext {
  /** Tool execution start time */
  startTime: number

  /** Tool name */
  toolName: string
}

/**
 * Agent metadata
 */
export interface AgentMetadata {
  /** Agent name */
  name: string

  /** Agent role/specialization */
  role: 'orchestrator' | 'query' | 'viz' | 'insight' | 'relationship'

  /** Model used */
  model: string

  /** Number of tools available */
  toolCount: number
}
