import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, smoothStream } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimitDiscovery, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeMessages } from '@/lib/security/sanitize'
import { logQueryPerformance } from '@/lib/monitoring/query-logger'
import { getCorsHeaders, handleCorsPreflightRequest } from '@/lib/security/cors'
import {
  extractCitationsFromToolResult,
  assignCitationIndices,
  saveCitations,
} from '@/lib/citations/citation-tracker'

// Import all tools
import {
  // Search Tools
  advancedSearchTool,
  searchByAttributesTool,
  semanticSearchTool,
  fullTextSearchTool,
  geoSearchTool,
  // Analytics Tools
  rankUsersTool,
  analyzeCategoryTool,
  compareCategoryTool,
  temporalAnalysisTool,
  attributeCorrelationTool,
  // Relationship Tools
  findConnectionsTool,
  detectPatternsTool,
  // Insights & Advanced Features Tools
  generateInsightsTool,
  predictTrendsTool,
  suggestFollowupsTool,
  exportResultsTool,
} from '@/lib/tools'

export const maxDuration = 120 // 2 minute timeout
export const runtime = 'edge' // Use edge runtime for better performance

// Handle CORS preflight requests
export async function OPTIONS(req: Request) {
  return handleCorsPreflightRequest(req)
}

const DISCOVERY_SYSTEM_PROMPT = `You are XPShare Discovery Assistant, an AI specialized in analyzing anomalous experiences.

## Your Capabilities

You have access to powerful tools for:
- **Search**: Advanced filtering, semantic search, full-text search, geo search, attribute search
- **Analytics**: User rankings, category analysis, temporal patterns, correlations
- **Relationships**: Connection discovery, pattern detection
- **Insights**: Pattern detection with statistical analysis, trend predictions, follow-up suggestions
- **Export**: JSON and CSV downloads

## Categories

XPShare focuses on 7 main categories of experiences:
- UFO/UAP sightings
- Dreams & lucid dreams
- Near-Death Experiences (NDEs)
- Psychic phenomena
- Synchronicities
- Paranormal encounters
- Other anomalous experiences

## Guidelines

1. **Be Conversational**: Respond naturally and help users explore the data
2. **Use Tools Intelligently**: Select the most appropriate tool(s) for each query
3. **Provide Context**: Always mention result counts and key findings
4. **Suggest Next Steps**: After showing results, offer to detect patterns, predict trends, or visualize data
5. **Handle Errors Gracefully**: If a tool fails, explain clearly and suggest alternatives
6. **Respect Privacy**: Never expose user IDs or sensitive information

## Response Format

- Use markdown formatting for readability
- Include data counts (e.g., "Found 42 experiences...")
- Suggest visualizations when appropriate
- Offer insights and follow-ups proactively

Remember: You're here to help users discover insights in anomalous experiences data!`

export async function POST(req: Request) {
  const startTime = performance.now()

  try {
    // Parse request
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 })
    }

    // Input sanitization
    let sanitizedMessages
    try {
      sanitizedMessages = sanitizeMessages(messages)
    } catch (error) {
      console.error('[Discovery API] Sanitization failed:', error)
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          message: error instanceof Error ? error.message : 'Input validation failed',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Supabase client (for RLS context in tools)
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Rate limiting: Use user ID for authenticated, IP for anonymous
    const identifier = user?.id || req.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitResult = rateLimitDiscovery(identifier, !!user)

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset).toISOString(),
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

    // Track citations across all tool calls
    const allCitations: any[] = []

    // Stream text with all tools (use sanitized messages)
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToModelMessages(sanitizedMessages),
      system: DISCOVERY_SYSTEM_PROMPT,
      tools: {
        // Search Tools
        advancedSearch: advancedSearchTool,
        searchByAttributes: searchByAttributesTool,
        semanticSearch: semanticSearchTool,
        fullTextSearch: fullTextSearchTool,
        geoSearch: geoSearchTool,

        // Analytics Tools
        rankUsers: rankUsersTool,
        analyzeCategory: analyzeCategoryTool,
        compareCategory: compareCategoryTool,
        temporalAnalysis: temporalAnalysisTool,
        attributeCorrelation: attributeCorrelationTool,

        // Relationship Tools
        findConnections: findConnectionsTool,
        detectPatterns: detectPatternsTool,

        // Insights & Advanced Features Tools
        generateInsights: generateInsightsTool,
        predictTrends: predictTrendsTool,
        suggestFollowups: suggestFollowupsTool,
        exportResults: exportResultsTool,
      },
      maxSteps: 10, // Allow multiple tool calls
      temperature: 0.7,
      maxTokens: 4000,

      // Track citations from tool results
      onFinish: async ({ response }) => {
        try {
          // Extract citations from all tool calls
          const toolResults = response.toolCalls || []

          for (const toolCall of toolResults) {
            if (toolCall.result) {
              const citations = extractCitationsFromToolResult({
                toolName: toolCall.toolName,
                result: toolCall.result,
              })
              allCitations.push(...citations)
            }
          }

          // If we have citations, save them
          if (allCitations.length > 0 && body.messageId) {
            const indexedCitations = assignCitationIndices(allCitations)
            await saveCitations(body.messageId, indexedCitations)
            console.log(`[Citations] Saved ${indexedCitations.length} citations for message ${body.messageId}`)
          }
        } catch (error) {
          console.error('[Citations] Failed to save citations:', error)
          // Don't throw - citations are non-critical feature
        }
      },

      // Error handling
      onError: (error) => {
        console.error('[Discovery API] Error:', error)
        return 'I encountered an error processing your request. Please try again or rephrase your query.'
      },

      // Timeout handling (2 minutes)
      abortSignal: AbortSignal.timeout(120000),
    })

    // Log query performance
    const duration = performance.now() - startTime
    logQueryPerformance({
      query: 'discover_chat',
      duration,
      success: true,
      userId: user?.id,
    })

    // Return stream response with smooth streaming and rate limit headers
    const response = result.toUIMessageStreamResponse({
      transform: smoothStream({ chunking: 'word' }),
    })

    // Add rate limit headers to streaming response
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Add CORS headers
    const origin = req.headers.get('Origin')
    Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value)
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
