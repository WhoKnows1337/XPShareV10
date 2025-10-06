import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/questions/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data: question, error } = await supabase.from('dynamic_questions').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: question })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/questions/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()
    const updates: Record<string, unknown> = { updated_by: user.id, ...body }
    const { data: question, error } = await supabase.from('dynamic_questions').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: question })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/questions/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { error } = await supabase.from('dynamic_questions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
