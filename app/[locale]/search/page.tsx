import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedSearchPageClient } from './unified-search-page-client'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const searchQuery = params.q?.trim()

  return <UnifiedSearchPageClient initialQuery={searchQuery} />
}
