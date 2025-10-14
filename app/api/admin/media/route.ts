import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/media - List media files
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('media_library')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: media, error, count } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      media: media || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Media GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/media - Upload media metadata (actual upload done client-side to Supabase Storage)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      filename,
      original_url,
      thumbnail_url,
      file_size,
      mime_type,
      width,
      height,
      tags = [],
      category,
      alt_text,
    } = body

    // Validate required fields
    if (!filename || !original_url) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, original_url' },
        { status: 400 }
      )
    }

    // Insert media record
    const { data: media, error } = await supabase
      .from('media_library')
      .insert({
        filename,
        original_url,
        thumbnail_url,
        file_size,
        mime_type,
        width,
        height,
        tags,
        category,
        alt_text,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating media:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('Media POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
