import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Individual Saved Search API
 *
 * GET /api/saved-searches/[id] - Get a specific saved search
 * PUT /api/saved-searches/[id] - Update a saved search
 * DELETE /api/saved-searches/[id] - Delete a saved search
 */

export async function GET(
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

    const { data: savedSearch, error } = await (supabase as any)
      .from('saved_searches')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ savedSearch })

  } catch (error: any) {
    console.error('Get saved search error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved search', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await req.json()
    const {
      name,
      query,
      searchType,
      searchParams,
      isAlertEnabled,
      alertFrequency,
    } = body

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updates.name = name
    if (query !== undefined) updates.query = query
    if (searchType !== undefined) updates.search_type = searchType
    if (searchParams !== undefined) updates.filters = searchParams
    if (isAlertEnabled !== undefined) updates.is_alert_enabled = isAlertEnabled
    if (alertFrequency !== undefined) updates.alert_frequency = alertFrequency

    const { data: savedSearch, error } = await (supabase as any)
      .from('saved_searches')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating saved search:', error)
      throw error
    }

    if (!savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      savedSearch,
      message: 'Saved search updated successfully',
    })

  } catch (error: any) {
    console.error('Update saved search error:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A saved search with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update saved search', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { error } = await (supabase as any)
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting saved search:', error)
      throw error
    }

    return NextResponse.json({
      message: 'Saved search deleted successfully',
    })

  } catch (error: any) {
    console.error('Delete saved search error:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved search', details: error.message },
      { status: 500 }
    )
  }
}
