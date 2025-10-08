'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Mic,
  Camera,
  Pencil,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial'
import { RecoveryDialog } from '@/components/submit/RecoveryDialog'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function EntryPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loadingDrafts, setLoadingDrafts] = useState(true)
  const [drafts, setDrafts] = useState<any[]>([])

  const { setContent, setStep, reset } = useSubmissionStore()

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }

    // Load drafts
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    try {
      const response = await fetch('/api/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.slice(0, 3)) // Show max 3
      }
    } catch (error) {
      console.error('Failed to load drafts:', error)
    } finally {
      setLoadingDrafts(false)
    }
  }

  const handleOnboardingComplete = async () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShowOnboarding(false)

    // Award "Tutorial Complete" badge
    try {
      await fetch('/api/gamification/award-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeId: 'tutorial_complete', // Needs to be created in DB
        }),
      })
    } catch (error) {
      console.error('Failed to award tutorial badge:', error)
    }
  }

  const handleTextSubmit = () => {
    if (text.trim().length < 20) {
      alert('Bitte schreibe mindestens 20 Zeichen.')
      return
    }

    // Reset store and set content
    reset()
    setContent(text)
    setStep(2)
    router.push('/submit/compose')
  }

  const handleLoadDraft = async (draftId: string) => {
    const { loadDraft } = useSubmissionStore.getState()
    await loadDraft(draftId)
    router.push('/submit/compose')
  }

  if (showOnboarding) {
    return (
      <OnboardingTutorial
        onComplete={handleOnboardingComplete}
        onSkip={() => {
          localStorage.setItem('hasSeenOnboarding', 'true')
          setShowOnboarding(false)
        }}
      />
    )
  }

  return (
    <>
      <RecoveryDialog />
      <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold mb-3">
          <Sparkles className="inline h-12 w-12 text-yellow-500 mb-2" />
          <br />
          Teile deine Erfahrung
        </h1>
        <p className="text-lg text-muted-foreground">
          Wie möchtest du beginnen?
        </p>
      </motion.div>

      {/* Main Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Erzähl mir, was du erlebt hast...&#10;&#10;Schreib einfach drauf los - unsere AI hilft beim Rest! 🤖"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] text-lg resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/submit/audio')}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Audio
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/submit/photo')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Foto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/submit/sketch')}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Skizze
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {text.length} Zeichen
                </span>
                <Button
                  size="lg"
                  onClick={handleTextSubmit}
                  disabled={text.trim().length < 20}
                >
                  Weiter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alternative Entry Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground text-center mb-4">
          Oder wähle:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/submit/audio">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                  <Mic className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-lg">🎤 Aufnehmen</CardTitle>
                <CardDescription>
                  Erzähl es (~2 Min)
                  <br />
                  <span className="text-xs">Whisper-Transkription</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/submit/photo">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                  <Camera className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">📷 Foto hochladen</CardTitle>
                <CardDescription>
                  Mit Kontext
                  <br />
                  <span className="text-xs">EXIF/GPS Extraktion</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/submit/sketch">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mb-3">
                  <Pencil className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">✏️ Skizze zeichnen</CardTitle>
                <CardDescription>
                  Form/Objekt
                  <br />
                  <span className="text-xs">Canvas-Tool</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Drafts */}
      {!loadingDrafts && drafts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-purple-500" />
                💾 Entwürfe ({drafts.length})
              </CardTitle>
              <CardDescription>Setze eine angefangene Erfahrung fort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft.id)}
                    className="w-full p-3 rounded-lg border hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-sm line-clamp-1">
                        {draft.title || 'Unbenannt'}
                      </strong>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(draft.updated_at).toLocaleDateString('de-DE')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {draft.content?.substring(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
              <Link href="/drafts">
                <Button variant="ghost" className="w-full mt-3">
                  Alle Entwürfe anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Links */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <Link href="/experiences" className="hover:text-foreground transition-colors">
          📋 Meine Erfahrungen
        </Link>
        <span>•</span>
        <button
          onClick={() => setShowOnboarding(true)}
          className="hover:text-foreground transition-colors"
        >
          💡 Tutorial ansehen
        </button>
      </div>
      </div>
    </>
  )
}
