import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch comments for an experience
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experienceId')

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 })
    }

    // Fetch comments (including threaded fields)
    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, content, created_at, updated_at, user_id, parent_id, reply_count')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    if (!comments || comments.length === 0) {
      return NextResponse.json({ comments: [] })
    }

    // Fetch user profiles for all comment authors
    const commentsArray = comments as any[]
    const userIds = [...new Set(commentsArray.map((c) => c.user_id))]
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds)

    // Merge profiles into comments
    const commentsWithProfiles = commentsArray.map((comment) => ({
      ...comment,
      user_profiles: profiles?.find((p) => p.id === comment.user_id) || null,
    }))

    return NextResponse.json({ comments: commentsWithProfiles })
  } catch (error) {
    console.error('Comments GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new comment
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experienceId, content, parentId } = await request.json()

    if (!experienceId || !content) {
      return NextResponse.json(
        { error: 'Experience ID and content are required' },
        { status: 400 }
      )
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 2000 characters' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        experience_id: experienceId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select('id, content, created_at, updated_at, user_id, parent_id, reply_count')
      .single()

    if (error) {
      console.error('Error creating comment:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const commentWithProfile = {
      ...(comment as any),
      user_profiles: profile,
    }

    return NextResponse.json({ comment: commentWithProfile }, { status: 201 })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a comment
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // RLS will ensure user can only delete their own comments
    const { error } = await (supabase as any).from('comments').delete().eq('id', commentId).eq('user_id', user.id)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comments DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
