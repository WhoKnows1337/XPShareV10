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
    const rateLimitResult = await rateLimitDiscovery(user.id)

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil(rateLimitResult.retryAfter / 1000)} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
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
    const sanitizedMessages = messages.map((msg: UIMessage) => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    }))

    // Generate thread ID if not provided (for Agent Network memory)
    const chatThreadId = threadId || `chat-${user.id}-${Date.now()}`

    // Execute Mastra Agent Network
    // Orchestrator automatically routes to appropriate specialist agents
    // NO manual prepareStep logic needed - LLM handles routing semantically
    const networkStream = await mastra.getAgent('orchestrator').network(sanitizedMessages, {
      runtimeContext, // ✅ RuntimeContext with Supabase RLS
      maxSteps: 10, // Prevent infinite loops
      modelSettings: {
        temperature: 0.7,
      },
      // Memory configuration for Agent Network (REQUIRED)
      memory: {
        thread: {
          id: chatThreadId,
          metadata: {
            userId: user.id,
            locale,
            ...threadMetadata,
          },
        },
        resource: user.id, // User identifier for memory isolation
      },
    })

    // Stream network execution events
    // Network streams emit events like: routing-agent-start, agent-execution-start, etc.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of networkStream) {
            // Forward chunk to client as Server-Sent Events
            const data = JSON.stringify(chunk)
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))

            // Log important events
            if (chunk.type === 'network-execution-event-step-finish') {
              console.log('[Mastra Network] Step finished:', {
                userId: user.id,
                result: chunk.payload?.result,
              })
            }
          }

          // Stream final status and usage
          const [status, result, usage] = await Promise.all([
            networkStream.status,
            networkStream.result,
            networkStream.usage,
          ])

          console.log('[Mastra Network] Execution complete:', {
            userId: user.id,
            status,
            usage,
          })

          controller.close()
        } catch (error) {
          console.error('[Mastra Network] Stream error:', error)
          controller.error(error)
        }
      },
    })

    // Create response with headers
    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
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
      threadId: chatThreadId,
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
