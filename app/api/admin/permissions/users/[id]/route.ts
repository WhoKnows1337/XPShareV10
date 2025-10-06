import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin('super_admin')
    const { id } = await params
    const supabase = await createClient()

    const { role } = await req.json()

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_roles')
      .update({ role })
      .eq('user_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin('super_admin')
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove admin error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove admin' },
      { status: 500 }
    )
  }
}
