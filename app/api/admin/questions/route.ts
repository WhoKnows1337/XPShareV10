import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Questions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { question_text, category, order_index, is_active } = await request.json()

    if (!question_text || !category) {
      return NextResponse.json(
        { error: 'Question text and category are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        question_text,
        category,
        order_index: order_index || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }

    return NextResponse.json({ question: data }, { status: 201 })
  } catch (error) {
    console.error('Questions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
