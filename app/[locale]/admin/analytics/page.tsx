import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('question_categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return <AnalyticsClient categories={categories || []} />
}
