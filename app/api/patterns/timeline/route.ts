import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('experiences')
      .select(`
        id,
        title,
        story_text,
        category,
        tags,
        location_text,
        date_occurred,
        time_of_day,
        created_at,
        view_count,
        upvote_count,
        comment_count,
        user_profiles!experiences_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('visibility', 'public')

    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Order by date_occurred (if available) or created_at
    const { data: experiences, error, count } = await query
      .order('date_occurred', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Timeline query error:', error)
      return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      experiences: experiences || [],
      count: count || 0,
      hasMore: count ? offset + limit < count : false,
    })
  } catch (error) {
    console.error('Timeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
