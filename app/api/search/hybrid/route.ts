import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { rerankResults, type SearchResult } from '@/lib/search/reranker'
import { featureFlags } from '@/lib/config/feature-flags'

/**
 * Hybrid Search API - Combines Vector Similarity + Full-Text Search + Optional Re-Ranking
 *
 * Uses Reciprocal Rank Fusion (RRF) to merge results from:
 * - Vector similarity search (semantic understanding)
 * - PostgreSQL full-text search (exact keyword matching)
 *
 * Optional Cross-Encoder Re-Ranking:
 * - Fetches 100 candidates from hybrid search (fast)
 * - Re-ranks using AI cross-encoder model (slow but precise)
 * - Returns top K results sorted by relevance
 *
 * POST /api/search/hybrid
 * Body: {
 *   query: string,
 *   language?: 'de' | 'en' | 'fr' | 'es',
 *   vectorWeight?: number (0-1, default 0.6),
 *   category?: string,
 *   limit?: number,
 *   enableReranking?: boolean (default: false)
 * }
 */

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}

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
      enableReranking = false,
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

    // Re-ranking configuration
    const shouldRerank = enableReranking && featureFlags.crossEncoderReranking
    const candidateLimit = shouldRerank ? 100 : limit // Fetch 100 candidates for re-ranking

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
      p_limit: candidateLimit, // Use candidateLimit instead of limit
    })

    if (searchError) {
      console.error('Hybrid search error:', searchError)
      throw searchError
    }

    // Step 3: Track search analytics (preliminary, will update after re-ranking)
    const { data: { user } } = await (supabase as any).auth.getUser()

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

    // Step 5: Apply re-ranking if enabled
    let finalResults = enrichedResults || []
    let reranked = false
    let rerankingTime = 0

    if (shouldRerank && finalResults.length > 0) {
      const rerankStartTime = Date.now()
      console.log(`[Hybrid Search] Re-ranking ${finalResults.length} candidates...`)

      try {
        // Map results to SearchResult format for re-ranking
        const searchResults: SearchResult[] = finalResults.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          content: exp.description || '',
          category: exp.category_name,
          score: exp.rank_score, // Original hybrid search score
        }))

        // Re-rank using cross-encoder
        const rerankedResults = await rerankResults(query, searchResults, limit)

        // Map back to original format with re-rank scores
        finalResults = rerankedResults.map((reranked) => {
          const original = finalResults.find((exp: any) => exp.id === reranked.id)
          return {
            ...original,
            rerank_score: reranked.rerankScore,
            rank_score: reranked.score, // Keep original score for comparison
          }
        })

        reranked = true
        rerankingTime = Date.now() - rerankStartTime
        console.log(`[Hybrid Search] ✅ Re-ranking completed in ${rerankingTime}ms`)
      } catch (rerankError) {
        console.error('[Hybrid Search] Re-ranking failed, using original results:', rerankError)
        // Fallback to original results without re-ranking
        finalResults = finalResults.slice(0, limit)
      }
    } else {
      // No re-ranking, just slice to limit
      finalResults = finalResults.slice(0, limit)
    }

    const executionTime = Date.now() - startTime

    // Step 6: Track search analytics with final results
    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: query,
        p_user_id: user?.id || null,
        p_result_count: finalResults.length,
        p_search_type: reranked ? 'hybrid+reranking' : 'hybrid',
        p_filters: { category, vectorWeight, reranked },
        p_language: language,
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      // Non-critical error, just log it
      console.warn('Failed to track search:', trackError)
    }

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      meta: {
        query,
        language,
        vectorWeight,
        ftsWeight,
        category,
        executionTime,
        searchType: reranked ? 'hybrid+reranking' : 'hybrid',
        reranked,
        rerankingTime: reranked ? rerankingTime : undefined,
        candidateCount: reranked ? enrichedResults.length : undefined,
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
