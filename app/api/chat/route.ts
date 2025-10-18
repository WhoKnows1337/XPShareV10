import { NextRequest } from 'next/server'
import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { RAG_SYSTEM_PROMPT, buildContextFromExperiences, buildUserMessage, sanitizeQuestion } from '@/lib/ai/prompts'
import { Source } from '@/types/ai-answer'

/**
 * RAG Q&A System API with AI SDK 5.0 Streaming
 *
 * Follows Vercel AI SDK v5 Best Practices:
 * - Uses messages array format (sent by sendMessage())
 * - Progressive streaming with streamText()
 * - Time to First Token: 0.5-1.5s
 * - Cost: ~$0.01375/request
 *
 * POST /api/ask
 * Body: {
 *   messages: Array<{role: string, content: string}>,  // AI SDK format
 *   maxSources?: number (default: 15),
 *   category?: string,
 *   tags?: string,
 *   location?: string,
 *   dateFrom?: string,
 *   dateTo?: string,
 *   witnessesOnly?: boolean
 * }
 *
 * Returns: Server-Sent Events (SSE) stream with metadata headers
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()

    // ✅ AI SDK 5.0 sendMessage() sends messages array
    const { messages } = body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing messages array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract question from last user message
    // AI SDK 5.0 format: messages can have either 'content' (string) or 'parts' (array)
    const lastMessage = messages[messages.length - 1]
    let rawQuestion = ''

    if (typeof lastMessage?.content === 'string') {
      // Simple string content
      rawQuestion = lastMessage.content
    } else if (Array.isArray(lastMessage?.parts)) {
      // Parts-based message (AI SDK 5.0)
      const textParts = lastMessage.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
      rawQuestion = textParts.join(' ')
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

    // Validation & sanitization
    const question = sanitizeQuestion(rawQuestion)
    if (!question || question.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Question must be at least 5 characters long' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Step 1: Generate embedding for the question
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(question)
    } catch (embeddingError: any) {
      console.error('Embedding generation error:', embeddingError)
      return new Response(
        JSON.stringify({
          error: 'Failed to generate question embedding',
          details: embeddingError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Step 2: Find relevant experiences using optimized vector similarity
    const supabase = await createClient()

    let withSimilarity: Source[] = []

    // Use Supabase vector search function for better performance
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
      // Fallback to client-side similarity calculation
      console.log('Falling back to client-side similarity calculation...')

      let query = supabase
        .from('experiences')
        .select('id, title, story_text, category, date_occurred, location_text, tags, embedding')
        .eq('visibility', 'public')
        .not('embedding', 'is', null)

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }
      if (dateFrom) query = query.gte('date_occurred', dateFrom)
      if (dateTo) query = query.lte('date_occurred', dateTo)

      const { data: fallbackData, error: fallbackError } = await query.limit(30)

      if (fallbackError) throw fallbackError
      if (!fallbackData || fallbackData.length === 0) {
        // Return empty result stream
        const result = streamText({
          model: openai('gpt-4o'),
          messages: [
            {
              role: 'user',
              content:
                'Sage dem Nutzer höflich auf Deutsch: Ich konnte keine relevanten Erfahrungen zu deiner Frage finden.',
            },
          ],
          temperature: 0.7,
          maxTokens: 100,
        })
        return result.toUIMessageStreamResponse()
      }

      // Client-side similarity calculation (fallback)
      withSimilarity = fallbackData
        .map((exp: any) => {
          if (!exp.embedding) return null
          const expEmbedding = JSON.parse(exp.embedding)
          let dotProduct = 0,
            normA = 0,
            normB = 0
          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * expEmbedding[i]
            normA += queryEmbedding[i] * queryEmbedding[i]
            normB += expEmbedding[i] * expEmbedding[i]
          }
          const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
          return {
            id: exp.id,
            title: exp.title,
            fullText: exp.story_text,
            category: exp.category,
            similarity: similarity,
            date_occurred: exp.date_occurred,
            location_text: exp.location_text,
            attributes: exp.tags,
          } as Source
        })
        .filter((exp): exp is Source => exp !== null && exp.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxSources)
    } else {
      // Map RPC result to Source type
      withSimilarity = (relevant || []).map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        fullText: exp.story_text,
        category: exp.category,
        similarity: exp.similarity,
        date_occurred: exp.date_occurred,
        location_text: exp.location_text,
        attributes: exp.tags,
      }))
    }

    // Apply client-side filters for tags and location
    if (tags) {
      const tagList = tags.split(',').map((t: string) => t.trim().toLowerCase())
      withSimilarity = withSimilarity.filter((exp) =>
        exp.attributes?.some((tag: string) => tagList.includes(tag.toLowerCase()))
      )
    }

    if (location) {
      withSimilarity = withSimilarity.filter((exp) =>
        exp.location_text?.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (withSimilarity.length === 0) {
      // Return empty result stream
      const result = streamText({
        model: openai('gpt-4o'),
        messages: [
          {
            role: 'user',
            content:
              'Sage dem Nutzer höflich auf Deutsch: Ich konnte keine relevanten Erfahrungen zu deiner Frage finden. Versuche es mit einer anderen Formulierung.',
          },
        ],
        temperature: 0.7,
        maxTokens: 100,
      })
      return result.toUIMessageStreamResponse()
    }

    // Step 3: Build context from experiences
    const context = buildContextFromExperiences(withSimilarity)

    // Step 4: Calculate confidence score for metadata
    const avgSimilarity = withSimilarity.reduce((sum, exp) => sum + exp.similarity, 0) / withSimilarity.length
    const confidence = Math.min(Math.round(avgSimilarity * 100), 100)

    // Step 5: Stream answer with AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: RAG_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserMessage(question, context),
        },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      // Add metadata to response headers
      onFinish: async ({ text, finishReason, usage }) => {
        const executionTime = Date.now() - startTime

        // Track Q&A analytics
        const {
          data: { user },
        } = await supabase.auth.getUser()

        try {
          await (supabase as any).rpc('track_search', {
            p_query_text: question,
            p_user_id: user?.id || null,
            p_result_count: withSimilarity.length,
            p_search_type: 'qa',
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
          console.warn('Failed to track Q&A:', trackError)
        }

        // Log completion
        console.log('✅ Stream completed:', {
          question: question.substring(0, 50),
          sources: withSimilarity.length,
          confidence,
          executionTime,
          usage,
          finishReason,
        })
      },
    })

    // Return streaming response
    // Note: Cannot add custom headers to streaming response
    // Metadata will be sent via onFinish callback and stored client-side
    return result.toUIMessageStreamResponse({
      headers: {
        'X-QA-Sources-Count': withSimilarity.length.toString(),
        'X-QA-Confidence': confidence.toString(),
        'X-QA-Sources': JSON.stringify(
          withSimilarity.map((exp) => ({
            id: exp.id,
            title: exp.title,
            category: exp.category,
            similarity: exp.similarity,
            date_occurred: exp.date_occurred,
            location_text: exp.location_text,
          }))
        ),
      },
    })
  } catch (error: any) {
    console.error('RAG Q&A error:', error)

    return new Response(
      JSON.stringify({
        error: 'Q&A failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
