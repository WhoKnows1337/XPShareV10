'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Users, X, Plus, Info, Mail, Link2, Copy, Check, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion, AnimatePresence } from 'framer-motion'

interface Witness {
  name: string
  email?: string
  invite: boolean
}

export default function WitnessesPage() {
  const router = useRouter()
  const { witnesses, addWitness, removeWitness, draftId } = useSubmissionStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sendInvite, setSendInvite] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSendingInvites, setIsSendingInvites] = useState(false)

  const handleAddWitness = () => {
    if (!name.trim()) return

    const witness: Witness = {
      name: name.trim(),
      email: email.trim() || undefined,
      invite: sendInvite && !!email.trim(),
    }

    addWitness(witness)
    setName('')
    setEmail('')
    setSendInvite(false)
  }

  const handleRemoveWitness = (index: number) => {
    removeWitness(index)
  }

  const generateInviteLink = () => {
    // Generate unique invite link
    const baseUrl = window.location.origin
    const inviteToken = `${draftId || 'draft'}-${Date.now()}`
    const link = `${baseUrl}/submit/witness-invite?token=${inviteToken}`
    setInviteLink(link)
  }

  const copyInviteLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSendInvites = async () => {
    const witnessesWithEmail = witnesses.filter((w) => w.email && w.invite)

    if (witnessesWithEmail.length === 0) {
      alert('Keine Zeugen mit Email-Einladung gefunden')
      return
    }

    setIsSendingInvites(true)

    try {
      const response = await fetch('/api/witnesses/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          witnesses: witnessesWithEmail,
        }),
      })

      if (response.ok) {
        alert('Einladungen erfolgreich versendet!')
      } else {
        throw new Error('Failed to send invites')
      }
    } catch (error) {
      console.error('Error sending invites:', error)
      alert('Fehler beim Versenden der Einladungen')
    } finally {
      setIsSendingInvites(false)
    }
  }

  const handleContinue = () => {
    router.push('/submit/patterns')
  }

  const handleSkip = () => {
    router.push('/submit/patterns')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">👥 Zeugen hinzufügen</h1>
        <p className="text-muted-foreground">
          Waren andere Personen dabei? Lade sie ein, ihre Perspektive zu teilen.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          💡 Zeugen können deine Erfahrung bestätigen oder ihre eigene Perspektive hinzufügen.
          Sie erhalten eine Einladung und können wählen, ob sie beitragen möchten.
        </AlertDescription>
      </Alert>

      {/* Add Witness Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-500" />
            Zeuge hinzufügen
          </CardTitle>
          <CardDescription>Name und optional Email-Adresse eingeben</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="z.B. Maria Schmidt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWitness()}
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWitness()}
              />
            </div>
          </div>

          {email && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="send-invite" className="cursor-pointer">
                  Einladungs-Email senden
                </Label>
              </div>
              <Switch id="send-invite" checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>
          )}

          <Button onClick={handleAddWitness} disabled={!name.trim()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Zeuge hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Witnesses List */}
      {witnesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Hinzugefügte Zeugen ({witnesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {witnesses.map((witness, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">{witness.name}</p>
                        {witness.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {witness.email}
                            {witness.invite && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Einladung
                              </Badge>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWitness(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Send Invites Button */}
            {witnesses.some((w) => w.email && w.invite) && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleSendInvites}
                  disabled={isSendingInvites}
                  className="w-full"
                  variant="secondary"
                >
                  {isSendingInvites ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sende Einladungen...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Einladungen an {witnesses.filter((w) => w.email && w.invite).length} Zeugen
                      senden
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-purple-500" />
            Einladungs-Link
          </CardTitle>
          <CardDescription>
            Generiere einen Link, den du mit Zeugen teilen kannst
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!inviteLink ? (
            <Button onClick={generateInviteLink} variant="outline" className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              Link generieren
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button onClick={copyInviteLink} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Teile diesen Link mit Zeugen, damit sie ihre Perspektive hinzufügen können
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          Überspringen
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Weiter zu Patterns →
        </Button>
      </div>
    </div>
  )
}
