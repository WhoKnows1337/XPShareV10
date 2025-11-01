import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'

/**
 * Hybrid Search API - Combines Vector Similarity + Full-Text Search
 *
 * Uses Reciprocal Rank Fusion (RRF) to merge results from:
 * - Vector similarity search (semantic understanding)
 * - PostgreSQL full-text search (exact keyword matching)
 *
 * POST /api/search/hybrid
 * Body: {
 *   query: string,
 *   language?: 'de' | 'en' | 'fr' | 'es',
 *   vectorWeight?: number (0-1, default 0.6),
 *   category?: string,
 *   limit?: number
 * }
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const {
      query,
      language = 'de',
      vectorWeight = 0.6,
      category = null,
      limit = 20,
    } = body

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (vectorWeight < 0 || vectorWeight > 1) {
      return NextResponse.json(
        { error: 'vectorWeight must be between 0 and 1' },
        { status: 400 }
      )
    }

    const ftsWeight = 1 - vectorWeight

    // Step 1: Generate embedding for the query
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(query)
    } catch (embeddingError: any) {
      console.error('Embedding generation error:', embeddingError)
      return NextResponse.json(
        { error: 'Failed to generate query embedding', details: embeddingError.message },
        { status: 500 }
      )
    }

    // Step 2: Execute hybrid search
    const supabase = await createClient()

    // Type-safe RPC call - Supabase type inference still limited for RPC
    const { data: results, error: searchError } = await (supabase as any).rpc('hybrid_search', {
      p_query_text: query,
      p_query_embedding: queryEmbedding,
      p_language: language,
      p_vector_weight: vectorWeight,
      p_fts_weight: ftsWeight,
      p_category: category,
      p_limit: limit,
    })

    if (searchError) {
      console.error('Hybrid search error:', searchError)
      throw searchError
    }

    const executionTime = Date.now() - startTime

    // Step 3: Track search analytics
    const { data: { user } } = await (supabase as any).auth.getUser()

    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: query,
        p_user_id: user?.id || null,
        p_result_count: results?.length || 0,
        p_search_type: 'hybrid',
        p_filters: { category, vectorWeight },
        p_language: language,
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      // Non-critical error, just log it
      console.warn('Failed to track search:', trackError)
    }

    // Step 4: Enrich results with user profiles if needed
    const experienceIds = results?.map((r: any) => r.id) || []

    let enrichedResults = results
    if (experienceIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .in('id', results.map((r: any) => r.user_id))

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

      enrichedResults = results.map((exp: any) => ({
        ...exp,
        user_profile: profileMap.get(exp.user_id) || null,
      }))
    }

    return NextResponse.json({
      results: enrichedResults || [],
      total: enrichedResults?.length || 0,
      meta: {
        query,
        language,
        vectorWeight,
        ftsWeight,
        category,
        executionTime,
        searchType: 'hybrid',
      },
    })

  } catch (error: any) {
    console.error('Hybrid search API error:', error)

    return NextResponse.json(
      {
        error: 'Hybrid search failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
