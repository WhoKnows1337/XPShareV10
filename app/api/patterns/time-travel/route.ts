import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startDate, endDate, category } = await request.json()

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
        location_lat,
        location_lng,
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
      `)
      .eq('visibility', 'public')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)

    // Apply time range filter
    if (startDate) {
      query = query.gte('date_occurred', startDate)
    }
    if (endDate) {
      query = query.lte('date_occurred', endDate)
    }

    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: experiences, error } = await query.order('date_occurred', {
      ascending: false,
    })

    if (error) {
      console.error('Time travel query error:', error)
      return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
    }

    // Transform data for map markers
    const markers = experiences?.map((exp) => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      lat: exp.location_lat,
      lng: exp.location_lng,
      location: exp.location_text,
      date: exp.date_occurred,
      timeOfDay: exp.time_of_day,
      viewCount: exp.view_count,
      upvoteCount: exp.upvote_count,
      username: exp.user_profiles?.display_name || exp.user_profiles?.username || 'Anonymous',
    })) || []

    return NextResponse.json({
      success: true,
      markers,
      count: markers.length,
    })
  } catch (error) {
    console.error('Time travel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
