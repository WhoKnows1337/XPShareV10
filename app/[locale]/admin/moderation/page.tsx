import { createClient } from '@/lib/supabase/server'
import { ModerationClient } from './moderation-client'

export default async function ModerationPage() {
  const supabase = await createClient()

  // Fetch all reports (pending and history)
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      experiences (id, title, category, user_id),
      user_profiles!reports_reported_by_fkey (username, display_name)
    `)
    .order('created_at', { ascending: false })

  return <ModerationClient initialReports={reports as any || []} />
}
