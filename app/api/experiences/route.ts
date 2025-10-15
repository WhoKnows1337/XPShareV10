import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await (supabase as any).auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed', details: authError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'No authenticated user found' }, { status: 401 })
    }

    console.log('Authenticated user:', user.id, user.email)

    // Parse request body - NEW FLOW FORMAT
    const body = await request.json()
    const {
      // From extractedData
      title,
      category,
      location,
      date,
      tags,
      // From story
      rawText,
      enrichedText,
      audioUrl,
      // From answers
      questionAnswers,
      // From media
      mediaUrls,
      // From privacy
      privacy,
      // Optional
      language,
    } = body

    // Validate required fields
    if (!title || !category || !rawText) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, rawText' },
        { status: 400 }
      )
    }

    // Prepare experience data
    const experienceData = {
      user_id: user.id,
      title,
      category,
      location_text: location?.text || null,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
      date_occurred: date ? new Date(date).toISOString().split('T')[0] : null,
      story_text: enrichedText || rawText,
      story_transcription: enrichedText ? rawText : null, // Keep original if enriched
      story_audio_url: audioUrl || null,
      tags: tags || [],
      question_answers: questionAnswers || {},
      is_anonymous: privacy === 'anonymous',
      visibility: privacy || 'public',
      language: language || 'de',
      options: {
        allowTagging: true,
        allowComments: privacy !== 'private',
        notifyOnSimilar: true,
        hideExactLocation: privacy === 'anonymous',
      },
    }

    // Insert experience
    const { data: experience, error: insertError } = await supabase
      .from('experiences')
      .insert(experienceData)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create experience', details: insertError.message },
        { status: 500 }
      )
    }

    // If there are media URLs, create media records
    if (mediaUrls) {
      const mediaRecords = []

      // Photos
      if (mediaUrls.photos?.length) {
        mediaRecords.push(
          ...mediaUrls.photos.map((url: string) => ({
            experience_id: experience.id,
            type: 'photo',
            url,
          }))
        )
      }

      // Videos
      if (mediaUrls.videos?.length) {
        mediaRecords.push(
          ...mediaUrls.videos.map((url: string) => ({
            experience_id: experience.id,
            type: 'video',
            url,
          }))
        )
      }

      // Audio
      if (mediaUrls.audio?.length) {
        mediaRecords.push(
          ...mediaUrls.audio.map((url: string) => ({
            experience_id: experience.id,
            type: 'audio',
            url,
          }))
        )
      }

      // Sketches
      if (mediaUrls.sketches?.length) {
        mediaRecords.push(
          ...mediaUrls.sketches.map((url: string) => ({
            experience_id: experience.id,
            type: 'sketch',
            url,
          }))
        )
      }

      // Insert media records if any exist
      if (mediaRecords.length > 0) {
        const { error: mediaError } = await supabase
          .from('experience_media')
          .insert(mediaRecords)

        if (mediaError) {
          console.error('Media insert error:', mediaError)
          // Don't fail the whole request, just log
        }
      }
    }

    // Award XP and check badges
    try {
      // Award XP for creating experience (50 XP)
      await (supabase as any).rpc('award_xp', {
        p_user_id: user.id,
        p_amount: 50,
        p_reason: 'experience_submitted',
      })

      // Check and award badges
      await (supabase as any).rpc('check_and_award_badges', {
        p_user_id: user.id,
      })
    } catch (xpError) {
      console.error('XP/Badge error:', xpError)
      // Don't fail the request
    }

    return NextResponse.json(
      {
        id: experience.id,
        title: experience.title,
        category: experience.category,
        created_at: experience.created_at,
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
