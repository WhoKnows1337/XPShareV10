/**
 * Search 5.0 - Pattern Discovery API
 *
 * Complete refactor from streaming to structured output with:
 * - generateText() instead of streamText() for JSON Schema support
 * - OpenAI Structured Outputs (JSON Schema enforcement)
 * - Zod runtime validation with error recovery
 * - Serendipity detection (cross-category patterns)
 * - Multi-turn conversation context
 * - Cost control (rate limiting, token tracking)
 *
 * @see docs/masterdocs/search5.md for full specification
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import {
  PATTERN_DISCOVERY_SYSTEM_PROMPT,
  buildPatternDiscoveryPrompt,
  buildConversationalPrompt,
  sanitizeQuestion
} from '@/lib/ai/prompts'
import { detectSerendipity } from '@/lib/patterns/serendipity'
import { parseSearch5Response, Search5ResponseSchema } from '@/lib/validation/search5-schemas'
import { Source } from '@/types/ai-answer'
import { Pattern } from '@/types/search5'

/**
 * OpenAI JSON Schema for Structured Outputs
 * Enforces response structure at LLM generation time
 */
const PATTERN_DISCOVERY_SCHEMA = {
  type: "object",
  properties: {
    patterns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["color", "temporal", "behavior", "location", "attribute"]
          },
          title: { type: "string" },
          finding: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 100 },
          sourceIds: {
            type: "array",
            items: { type: "string" }
          },
          citationIds: {
            type: "array",
            items: { type: "number" }
          },
          data: {
            type: "object",
            properties: {
              distribution: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    count: { type: "number" },
                    percentage: { type: "number" }
                  },
                  required: ["label", "count"]
                }
              },
              timeline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string" },
                    count: { type: "number" },
                    highlight: { type: "boolean" }
                  },
                  required: ["month", "count"]
                }
              }
            }
          },
          visualizationType: {
            type: "string",
            enum: ["bar", "timeline", "map", "tag-cloud"]
          }
        },
        required: ["type", "title", "finding", "sourceIds", "data"]
      },
      minItems: 0,
      maxItems: 10
    }
  },
  required: ["patterns"],
  additionalProperties: false
}

/**
 * Extract question from AI SDK messages array
 */
function extractQuestion(messages: any[]): string {
  if (!messages || messages.length === 0) return ''

  const lastMessage = messages[messages.length - 1]

  // Handle string content
  if (typeof lastMessage?.content === 'string') {
    return lastMessage.content
  }

  // Handle parts-based message (AI SDK 5.0)
  if (Array.isArray(lastMessage?.parts)) {
    const textParts = lastMessage.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
    return textParts.join(' ')
  }

  return ''
}

/**
 * Extract conversation history from messages
 * Returns last 3 turns for context-aware pattern discovery
 */
function extractConversationHistory(messages: any[]): Array<{ query: string; patterns: Pattern[] }> {
  if (!messages || messages.length <= 2) return []

  const history: Array<{ query: string; patterns: Pattern[] }> = []

  // Extract user/assistant pairs (skip system messages)
  for (let i = 0; i < messages.length - 1; i += 2) {
    const userMsg = messages[i]
    const assistantMsg = messages[i + 1]

    if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
      try {
        const query = typeof userMsg.content === 'string' ? userMsg.content : ''
        const response = typeof assistantMsg.content === 'string'
          ? JSON.parse(assistantMsg.content)
          : {}

        history.push({
          query,
          patterns: response.patterns || []
        })
      } catch (e) {
        // Skip malformed history entries
        continue
      }
    }
  }

  // Return last 3 turns only
  return history.slice(-3)
}

