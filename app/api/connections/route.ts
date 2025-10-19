import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/connections
 * Returns all connections for the current user
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, accepted, rejected, blocked

    let query = supabase
      .from('user_connections')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        message,
        similarity_score,
        created_at,
        updated_at,
        responded_at,
        requester:user_profiles!requester_id(id, username, display_name, avatar_url, total_xp),
        addressee:user_profiles!addressee_id(id, username, display_name, avatar_url, total_xp)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Get connections error:', error)
      return NextResponse.json({ error: 'Failed to get connections' }, { status: 500 })
    }

    // Transform data to include direction info
    const connections = (data || []).map(conn => ({
      ...conn,
      direction: conn.requester_id === user.id ? 'outgoing' : 'incoming',
      other_user: conn.requester_id === user.id ? conn.addressee : conn.requester
    }))

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Connections API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/connections
 * Create a new connection request
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { addressee_id, message } = body

    if (!addressee_id) {
      return NextResponse.json({ error: 'Addressee ID required' }, { status: 400 })
    }

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('user_connections')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`)
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'Connection already exists',
        existing_status: existing.status
      }, { status: 409 })
    }

    // Calculate similarity score
    const { data: similarity } = await supabase.rpc('calculate_user_similarity', {
      user1_id: user.id,
      user2_id: addressee_id
    })

    const similarityScore = similarity?.score || 0

    // Create connection request
    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        requester_id: user.id,
        addressee_id,
        message,
        similarity_score: similarityScore,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Create connection error:', error)
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    // TODO: Create notification for addressee

    return NextResponse.json({ connection: data }, { status: 201 })
  } catch (error) {
    console.error('Create connection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/connections
 * Update connection status (accept/reject/block)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { connection_id, status } = body

    if (!connection_id || !status) {
      return NextResponse.json({ error: 'Connection ID and status required' }, { status: 400 })
    }

    if (!['accepted', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update connection (RLS will ensure user is authorized)
    const { data, error } = await supabase
      .from('user_connections')
      .update({ status })
      .eq('id', connection_id)
      .select()
      .single()

    if (error) {
      console.error('Update connection error:', error)
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }

    // TODO: Create notification for requester

    return NextResponse.json({ connection: data })
  } catch (error) {
    console.error('Update connection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/connections
 * Delete/cancel a pending connection request
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('id')

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 })
    }

    // Delete connection (RLS will ensure user is authorized)
    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', connectionId)

    if (error) {
      console.error('Delete connection error:', error)
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete connection API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
