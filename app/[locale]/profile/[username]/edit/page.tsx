import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProfileEditForm } from '@/components/profile/edit-form'

interface EditProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile by username
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Only allow users to edit their own profile
  if (!user || user.id !== profile.id) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-space-deep py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <ProfileEditForm
          userId={profile.id}
          initialData={{
            username: profile.username || 'user',
            displayName: profile.display_name || profile.username || 'user',
            bio: profile.bio ?? undefined,
            avatarUrl: profile.avatar_url ?? undefined,
            locationCity: profile.location_city ?? undefined,
            locationCountry: profile.location_country ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
