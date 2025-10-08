'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileEdit, Clock, Trash2, Play } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Draft {
  id: string
  title: string
  category: string
  lastSaved: Date
  progress: number
  autoSaved: boolean
}

interface DraftsTabProps {
  userId: string
}

export function DraftsTab({ userId }: DraftsTabProps) {
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['drafts', userId],
    queryFn: async () => {
      // Fetch drafts from localStorage or API
      const stored = localStorage.getItem(`drafts_${userId}`)
      if (!stored) return []

      const parsed: Draft[] = JSON.parse(stored)
      return parsed.map((d) => ({
        ...d,
        lastSaved: new Date(d.lastSaved),
      }))
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!drafts || drafts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Drafts Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start sharing an experience and save it as a draft
          </p>
          <Link href="/submit">
            <Button>Create New Experience</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id} className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold truncate">{draft.title || 'Untitled Draft'}</h3>
                  {draft.autoSaved && (
                    <Badge variant="outline" className="flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      Auto-saved
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <Badge variant="secondary">{draft.category}</Badge>
                  <span>•</span>
                  <span>
                    Last saved {formatDistanceToNow(draft.lastSaved, { addSuffix: true, locale: de })}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{draft.progress}% complete</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${draft.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/submit?draft=${draft.id}`}>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </Link>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
