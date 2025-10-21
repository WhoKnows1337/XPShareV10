import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, smoothStream } from 'ai'
import { createClient } from '@/lib/supabase/server'

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
  try {
    // Parse request
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 })
    }

    // Get Supabase client (for RLS context in tools)
    const supabase = await createClient()

    // Check authentication (optional - depends on whether discovery is public)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Stream text with all tools
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToModelMessages(messages),
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

      // Error handling
      onError: (error) => {
        console.error('[Discovery API] Error:', error)
        return 'I encountered an error processing your request. Please try again or rephrase your query.'
      },

      // Timeout handling (2 minutes)
      abortSignal: AbortSignal.timeout(120000),
    })

    // Return stream response with smooth streaming
    return result.toUIMessageStreamResponse({
      transform: smoothStream({ chunking: 'word' }),
    })
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
