import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
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

    const params = await context.params
    const questionId = params.id
    const updates = await request.json()

    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json({ question: data })
  } catch (error) {
    console.error('Question PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    const params = await context.params
    const questionId = params.id

    const { error } = await supabase.from('questions').delete().eq('id', questionId)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Question DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