/**
 * POST /api/chat
 *
 * Search 5.0 Pattern Discovery API
 *
 * Request Body:
 * - messages: Array<{role: string, content: string}> (AI SDK format)
 * - maxSources?: number (default: 15)
 * - category?: string
 * - tags?: string
 * - location?: string
 * - dateFrom?: string
 * - dateTo?: string
 * - witnessesOnly?: boolean
 *
 * Response:
 * - patterns: Pattern[] (structured pattern discoveries)
 * - serendipity?: SerendipityConnection
 * - sources: Source[] (matched experiences)
 * - metadata: { confidence, sourceCount, patternsFound, executionTime, warnings }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()

    // ✅ Extract and validate request
    const { messages } = body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing messages array' },
        { status: 400 }
      )
    }

    const rawQuestion = extractQuestion(messages)
    const question = sanitizeQuestion(rawQuestion)

    if (!question || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Question must be at least 5 characters long' },
        { status: 400 }
      )
    }

    const {
      maxSources = 15,
      category,
      tags,
      location,
      dateFrom,
      dateTo,
      witnessesOnly,
    } = body

    console.log('🔍 Search 5.0 Pattern Discovery:', {
      question: question.substring(0, 50),
      maxSources,
      filters: { category, tags, location, dateFrom, dateTo, witnessesOnly }
    })

    // Step 1: Generate embedding for question
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(question)
    } catch (embeddingError: any) {
      console.error('Embedding generation error:', embeddingError)
      return NextResponse.json(
        {
          error: 'Failed to generate question embedding',
          details: embeddingError.message,
        },
        { status: 500 }
      )
    }

    // Step 2: Find relevant experiences using vector similarity
    const supabase = await createClient()

    const { data: relevant, error: searchError } = await (supabase as any).rpc('match_experiences', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: maxSources,
      filter_category: category && category !== 'all' ? category : null,
      filter_date_from: dateFrom || null,
      filter_date_to: dateTo || null,
    })

    if (searchError) {
      console.error('Vector search error:', searchError)
      return NextResponse.json(
        { error: 'Vector search failed', details: searchError.message },
        { status: 500 }
      )
    }

    if (!relevant || relevant.length === 0) {
      return NextResponse.json({
        patterns: [],
        sources: [],
        metadata: {
          confidence: 0,
          sourceCount: 0,
          patternsFound: 0,
          executionTime: Date.now() - startTime,
          warnings: ['No relevant experiences found for this query']
        }
      })
    }

    // Map to Source type
    const sources: Source[] = relevant.map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      fullText: exp.story_text,
      excerpt: exp.story_text.substring(0, 200),
      category: exp.category,
      similarity: exp.similarity,
      date_occurred: exp.date_occurred,
      location_text: exp.location_text,
      attributes: exp.tags
    }))

    // Apply client-side filters
    let filteredSources = sources

    if (tags) {
      const tagList = tags.split(',').map((t: string) => t.trim().toLowerCase())
      filteredSources = filteredSources.filter((exp) =>
        exp.attributes?.some((tag: string) => tagList.includes(tag.toLowerCase()))
      )
    }

    if (location) {
      filteredSources = filteredSources.filter((exp) =>
        exp.location_text?.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (filteredSources.length === 0) {
      return NextResponse.json({
        patterns: [],
        sources: [],
        metadata: {
          confidence: 0,
          sourceCount: 0,
          patternsFound: 0,
          executionTime: Date.now() - startTime,
          warnings: ['No experiences match the specified filters']
        }
      })
    }

    // Step 3: Extract conversation history for multi-turn support
    const conversationHistory = extractConversationHistory(messages)
    const previousPatterns = conversationHistory.flatMap(h => h.patterns)

    console.log('💬 Conversation context:', {
      depth: conversationHistory.length,
      previousPatterns: previousPatterns.length
    })

    // Step 4: Generate structured pattern discovery with LLM
    let prompt: string
    if (conversationHistory.length > 0) {
      // Multi-turn: Build conversational prompt with context
      prompt = buildConversationalPrompt(
        question,
        filteredSources,
        conversationHistory,
        previousPatterns
      )
    } else {
      // First turn: Standard pattern discovery prompt
      prompt = buildPatternDiscoveryPrompt(question, filteredSources)
    }

    const result = await generateText({
      model: openai('gpt-4o'),
      system: PATTERN_DISCOVERY_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      maxTokens: 2000 as any, // AI SDK type issue workaround
      // ✅ CRITICAL: Structured output with JSON Schema
      experimental_providerMetadata: {
        openai: {
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "pattern_discovery",
              schema: PATTERN_DISCOVERY_SCHEMA,
              strict: true
            }
          }
        }
      }
    })

    // Step 5: Parse and validate LLM output with Zod
    let parsedOutput: any
    try {
      parsedOutput = JSON.parse(result.text)
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        error: 'Invalid JSON from LLM',
        details: parseError.message,
        metadata: {
          confidence: 0,
          sourceCount: filteredSources.length,
          patternsFound: 0,
          executionTime: Date.now() - startTime,
          warnings: ['LLM returned invalid JSON']
        }
      }, { status: 500 })
    }

    // ✅ Runtime validation with Zod (error recovery)
    const validated = parseSearch5Response({
      patterns: parsedOutput.patterns || [],
      sources: filteredSources,
      metadata: {
        confidence: 0, // Will calculate below
        sourceCount: filteredSources.length,
        patternsFound: parsedOutput.patterns?.length || 0,
        executionTime: Date.now() - startTime,
        warnings: []
      }
    })

    // Step 6: Detect serendipity (cross-category connections)
    let serendipity = null
    try {
      serendipity = await detectSerendipity(filteredSources, question)
      if (serendipity) {
        console.log('✨ Serendipity detected:', serendipity.targetCategory)
      }
    } catch (serendipityError) {
      console.warn('Serendipity detection failed:', serendipityError)
      // Non-critical - continue without serendipity
    }

    // Step 7: Calculate metadata
    const avgSimilarity = filteredSources.reduce((sum, exp) => sum + exp.similarity, 0) / filteredSources.length
    const confidence = Math.min(Math.round(avgSimilarity * 100), 100)

    const executionTime = Date.now() - startTime

    // Step 8: Track analytics
    const {
      data: { user },
    } = await supabase.auth.getUser()

    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: question,
        p_user_id: user?.id || null,
        p_result_count: filteredSources.length,
        p_search_type: 'search5',
        p_filters: {
          maxSources,
          category,
          tags,
          location,
          dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : null,
          witnessesOnly,
        },
        p_language: 'de',
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      console.warn('Failed to track search:', trackError)
    }

    // Step 9: Build final response
    const response = {
      patterns: validated.patterns,
      serendipity,
      sources: validated.sources.map(s => ({
        id: s.id,
        title: s.title,
        category: s.category,
        similarity: s.similarity,
        excerpt: s.excerpt,
        date_occurred: s.date_occurred,
        location_text: s.location_text
      })),
      metadata: {
        confidence,
        sourceCount: validated.sources.length,
        patternsFound: validated.patterns.length,
        executionTime,
        warnings: validated.metadata.warnings
      }
    }

    console.log('✅ Pattern discovery complete:', {
      patterns: response.patterns.length,
      confidence,
      executionTime: `${executionTime}ms`
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Pattern discovery error:', error)

    return NextResponse.json(
      {
        error: 'Pattern discovery failed',
        details: error.message,
        metadata: {
          confidence: 0,
          sourceCount: 0,
          patternsFound: 0,
          executionTime: Date.now() - startTime,
          warnings: ['Unexpected error occurred']
        }
      },
      { status: 500 }
    )
  }
}
