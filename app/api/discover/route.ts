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
import {
  getUserMemories,
  buildSystemPromptWithMemory,
} from '@/lib/memory/memory-manager'
import {
  extractPreferencesFromMessage,
  quickExtractExplicitPreferences,
} from '@/lib/memory/preference-extractor'

// Import tool factories (for request-scoped Supabase client)
import {
  // Search Tool Factories
  createAdvancedSearchTool,
  createSearchByAttributesTool,
  createSemanticSearchTool,
  createFullTextSearchTool,
  createGeoSearchTool,
  // Analytics Tool Factories
  createRankUsersTool,
  createAnalyzeCategoryTool,
  createCompareCategoryTool,
  createTemporalAnalysisTool,
  createAttributeCorrelationTool,
  // Relationship Tool Factories
  createFindConnectionsTool,
  // Insights Tool Factories
  createGenerateInsightsTool,
} from '@/lib/tools'

// Import tools that don't need Supabase (work with pre-fetched data)
import {
  detectPatternsTool,
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
- **Relationships**: Network analysis with multi-dimensional similarity, statistical pattern detection
- **Insights**: AI-powered insight generation with confidence scores, trend predictions, follow-up suggestions
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
   - Use **generateInsights** when user asks to "generate insights", "discover insights", "find insights"
   - Use **findConnections** when user asks about "connections", "relationships", "network", "similar experiences"
   - Use **detectPatterns** when user asks to "detect patterns", "find anomalies", "discover trends"
   - Use **analyzeCategory** for simple category summaries (counts, locations, dates)
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
    const { messages, chatId, replyToId, threadId, branchId } = body

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

    // Load user memories for personalization
    let systemPrompt = DISCOVERY_SYSTEM_PROMPT
    if (user) {
      const memories = await getUserMemories(user.id)
      if (memories.length > 0) {
        systemPrompt = buildSystemPromptWithMemory(DISCOVERY_SYSTEM_PROMPT, memories)
        console.log(`[Memory] Loaded ${memories.length} memories for user ${user.id}`)
      }

      // Quick extract explicit preferences from latest user message
      const latestUserMessage = sanitizedMessages
        .filter((m: any) => m.role === 'user')
        .pop()
      if (latestUserMessage && typeof latestUserMessage.content === 'string') {
        await quickExtractExplicitPreferences(latestUserMessage.content, user.id).catch((err) =>
          console.error('[Memory] Quick extraction failed:', err)
        )
      }
    }

    // Track citations across all tool calls
    const allCitations: any[] = []

    // Convert SanitizedMessage[] to UIMessage[] format (AI SDK 5.0)
    const uiMessages = sanitizedMessages.map((msg, index) => ({
      id: `msg-${index}`,
      role: msg.role,
      parts: [{ type: 'text' as const, text: msg.content }],
    }))

    // Create tools with request-scoped Supabase client (RLS fix)
    // This ensures all tool queries run with the authenticated user's context
    const tools = {
      // Search Tools
      advancedSearch: createAdvancedSearchTool(supabase),
      searchByAttributes: createSearchByAttributesTool(supabase),
      semanticSearch: createSemanticSearchTool(supabase),
      fullTextSearch: createFullTextSearchTool(supabase),
      geoSearch: createGeoSearchTool(supabase),

      // Analytics Tools
      rankUsers: createRankUsersTool(supabase),
      analyzeCategory: createAnalyzeCategoryTool(supabase),
      compareCategory: createCompareCategoryTool(supabase),
      temporalAnalysis: createTemporalAnalysisTool(supabase),
      attributeCorrelation: createAttributeCorrelationTool(supabase),

      // Relationship Tools
      findConnections: createFindConnectionsTool(supabase),
      detectPatterns: detectPatternsTool,

      // Insights & Advanced Features Tools
      generateInsights: createGenerateInsightsTool(supabase),
      predictTrends: predictTrendsTool,
      suggestFollowups: suggestFollowupsTool,
      exportResults: exportResultsTool,
    }

    // Stream text with all tools (use sanitized messages + personalized system prompt)
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(uiMessages),
      system: systemPrompt,
      tools,
      toolChoice: 'auto', // Let model decide when to use tools
      // Note: maxSteps removed in AI SDK 5.0 - tool calling loops automatically
      // Note: maxTokens removed in AI SDK 5.0 - use model-specific max_tokens in provider config
      temperature: 0.7,
      abortSignal: req.signal, // Handle client disconnections properly

      // Dynamic tool filtering based on user query (solves AI tool selection issue)
      prepareStep: ({ steps }) => {
        const lastMessage = sanitizedMessages[sanitizedMessages.length - 1]?.content || ''
        const query = typeof lastMessage === 'string' ? lastMessage.toLowerCase() : ''

        console.log(`[prepareStep] Step ${steps.length}: Query="${query}"`)

        // Pattern: "generate insights", "discover insights", "find insights"
        if (query.includes('generate insight') || query.includes('discover insight') || query.includes('find insight')) {
          console.log('[prepareStep] Matched "insights" pattern')
          return {
            toolChoice: 'required',
            system: systemPrompt + '\n\nIMPORTANT: User asked for insights. Use generateInsights tool with category parameter (e.g., category="dreams"). The tool will fetch data automatically and perform advanced pattern detection with confidence scores.',
          }
        }

        // Pattern: "find connections", "relationships", "network", "similar to"
        if (query.includes('connection') || query.includes('relationship') || query.includes('network') || (query.includes('similar') && query.includes('experience'))) {
          console.log('[prepareStep] Matched "connections" pattern')
          return {
            toolChoice: 'required',
            system: systemPrompt + '\n\nIMPORTANT: Use findConnections for network analysis.',
          }
        }

        // Pattern: "detect patterns", "find anomalies", "discover trends", "identify clusters"
        if (query.includes('detect pattern') || query.includes('find anomal') || query.includes('discover trend') || query.includes('identify cluster')) {
          console.log('[prepareStep] Matched "detect patterns" pattern')
          return {
            toolChoice: 'required',
            system: systemPrompt + '\n\nIMPORTANT: Use detectPatterns for statistical pattern detection.',
          }
        }

        // Pattern: Search + Visualization (timeline, map, etc.) - MULTILINGUAL
        if ((query.includes('show') || query.includes('zeig') || query.includes('find') || query.includes('finde') || query.includes('search') || query.includes('suche')) &&
            (query.includes('timeline') || query.includes('zeitverlauf') || query.includes('zeitstrahl') ||
             query.includes('visualization') || query.includes('visualize') || query.includes('visualisier') ||
             query.includes('map') || query.includes('karte') ||
             query.includes('over time') || query.includes('über die zeit') || query.includes('im laufe der zeit') || query.includes('zeitlich') ||
             query.includes('by location') || query.includes('nach ort') || query.includes('nach standort') || query.includes('geografisch') ||
             query.includes('geographic'))) {
          console.log('[prepareStep] Matched "search + visualization" pattern')
          return {
            activeTools: ['temporalAnalysis', 'geoSearch'],
            system: systemPrompt + '\n\nIMPORTANT: User wants temporal/geographic visualization. Use temporalAnalysis for "over time" queries (aggregates by period automatically) or geoSearch for location-based queries. DO NOT use advancedSearch - these tools fetch and visualize data in one step.',
          }
        }

        // Pattern: Attribute-based search (shaped, type of, color, etc.) - MULTILINGUAL
        if (query.includes('shaped') || query.includes('-shaped') || query.includes('förmig') || query.includes('-förmig') ||
            query.includes('type of') || query.includes('art von') ||
            query.includes(' color') || query.includes('farbe') || query.includes('lucid') || query.includes('luzid') || query.includes('orb')) {
          console.log('[prepareStep] Matched "attribute search" pattern')
          return {
            activeTools: ['searchByAttributes', 'advancedSearch'],
            system: systemPrompt + '\n\nIMPORTANT: User is asking about SPECIFIC ATTRIBUTE VALUES. You MUST use searchByAttributes tool. Extract the attribute key and value from the query. Examples: "triangle-shaped UFO" → key="shape", value="triangle", category="ufo-uap". "orb light" → key="shape", value="orb". "lucid dream" → key="dream_type", value="lucid", category="dreams".',
          }
        }

        // Pattern: Simple search (show, find, search without visualization keywords) - MULTILINGUAL
        if (query.includes('show') || query.includes('zeig') || query.includes('find') || query.includes('finde') || query.includes('search') || query.includes('suche')) {
          console.log('[prepareStep] Matched "simple search" pattern, enabling Search tools')
          return {
            activeTools: ['advancedSearch', 'searchByAttributes', 'geoSearch'],
            system: `YOU ARE A SEARCH AGENT. YOU MUST USE TOOLS TO SEARCH THE DATABASE.

CRITICAL INSTRUCTIONS:
1. You MUST call the advancedSearch tool to search for experiences in the database
2. DO NOT respond with text - ONLY use tools
3. The user query is: "${query}"
4. Call advancedSearch with appropriate filters based on the query
5. After getting results, present them to the user

NEVER say "No results found" without calling the search tool first!

Available tools:
- advancedSearch: Multi-dimensional search with category, time_of_day, location, date filters
- searchByAttributes: Search by specific attributes
- geoSearch: Geographic search

START BY CALLING advancedSearch NOW!`,
          }
        }

        // Default: All tools available
        console.log('[prepareStep] No pattern matched, all 16 tools available')
        return {}
      },

      // Track citations from tool results & extract preferences
      onFinish: async ({ response, text }) => {
        try {
          // 1. Extract citations from all tool calls (AI SDK 5.0: use response.messages)
          const toolResults = response.messages
            .flatMap((msg: any) => msg.content || [])
            .filter((part: any) => part.type === 'tool-result')

          for (const toolResult of toolResults) {
            if (toolResult.result) {
              const citations = extractCitationsFromToolResult({
                toolName: toolResult.toolName,
                result: toolResult.result,
              })
              allCitations.push(...citations)
            }
          }

          // TEMPORARILY DISABLED: Citations feature (Bug #8 - schema migration issue)
          // TODO: Re-enable after fixing PostgreSQL function
          /*
          if (allCitations.length > 0 && body.messageId) {
            try {
              const indexedCitations = assignCitationIndices(allCitations)
              await saveCitations(body.messageId, indexedCitations)
              console.log(`[Citations] Saved ${indexedCitations.length} citations for message ${body.messageId}`)
            } catch (citationError) {
              console.error('[Citations] Failed to save citations (non-critical):', citationError)
            }
          }
          */

          // 2. Extract preferences from conversation (if user is authenticated)
          if (user) {
            const latestUserMessage = sanitizedMessages
              .filter((m: any) => m.role === 'user')
              .pop()

            if (latestUserMessage && typeof latestUserMessage.content === 'string') {
              // Run preference extraction in background (don't await)
              extractPreferencesFromMessage(
                latestUserMessage.content,
                text || '',
                user.id
              ).catch((err) => console.error('[Memory] Preference extraction failed:', err))
            }
          }
        } catch (error) {
          console.error('[Citations/Memory] Failed to save citations or extract preferences:', error)
          // Don't throw - these are non-critical features
        }
      },

      // Error handling
      onError: (error) => {
        console.error('[Discovery API] Error:', error)
        // Note: onError callback should not return a value in AI SDK 5.0
      },
    })

    // Log query performance
    const duration = performance.now() - startTime
    logQueryPerformance({
      query: 'discover_chat',
      duration,
      success: true,
      userId: user?.id,
    })

    // Error message handler for AI SDK 5.0 (prevents masking errors)
    function getErrorMessage(error: unknown): string {
      if (error == null) {
        return 'Unknown error occurred'
      }
      if (typeof error === 'string') {
        return error
      }
      if (error instanceof Error) {
        return error.message
      }
      return JSON.stringify(error)
    }

    // Return stream response with smooth streaming, metadata, and rate limit headers
    const response = result.toUIMessageStreamResponse({
      // Note: AI SDK 5.0 uses messageMetadata function instead of experimental_metadata
      // Metadata is now extracted from the stream parts rather than passed directly
      // The threading metadata (replyToId, threadId, branchId, chatId) should be handled
      // in the client-side useChat hook or stored separately in the database
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
