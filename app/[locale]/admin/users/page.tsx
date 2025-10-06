import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  // Use authenticated client - RLS policies allow admins to view all profiles
  const supabase = await createClient()

  // Fetch all user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  if (!profiles || profiles.length === 0) {
    return <UsersClient users={[]} />
  }

  // Fetch admin roles separately
  const { data: adminRoles } = await supabase
    .from('admin_roles')
    .select('user_id, role')

  // Fetch aggregated counts separately
  const { data: experienceCounts } = await supabase
    .from('experiences')
    .select('user_id')

  const { data: commentCounts } = await supabase
    .from('comments')
    .select('user_id')

  const { data: badgeCounts } = await supabase
    .from('user_badges')
    .select('user_id')

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

  // Combine all data
  const users = profiles.map(profile => {
    const authUser = authUsers?.find(au => au.id === profile.id)
    const adminRole = adminRoles?.find(ar => ar.user_id === profile.id)

    // Count occurrences
    const expCount = experienceCounts?.filter(e => e.user_id === profile.id).length || 0
    const commCount = commentCounts?.filter(c => c.user_id === profile.id).length || 0
    const badgeCount = badgeCounts?.filter(b => b.user_id === profile.id).length || 0

    return {
      ...profile,
      email: authUser?.email || null,
      admin_role: adminRole ? [{ role: adminRole.role }] : null,
      experiences: [{ count: expCount }],
      comments: [{ count: commCount }],
      user_badges: [{ count: badgeCount }]
    }
  })

  return <UsersClient users={users} />
}
