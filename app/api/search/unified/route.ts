import { createClient } from '@/lib/supabase/server'
import { detectQueryIntent } from '@/lib/search/intent-detection'
import { generateEmbedding } from '@/lib/openai/client'
import { NextResponse } from 'next/server'

/**
 * Unified Search API - Intelligent Search with Automatic Mode Detection
 *
 * Automatically combines:
 * - Vector similarity search (semantic understanding)
 * - PostgreSQL full-text search (keyword matching)
 * - Dynamic RRF weighting based on query intent
 *
 * GET /api/search/unified?q=...&category=...&tags=...
 */

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const categoriesParam = searchParams.get('categories')
    const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : []
    const tagsParam = searchParams.get('tags')
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []
    const location = searchParams.get('location')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const witnessesOnly = searchParams.get('witnessesOnly') === 'true'
    const scope = searchParams.get('scope') || 'all' // 'all' | 'my' | 'following'
    const language = searchParams.get('language') || 'en'

    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Empty query - return recent experiences
    if (!query || query.trim().length === 0) {
      const { data: recentExperiences, error } = await supabase
        .from('experiences')
        .select(
          `
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      return NextResponse.json({
        results: recentExperiences || [],
        metadata: {
          query: '',
          resultCount: recentExperiences?.length || 0,
          searchType: 'recent',
          intent: {
            isNaturalLanguage: false,
            isQuestion: false,
            isKeyword: false,
            confidence: 1.0,
            suggestedMode: 'search',
            vectorWeight: 0.6,
            ftsWeight: 0.4,
          },
          executionTime: Date.now() - startTime,
        },
      })
    }

    // Step 1: Detect query intent (automatic!)
    const intent = await detectQueryIntent(query)

    // Step 2: Generate embedding
    let queryEmbedding: number[] = []
    try {
      queryEmbedding = await generateEmbedding(query)
    } catch (embeddingError: any) {
      console.error('Embedding generation error:', embeddingError)
      // Fallback to FTS only if embedding fails
    }

    // Step 3: Execute hybrid search with dynamic weighting
    let hybridResults: any[] = []
    let searchError = null

    try {
      const { data, error } = await (supabase as any).rpc('hybrid_search', {
        p_query_text: query,
        p_query_embedding: queryEmbedding.length > 0 ? queryEmbedding : null,
        p_language: language,
        p_vector_weight: intent.vectorWeight, // Dynamic weighting!
        p_fts_weight: intent.ftsWeight,
        p_category: categories.length === 1 ? categories[0] : null, // Pass single category to RPC if only one selected
        p_limit: 50,
      })

      if (error) {
        console.error('Hybrid search error:', error)
        searchError = error
      } else {
        hybridResults = data || []

        // Load user profiles for hybrid results (hybrid_search doesn't include them)
        if (hybridResults.length > 0) {
          const userIds = [...new Set(hybridResults.map((exp: any) => exp.user_id))]
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', userIds)

          // Map profiles to experiences
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
          hybridResults = hybridResults.map((exp: any) => ({
            ...exp,
            user_profiles: profileMap.get(exp.user_id) || null
          }))
        }
      }
    } catch (err) {
      console.error('Hybrid search exception:', err)
      searchError = err
    }

    // Fallback to simple FTS if hybrid fails
    if (searchError || hybridResults.length === 0) {
      const { data: ftsResults, error: ftsError } = await supabase
        .from('experiences')
        .select(
          `
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `
        )
        .textSearch('fts', query, {
          type: 'websearch',
          config: 'english',
        })
        .eq('status', 'published')
        .limit(50)

      if (ftsError) throw ftsError
      hybridResults = ftsResults || []
    }

    // Step 4: Apply additional filters (client-side for flexibility)
    let filteredResults = hybridResults

    if (categories.length > 0) {
      filteredResults = filteredResults.filter((exp) =>
        categories.includes(exp.category)
      )
    }

    if (tags.length > 0) {
      filteredResults = filteredResults.filter((exp) =>
        exp.tags?.some((tag: string) =>
          tags.some(filterTag => tag.toLowerCase().includes(filterTag.toLowerCase()))
        )
      )
    }

    if (location) {
      filteredResults = filteredResults.filter((exp) =>
        exp.location_text?.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (dateFrom) {
      filteredResults = filteredResults.filter(
        (exp) => exp.date_occurred && exp.date_occurred >= dateFrom
      )
    }

    if (dateTo) {
      filteredResults = filteredResults.filter(
        (exp) => exp.date_occurred && exp.date_occurred <= dateTo
      )
    }

    if (witnessesOnly) {
      filteredResults = filteredResults.filter(
        (exp) => exp.witness_count && exp.witness_count > 0
      )
    }

    // Step 4.5: Apply scope filter (My Experiences / Following)
    if (scope === 'my') {
      filteredResults = filteredResults.filter((exp) => exp.user_id === user.id)
    } else if (scope === 'following') {
      // Get list of user IDs that current user follows
      const { data: following, error: followError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (followError) {
        console.warn('Failed to fetch following list:', followError)
      } else {
        const followingIds = following?.map((f) => f.following_id) || []
        filteredResults = filteredResults.filter((exp) =>
          followingIds.includes(exp.user_id)
        )
      }
    }

    const executionTime = Date.now() - startTime

    // Step 5: Track search analytics
    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: query,
        p_user_id: user.id,
        p_result_count: filteredResults.length,
        p_search_type: 'unified_hybrid',
        p_filters: {
          categories,
          tags,
          location,
          dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : null,
          witnessesOnly,
        },
        p_language: language,
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      console.warn('Failed to track search:', trackError)
    }

    // Step 6: Return results with intent metadata for UI feedback
    return NextResponse.json({
      results: filteredResults,
      metadata: {
        query,
        resultCount: filteredResults.length,
        searchType: 'unified_hybrid',
        intent: {
          ...intent,
          feedback: getIntentFeedbackMessage(intent, query),
        },
        appliedFilters: {
          categories: categories,
          tags: tags,
          location: location || null,
          dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : null,
          witnessesOnly,
        },
        executionTime,
      },
    })
  } catch (error: any) {
    console.error('Unified search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Helper to generate user-friendly feedback message
 */
function getIntentFeedbackMessage(
  intent: any,
  query: string
): string {
  if (intent.isQuestion) {
    return `💬 This looks like a question. Try Ask mode for AI-generated answers!`
  }

  if (intent.isNaturalLanguage && intent.detectedConcepts) {
    const concepts = intent.detectedConcepts.join(', ')
    return `🧠 Understanding: ${concepts} experiences`
  }

  if (intent.isNaturalLanguage) {
    return `✨ Finding semantically similar experiences...`
  }

  if (intent.isKeyword) {
    return `🔍 Searching for: "${query}"`
  }

  return `✨ Finding relevant experiences...`
}
