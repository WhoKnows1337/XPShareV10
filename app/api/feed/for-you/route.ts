import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's profile with location
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('location_text, city, country')
      .eq('user_id', user.id)
      .single()

    // Get user's liked categories (from upvotes)
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('experiences(category)')
      .eq('user_id', user.id)

    const likedCategories = [...new Set(
      upvotes?.map(u => u.experiences?.category).filter(Boolean) || []
    )]

    // Build the For You feed with weighted scoring
    const { data: experiences, error } = await supabase.rpc('get_for_you_feed', {
      p_user_id: user.id,
      p_liked_categories: likedCategories,
      p_user_location: userProfile?.location_text || userProfile?.city || null,
      p_limit: limit,
      p_offset: offset
    })

    if (error) {
      console.error('For You feed error:', error)
      // Fallback to regular feed if RPC fails
      const { data: fallbackExperiences } = await supabase
        .from('experiences')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      return NextResponse.json({ experiences: fallbackExperiences }, { status: 200 })
    }

    return NextResponse.json({ experiences }, { status: 200 })
  } catch (error) {
    console.error('For You feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
