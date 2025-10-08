'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Image as ImageIcon, Sparkles, Save, Clock, ArrowLeft } from 'lucide-react'
import { useLiveAnalysis } from '@/lib/hooks/useLiveAnalysis'
import { useAutoSave } from '@/hooks/useAutoSave'
import { LiveInsightsSidebar } from '@/components/submit/LiveInsightsSidebar'
import { FloatingInsightsBadge } from '@/components/submit/FloatingInsightsBadge'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { ProgressIndicator } from '@/components/submit/ProgressIndicator'
import { format } from 'date-fns'

export default function ComposePage() {
  const router = useRouter()
  const { user } = useAuth()

  const { content, title, setContent, setTitle, currentStep, setAnalysis } = useSubmissionStore()

  const [text, setText] = useState(content || '')
  const [titleText, setTitleText] = useState(title || '')
  const [isExpanded, setIsExpanded] = useState(false)

  // Sync with store
  useEffect(() => {
    setContent(text)
  }, [text, setContent])

  useEffect(() => {
    setTitle(titleText)
  }, [titleText, setTitle])

  // Live AI Analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    callCount,
    maxCalls,
    hasReachedLimit,
  } = useLiveAnalysis(text, {
    enabled: text.length >= 50,
  })

  // Sync analysis with store
  useEffect(() => {
    if (analysis) {
      setAnalysis(analysis)
    }
  }, [analysis, setAnalysis])

  // Auto-Save
  const {
    lastSaved,
    isSaving,
    error: saveError,
  } = useAutoSave(
    text,
    {
      title: titleText,
      analysis,
    },
    {
      userId: user?.id || 'anonymous',
      interval: 10000, // 10 seconds
    }
  )

  const handleContinue = () => {
    if (text.trim().length < 50) {
      alert('Bitte schreibe mindestens 50 Zeichen.')
      return
    }

    // Save to store and navigate
    setContent(text)
    setTitle(titleText)
    router.push('/submit/review')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/submit')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Start
        </Button>
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={7}
          labels={['Start', 'Text', 'Review', 'Fragen', 'Pattern', 'Privacy', 'Fertig']}
        />
      </div>

      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input */}
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Deine Erfahrung
                </CardTitle>
                <CardDescription>
                  Schreib einfach drauf los - unsere AI analysiert live mit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Titel (optional)
                  </label>
                  <Input
                    placeholder="z.B. UFO-Sichtung am Bodensee"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                  />
                </div>

                {/* Main Text */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Deine Geschichte *
                  </label>
                  <Textarea
                    placeholder="Erzähl uns, was du erlebt hast..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[400px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{text.length} Zeichen</span>
                    {lastSaved && (
                      <span className="flex items-center gap-1">
                        {isSaving ? (
                          <>
                            <Save className="h-3 w-3 animate-pulse" />
                            Speichert...
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Gespeichert {format(lastSaved, 'HH:mm:ss')}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Alternative Input Methods */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => router.push('/submit/audio')}>
                    <Mic className="h-4 w-4 mr-2" />
                    Audio aufnehmen
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/submit/photo')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Foto hochladen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
              disabled={text.trim().length < 50}
            >
              Weiter zur Review →
            </Button>
          </div>

          {/* Right: Sidebar */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <LiveInsightsSidebar
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                callCount={callCount}
                maxCalls={maxCalls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Eingabe</TabsTrigger>
            <TabsTrigger value="insights">
              💡 Insights
              {analysis && (
                <span className="ml-1 text-xs">
                  ({Object.values(analysis).filter(Boolean).length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titel (optional)</label>
                  <Input
                    placeholder="z.B. UFO-Sichtung am Bodensee"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Deine Geschichte *</label>
                  <Textarea
                    placeholder="Erzähl uns, was du erlebt hast..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{text.length} Zeichen</span>
                    {lastSaved && (
                      <span>
                        {isSaving ? 'Speichert...' : `✓ ${format(lastSaved, 'HH:mm')}`}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
              disabled={text.trim().length < 50}
            >
              Weiter zur Review →
            </Button>
          </TabsContent>

          <TabsContent value="insights">
            <LiveInsightsSidebar
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              callCount={callCount}
              maxCalls={maxCalls}
            />
          </TabsContent>
        </Tabs>

        {/* Floating Badge */}
        <FloatingInsightsBadge
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          callCount={callCount}
          maxCalls={maxCalls}
        />
      </div>
    </div>
  )
}
