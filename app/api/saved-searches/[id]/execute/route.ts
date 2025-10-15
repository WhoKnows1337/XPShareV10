import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Execute Saved Search API
 *
 * POST /api/saved-searches/[id]/execute - Execute a saved search
 */

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the saved search
    const { data: savedSearch, error: searchError } = await (supabase as any)
      .from('saved_searches')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (searchError || !savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    // Execute the search based on search_type
    const searchType = savedSearch.search_type || 'hybrid'
    const query = savedSearch.query
    const params = savedSearch.filters || {}

    let searchResults

    if (searchType === 'hybrid') {
      // Execute hybrid search
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search/hybrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          ...params,
        }),
      })

      if (!response.ok) {
        throw new Error('Hybrid search failed')
      }

      searchResults = await response.json()

    } else if (searchType === 'nlp') {
      // Execute NLP search
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search/nlp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          ...params,
        }),
      })

      if (!response.ok) {
        throw new Error('NLP search failed')
      }

      searchResults = await response.json()

    } else {
      // Advanced search would go here
      return NextResponse.json(
        { error: 'Advanced search not yet implemented' },
        { status: 501 }
      )
    }

    return NextResponse.json({
      savedSearch: {
        id: savedSearch.id,
        name: savedSearch.name,
        query: savedSearch.query,
        searchType: savedSearch.search_type,
      },
      results: searchResults.results || [],
      meta: searchResults.meta || {},
    })

  } catch (error: any) {
    console.error('Execute saved search error:', error)
    return NextResponse.json(
      { error: 'Failed to execute saved search', details: error.message },
      { status: 500 }
    )
  }
}
