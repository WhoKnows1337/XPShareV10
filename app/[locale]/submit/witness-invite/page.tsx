'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'

interface InvitationData {
  draftId: string
  inviterName: string
  experiencePreview: string
  witnessName: string
}

export default function WitnessInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const { reset, setContent, setStep, loadDraft } = useSubmissionStore()

  useEffect(() => {
    if (!token) {
      setError('Ungültiger Einladungs-Link')
      setLoading(false)
      return
    }

    fetchInvitationData()
  }, [token])

  const fetchInvitationData = async () => {
    try {
      const response = await fetch(`/api/witnesses/invitation?token=${token}`)

      if (!response.ok) {
        throw new Error('Invitation not found')
      }

      const data = await response.json()
      setInvitationData(data)
    } catch (err) {
      console.error('Failed to fetch invitation:', err)
      setError('Einladung konnte nicht geladen werden. Der Link ist möglicherweise abgelaufen.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitationData) return

    try {
      // Load the draft if available
      if (invitationData.draftId) {
        await loadDraft(invitationData.draftId)
      }

      // Pre-fill with witness context
      reset()
      setContent(
        `Als Zeuge von "${invitationData.inviterName}s" Erfahrung kann ich bestätigen: \n\n`
      )
      setStep(2)

      // Navigate to compose page
      router.push('/submit/compose')
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      setError('Fehler beim Annehmen der Einladung')
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground">Lade Einladung...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Fehler</CardTitle>
                <CardDescription>Die Einladung konnte nicht geladen werden</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitationData) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
          <Users className="h-8 w-8 text-purple-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">👥 Zeugen-Einladung</h1>
        <p className="text-muted-foreground">
          Du wurdest eingeladen, deine Perspektive zu einer Erfahrung zu teilen
        </p>
      </div>

      {/* Invitation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Einladung von {invitationData.inviterName}</CardTitle>
          <CardDescription>
            {invitationData.inviterName} hat dich als Zeugen zu folgender Erfahrung hinzugefügt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium mb-2">Erfahrungs-Vorschau:</p>
            <p className="text-sm text-muted-foreground italic">
              "{invitationData.experiencePreview}"
            </p>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Als Zeuge kannst du:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Die Erfahrung bestätigen</li>
                <li>Deine eigene Perspektive hinzufügen</li>
                <li>Zusätzliche Details teilen</li>
                <li>Mit anderen Zeugen interagieren</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Was möchtest du tun?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAcceptInvitation} className="w-full" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Einladung annehmen & meine Perspektive teilen
          </Button>

          <Button onClick={handleDecline} variant="outline" className="w-full">
            Später entscheiden
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Wenn du die Einladung annimmst, wirst du zum Submission-Flow weitergeleitet,
            <br />
            wo du deine Perspektive als Zeuge hinzufügen kannst.
          </p>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Warum Zeugen wichtig sind</p>
              <p className="text-xs text-muted-foreground">
                Mehrere Perspektiven zu einer Erfahrung helfen dabei, ein vollständigeres Bild zu
                erstellen und Patterns besser zu erkennen. Deine Perspektive als Zeuge ist wertvoll
                für die Community.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
