'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface SavedSearch { id: string; name: string; query: string; created_at: string }

export function SavedSearches({ userId }: { userId: string }) {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await (supabase as any).from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setSearches(data || [])
    }
    load()
  }, [userId])

  const deleteSearch = async (id: string) => {
    const supabase = createClient()
    await (supabase as any).from('saved_searches').delete().eq('id', id)
    setSearches(searches.filter(s => s.id !== id))
    toast({ title: 'Search deleted' })
  }

  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" />Saved Searches</CardTitle></CardHeader><CardContent>{searches.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No saved searches</p> : <div className="space-y-2">{searches.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"><div className="flex-1"><Link href={`/search?q=${s.query}`} className="font-medium text-sm hover:text-primary">{s.name}</Link><p className="text-xs text-muted-foreground truncate">{s.query}</p></div><Button variant="ghost" size="sm" onClick={() => deleteSearch(s.id)}><Trash2 className="h-4 w-4" /></Button></div>)}</div>}</CardContent></Card>
}
