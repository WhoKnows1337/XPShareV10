/**
 * Search 5.0 - Pattern Discovery API
 *
 * AI SDK 5.0 structured outputs with:
 * - generateObject() with native Zod schema validation
 * - Automatic type safety and runtime validation
 * - Serendipity detection (cross-category patterns)
 * - Multi-turn conversation context
 * - Cost control (rate limiting, token tracking)
 *
 * @see docs/masterdocs/search5.md for full specification
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { openai, gpt4o } from '@/lib/openai/ai-sdk-client'
// TODO: Re-enable when @/lib/ai/prompts is created
// import {
//   PATTERN_DISCOVERY_SYSTEM_PROMPT,
//   buildPatternDiscoveryPrompt,
//   buildConversationalPrompt,
//   sanitizeQuestion
// } from '@/lib/ai/prompts'
import { detectSerendipity } from '@/lib/patterns/serendipity'
import { PatternDiscoveryOutputSchema } from '@/lib/validation/search5-schemas'
import { patternDiscoveryCircuitBreaker } from '@/lib/patterns/error-recovery'
import { trackRateLimit } from '@/lib/analytics/search5-tracking'
import { extractKeywords, keywordsToTags } from '@/lib/search/keyword-extraction'
import { Source } from '@/types/ai-answer'
import { Pattern } from '@/types/search5'

// ============================================================================
// TODO: Move these to @/lib/ai/prompts when created
// ============================================================================

/** Sanitize user question (remove harmful content, normalize) */
function sanitizeQuestion(question: string): string {
  if (!question) return ''
  // Basic sanitization: trim, normalize whitespace
  return question.trim().replace(/\s+/g, ' ')
}

