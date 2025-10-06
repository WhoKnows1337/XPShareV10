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
    const userId = params.id
    const updates = await request.json()

    // Prevent user from removing their own admin status
    if (userId === user.id && updates.is_admin === false) {
      return NextResponse.json(
        { error: 'You cannot remove your own admin status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('User PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
