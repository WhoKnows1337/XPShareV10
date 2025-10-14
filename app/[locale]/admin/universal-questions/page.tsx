import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { UniversalQuestionsClient } from './universal-questions-client'

export const metadata = {
  title: 'Universal Questions | Admin',
  description: 'Manage universal questions that apply to all categories',
}

export default async function UniversalQuestionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/universal-questions')
  }

  const userIsAdmin = await isAdmin(user.id)
  if (!userIsAdmin) {
    redirect('/')
  }

  // Load universal questions (category_id IS NULL)
  const { data: questions } = await supabase
    .from('dynamic_questions')
    .select('*')
    .is('category_id', null)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  // Load universal attributes (category_slug IS NULL)
  const { data: attributes } = await supabase
    .from('attribute_schema')
    .select('*')
    .is('category_slug', null)
    .order('sort_order', { ascending: true })

  return (
    <UniversalQuestionsClient
      initialQuestions={questions || []}
      attributes={attributes || []}
    />
  )
}
