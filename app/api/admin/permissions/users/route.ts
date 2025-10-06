import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAdmin('super_admin')
    const supabase = await createClient()

    const { email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has admin role
    const { data: existing } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', targetUser.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      )
    }

    // Create admin role
    const { data, error } = await supabase
      .from('admin_roles')
      .insert({
        user_id: targetUser.id,
        role,
        permissions: {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Add admin error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add admin' },
      { status: 500 }
    )
  }
}
