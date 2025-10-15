import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SearchAnalyticsClient } from './search-analytics-client'

export default async function SearchAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/feed')
  }

  return <SearchAnalyticsClient />
}
