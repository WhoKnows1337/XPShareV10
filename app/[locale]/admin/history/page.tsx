import { createClient } from '@/lib/supabase/server'
import { HistoryClient } from './history-client'

export default async function HistoryPage() {
  const supabase = await createClient()

  // Fetch change history
  const { data: changes } = await supabase
    .from('question_change_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(100)

  return <HistoryClient changes={changes || []} />
}
