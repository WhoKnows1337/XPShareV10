import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Saved Searches API
 *
 * GET /api/saved-searches - List all saved searches for the current user
 * POST /api/saved-searches - Create a new saved search
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all saved searches for the user
    const { data: savedSearches, error } = await (supabase as any)
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved searches:', error)
      throw error
    }

    return NextResponse.json({
      savedSearches: savedSearches || [],
      total: savedSearches?.length || 0,
    })

  } catch (error: any) {
    console.error('Saved searches API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved searches', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      query,
      searchType = 'hybrid',
      searchParams = {},
      isAlertEnabled = false,
      alertFrequency = null,
    } = body

    // Validation
    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      )
    }

    if (isAlertEnabled && !alertFrequency) {
      return NextResponse.json(
        { error: 'Alert frequency is required when alerts are enabled' },
        { status: 400 }
      )
    }

    // Create saved search
    const { data: savedSearch, error } = await (supabase as any)
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name,
        query,
        search_type: searchType,
        filters: searchParams,
        is_alert_enabled: isAlertEnabled,
        alert_frequency: alertFrequency,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating saved search:', error)
      throw error
    }

    return NextResponse.json({
      savedSearch,
      message: 'Saved search created successfully',
    })

  } catch (error: any) {
    console.error('Create saved search error:', error)

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A saved search with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create saved search', details: error.message },
      { status: 500 }
    )
  }
}
