import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  // Use authenticated client - RLS policies allow admins to view all profiles
  const supabase = await createClient()

  // Fetch all user profiles
  const { data: profilesRaw, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  interface UserProfile {
    id: string
    username: string | null
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    is_admin: boolean | null
    created_at: string | null
    updated_at: string | null
    [key: string]: unknown
  }

  const profiles: UserProfile[] | null = profilesRaw

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  if (!profiles || profiles.length === 0) {
    return <UsersClient users={[]} />
  }

  // Fetch admin roles separately
  const { data: adminRoles } = (await supabase
    .from('admin_roles')
    .select('user_id, role')) as { data: { user_id: string; role: string }[] | null; error: any }

  // Fetch aggregated counts separately
  const { data: experienceCounts } = (await supabase
    .from('experiences')
    .select('user_id')) as { data: { user_id: string }[] | null; error: any }

  const { data: commentCounts } = (await supabase
    .from('comments')
    .select('user_id')) as { data: { user_id: string }[] | null; error: any }

  const { data: badgeCounts } = (await supabase
    .from('user_badges')
    .select('user_id')) as { data: { user_id: string }[] | null; error: any }

  // Use service role client ONLY for auth.admin API (requires service role)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Get auth users for emails (auth.admin requires service role)
  const { data: { users: authUsers }, error: authError } = await serviceClient.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // Type definition that matches UsersClient expectations
  type AdminRole = 'super_admin' | 'content_manager' | 'analyst'

  interface UserWithAggregates {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    level: number
    total_xp: number
    created_at: string
    email: string | null
    admin_role: Array<{ role: AdminRole }> | null
    experiences: Array<{ count: number }>
    comments: Array<{ count: number }>
    user_badges: Array<{ count: number }>
  }

  // Combine all data with proper typing
  const users: UserWithAggregates[] = profiles.map(profile => {
    const authUser = authUsers?.find(au => au.id === profile.id)
    const adminRole = adminRoles?.find(ar => ar.user_id === profile.id)

    // Count occurrences
    const expCount = experienceCounts?.filter(e => e.user_id === profile.id).length || 0
    const commCount = commentCounts?.filter(c => c.user_id === profile.id).length || 0
    const badgeCount = badgeCounts?.filter(b => b.user_id === profile.id).length || 0

    return {
      id: profile.id,
      username: profile.username ?? '',
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      level: (profile.level ?? 1) as number,
      total_xp: (profile.total_xp ?? 0) as number,
      created_at: profile.created_at ?? '',
      email: authUser?.email || null,
      admin_role: adminRole ? [{ role: adminRole.role as AdminRole }] : null,
      experiences: [{ count: expCount }],
      comments: [{ count: commCount }],
      user_badges: [{ count: badgeCount }]
    }
  })

  return <UsersClient users={users} />
}
