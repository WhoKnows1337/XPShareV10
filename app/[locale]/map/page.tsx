import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapClient } from './map-client'

export default async function MapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for welcome message
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  // Map profile to handle null display_name
  const mappedProfile = profile ? {
    username: profile.username,
    display_name: profile.display_name ?? profile.username
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <MapClient profile={mappedProfile} />
    </div>
  )
}