/** Build conversational prompt with context */
function buildConversationalPrompt(question: string, sources: Source[], context: any[], previousPatterns?: any[]): string {
  const sourcesText = sources.map(s => `[${s.id}] ${s.title}: ${s.excerpt}`).join('\n\n')
  const contextText = context.map((c: any) => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n')

  return `Based on the following sources and conversation history, answer the user's question.

SOURCES:
${sourcesText}

PREVIOUS CONTEXT:
${contextText}

QUESTION: ${question}

Provide a detailed answer with citations [ID].`
}

/** Build pattern discovery prompt */
function buildPatternDiscoveryPrompt(question: string, sources: Source[]): string {
  const sourcesText = sources.map(s => `[${s.id}] ${s.title} (${s.category}): ${s.excerpt}`).join('\n\n')

  return `Analyze the following experiences and discover patterns, correlations, and insights.

SOURCES:
${sourcesText}

QUESTION: ${question}

Identify temporal patterns, geographic clusters, category relationships, and cross-category connections.`
}

/** System prompt for pattern discovery */
const PATTERN_DISCOVERY_SYSTEM_PROMPT = `You are an expert pattern analyst for extraordinary experiences.

Your role:
- Identify temporal patterns (time of day, seasonal, yearly trends)
- Discover geographic clusters and hotspots
- Find cross-category correlations and connections
- Detect serendipitous patterns (unexpected relationships)
- Provide statistical insights with confidence scores

Always cite sources with [ID] and explain your reasoning.`

// ============================================================================

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

  // Return full conversation history for unlimited exploration
  // Note: Very long conversations may hit token limits - monitor usage
  return history
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
    // ✅ P1 FEATURE: Rate Limiting (per-user/IP)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { patternDiscoveryLimiter, getIdentifier, calculateEstimatedTokens } = await import('@/lib/rate-limit/in-memory-limiter')
    const identifier = getIdentifier(req.headers, user?.id)
    
    const rateLimitResult = await patternDiscoveryLimiter.check(identifier)

    if (!rateLimitResult.success) {
      console.warn('🚫 Rate limit exceeded:', {
        identifier: user?.id ? `user:${user.id.substring(0, 8)}...` : identifier,
        limit: rateLimitResult.limit,
        reset: new Date(rateLimitResult.reset).toISOString()
      })

      // 📊 Analytics: Track rate limit hit
      trackRateLimit({
        identifier,
        limit: rateLimitResult.limit,
        endpoint: 'pattern_discovery',
        userId: user?.id,
        timestamp: new Date()
      }).catch(err => console.warn('Analytics tracking failed:', err))

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many pattern discovery requests. You can make ${rateLimitResult.limit} requests per minute. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
          metadata: {
            confidence: 0,
            sourceCount: 0,
            patternsFound: 0,
            executionTime: Date.now() - startTime,
            warnings: ['Rate limit exceeded']
          }
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    console.log('✅ Rate limit check passed:', {
      identifier: user?.id ? `user:${user.id.substring(0, 8)}...` : identifier,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit
    })

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

    // Extract keywords for structured filtering
    const keywords = extractKeywords(question)
    const searchTags = keywordsToTags(keywords)

    console.log('🔍 Search 5.0 Pattern Discovery:', {
      question: question.substring(0, 50),
      maxSources,
      filters: { category, tags, location, dateFrom, dateTo, witnessesOnly },
      extractedKeywords: keywords,
      searchTags
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

    // Step 2: Find relevant experiences using vector similarity + structured filters
    const { data: relevant, error: searchError } = await (supabase as any).rpc('match_experiences', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: maxSources,
      filter_category: category && category !== 'all' ? category : null,
      filter_date_from: dateFrom || null,
      filter_date_to: dateTo || null,
      filter_tags: searchTags.length > 0 ? searchTags : null,
      filter_keywords: keywords.length > 0 ? keywords : null,
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

    // Map to Source type and track exact matches
    const sources: Source[] = relevant.map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      fullText: exp.story_text,
      excerpt: exp.story_text.substring(0, 200),
      category: exp.category,
      similarity: exp.similarity,
      date_occurred: exp.date_occurred,
      location_text: exp.location_text,
      attributes: exp.tags,
      exactMatch: exp.exact_match || false
    }))

    // Count exact matches
    const exactMatchCount = sources.filter(s => s.exactMatch).length
    const hasPartialMatchesOnly = sources.length > 0 && exactMatchCount === 0

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

    // ⏱️ P0 FEATURE: Timeout Handling (20s max for Structured Outputs) + Circuit Breaker
    const TIMEOUT_MS = 20000 // Increased for OpenAI Structured Outputs Mode (strictJsonSchema)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Pattern discovery timeout (20s limit exceeded)')), TIMEOUT_MS)
    })

    const generationPromise = patternDiscoveryCircuitBreaker.execute(() =>
      generateObject({
        model: gpt4o,
        schema: PatternDiscoveryOutputSchema,
        schemaName: 'PatternDiscoveryOutput',
        schemaDescription: 'Structured pattern discovery output with 2-4 patterns and optional follow-up suggestions',
        system: PATTERN_DISCOVERY_SYSTEM_PROMPT,
        prompt: prompt,
        temperature: 0.3, // Lower temperature for more consistent JSON generation
        // @ts-expect-error - AI SDK 5.0 type issue with maxTokens
        maxTokens: 3000, // Increased to prevent truncation
        // Note: strictJsonSchema disabled - OpenAI Structured Outputs Mode doesn't support optional nested objects
        // Using regular JSON Schema with Zod validation instead
      })
    )

    let result
    try {
      result = await Promise.race([generationPromise, timeoutPromise])
    } catch (timeoutError: any) {
      console.error('⏱️ Pattern discovery error:', timeoutError)

      // Check if it's a circuit breaker error
      if (timeoutError.message?.includes('Circuit breaker')) {
        return NextResponse.json({
          error: 'Service temporarily unavailable',
          message: 'Pattern discovery is experiencing issues. Please try again in a few moments.',
          metadata: {
            confidence: 0,
            sourceCount: filteredSources.length,
            patternsFound: 0,
            executionTime: Date.now() - startTime,
            warnings: ['Circuit breaker open - too many recent failures']
          }
        }, { status: 503 })
      }

      // Regular timeout error
      return NextResponse.json({
        error: 'Search timeout',
        message: 'Pattern discovery took too long. Please try a simpler question or reduce the number of sources.',
        metadata: {
          confidence: 0,
          sourceCount: filteredSources.length,
          patternsFound: 0,
          executionTime: TIMEOUT_MS,
          warnings: ['Timeout after 20 seconds']
        }
      }, { status: 504 })
    }

    // ✅ P1 FEATURE: Token Usage Tracking
    const estimatedTokens = calculateEstimatedTokens(messages)
    console.log('💰 Token usage estimate:', {
      input: estimatedTokens,
      totalCost: `~$${(estimatedTokens * 0.00001).toFixed(4)}` // Rough estimate for gpt-4o
    })

    // Step 5: Extract patterns from generateObject() result
    // Result is already validated and typed thanks to Zod schema!
    const { summary, patterns, followUpSuggestions } = result.object

    console.log('✅ Pattern discovery complete:', {
      summary: summary?.substring(0, 100) + '...',
      patterns: patterns.length,
      followUpSuggestions: followUpSuggestions?.length || 0,
      executionTime: `${Date.now() - startTime}ms`
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
    const warnings: string[] = []

    // Add warning if only partial matches (no exact keyword/tag matches)
    if (hasPartialMatchesOnly && keywords.length > 0) {
      warnings.push(
        `Keine exakten Treffer für "${keywords.slice(0, 2).join(', ')}" gefunden. Zeige themenverwandte Erfahrungen.`
      )
    }

    const response = {
      summary,
      patterns,
      followUpSuggestions,
      serendipity,
      sources: filteredSources.map(s => ({
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
        sourceCount: filteredSources.length,
        patternsFound: patterns.length,
        executionTime,
        warnings,
        exactMatchCount,
        hasPartialMatchesOnly
      }
    }

    console.log('✅ Pattern discovery complete:', {
      patterns: response.patterns.length,
      followUpSuggestions: followUpSuggestions?.length || 0,
      confidence,
      executionTime: `${executionTime}ms`,
      remainingRequests: rateLimitResult.remaining
    })

    // Add rate limit headers to successful response
    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString()
      }
    })

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
