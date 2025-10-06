import { createClient } from '@/lib/supabase/server'
import { TemplatesClient } from './templates-client'

export default async function TemplatesPage() {
  const supabase = await createClient()

  // Fetch templates
  const { data: templates } = await supabase
    .from('question_templates')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch categories for apply dropdown
  const { data: categories } = await supabase
    .from('question_categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return <TemplatesClient templates={templates || []} categories={categories || []} />
}
