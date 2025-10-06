import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Check if user has upvoted an experience
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ hasUpvoted: false })
    }

    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experienceId')

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 })
    }

    const { data } = await supabase
      .from('upvotes')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ hasUpvoted: !!data })
  } catch (error) {
    console.error('Upvotes GET error:', error)
    return NextResponse.json({ hasUpvoted: false })
  }
}

// POST - Toggle upvote (add or remove)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experienceId } = await request.json()

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 })
    }

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('user_id', user.id)
      .single()

    if (existingUpvote) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('experience_id', experienceId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error removing upvote:', error)
        return NextResponse.json({ error: 'Failed to remove upvote' }, { status: 500 })
      }

      return NextResponse.json({ hasUpvoted: false, action: 'removed' })
    } else {
      // Add upvote
      const { error } = await supabase.from('upvotes').insert({
        experience_id: experienceId,
        user_id: user.id,
      })

      if (error) {
        console.error('Error adding upvote:', error)
        return NextResponse.json({ error: 'Failed to add upvote' }, { status: 500 })
      }

      return NextResponse.json({ hasUpvoted: true, action: 'added' })
    }
  } catch (error) {
    console.error('Upvotes POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
