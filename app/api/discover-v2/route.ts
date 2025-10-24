/**
 * XPShare Discovery API - Mastra Agent Network Implementation
 *
 * Replaces AI SDK 5.0's manual tool selection with Mastra's intelligent routing
 *
 * Architecture:
 * - Orchestrator Agent: LLM-based semantic routing (GPT-4o)
 * - 4 Specialist Agents: Query, Viz, Insight, Relationship
 * - Agent Network: Automatic tool selection via LLM (no keyword matching)
 *
 * Migration from AI SDK 5.0:
 * - REMOVED: 100+ lines of prepareStep keyword logic
 * - ADDED: Mastra RuntimeContext for RLS-safe Supabase injection
 * - PRESERVED: Rate limiting, memory, CORS, error handling, streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mastra } from '@/lib/mastra'
import { createXPShareContext } from '@/lib/mastra/context'
import { rateLimitDiscovery, getRateLimitHeaders } from '@/lib/rate-limit'
import { getCorsHeaders } from '@/lib/security/cors'
import type { UIMessage } from 'ai'

// Export runtime config for Vercel
export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes

/**
 * POST /api/discover
 *
 * Streaming chat API with Mastra Agent Network
 */
export async function POST(req: NextRequest): Promise<Response> {
  const startTime = Date.now()

  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('Origin')
      return new Response(null, {
        status: 200,
        headers: getCorsHeaders(origin),
      })
    }

    // Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Authentication required',
          message: 'Please sign in to use the discovery feature.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { messages, locale = 'en', threadId, threadMetadata } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Messages array is required.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Rate limiting
    const rateLimitResult = rateLimitDiscovery(user.id, true) // authenticated user

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${retryAfter} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...getRateLimitHeaders(rateLimitResult),
          },
        }
      )
    }

    // Create RuntimeContext for RLS-safe Supabase injection
    const runtimeContext = createXPShareContext(
      supabase,
      user.id,
      locale,
      undefined, // userTier - optional
      `req-${Date.now()}-${Math.random().toString(36).slice(2)}`
    )

    // Sanitize messages (convert UIMessage[] to Mastra format)
    console.log('[DEBUG] Raw messages received:', JSON.stringify(messages, null, 2))

    const sanitizedMessages = messages
      .map((msg: UIMessage) => {
        // Extract content from either .content or .parts array (AI SDK format)
        let content: string = ''

        if (typeof msg.content === 'string') {
          content = msg.content
        } else if (Array.isArray(msg.parts)) {
          // AI SDK uses .parts array with {type, text} objects
          content = msg.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('\n')
        } else if (msg.content) {
          content = JSON.stringify(msg.content)
        }

        return {
          role: msg.role,
          content,
        }
      })
      .filter((msg) => msg.content && msg.content.trim() !== '') // Filter out empty messages AFTER extraction

    console.log('[DEBUG] Sanitized messages:', JSON.stringify(sanitizedMessages, null, 2))
    console.log('[DEBUG] Sanitized messages count:', sanitizedMessages.length)

    // Execute Mastra Orchestrator with .stream() - NO format parameter needed!
    const agentStream = await mastra.getAgent('orchestrator').stream(sanitizedMessages, {
      runtimeContext, // ✅ RuntimeContext with Supabase RLS
      modelSettings: {
        temperature: 0.7,
      },
      // ❌ REMOVED: format: 'aisdk' - deprecated, use @mastra/ai-sdk instead
    })

    // ✅ FIX: Use AI SDK's createUIMessageStream + toAISdkFormat from @mastra/ai-sdk
    const { createUIMessageStream, createUIMessageStreamResponse } = await import('ai')
    const { toAISdkFormat } = await import('@mastra/ai-sdk')

    const uiMessageStream = createUIMessageStream({
      execute: async ({ writer }) => {
        for await (const part of toAISdkFormat(agentStream, { from: 'agent' })!) {
          writer.write(part)
        }
      },
    })

    // Create AI SDK compatible streaming response
    const response = createUIMessageStreamResponse({
      stream: uiMessageStream,
      headers: {
        ...getRateLimitHeaders(rateLimitResult),
        ...getCorsHeaders(req.headers.get('Origin')),
      },
    })

    // Log performance
    const duration = Date.now() - startTime
    console.log(`[Discovery API] Request started in ${duration}ms`, {
      userId: user.id,
      messageCount: messages.length,
      locale,
      threadId,
    })

    return response
  } catch (error) {
    console.error('[Discovery API] Request failed:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return new Response(
          JSON.stringify({
            error: 'Request timeout',
            message: 'The request took too long. Please try a simpler query.',
          }),
          {
            status: 504,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return new Response(
          JSON.stringify({
            error: 'Authentication required',
            message: 'Please sign in to use the discovery feature.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Generic error response
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Build system message with user memory and personalization
 */
function buildSystemMessage(
  memory: {
    preferences?: Record<string, unknown>
    tier?: 'free' | 'pro' | 'enterprise'
  },
  locale: string
): string {
  let systemMessage = `You are XPShare AI, an intelligent assistant for exploring extraordinary experiences.

## Your Capabilities

The Agent Network will automatically route your request to the appropriate specialist:

**Query Agent**: For searching and filtering experiences
- Advanced search with complex filters
- Semantic search for similar experiences
- Full-text search in descriptions
- Geographic location search
- Attribute-based filtering

**Viz Agent**: For temporal analysis and trends
- Timeline visualizations
- Temporal pattern analysis
- Aggregations by time period

**Insight Agent**: For generating insights and predictions
- Insight generation from data
- Pattern detection
- Trend prediction
- Follow-up question suggestions
- Data export

**Relationship Agent**: For connections and comparisons
- Find connections between experiences
- Compare categories
- Analyze correlations
- Rank users by contribution

## Categories
- ufo-uap: UFO/UAP sightings
- dreams: Dream experiences
- nde-obe: Near-Death/Out-of-Body experiences
- paranormal-anomalies: Paranormal/Ghost encounters
- synchronicity: Meaningful coincidences
- psychedelics: Psychedelic experiences
- altered-states: Meditation, trance, etc.

## Guidelines
- Be precise and data-driven
- Provide specific insights with numbers
- Suggest visualizations when appropriate
- Always respect user privacy and RLS
- Format responses clearly with markdown`

  // Add memory/personalization if available
  if (memory.preferences) {
    systemMessage += `\n\n## User Preferences\n${JSON.stringify(memory.preferences, null, 2)}`
  }

  if (memory.tier && memory.tier !== 'free') {
    systemMessage += `\n\n## User Tier: ${memory.tier.toUpperCase()}\n- Enhanced features enabled`
  }

  // Add locale context
  if (locale !== 'en') {
    systemMessage += `\n\n## Language: ${locale}\n- Respond in user's language when appropriate`
  }

  return systemMessage
}
