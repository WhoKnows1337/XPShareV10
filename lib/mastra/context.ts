/**
 * XPShare Mastra - Runtime Context
 *
 * Creates request-scoped context for RLS-compliant tool execution
 */

import { RuntimeContext } from '@mastra/core/runtime-context'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { XPShareContext } from './types'

/**
 * Creates a RuntimeContext with XPShare-specific configuration
 *
 * This context is created per-request in the API route and provides:
 * - Request-scoped Supabase client (for RLS)
 * - Authenticated user ID
 * - Locale for i18n
 * - Optional user tier for conditional features
 *
 * @param supabase - Request-scoped Supabase client from createClient()
 * @param userId - Authenticated user ID
 * @param locale - User locale (default: 'en')
 * @param userTier - Optional user tier for conditional features
 * @param requestId - Optional request ID for tracing
 *
 * @example
 * ```typescript
 * // In API route:
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 *
 * const context = createXPShareContext(supabase, user.id, 'en')
 *
 * // Use with agent:
 * const stream = await mastra.agents.orchestrator.stream({
 *   messages,
 *   context
 * })
 * ```
 */
export function createXPShareContext(
  supabase: SupabaseClient,
  userId: string,
  locale: string = 'en',
  userTier?: 'free' | 'pro' | 'enterprise',
  requestId?: string
): RuntimeContext<XPShareContext> {
  const context = new RuntimeContext<XPShareContext>()

  // Set values using .set() method as per Mastra docs
  context.set('supabase', supabase)
  context.set('userId', userId)
  context.set('locale', locale)

  if (userTier) {
    context.set('userTier', userTier)
  }

  if (requestId) {
    context.set('requestId', requestId)
  }

  return context
}

/**
 * Helper to extract Supabase client from context in tools
 *
 * @example
 * ```typescript
 * export const myTool = createTool({
 *   execute: async ({ context, data }) => {
 *     const supabase = getSupabaseFromContext(context)
 *     const { data: results } = await supabase.from('experiences')...
 *   }
 * })
 * ```
 */
export function getSupabaseFromContext(
  context: RuntimeContext<XPShareContext>
): SupabaseClient {
  const supabase = context.get('supabase')
  if (!supabase) {
    throw new Error('Supabase client not found in RuntimeContext')
  }
  return supabase
}

/**
 * Helper to extract user ID from context
 */
export function getUserIdFromContext(
  context: RuntimeContext<XPShareContext>
): string {
  const userId = context.get('userId')
  if (!userId) {
    throw new Error('User ID not found in RuntimeContext')
  }
  return userId
}

/**
 * Helper to extract locale from context
 */
export function getLocaleFromContext(
  context: RuntimeContext<XPShareContext>
): string {
  return context.get('locale') || 'en'
}
