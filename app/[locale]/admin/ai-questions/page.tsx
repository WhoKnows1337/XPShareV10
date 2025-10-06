import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { AIQuestionsClient } from './ai-questions-client'

export const metadata = {
  title: 'AI-Generated Questions | Admin',
  description: 'Review and manage AI-generated follow-up questions',
}

export default async function AIQuestionsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch AI questions with stats
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/ai-questions`, {
    cache: 'no-store',
  })

  const { data: questions, stats } = res.ok ? await res.json() : { data: [], stats: null }

  return (
    <div className="container mx-auto p-6">
      <AIQuestionsClient initialQuestions={questions || []} initialStats={stats} />
    </div>
  )
}
