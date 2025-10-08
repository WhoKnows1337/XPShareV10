'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Image as ImageIcon, Edit3, MapPin, Save, Clock } from 'lucide-react'
import { useLiveAnalysis } from '@/lib/hooks/useLiveAnalysis'
import { useAutoSave } from '@/hooks/useAutoSave'
import { LiveInsightsSidebar } from '@/components/submit/LiveInsightsSidebar'
import { ProgressBar } from '@/components/submit2/ProgressBar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSubmit2Store } from '@/lib/stores/submit2Store'
import { format } from 'date-fns'

export default function Submit2ComposePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const { originalContent, setOriginalContent, setAnalysis } = useSubmit2Store()
  const [text, setText] = useState(originalContent || '')

  // Sync with store
  useEffect(() => {
    setOriginalContent(text)
  }, [text, setOriginalContent])

  // Live AI Analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    callCount,
    maxCalls,
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
  } = useAutoSave(
    text,
    { analysis },
    {
      userId: user?.id || 'anonymous',
      interval: 3000, // 3 seconds
    }
  )

  const handleContinue = () => {
    if (text.length < 50) {
      alert('Bitte schreibe mindestens 50 Zeichen.')
      return
    }

    setOriginalContent(text)
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit2/details`)
  }

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const completionPercentage = Math.min(100, Math.round((text.length / 500) * 100))

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={1} />
      </div>

      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input (2 columns) */}
          <div className="col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8 px-8 pb-6 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">✨ Was ist passiert?</h1>
                  <p className="text-muted-foreground">
                    Erzähl einfach deine Geschichte - die KI analysiert automatisch
                  </p>
                </div>

                {/* Main Textarea */}
                <div>
                  <Textarea
                    placeholder="Erzähl uns, was du erlebt hast... Schreib einfach drauf los!"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[400px] resize-y text-base leading-relaxed border-2 focus:border-purple-500 transition-colors"
                    autoFocus
                  />

                  {/* Stats & Auto-save Indicator */}
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{wordCount} words · {text.length} characters</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <span>{completionPercentage}%</span>
                      </div>
                    </div>

                    {lastSaved && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {isSaving ? (
                          <>
                            <Save className="h-3 w-3 animate-pulse" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Saved {format(lastSaved, 'HH:mm:ss')}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" disabled>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Sketch
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <MapPin className="h-4 w-4 mr-2" />
                      Map
                    </Button>
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleContinue}
                  disabled={text.length < 50}
                >
                  Continue to Details →
                </Button>

                {text.length < 50 && text.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {50 - text.length} more characters needed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: AI Sidebar (1 column) */}
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
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="input" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Write</TabsTrigger>
                <TabsTrigger value="insights">
                  💡 AI Insights
                  {analysis && (
                    <span className="ml-1 text-xs">
                      ({Object.values(analysis).filter(v => v !== null && (Array.isArray(v) ? v.length > 0 : true)).length})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4 mt-4">
                <div className="text-center space-y-2 mb-4">
                  <h1 className="text-2xl font-bold">✨ Was ist passiert?</h1>
                  <p className="text-sm text-muted-foreground">
                    Erzähl deine Geschichte
                  </p>
                </div>

                <Textarea
                  placeholder="Erzähl uns, was du erlebt hast..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  autoFocus
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  {lastSaved && (
                    <span>{isSaving ? 'Saving...' : `Saved ${format(lastSaved, 'HH:mm')}`}</span>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleContinue}
                  disabled={text.length < 50}
                >
                  Continue →
                </Button>
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <LiveInsightsSidebar
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  callCount={callCount}
                  maxCalls={maxCalls}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Tip */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tip: Schreib einfach natürlich drauf los. Die KI erkennt automatisch
          Kategorie, Ort, Zeit und Tags während du schreibst!
        </p>
      </div>
    </div>
  )
}
