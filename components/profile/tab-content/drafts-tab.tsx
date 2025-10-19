'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileEdit, Calendar, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'

interface DraftsTabProps {
  userId: string
}

interface Draft {
  id: string
  title: string
  category: string
  created_at: string
  updated_at: string
}

export function DraftsTab({ userId }: DraftsTabProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDrafts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/experiences?user_id=${userId}&visibility=draft`)
        if (!response.ok) throw new Error('Failed to fetch drafts')

        const data = await response.json()
        setDrafts(data.experiences || [])
      } catch (error) {
        console.error('Drafts fetch error:', error)
        toast.error('Failed to load drafts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrafts()
  }, [userId])

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const response = await fetch(`/api/experiences/${draftId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete draft')

      setDrafts(drafts.filter((d) => d.id !== draftId))
      toast.success('Draft deleted')
    } catch (error) {
      toast.error('Failed to delete draft')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center">
          <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Drafts Yet</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any saved drafts. Start sharing an experience to create a draft.
          </p>
          <Link href="/submit">
            <Button>Start Writing</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Drafts ({drafts.length})</CardTitle>
          <CardDescription>
            These are your unfinished experiences. Only you can see them.
          </CardDescription>
        </CardHeader>
      </Card>

      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{draft.category}</Badge>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{draft.title || 'Untitled Draft'}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {format(new Date(draft.created_at), 'MMM d, yyyy', { locale: de })}</span>
                  </div>
                  {draft.updated_at !== draft.created_at && (
                    <span>Updated {format(new Date(draft.updated_at), 'MMM d, yyyy', { locale: de })}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/experiences/${draft.id}/edit`}>
                  <Button size="sm">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleDelete(draft.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
