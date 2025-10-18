import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search2PageClient } from './search2-page-client'

interface Search2PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

export default async function Search2Page({ searchParams }: Search2PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const searchQuery = params.q?.trim()

  return <Search2PageClient initialQuery={searchQuery} />
}
