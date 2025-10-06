import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AdminRole = 'super_admin' | 'content_manager' | 'analyst'

const ROLE_HIERARCHY = {
  analyst: 1,
  content_manager: 2,
  super_admin: 3,
} as const

export async function requireAdmin(minRole: AdminRole = 'analyst') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role, permissions')
    .eq('user_id', user.id)
    .single()

  // Fallback: Check old is_admin field for backward compatibility
  if (!adminRole) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      redirect('/')
    }

    // Treat old admins as super_admin
    return { user, role: 'super_admin' as AdminRole, permissions: {} }
  }

  // Check role hierarchy
  if (ROLE_HIERARCHY[adminRole.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY[minRole]) {
    redirect('/')
  }

  return { user, role: adminRole.role as AdminRole, permissions: adminRole.permissions || {} }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check admin_roles table
  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (adminRole) {
    return true
  }

  // Fallback: Check old is_admin field
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  return profile?.is_admin || false
}

export async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const supabase = await createClient()

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (adminRole) {
    return adminRole.role as AdminRole
  }

  // Fallback: Check old is_admin field
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profile?.is_admin) {
    return 'super_admin'
  }

  return null
}

export function hasPermission(
  userRole: AdminRole,
  requiredRole: AdminRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
