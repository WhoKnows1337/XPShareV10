/**
 * Share Chat API
 *
 * POST - Create a share link for a chat
 * GET - Retrieve a shared chat by token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export const runtime = 'edge'

/**
 * Create a share link
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { chatId, expiresIn } = body // expiresIn in hours, null = never expires

    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 })
    }

    // Verify user owns the chat
    const { data: chat, error: chatError } = await supabase
      .from('discovery_chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    // Generate unique token
    const shareToken = nanoid(16)

    // Calculate expiry
    let expiresAt = null
    if (expiresIn && typeof expiresIn === 'number' && expiresIn > 0) {
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + expiresIn)
      expiresAt = expiry.toISOString()
    }

    // Create share record
    const { data: share, error: shareError } = await supabase
      .from('shared_chats')
      .insert({
        chat_id: chatId,
        share_token: shareToken,
        created_by: user.id,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (shareError) {
      console.error('[Share API] Failed to create share:', shareError)
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }

    // Build share URL
    const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${shareToken}`

    return NextResponse.json({
      success: true,
      shareUrl,
      token: shareToken,
      expiresAt: share.expires_at,
    })
  } catch (error) {
    console.error('[Share API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get shared chat by token
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get share record
    const { data: share, error: shareError } = await supabase
      .from('shared_chats')
      .select('*, discovery_chats(id, title, created_at, updated_at)')
      .eq('share_token', token)
      .single()

    if (shareError || !share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Check expiry
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Increment view count
    await supabase
      .from('shared_chats')
      .update({ view_count: (share.view_count || 0) + 1 })
      .eq('id', share.id)

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('discovery_messages')
      .select('*')
      .eq('chat_id', share.chat_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('[Share API] Failed to load messages:', messagesError)
      return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      chat: share.discovery_chats,
      messages: messages || [],
      expiresAt: share.expires_at,
      viewCount: share.view_count + 1,
    })
  } catch (error) {
    console.error('[Share API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
