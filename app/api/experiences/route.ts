import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed', details: authError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'No authenticated user found' }, { status: 401 })
    }

    console.log('Authenticated user:', user.id, user.email)

    // Parse request body
    const body = await request.json()
    const {
      text,
      category,
      tags,
      location,
      date,
      time,
      questions,
      witnesses,
      mediaFiles,
    } = body

    // Validate required fields
    if (!text || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: text, category' },
        { status: 400 }
      )
    }

    // Create the experience in the database
    const { data: experience, error: insertError } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        title: text.substring(0, 100), // First 100 chars as title
        story_text: text,
        category,
        tags: tags || [],
        location_text: location,
        date_occurred: date,
        time_of_day: time,
        visibility: 'public',
        is_anonymous: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create experience', details: insertError.message },
        { status: 500 }
      )
    }

    // TODO: Upload media files to Supabase Storage
    // TODO: Create witness relationships
    // TODO: Generate embedding for the experience
    // TODO: Create Neo4j nodes and relationships

    // Check and award badges
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/gamification/check-badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'experience_submitted',
          category,
          timeOfDay: time,
        }),
      })
    } catch (badgeError) {
      console.error('Badge checking error:', badgeError)
      // Don't fail the request if badge checking fails
    }

    return NextResponse.json(
      {
        id: experience.id,
        message: 'Experience created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('experiences')
      .select(`
        *,
        user_profiles!experiences_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    const { data: experiences, error } = await query

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ experiences }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
