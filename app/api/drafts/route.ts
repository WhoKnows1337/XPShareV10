import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all drafts for user
    const { data: drafts, error } = await (supabase as any)
      .from('experience_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(drafts)
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, content, title, metadata } = await request.json()

    // If ID provided, update existing draft
    if (id) {
      const { data: draft, error } = await (supabase as any)
        .from('experience_drafts')
        .update({
          content,
          title,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(draft)
    }

    // Otherwise, create new draft
    const { data: draft, error } = await (supabase as any)
      .from('experience_drafts')
      .insert({
        user_id: user.id,
        content,
        title,
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
