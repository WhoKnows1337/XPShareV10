'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, Trash2 } from 'lucide-react'
import { checkForRecoverableDraft, recoverDraft, clearDraft } from '@/hooks/useAutoSave'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

export function RecoveryDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draftInfo, setDraftInfo] = useState<{
    hasDraft: boolean
    draft: any | null
    age: number
  }>({ hasDraft: false, draft: null, age: 0 })

  useEffect(() => {
    // Check for recoverable draft on mount
    const info = checkForRecoverableDraft()
    setDraftInfo(info)

    if (info.hasDraft) {
      setOpen(true)
    }
  }, [])

  const handleRecover = () => {
    if (draftInfo.draft) {
      recoverDraft(draftInfo.draft)
      setOpen(false)
      router.push('/submit/compose')
    }
  }

  const handleStartNew = () => {
    clearDraft()
    setOpen(false)
  }

  const handleDelete = () => {
    clearDraft()
    setOpen(false)
  }

  if (!draftInfo.hasDraft) return null

  const draftAge = draftInfo.draft?.timestamp
    ? formatDistanceToNow(new Date(draftInfo.draft.timestamp), {
        addSuffix: true,
        locale: de,
      })
    : 'vor einiger Zeit'

  const contentPreview = draftInfo.draft?.content?.substring(0, 150) || 'Kein Inhalt'
  const wordCount = draftInfo.draft?.content?.split(/\s+/).length || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Entwurf gefunden
          </DialogTitle>
          <DialogDescription>
            Wir haben einen automatisch gespeicherten Entwurf gefunden. Möchtest du ihn fortsetzen?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Draft Preview */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Gespeichert {draftAge}</span>
            </div>

            <p className="text-sm line-clamp-3 mb-3">{contentPreview}...</p>

            <div className="flex gap-2">
              {draftInfo.draft?.title && (
                <Badge variant="secondary">
                  Titel: {draftInfo.draft.title.substring(0, 20)}
                  {draftInfo.draft.title.length > 20 && '...'}
                </Badge>
              )}
              <Badge variant="outline">{wordCount} Wörter</Badge>
              {draftInfo.draft?.confirmed?.category && (
                <Badge variant="outline">{draftInfo.draft.confirmed.category}</Badge>
              )}
            </div>
          </div>

          {/* Warning if old */}
          {draftInfo.age > 24 * 60 * 60 * 1000 && (
            <div className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
              ⚠️ Dieser Entwurf ist älter als 24 Stunden. Einige Daten könnten veraltet sein.
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" size="sm" onClick={handleDelete} className="sm:mr-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            Entwurf löschen
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleStartNew} className="flex-1 sm:flex-none">
              Neu starten
            </Button>
            <Button onClick={handleRecover} className="flex-1 sm:flex-none">
              Fortsetzen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
